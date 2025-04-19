async function Home() {
    const API_KEY = '97df57ffd9278a37bc12191e00332053';
    const container = document.querySelector('.movie-container');
    const container1 = document.querySelector('.series-container');
    const container2 = document.querySelector('.anime-container');
    const slider = document.querySelector('.backdrop-slider');

    if (!container || !slider) {
        console.error('Missing container or slider element.');
        return;
    }

    let topMovies = [];

    // ========== MOVIES ==========
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}`);
        const data = await response.json();

        console.log('Movies:', data);

        topMovies = data.results.slice(0, 5);

        data.results.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';

            card.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="movie-poster">
                <h2 class="movie-title">${movie.title}</h2>
                <p class="movie-overview">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No overview available.'}</p>
                <p class="movie-release-date"><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                <p class="movie-rating"><strong>Rating:</strong> ${movie.vote_average || 'N/A'} / 10</p>
            `;

            card.addEventListener('click', () => {
                window.location.href = `viewMovie.html?movieId=${movie.id}&type=movie`;
            });

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
    }

    // ========== SERIES ==========
    try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${API_KEY}`);

        const data = await response.json();

        console.log('Series:', data);

        data.results.forEach(movie => {
            const card1 = document.createElement('div');
            card1.className = 'series-card';

            card1.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.name}" class="series-poster">
                <h2 class="series-title">${movie.name}</h2>
                <p class="series-overview">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No overview available.'}</p>
                <p class="series-release-date"><strong>Release Date:</strong> ${movie.first_air_date || 'N/A'}</p>
                <p class="series-rating"><strong>Rating:</strong> ${movie.vote_average || 'N/A'} / 10</p>
            `;

            card1.addEventListener('click', () => {
                window.location.href = `viewMovie.html?movieId=${movie.id}&type=tv`;
            });

            if (movie.poster_path) {
                container1.appendChild(card1);
            }
        });
    } catch (error) {
        console.error('Error fetching series:', error);
    }

    // ========== ANIME ==========
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16`);
        const data = await response.json();

        console.log('Anime:', data);

        data.results.forEach(movie => {
            const card2 = document.createElement('div');
            card2.className = 'anime-card';

            card2.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.name}" class="anime-poster">
                <h2 class="anime-title">${movie.name}</h2>
                <p class="anime-overview">${movie.overview ? movie.overview.substring(0, 100) + '...' : 'No overview available.'}</p>
                <p class="anime-release-date"><strong>Release Date:</strong> ${movie.first_air_date || 'N/A'}</p>
                <p class="anime-rating"><strong>Rating:</strong> ${movie.vote_average || 'N/A'} / 10</p>
            `;

            card2.addEventListener('click', () => {
                window.location.href = `viewMovie.html?movieId=${movie.id}&type=tv`;
            });

            if (movie.poster_path) {
                container2.appendChild(card2);
            }
        });
    } catch (error) {
        console.error('Error fetching anime:', error);
    }

    // ========== BACKDROP SLIDER ==========
    if (topMovies.length > 0) {
        let index = 0;

        function updateBackdrop() {

            slider.style.opacity = 0;
        
            setTimeout(() => {

                slider.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${topMovies[index].backdrop_path})`;

                slider.style.opacity = 1;
        
                index = (index + 1) % topMovies.length;
            }, 500); 
        }
        

        updateBackdrop(); 
        setInterval(updateBackdrop, 3000); 
    }
}

Home();
