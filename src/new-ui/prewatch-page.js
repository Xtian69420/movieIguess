export async function openPreWatchPage(item, deps) {
  const {
    app,
    api,
    loadMediaExtras,
    getMediaType,
    getWatchProgress,
    getItemTitle,
    getItemYear,
    formatRuntime,
    getAgeRating,
    isInProfileList,
    saveToProfileList,
    saveWatchProgress,
    markCardSaved,
    showToast,
    openWatch,
    onBack,
    escapeHTML,
    chevronLeftIcon,
    IMG_ORIGINAL,
    IMG_W500
  } = deps;

  let media = {
    details: item,
    logoPath: null
  };

  let credits = null;

  try {
    const type = getMediaType(item);

    [media, credits] = await Promise.all([
      loadMediaExtras(item),
      api(`/${type}/${item.id}/credits?language=en-US`)
    ]);
  } catch (error) {
    console.warn('Pre-watch media unavailable:', error);
  }

  const details = {
    ...item,
    ...(media.details || {}),
    // Preserve episode selection supplied by the pre-watch episode picker.
    watchSeason: item.watchSeason || media.details?.watchSeason || 1,
    watchEpisode: item.watchEpisode || media.details?.watchEpisode || 1
  };

  const progress = getWatchProgress(details);
  const title = getItemTitle(details);
  const isSaved = isInProfileList(details);
  const type = getMediaType(details);
  const isSeries = type === 'tv';
  
  const backdrop = details.backdrop_path
    ? `${IMG_ORIGINAL}${details.backdrop_path}`
    : 'src/assets/details.png';

  const selectedSeason = details.watchSeason || 1;
  const selectedEpisode = details.watchEpisode || 1;

  const episodeDetails = type === 'tv'
    ? await loadEpisodeDetails(
        details.id,
        selectedSeason,
        selectedEpisode,
        api
      )
    : null;

  const episodeTitle = type === 'tv'
    ? `S${selectedSeason}:E${selectedEpisode} ${episodeDetails?.name || title}`
    : title;

  const seasonLine = type === 'tv'
    ? `${details.number_of_seasons || 1} Season${details.number_of_seasons === 1 ? '' : 's'}`
    : `${getItemYear(details) || 'Movie'}${details.runtime ? ` â€¢ ${formatRuntime(details.runtime)}` : ''}`;

  const rating = getAgeRating(details);

  const actors = (credits?.cast || [])
    .filter(actor => actor.profile_path)
    .slice(0, 6);

  const featuredActor = actors[0];

  const logoMarkup = media.logoPath
    ? `
      <img
        class="preplay-title-logo"
        src="${IMG_W500}${media.logoPath}"
        alt="${escapeHTML(title)}"
      />
    `
    : `
      <h2 class="preplay-fallback-title">
        ${escapeHTML(title)}
      </h2>
    `;

  app.innerHTML = `
    <section class="preplay-page">
      <div
        class="preplay-page-bg"
        style="background-image:url('${backdrop}')"
      ></div>

      <div class="preplay-page-vignette"></div>

      <div class="preplay-tv-panel">
        <div
          class="preplay-art"
          style="background-image:url('${backdrop}')"
        ></div>
        <div class="preplay-gradient"></div>

        <button
          class="preplay-back"
          data-preplay-close
          aria-label="Back"
          title="Back"
        >
          ${chevronLeftIcon()}
        </button>

        <img
          class="preplay-app-logo"
          src="src/assets/logo.png"
          alt="MovieIGuess"
        />

        <div class="preplay-copy">
          <div class="preplay-top-meta">
            <span class="preplay-match">${Math.max(70, Math.round(Number(details.vote_average || 8) * 10))}% Match</span>
            <span>${escapeHTML(getItemYear(details) || new Date().getFullYear())}</span>
            <span class="preplay-hd">HD</span>
            <span class="preplay-age">${escapeHTML(rating)}</span>
          </div>

          ${logoMarkup}

          <strong class="preplay-season-line">
            ${escapeHTML(seasonLine)}
          </strong>

          <h3 class="preplay-episode-title">
            ${escapeHTML(episodeTitle)}
          </h3>

          <p class="preplay-description">
            ${escapeHTML(
              episodeDetails?.overview ||
              details.overview ||
              'Choose how you want to start watching.'
            )}
          </p>

          <div class="preplay-actions">

            <button
              type="button"
              class="preplay-action-button play"
              data-preplay-play
            >
              <span class="preplay-action-icon">
                &#9654;
              </span>

              <span>
                Play
              </span>
            </button>

            <button
              type="button"
              class="preplay-action-button saved ${isSaved ? 'is-saved' : ''}"
              data-preplay-save
            >
              <span class="preplay-action-icon">
                ${isSaved ? 'âœ“' : '+'}
              </span>

              <span>
                ${isSaved ? 'Saved' : 'Save'}
              </span>
            </button>

            <button
              type="button"
              class="preplay-action-button download"
              data-preplay-download
            >
              <span class="preplay-action-icon">
                ${downloadIcon()}
              </span>

              <span>Download</span>
            </button>

            ${
              isSeries
                ? `
                  <button
                    type="button"
                    class="preplay-action-button episodes"
                    data-preplay-episodes
                  >
                    <span class="preplay-action-icon">
                      ${episodesIcon()}
                    </span>

                    <span>
                      Episodes
                    </span>
                  </button>
                `
                : ''
            }

          </div>
        </div>

        ${renderActors(
          featuredActor,
          actors,
          title,
          escapeHTML,
          IMG_W500
        )}
      </div>
    </section>
  `;

  app.querySelector('[data-preplay-close]').onclick = onBack;

  app
    .querySelectorAll('[data-preplay-play]')
    .forEach(button => {
      button.onclick = () => {
        const mode = button.dataset.preplayWatch;

        saveWatchProgress(details, {
          startedAt: Date.now(),
          mode,
          season: selectedSeason,
          episode: selectedEpisode
        });

        openWatch(details);
      };
    });

  app.querySelector('[data-preplay-save]').onclick = event => {
    const result = saveToProfileList(details);

    event.currentTarget.classList.add('saved');
    event.currentTarget.textContent = 'âœ“ Saved';

    showToast(
      result.added
        ? 'Added to My List'
        : 'Already saved in My List'
    );

    markCardSaved(details);
  };

  app
    .querySelector('[data-preplay-download]')
    ?.addEventListener('click', () => {
      openDownloadModal(details, {
        ...deps,
        selectedSeason,
        selectedEpisode,
        episodeTitle
      });
    });

  app
    .querySelector('[data-preplay-episodes]')
    ?.addEventListener('click', () => {
      openEpisodePicker(details, {
        ...deps,
        selectedSeason,
        selectedEpisode,
        onSelect: async (seasonNumber, episodeNumber) => {
          await openPreWatchPage(
            {
              ...details,
              watchSeason: seasonNumber,
              watchEpisode: episodeNumber
            },
            deps
          );
        }
      });
    });

  wireActors(app, title);
}

export function openDownloadModal(details, options) {
  const {
    app,
    escapeHTML,
    getMediaType,
    selectedSeason,
    selectedEpisode,
    episodeTitle
  } = options;

  const modalHost =
    options.container ||
    app.querySelector('.preplay-page') ||
    document.body;

  modalHost.querySelector('[data-download-confirmation]')?.remove();

  const type = getMediaType(details);
  const title = details.title || details.name || 'this title';
  const confirmationTitle = type === 'tv'
    ? episodeTitle || `${title} S${selectedSeason || 1}:E${selectedEpisode || 1}`
    : title;

  const overlay = document.createElement('div');
  overlay.className = 'preplay-download-overlay';
  overlay.dataset.downloadConfirmation = '';
  overlay.innerHTML = `
    <section
      class="preplay-download-modal preplay-download-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-confirmation-title"
    >
      <header class="preplay-download-modal-header">
        <div>
          <span class="preplay-modal-kicker">Before you download</span>
          <h2 id="download-confirmation-title">${escapeHTML(confirmationTitle)}</h2>
        </div>

        <button
          type="button"
          class="preplay-download-close"
          data-download-confirmation-close
          aria-label="Close"
        >×</button>
      </header>

      <div class="preplay-download-body preplay-download-confirmation-body">
        <p>
          This site is free, and you are about to download
          <strong>${escapeHTML(confirmationTitle)}</strong>.
        </p>

        <p>
          Please consider supporting the site for continuous service.
        </p>

        <img
          class="preplay-support-qr"
          src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fko-fi.com%2Fchristinex"
          alt="QR code for Ko-fi support"
          width="220"
          height="220"
        />

        <a
          class="preplay-support-link"
          href="https://ko-fi.com/christinex"
          target="_blank"
          rel="noopener noreferrer"
        >
          Support me on Ko-fi
        </a>

        <button
          type="button"
          class="preplay-confirm-download"
          data-confirm-download
        >
          Continue to download
        </button>
      </div>
    </section>
  `;

  modalHost.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-open'));

  const close = () => {
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 220);
  };

  overlay.querySelector('[data-download-confirmation-close]')?.addEventListener('click', close);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) close();
  });
  overlay.querySelector('[data-confirm-download]')?.addEventListener('click', () => {
    close();
    openDownloadOptionsModal(details, options);
  });
}

async function openDownloadOptionsModal(details, options) {
  const {
    app,
    api,
    escapeHTML,
    chevronDownIcon,
    IMG_W500,
    selectedSeason,
    selectedEpisode,
    episodeTitle
  } = options;

  const modalHost =
    options.container ||
    app.querySelector('.preplay-page') ||
    document.body;

  modalHost.querySelector('[data-preplay-download-modal]')?.remove();
  app.querySelector('[data-preplay-download-modal]')?.remove();

  const type = options.getMediaType(details);
  const seasons = type === 'tv'
    ? (details.seasons || []).filter(season => season.season_number > 0)
    : [];

  let activeSeason = type === 'tv'
    ? seasons[0]?.season_number || 1
    : selectedSeason || 1;
  let activeEpisode = type === 'tv'
    ? 1
    : selectedEpisode || 1;
  let activeEpisodeTitle = type === 'tv'
    ? ''
    : episodeTitle || '';

  const overlay = document.createElement('div');
  overlay.className = 'preplay-download-overlay';
  overlay.dataset.preplayDownloadModal = '';

  const getSeriesTitle = () => details.name || details.title || 'Series';
  const getSelectionText = () => type === 'tv'
    ? `${getSeriesTitle()} S${activeSeason}:E${activeEpisode}`
    : (details.title || details.name || 'Movie');

  overlay.innerHTML = `
    <section class="preplay-download-modal" role="dialog" aria-modal="true" aria-labelledby="preplay-download-title">
      <header class="preplay-download-modal-header">
        <div>
          <span class="preplay-modal-kicker">Download</span>
          <h2 id="preplay-download-title" data-download-modal-title>${escapeHTML(activeEpisodeTitle || getSelectionText())}</h2>
          <p data-download-modal-selection>${escapeHTML(getSelectionText())}</p>
        </div>

        <button
          type="button"
          class="preplay-download-close"
          data-download-modal-close
          aria-label="Close"
        >×</button>
      </header>

      <div class="preplay-download-body">
        ${type === 'tv' ? renderDownloadPickers(seasons, activeSeason, activeEpisode, escapeHTML, chevronDownIcon) : ''}
        <div data-download-modal-body>
          <div class="preplay-download-loading">
            <span class="preplay-download-spinner" aria-hidden="true"></span>
            <span>Loading download options...</span>
          </div>
        </div>
      </div>
    </section>
  `;

  modalHost.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-open'));

  const close = () => {
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 220);
  };

  overlay.querySelector('[data-download-modal-close]')?.addEventListener('click', close);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) close();
  });

  const body = overlay.querySelector('[data-download-modal-body]');
  const titleNode = overlay.querySelector('[data-download-modal-title]');
  const selectionNode = overlay.querySelector('[data-download-modal-selection]');
  let requestId = 0;

  const updateHeading = () => {
    if (type !== 'tv') return;
    titleNode.textContent = activeEpisodeTitle || getSelectionText();
    selectionNode.textContent = getSelectionText();
  };

  const closeDownloadMenu = picker => {
    const wrap = overlay.querySelector(`[data-download-${picker}-wrap]`);
    const menu = overlay.querySelector(`[data-download-${picker}-menu]`);
    const toggle = overlay.querySelector(`[data-download-${picker}-toggle]`);
    wrap?.classList.remove('open');
    menu?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  };

  const toggleDownloadMenu = picker => {
    const wrap = overlay.querySelector(`[data-download-${picker}-wrap]`);
    const menu = overlay.querySelector(`[data-download-${picker}-menu]`);
    const toggle = overlay.querySelector(`[data-download-${picker}-toggle]`);
    const isOpen = !menu?.classList.contains('open');
    closeDownloadMenu(picker === 'season' ? 'episode' : 'season');
    wrap?.classList.toggle('open', isOpen);
    menu?.classList.toggle('open', isOpen);
    toggle?.setAttribute('aria-expanded', String(Boolean(isOpen)));
  };

  const renderSources = async () => {
    const currentRequest = ++requestId;

    body.innerHTML = `
      <div class="preplay-download-loading">
        <span class="preplay-download-spinner" aria-hidden="true"></span>
        <span>Loading download options...</span>
      </div>
    `;

    try {
      const provider = window.MovieIGuessDownloadProvider;

      if (!provider || typeof provider.getSources !== 'function') {
        body.innerHTML = `
          <div class="preplay-download-empty">
            <span class="preplay-download-empty-icon">${downloadIcon()}</span>
            <strong>Download provider not configured</strong>
            <p>
              The download modal is ready. Connect an authorized provider by exposing
              <code>window.MovieIGuessDownloadProvider.getSources()</code>.
            </p>
          </div>
        `;
        return;
      }

      const progressState = new Map();

      const renderProgress = () => {
        const entries = [...progressState.entries()];
        if (!entries.length || currentRequest !== requestId) return;

        body.innerHTML = `
          <div class="preplay-download-loading provider-progress">
            <span class="preplay-download-spinner" aria-hidden="true"></span>
            <strong>Finding download options...</strong>
            <div class="preplay-download-progress-list">
              ${entries.map(([providerId, progress]) => `
                <div class="preplay-download-progress-row">
                  <div class="preplay-download-progress-copy">
                    <span>${escapeHTML(providerId)}</span>
                    <small>${escapeHTML(progress.status === 'error' ? 'Failed' : `${Math.max(0, Math.min(100, progress.percentage || 0))}%`)}</small>
                  </div>
                  <div class="preplay-download-progress-track">
                    <span style="width:${Math.max(0, Math.min(100, progress.percentage || 0))}%"></span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      };

      const result = await provider.getSources({
        id: details.id,
        tmdbId: details.id,
        type,
        title: details.title || details.name || '',
        season: type === 'tv' ? activeSeason : null,
        episode: type === 'tv' ? activeEpisode : null
      }, {
        onProgress(progress) {
          progressState.set(progress.provider || 'provider', progress);
          renderProgress();
        }
      });

      if (currentRequest !== requestId) return;

      const sources = Array.isArray(result)
        ? result
        : Array.isArray(result?.sources)
          ? result.sources
          : [];

      const safeSources = sources.filter(source => {
        if (!source?.url) return false;
        try {
          const url = new URL(source.url, window.location.href);
          return url.protocol === 'https:' || url.protocol === 'http:';
        } catch {
          return false;
        }
      });

      if (!safeSources.length) {
        body.innerHTML = `
          <div class="preplay-download-empty">
            <span class="preplay-download-empty-icon">${downloadIcon()}</span>
            <strong>No download links available</strong>
            <p>Try another episode or check again later.</p>
          </div>
        `;
        return;
      }

      body.innerHTML = `
        <div class="preplay-download-list">
          ${safeSources.map((source, index) => `
            <a
              class="preplay-download-source"
              href="${escapeHTML(source.url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="preplay-download-source-icon">${downloadIcon()}</span>
              <span class="preplay-download-source-copy">
                <strong>${escapeHTML(source.label || source.name || `Download ${index + 1}`)}</strong>
                ${source.meta ? `<small>${escapeHTML(source.meta)}</small>` : ''}
              </span>
              <span class="preplay-download-source-arrow">›</span>
            </a>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.warn('Download provider unavailable:', error);
      body.innerHTML = `
        <div class="preplay-download-empty error">
          <strong>Could not load downloads</strong>
          <p>Please try again later.</p>
        </div>
      `;
    }
  };

  const renderEpisodes = async seasonNumber => {
    if (type !== 'tv' || !api) {
      renderSources();
      return;
    }

    const episodeMenu = overlay.querySelector('[data-download-episode-menu]');
    const episodeLabel = overlay.querySelector('[data-download-episode-label]');
    episodeMenu.innerHTML = '<button type="button" disabled>Loading episodes...</button>';

    try {
      const season = await api(`/tv/${details.id}/season/${seasonNumber}?language=en-US`);
      const episodes = season.episodes || [];
      const selectedExists = episodes.some(episode => episode.episode_number === activeEpisode);

      if (!selectedExists) {
        activeEpisode = episodes[0]?.episode_number || 1;
      }

      const activeEpisodeData = episodes.find(episode => episode.episode_number === activeEpisode);
      activeEpisodeTitle = activeEpisodeData?.name
        ? `S${activeSeason}:E${activeEpisode} ${activeEpisodeData.name}`
        : `${getSeriesTitle()} S${activeSeason}:E${activeEpisode}`;
      episodeLabel.textContent = activeEpisodeData?.name
        ? `E${activeEpisode} • ${activeEpisodeData.name}`
        : `Episode ${activeEpisode}`;

      episodeMenu.innerHTML = episodes.length
        ? episodes.map(episode => renderDownloadEpisodeOption(episode, activeEpisode, details, IMG_W500, escapeHTML)).join('')
        : '<button type="button" disabled>No episodes available</button>';

      episodeMenu.querySelectorAll('[data-download-episode-option]').forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation();
          activeEpisode = Number(button.dataset.downloadEpisodeOption);
          const episode = episodes.find(item => item.episode_number === activeEpisode);
          activeEpisodeTitle = episode?.name
            ? `S${activeSeason}:E${activeEpisode} ${episode.name}`
            : `${getSeriesTitle()} S${activeSeason}:E${activeEpisode}`;
          episodeLabel.textContent = episode?.name
            ? `E${activeEpisode} • ${episode.name}`
            : `Episode ${activeEpisode}`;
          episodeMenu.querySelectorAll('[data-download-episode-option]').forEach(option => {
            const isActive = option === button;
            option.classList.toggle('active', isActive);
            option.setAttribute('aria-selected', String(isActive));
          });
          closeDownloadMenu('episode');
          updateHeading();
          renderSources();
        });
      });

      updateHeading();
      renderSources();
    } catch (error) {
      console.warn('Download episode selector unavailable:', error);
      episodeMenu.innerHTML = '<button type="button" disabled>Could not load episodes</button>';
      updateHeading();
      renderSources();
    }
  };

  if (type === 'tv') {
    overlay.querySelector('[data-download-season-toggle]')?.addEventListener('click', event => {
      event.stopPropagation();
      toggleDownloadMenu('season');
    });

    overlay.querySelector('[data-download-episode-toggle]')?.addEventListener('click', event => {
      event.stopPropagation();
      toggleDownloadMenu('episode');
    });

    overlay.querySelectorAll('[data-download-season-option]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        activeSeason = Number(button.dataset.downloadSeasonOption);
        activeEpisode = 1;
        overlay.querySelector('[data-download-season-label]').textContent =
          button.querySelector('strong')?.textContent || `Season ${activeSeason}`;
        overlay.querySelectorAll('[data-download-season-option]').forEach(option => {
          const isActive = option === button;
          option.classList.toggle('active', isActive);
          option.setAttribute('aria-selected', String(isActive));
        });
        closeDownloadMenu('season');
        renderEpisodes(activeSeason);
      });
    });

    overlay.addEventListener('click', () => {
      closeDownloadMenu('season');
      closeDownloadMenu('episode');
    });

    renderEpisodes(activeSeason);
  } else {
    renderSources();
  }
}

function renderDownloadPickers(seasons, activeSeason, activeEpisode, escapeHTML, chevronDownIcon) {
  return `
    <div class="download-episode-controls">
      <div class="download-picker">
        <span class="download-picker-label">Season</span>
        <div class="season-select-wrap download-select-wrap" data-download-season-wrap>
          <button
            type="button"
            class="season-select-button download-select-button"
            data-download-season-toggle
            aria-haspopup="listbox"
            aria-expanded="false"
          >
            <span data-download-season-label>${escapeHTML(seasons.find(season => season.season_number === activeSeason)?.name || `Season ${activeSeason}`)}</span>
            ${chevronDownIcon()}
          </button>
          <div class="season-menu download-select-menu" data-download-season-menu role="listbox">
            ${seasons.map(season => `
              <button
                type="button"
                class="${season.season_number === activeSeason ? 'active' : ''}"
                data-download-season-option="${season.season_number}"
                role="option"
                aria-selected="${season.season_number === activeSeason}"
              >
                <strong>${escapeHTML(season.name || `Season ${season.season_number}`)}</strong>
                <small>${escapeHTML(`${season.episode_count || 0} episodes`)}</small>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="download-picker episode">
        <span class="download-picker-label">Episode</span>
        <div class="season-select-wrap download-select-wrap" data-download-episode-wrap>
          <button
            type="button"
            class="season-select-button download-select-button"
            data-download-episode-toggle
            aria-haspopup="listbox"
            aria-expanded="false"
          >
            <span data-download-episode-label>Episode ${activeEpisode}</span>
            ${chevronDownIcon()}
          </button>
          <div class="season-menu download-select-menu episode-menu" data-download-episode-menu role="listbox">
            <button type="button" disabled>Loading episodes...</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDownloadEpisodeOption(episode, activeEpisode, details, IMG_W500, escapeHTML) {
  const still = episode.still_path
    ? `${IMG_W500}${episode.still_path}`
    : details.backdrop_path && IMG_W500
      ? `${IMG_W500}${details.backdrop_path}`
      : 'src/assets/details.png';

  return `
    <button
      type="button"
      class="${episode.episode_number === activeEpisode ? 'active' : ''}"
      data-download-episode-option="${episode.episode_number}"
      role="option"
      aria-selected="${episode.episode_number === activeEpisode}"
    >
      <img src="${still}" alt="${escapeHTML(episode.name || `Episode ${episode.episode_number}`)}" />
      <span>
        <strong>${episode.episode_number}. ${escapeHTML(episode.name || `Episode ${episode.episode_number}`)}</strong>
        <small>${escapeHTML(episode.runtime ? `${episode.runtime}m` : 'Episode')}</small>
      </span>
    </button>
  `;
}
async function loadEpisodeDetails(seriesId, seasonNumber, episodeNumber, api) {
  try {
    const season = await api(
      `/tv/${seriesId}/season/${seasonNumber}?language=en-US`
    );

    return (season.episodes || [])
      .find(episode => episode.episode_number === episodeNumber) || null;
  } catch (error) {
    console.warn('Pre-watch episode unavailable:', error);
    return null;
  }
}

export async function openEpisodePicker(details, options) {
  const {
    app,
    api,
    escapeHTML,
    chevronDownIcon,
    IMG_W500,
    selectedSeason,
    selectedEpisode,
    onSelect
  } = options;

  // Reuse a single episode modal. If one already exists, remove it first.
  app.querySelector('[data-preplay-episode-modal]')?.remove();

  const seasons = (details.seasons || [])
    .filter(season => season.season_number > 0);

  if (!seasons.length) return;

  let activeSeasonNumber = selectedSeason || seasons[0].season_number;
  let activeEpisodeNumber = selectedEpisode || 1;

  const overlay = document.createElement('div');
  overlay.className = 'preplay-episode-overlay';
  overlay.dataset.preplayEpisodeModal = '';

  overlay.innerHTML = `
    <section class="preplay-episode-modal" role="dialog" aria-modal="true">
      <header class="preplay-episode-modal-header">
        <div>
          <span class="preplay-modal-kicker">Choose an episode</span>
          <h2>${escapeHTML(details.name || details.title || 'Episodes')}</h2>
        </div>

        <button
          class="preplay-episode-close"
          data-episode-modal-close
          aria-label="Close"
        >&times;</button>
      </header>

      <div class="preplay-season-picker">
        <label for="preplay-season-select">
          Season
        </label>

        <div class="season-select-wrap preplay-season-select-wrap">
          <button
            type="button"
            class="season-select-button"
            data-preplay-season-toggle
            aria-haspopup="listbox"
            aria-expanded="false"
          >
            <span data-preplay-season-label>
              ${escapeHTML(
                seasons.find(season => season.season_number === activeSeasonNumber)?.name ||
                `Season ${activeSeasonNumber}`
              )}
            </span>

            ${chevronDownIcon()}
          </button>

          <div
            class="season-menu"
            data-preplay-season-menu
            role="listbox"
          >
            ${seasons.map(season => `
              <button
                type="button"
                class="${season.season_number === activeSeasonNumber ? 'active' : ''}"
                data-preplay-season-option="${season.season_number}"
                role="option"
                aria-selected="${season.season_number === activeSeasonNumber}"
              >
                ${escapeHTML(season.name || `Season ${season.season_number}`)}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="preplay-episode-modal-body">
        <div class="preplay-episode-loading" data-preplay-episode-list>
          Loading episodesâ€¦
        </div>
      </div>
    </section>
  `;

  const modalHost =
    options.container ||
    app.querySelector('.preplay-page') ||
    app;

  modalHost.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('is-open');
  });

  const close = () => {
    overlay.classList.remove('is-open');

    setTimeout(() => {
      overlay.remove();
    }, 220);
  };

  overlay
    .querySelector('[data-episode-modal-close]')
    .addEventListener('click', close);

  overlay.addEventListener('click', event => {
    if (event.target === overlay) close();
  });

  const renderSeason = async seasonNumber => {
    activeSeasonNumber = seasonNumber;

    const list = overlay.querySelector('[data-preplay-episode-list]');
    list.className = 'preplay-episode-loading';
    list.textContent = 'Loading episodesâ€¦';

    try {
      const season = await api(
        `/tv/${details.id}/season/${activeSeasonNumber}?language=en-US`
      );

      const episodes = season.episodes || [];

      list.className = 'preplay-episode-grid';
      list.innerHTML = episodes.length
        ? episodes.map(episode => {
            const still = episode.still_path
              ? `${IMG_W500}${episode.still_path}`
              : details.backdrop_path
                ? `${IMG_W500}${details.backdrop_path}`
                : 'src/assets/details.png';

            const isCurrent =
              activeSeasonNumber === selectedSeason &&
              episode.episode_number === activeEpisodeNumber;

            return `
              <button
                class="preplay-episode-option ${isCurrent ? 'active' : ''}"
                data-preplay-episode="${episode.episode_number}"
                ${isCurrent ? 'aria-current="true"' : ''}
                type="button"
              >
                <span class="preplay-episode-thumb">
                  <img
                    src="${still}"
                    alt="${escapeHTML(episode.name || `Episode ${episode.episode_number}`)}"
                  />
                  <span class="preplay-episode-play">&#9654;</span>
                  ${isCurrent ? '<span class="preplay-current-badge">Now Watching</span>' : ''}
                </span>

                <span class="preplay-episode-info">
                  <span class="preplay-episode-heading">
                    <strong>${episode.episode_number}. ${escapeHTML(episode.name || `Episode ${episode.episode_number}`)}</strong>
                    <small>${episode.runtime ? `${episode.runtime}m` : ''}</small>
                  </span>
                  <span class="preplay-episode-overview">
                    ${escapeHTML(episode.overview || 'No episode description available.')}
                  </span>
                </span>
              </button>
            `;
          }).join('')
        : '<p class="preplay-episode-empty">No episodes are available for this season.</p>';

      list
        .querySelectorAll('[data-preplay-episode]')
        .forEach(button => {
          button.addEventListener('click', async () => {
            const episodeNumber = Number(button.dataset.preplayEpisode);
            close();
            await onSelect?.(activeSeasonNumber, episodeNumber);
          });
        });
    } catch (error) {
      console.warn('Episode picker unavailable:', error);
      list.className = 'preplay-episode-loading';
      list.textContent = 'Could not load episodes. Please try again.';
    }
  };

  const seasonWrap = overlay.querySelector('.season-select-wrap');
  const seasonMenu = overlay.querySelector('[data-preplay-season-menu]');
  const seasonToggle = overlay.querySelector('[data-preplay-season-toggle]');
  const seasonLabel = overlay.querySelector('[data-preplay-season-label]');

  seasonToggle?.addEventListener('click', event => {
    event.stopPropagation();

    const isOpen = seasonMenu?.classList.toggle('open');
    seasonWrap?.classList.toggle('open', isOpen);
    seasonToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
  });

  seasonMenu?.querySelectorAll('[data-preplay-season-option]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();

      activeEpisodeNumber = 1;
      activeSeasonNumber = Number(button.dataset.preplaySeasonOption);

      seasonLabel.textContent = button.textContent.trim();
      seasonMenu.classList.remove('open');
      seasonWrap.classList.remove('open');
      seasonToggle.setAttribute('aria-expanded', 'false');

      seasonMenu.querySelectorAll('[data-preplay-season-option]').forEach(option => {
        const isActive = option === button;
        option.classList.toggle('active', isActive);
        option.setAttribute('aria-selected', String(isActive));
      });

      renderSeason(activeSeasonNumber);
    });
  });

  await renderSeason(activeSeasonNumber);
}

export function downloadIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  `;
}

function episodesIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="3"
        rx="1"
        fill="currentColor"
      />

      <rect
        x="4"
        y="10.5"
        width="16"
        height="3"
        rx="1"
        fill="currentColor"
      />

      <rect
        x="4"
        y="16"
        width="16"
        height="3"
        rx="1"
        fill="currentColor"
      />
    </svg>
  `;
}

function chevronDownIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function renderActors(featuredActor, actors, title, escapeHTML, IMG_W500) {
  if (!featuredActor) return '';

  return `
    <aside class="preplay-actors">
      <div class="preplay-actors-heading">
        <span>Cast</span>
        <h3>Actors</h3>
      </div>

      <div class="preplay-actor-row">
        ${actors.map((actor, index) => `
          <button
            type="button"
            class="preplay-actor-option ${index === 0 ? 'active' : ''}"
            data-actor-index="${index}"
            data-actor-option-name="${escapeHTML(actor.name)}"
            data-actor-option-character="${escapeHTML(actor.character || 'a featured role')}"
            aria-label="${escapeHTML(actor.name)}"
            title="${escapeHTML(actor.name)}"
          >
            <img
              src="${IMG_W500}${actor.profile_path}"
              alt="${escapeHTML(actor.name)}"
            />
          </button>
        `).join('')}
      </div>

      <div class="preplay-featured-actor">
        <strong data-featured-actor-name>
          ${escapeHTML(featuredActor.name)}
        </strong>

        <p data-featured-actor-copy>
          Plays ${escapeHTML(featuredActor.character || 'a featured role')} in ${escapeHTML(title)}.
        </p>
      </div>
    </aside>
  `;
}

function wireActors(app, title) {
  app
    .querySelectorAll('[data-actor-index]')
    .forEach(button => {
      button.onclick = () => {
        app
          .querySelectorAll('[data-actor-index]')
          .forEach(actorButton => {
            actorButton.classList.toggle('active', actorButton === button);
          });

        const name = button.dataset.actorOptionName;
        const character = button.dataset.actorOptionCharacter;

        /*
         * IMPORTANT:
         * The old code used data-actor-name on BOTH the actor buttons and the
         * selected-actor text. querySelector() therefore grabbed the first
         * actor button and textContent replaced its <img>, making the photo
         * disappear. These dedicated selectors keep the thumbnails intact.
         */
        const nameTarget = app.querySelector('[data-featured-actor-name]');
        const copyTarget = app.querySelector('[data-featured-actor-copy]');

        if (nameTarget) {
          nameTarget.textContent = name;
        }

        if (copyTarget) {
          copyTarget.textContent = `Plays ${character} in ${title}.`;
        }
      };
    });
}
