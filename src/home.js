async function Home() {
    const API_KEY = '97df57ffd9278a37bc12191e00332053';
    const container = document.querySelector('.movie-container');
    if (!container) {
        console.error('Container with class "movie-container" not found in the document.');
        return;
    }

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`);
        const data = await response.json();
        console.log(data);
        data.results.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';

            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="movie-poster">
                <h2 class="movie-title">${movie.title}</h2>
                <p class="movie-overview">${movie.overview.substring(0, 100)}...</p>
                <p class="movie-release-date"><strong>Release Date:</strong> ${movie.release_date}</p>
                <p class="movie-rating"><strong>Rating:</strong> ${movie.vote_average} / 10</p>
            `;

            card.addEventListener('click', () => {
                console.log(movie.id);
                window.location.href = `viewMovie.html?movieId=${movie.id}`
            });

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

Home();