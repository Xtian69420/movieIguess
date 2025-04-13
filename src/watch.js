const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');
const seriesId = urlParams.get('seriesId');
const type = urlParams.get('type');

console.log("Movie ID:", movieId);
console.log("Series ID:", seriesId);
console.log("Type:", type);

const API_KEY = '97df57ffd9278a37bc12191e00332053';
let currentServerUrl = 'https://player.videasy.net/embed/';

const servers = [
    { name: 'Netflix', url: 'https://player.videasy.net/embed/' },
    { name: 'WatchTogether', url: 'https://vidjoy.pro/embed/' },
    { name: 'Vidsrc-1', url: 'https://vidsrc.to/embed/' },
    { name: 'Vidsrc-2', url: 'https://vidsrc.me/embed/' },
    { name: 'Premium', url: 'https://111movies.com/' },
    { name: 'Multi-embed', url: 'https://www.vidsrc.wtf/api/3/' }
];

if (type === "movie" && movieId) {
    WatchMovie(movieId);
} else if (type === "tv" && seriesId) {
    WatchTV(seriesId);
} else {
    document.querySelector('.container').innerHTML = `<p>Error: Invalid or missing ID.</p>`;
}

async function WatchMovie(movieId) {
    console.log("Fetching Movie:", movieId);

    let embedUrl;

    if (currentServerUrl === 'https://player.videasy.net/embed/') {
        embedUrl = `https://player.videasy.net/movie/${movieId}`;
    } else if (currentServerUrl === 'https://111movies.com/') {
        embedUrl = `https://111movies.com/movie/${movieId}`;
    } else if (currentServerUrl === 'https://www.vidsrc.wtf/api/3/') {
        embedUrl = `https://www.vidsrc.wtf/api/3/movie/?id=${movieId}`;
    } else {
        embedUrl = `${currentServerUrl}movie/${movieId}`;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error(`Failed to fetch movie data (Status: ${response.status})`);

        const movie = await response.json();
        const genres = movie.genres?.map(genre => genre.name).join(', ') || 'N/A';
        const homepage = movie.homepage ? `<a href="${movie.homepage}" target="_blank">${movie.homepage}</a>` : "No official website";

        document.querySelector('.container').innerHTML = `
            <h1>${movie.title}</h1>
            <p><em>${movie.tagline || "No tagline available"}</em></p>
            <div class="video-container">
                <iframe id="video-player" src="${embedUrl}" width="100%" height="100%" frameborder="0" allowfullscreen scrolling="no"></iframe>
            </div>
            <div class="server-selection">
                <h3>Choose a Server:</h3>
                ${servers.map((server, index) => `
                    <button class="${server.url === currentServerUrl ? 'active' : ''}" 
                            onclick="changeServer('${server.url}', 'movie/${movieId}', ${index}, 'movie')">
                        ${server.name}
                    </button>
                `).join(' ')}                
            </div>
            <div class="movie-details">
                <p><strong>Overview:</strong> ${movie.overview || "No overview available."}</p>
                <p><strong>Release Date:</strong> ${movie.release_date || "N/A"}</p>
                <p><strong>Rating:</strong> ${movie.vote_average} / 10 (${movie.vote_count} votes)</p>
                <p><strong>Genres:</strong> ${genres}</p>
                <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                <p><strong>Homepage:</strong> ${homepage}</p>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching movie:", error);
        document.querySelector('.container').innerHTML = `<p>Error loading movie details.</p>`;
    }
}

async function WatchTV(seriesId) {
    console.log("Fetching TV Series:", seriesId);

    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error(`Failed to fetch TV show data`);

        const series = await response.json();
        const genres = series.genres?.map(genre => genre.name).join(', ') || 'N/A';
        const homepage = series.homepage ? `<a href="${series.homepage}" target="_blank">${series.homepage}</a>` : "No official website";

        let seasonButtonsHTML = "";
        series.seasons.forEach(season => {
            if (season.season_number !== 0) {
                seasonButtonsHTML += `<button id="season-${season.season_number}" onclick="loadSeason(${seriesId}, ${season.season_number}, event)">Season ${season.season_number}</button>`;
            }
        });

        document.querySelector('.container').innerHTML = `
            <h1>${series.name}</h1>
            <p><em>${series.tagline || "No tagline available"}</em></p>
            <div class="video-container">
                <iframe id="video-player" width="100%" height="100%" frameborder="0" allowfullscreen scrolling="no"></iframe>
            </div>
            <div class="server-selection">
                <h3>Choose a Server:</h3>
                ${servers.map((server, index) => `<button class="${index === 0 ? 'active' : ''}" onclick="changeServer('${server.url}', 'tv/${seriesId}', ${index}, 'tv')">${server.name}</button>`).join(' ')}
            </div>
            <div class="movie-details">
                <p><strong>Overview:</strong> ${series.overview || "No overview available."}</p>
                <p><strong>First Air Date:</strong> ${series.first_air_date || "N/A"}</p>
                <p><strong>Last Air Date:</strong> ${series.last_air_date || "N/A"}</p>
                <p><strong>Rating:</strong> ${series.vote_average} / 10 (${series.vote_count} votes)</p>
                <p><strong>Genres:</strong> ${genres}</p>
                <p><strong>Seasons:</strong> ${series.number_of_seasons}, Episodes: ${series.number_of_episodes}</p>
                <p><strong>Homepage:</strong> ${homepage}</p>
            </div>
            <div class="season-buttons">
                <h3>Select a Season:</h3>
                ${seasonButtonsHTML}
            </div>
            <div class="episode-buttons"></div>
        `;

        const firstSeason = series.seasons.find(season => season.season_number !== 0);
        if (firstSeason) {
            loadSeason(seriesId, firstSeason.season_number);
        }

    } catch (error) {
        console.error("Error fetching TV show:", error);
        document.querySelector('.container').innerHTML = `<p>Error loading TV show details.</p>`;
    }
}

async function changeServer(serverUrl, contentPath, serverIndex, contentType) {
    currentServerUrl = serverUrl;

    const serverButtons = document.querySelectorAll('.server-selection button');
    serverButtons.forEach(button => button.classList.remove('active'));
    serverButtons[serverIndex].classList.add('active');

    if (contentType === 'movie' && movieId) {
        WatchMovie(movieId);
    } else if (contentType === 'tv' && seriesId) {
        const activeEpisode = document.querySelector('.episode-buttons button.active');
        const seasonNumber = parseInt(document.querySelector('.season-buttons button.active')?.innerText.replace('Season ', '')) || 1;
        const episodeNumber = parseInt(activeEpisode?.innerText.replace('Episode ', '')) || 1;
        watchEpisode(seriesId, seasonNumber, episodeNumber); // Reload the episode with the new server
    }
}

async function loadSeason(seriesId, seasonNumber, event = null) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error(`Failed to load season ${seasonNumber}`);

        const seasonData = await response.json();
        let episodesHTML = "";

        seasonData.episodes.forEach(episode => {
            episodesHTML += `<button id="episode-${episode.episode_number}" onclick="watchEpisode(${seriesId}, ${seasonNumber}, ${episode.episode_number})">Episode ${episode.episode_number}</button>`;
        });

        document.querySelector('.episode-buttons').innerHTML = `
            <h3>Select an Episode:</h3>
            ${episodesHTML}
        `;

        if (seasonData.episodes.length > 0) {
            watchEpisode(seriesId, seasonNumber, seasonData.episodes[0].episode_number);
        }

        document.querySelectorAll('.season-buttons button').forEach(btn => btn.classList.remove('active'));
        if (event?.target) event.target.classList.add('active');

    } catch (err) {
        console.error(err);
        document.querySelector('.episode-buttons').innerHTML = `<p>Failed to load episodes for Season ${seasonNumber}.</p>`;
    }
}

async function watchEpisode(seriesId, seasonNumber, episodeNumber) {
    console.log(`Watching TV Series ${seriesId}, Season ${seasonNumber}, Episode ${episodeNumber}`);

    let embedUrl;

    if (currentServerUrl === 'https://player.videasy.net/embed/') {
        embedUrl = `https://player.videasy.net/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    } else if (currentServerUrl === `https://111movies.com/`) {
        embedUrl = `https://111movies.com/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    } else if (currentServerUrl === 'https://www.vidsrc.wtf/api/3/') {
        embedUrl = `https://www.vidsrc.wtf/api/3/tv/?id=${seriesId}&s=${seasonNumber}&e=${episodeNumber}`;
    }
    else {
        embedUrl = `${currentServerUrl}tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    }

    const player = document.getElementById('video-player');
    if (player) player.src = embedUrl;

    const titleElement = document.querySelector('h1');
    if (titleElement) {
        const baseTitle = titleElement.innerText.split(' -')[0];
        titleElement.innerText = `${baseTitle} - Episode ${episodeNumber}`;
    }

    document.querySelectorAll('.episode-buttons button').forEach(btn => btn.classList.remove('active'));
    const selectedButton = document.getElementById(`episode-${episodeNumber}`);
    if (selectedButton) selectedButton.classList.add('active');
}