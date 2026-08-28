/*
 * MovieIGuess download-provider adapter example.
 *
 * Load this file before netflix-ui.js only after replacing the example endpoint
 * with an API/service you are authorized to use.
 *
 * Expected return shape:
 *   { sources: [{ label: '1080p', url: 'https://...', meta: '1.4 GB' }] }
 */
window.MovieIGuessDownloadProvider = {
  async getSources({ tmdbId, type, season, episode }) {
    const query = new URLSearchParams({
      tmdbId: String(tmdbId),
      type,
      ...(type === 'tv' ? {
        season: String(season),
        episode: String(episode)
      } : {})
    });

    const response = await fetch(`/api/downloads?${query.toString()}`, {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Download API failed: ${response.status}`);
    }

    return response.json();
  }
};
