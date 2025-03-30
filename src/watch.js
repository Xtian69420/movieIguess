const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');

async function WatchMovie(movieId) {
    if (!movieId) {
        document.querySelector('.container').innerHTML = `<p>Error: Movie ID not found.</p>`;
        return;
    }

    const embedUrl = `https://vidsrc.icu/embed/movie/${movieId}`;
    const API_KEY = '97df57ffd9278a37bc12191e00332053';

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch movie data");
        }

        const movie = await response.json();
        const genres = movie.genres?.map(genre => genre.name).join(', ') || 'N/A';
        const homepage = movie.homepage ? `<a href="${movie.homepage}" target="_blank">${movie.homepage}</a>` : "No official website";

        document.querySelector('.container').innerHTML = `
            <div>
                <h1>${movie.title}</h1>
                <p><em>${movie.tagline || "No tagline available"}</em></p>
            </div>
            <main>
                <div class="video-container">
                    <iframe src="${embedUrl}" width="800" height="450" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="movie-details">
                    <p><strong>Overview:</strong> ${movie.overview || "No overview available."}</p>
                    <p><strong>Release Date:</strong> ${movie.release_date || "N/A"}</p>
                    <p><strong>Rating:</strong> ${movie.vote_average} / 10 (${movie.vote_count} votes)</p>
                    <p><strong>Genres:</strong> ${genres}</p>
                    <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                    <p><strong>Homepage:</strong> ${homepage}</p>
                </div>
            </main>
        `;
    } catch (error) {
        console.error("Error fetching movie:", error);
        document.querySelector('.container').innerHTML = `<p>Error loading movie details.</p>`;
    }
}

// Call the function with movieId
WatchMovie(movieId);
