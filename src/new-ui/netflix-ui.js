import {
  getProfiles,
  addProfile,
  updateProfile,
  deleteProfile,
  setActiveProfile,
  getActiveProfileSession,
  clearActiveProfile
} from './profile-store.js';
import {
  openPreWatchPage,
  openDownloadModal,
  downloadIcon
} from './prewatch-page.js';

const API_KEY = '97df57ffd9278a37bc12191e00332053';

const TMDB_API = 'https://api.themoviedb.org/3';
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_W780 = 'https://image.tmdb.org/t/p/w780';
const YOUTUBE_STARTUP_COVER_DELAY = 5200;
const HERO_AUTOPLAY_ADVANCE_DELAY = 42000;
const HERO_DESCRIPTION_COLLAPSE_DELAY = 5000;

const PREFERENCE_OPTIONS = [
  {
    id: 'popular_movies',
    label: 'Famous Movies',
    rows: []
  },
  {
    id: 'new_releases',
    label: 'New Releases',
    rows: [
      [
        'New Movies',
        '/movie/now_playing?language=en-US&page=1&include_adult=false'
      ],
      [
        'New Series',
        '/tv/on_the_air?language=en-US&page=1'
      ]
    ]
  },
  {
    id: 'anime',
    label: 'Anime',
    rows: [
      [
        'Anime Series',
        '/discover/tv?language=en-US&with_genres=16&with_origin_country=JP&sort_by=popularity.desc'
      ],
      [
        'Anime Movies',
        '/discover/movie?language=en-US&include_adult=false&with_genres=16&sort_by=popularity.desc'
      ],
      [
        'Action Anime',
        '/discover/tv?language=en-US&with_genres=16,10759&with_origin_country=JP&sort_by=popularity.desc'
      ]
    ]
  },
  {
    id: 'kdrama',
    label: 'K-Drama',
    rows: [
      [
        'K-Drama Series',
        '/discover/tv?language=en-US&with_origin_country=KR&with_genres=18&sort_by=popularity.desc'
      ],
      [
        'K-Drama Love Stories',
        '/discover/tv?language=en-US&with_origin_country=KR&with_genres=18&with_keywords=9840&sort_by=popularity.desc'
      ],
      [
        'K-Drama Rom-Coms',
        '/discover/tv?language=en-US&with_origin_country=KR&with_genres=35,18&sort_by=popularity.desc'
      ]
    ]
  },
  {
    id: 'romance_romcom',
    label: 'Love Stories & Rom-Coms',
    rows: [
      [
        'Romantic Comedies',
        '/discover/movie?language=en-US&include_adult=false&with_genres=10749,35&sort_by=popularity.desc'
      ],
      [
        'Love Story Series',
        '/discover/tv?language=en-US&with_genres=18&with_keywords=9840&sort_by=popularity.desc'
      ],
      [
        'Feel-Good Romances',
        '/discover/movie?language=en-US&include_adult=false&with_genres=10749&sort_by=popularity.desc&vote_average.gte=6.5'
      ]
    ]
  },
  {
    id: 'us_drama',
    label: 'US Drama',
    rows: [
      [
        'US Drama Series',
        '/discover/tv?language=en-US&with_origin_country=US&with_genres=18&sort_by=popularity.desc'
      ],
      [
        'Drama Movies',
        '/discover/movie?language=en-US&include_adult=false&with_genres=18&sort_by=popularity.desc'
      ]
    ]
  },
  {
    id: 'crime',
    label: 'Crime',
    rows: [
      [
        'Crime Series',
        '/discover/tv?language=en-US&with_genres=80&sort_by=popularity.desc'
      ],
      [
        'Crime Movies',
        '/discover/movie?language=en-US&include_adult=false&with_genres=80&sort_by=popularity.desc'
      ]
    ]
  },
  {
    id: 'popular_series',
    label: 'Popular Series',
    rows: [
      [
        'Popular Series',
        '/trending/tv/week?language=en-US'
      ]
    ]
  },
  {
    id: 'action_thriller',
    label: 'Action & Thriller',
    rows: [
      [
        'Action Movies',
        '/discover/movie?language=en-US&include_adult=false&with_genres=28&sort_by=popularity.desc'
      ],
      [
        'Thriller Movies',
        '/discover/movie?language=en-US&include_adult=false&with_genres=53&sort_by=popularity.desc'
      ]
    ]
  }
];

const KIDS_ROWS = [
  [
    'Cartoons for Kids',
    '/discover/tv?language=en-US&with_genres=16,10762&sort_by=popularity.desc'
  ],
  [
    'Animated Movies',
    '/discover/movie?language=en-US&include_adult=false&with_genres=16,10751&certification_country=US&certification.lte=PG&sort_by=popularity.desc'
  ],
  [
    'Family Favorites',
    '/discover/movie?language=en-US&include_adult=false&with_genres=10751&certification_country=US&certification.lte=PG&sort_by=popularity.desc'
  ],
  [
    'Kids TV Favorites',
    '/discover/tv?language=en-US&with_genres=10762&sort_by=popularity.desc'
  ]
];

const PROFILE_TITLE_CHOICES = [
  { id: 'movie-299534', tmdbId: 299534, type: 'movie', title: 'Avengers: Endgame', tags: ['popular_movies', 'action_thriller'] },
  { id: 'movie-157336', tmdbId: 157336, type: 'movie', title: 'Interstellar', tags: ['popular_movies', 'us_drama'] },
  { id: 'movie-27205', tmdbId: 27205, type: 'movie', title: 'Inception', tags: ['popular_movies', 'action_thriller'] },
  { id: 'movie-155', tmdbId: 155, type: 'movie', title: 'The Dark Knight', tags: ['popular_movies', 'crime', 'action_thriller'] },
  { id: 'movie-496243', tmdbId: 496243, type: 'movie', title: 'Parasite', tags: ['popular_movies', 'kdrama', 'us_drama'] },
  { id: 'movie-569094', tmdbId: 569094, type: 'movie', title: 'Spider-Man: Across the Spider-Verse', tags: ['popular_movies', 'anime', 'action_thriller'], kidsSafe: true },
  { id: 'movie-354912', tmdbId: 354912, type: 'movie', title: 'Coco', tags: ['new_releases', 'anime'], kidsSafe: true },
  { id: 'movie-277834', tmdbId: 277834, type: 'movie', title: 'Moana', tags: ['popular_movies', 'anime'], kidsSafe: true },
  { id: 'movie-568124', tmdbId: 568124, type: 'movie', title: 'Encanto', tags: ['new_releases', 'anime'], kidsSafe: true },
  { id: 'tv-66732', tmdbId: 66732, type: 'tv', title: 'Stranger Things', tags: ['popular_series', 'us_drama'] },
  { id: 'tv-119051', tmdbId: 119051, type: 'tv', title: 'Wednesday', tags: ['popular_series', 'us_drama'] },
  { id: 'tv-93405', tmdbId: 93405, type: 'tv', title: 'Squid Game', tags: ['popular_series', 'kdrama'] },
  { id: 'tv-1396', tmdbId: 1396, type: 'tv', title: 'Breaking Bad', tags: ['popular_series', 'crime', 'us_drama'] },
  { id: 'tv-60625', tmdbId: 60625, type: 'tv', title: 'Rick and Morty', tags: ['popular_series', 'anime'] },
  { id: 'tv-37854', tmdbId: 37854, type: 'tv', title: 'One Piece', tags: ['popular_series', 'anime', 'action_thriller'] },
  { id: 'tv-127532', tmdbId: 127532, type: 'tv', title: 'Solo Leveling', tags: ['popular_series', 'anime', 'action_thriller'] },
  { id: 'tv-12971', tmdbId: 12971, type: 'tv', title: 'Dragon Ball Z', tags: ['popular_series', 'anime', 'action_thriller'], kidsSafe: true },
  { id: 'tv-95557', tmdbId: 95557, type: 'tv', title: 'The Uncanny Counter', tags: ['kdrama', 'action_thriller'] },
  { id: 'tv-94796', tmdbId: 94796, type: 'tv', title: 'Crash Landing on You', tags: ['kdrama', 'romance_romcom', 'popular_series'] },
  { id: 'tv-154825', tmdbId: 154825, type: 'tv', title: 'Business Proposal', tags: ['kdrama', 'romance_romcom'] },
  { id: 'tv-215720', tmdbId: 215720, type: 'tv', title: 'Queen of Tears', tags: ['kdrama', 'romance_romcom', 'popular_series'] },
  { id: 'tv-128883', tmdbId: 128883, type: 'tv', title: 'Hometown Cha-Cha-Cha', tags: ['kdrama', 'romance_romcom'] },
  { id: 'tv-70523', tmdbId: 70523, type: 'tv', title: 'Dark', tags: ['popular_series', 'crime'] },
  { id: 'tv-69050', tmdbId: 69050, type: 'tv', title: 'Riverdale', tags: ['popular_series', 'crime', 'us_drama'] },
  { id: 'tv-1416', tmdbId: 1416, type: 'tv', title: "Grey's Anatomy", tags: ['popular_series', 'us_drama'] },
  { id: 'tv-1402', tmdbId: 1402, type: 'tv', title: 'The Walking Dead', tags: ['popular_series', 'action_thriller'] },
  { id: 'tv-387', tmdbId: 387, type: 'tv', title: 'SpongeBob SquarePants', tags: ['anime', 'popular_series'], kidsSafe: true },
  { id: 'tv-86831', tmdbId: 86831, type: 'tv', title: 'CoComelon', tags: ['anime'], kidsSafe: true },
  { id: 'tv-82728', tmdbId: 82728, type: 'tv', title: 'Bluey', tags: ['anime', 'popular_series'], kidsSafe: true },
  { id: 'tv-2316', tmdbId: 2316, type: 'tv', title: 'The Office', tags: ['popular_series', 'us_drama'] },
  { id: 'movie-1072790', tmdbId: 1072790, type: 'movie', title: 'Anyone But You', tags: ['popular_movies', 'romance_romcom'] },
  { id: 'movie-466282', tmdbId: 466282, type: 'movie', title: "To All the Boys I've Loved Before", tags: ['popular_movies', 'romance_romcom'] },
  { id: 'movie-455207', tmdbId: 455207, type: 'movie', title: 'Crazy Rich Asians', tags: ['popular_movies', 'romance_romcom'] }
];

const MIN_PROFILE_TITLE_SELECTIONS = 5;

const CATALOG_ROWS = [
  [
    'New & Popular Movies',
    '/discover/movie?language=en-US&include_adult=false&sort_by=popularity.desc&primary_release_date.gte=2025-01-01'
  ],
  [
    'New & Popular Series',
    '/discover/tv?language=en-US&sort_by=popularity.desc&first_air_date.gte=2025-01-01'
  ],
  [
    'Top Rated Movies',
    '/discover/movie?language=en-US&include_adult=false&sort_by=vote_average.desc&vote_count.gte=2000'
  ],
  [
    'Top Rated Series',
    '/discover/tv?language=en-US&sort_by=vote_average.desc&vote_count.gte=800'
  ],
  [
    'Netflix Movies',
    '/discover/movie?language=en-US&include_adult=false&watch_region=US&with_watch_providers=8&sort_by=popularity.desc'
  ],
  [
    'Netflix Series',
    '/discover/tv?language=en-US&watch_region=US&with_watch_providers=8&sort_by=popularity.desc'
  ],
  [
    'Top Rated Netflix Movies',
    '/discover/movie?language=en-US&include_adult=false&watch_region=US&with_watch_providers=8&sort_by=vote_average.desc&vote_count.gte=800'
  ],
  [
    'Top Rated Netflix Series',
    '/discover/tv?language=en-US&watch_region=US&with_watch_providers=8&sort_by=vote_average.desc&vote_count.gte=400'
  ],
  [
    'New Netflix Movies',
    '/discover/movie?language=en-US&include_adult=false&watch_region=US&with_watch_providers=8&sort_by=primary_release_date.desc&primary_release_date.lte=2026-08-23&vote_count.gte=25'
  ],
  [
    'New Netflix Series',
    '/discover/tv?language=en-US&watch_region=US&with_watch_providers=8&sort_by=first_air_date.desc&first_air_date.lte=2026-08-23&vote_count.gte=20'
  ],
  [
    'Netflix Action Movies',
    '/discover/movie?language=en-US&include_adult=false&watch_region=US&with_watch_providers=8&with_genres=28&sort_by=popularity.desc'
  ],
  [
    'Netflix Drama Series',
    '/discover/tv?language=en-US&watch_region=US&with_watch_providers=8&with_genres=18&sort_by=popularity.desc'
  ],
  [
    'Prime Video Movies',
    '/discover/movie?language=en-US&include_adult=false&watch_region=US&with_watch_providers=9&sort_by=popularity.desc'
  ],
  [
    'Prime Video Series',
    '/discover/tv?language=en-US&watch_region=US&with_watch_providers=9&sort_by=popularity.desc'
  ]
];

const app = document.querySelector('#app');
const MY_LIST_KEY = 'movieiguess.myList.v1';
const WATCH_PROGRESS_KEY = 'movieiguess.watchProgress.v1';
const WATCH_SERVER_KEY = 'movieiguess.watchServer.v1';

function ensureKofiWidget() {
  if (document.querySelector('[data-kofi-widget]')) return;

  const drawWidget = () => {
    if (!window.kofiWidgetOverlay?.draw) return;

    window.kofiWidgetOverlay.draw('christinex', {
      type: 'floating-chat',
      'floating-chat.donateButton.text': 'Support me',
      'floating-chat.donateButton.background-color': '#d9534f',
      'floating-chat.donateButton.text-color': '#fff'
    });
  };

  const script = document.createElement('script');
  script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
  script.dataset.kofiWidget = '';
  script.onload = drawWidget;

  document.body.appendChild(script);
}

function syncKofiBadge() {
  const shouldHideKofi = Boolean(
    app?.querySelector('.watch-screen') ||
    app?.querySelector('.profile-gate') ||
    document.body.querySelector('.editor-backdrop.is-open')
  );

  document.body.classList.toggle(
    'hide-kofi-widget',
    shouldHideKofi
  );
}

ensureKofiWidget();

const WATCH_SERVERS = [
  {
    id: 'videasy',
    name: 'Netflix',
    movie: id => `https://player.videasy.net/movie/${id}`,
    tv: (id, season, episode) =>
      `https://player.videasy.net/tv/${id}/${season}/${episode}`
  },
  {
    id: 'vidsrc1',
    name: 'Vidsrc 1',
    movie: id => `https://www.vidsrc.wtf/api/1/movie?id=${id}`,
    tv: (id, season, episode) =>
      `https://www.vidsrc.wtf/api/1/tv?id=${id}&s=${season}&e=${episode}`
  },
  {
    id: 'vidsrc2',
    name: 'Vidsrc 2',
    movie: id => `https://vidsrc.wtf/api/2/movie?id=${id}`,
    tv: (id, season, episode) =>
      `https://vidsrc.wtf/api/2/tv?id=${id}&s=${season}&e=${episode}`
  },
  {
    id: 'premium',
    name: 'Premium',
    movie: id => `https://111movies.com/movie/${id}`,
    tv: (id, season, episode) =>
      `https://111movies.com/tv/${id}/${season}/${episode}`
  },
  {
    id: 'vidsrc3',
    name: 'Multi-embed',
    movie: id => `https://www.vidsrc.wtf/api/3/movie/?id=${id}`,
    tv: (id, season, episode) =>
      `https://www.vidsrc.wtf/api/3/tv/?id=${id}&s=${season}&e=${episode}`
  },
  {
    id: 'smashy',
    name: 'Smashy',
    movie: id => `https://smashyplayer.top/#mv${id}`,
    tv: (id, season, episode) =>
      `https://smashyplayer.top/#tv${id}s${season}e${episode}`
  },
  {
    id: 'vidlinkpro',
    name: 'VidLinkPro',
    movie: id => `https://vidlink.pro/movie/${id}?autoplay=true&title=true`,
    tv: (id, season, episode) =>
      `https://vidlink.pro/tv/${id}/${season}/${episode}?autoplay=true&title=true`
  },
  {
    id: 'autoembed',
    name: 'Prime',
    movie: id =>
      `https://test.autoembed.cc/embed/movie/${id}?autoplay=true&server=5`,
    tv: (id, season, episode) =>
      `https://test.autoembed.cc/embed/tv/${id}/${season}/${episode}?autoplay=true&server=5`
  },
  {
    id: 'multiembed',
    name: 'Purple',
    movie: id => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, season, episode) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
  },
  {
    id: 'primewire',
    name: 'Prime 2',
    movie: id => `https://www.primewire.tf/embed/movie?tmdb=${id}`,
    tv: (id, season, episode) =>
      `https://www.primewire.tf/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
  },
  {
    id: 'vidrock',
    name: 'VidRock',
    movie: id => `https://vidrock.net/movie/${id}`,
    tv: (id, season, episode) =>
      `https://vidrock.net/tv/${id}/${season}/${episode}`
  },
  {
    id: 'mega',
    name: 'Mega',
    movie: id => `https://vidrock.net/mega/movie/${id}`,
    tv: (id, season, episode) =>
      `https://vidrock.net/mega/tv/${id}/${season}/${episode}`
  },
  {
    id: 'vidnest',
    name: 'VidNest',
    movie: id => `https://vidnest.fun/movie/${id}`,
    tv: (id, season, episode) =>
      `https://vidnest.fun/tv/${id}/${season}/${episode}`
  },
  {
    id: 'vidzee',
    name: 'Vidzee',
    movie: id => `https://player.vidzee.wtf/embed/movie/${id}`,
    tv: (id, season, episode) =>
      `https://player.vidzee.wtf/embed/tv/${id}/${season}/${episode}`
  }
];

const COUNTRY_PREFERENCE_MATCHERS = {
  KR: /k-drama|korean|korea/i,
  JP: /japanese|japan|anime/i,
  US: /\bus\b|united states|american/i,
  PH: /filipino|philippines|pinoy/i
};

/* =========================================================
   STATE
========================================================= */

const state = {
  profile: null,

  hero: null,
  heroItems: [],
  heroIndex: 0,
  heroRequestId: 0,
  heroVideoKey: null,
  heroLogoPath: null,
  heroMuted: true,

  rows: [],
  top10: [],
  allItems: [],

  searchOpen: false,
  searchTerm: '',
  searchRequestId: 0,
  searchTimer: null,
  currentView: 'home',

  heroRevealTimer: null,
  heroAdvanceTimer: null,
  heroCollapseTimer: null,

  hoverTimer: null,
  hoverCloseTimer: null,
  hoverCard: null,
  hoverItem: null,
  hoverMuted: true,

  mediaCache: new Map()
};

/* =========================================================
   ICONS
========================================================= */

const icons = {
  play: '▶',
  info: 'ⓘ',
  plus: '+',
  like: '♡',
  down: '⌄',
  close: '×'
};

/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value = '') {
  return String(value).replace(
    /[&<>'"]/g,
    char =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      })[char]
  );
}

function profileInitial(name = '') {
  return (
    name.trim().charAt(0).toUpperCase() || '?'
  );
}

function getMediaType(item) {
  if (item?.media_type === 'tv') return 'tv';
  if (item?.media_type === 'movie') return 'movie';

  if (item?.first_air_date) {
    return 'tv';
  }

  return 'movie';
}

function getItemTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.original_title ||
    item?.original_name ||
    'Untitled'
  );
}

function getItemYear(item) {
  const date =
    item?.release_date ||
    item?.first_air_date ||
    '';

  return date.slice(0, 4);
}

function getCacheKey(item) {
  return `${getMediaType(item)}-${item.id}`;
}

function getItemCountries(item) {
  return [
    ...(Array.isArray(item?.origin_country)
      ? item.origin_country
      : []),
    ...(item?.production_countries || [])
      .map(country => country.iso_3166_1)
  ]
    .filter(Boolean)
    .map(country => country.toUpperCase());
}

function isIndianBrowsingItem(item) {
  const countries =
    getItemCountries(item);

  const language =
    String(item?.original_language || '')
      .toLowerCase();

  const title =
    getItemTitle(item).toLowerCase();

  return (
    countries.includes('IN') ||
    ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'pa', 'gu']
      .includes(language) ||
    /\bbollywood\b/.test(title)
  );
}

function isBrowseAllowedItem(item) {
  return !isIndianBrowsingItem(item);
}

function getMediaImage(
  item,
  preferred = 'backdrop',
  backdropSize = IMG_W780
) {
  if (!item) return '';

  if (
    preferred === 'poster' &&
    item.poster_path
  ) {
    return `${IMG_W500}${item.poster_path}`;
  }

  if (item.backdrop_path) {
    return `${backdropSize}${item.backdrop_path}`;
  }

  if (item.poster_path) {
    return `${IMG_W500}${item.poster_path}`;
  }

  return '';
}

function clearTimer(name) {
  if (state[name]) {
    clearTimeout(state[name]);
    state[name] = null;
  }
}

function openModalElement(element) {
  requestAnimationFrame(() => {
    element?.classList.add('is-open');

    if (element?.classList.contains('editor-backdrop')) {
      document.body.classList.add('hide-kofi-widget');
    }
  });
}

function closeModalElement(element, callback) {
  if (!element) return;

  element.classList.remove('is-open');

  if (element.classList.contains('editor-backdrop')) {
    document.body.classList.remove('hide-kofi-widget');
  }

  setTimeout(() => {
    element.remove();
    callback?.();
  }, 220);
}

/* =========================================================
   API
========================================================= */

async function api(path) {
  const separator = path.includes('?') ? '&' : '?';

  const response = await fetch(
    `${TMDB_API}${path}${separator}api_key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`TMDB error ${response.status}`);
  }

  return response.json();
}

/* =========================================================
   YOUTUBE
========================================================= */

function youtubeEmbedUrl(key) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: key,
    rel: '0',
    playsinline: '1',
    enablejsapi: '1',
    disablekb: '1',
    iv_load_policy: '3',
    modestbranding: '1',
    fs: '0',
    cc_load_policy: '0',
    showinfo: '0',
    autohide: '1',
    hd: '1',
    vq: 'hd1080'
  });

  return `https://www.youtube.com/embed/${key}?${params.toString()}`;
}

function sendYouTubeCommand(frame, func, args = []) {
  if (!frame?.contentWindow) return;

  frame.contentWindow.postMessage(
    JSON.stringify({
      event: 'command',
      func,
      args
    }),
    '*'
  );
}

function requestYouTube1080p(frame) {
  if (!frame?.isConnected) return;

  sendYouTubeCommand(frame, 'setPlaybackQuality', ['hd1080']);
  sendYouTubeCommand(frame, 'setPlaybackQualityRange', ['hd1080', 'hd1080']);
}

function lockYouTube1080p(frame) {
  [0, 250, 750, 1500, 3000, 5200, 8000].forEach(delay => {
    setTimeout(() => requestYouTube1080p(frame), delay);
  });
}

function showProfileGate(manage = false) {
  const profiles = getProfiles();

  app.innerHTML = `
    <section class="profile-gate">

      <img
        class="profile-logo"
        src="src/assets/logo.png"
        alt="MovieIGuess"
      />

      <div class="profile-wrap">

        <h1 class="profile-title">
          ${
            !profiles.length
              ? 'Create your profile'
              : manage
                ? 'Manage Profiles'
                : "Who's watching?"
          }
        </h1>

        <div class="profile-grid">

          ${profiles.map(profile => `
            <button
              class="profile-card"
              data-profile-id="${profile.id}"
            >
              <span
                class="profile-avatar"
                style="background:${profile.color}"
              >
                ${
                  manage
                    ? '✎'
                    : escapeHTML(profileInitial(profile.name))
                }
              </span>

              <span class="profile-name">
                ${escapeHTML(profile.name)}
              </span>
            </button>
          `).join('')}

          ${
            profiles.length < 5
              ? `
                <button
                  class="profile-card add-profile"
                  data-add-profile
                >
                  <span class="profile-avatar">+</span>
                  <span class="profile-name">Add Profile</span>
                </button>
              `
              : ''
          }

        </div>

        ${
          profiles.length
            ? `
              <button class="manage-btn" data-manage>
                ${manage ? 'Done' : 'Manage Profiles'}
              </button>
            `
            : ''
        }

      </div>

    </section>
  `;

  app
    .querySelectorAll('[data-profile-id]')
    .forEach(button => {
      button.addEventListener('click', () => {
        const profile = profiles.find(
          item => item.id === button.dataset.profileId
        );

        if (!profile) return;

        if (manage) {
          openProfileEditor(profile);
          return;
        }

        state.profile = profile;

        setActiveProfile(profile.id);

        renderHome();
      });
    });

  app
    .querySelector('[data-add-profile]')
    ?.addEventListener('click', () => openProfileEditor());

  app
    .querySelector('[data-manage]')
    ?.addEventListener('click', () =>
      showProfileGate(!manage)
    );
}

/* =========================================================
   PROFILE EDITOR
========================================================= */

function openProfileEditor(profile = null) {
  const colors = [
    '#0b63ce',
    '#e50914',
    '#f5a623',
    '#7b61ff',
    '#00a878',
    '#d85b9a',
    '#65390b',
    '#585858'
  ];

  let selected = profile?.color || colors[0];
  const selectedTitles =
    new Set(profile?.favoriteTitles || []);

  const overlay = document.createElement('div');

  overlay.className = 'editor-backdrop';

  overlay.innerHTML = `
    <div class="profile-editor">

      <div class="profile-editor-header">
        <h2>
          ${profile ? 'Edit Profile' : 'Add Profile'}
        </h2>

        <button
          type="button"
          class="editor-close"
          aria-label="Close profile editor"
        >
          ${icons.close}
        </button>
      </div>

      <label>Name</label>

      <input
        id="profile-name-input"
        type="text"
        maxlength="18"
        value="${escapeHTML(profile?.name || '')}"
        placeholder="Name"
      />

      <label class="profile-color-label">
        Profile color
      </label>

      <div class="color-row">
        ${colors.map(color => `
          <button
            class="color-dot ${
              color === selected ? 'selected' : ''
            }"
            data-color="${color}"
            style="background:${color}"
          ></button>
        `).join('')}
      </div>

      <label class="kids-checkbox">
        <input
          id="profile-kids"
          type="checkbox"
          ${profile?.kids ? 'checked' : ''}
        >

        Kids profile
      </label>

      <div class="preference-survey">
        <h3>
          What do you want to watch?
        </h3>

        <p>
          Select at least 5 movies or series to tune this profile.
        </p>

        <div
          class="title-pick-count"
          data-title-pick-count
        >
          ${selectedTitles.size}/${MIN_PROFILE_TITLE_SELECTIONS} selected
        </div>

        <div class="title-pick-grid">
          ${PROFILE_TITLE_CHOICES.map(choice => `
            <button
              type="button"
              class="title-pick-card ${
                selectedTitles.has(choice.id)
                  ? 'selected'
                  : ''
              }"
              data-title-choice="${choice.id}"
              data-title-type="${choice.type}"
              data-title-id="${choice.tmdbId}"
              data-kids-safe="${choice.kidsSafe ? 'true' : 'false'}"
            >
              <span
                class="title-pick-image"
                data-title-pick-image
              ></span>

              <span class="title-pick-shade"></span>

              <span class="title-pick-check">
                ${checkIcon()}
              </span>

              <span class="title-pick-name">
                ${escapeHTML(choice.title)}
              </span>
            </button>
          `).join('')}
        </div>

        <div
          class="title-pick-error"
          data-title-pick-error
          hidden
        >
          Pick at least 5 titles to create this profile.
        </div>
      </div>

      <div class="editor-actions">

        <button type="button" class="cancel">
          Cancel
        </button>

        <button type="button" class="save">
          Save
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(overlay);
  openModalElement(overlay);

  const input = overlay.querySelector(
    '#profile-name-input'
  );

  input.focus();
  input.select();

  overlay
    .querySelectorAll('[data-color]')
    .forEach(button => {
      button.addEventListener('click', () => {
        selected = button.dataset.color;

        overlay
          .querySelectorAll('[data-color]')
          .forEach(item => {
            item.classList.toggle(
              'selected',
              item === button
            );
          });
      });
    });

  const kidsInput =
    overlay.querySelector('#profile-kids');

  kidsInput.addEventListener('change', () => {
    syncKidsTitleChoices(
      overlay,
      selectedTitles,
      kidsInput.checked
    );
  });

  overlay
    .querySelectorAll('[data-title-choice]')
    .forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.titleChoice;

        if (selectedTitles.has(id)) {
          selectedTitles.delete(id);
        } else {
          selectedTitles.add(id);
        }

        button.classList.toggle(
          'selected',
          selectedTitles.has(id)
        );

        updateTitlePickState(
          overlay,
          selectedTitles
        );
      });
    });

  hydrateTitlePickCards(overlay);
  syncKidsTitleChoices(
    overlay,
    selectedTitles,
    kidsInput.checked
  );
  updateTitlePickState(
    overlay,
    selectedTitles
  );

  overlay.querySelector('.editor-close').onclick = () =>
    closeModalElement(overlay);

  overlay.querySelector('.cancel').onclick = () =>
    closeModalElement(overlay);

  overlay.querySelector('.save').onclick = () => {
    const name = input.value.trim();

    if (!name) {
      input.focus();
      return;
    }

    const kids = overlay.querySelector(
      '#profile-kids'
    ).checked;

    if (
      !profile &&
      selectedTitles.size <
        MIN_PROFILE_TITLE_SELECTIONS
    ) {
      overlay.querySelector(
        '[data-title-pick-error]'
      ).hidden = false;

      return;
    }

    const preferences =
      derivePreferencesFromTitles(
        selectedTitles
      );

    if (profile) {
      updateProfile(profile.id, {
        name,
        color: selected,
        kids,
        preferences,
        favoriteTitles:
          Array.from(selectedTitles)
      });
    } else {
      const nextProfile = addProfile({
        name,
        color: selected,
        kids,
        preferences,
        favoriteTitles:
          Array.from(selectedTitles)
      });

      state.profile = nextProfile;
      setActiveProfile(nextProfile.id);
    }

    closeModalElement(overlay);

    if (profile) {
      showProfileGate(true);
    } else {
      renderHome();
    }
  };

  overlay
    .querySelector('.delete')
    ?.addEventListener('click', () => {
      deleteProfile(profile.id);

      closeModalElement(overlay);

      showProfileGate(true);
    });
}

function updateTitlePickState(
  overlay,
  selectedTitles
) {
  const count =
    overlay.querySelector(
      '[data-title-pick-count]'
    );

  const error =
    overlay.querySelector(
      '[data-title-pick-error]'
    );

  if (count) {
    count.textContent =
      `${selectedTitles.size}/${MIN_PROFILE_TITLE_SELECTIONS} selected`;

    count.classList.toggle(
      'complete',
      selectedTitles.size >=
        MIN_PROFILE_TITLE_SELECTIONS
    );
  }

  if (
    error &&
    selectedTitles.size >=
      MIN_PROFILE_TITLE_SELECTIONS
  ) {
    error.hidden = true;
  }
}

function syncKidsTitleChoices(
  overlay,
  selectedTitles,
  kidsOnly
) {
  overlay
    .querySelectorAll('[data-title-choice]')
    .forEach(card => {
      const hidden =
        kidsOnly &&
        card.dataset.kidsSafe !== 'true';

      card.hidden = hidden;

      if (hidden) {
        selectedTitles.delete(
          card.dataset.titleChoice
        );

        card.classList.remove('selected');
      }
    });

  updateTitlePickState(
    overlay,
    selectedTitles
  );
}

function derivePreferencesFromTitles(
  selectedTitles
) {
  return Array.from(selectedTitles)
    .flatMap(id => {
      const choice =
        PROFILE_TITLE_CHOICES.find(
          item => item.id === id
        );

      return choice?.tags || [];
    })
    .filter(
      (tag, index, tags) =>
        tags.indexOf(tag) === index
    );
}

async function hydrateTitlePickCards(overlay) {
  const cards =
    Array.from(
      overlay.querySelectorAll(
        '[data-title-choice]'
      )
    );

  await Promise.all(
    cards.map(async card => {
      try {
        const [data, images] =
          await Promise.all([
            api(
              `/${card.dataset.titleType}/${card.dataset.titleId}?language=en-US`
            ),

            api(
              `/${card.dataset.titleType}/${card.dataset.titleId}/images?include_image_language=en,null`
            )
          ]);

        if (!card.isConnected) return;

        const image =
          data.backdrop_path
            ? `${IMG_W780}${data.backdrop_path}`
            : data.poster_path
              ? `${IMG_W500}${data.poster_path}`
              : '';

        if (!image) return;

        card
          .querySelector(
            '[data-title-pick-image]'
          )
          .style.backgroundImage =
            `url('${image}')`;

        const logo =
          (images.logos || [])
            .find(item =>
              item.iso_639_1 === 'en'
            ) ||
          (images.logos || [])
            .find(item =>
              item.iso_639_1 == null
            ) ||
          (images.logos || [])[0];

        if (logo?.file_path) {
          const name =
            card.querySelector(
              '.title-pick-name'
            );

          name.innerHTML = `
            <img
              src="${IMG_W500}${logo.file_path}"
              alt="${escapeHTML(data.title || data.name || '')}"
            />
          `;

          name.classList.add('has-logo');
        }
      } catch (error) {
        console.warn(
          'Profile title artwork unavailable:',
          error
        );
      }
    })
  );
}

/* =========================================================
   HOME DATA
========================================================= */

async function loadHomeData() {
  const profile =
    state.profile ||
    getProfiles()[0];

  const baseRows = profile.kids
    ? [
        ...KIDS_ROWS,

        [
          'More Cartoons',
          '/discover/tv?language=en-US&with_genres=16&sort_by=popularity.desc'
        ],

        [
          'Family Adventures',
          '/discover/movie?language=en-US&include_adult=false&with_genres=12,10751&certification_country=US&certification.lte=PG&sort_by=popularity.desc'
        ]
      ]
    : [
        ...buildPreferenceRows(profile),
        ...buildRecommendationSourceRows(),

        [
          'Today\'s Top Picks for You',
          '/trending/all/day?language=en-US'
        ],

        [
          'New on MovieIGuess',
          '/movie/now_playing?language=en-US&page=1&include_adult=false'
        ],

        ...CATALOG_ROWS,

        [
          'Japanese Anime Series',
          '/discover/tv?language=en-US&with_genres=16&with_origin_country=JP&sort_by=popularity.desc'
        ],

        [
          'US TV Shows',
          '/discover/tv?language=en-US&with_origin_country=US&sort_by=popularity.desc'
        ],

        [
          'Get In on the Action',
          '/discover/movie?language=en-US&include_adult=false&with_genres=28&sort_by=popularity.desc'
        ],

        [
          'Popular on MovieIGuess',
          '/trending/tv/week?language=en-US'
        ],

        [
          'Critically Acclaimed Movies',
          '/discover/movie?language=en-US&include_adult=false&sort_by=vote_average.desc&vote_count.gte=1500'
        ],

        [
          'Your Next Watch',
          '/discover/movie?language=en-US&include_adult=false&sort_by=popularity.desc&page=2'
        ]
      ];

  const rows =
    uniqueContentRows(baseRows);

  const heroPath = profile.kids
    ? '/discover/movie?language=en-US&include_adult=false&with_genres=16,10751&certification_country=US&certification.lte=PG&sort_by=popularity.desc'
    : '/trending/all/day?language=en-US';

  const top10Path = profile.kids
    ? '/discover/movie?language=en-US&include_adult=false&with_genres=16,10751&certification_country=US&certification.lte=PG&sort_by=popularity.desc&page=2'
    : '/trending/movie/day?language=en-US';

  const responses = await Promise.allSettled([
    api(heroPath),
    api(top10Path),

    ...rows.map(([, path]) =>
      api(path)
    )
  ]);

  const results =
    responses.map((response, index) => {
      if (response.status === 'fulfilled') {
        return response.value;
      }

      console.warn(
        `Home request ${index} unavailable:`,
        response.reason
      );

      return { results: [] };
    });

  const selectedTitleItems =
    await loadSelectedProfileTitles(profile);

  const listItems =
    getProfileList();

  const favoriteListItems =
    listItems.filter(item => item.favorite);

  const heroResponse = results[0];
  const top10Response = results[1];
  const rowResponses = results.slice(2);

  state.heroItems =
    uniqueMediaItems([
      ...(heroResponse.results || []),
      ...rowResponses.flatMap(
        response => response.results || []
      )
    ])
      .filter(
        item =>
          (item.backdrop_path || item.poster_path) &&
          !item.adult &&
          isBrowseAllowedItem(item) &&
          (item.title || item.name)
      )
      .slice(0, 12);

  state.heroIndex = 0;
  state.hero =
    state.heroItems[0] || null;

  state.top10 =
    (top10Response.results || [])
      .filter(item =>
        item.poster_path &&
        !item.adult &&
        isBrowseAllowedItem(item)
      )
      .slice(0, 10);

  const generatedRows = rows.map(
    ([title], index) => ({
      title,

      items:
        (rowResponses[index]?.results || [])
          .filter(
            item =>
              (item.backdrop_path || item.poster_path) &&
              !item.adult &&
              isBrowseAllowedItem(item)
          )
          .slice(0, 20)
    })
  );

  const catalogTitles =
    new Set(
      CATALOG_ROWS.map(([title]) => title)
    );

  const catalogRows =
    generatedRows.filter(row =>
      catalogTitles.has(row.title)
    );

  const nonCatalogRows =
    generatedRows.filter(row =>
      !catalogTitles.has(row.title)
    );

  const continueWatchingItems =
    getContinueWatchingItems([
      ...state.top10,
      ...selectedTitleItems,
      ...listItems,
      ...generatedRows.flatMap(row => row.items)
    ]);

  const topPickSignals =
    uniqueMediaItems([
      ...favoriteListItems,
      ...continueWatchingItems,
      ...listItems,
      ...selectedTitleItems
    ]);

  const topPickItems =
    topPickSignals.length
      ? buildTopPickItems(
          topPickSignals,
          nonCatalogRows
        )
      : [];

  state.rows = dedupeRowsByPriority([
    ...(
      topPickItems.length
        ? [
            {
              title: 'Top Picks for You Today',
              items: topPickItems
            }
          ]
        : []
    ),
    ...(
      continueWatchingItems.length
        ? [
            {
              title: 'Continue Watching',
              items: continueWatchingItems
            }
          ]
        : []
    ),
    ...catalogRows,
    ...nonCatalogRows
  ]);

  state.allItems = [
    ...state.top10,
    ...state.rows.flatMap(row => row.items),
    ...listItems
  ];

  await loadHeroTrailer();
}

function uniqueMediaItems(items) {
  const seen = new Set();

  return items.filter(item => {
    if (!item?.id) {
      return false;
    }

    const key =
      `${getMediaType(item)}-${item.id}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildTopPickItems(signals, rows) {
  const signalKeys =
    new Set(
      signals.map(
        item => `${getMediaType(item)}-${item.id}`
      )
    );

  const weightedTags =
    getWeightedSignalTags(signals);

  return uniqueMediaItems(
    rows
      .map(row => ({
        row,
        score:
          getRowPreferenceScore(
            row.title,
            weightedTags
          )
      }))
      .sort(
        (a, b) => b.score - a.score
      )
      .flatMap(({ row }) => row.items)
  )
    .filter(item =>
      !signalKeys.has(
        `${getMediaType(item)}-${item.id}`
      ) &&
      isBrowseAllowedItem(item)
    );
}

function getWeightedSignalTags(signals) {
  const weights = new Map();

  signals.forEach(item => {
    const choice =
      PROFILE_TITLE_CHOICES.find(candidate =>
        candidate.tmdbId === item.id &&
        candidate.type === getMediaType(item)
      );

    const weight =
      item.favorite
        ? 4
        : item.watchProgress
          ? 3
          : 2;

    const tags =
      choice?.tags ||
      inferPreferenceTags(item);

    tags.forEach(tag => {
      weights.set(
        tag,
        (weights.get(tag) || 0) + weight
      );
    });
  });

  return weights;
}

function inferPreferenceTags(item) {
  const genreIds =
    (item.genre_ids || item.genres || [])
      .map(genre =>
        typeof genre === 'number'
          ? genre
          : genre.id
      );

  const type =
    getMediaType(item);

  const countries =
    getItemCountries(item);

  const tags = [];

  if (genreIds.includes(16)) tags.push('anime');
  if (genreIds.includes(80)) tags.push('crime');
  if (genreIds.includes(18)) tags.push('us_drama');
  if (genreIds.includes(10749)) tags.push('romance_romcom');
  if (genreIds.includes(35)) tags.push('romance_romcom');
  if (genreIds.includes(28) || genreIds.includes(53)) {
    tags.push('action_thriller');
  }
  if (type === 'tv') tags.push('popular_series');
  if (type === 'movie') tags.push('popular_movies');

  countries.forEach(country => {
    if (COUNTRY_PREFERENCE_MATCHERS[country]) {
      tags.push(`country_${country}`);
    }
  });

  return tags;
}

function getRowPreferenceScore(title, weights) {
  const normalized =
    title.toLowerCase();

  return Array.from(weights.entries())
    .reduce((score, [tag, weight]) => {
      const option =
        PREFERENCE_OPTIONS.find(
          item => item.id === tag
        );

      if (
        option?.label &&
        normalized.includes(
          option.label.toLowerCase()
        )
      ) {
        return score + weight;
      }

      if (
        tag === 'romance_romcom' &&
        /romantic|romance|love|rom-com/i
          .test(title)
      ) {
        return score + weight;
      }

      if (
        tag === 'popular_series' &&
        /series|popular/i.test(title)
      ) {
        return score + weight;
      }

      if (
        tag === 'action_thriller' &&
        /action|thriller/i.test(title)
      ) {
        return score + weight;
      }

      if (tag.startsWith('country_')) {
        const country =
          tag.replace('country_', '');

        const matcher =
          COUNTRY_PREFERENCE_MATCHERS[country];

        if (matcher?.test(title)) {
          return score + weight;
        }
      }

      if (
        tag.startsWith('country_') &&
        /international|world/i.test(title)
      ) {
        return score + weight;
      }

      return score;
    }, 0);
}

function dedupeRowsByPriority(rows) {
  const seen = new Set();

  return rows
    .map(row => {
      const items = row.items.filter(item => {
        const key =
          `${getMediaType(item)}-${item.id}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });

      return {
        ...row,
        items
      };
    })
    .filter(row => row.items.length);
}

function excludeMediaItems(items, excludedItems) {
  const excluded = new Set(
    excludedItems.map(
      item => `${getMediaType(item)}-${item.id}`
    )
  );

  return items.filter(
    item =>
      !excluded.has(
        `${getMediaType(item)}-${item.id}`
      )
  );
}

async function loadSelectedProfileTitles(profile) {
  const selectedChoices =
    (profile?.favoriteTitles || [])
      .map(id =>
        PROFILE_TITLE_CHOICES.find(
          choice => choice.id === id
        )
      )
      .filter(Boolean);

  if (!selectedChoices.length) {
    return [];
  }

  const results =
    await Promise.allSettled(
      selectedChoices.map(choice =>
        api(
          `/${choice.type}/${choice.tmdbId}?language=en-US`
        ).then(item => ({
          ...item,
          media_type: choice.type
        }))
      )
    );

  return results
    .filter(result =>
      result.status === 'fulfilled'
    )
    .map(result => result.value)
    .filter(
      item =>
        item.backdrop_path &&
        !item.adult
    );
}

function buildPreferenceRows(profile) {
  const preferences =
    Array.isArray(profile?.preferences)
      ? profile.preferences
      : [];

  return preferences
    .map(id =>
      PREFERENCE_OPTIONS.find(
        option => option.id === id
      )
    )
    .filter(Boolean)
    .flatMap(option =>
      option.rows.map(([title, path]) => [
        `${title} for ${profile.name}`,
        path
      ])
    );
}

function uniqueContentRows(rows) {
  const seen = new Set();

  return rows.filter(([title, path]) => {
    const key =
      path || title.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildRecommendationSourceRows() {
  return PREFERENCE_OPTIONS
    .flatMap(option => option.rows)
    .map(([title, path]) => [
      title,
      path
    ]);
}

async function loadHeroTrailer() {
  state.heroVideoKey = null;
  state.heroLogoPath = null;
  state.heroMuted = true;

  if (!state.hero?.id) return;

  try {
    const media =
      await loadMediaExtras(state.hero);

    state.heroVideoKey =
      media.trailerKey;

    state.heroLogoPath =
      media.logoPath;
  } catch (error) {
    console.warn(
      'Hero trailer failed:',
      error
    );
  }
}

/* =========================================================
   MEDIA DETAILS / LOGO / TRAILER CACHE
========================================================= */

async function loadMediaExtras(item) {
  const key = getCacheKey(item);

  if (state.mediaCache.has(key)) {
    return state.mediaCache.get(key);
  }

  const promise = (async () => {
    const type = getMediaType(item);

    const [
      details,
      videos,
      images
    ] = await Promise.all([
      api(`/${type}/${item.id}?language=en-US`),

      api(
        `/${type}/${item.id}/videos?language=en-US`
      ),

      api(
        `/${type}/${item.id}/images?include_image_language=en,null`
      )
    ]);

    const youtube = (videos.results || [])
      .filter(video =>
        video.site === 'YouTube' &&
        video.key
      );

    const trailer =
      youtube.find(video =>
        video.type === 'Trailer' &&
        video.official
      ) ||

      youtube.find(video =>
        video.type === 'Trailer'
      ) ||

      youtube.find(video =>
        video.type === 'Teaser' &&
        video.official
      ) ||

      youtube.find(video =>
        video.type === 'Teaser'
      ) ||

      youtube[0];

    /*
     * TMDB frequently provides transparent PNG title logos.
     *
     * Prefer English artwork, then language-neutral.
     */
    const logos = images.logos || [];

    const logo =
      logos.find(image =>
        image.iso_639_1 === 'en'
      ) ||

      logos.find(image =>
        image.iso_639_1 == null
      ) ||

      logos[0];

    const result = {
      details: {
        ...item,
        ...details
      },

      trailerKey:
        trailer?.key || null,

      logoPath:
        logo?.file_path || null
    };

    return result;
  })();

  state.mediaCache.set(key, promise);

  try {
    return await promise;
  } catch (error) {
    state.mediaCache.delete(key);
    throw error;
  }
}

/* =========================================================
   RENDER HOME
========================================================= */

async function renderHome() {
  app.innerHTML = `
    <div class="home-loading">
      <div class="loading-fallback" aria-label="Loading">
        <span class="loading-spinner"></span>
      </div>
    </div>
  `;

  try {
    await loadHomeData();
  } catch (error) {
    console.error(error);
  }

  paintHome();
}

function paintHome() {
  destroyHoverPreview();
  syncKofiBadge();

  const profile =
    state.profile ||
    getProfiles()[0];

  const hero =
    state.hero ||
    state.rows
      .flatMap(row => row.items || [])
      .find(item =>
        item?.id &&
        (item.title || item.name)
      ) ||
    state.top10.find(item =>
      item?.id &&
      (item.title || item.name)
    ) ||
    null;

  if (hero && !state.hero) {
    state.hero = hero;
  }

  const heroTitle =
    getItemTitle(hero);

  const heroDescription =
    hero?.overview ||
    'Discover movies, series, anime and more.';

  const heroBackground =
    getMediaImage(
      hero,
      'backdrop',
      IMG_ORIGINAL
    );

  app.innerHTML = `
    <div class="app-shell">

      ${renderNavbar(profile)}

      <section
        class="hero${heroBackground ? '' : ' no-art'}"
        style="
          ${heroBackground ? `background-image:url('${heroBackground}')` : ''}
        "
      >

        ${
          state.heroVideoKey
            ? renderHeroVideo(
                state.heroVideoKey,
                heroTitle
              )
            : ''
        }

        <div class="hero-shade-left"></div>
        <div class="hero-shade-bottom"></div>

        <div class="hero-content">

          <div class="hero-kicker">
            <span>M</span>
            <strong>G</strong>
          </div>

          ${
            state.heroLogoPath
              ? `
                <img
                  class="hero-title-logo"
                  src="${IMG_W500}${state.heroLogoPath}"
                  alt="${escapeHTML(heroTitle)}"
                />
              `
              : `
                <h1 class="hero-title">
                  ${escapeHTML(heroTitle)}
                </h1>
              `
          }

          <div class="hero-meta">

            <span class="hero-match">
              98% Match
            </span>

            <span>
              ${getItemYear(hero) || new Date().getFullYear()}
            </span>

            <span>HD</span>

          </div>

          <p class="hero-description">
            ${escapeHTML(heroDescription)}
          </p>

          <div class="hero-actions">

            <button
              class="hero-btn hero-btn-play"
              data-hero-play
            >
              <span class="play-triangle">▶</span>
              Play
            </button>

            <button
              class="hero-btn hero-btn-info"
              data-hero-info
            >
              <span>ⓘ</span>
              More Info
            </button>

          </div>

        </div>

        ${
          state.heroItems.length > 1
            ? `
              <button
                class="hero-carousel-button hero-carousel-prev"
                data-hero-prev
                aria-label="Previous headline"
              >
                &lsaquo;
              </button>

              <button
                class="hero-carousel-button hero-carousel-next"
                data-hero-next
                aria-label="Next headline"
              >
                &rsaquo;
              </button>
            `
            : ''
        }

        ${
          state.heroVideoKey
            ? `
              <button
                class="hero-mute-button"
                data-hero-mute
                aria-label="Unmute"
              >
                ${muteIcon(true)}
              </button>
            `
            : ''
        }

      </section>

      <main class="content-area" data-content>

        ${renderHomeContent()}

      </main>

    </div>
  `;

  wireHomeEvents();
  populateCardLogos();

  setupHeroTrailer();
  scheduleHeroAdvance();
}

function renderHomeContent() {
  return `
    ${renderRows(state.rows.slice(0, 2), 0)}
    ${renderTop10Row()}
    ${renderRows(state.rows.slice(2), 2)}
  `;
}

function renderViewContent(view) {
  if (view === 'home') {
    return renderHomeContent();
  }

  const rows =
    getRowsForView(view);

  if (view === 'list' && !rows[0]?.items.length) {
    return `
      <section class="empty-list">
        <h2>My List</h2>
        <p>Add movies and series with the plus button.</p>
      </section>
    `;
  }

  return renderRows(rows);
}

function getRowsForView(view) {
  if (view === 'shows') {
    return state.rows.filter(row =>
      row.items.some(
        item => getMediaType(item) === 'tv'
      )
    ).map(row => ({
      ...row,
      items: row.items.filter(
        item => getMediaType(item) === 'tv'
      )
    }));
  }

  if (view === 'movies') {
    return state.rows.filter(row =>
      row.items.some(
        item => getMediaType(item) === 'movie'
      )
    ).map(row => ({
      ...row,
      items: row.items.filter(
        item => getMediaType(item) === 'movie'
      )
    }));
  }

  if (view === 'popular') {
    return state.rows.filter(row =>
      /new|popular|top rated|top 10/i
        .test(row.title)
    );
  }

  if (view === 'list') {
    return [
      {
        title: 'My List',
        items:
          getProfileList()
            .filter(isBrowseAllowedItem)
      }
    ];
  }

  return state.rows;
}

function getProfileList() {
  const profileId =
    state.profile?.id;

  if (!profileId) return [];

  try {
    const allLists =
      JSON.parse(
        localStorage.getItem(MY_LIST_KEY) ||
        '{}'
      );

    return Array.isArray(allLists[profileId])
      ? allLists[profileId]
      : [];
  } catch {
    return [];
  }
}

function getProfileListEntry(item) {
  const key =
    `${getMediaType(item)}-${item.id}`;

  return getProfileList().find(saved =>
    `${getMediaType(saved)}-${saved.id}` === key
  );
}

function isInProfileList(item) {
  return Boolean(
    getProfileListEntry(item)
  );
}

function saveToProfileList(item, favorite = false) {
  const profileId =
    state.profile?.id;

  if (!profileId || !item?.id) {
    return { added: false };
  }

  const mediaType =
    getMediaType(item);

  const savedItem = {
    ...item,
    media_type: mediaType,
    favorite
  };

  let allLists = {};

  try {
    allLists =
      JSON.parse(
        localStorage.getItem(MY_LIST_KEY) ||
        '{}'
      );
  } catch {
    allLists = {};
  }

  const current =
    Array.isArray(allLists[profileId])
      ? allLists[profileId]
      : [];

  const key =
    `${mediaType}-${item.id}`;

  const existingIndex =
    current.findIndex(saved =>
      `${getMediaType(saved)}-${saved.id}` === key
    );

  if (existingIndex >= 0) {
    if (
      favorite &&
      !current[existingIndex].favorite
    ) {
      current[existingIndex] = {
        ...current[existingIndex],
        favorite: true
      };

      allLists[profileId] = current;

      localStorage.setItem(
        MY_LIST_KEY,
        JSON.stringify(allLists)
      );

      return {
        added: false,
        exists: true,
        upgraded: true
      };
    }

    return { added: false, exists: true };
  }

  allLists[profileId] = [
    savedItem,
    ...current
  ];

  localStorage.setItem(
    MY_LIST_KEY,
    JSON.stringify(allLists)
  );

  return { added: true };
}

function getWatchProgressMap() {
  const profileId =
    state.profile?.id;

  if (!profileId) return {};

  try {
    const allProgress =
      JSON.parse(
        localStorage.getItem(WATCH_PROGRESS_KEY) ||
        '{}'
      );

    return allProgress[profileId] || {};
  } catch {
    return {};
  }
}

function getWatchProgress(item) {
  return getWatchProgressMap()[getCacheKey(item)] || null;
}

function getWatchProgressItem(item) {
  return {
    media_type: getMediaType(item),
    id: item.id,
    title: item.title,
    name: item.name,
    original_title: item.original_title,
    original_name: item.original_name,
    overview: item.overview,
    genre_ids: item.genre_ids,
    genres: item.genres,
    origin_country: item.origin_country,
    production_countries: item.production_countries,
    backdrop_path: item.backdrop_path,
    poster_path: item.poster_path,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
    vote_average: item.vote_average,
    popularity: item.popularity
  };
}

function getContinueWatchingItems(candidates = []) {
  const progressEntries =
    Object.values(getWatchProgressMap());

  const candidateItems =
    uniqueMediaItems([
      ...candidates,
      ...state.allItems
    ]);

  return progressEntries
    .filter(entry => entry?.id)
    .sort(
      (a, b) =>
        (b.updatedAt || 0) -
        (a.updatedAt || 0)
    )
    .map(entry => {
      const mediaType =
        entry.media_type || entry.type;

      const key =
        `${mediaType}-${entry.id}`;

      const catalogItem =
        candidateItems.find(item =>
          getCacheKey(item) === key
        );

      return {
        ...(catalogItem || {}),
        ...entry.item,
        id: entry.id,
        media_type: mediaType,
        watchSeason:
          entry.season ||
          entry.item?.watchSeason ||
          1,
        watchEpisode:
          entry.episode ||
          entry.item?.watchEpisode ||
          1,
        watchProgress: entry
      };
    })
    .filter(item =>
      item.id &&
      (item.title || item.name) &&
      (item.backdrop_path || item.poster_path) &&
      isBrowseAllowedItem(item)
    );
}

function syncContinueWatchingRow() {
  const items =
    getContinueWatchingItems();

  state.rows =
    state.rows.filter(
      row => row.title !== 'Continue Watching'
    );

  if (!items.length) return;

  const topPicksIndex =
    state.rows.findIndex(
      row => row.title === 'Top Picks for You Today'
    );

  state.rows.splice(
    topPicksIndex >= 0
      ? topPicksIndex + 1
      : 0,
    0,
    {
      title: 'Continue Watching',
      items
    }
  );

  state.allItems = uniqueMediaItems([
    ...state.allItems,
    ...items
  ]);
}

function saveWatchProgress(item, extra = {}) {
  const profileId =
    state.profile?.id;

  if (!profileId || !item?.id) return;

  let allProgress = {};

  try {
    allProgress =
      JSON.parse(
        localStorage.getItem(WATCH_PROGRESS_KEY) ||
        '{}'
      );
  } catch {
    allProgress = {};
  }

  allProgress[profileId] = {
    ...(allProgress[profileId] || {}),
    [getCacheKey(item)]: {
      media_type: getMediaType(item),
      id: item.id,
      item: getWatchProgressItem(item),
      updatedAt: Date.now(),
      ...extra
    }
  };

  localStorage.setItem(
    WATCH_PROGRESS_KEY,
    JSON.stringify(allProgress)
  );

  syncContinueWatchingRow();
}

function removeWatchProgress(item) {
  const profileId =
    state.profile?.id;

  if (!profileId || !item?.id) return;

  let allProgress = {};

  try {
    allProgress =
      JSON.parse(
        localStorage.getItem(WATCH_PROGRESS_KEY) ||
        '{}'
      );
  } catch {
    allProgress = {};
  }

  if (!allProgress[profileId]) return;

  delete allProgress[profileId][getCacheKey(item)];

  localStorage.setItem(
    WATCH_PROGRESS_KEY,
    JSON.stringify(allProgress)
  );

  syncContinueWatchingRow();
}

function getSelectedWatchServer() {
  const saved =
    localStorage.getItem(WATCH_SERVER_KEY);

  return (
    WATCH_SERVERS.find(server => server.id === saved) ||
    WATCH_SERVERS[0]
  );
}

function setSelectedWatchServer(serverId) {
  if (
    WATCH_SERVERS.some(server => server.id === serverId)
  ) {
    localStorage.setItem(WATCH_SERVER_KEY, serverId);
  }
}

function showToast(message) {
  document
    .querySelector('[data-toast]')
    ?.remove();

  const toast =
    document.createElement('div');

  toast.className = 'app-toast';
  toast.dataset.toast = '';
  toast.textContent = message;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');

    setTimeout(() => {
      toast.remove();
    }, 220);
  }, 2200);
}

function markCardSaved(item) {
  const key =
    `${getMediaType(item)}-${item.id}`;

  app
    .querySelectorAll('[data-card]')
    .forEach(card => {
      if (card.dataset.mediaKey !== key) {
        return;
      }

      if (
        card.querySelector(
          '.card-heart-indicator'
        )
      ) {
        return;
      }

      const indicator =
        document.createElement('div');

      indicator.className =
        'card-heart-indicator';

      indicator.setAttribute(
        'aria-label',
        'Saved in My List'
      );

      indicator.innerHTML =
        heartIcon();

      card.appendChild(indicator);
    });
}

function switchContentView(view) {
  state.currentView = view;
  state.searchTerm = '';

  destroyHoverPreview();

  app
    .querySelectorAll('[data-nav-view]')
    .forEach(link => {
      link.classList.toggle(
        'active',
        link.dataset.navView === view
      );
    });

  const input =
    app.querySelector('[data-search-input]');

  if (input) {
    input.value = '';
  }

  const content =
    app.querySelector('[data-content]');

  if (!content) return;

  content.innerHTML =
    renderViewContent(view);

  wireRails();
  wireCards();
  populateCardLogos();
}

/* =========================================================
   NAVBAR
========================================================= */

function renderNavbar(profile) {
  const isKidsProfile = Boolean(profile?.kids);

  return `
    <header class="topnav" data-nav>

      <img
        class="brand-logo"
        src="src/assets/logo.png"
        alt="MovieIGuess"
      />

      <!-- ================================================
           DESKTOP NAVIGATION
      ================================================= -->

      <nav class="nav-links">

        <a
          class="${state.currentView === 'home' ? 'active' : ''}"
          href="#"
          data-nav-view="home"
        >
          Home
        </a>

        <a
          class="${state.currentView === 'shows' ? 'active' : ''}"
          href="#shows"
          data-nav-view="shows"
        >
          Shows
        </a>

        <a
          class="${state.currentView === 'movies' ? 'active' : ''}"
          href="#movies"
          data-nav-view="movies"
        >
          Movies
        </a>

        <a
          class="${state.currentView === 'games' ? 'active' : ''}"
          href="#games"
          data-nav-view="games"
        >
          Games
        </a>

        <a
          class="${state.currentView === 'popular' ? 'active' : ''}"
          href="#popular"
          data-nav-view="popular"
        >
          New & Popular
        </a>

        <a
          class="${state.currentView === 'list' ? 'active' : ''}"
          href="#list"
          data-nav-view="list"
        >
          My List
        </a>

        <a
          class="${state.currentView === 'languages' ? 'active' : ''}"
          href="#languages"
          data-nav-view="languages"
        >
          Browse by Languages
        </a>

      </nav>

      <!-- ================================================
           RIGHT SIDE
      ================================================= -->

      <div class="nav-right">

        <!-- SEARCH BOX -->

        <div
          class="search-box${state.searchOpen || state.searchTerm ? ' open' : ''}"
          data-search-box
        >
          <input
            type="search"
            data-search-input
            placeholder="Titles, people, genres"
            value="${escapeHTML(state.searchTerm)}"
          />
        </div>

        <!-- SEARCH -->

        <button
          type="button"
          class="nav-icon"
          data-search
          aria-label="Search"
        >
          ${searchIcon()}
        </button>

        <!-- NOTIFICATIONS -->

        <button
          type="button"
          class="nav-icon"
          aria-label="Notifications"
        >
          ${bellIcon()}
        </button>

        <!--
          Only display "Kids" beside the profile
          when the CURRENT profile is a kids profile.
        -->

        ${
          isKidsProfile
            ? `
              <span class="kids-link desktop-kids-link">
                Kids
              </span>
            `
            : ''
        }

        <!-- PROFILE -->

        <button
          type="button"
          class="profile-nav-button"
          data-profile-menu-toggle
          aria-label="Profile menu"
          aria-expanded="false"
        >

          <span
            class="profile-nav-avatar"
            style="background:${profile.color}"
          >
            ${escapeHTML(profileInitial(profile.name))}
          </span>

          <span class="profile-arrow">
            ▼
          </span>

        </button>

      </div>

      <!-- ================================================
           PROFILE / MOBILE NAVIGATION DROPDOWN
      ================================================= -->

      <div
        class="profile-menu"
        data-profile-menu
        hidden
      >

        <!-- ==============================================
             MOBILE NAVIGATION
        =============================================== -->

        <div class="mobile-profile-navigation">

          <a
            class="profile-menu-link ${
              state.currentView === 'home'
                ? 'active'
                : ''
            }"
            href="#"
            data-nav-view="home"
          >
            <span class="profile-menu-icon">
              ${homeMenuIcon()}
            </span>

            <span>
              Home
            </span>
          </a>

          <a
            class="profile-menu-link ${
              state.currentView === 'shows'
                ? 'active'
                : ''
            }"
            href="#shows"
            data-nav-view="shows"
          >
            <span class="profile-menu-icon">
              ${showsMenuIcon()}
            </span>

            <span>
              Shows
            </span>
          </a>

          <a
            class="profile-menu-link ${
              state.currentView === 'movies'
                ? 'active'
                : ''
            }"
            href="#movies"
            data-nav-view="movies"
          >
            <span class="profile-menu-icon">
              ${moviesMenuIcon()}
            </span>

            <span>
              Movies
            </span>
          </a>

          <a
            class="profile-menu-link ${
              state.currentView === 'games'
                ? 'active'
                : ''
            }"
            href="#games"
            data-nav-view="games"
          >
            <span class="profile-menu-icon">
              ${gamesMenuIcon()}
            </span>

            <span>
              Games
            </span>
          </a>

          <a
            class="profile-menu-link ${
              state.currentView === 'popular'
                ? 'active'
                : ''
            }"
            href="#popular"
            data-nav-view="popular"
          >
            <span class="profile-menu-icon">
              ${popularMenuIcon()}
            </span>

            <span>
              New & Popular
            </span>
          </a>

          <a
            class="profile-menu-link ${
              state.currentView === 'list'
                ? 'active'
                : ''
            }"
            href="#list"
            data-nav-view="list"
          >
            <span class="profile-menu-icon">
              ${listMenuIcon()}
            </span>

            <span>
              My List
            </span>
          </a>

          <a
            class="profile-menu-link ${
              state.currentView === 'languages'
                ? 'active'
                : ''
            }"
            href="#languages"
            data-nav-view="languages"
          >
            <span class="profile-menu-icon">
              ${languageMenuIcon()}
            </span>

            <span>
              Browse by Languages
            </span>
          </a>

          ${
            isKidsProfile
              ? `
                <div class="profile-menu-kids-label">

                  <span class="profile-menu-icon">
                    ${kidsMenuIcon()}
                  </span>

                  <span>
                    Kids Profile
                  </span>

                </div>
              `
              : ''
          }

          <div class="profile-menu-divider"></div>

        </div>

        <!-- ==============================================
             PROFILE OPTIONS
        =============================================== -->

        <button
          type="button"
          class="profile-menu-action"
          data-switch-profile
        >
          <span class="profile-menu-icon">
            ${switchProfileIcon()}
          </span>

          <span>
            Switch Profiles
          </span>
        </button>

        <button
          type="button"
          class="profile-menu-action"
          data-manage-profiles
        >
          <span class="profile-menu-icon">
            ${manageProfileIcon()}
          </span>

          <span>
            Manage Profiles
          </span>
        </button>

        <button
          type="button"
          class="profile-menu-action"
          data-logout-profile
        >
          <span class="profile-menu-icon">
            ${logoutProfileIcon()}
          </span>

          <span>
            Log Out
          </span>
        </button>

      </div>

    </header>
  `;
}

/* =========================================================
   HERO VIDEO
========================================================= */

function renderHeroVideo(key, title) {
  return `
    <div class="hero-video-container" data-hero-video-container>

      <iframe
        id="hero-trailer"
        class="hero-youtube-frame"
        src="${youtubeEmbedUrl(key)}"
        title="${escapeHTML(title)} trailer"
        allow="autoplay; encrypted-media"
        tabindex="-1"
        scrolling="no"
        aria-hidden="true"
      ></iframe>

      <div
        class="hero-video-cover"
        data-hero-video-cover
        aria-hidden="true"
      ></div>

    </div>
  `;
}

function setupHeroTrailer() {
  const frame = app.querySelector('#hero-trailer');
  const cover = app.querySelector('[data-hero-video-cover]');

  if (!frame || !cover) return;

  clearTimer('heroRevealTimer');
  clearTimer('heroCollapseTimer');
  scheduleHeroAdvance();

  state.heroMuted = true;

  /*
   * Keep YouTube non-interactive so mouse movement can never trigger
   * YouTube's own controls. The trailer itself is still controlled through
   * postMessage by our custom mute button.
   */
  frame.style.pointerEvents = 'none';

  let revealed = false;

  const revealTrailer = () => {
    if (revealed || !frame.isConnected) return;

    revealed = true;

    frame.classList.add('visible');
    cover.classList.add('hidden');
  };

  const startTrailer = () => {
    if (!frame.isConnected) return;

    sendYouTubeCommand(frame, 'mute');
    lockYouTube1080p(frame);
    sendYouTubeCommand(frame, 'playVideo');
    scheduleHeroDescriptionCollapse();
  };

  const reinforcePlayback = () => {
    [900, 1800, 3200].forEach(delay => {
      setTimeout(startTrailer, delay);
    });
  };

  /*
   * IMPORTANT:
   * Do not rely only on the iframe "load" event. A cached YouTube iframe can
   * finish loading before this listener is attached, which was the reason the
   * trailer could stay at opacity: 0 forever.
   *
   * We therefore use BOTH:
   *   1. the normal load event
   *   2. a guaranteed fallback timer
   */
  frame.addEventListener(
    'load',
    () => {
      setTimeout(startTrailer, 200);
      reinforcePlayback();

      /*
       * Keep the backdrop over the iframe long enough for YouTube's initial
       * center pause/next overlay to disappear before revealing the trailer.
       */
      clearTimer('heroRevealTimer');

      state.heroRevealTimer = setTimeout(
        revealTrailer,
        YOUTUBE_STARTUP_COVER_DELAY
      );
    },
    { once: true }
  );

  /*
   * Autoplay is already present in the iframe URL, so this is only an extra
   * command attempt. It also covers browsers where the load event has already
   * fired by the time setupHeroTrailer() runs.
   */
  setTimeout(startTrailer, 500);
  reinforcePlayback();

  /*
   * Guaranteed reveal fallback:
   * even if the iframe load event was missed, the trailer becomes visible.
   */
  state.heroRevealTimer = setTimeout(
    revealTrailer,
    YOUTUBE_STARTUP_COVER_DELAY + 700
  );
}

function scheduleHeroAdvance() {
  clearTimer('heroAdvanceTimer');

  if (
    state.heroItems.length < 2 ||
    state.searchTerm
  ) {
    return;
  }

  state.heroAdvanceTimer = setTimeout(
    () => {
      changeHero(1);
    },
    HERO_AUTOPLAY_ADVANCE_DELAY
  );
}

function scheduleHeroDescriptionCollapse() {
  const hero =
    app.querySelector('.hero');

  if (!hero || state.heroCollapseTimer) return;

  state.heroCollapseTimer = setTimeout(
    () => {
      hero.classList.add(
        'description-collapsed'
      );
    },
    HERO_DESCRIPTION_COLLAPSE_DELAY
  );
}

/* =========================================================
   NORMAL ROWS
========================================================= */

function renderRows(rows, rowOffset = 0) {
  return rows.map(
    (row, rowIndex) => `
      <section
        class="title-row"
        data-row-title="${escapeHTML(row.title)}"
      >

        <div class="row-header">
          <h2>
            ${escapeHTML(row.title)}
          </h2>

          <div class="row-indicators">
            ${renderRailIndicators(row.items.length)}
          </div>
        </div>

        <div class="rail-container">

          <button
            class="rail-arrow rail-arrow-left"
            data-prev
          >
            ‹
          </button>

          <div class="title-rail">

            ${row.items.map(
              (item, itemIndex) =>
                renderCard(
                  item,
                  rowOffset + rowIndex,
                  itemIndex
                )
            ).join('')}

          </div>

          <button
            class="rail-arrow rail-arrow-right"
            data-next
          >
            ›
          </button>

        </div>

      </section>
    `
  ).join('');
}

function renderRailIndicators(itemCount) {
  const count =
    Math.max(
      1,
      Math.min(
        6,
        Math.ceil(itemCount / 6)
      )
    );

  return Array.from(
    { length: count },
    (_, index) =>
      `<span class="${index === 0 ? 'active' : ''}"></span>`
  ).join('');
}

/* =========================================================
   NORMAL CARD
========================================================= */

function renderCard(
  item,
  rowIndex,
  itemIndex
) {
  const mediaType =
    getMediaType(item);

  const image =
    getMediaImage(
      item,
      'backdrop',
      IMG_W500
    );

  const isContinueWatching =
    state.rows[rowIndex]?.title ===
    'Continue Watching';

  return `
    <article
      class="movie-card"

      data-card
      data-row="${rowIndex}"
      data-item="${itemIndex}"
      data-media-key="${getCacheKey(item)}"

      data-media-type="${mediaType}"
      data-media-id="${item.id}"
      data-continue-watching="${isContinueWatching ? 'true' : 'false'}"

      tabindex="0"
    >

      ${
        image
          ? `
            <img
              src="${image}"
              alt="${escapeHTML(getItemTitle(item))}"
              loading="lazy"
            />
          `
          : ''
      }

      <div
        class="card-title-logo"
        data-card-logo
      >
        ${escapeHTML(getItemTitle(item))}
      </div>

      ${
        isInProfileList(item)
          ? `
            <div
              class="card-heart-indicator"
              aria-label="Saved in My List"
            >
              ${heartIcon()}
            </div>
          `
          : ''
      }

      ${
        itemIndex % 7 === 0
          ? `
            <div class="card-labels">
              ${
                mediaType === 'tv'
                  ? `
                    <span class="new-episode">
                      New Episode
                    </span>
                  `
                  : ''
              }

              <span class="watch-now">
                Watch Now
              </span>
            </div>
          `
          : ''
      }

    </article>
  `;
}

/* =========================================================
   TOP 10
========================================================= */

function renderTop10Row() {
  if (!state.top10.length) {
    return '';
  }

  return `
    <section class="title-row top10-row">

      <div class="row-header">

        <h2>
          ${
            state.profile?.kids
              ? 'Top 10 Kids Picks'
              : 'Top 10 Movies Today'
          }
        </h2>

        <div class="row-indicators">
          ${renderRailIndicators(state.top10.length)}
        </div>

      </div>

      <div class="rail-container">

        <button
          class="rail-arrow rail-arrow-left"
          data-prev
        >
          ‹
        </button>

        <div class="title-rail top10-rail">

          ${state.top10.map(
            (item, index) =>
              renderTop10Card(
                item,
                index
              )
          ).join('')}

        </div>

        <button
          class="rail-arrow rail-arrow-right"
          data-next
        >
          ›
        </button>

      </div>

    </section>
  `;
}

function renderTop10Card(item, index) {
  const poster =
    `${IMG_W500}${item.poster_path}`;

  return `
    <article
      class="top10-card"

      data-top10-card
      data-top10-index="${index}"

      tabindex="0"
    >

      <div class="top10-card-inner">

        <div
          class="top10-number"
          aria-hidden="true"
        >
          ${renderTop10Rank(index + 1)}
        </div>

        <div class="top10-poster">

          <img
            src="${poster}"
            alt="${escapeHTML(getItemTitle(item))}"
            loading="lazy"
          />

        </div>

      </div>

    </article>
  `;
}

function renderTop10Rank(rank) {
  const rankWidth = rank > 9 ? 149 : 144;

  return `
    <svg
      viewBox="0 0 ${rankWidth} 250"
      width="${rankWidth}"
      height="250"
      aria-hidden="true"
      preserveAspectRatio="xMaxYMid meet"
    >
      <defs>
        <linearGradient
          id="top10-rank-gradient-${rank}"
          x1="0"
          y1="125"
          x2="${rankWidth}"
          y2="125"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0"
            stop-color="white"
            stop-opacity="0.62"
          />
          <stop
            offset="1"
            stop-color="white"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>

      ${rank === 10
        ? `
          <text
            x="0"
            y="220"
            font-family="Arial Black, Arial, sans-serif"
            font-size="205"
            font-weight="900"
            fill="url(#top10-rank-gradient-${rank})"
            stroke="rgba(255, 255, 255, 0.2)"
            stroke-width="2"
          >
            1
          </text>

          <text
            x="202"
            y="220"
            text-anchor="end"
            font-family="Arial Black, Arial, sans-serif"
            font-size="205"
            font-weight="900"
            fill="url(#top10-rank-gradient-${rank})"
            stroke="rgba(255, 255, 255, 0.2)"
            stroke-width="2"
          >
            0
          </text>
        `
        : `
          <text
            x="${rankWidth}"
            y="220"
            text-anchor="end"
            font-family="Arial Black, Arial, sans-serif"
            font-size="205"
            font-weight="900"
            fill="url(#top10-rank-gradient-${rank})"
            stroke="rgba(255, 255, 255, 0.2)"
            stroke-width="2"
          >
            ${rank}
          </text>
        `}
    </svg>
  `;
}

async function populateCardLogos() {
  const cards =
    Array.from(
      app.querySelectorAll('[data-card]')
    );

  await Promise.all(
    cards.map(async card => {
      const item =
        state.allItems.find(candidate =>
          String(candidate.id) ===
            card.dataset.mediaId &&
          getMediaType(candidate) ===
            card.dataset.mediaType
        );

      const logo =
        card.querySelector('[data-card-logo]');

      if (!item || !logo) return;

      try {
        const media =
          await loadMediaExtras(item);

        if (
          !card.isConnected ||
          !media.logoPath
        ) {
          return;
        }

        logo.innerHTML = `
          <img
            src="${IMG_W500}${media.logoPath}"
            alt="${escapeHTML(getItemTitle(item))}"
          />
        `;

        logo.classList.add('has-logo');
      } catch (error) {
        console.warn(
          'Card logo unavailable:',
          error
        );
      }
    })
  );
}

/* =========================================================
   HOVER PREVIEW
========================================================= */

function scheduleHoverPreview(
  card,
  item
) {
  clearTimer('hoverTimer');
  clearTimer('hoverCloseTimer');

  state.hoverTimer =
    setTimeout(() => {
      openHoverPreview(card, item);
    }, 550);
}

function scheduleCloseHoverPreview() {
  clearTimer('hoverTimer');

  state.hoverCloseTimer =
    setTimeout(() => {
      destroyHoverPreview();
    }, 180);
}

async function openHoverPreview(
  card,
  item
) {
  if (!card || !item) return;

  destroyHoverPreview(false);

  state.hoverCard = card;
  state.hoverItem = item;
  state.hoverMuted = true;
  document.body.classList.add('kofi-preview-active');

  const rect =
    card.getBoundingClientRect();

  const preview =
    document.createElement('div');

  preview.className =
    'hover-preview loading';

  preview.dataset.hoverPreview = '';
  preview.dataset.preferredTop = '';

  /*
   * Calculate Netflix-like expansion.
   */
  const width = Math.max(
    rect.width * 1.5,
    410
  );

  let left =
    rect.left -
    (width - rect.width) / 2;

  const margin = 18;

  if (left < margin) {
    left = margin;
  }

  if (
    left + width >
    window.innerWidth - margin
  ) {
    left =
      window.innerWidth -
      width -
      margin;
  }

  const top =
    rect.top -
    rect.height * 0.35;

  preview.style.width =
    `${width}px`;

  preview.style.left =
    `${left}px`;

  preview.style.top =
    `${top}px`;

  preview.dataset.preferredTop =
    String(top);

  const fallbackImage =
    getMediaImage(
      item,
      'backdrop',
      IMG_W780
    );

  preview.innerHTML = `
    <div class="hover-preview-media">

      ${
        fallbackImage
          ? `
            <img
              class="hover-preview-fallback"
              src="${fallbackImage}"
              alt=""
            />
          `
          : ''
      }

      <div
        class="hover-preview-video"
        data-preview-video
      ></div>

      <div
        class="hover-video-loader"
        data-hover-video-loader
        aria-hidden="true"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div class="hover-preview-media-shade"></div>

      <div
        class="hover-title-placeholder"
        data-hover-logo
      >
        ${escapeHTML(getItemTitle(item))}
      </div>

      <button
        class="hover-mute-button"
        data-hover-mute
        aria-label="Unmute"
      >
        ${muteIcon(true)}
      </button>

    </div>

    <div class="hover-preview-details">

      <div class="hover-actions">

        <button
          class="hover-circle primary"
          data-hover-play
          aria-label="Play"
        >
          ${playIcon()}
        </button>

        <button
          class="hover-circle ${
            isInProfileList(item)
              ? 'saved'
              : ''
          }"
          data-hover-add
          aria-label="Add to My List"
        >
          ${
            isInProfileList(item)
              ? checkIcon()
              : plusIcon()
          }
        </button>

        <button
          class="hover-circle ${
            isInProfileList(item)
              ? 'saved'
              : ''
          }"
          data-hover-heart
          aria-label="I like this"
        >
          ${heartIcon()}
        </button>

        ${
          item.watchProgress
            ? `
              <button
                class="hover-circle hover-remove"
                data-hover-remove-progress
                aria-label="Remove from Continue Watching"
                title="Remove from Continue Watching"
              >
                ${closeIcon()}
              </button>
            `
            : ''
        }

        <button
          class="hover-circle hover-info"
          data-hover-more
          aria-label="More Info"
        >
          ${infoCircleIcon()}
        </button>

      </div>

      <div class="hover-meta">

        <span class="match">
          98% Match
        </span>

        <span
          class="hover-age"
          data-hover-age
        >
          13+
        </span>

        <span data-hover-runtime>
          HD
        </span>

        <span class="hover-hd">
          HD
        </span>

      </div>

      <div
        class="hover-genres"
        data-hover-genres
      >
        Exciting
        <i></i>
        Imaginative
        <i></i>
        Adventure
      </div>

    </div>
  `;

  document.body.appendChild(preview);

  positionHoverPreview(
    preview,
    top
  );

  requestAnimationFrame(() => {
    preview.classList.add('open');
  });

  preview.addEventListener(
    'mouseenter',
    () => {
      clearTimer('hoverCloseTimer');
    }
  );

  preview.addEventListener(
    'mouseleave',
    scheduleCloseHoverPreview
  );

  preview
    .querySelector('[data-hover-more]')
    .addEventListener(
      'click',
      event => {
        event.stopPropagation();

        destroyHoverPreview();

        openDetails(item);
      }
    );

  preview
    .querySelector('[data-hover-play]')
    .addEventListener(
      'click',
      event => {
        event.stopPropagation();

        destroyHoverPreview();

        openPlayOptions(item);
      }
    );

  preview
    .querySelector('[data-hover-add]')
    .addEventListener(
      'click',
      event => {
        event.stopPropagation();

        const result =
          saveToProfileList(item);

        event.currentTarget.classList.add(
          'saved'
        );

        event.currentTarget.innerHTML =
          checkIcon();

        showToast(
          result.added
            ? 'Added to My List'
            : 'Already saved in My List'
        );

        markCardSaved(item);

        if (state.currentView === 'list') {
          switchContentView('list');
        }
      }
    );

  preview
    .querySelector('[data-hover-heart]')
    .addEventListener(
      'click',
      event => {
        event.stopPropagation();

        const result =
          saveToProfileList(item, true);

        event.currentTarget.classList.add(
          'saved'
        );

        showToast(
          result.upgraded
            ? 'Marked as a favorite'
            : result.added
            ? 'Added to My List'
            : 'Already saved in My List'
        );

        markCardSaved(item);

        if (state.currentView === 'list') {
          switchContentView('list');
        }
      }
    );

  preview
    .querySelector('[data-hover-remove-progress]')
    ?.addEventListener(
      'click',
      event => {
        event.preventDefault();
        event.stopPropagation();

        destroyHoverPreview();
        removeWatchProgress(item);

        const content =
          app.querySelector('[data-content]');

        if (content) {
          content.innerHTML =
            renderViewContent(state.currentView);

          wireRails();
          wireCards();
          populateCardLogos();
        }

        showToast(
          'Removed from Continue Watching'
        );
      }
    );

  try {
    const media =
      await loadMediaExtras(item);

    /*
     * The user may already have moved
     * to another card while API loaded.
     */
    if (
      state.hoverItem !== item ||
      !preview.isConnected
    ) {
      return;
    }

    populateHoverPreview(
      preview,
      media
    );

    positionHoverPreview(
      preview,
      Number(preview.dataset.preferredTop)
    );
  } catch (error) {
    console.warn(
      'Hover metadata unavailable:',
      error
    );

    preview.classList.remove(
      'loading'
    );
  }
}

function positionHoverPreview(
  preview,
  preferredTop
) {
  const margin = 18;
  const minTop = 75;
  const maxTop =
    Math.max(
      minTop,
      window.innerHeight -
        preview.offsetHeight -
        margin
    );

  const safePreferredTop =
    Number.isFinite(preferredTop)
      ? preferredTop
      : minTop;

  const top =
    Math.max(
      minTop,
      Math.min(
        safePreferredTop,
        maxTop
      )
    );

  preview.style.top =
    `${top}px`;
}

function populateHoverPreview(
  preview,
  media
) {
  const { details, logoPath, trailerKey } =
    media;

  const logoContainer =
    preview.querySelector(
      '[data-hover-logo]'
    );

  /*
   * Dynamic TMDB title artwork.
   */
  if (logoPath) {
    logoContainer.innerHTML = `
      <img
        class="hover-title-logo"
        src="${IMG_W500}${logoPath}"
        alt="${escapeHTML(getItemTitle(details))}"
      />
    `;

    logoContainer.classList.add(
      'has-logo'
    );
  } else {
    logoContainer.textContent =
      getItemTitle(details);
  }

  const runtime =
    details.runtime
      ? formatRuntime(details.runtime)
      : details.number_of_seasons
        ? `${details.number_of_seasons} Season${
            details.number_of_seasons === 1
              ? ''
              : 's'
          }`
        : 'HD';

  preview.querySelector(
    '[data-hover-runtime]'
  ).textContent = runtime;

  const genres =
    (details.genres || [])
      .slice(0, 3)
      .map(genre => genre.name);

  if (genres.length) {
    preview.querySelector(
      '[data-hover-genres]'
    ).innerHTML = genres
      .map(
        genre =>
          `<span>${escapeHTML(genre)}</span>`
      )
      .join('<i></i>');
  }

  if (trailerKey) {
    startHoverTrailer(
      preview,
      trailerKey
    );
  } else {
    preview
      .querySelector(
        '[data-hover-video-loader]'
      )
      ?.classList.add('hidden');
  }

  preview.classList.remove('loading');
}

function startHoverTrailer(
  preview,
  key
) {
  const container =
    preview.querySelector(
      '[data-preview-video]'
    );

  const fallback =
    preview.querySelector(
      '.hover-preview-fallback'
    );

  if (!container) return;

  const iframe =
    document.createElement('iframe');

  iframe.className =
    'hover-youtube-frame';

  iframe.src =
    youtubeEmbedUrl(key);

  iframe.allow =
    'autoplay; encrypted-media';

  iframe.tabIndex = -1;

  container.appendChild(iframe);

  iframe.addEventListener(
    'load',
    () => {
      const startPreviewTrailer = () => {
        if (!iframe.isConnected) return;

        sendYouTubeCommand(
          iframe,
          'mute'
        );

        lockYouTube1080p(iframe);

        sendYouTubeCommand(
          iframe,
          'playVideo'
        );
      };

      [150, 900, 1800, 3200].forEach(delay => {
        setTimeout(startPreviewTrailer, delay);
      });

      /*
       * Keep image over YouTube while its
       * startup pause/player overlay exists.
       */
      setTimeout(() => {
        if (!iframe.isConnected) return;

        lockYouTube1080p(iframe);

        iframe.classList.add('visible');

        fallback?.classList.add(
          'video-ready'
        );

        preview
          .querySelector(
            '[data-hover-video-loader]'
          )
          ?.classList.add('hidden');
      }, YOUTUBE_STARTUP_COVER_DELAY);
    }
  );

  const muteButton =
    preview.querySelector(
      '[data-hover-mute]'
    );

  muteButton.onclick = event => {
    event.stopPropagation();

    state.hoverMuted =
      !state.hoverMuted;

    if (state.hoverMuted) {
      sendYouTubeCommand(
        iframe,
        'mute'
      );
    } else {
      sendYouTubeCommand(
        iframe,
        'unMute'
      );

      sendYouTubeCommand(
        iframe,
        'setVolume',
        [65]
      );

      lockYouTube1080p(iframe);

      sendYouTubeCommand(
        iframe,
        'playVideo'
      );
    }

    muteButton.innerHTML =
      muteIcon(state.hoverMuted);

    muteButton.setAttribute(
      'aria-label',
      state.hoverMuted
        ? 'Unmute'
        : 'Mute'
    );
  };
}

function destroyHoverPreview(
  resetItem = true
) {
  clearTimer('hoverTimer');
  clearTimer('hoverCloseTimer');

  const preview =
    document.querySelector(
      '[data-hover-preview]'
    );

  if (preview) {
    preview.classList.remove('open');

    setTimeout(() => {
      preview.remove();
    }, 140);
  }

  document.body.classList.remove('kofi-preview-active');

  if (resetItem) {
    state.hoverCard = null;
    state.hoverItem = null;
  }
}

/* =========================================================
   EVENTS
========================================================= */

function wireHomeEvents() {
  const nav =
    app.querySelector('[data-nav]');

  window.onscroll = () => {
    nav?.classList.toggle(
      'scrolled',
      window.scrollY > 25
    );

    destroyHoverPreview();
  };

  /* Search */

  const searchButton =
    app.querySelector('[data-search]');

  const searchBox =
    app.querySelector('[data-search-box]');

  const searchInput =
    app.querySelector(
      '[data-search-input]'
    );

  searchButton.onclick = () => {
    state.searchOpen =
      !state.searchOpen;

    searchBox.classList.toggle(
      'open',
      state.searchOpen
    );

    if (state.searchOpen) {
      searchInput.focus();
    }
  };

  searchInput.addEventListener(
    'input',
    event =>
      scheduleSearchTitles(event.target.value)
  );

  app
    .querySelectorAll('[data-nav-view]')
    .forEach(link => {
      link.addEventListener(
        'click',
        event => {
          event.preventDefault();

          const view = link.dataset.navView;

          if (view === 'games') {
            showToast('Games are still in development.');
            return;
          }

          if (view === 'languages') {
            showToast('Browse by Languages is still in development.');
            return;
          }

          switchContentView(
            view
          );
        }
      );
    });

/* =========================================================
   PROFILE MENU
========================================================= */

const profileMenuButton =
  app.querySelector(
    '[data-profile-menu-toggle]'
  );

const profileMenu =
  app.querySelector(
    '[data-profile-menu]'
  );

if (
  profileMenuButton &&
  profileMenu
) {
  const closeProfileMenu = () => {
    profileMenu.hidden = true;

    profileMenuButton.classList.remove(
      'open'
    );

    profileMenuButton.setAttribute(
      'aria-expanded',
      'false'
    );
  };

  const openProfileMenu = () => {
    profileMenu.hidden = false;

    profileMenuButton.classList.add(
      'open'
    );

    profileMenuButton.setAttribute(
      'aria-expanded',
      'true'
    );
  };

  profileMenuButton.addEventListener(
    'click',
    event => {
      event.stopPropagation();

      if (profileMenu.hidden) {
        openProfileMenu();
      } else {
        closeProfileMenu();
      }
    }
  );

  /*
   * Clicking inside the dropdown itself
   * should not trigger the outside-click
   * handler.
   */
  profileMenu.addEventListener(
    'click',
    event => {
      event.stopPropagation();
    }
  );

  /*
   * Close after selecting a mobile
   * navigation item.
   */
  profileMenu
    .querySelectorAll('[data-nav-view]')
    .forEach(link => {
      link.addEventListener(
        'click',
        () => {
          closeProfileMenu();
        }
      );
    });

  /*
   * Clicking anywhere outside closes it.
   */
  document.addEventListener(
    'click',
    event => {
      if (
        profileMenu.hidden ||
        profileMenu.contains(event.target) ||
        profileMenuButton.contains(event.target)
      ) {
        return;
      }

      closeProfileMenu();
    }
  );
}

/* =========================================================
   SWITCH PROFILE
========================================================= */

app.querySelector(
  '[data-switch-profile]'
)?.addEventListener(
  'click',
  () => {
    clearActiveProfile();

    showProfileGate(false);
  }
);

/* =========================================================
   MANAGE PROFILES
========================================================= */

app.querySelector(
  '[data-manage-profiles]'
)?.addEventListener(
  'click',
  () => {
    showProfileGate(true);
  }
);

/* =========================================================
   LOG OUT
========================================================= */

app.querySelector(
  '[data-logout-profile]'
)?.addEventListener(
  'click',
  () => {
    clearActiveProfile();
    showProfileGate(false);
  }
);

  /* Hero */

  app.querySelector(
    '[data-hero-info]'
  )?.addEventListener(
    'click',
    () => {
      if (state.hero) {
        openDetails(state.hero);
      }
    }
  );

  app.querySelector(
    '[data-hero-play]'
  )?.addEventListener(
    'click',
    () => {
      if (state.hero) {
        openPlayOptions(state.hero);
      }
    }
  );

  app.querySelector(
    '[data-hero-prev]'
  )?.addEventListener(
    'click',
    () => {
      changeHero(-1);
    }
  );

  app.querySelector(
    '[data-hero-next]'
  )?.addEventListener(
    'click',
    () => {
      changeHero(1);
    }
  );

  wireHeroMute();
  wireRails();
  wireCards();
}

async function changeHero(direction) {
  if (
    state.heroItems.length < 2 ||
    state.searchTerm
  ) return;

  const requestId =
    state.heroRequestId + 1;

  state.heroRequestId = requestId;

  clearTimer('heroRevealTimer');
  clearTimer('heroAdvanceTimer');
  clearTimer('heroCollapseTimer');
  destroyHoverPreview();

  state.heroIndex =
    (
      state.heroIndex +
      direction +
      state.heroItems.length
    ) % state.heroItems.length;

  state.hero =
    state.heroItems[state.heroIndex];

  await loadHeroTrailer();

  if (state.heroRequestId !== requestId) {
    return;
  }

  paintHome();
}

/* =========================================================
   HERO MUTE
========================================================= */

function wireHeroMute() {
  const button =
    app.querySelector(
      '[data-hero-mute]'
    );

  const iframe =
    app.querySelector(
      '#hero-trailer'
    );

  if (!button || !iframe) {
    return;
  }

  button.onclick = event => {
    event.stopPropagation();

    state.heroMuted =
      !state.heroMuted;

    if (state.heroMuted) {
      sendYouTubeCommand(
        iframe,
        'mute'
      );
    } else {
      sendYouTubeCommand(
        iframe,
        'unMute'
      );

      sendYouTubeCommand(
        iframe,
        'setVolume',
        [70]
      );

      lockYouTube1080p(iframe);

      sendYouTubeCommand(
        iframe,
        'playVideo'
      );
    }

    button.innerHTML =
      muteIcon(state.heroMuted);

    button.setAttribute(
      'aria-label',
      state.heroMuted
        ? 'Unmute'
        : 'Mute'
    );
  };
}

/* =========================================================
   RAILS
========================================================= */

function wireRails() {
  app
    .querySelectorAll('.rail-container')
    .forEach(container => {
      const rail =
        container.querySelector(
          '.title-rail'
        );

      const prev =
        container.querySelector(
          '[data-prev]'
        );

      const next =
        container.querySelector(
          '[data-next]'
        );

      const indicators =
        Array.from(
          container
            .closest('.title-row')
            ?.querySelectorAll(
              '.row-indicators span'
            ) || []
        );

      const getPageCount = () =>
        Math.max(
          1,
          Math.ceil(
            rail.scrollWidth /
              rail.clientWidth
          )
        );

      const getPage = () =>
        Math.round(
          rail.scrollLeft /
            rail.clientWidth
        );

      const updateIndicators = () => {
        const pageCount =
          getPageCount();

        const page =
          Math.min(
            getPage(),
            pageCount - 1
          );

        indicators.forEach(
          (indicator, index) => {
            indicator.hidden =
              index >= pageCount;

            indicator.classList.toggle(
              'active',
              index === page
            );
          }
        );
      };

      const scrollToPage = direction => {
        destroyHoverPreview();

        const pageCount =
          getPageCount();

        const currentPage =
          getPage();

        const nextPage =
          (
            currentPage +
            direction +
            pageCount
          ) % pageCount;

        rail.scrollTo({
          left:
            nextPage *
            rail.clientWidth,
          behavior: 'smooth'
        });

        setTimeout(
          updateIndicators,
          260
        );
      };

      prev.onclick = () => {
        scrollToPage(-1);
      };

      next.onclick = () => {
        scrollToPage(1);
      };

      rail.addEventListener(
        'scroll',
        updateIndicators,
        { passive: true }
      );

      updateIndicators();
    });
}

/* =========================================================
   CARD EVENTS
========================================================= */

function wireCards() {
  app
    .querySelectorAll('[data-card]')
    .forEach(card => {
      const rowIndex =
        Number(card.dataset.row);

      const itemIndex =
        Number(card.dataset.item);

      const item =
        state.allItems.find(candidate =>
          getCacheKey(candidate) ===
          card.dataset.mediaKey
        ) ||
        state.rows[rowIndex]?.items[itemIndex];

      if (!item) return;

      card.addEventListener(
        'mouseenter',
        () => {
          scheduleHoverPreview(
            card,
            item
          );
        }
      );

      card.addEventListener(
        'mouseleave',
        scheduleCloseHoverPreview
      );

      card.addEventListener(
        'focus',
        () => {
          scheduleHoverPreview(
            card,
            item
          );
        }
      );

      card.addEventListener(
        'blur',
        scheduleCloseHoverPreview
      );

      card.addEventListener(
        'click',
        () => {
          destroyHoverPreview();
          openDetails(item);
        }
      );
    });

  app
    .querySelectorAll(
      '[data-top10-card]'
    )
    .forEach(card => {
      const index =
        Number(
          card.dataset.top10Index
        );

      const item =
        state.top10[index];

      if (!item) return;

      card.addEventListener(
        'mouseenter',
        () => {
          scheduleHoverPreview(
            card,
            item
          );
        }
      );

      card.addEventListener(
        'mouseleave',
        scheduleCloseHoverPreview
      );

      card.addEventListener(
        'focus',
        () => {
          scheduleHoverPreview(
            card,
            item
          );
        }
      );

      card.addEventListener(
        'blur',
        scheduleCloseHoverPreview
      );

      card.addEventListener(
        'click',
        () => {
          destroyHoverPreview();
          openDetails(item);
        }
      );
    });
}

/* =========================================================
   SEARCH
========================================================= */

function scheduleSearchTitles(term) {
  clearTimeout(state.searchTimer);

  const normalized =
    term.trim();

  if (!normalized) {
    searchTitles(term);
    return;
  }

  state.searchTimer = setTimeout(
    () => searchTitles(term),
    280
  );
}

function normalizeSearchText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getSearchableText(item) {
  return normalizeSearchText(`
    ${item.title || ''}
    ${item.name || ''}
    ${item.original_title || ''}
    ${item.original_name || ''}
    ${item.overview || ''}
  `);
}

function getEditDistance(a, b) {
  const previous =
    Array.from(
      { length: b.length + 1 },
      (_, index) => index
    );

  for (let i = 1; i <= a.length; i += 1) {
    let current = [i];

    for (let j = 1; j <= b.length; j += 1) {
      current[j] =
        a[i - 1] === b[j - 1]
          ? previous[j - 1]
          : Math.min(
              previous[j - 1],
              previous[j],
              current[j - 1]
            ) + 1;
    }

    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function getLocalSearchScore(item, query) {
  const title =
    normalizeSearchText(getItemTitle(item));

  const text =
    getSearchableText(item);

  const words =
    query.split(' ').filter(Boolean);

  if (!title || !words.length) {
    return 0;
  }

  if (title === query) return 120;
  if (title.startsWith(query)) return 100;
  if (title.includes(query)) return 80;
  if (words.every(word => title.includes(word))) return 65;
  if (words.every(word => text.includes(word))) return 45;

  if (
    query.length >= 4 &&
    getEditDistance(title, query) <= 2
  ) {
    return 55;
  }

  return words.reduce(
    (score, word) =>
      text.includes(word)
        ? score + 10
        : score,
    0
  );
}

function getUniqueSearchItems(items) {
  return Array.from(
    new Map(
      items.map(item => [
        getCacheKey(item),
        item
      ])
    ).values()
  );
}

function getLocalSearchResults(query) {
  return getUniqueSearchItems(state.allItems)
    .map(item => ({
      item,
      score:
        getLocalSearchScore(item, query)
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.item)
    .slice(0, 12);
}

function mergeSearchResults(localItems, tmdbItems) {
  return getUniqueSearchItems([
    ...localItems,
    ...tmdbItems
  ]).slice(0, 36);
}

function renderSearchSkeletonRow(term) {
  return `
    <section class="title-row search-skeleton-row">

      <div class="row-header">
        <h2>
          ${escapeHTML(`Searching TMDB for "${term}"`)}
        </h2>
      </div>

      <div class="rail-container">

        <div class="title-rail">

          ${Array.from(
            { length: 12 },
            () => `
              <article
                class="movie-card search-skeleton-card"
                aria-hidden="true"
              >
                <span class="search-skeleton-shimmer"></span>
                <span class="search-skeleton-title"></span>
              </article>
            `
          ).join('')}

        </div>

      </div>

    </section>
  `;
}

async function searchTitles(term) {
  destroyHoverPreview();

  state.searchTerm =
    term.trim();

  const requestId =
    ++state.searchRequestId;

  if (state.searchTerm) {
    clearTimer('heroAdvanceTimer');
  }

  const content =
    app.querySelector(
      '[data-content]'
    );

  if (!state.searchTerm) {
    content.innerHTML =
      renderViewContent(state.currentView);

    wireRails();
    wireCards();
    populateCardLogos();
    scheduleHeroAdvance();

    return;
  }

  const query =
    normalizeSearchText(state.searchTerm);

  const localResults =
    getLocalSearchResults(query);

  if (localResults.length) {
    content.innerHTML = renderRows([
      {
        title:
          `Smart search for "${term.trim()}"`,
        items:
          localResults
      }
    ]);

    wireRails();
    wireCards();
    populateCardLogos();
  } else {
    content.innerHTML =
      renderSearchSkeletonRow(term.trim());
  }

  try {
    const responses =
      await Promise.all([
        api(
          `/search/multi?language=en-US&include_adult=false&page=1&query=${encodeURIComponent(state.searchTerm)}`
        ),
        api(
          `/search/multi?language=en-US&include_adult=false&page=2&query=${encodeURIComponent(state.searchTerm)}`
        )
      ]);

    if (
      requestId !== state.searchRequestId ||
      !state.searchTerm
    ) {
      return;
    }

    const filtered =
      responses
        .flatMap(response => response.results || [])
        .flatMap(item =>
          item.media_type === 'person'
            ? item.known_for || []
            : [item]
        )
        .filter(item =>
          ['movie', 'tv'].includes(item.media_type) &&
          (item.title || item.name) &&
          (item.backdrop_path || item.poster_path) &&
          !item.adult
        )
        .sort(
          (a, b) =>
            (b.popularity || 0) -
            (a.popularity || 0)
        )
        .slice(0, 30);

    const searchResults =
      mergeSearchResults(
        localResults,
        filtered
      );

    const mergedItems =
      new Map(
        [
          ...state.allItems,
          ...searchResults
        ].map(item => [
          getCacheKey(item),
          item
        ])
      );

    state.allItems =
      Array.from(mergedItems.values());

    const searchRow = {
      title:
        `Search results for "${term.trim()}"`,

      items:
        searchResults
    };

    /*
     * Temporarily append so renderCard's
     * row index remains valid.
     */
    state.rows.push(searchRow);

    content.innerHTML =
      renderRows(
        [searchRow],
        state.rows.length - 1
      );

    wireRails();
    wireCards();
    populateCardLogos();

    state.rows.pop();
  } catch (error) {
    console.warn(
      'TMDB search unavailable:',
      error
    );

    if (
      requestId !== state.searchRequestId ||
      localResults.length
    ) {
      return;
    }

    content.innerHTML = renderRows([
      {
        title:
          `No TMDB results for "${term.trim()}"`,
        items: []
      }
    ]);
  }
}

/* =========================================================
   DETAILS
========================================================= */

async function openDetails(item) {
  syncKofiBadge();

  const type =
    getMediaType(item);

  let details = item;
  let similar = [];
  let media = null;
  let selectedSeason = null;

  try {
    const [
      loadedMedia,
      similarResponse
    ] = await Promise.all([
      loadMediaExtras(item),

      api(
        `/${type}/${item.id}/similar?language=en-US&page=1`
      )
    ]);

    media = loadedMedia;
    details = loadedMedia.details;

    if (type === 'tv') {
      const firstSeason =
        (details.seasons || [])
          .find(season =>
            season.season_number > 0
          );

      if (firstSeason) {
        selectedSeason = await loadSeasonEpisodes(
          details.id,
          firstSeason.season_number
        );
      }
    }

    similar =
      (similarResponse.results || [])
        .filter(
          result =>
            result.backdrop_path &&
            isBrowseAllowedItem(result)
        )
        .slice(0, 6);
  } catch (error) {
    console.warn(error);
  }

  const title =
    getItemTitle(details);

  const year =
    getItemYear(details) ||
    new Date().getFullYear();

  const runtime =
    details.runtime
      ? formatRuntime(details.runtime)
      : details.number_of_seasons
        ? `${details.number_of_seasons} Seasons`
        : 'HD';

  const genres =
    (details.genres || [])
      .map(genre => genre.name)
      .join(', ') ||
    'Drama';

  const backdrop =
    getMediaImage(
      details,
      'backdrop',
      IMG_ORIGINAL
    );

  const modal =
    document.createElement('div');

  modal.className =
    'modal-backdrop';

  modal.innerHTML = `
    <section class="details-modal">

      <div
        class="modal-hero${backdrop ? '' : ' no-art'}"
        style="
          ${backdrop ? `background-image:url('${backdrop}')` : ''}
        "
      >

        <div class="modal-hero-gradient"></div>

        ${
          media?.logoPath
            ? `
              <img
                class="modal-title-logo"
                src="${IMG_W500}${media.logoPath}"
                alt="${escapeHTML(title)}"
              />
            `
            : `
              <h2 class="modal-art-title">
                ${escapeHTML(title)}
              </h2>
            `
        }

        <button
          class="modal-close"
          data-close
        >
          ×
        </button>

        <div class="modal-actions">

          <button
            class="modal-play-button"
            data-watch
            title="Play"
          >
            ${playIcon()} Play
          </button>

          <button
            class="modal-circle ${
              isInProfileList(details)
                ? 'saved'
                : ''
            }"
            data-modal-add
            aria-label="Add to My List"
            title="Add to My List"
          >
            ${
              isInProfileList(details)
                ? checkIcon()
                : plusIcon()
            }
          </button>

          <span class="modal-download-hint-wrap">
            <button
              class="modal-circle"
              data-modal-download
              aria-label="Download"
              title="Download"
            >
              ${downloadIcon()}
            </button>

            <span
              class="modal-download-hint"
              role="note"
            >
              New feature: try it out!
            </span>
          </span>

          <button
            class="modal-circle ${
              isInProfileList(details)
                ? 'saved'
                : ''
            }"
            data-modal-heart
            aria-label="I like this"
            title="I like this"
          >
            ${heartIcon()}
          </button>

        </div>

      </div>

      <div class="modal-body">

        <div class="modal-grid">

          <div>

            <div class="modal-meta">

              <span class="match">
                98% Match
              </span>

              <span>${year}</span>

              <span>${runtime}</span>

              <span>HD</span>

              <span class="age-box">
                13+
              </span>

            </div>

            <p class="modal-description">
              ${escapeHTML(
                details.overview ||
                'No description available.'
              )}
            </p>

          </div>

          <aside class="modal-side">

            <p>
              <span>Genres:</span>
              ${escapeHTML(genres)}
            </p>

            <p>
              <span>This ${
                type === 'tv'
                  ? 'Show'
                  : 'Movie'
              } Is:</span>

              Exciting, Imaginative
            </p>

          </aside>

        </div>

        ${renderEpisodeSection(
          details,
          selectedSeason
        )}

        <h3 class="more-title">
          More Like This
        </h3>

        <div class="more-grid">

          ${similar.map(result => `
            <article
              class="more-card"
              data-similar-id="${result.id}"
              data-similar-type="${getMediaType(result)}"
            >

              <div class="more-card-media">
                <img
                  src="${IMG_W500}${result.backdrop_path}"
                  alt="${escapeHTML(getItemTitle(result))}"
                />

                <strong
                  class="more-title-text card-title-logo"
                  data-more-logo
                >
                  ${escapeHTML(getItemTitle(result))}
                </strong>
              </div>

            </article>
          `).join('')}

        </div>

      </div>

    </section>
  `;

  document.body.appendChild(modal);
  openModalElement(modal);

  const downloadHint = modal.querySelector(
    '.modal-download-hint'
  );

  setTimeout(() => {
    downloadHint?.classList.add('is-hidden');
  }, 5000);

  populateSimilarLogos(modal, similar);
  wireSimilarCards(modal, similar);

  document.body.style.overflow =
    'hidden';

  const closeModal = () => {
    closeModalElement(modal, () => {
      document.body.style.overflow = '';
    });
  };

  modal
    .querySelector('[data-close]')
    .onclick = closeModal;

  modal
    .querySelector('[data-watch]')
    .onclick = () => {
      closeModal();
      openPlayOptions(details);
    };

  modal
    .querySelector('[data-modal-add]')
    .onclick = event => {
      event.stopPropagation();

      const result =
        saveToProfileList(details);

      event.currentTarget.classList.add(
        'saved'
      );

      event.currentTarget.innerHTML =
        checkIcon();

      showToast(
        result.added
          ? 'Added to My List'
          : 'Already saved in My List'
      );

      markCardSaved(details);
    };

  modal
    .querySelector('[data-modal-heart]')
    .onclick = event => {
      event.stopPropagation();

      const result =
        saveToProfileList(details, true);

      event.currentTarget.classList.add(
        'saved'
      );

      showToast(
        result.upgraded
          ? 'Marked as a favorite'
          : result.added
          ? 'Added to My List'
          : 'Already saved in My List'
      );

      markCardSaved(details);
    };

  modal
    .querySelector('[data-modal-download]')
    .onclick = event => {
      event.stopPropagation();

      showToast('Try this new Feature!');

      openDownloadModal(details, {
        app,
        container: modal,
        api,
        getMediaType,
        escapeHTML,
        chevronDownIcon,
        IMG_W500,
        selectedSeason:
          getMediaType(details) === 'tv'
            ? null
            : selectedSeason,
        selectedEpisode: 1,
        episodeTitle:
          getMediaType(details) === 'tv'
            ? ''
            : title
      });
    };

  const seasonMenu =
    modal.querySelector('[data-season-menu]');
  const seasonWrap =
    modal.querySelector('.season-select-wrap');

  modal
    .querySelector('[data-season-toggle]')
    ?.addEventListener('click', event => {
      event.stopPropagation();

      seasonMenu?.classList.toggle('open');
      seasonWrap?.classList.toggle(
        'open',
        seasonMenu?.classList.contains('open')
      );
    });

  modal
    .querySelectorAll('[data-season-option]')
    .forEach(button => {
      button.addEventListener(
        'click',
        async event => {
          event.stopPropagation();

          seasonMenu?.classList.remove('open');
          seasonWrap?.classList.remove('open');

          const season =
            await loadSeasonEpisodes(
              details.id,
              Number(button.dataset.seasonOption)
            );

          const list =
            modal.querySelector(
              '[data-episode-list]'
            );

          const label =
            modal.querySelector(
              '[data-season-label]'
            );

          if (label) {
            label.textContent =
              button.textContent.trim();
          }

          modal
            .querySelectorAll('[data-season-option]')
            .forEach(option => {
              option.classList.toggle(
                'active',
                option === button
              );
            });

          if (list) {
            list.innerHTML =
              renderEpisodes(
                season?.episodes || [],
                season?.season_number ||
                  Number(button.dataset.seasonOption)
              );
          }
        }
      );
    });

  /*
   * Episode cards are handled with event delegation so the same listener
   * continues to work after the user changes seasons and the episode list
   * is replaced in-place.
   */
  modal.addEventListener(
    'click',
    event => {
      const episodeCard = event.target.closest(
        '[data-episode-number]'
      );

      if (episodeCard) {
        event.stopPropagation();

        const seasonNumber = Number(
          episodeCard.dataset.episodeSeason || 1
        );

        const episodeNumber = Number(
          episodeCard.dataset.episodeNumber || 1
        );

        closeModal();

        openPlayOptions({
          ...details,
          watchSeason: seasonNumber,
          watchEpisode: episodeNumber
        });

        return;
      }

      if (event.target === modal) {
        closeModal();
        return;
      }

      seasonMenu?.classList.remove('open');
      seasonWrap?.classList.remove('open');
    }
  );

  const escapeHandler = event => {
    if (event.key === 'Escape') {
      closeModal();

      window.removeEventListener(
        'keydown',
        escapeHandler
      );
    }
  };

  window.addEventListener(
    'keydown',
    escapeHandler
  );
}

function wireSimilarCards(modal, similar) {
  modal
    .querySelectorAll('[data-similar-id]')
    .forEach(card => {
      const item = similar.find(candidate =>
        String(candidate.id) === card.dataset.similarId &&
        getMediaType(candidate) === card.dataset.similarType
      );

      if (!item) return;

      card.addEventListener('mouseenter', () => {
        scheduleHoverPreview(card, item);
      });

      card.addEventListener('mouseleave', scheduleCloseHoverPreview);

      card.addEventListener('focus', () => {
        scheduleHoverPreview(card, item);
      });

      card.addEventListener('blur', scheduleCloseHoverPreview);

      card.addEventListener('click', event => {
        event.stopPropagation();
        destroyHoverPreview();
        openDetails(item);
      });
    });
}

async function populateSimilarLogos(modal, similar) {
  await Promise.all(
    similar.map(async item => {
      const card = Array.from(
        modal.querySelectorAll('[data-similar-id]')
      ).find(candidate =>
        candidate.dataset.similarId === String(item.id) &&
        candidate.dataset.similarType === getMediaType(item)
      );

      const title = card?.querySelector('[data-more-logo]');

      if (!title) return;

      try {
        const media = await loadMediaExtras(item);

        if (!title.isConnected || !media.logoPath) return;

        title.innerHTML = `
          <img
            src="${IMG_W500}${media.logoPath}"
            alt="${escapeHTML(getItemTitle(item))}"
          />
        `;

        title.classList.add('has-logo');
      } catch (error) {
        console.warn(
          'Similar title logo unavailable:',
          error
        );
      }
    })
  );
}

async function loadSeasonEpisodes(
  tvId,
  seasonNumber
) {
  try {
    return await api(
      `/tv/${tvId}/season/${seasonNumber}?language=en-US`
    );
  } catch (error) {
    console.warn(
      'Season episodes unavailable:',
      error
    );

    return null;
  }
}

function renderEpisodeSection(
  details,
  selectedSeason
) {
  if (!details.number_of_seasons) {
    return '';
  }

  const seasons =
    (details.seasons || [])
      .filter(season =>
        season.season_number > 0
      );

  if (!seasons.length) {
    return '';
  }

  const episodes =
    selectedSeason?.episodes || [];

  return `
    <section class="episode-section">

      <div class="episode-header">
        <h3>Episodes</h3>

        <span class="season-select-wrap">
          <button
            class="season-select-button"
            data-season-toggle
          >
            <span data-season-label>
              ${escapeHTML(
                selectedSeason?.name ||
                seasons[0]?.name ||
                'Season 1'
              )}
            </span>

            ${chevronDownIcon()}
          </button>

          <span
            class="season-menu"
            data-season-menu
          >
            ${seasons.map(season => `
              <button
                type="button"
                data-season-option="${season.season_number}"
                class="${
                  season.season_number ===
                  selectedSeason?.season_number
                    ? 'active'
                    : ''
                }"
              >
                ${escapeHTML(season.name)}
              </button>
            `).join('')}
          </span>
        </span>
      </div>

      <div
        class="episode-list"
        data-episode-list
      >
        ${renderEpisodes(
          episodes,
          selectedSeason?.season_number || seasons[0]?.season_number || 1
        )}
      </div>

    </section>
  `;
}

function renderEpisodes(episodes, seasonNumber = 1) {
  if (!episodes.length) {
    return `
      <p class="episode-empty">
        Episodes are not available yet.
      </p>
    `;
  }

  return episodes.map(episode => {
    const still =
      episode.still_path
        ? `${IMG_W500}${episode.still_path}`
        : '';

    return `
      <button
        type="button"
        class="episode-card"
        data-episode-number="${episode.episode_number}"
        data-episode-season="${seasonNumber}"
        aria-label="Play ${escapeHTML(episode.name || `Episode ${episode.episode_number}`)}"
      >
        <span class="episode-number">
          ${episode.episode_number}
        </span>

        ${
          still
            ? `
              <img
                src="${still}"
                alt="${escapeHTML(episode.name)}"
              />
            `
            : '<span class="episode-still-empty"></span>'
        }

        <div class="episode-copy">
          <div>
            <strong>
              ${escapeHTML(episode.name)}
            </strong>

            <span>
              ${formatRuntime(episode.runtime)}
            </span>
          </div>

          <p>
            ${escapeHTML(
              episode.overview ||
              'No episode description available.'
            )}
          </p>
        </div>
      </button>
    `;
  }).join('');
}

function getAgeRating(item) {
  const rating =
    item?.content_rating ||
    item?.release_dates?.results
      ?.find(result => result.iso_3166_1 === 'US')
      ?.release_dates
      ?.find(release => release.certification)
      ?.certification ||
    item?.content_ratings?.results
      ?.find(result => result.iso_3166_1 === 'US')
      ?.rating ||
    '';

  if (/^(R|NC-17|TV-MA)$/i.test(rating)) return '18+';
  if (/^(PG-13|TV-14)$/i.test(rating)) return '16+';
  if (/^(PG|TV-PG)$/i.test(rating)) return '13+';
  if (/^(G|TV-G|TV-Y|TV-Y7)$/i.test(rating)) return '7+';

  return state.profile?.isKids ? '7+' : '16+';
}

function getWatchUrl(item, server) {
  const type =
    getMediaType(item);

  const season =
    item.watchSeason || 1;

  const episode =
    item.watchEpisode || 1;

  return type === 'tv'
    ? server.tv(item.id, season, episode)
    : server.movie(item.id);
}

async function openPlayOptions(item) {
  syncKofiBadge();
  destroyHoverPreview();
  clearTimer('heroAdvanceTimer');
  clearTimer('heroCollapseTimer');

  await openPreWatchPage(item, {
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
    escapeHTML,
    chevronLeftIcon,
    chevronDownIcon,
    IMG_ORIGINAL,
    IMG_W500,
    onBack: () => {
      paintHome();

      if (state.currentView !== 'home') {
        switchContentView(state.currentView);
      }
    }
  });
}

async function openWatch(item) {
  destroyHoverPreview();
  clearTimer('heroAdvanceTimer');
  clearTimer('heroCollapseTimer');

  const title =
    getItemTitle(item);

  const server =
    getSelectedWatchServer();

  const rating =
    getAgeRating(item);

  const iframeUrl =
    getWatchUrl(item, server);

  saveWatchProgress(item, {
    serverId: server.id,
    startedAt: Date.now()
  });

  app.innerHTML = `
    <section class="watch-screen">
      <button
        class="watch-back"
        data-watch-back
      >
        ${chevronLeftIcon()} Back
      </button>

      <button
        class="watch-server-button"
        data-server-picker
      >
        Server: ${escapeHTML(server.name)}
      </button>

      <div
        class="watch-rating-badge"
        data-watch-rating
      >
        ${escapeHTML(rating)}
      </div>

      <div class="watch-player">
        <iframe
          class="watch-frame"
          src="${iframeUrl}"
          title="${escapeHTML(title)}"
          allow="autoplay; encrypted-media; fullscreen *; picture-in-picture"
          allowfullscreen
          webkitallowfullscreen
          mozallowfullscreen
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
    </section>
  `;

  syncKofiBadge();

  setTimeout(() => {
    app
      .querySelector('[data-watch-rating]')
      ?.classList.add('hidden');
  }, 5200);

  app
    .querySelector('[data-watch-back]')
    .onclick = () => {
      paintHome();
    };

  app
    .querySelector('[data-server-picker]')
    .onclick = () => {
      openServerPicker(item);
    };
}

function openServerPicker(item) {
  const activeServer =
    getSelectedWatchServer();

  const modal =
    document.createElement('div');

  modal.className = 'server-modal-overlay';

  modal.innerHTML = `
    <div class="server-modal">
      <button
        class="server-modal-close"
        data-server-close
        aria-label="Close"
      >
        ${icons.close}
      </button>

      <h2>Choose Server</h2>

      <p>
        If playback is slow or unavailable, switch to another server.
      </p>

      <div class="server-modal-grid">
        ${WATCH_SERVERS.map(server => `
          <button
            class="server-choice ${server.id === activeServer.id ? 'active' : ''}"
            data-server-id="${server.id}"
          >
            <span>${escapeHTML(server.name)}</span>
            ${server.id === activeServer.id ? checkIcon() : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  openModalElement(modal);

  const close = () => closeModalElement(modal);

  modal
    .querySelector('[data-server-close]')
    .onclick = close;

  modal
    .querySelectorAll('[data-server-id]')
    .forEach(button => {
      button.onclick = () => {
        setSelectedWatchServer(button.dataset.serverId);
        close();
        openWatch(item);
      };
    });
}

/* =========================================================
   FORMAT
========================================================= */

function formatRuntime(minutes) {
  if (!minutes) return 'HD';

  const hours =
    Math.floor(minutes / 60);

  const mins =
    minutes % 60;

  if (!hours) {
    return `${mins}m`;
  }

  return `${hours}h ${mins}m`;
}

/* =========================================================
   SVG ICONS
========================================================= */

function playIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M8 5v14l11-7L8 5z"
        fill="currentColor"
      />
    </svg>
  `;
}

function plusIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function heartIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M20.4 6.6a5 5 0 0 0-7.1 0L12 7.9l-1.3-1.3a5 5 0 0 0-7.1 7.1L12 22l8.4-8.3a5 5 0 0 0 0-7.1z"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
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

function chevronLeftIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M15 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function infoCircleIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <path
        d="M12 10.5v5.2"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <circle
        cx="12"
        cy="7.7"
        r="1.1"
        fill="currentColor"
      />
    </svg>
  `;
}

function checkIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M5 12.5l4.2 4.2L19 7"
        fill="none"
        stroke="currentColor"
        stroke-width="2.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function closeIcon() {
  return `
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function muteIcon(muted) {
  return muted
    ? `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill="currentColor"
        />
        <path
          d="M17 9l4 4m0-4l-4 4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `
    : `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill="currentColor"
        />
        <path
          d="M16 8.5c1.2 1 1.2 6 0 7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M18.5 6c3 2.8 3 9.2 0 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    `;
}
function homeMenuIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function showsMenuIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <path
        d="m9 9 6 3-6 3z"
        fill="currentColor"
      />
    </svg>
  `;
}

function moviesMenuIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="6"
        width="18"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <path
        d="M3 10h18M7 6l2 4m4-4 2 4m4-4 2 4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      />
    </svg>
  `;
}

function gamesMenuIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 9h10a4 4 0 0 1 3.7 5.5l-1 2.5a2.5 2.5 0 0 1-4.2.7L14 16h-4l-1.5 1.7a2.5 2.5 0 0 1-4.2-.7l-1-2.5A4 4 0 0 1 7 9Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
      />

      <path
        d="M8 12v4m-2-2h4"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />

      <circle cx="16.5" cy="13" r="1" fill="currentColor"/>
      <circle cx="18.5" cy="15" r="1" fill="currentColor"/>
    </svg>
  `;
}

function popularMenuIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 16 5-5 4 4 7-8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M16 7h4v4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function listMenuIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 5v14l6-4 6 4V5z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function languageMenuIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <path
        d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      />
    </svg>
  `;
}

function kidsMenuIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      />

      <circle cx="9" cy="10" r="1" fill="currentColor"/>
      <circle cx="15" cy="10" r="1" fill="currentColor"/>

      <path
        d="M9 15c1.7 1.3 4.3 1.3 6 0"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function switchProfileIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="9"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
      />

      <path
        d="M3.5 18c.8-3 2.7-4.5 5.5-4.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />

      <path
        d="m15 9 4-2v4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M19 7a6 6 0 0 1-1 9"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function manageProfileIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="10"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
      />

      <path
        d="M4 19c.5-3.6 2.5-5.4 6-5.4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />

      <path
        d="m15 15 4-4 2 2-4 4-3 1z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function logoutProfileIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 5H5v14h9"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <path
        d="M11 12h9m-3-3 3 3-3 3"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function searchIcon() {
  return `
    <svg viewBox="0 0 24 24">
      <circle
        cx="10.8"
        cy="10.8"
        r="6.8"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      <path
        d="M16 16l5 5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function bellIcon() {
  return `
    <svg viewBox="0 0 24 24">
      <path
        d="
          M6 17h12
          l-1.5-2
          v-4
          a4.5 4.5 0 0 0-9 0
          v4
          L6 17z
        "
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linejoin="round"
      />

      <path
        d="M10 20h4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  `;
}

/* =========================================================
   START
========================================================= */

function startApp() {
  const session =
    getActiveProfileSession();

  const profiles =
    getProfiles();

  const activeProfile =
    profiles.find(
      profile =>
        profile.id === session?.profileId
    );

  if (activeProfile) {
    state.profile = activeProfile;
    renderHome();
    return;
  }

  clearActiveProfile();
  showProfileGate(false);
}

startApp();
