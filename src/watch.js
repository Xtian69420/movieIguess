const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');
const seriesId = urlParams.get('seriesId');
const type = urlParams.get('type');

console.log("Movie ID:", movieId);
console.log("Series ID:", seriesId);
console.log("Type:", type);

const API_KEY = '97df57ffd9278a37bc12191e00332053';

const servers = [
    { name: 'Netflix', url: 'https://player.videasy.net/embed/' },
    { name: 'Vidsrc-1', url: 'https://vidsrc.to/embed/' },
    { name: 'Vidsrc-2', url: 'https://vidsrc.icu/embed/' },
    { name: '2embed', url: 'https://2embed.org/embed/' },
    { name: 'multiembed-1', url: 'https://multiembed.mov/embed/' },
    { name: 'multiembed-2', url: 'https://multiembed.to/embed/' }
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

    const embedUrl = `https://player.videasy.net/movie/${movieId}`; // Default URL for movies

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch movie data (Status: ${response.status})`);
        }

        const movie = await response.json();
        console.log("Movie Data:", movie);

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
                ${servers.map((server, index) => `<button class="${index === 0 ? 'active' : ''}"onclick="changeServer('${server.url}', 'movie/${movieId}', ${index})">${server.name}</button>`).join(' ')}
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

        if (!response.ok) {
            throw new Error(`Failed to fetch TV show data (Status: ${response.status})`);
        }

        const series = await response.json();
        console.log("TV Series Data:", series);

        const genres = series.genres?.map(genre => genre.name).join(', ') || 'N/A';
        const homepage = series.homepage ? `<a href="${series.homepage}" target="_blank">${series.homepage}</a>` : "No official website";

        let seasonButtonsHTML = "";
        series.seasons.forEach(season => {
            if (season.season_number !== 0) { // skip specials
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
                ${servers.map((server, index) => `<button class="${index === 0 ? 'active' : ''}"onclick="changeServer('${server.url}', 'tv/${seriesId}', ${index})">${server.name}</button>`).join(' ')}
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
            <div class="episode-buttons">
                <h3>Select an Episode:</h3>
                <!-- Episodes will be loaded here -->
            </div>
        `;

        const firstSeason = series.seasons.find(season => season.season_number !== 0);
        if (firstSeason) {
            loadSeason(seriesId, firstSeason.season_number);

            setTimeout(() => {
                const firstSeasonButton = document.getElementById(`season-${firstSeason.season_number}`);
                if (firstSeasonButton) {
                    firstSeasonButton.classList.add('active');
                }
            }, 100); 
        }

    } catch (error) {
        console.error("Error fetching TV show:", error);
        document.querySelector('.container').innerHTML = `<p>Error loading TV show details.</p>`;
    }
}

function changeServer(serverUrl, contentPath, serverIndex) {
    let embedUrl;
    if (serverUrl === 'https://player.videasy.net/embed/') {
        embedUrl = `https://player.videasy.net/${contentPath}`;
    } else {
        embedUrl = `${serverUrl}${contentPath}`;
    }

    const player = document.getElementById('video-player');
    if (player) {
        player.src = embedUrl;
    }
    const serverButtons = document.querySelectorAll('.server-selection button');
    serverButtons.forEach(button => button.classList.remove('active'));
    serverButtons[serverIndex].classList.add('active');
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
        if (event?.target) {
            event.target.classList.add('active');
        }

    } catch (err) {
        console.error(err);
        document.querySelector('.episode-buttons').innerHTML = `<p>Failed to load episodes for Season ${seasonNumber}.</p>`;
    }
}

function watchEpisode(seriesId, seasonNumber, episodeNumber) {
    console.log(`Watching TV Series ${seriesId}, Season ${seasonNumber}, Episode ${episodeNumber}`);

    const embedUrl = `https://player.videasy.net/tv/${seriesId}/${seasonNumber}/${episodeNumber}`; // Default to player.videasy.net
    const player = document.getElementById('video-player');
    if (player) {
        player.src = embedUrl;
    }

    const titleElement = document.querySelector('h1');
    if (titleElement) {
        const baseTitle = titleElement.innerText.split(' -')[0];
        titleElement.innerText = `${baseTitle} - Episode ${episodeNumber}`;
    }

    const allButtons = document.querySelectorAll('.episode-buttons button');
    allButtons.forEach(button => button.classList.remove('active'));

    const selectedButton = document.getElementById(`episode-${episodeNumber}`);
    if (selectedButton) selectedButton.classList.add('active');
}
