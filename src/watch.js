const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');
const seriesId = urlParams.get('seriesId');
const type = urlParams.get('type');

console.log("Movie ID:", movieId);
console.log("Series ID:", seriesId);
console.log("Type:", type);

const API_KEY = '97df57ffd9278a37bc12191e00332053';

if (type === "movie" && movieId) {
    WatchMovie(movieId);
} else if (type === "tv" && seriesId) {
    WatchTV(seriesId);
} else {
    document.querySelector('.container').innerHTML = `<p>Error: Invalid or missing ID.</p>`;
}

async function WatchMovie(movieId) {
    console.log("Fetching Movie:", movieId);

    const embedUrl = `https://vidsrc.icu/embed/movie/${movieId}?seekto=480`;  // Use seekto=480 for 8 minutes  // Use t=480s for 8 minutes

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
                <iframe src="${embedUrl}" width="800" height="450" frameborder="0" allowfullscreen scrolling="no"></iframe>
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
        const episodes = series.number_of_episodes;
        const seasonNumber = series.seasons[0]?.season_number || 1;

        let episodesHTML = "";
        for (let i = 1; i <= episodes; i++) {
            episodesHTML += `
                <button onclick="watchEpisode(${seriesId}, ${seasonNumber}, ${i})">Episode ${i}</button>
            `;
        }

        document.querySelector('.container').innerHTML = `
            <h1>${series.name}</h1>
            <p><em>${series.tagline || "No tagline available"}</em></p>
            <div class="video-container">
                <iframe id="video-player" src="https://vidsrc.icu/embed/tv/${seriesId}/${seasonNumber}/1" width="800" height="450" frameborder="0" allowfullscreen scrolling="no"></iframe>
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
            <div class="episode-buttons">
                <h3>Select an Episode:</h3>
                ${episodesHTML}
            </div>
        `;
    } catch (error) {
        console.error("Error fetching TV show:", error);
        document.querySelector('.container').innerHTML = `<p>Error loading TV show details.</p>`;
    }
}

function watchEpisode(seriesId, seasonNumber, episodeNumber) {
    console.log(`Watching TV Series ${seriesId}, Season ${seasonNumber}, Episode ${episodeNumber}`);

    const embedUrl = `https://vidsrc.icu/embed/tv/${seriesId}/${seasonNumber}/${episodeNumber}`;
    document.getElementById('video-player').src = embedUrl;  
}
