const GROQ_MODEL = 'openai/gpt-oss-20b';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const CHAT_LIMIT_COUNT = 3;
const CHAT_LIMIT_WINDOW_MS = 30000;

const quickPrompts = [
  ['Something sad', 'sad, emotional, help me choose quickly'],
  ['Make me laugh', 'funny, light, easy to watch'],
  ['Scare me', 'scary, tense, not boring'],
  ['Surprise me', 'surprising, memorable, open to anything']
];

let groqKeyPromise = null;
let groqKeyIndex = 0;

export function aiSparkleIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.7 5.1 3.5 8 8 8-4.5 0-7.3 2.9-8 8-.7-5.1-3.5-8-8-8 4.5 0 7.3-2.9 8-8Z" fill="currentColor"/><path d="M19 15c.25 1.8 1.2 2.8 3 3-1.8.2-2.75 1.2-3 3-.25-1.8-1.2-2.8-3-3 1.8-.2 2.75-1.2 3-3Z" fill="currentColor"/></svg>`;
}

export function createAIChat(config) {
  const session = {
    messages: [],
    typing: false,
    sentAt: [],
    lastSearch: null,
    searchPage: 1
  };

  function safeJSON(value, fallback) {
    try {
      const match = String(value || '').match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : fallback;
    } catch {
      return fallback;
    }
  }

  function normalizeResponse(payload) {
    const type = ['question', 'message', 'search', 'recommendations', 'error'].includes(payload?.type)
      ? payload.type
      : 'error';

    return {
      type,
      message: typeof payload?.message === 'string'
        ? payload.message
        : 'I had trouble understanding that.',
      options: Array.isArray(payload?.options) ? payload.options.slice(0, 4) : [],
      search: payload?.search && typeof payload.search === 'object' ? payload.search : null,
      recommendations: Array.isArray(payload?.recommendations) ? payload.recommendations : []
    };
  }

  function systemPrompt() {
    return `You are MovieIGuess AI, a conversational movie and show finder.
Always return one valid JSON object only. No markdown, no prose outside JSON.
Supported types: question, message, search, recommendations, error.
Limit back-and-forth. Prefer one detailed follow-up question that gathers multiple useful signals at once: format, emotional intensity, pacing, genre, and anything to avoid.
Ask at most one follow-up question before searching unless the user's request is impossible to interpret.
If the user gives a mood like sad, funny, scary, romantic, intense, cozy, or surprising, ask one bundled question in the message text, not tiny separate questions.
Do not include suggested response options. Leave options as an empty array or omit it.
After the user answers your bundled question, return type search with filters instead of asking again.
If you already have format plus mood/genre, return type search immediately.
Never invent titles. Search filters can include mediaType, genres, moods, pacing, intensity, avoid, era, language, country, and runtime.
Search JSON shape: {"type":"search","message":"I know what you're looking for.","search":{"mediaType":"movie|tv|any","genres":["Drama"],"moods":["sad","emotional"]}}
Question JSON shape: {"type":"question","message":"Do you want a sad movie you can finish tonight, an emotional series to stay with, or something bittersweet but not too heavy?","options":[]}`;
  }

  function recommendationPrompt(candidates, isMoreRequest = false) {
    return `Choose ${isMoreRequest ? 'fresh additional' : 'the best'} recommendations only from these TMDB candidates.
Return every strong match from the candidate list. Do not use a fixed count.
Return JSON only: {"type":"recommendations","message":"...","recommendations":[{"id":123,"mediaType":"movie","reason":"Short helpful reason"}]}
Never recommend a title unless its id and mediaType are in this list:
${JSON.stringify(candidates.map(item => ({
      id: item.id,
      mediaType: config.getMediaType(item),
      title: config.getTitle(item),
      year: config.getYear(item),
      rating: item.vote_average,
      overview: item.overview
    })))}`;
  }

  function searchPrompt() {
    return `The user has already answered a follow-up question. You must return type search now.
Do not ask another question. Do not include options.
Use the conversation to infer practical TMDB filters.
Return JSON only: {"type":"search","message":"I know what you're looking for.","search":{"mediaType":"movie|tv|any","genres":["Thriller"],"moods":["mind-bending"]}}`;
  }

  function inferSearchFromText(value = '') {
    const rawText = value || session.messages
      .filter(entry => entry.role === 'user')
      .at(-1)?.message ||
      '';
    const text = rawText
      .toLowerCase();
    const genres = [];
    const moods = [];
    const avoid = [];
    const countries = [];
    const languages = [];
    let mediaType = 'any';
    const referenceTitle = rawText
      .match(/\b(?:like|similar to|same as)\s+(.+?)(?:[?.!,]|$)/i)?.[1]
      ?.replace(/\b(?:please|pls|movie|movies|series|show|shows|tv|anime)\b/gi, '')
      .trim();

    if (/\b(series|show|shows|tv)\b/.test(text)) mediaType = 'tv';
    if (/\b(movie|movies|film|films)\b/.test(text)) mediaType = 'movie';

    if (/\b(no|not|without|avoid)\s+(anime|animation|animated)\b/.test(text)) {
      avoid.push('anime');
    }

    if (/\b(korean|korea|k-drama|kdrama)\b/.test(text)) {
      countries.push('KR');
      languages.push('ko');
    }

    if (/\b(japanese|japan|anime)\b/.test(text)) {
      countries.push('JP');
      languages.push('ja');
    }

    [
      ['Action', /\baction\b/],
      ['Adventure', /\badventure\b/],
      ['Animation', /\banime|animation|animated\b/],
      ['Comedy', /\bfunny|laugh|comedy|sitcom\b/],
      ['Crime', /\bcrime|detective|serial killer\b/],
      ['Drama', /\bsad|emotional|drama|cry|heartbreak\b/],
      ['Horror', /\bscary|scare|horror|creepy\b/],
      ['Mystery', /\bmystery|mind.?bending|twist|confusing|puzzle\b/],
      ['Romance', /\bromance|romantic|love\b/],
      ['Science Fiction', /\bsci.?fi|science fiction|space|future\b/],
      ['Thriller', /\bthriller|thrilling|tense|intense|suspense\b/]
    ].forEach(([genre, pattern]) => {
      if (pattern.test(text)) genres.push(genre);
    });

    [
      ['mind-bending', /\bmind.?bending|twist|confusing|puzzle\b/],
      ['sad', /\bsad|cry|heartbreak\b/],
      ['emotional', /\bemotional|drama\b/],
      ['funny', /\bfunny|laugh|light\b/],
      ['scary', /\bscary|horror|creepy\b/],
      ['intense', /\bintense|thrilling|tense|suspense\b/]
    ].forEach(([mood, pattern]) => {
      if (pattern.test(text)) moods.push(mood);
    });

    return {
      mediaType,
      referenceTitle,
      genres: [...new Set(genres)],
      moods: [...new Set(moods)],
      countries: [...new Set(countries)],
      languages: [...new Set(languages)],
      avoid: [...new Set(avoid)]
    };
  }

  function hasUsableSearchContext(search) {
    return Boolean(search.referenceTitle) ||
      search.mediaType !== 'any' ||
      search.genres.length ||
      search.moods.length;
  }

  function hasSpecificSearchContext(search) {
    return Boolean(search.referenceTitle) ||
      (search.mediaType !== 'any' && (search.genres.length || search.moods.length)) ||
      search.genres.length > 1 ||
      search.moods.length > 1;
  }

  function isMoreRequest(value) {
    return /\b(more|more like this|similar|another|others|show more|give me more)\b/i.test(value);
  }

  function shownMediaKeys() {
    return new Set(session.messages
      .flatMap(entry => entry.recommendations || [])
      .map(entry => `${entry.mediaType}-${entry.id}`));
  }

  function fillRecommendations(aiResponse, candidates) {
    const used = new Set(aiResponse.recommendations.map(item =>
      `${item.mediaType || item.type || item.media_type}-${item.id}`
    ));
    const fillers = candidates
      .filter(item => !used.has(config.getKey(item)))
      .map(item => ({
        id: item.id,
        mediaType: config.getMediaType(item),
        reason: 'Another real TMDB match that fits the same vibe.'
      }));

    return [...aiResponse.recommendations, ...fillers];
  }

  async function getGroqKeys() {
    groqKeyPromise ||= import('./groq-local-config.js').then(module =>
      Array.isArray(module.random) && module.random.length
        ? module.random
        : []
    );
    return groqKeyPromise;
  }

  function shouldTryNextGroqKey(status) {
    return [401, 403, 429, 500, 502, 503, 504].includes(status);
  }

  async function callGroq(messages) {
    const keys = await getGroqKeys();
    let lastError = null;

    for (let offset = 0; offset < keys.length; offset += 1) {
      const index = (groqKeyIndex + offset) % keys.length;
      const key = keys[index];
      const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.5,
          response_format: { type: 'json_object' },
          messages
        })
      });

      if (!response.ok) {
        lastError = new Error(`Groq error ${response.status}`);

        if (shouldTryNextGroqKey(response.status) && offset < keys.length - 1) {
          groqKeyIndex = (index + 1) % keys.length;
          continue;
        }

        throw lastError;
      }

      groqKeyIndex = index;
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      return normalizeResponse(safeJSON(content, {
        type: 'error',
        message: 'The AI returned an invalid JSON response.'
      }));
    }

    throw lastError || new Error('No Groq API keys configured');
  }

  function findRecommendationItem(entry) {
    return entry.candidates?.find(item =>
      String(item.id) === String(entry.id) &&
      config.getMediaType(item) === entry.mediaType
    );
  }

  function recommendation(item, reason) {
    const title = config.getTitle(item);
    const mediaLabel = config.getMediaType(item) === 'tv' ? 'Show' : 'Movie';
    const imagePath = item.backdrop_path || item.poster_path;
    const imageSize = item.backdrop_path ? config.backdropBase : config.imageBase;

    return `<article class="movie-card ai-recommendation-card" data-card data-media-key="${config.getKey(item)}" data-media-type="${config.getMediaType(item)}" data-media-id="${item.id}" tabindex="0"><img src="${imageSize}${imagePath}" alt="${config.escape(title)}" loading="lazy"><div class="card-title-logo" data-card-logo>${config.escape(title)}</div><div class="card-labels"><span class="new-episode">${mediaLabel}</span><span class="watch-now">Watch Now</span></div></article>`;
  }

  function message(entry) {
    if (entry.role === 'user') {
      return `<div class="ai-message-row user"><div class="ai-bubble user">${config.escape(entry.message)}</div></div>`;
    }

    const cards = entry.type === 'recommendations'
      ? `<div class="ai-recommendation-rail-wrap"><h3>Recommended for you</h3><div class="ai-rail-container"><button class="ai-rail-arrow ai-rail-arrow-left" data-ai-rail-prev aria-label="Scroll recommendations left">‹</button><div class="ai-recommendations" data-ai-rail>${entry.recommendations.map(item => {
          const candidate = findRecommendationItem(item);
          return candidate ? recommendation(candidate, item.reason) : '';
        }).join('')}</div><button class="ai-rail-arrow ai-rail-arrow-right" data-ai-rail-next aria-label="Scroll recommendations right">›</button></div></div>`
      : '';

    return `<div class="ai-message-row assistant"><span class="ai-avatar">${aiSparkleIcon()}</span><div class="ai-response"><div class="ai-bubble assistant">${config.escape(entry.message)}</div>${cards}</div></div>`;
  }

  function render() {
    const active = session.messages.length > 0;

    return `<section class="ai-chat-view ${active ? 'has-messages' : ''}" aria-labelledby="ai-title"><header class="ai-chat-header"><div class="ai-heading-mark">${aiSparkleIcon()}</div><div><p>MovieIGuess AI</p><span><i></i> Ready to help</span></div><button data-ai-new>${config.icons.plus} New conversation</button></header><div class="ai-chat-scroll" data-ai-scroll>${!active ? `<div class="ai-welcome"><span class="ai-welcome-icon">${aiSparkleIcon()}</span><p class="ai-eyebrow">YOUR PERSONAL WATCH GUIDE</p><h1 id="ai-title">What do you feel like watching?</h1><p>Tell me a mood, a genre, or the kind of night you're having. I'll help narrow it down.</p><div class="ai-prompt-grid">${quickPrompts.map(([label, value]) => `<button data-ai-prompt="${value}"><span>${label}</span><small>→</small></button>`).join('')}</div></div>` : `<div class="ai-conversation">${session.messages.map(message).join('')}${session.typing ? `<div class="ai-message-row assistant"><span class="ai-avatar">${aiSparkleIcon()}</span><div class="ai-typing" aria-label="AI is typing"><i></i><i></i><i></i></div></div>` : ''}</div>`}</div><form class="ai-composer" data-ai-form><div class="ai-input-wrap"><input data-ai-input maxlength="300" autocomplete="off" placeholder="Describe what you want to watch..." aria-label="Message MovieIGuess AI"><button type="submit" aria-label="Send message">↑</button></div><p>AI can make mistakes.</p></form></section>`;
  }

  function refresh() {
    config.getMount().innerHTML = render();
    config.wireCards?.();
    config.populateCardLogos?.();
    wire();
    requestAnimationFrame(() => {
      const scroll = config.getMount().querySelector('[data-ai-scroll]');
      if (scroll) scroll.scrollTop = scroll.scrollHeight;
    });
  }

  function groqHistory() {
    return session.messages
      .filter(entry => entry.role === 'user' || entry.role === 'assistant')
      .map(entry => ({
        role: entry.role,
        content: JSON.stringify({
          type: entry.type,
          message: entry.message,
          options: entry.options,
          search: entry.search
        })
      }));
  }

  async function send(value, label = '') {
    if (session.typing) return;

    const now = Date.now();
    session.sentAt = session.sentAt.filter(time => now - time < CHAT_LIMIT_WINDOW_MS);

    if (session.sentAt.length >= CHAT_LIMIT_COUNT) {
      const waitSeconds = Math.ceil((CHAT_LIMIT_WINDOW_MS - (now - session.sentAt[0])) / 1000);
      session.messages.push({
        role: 'assistant',
        type: 'error',
        message: `You've reached the quick chat limit. Try again in ${waitSeconds} seconds.`
      });
      refresh();
      return;
    }

    session.sentAt.push(now);
    const moreRequest = isMoreRequest(label || value);
    session.messages.push({ role: 'user', message: label || value });
    session.typing = true;
    refresh();

    try {
      const alreadyAskedQuestion = session.messages.some(entry =>
        entry.role === 'assistant' &&
        entry.type === 'question'
      );
      const currentMessage = label || value;
      const inferredSearch = inferSearchFromText(currentMessage);

      let aiResponse = moreRequest && session.lastSearch
        ? {
            type: 'search',
            message: 'Here are more like those.',
            search: session.lastSearch
          }
        : hasSpecificSearchContext(inferredSearch)
        ? {
            type: 'search',
            message: inferredSearch.referenceTitle
              ? `I will look for titles like ${inferredSearch.referenceTitle}.`
              : 'I know what you are looking for.',
            search: inferredSearch
          }
        : hasUsableSearchContext(inferredSearch) && alreadyAskedQuestion
        ? {
            type: 'search',
            message: 'I know what you are looking for.',
            search: inferredSearch
          }
        : await callGroq([
            { role: 'system', content: alreadyAskedQuestion ? searchPrompt() : systemPrompt() },
            ...groqHistory()
          ]);

      if (alreadyAskedQuestion && aiResponse.type === 'question') {
        aiResponse = {
          type: 'search',
          message: 'I know what you are looking for.',
          search: inferredSearch
        };
      }

      if (aiResponse.type === 'search') {
        session.lastSearch = aiResponse.search;
        session.searchPage = moreRequest ? session.searchPage + 1 : 1;

        const candidates = await config.findCandidates(aiResponse.search, {
          page: session.searchPage,
          excludeKeys: shownMediaKeys()
        });

        if (!candidates.length) {
          aiResponse = {
            type: 'message',
            message: moreRequest
              ? 'I could not find more fresh matches for that same vibe. Try adding one extra detail.'
              : 'I could not find a strong TMDB match for that. Want to try a different mood or genre?'
          };
        } else {
          aiResponse = await callGroq([
            { role: 'system', content: systemPrompt() },
            { role: 'user', content: currentMessage },
            { role: 'user', content: recommendationPrompt(candidates, moreRequest) }
          ]);

          aiResponse.recommendations = fillRecommendations(aiResponse, candidates)
            .map(item => ({
              ...item,
              candidates,
              mediaType: item.mediaType || item.type || item.media_type
            }))
            .filter(item => findRecommendationItem(item));
        }
      }

      session.messages.push({ role: 'assistant', ...aiResponse });
    } catch (error) {
      console.warn('MovieIGuess AI unavailable:', error);
      session.messages.push({
        role: 'assistant',
        type: 'error',
        message: 'The AI is unavailable right now. Check the Groq key or network connection and try again.'
      });
    } finally {
      session.typing = false;
      refresh();
    }
  }

  function wire() {
    const mount = config.getMount();

    mount.querySelectorAll('[data-ai-prompt]').forEach(button => {
      button.onclick = () => send(button.dataset.aiPrompt, button.textContent.replace('→', '').trim());
    });

    mount.querySelector('[data-ai-new]')?.addEventListener('click', () => {
      session.messages = [];
      session.typing = false;
      session.lastSearch = null;
      session.searchPage = 1;
      refresh();
    });

    mount.querySelector('[data-ai-form]')?.addEventListener('submit', event => {
      event.preventDefault();
      const value = event.currentTarget.querySelector('input').value.trim();
      if (value) send(value);
    });

    mount.querySelectorAll('.ai-rail-container').forEach(container => {
      const rail = container.querySelector('[data-ai-rail]');
      const move = direction => {
        rail?.scrollBy({
          left: direction * rail.clientWidth * 0.86,
          behavior: 'smooth'
        });
      };

      container.querySelector('[data-ai-rail-prev]')?.addEventListener('click', () => move(-1));
      container.querySelector('[data-ai-rail-next]')?.addEventListener('click', () => move(1));
    });

    mount.querySelectorAll('[data-ai-media-key]').forEach(card => {
      const item = session.messages
        .flatMap(entry => entry.recommendations || [])
        .map(findRecommendationItem)
        .find(candidate => candidate && config.getKey(candidate) === card.dataset.aiMediaKey);

      if (!item) return;

      card.querySelectorAll('[data-ai-info]').forEach(button => {
        button.onclick = () => config.onInfo(item);
      });

      card.querySelector('[data-ai-watch]').onclick = () => config.onWatch(item);
      card.querySelector('[data-ai-list]').onclick = event => {
        const added = config.onList(item);
        event.currentTarget.innerHTML = `${config.icons.check} <span>In My List</span>`;
        config.onToast(added ? 'Added to My List' : 'Already saved in My List');
      };
    });
  }

  return { render, wire };
}
