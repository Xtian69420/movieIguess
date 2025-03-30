const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');

if (movieId) {
    const apiKey = '97df57ffd9278a37bc12191e00332053'; 
    const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayMovieDetails(data);
        })
        .catch(error => {
            console.error('Error fetching movie data:', error);
        });
} else {
    console.error('No movieId found in the URL');
}

function displayMovieDetails(movieData) {
    document.body.style.backgroundImage = `url('https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}')`;
    document.body.style.backgroundSize = "cover"; 
    document.body.style.backgroundPosition = "center"; 
    document.body.style.backgroundRepeat = "no-repeat"; 
    console.log(movieData);
    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container not found in the document.');
        return;
    }

    container.innerHTML = `
        <div class="movie-details">
            <div class="movie-header" style="background-image: url('https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}')">
                <img src="https://image.tmdb.org/t/p/w500${movieData.poster_path}" alt="${movieData.title}" class="movie-poster">
                <div class="movie-info">
                    <h1 class="movie-title">${movieData.title}</h1>
                    <p class="movie-genres">${movieData.genres.map(genre => genre.name).join(', ')}</p>
                    <p class="movie-release-date"><strong>Release Date:</strong> ${movieData.release_date}</p>
                    <p class="movie-status"><strong>Status:</strong> ${movieData.status}</p>
                </div>
            </div>
            <div class="movie-body">
                <p class="movie-overview"><strong>Overview:</strong> ${movieData.overview}</p>
                <p class="movie-language"><strong>Original Language:</strong> ${movieData.original_language}</p>
                <p class="movie-rating"><strong>Rating:</strong> ${movieData.vote_average} / 10 (${movieData.vote_count} votes)</p>
                <button class="watchbtn">Watch</button>
            </div>
        </div>
    `;
    const Wbutton = document.querySelector('.watchbtn'); 
    if (Wbutton) {
        Wbutton.addEventListener('click', () => {
            console.log(movieData.id); 
            window.location.href = `WatchMovie.html?movieId=${movieData.id}`;
        });
    } else {
        console.error("Watch button not found.");
    }
}