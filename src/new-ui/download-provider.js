const DOWNLOAD_API = 'https://hahaevilcraft.site';
const DOWNLOAD_PROVIDERS = ['4khdhubnew', '4khdhub'];

function parseSSEBlock(block) {
  let event = 'message';
  const data = [];

  for (const rawLine of block.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith(':')) continue;

    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
      continue;
    }

    if (line.startsWith('data:')) {
      data.push(line.slice(5).trimStart());
    }
  }

  if (!data.length) return null;

  return {
    event,
    data: data.join('\n')
  };
}

async function scrapeProvider(providerId, media, onProgress) {
  const params = new URLSearchParams({
    id: providerId,
    tmdbId: String(media.tmdbId),
    type: media.type,
    title: media.title || '',
    _cb: String(Date.now())
  });

  if (media.type === 'tv') {
    if (media.season != null) params.set('season', String(media.season));
    if (media.episode != null) params.set('episode', String(media.episode));
  }

  const response = await fetch(
    `${DOWNLOAD_API}/scrape/source?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream'
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error(`${providerId} failed with HTTP ${response.status}`);
  }

  if (!response.body) {
    throw new Error(`${providerId} returned no response stream`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed = null;

  const processBlock = block => {
    const parsed = parseSSEBlock(block);
    if (!parsed) return;

    if (parsed.event === 'start') {
      onProgress?.({
        provider: providerId,
        percentage: 0,
        status: 'pending'
      });
      return;
    }

    if (parsed.event === 'update') {
      try {
        const update = JSON.parse(parsed.data);
        onProgress?.({
          provider: providerId,
          percentage: Number(update.percentage || 0),
          status: update.status || 'pending'
        });
      } catch (error) {
        console.warn(`Invalid ${providerId} update event`, error);
      }
      return;
    }

    if (parsed.event === 'completed') {
      completed = JSON.parse(parsed.data);
      onProgress?.({
        provider: providerId,
        percentage: 100,
        status: 'success'
      });
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() || '';

    for (const block of blocks) {
      if (block.trim()) processBlock(block);
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) processBlock(buffer);

  return completed || { embeds: [], stream: [] };
}

function normalizeStreams(data, providerId) {
  const results = [];
  const streams = Array.isArray(data?.stream) ? data.stream : [];

  for (const stream of streams) {
    if (stream?.type !== 'file') continue;

    for (const [quality, qualityInfo] of Object.entries(stream.qualities || {})) {
      if (!qualityInfo?.url) continue;

      const flags = Array.isArray(stream.flags) ? stream.flags : [];
      const sourceMode = flags.includes('ip-locked')
        ? 'Proxy'
        : flags.includes('cors-allowed')
          ? 'Direct'
          : 'Source';

      const format = String(qualityInfo.type || 'file').toUpperCase();

      results.push({
        id: stream.id,
        provider: providerId,
        quality,
        format,
        sourceMode,
        flags,
        headers: stream.headers || {},
        captions: Array.isArray(stream.captions) ? stream.captions : [],
        url: qualityInfo.url,
        label: `${quality} · ${format}`,
        meta: `${providerId} · ${sourceMode}`
      });
    }
  }

  return results;
}

function dedupeSources(sources) {
  const seen = new Set();

  return sources.filter(source => {
    if (!source?.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function qualityScore(value) {
  const match = String(value || '').match(/(\d{3,4})/);
  return match ? Number(match[1]) : 0;
}

window.MovieIGuessDownloadProvider = {
  async getSources(media, options = {}) {
    const onProgress = options.onProgress;

    const jobs = DOWNLOAD_PROVIDERS.map(async providerId => {
      try {
        const data = await scrapeProvider(providerId, media, onProgress);
        return normalizeStreams(data, providerId);
      } catch (error) {
        console.error(`Download provider ${providerId} failed:`, error);
        onProgress?.({
          provider: providerId,
          percentage: 100,
          status: 'error'
        });
        return [];
      }
    });

    const settled = await Promise.all(jobs);

    return dedupeSources(settled.flat()).sort((a, b) => {
      const qualityDifference = qualityScore(b.quality) - qualityScore(a.quality);
      if (qualityDifference) return qualityDifference;
      return a.provider.localeCompare(b.provider);
    });
  }
};
