const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('movieId');
const type = urlParams.get('type')

function displayMovieDetails(movieData) {
    document.body.style.backgroundImage = `url('https://image.tmdb.org/t/p/w1280${movieData.backdrop_path}')`;
    document.body.style.backgroundSize = "cover"; 
    if (!movieData.backdrop_path) {
        document.body.style.backgroundImage = "url('https://via.placeholder.com/1280x720?text=No+Image+Available')";
    }
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
            window.location.href = `WatchMovie.html?movieId=${movieData.id}&type=movie`;
        });
    } else {
        console.error("Watch button not found.");
    }
}

function displayFallbackUI() {
    document.body.style.backgroundImage = "url('https://via.placeholder.com/1280x720?text=No+Image+Available')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container not found in the document.');
        return;
    }

    container.innerHTML = `
        <div class="movie-details">
            <div class="movie-header" style="background-image: url('https://via.placeholder.com/1280x720?text=No+Image+Available')">
                <img src="https://via.placeholder.com/500x750?text=No+Image+Available" alt="No data found" class="movie-poster">
                <div class="movie-info">
                    <h1 class="movie-title">N/A</h1>
                    <p class="movie-genres">N/A</p>
                    <p class="movie-release-date"><strong>Release Date:</strong> N/A</p>
                    <p class="movie-status"><strong>Status:</strong> N/A</p>
                </div>
            </div>
            <div class="movie-body">
                <p class="movie-overview"><strong>Overview:</strong> N/A</p>
                <p class="movie-language"><strong>Original Language:</strong> N/A</p>
                <p class="movie-rating"><strong>Rating:</strong> N/A</p>
                <button class="watchbtn" disabled>Watch</button>
            </div>
        </div>
    `;
}
try {
    if (type === 'tv' && movieId) {
        const apiKey = '97df57ffd9278a37bc12191e00332053';
        const apiUrl = `https://api.themoviedb.org/3/tv/${movieId}?api_key=${apiKey}`;

        fetch(apiUrl)
            .then(response => {
                console.log('Response:', response); // Log the response object
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Data:', data); 
                displaySeriesDetails(data);
            });
    } else if (type === 'movie' && movieId) {
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
            });
    } else {
        throw new Error('Invalid type or no movieId found in the URL');
    }
} catch (error) {
    console.error('Error:', error);
    displayFallbackUI();
}

function displaySeriesDetails(seriesData) {
    document.body.style.backgroundImage = `url('https://image.tmdb.org/t/p/w1280${seriesData.backdrop_path}')`;
    document.body.style.backgroundSize = "cover";
    if (!seriesData.backdrop_path) {
        document.body.style.backgroundImage = "url('https://via.placeholder.com/1280x720?text=No+Image+Available')";
    }
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    console.log(seriesData);
    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container not found in the document.');
        return;
    }

    container.innerHTML = `
        <div class="series-details">
            <div class="series-header" style="background-image: url('https://image.tmdb.org/t/p/w1280${seriesData.backdrop_path}')">
                <img src="https://image.tmdb.org/t/p/w500${seriesData.poster_path}" alt="${seriesData.name}" class="series-poster">
                <div class="series-info">
                    <h1 class="series-title">${seriesData.name}</h1>
                    <p class="series-genres">${seriesData.genres.map(genre => genre.name).join(', ')}</p>
                    <p class="series-first-air-date"><strong>First Air Date:</strong> ${seriesData.first_air_date}</p>
                    <p class="series-status"><strong>Status:</strong> ${seriesData.status}</p>
                </div>
            </div>
            <div class="series-body">
                <p class="series-overview"><strong>Overview:</strong> ${seriesData.overview}</p>
                <p class="series-language"><strong>Original Language:</strong> ${seriesData.original_language}</p>
                <p class="series-rating"><strong>Rating:</strong> ${seriesData.vote_average} / 10 (${seriesData.vote_count} votes)</p>
                <button class="watchbtn">Watch</button>
            </div>
        </div>
    `;
    const Wbutton = document.querySelector('.watchbtn');
    if (Wbutton) {
        Wbutton.addEventListener('click', () => {
            console.log(seriesData.id);
            window.location.href = `WatchMovie.html?seriesId=${seriesData.id}&type=tv`;
        });
    } else {
        console.error("Watch button not found.");
    }
}