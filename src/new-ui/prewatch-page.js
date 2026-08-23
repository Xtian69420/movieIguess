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
    : `${getItemYear(details) || 'Movie'}${details.runtime ? ` • ${formatRuntime(details.runtime)}` : ''}`;

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
                ▶
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
                ${isSaved ? '✓' : '+'}
              </span>

              <span>
                ${isSaved ? 'Saved' : 'Save'}
              </span>
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
    event.currentTarget.textContent = '✓ Saved';

    showToast(
      result.added
        ? 'Added to My List'
        : 'Already saved in My List'
    );

    markCardSaved(details);
  };

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

async function openEpisodePicker(details, options) {
  const {
    app,
    api,
    escapeHTML,
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
        >×</button>
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
          Loading episodes…
        </div>
      </div>
    </section>
  `;

  app.querySelector('.preplay-page')?.appendChild(overlay);

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
    list.textContent = 'Loading episodes…';

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
                type="button"
              >
                <span class="preplay-episode-thumb">
                  <img
                    src="${still}"
                    alt="${escapeHTML(episode.name || `Episode ${episode.episode_number}`)}"
                  />
                  <span class="preplay-episode-play">▶</span>
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
