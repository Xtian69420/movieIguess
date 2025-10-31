// Global API key
const API_KEY = '97df57ffd9278a37bc12191e00332053';

// Function to update hero section with featured movie data
function updateHeroSection(movie, details) {
    console.log('updateHeroSection called with:', movie.title || movie.name);
    
    const heroLoading = document.getElementById('hero-loading');
    const heroContent = document.getElementById('hero-content');
    const heroTitle = document.getElementById('hero-title');
    const heroOverview = document.getElementById('hero-overview');
    const heroRating = document.getElementById('hero-rating');
    const heroYear = document.getElementById('hero-year');
    const heroRuntime = document.getElementById('hero-runtime');
    const playBtn = document.getElementById('hero-play-btn');
    const infoBtn = document.getElementById('hero-info-btn');

    console.log('DOM Elements found:', {
        heroLoading: !!heroLoading,
        heroContent: !!heroContent,
        heroTitle: !!heroTitle,
        heroOverview: !!heroOverview,
        heroRating: !!heroRating,
        heroYear: !!heroYear,
        heroRuntime: !!heroRuntime,
        playBtn: !!playBtn,
        infoBtn: !!infoBtn
    });

    if (!heroContent) {
        console.error('Hero content element not found');
        return;
    }

    // Update content - handle both movies and TV shows
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const mediaType = movie.title ? 'movie' : 'tv';
    
    if (heroTitle) {
        heroTitle.textContent = title;
        console.log('Updated title to:', title);
    }
    if (heroOverview) {
        const overview = movie.overview || 'An exciting movie experience awaits you.';
        // Limit description to 150 characters for better readability
        const truncatedOverview = overview.length > 150 ? overview.substring(0, 150) + '...' : overview;
        heroOverview.textContent = truncatedOverview;
        console.log('Updated overview');
    }
    
    // Update rating
    const ratingSpan = heroRating ? heroRating.querySelector('span') : null;
    if (ratingSpan) {
        ratingSpan.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        console.log('Updated rating to:', movie.vote_average);
    }
    
    // Update year
    if (heroYear && releaseDate) {
        heroYear.textContent = new Date(releaseDate).getFullYear();
        console.log('Updated year');
    }
    
    // Update runtime if available
    if (heroRuntime) {
        if (details && details.runtime) {
            const hours = Math.floor(details.runtime / 60);
            const minutes = details.runtime % 60;
            heroRuntime.textContent = `${hours}h ${minutes}m`;
            console.log('Updated runtime');
        } else if (details && details.number_of_seasons) {
            // For TV shows
            heroRuntime.textContent = `${details.number_of_seasons} Season${details.number_of_seasons !== 1 ? 's' : ''}`;
            console.log('Updated seasons count');
        } else {
            heroRuntime.textContent = '';
        }
    }

    // Add click handlers for buttons
    if (playBtn) {
        playBtn.onclick = () => {
            window.location.href = `viewMovie.html?movieId=${movie.id}&type=${mediaType}`;
        };
        console.log('Added play button handler');
    }
    
    if (infoBtn) {
        infoBtn.onclick = () => {
            showMovieModal(movie, details);
        };
        console.log('Added info button handler');
    }

    // Show content and hide loading
    if (heroLoading) {
        heroLoading.style.display = 'none'; // Use style.display instead of hidden class
        console.log('Hidden loading');
    }
    if (heroContent) {
        heroContent.style.display = 'block'; // Use style.display instead of hidden class
        heroContent.classList.remove('hidden');
        console.log('Showed hero content');
    }
}

// Function to show default hero content if API fails
function showDefaultHeroContent() {
    const heroLoading = document.getElementById('hero-loading');
    const heroContent = document.getElementById('hero-content');
    
    console.log('Showing default hero content'); // Debug log
    console.log('Elements found:', { heroLoading: !!heroLoading, heroContent: !!heroContent });
    
    if (heroContent) {
        if (heroLoading) {
            heroLoading.style.display = 'none'; // Use style.display instead of hidden class
        }
        heroContent.style.display = 'block'; // Use style.display instead of hidden class
        heroContent.classList.remove('hidden');
        
        // Set default click handlers
        const playBtn = document.getElementById('hero-play-btn');
        const infoBtn = document.getElementById('hero-info-btn');
        
        if (playBtn) playBtn.onclick = () => alert('Movie data is loading...');
        if (infoBtn) infoBtn.onclick = () => alert('Movie data is loading...');
        
        console.log('Default hero content shown');
    } else {
        console.error('Could not find hero content element');
    }
}

async function Home() {
    const container = document.querySelector('.movie-container');
    const container1 = document.querySelector('.series-container');
    const container2 = document.querySelector('.anime-container');
    const slider = document.querySelector('.backdrop-slider');

    if (!container || !slider) {
        console.error('Missing container or slider element.');
        return;
    }

    // Show loading skeletons
    showLoadingSkeletons();

    let topMovies = [];
    let featuredMovie = null;

    // ========== FEATURED MOVIE FOR HERO ==========
    try {
        // Get trending movies for hero section
        console.log('Fetching featured movie...'); // Debug log
        const heroResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`);
        const heroData = await heroResponse.json();
        
        console.log('Hero data received:', heroData); // Debug log
        
        if (heroData.results && heroData.results.length > 0) {
            // Get a random featured movie from top 5 trending
            const randomIndex = Math.floor(Math.random() * Math.min(5, heroData.results.length));
            featuredMovie = heroData.results[randomIndex];
            
            console.log('Selected featured movie:', featuredMovie.title); // Debug log
            
            // Get additional movie details
            const detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${featuredMovie.id}?api_key=${API_KEY}`);
            const movieDetails = await detailsResponse.json();
            
            console.log('Movie details received:', movieDetails); // Debug log
            
            // Update hero section with featured movie
            updateHeroSection(featuredMovie, movieDetails);
        }
    } catch (error) {
        console.error('Error fetching featured movie:', error);
        // Show default hero content if API fails
        showDefaultHeroContent();
    }

    // ========== MOVIES ==========
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}`);
        const data = await response.json();

        console.log('Movies:', data);

        // Clear loading skeletons from movie container
        container.innerHTML = '';
        
        topMovies = data.results.slice(0, 5);

        data.results.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card group relative flex-shrink-0 w-48 lg:w-56 cursor-pointer transform transition-all duration-300 hover:z-10';

            const posterPath = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image';

            card.innerHTML = `
                <div class="relative overflow-hidden rounded-lg bg-netflix-gray shadow-lg h-72 lg:h-80">
                    <div class="movie-poster w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-110" 
                         style="background-image: url('${posterPath}')">
                    </div>
                    
                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="absolute bottom-0 left-0 right-0 p-4">
                            <h3 class="movie-title text-white font-bold text-sm lg:text-base mb-2 line-clamp-2">${movie.title}</h3>
                            <div class="flex items-center justify-between text-xs lg:text-sm text-gray-300">
                                <span class="movie-rating flex items-center">
                                    <i class="fa-solid fa-star text-yellow-400 mr-1"></i>
                                    ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                                </span>
                                <span class="movie-release-date">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="flex space-x-2 mt-3">
                                <button class="play-btn bg-white text-black px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center" onclick="event.stopPropagation(); window.location.href='viewMovie.html?movieId=${movie.id}&type=movie'">
                                    <i class="fa-solid fa-play text-xs mr-1"></i>
                                    Play
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', async () => {
                // Show modal instead of navigating to viewMovie
                try {
                    const detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}`);
                    const movieDetails = await detailsResponse.json();
                    showMovieModal(movie, movieDetails);
                } catch (error) {
                    console.error('Error fetching movie details for modal:', error);
                    showMovieModal(movie, null);
                }
            });

            if (movie.poster_path) {
                container.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError(container, 'Failed to load movies. Please check your internet connection.');
    }

    // ========== SERIES ==========
    try {
    const response = await fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${API_KEY}`);

        const data = await response.json();

        console.log('Series:', data);

        // Clear loading skeletons from series container
        container1.innerHTML = '';

        data.results.forEach(movie => {
            const card1 = document.createElement('div');
            card1.className = 'series-card group relative flex-shrink-0 w-48 lg:w-56 cursor-pointer transform transition-all duration-300 hover:z-10';

            const seriesPosterPath = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image';

            card1.innerHTML = `
                <div class="relative overflow-hidden rounded-lg bg-netflix-gray shadow-lg h-72 lg:h-80">
                    <div class="series-poster w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-110" 
                         style="background-image: url('${seriesPosterPath}')">
                    </div>
                    
                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="absolute bottom-0 left-0 right-0 p-4">
                            <h3 class="series-title text-white font-bold text-sm lg:text-base mb-2 line-clamp-2">${movie.name}</h3>
                            <div class="flex items-center justify-between text-xs lg:text-sm text-gray-300">
                                <span class="series-rating flex items-center">
                                    <i class="fa-solid fa-star text-yellow-400 mr-1"></i>
                                    ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                                </span>
                                <span class="series-release-date">${movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : 'N/A'}</span>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="flex space-x-2 mt-3">
                                <button class="play-btn bg-white text-black px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center" onclick="event.stopPropagation(); window.location.href='viewMovie.html?movieId=${movie.id}&type=tv'">
                                    <i class="fa-solid fa-play text-xs mr-1"></i>
                                    Play
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            card1.addEventListener('click', async () => {
                // Show modal instead of navigating to viewMovie
                try {
                    const detailsResponse = await fetch(`https://api.themoviedb.org/3/tv/${movie.id}?api_key=${API_KEY}`);
                    const movieDetails = await detailsResponse.json();
                    showMovieModal(movie, movieDetails);
                } catch (error) {
                    console.error('Error fetching series details for modal:', error);
                    showMovieModal(movie, null);
                }
            });

            if (movie.poster_path) {
                container1.appendChild(card1);
            }
        });
    } catch (error) {
        console.error('Error fetching series:', error);
        showError(container1, 'Failed to load TV shows. Please check your internet connection.');
    }

    // ========== ANIME ==========
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16`);
        const data = await response.json();

        console.log('Anime:', data);

        // Clear loading skeletons from anime container
        container2.innerHTML = '';

        data.results.forEach(movie => {
            const card2 = document.createElement('div');
            card2.className = 'anime-card group relative flex-shrink-0 w-48 lg:w-56 cursor-pointer transform transition-all duration-300 hover:z-10';

            const animePosterPath = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image';

            card2.innerHTML = `
                <div class="relative overflow-hidden rounded-lg bg-netflix-gray shadow-lg h-72 lg:h-80">
                    <div class="anime-poster w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-110" 
                         style="background-image: url('${animePosterPath}')">
                    </div>
                    
                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="absolute bottom-0 left-0 right-0 p-4">
                            <h3 class="anime-title text-white font-bold text-sm lg:text-base mb-2 line-clamp-2">${movie.name}</h3>
                            <div class="flex items-center justify-between text-xs lg:text-sm text-gray-300">
                                <span class="anime-rating flex items-center">
                                    <i class="fa-solid fa-star text-yellow-400 mr-1"></i>
                                    ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                                </span>
                                <span class="anime-release-date">${movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : 'N/A'}</span>
                            </div>
                            
                            <!-- Action Buttons -->
                            <div class="flex space-x-2 mt-3">
                                <button class="play-btn bg-white text-black px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center" onclick="event.stopPropagation(); window.location.href='viewMovie.html?movieId=${movie.id}&type=tv'">
                                    <i class="fa-solid fa-play text-xs mr-1"></i>
                                    Play
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            card2.addEventListener('click', async () => {
                // Show modal instead of navigating to viewMovie
                try {
                    const detailsResponse = await fetch(`https://api.themoviedb.org/3/tv/${movie.id}?api_key=${API_KEY}`);
                    const movieDetails = await detailsResponse.json();
                    showMovieModal(movie, movieDetails);
                } catch (error) {
                    console.error('Error fetching anime details for modal:', error);
                    showMovieModal(movie, null);
                }
            });

            if (movie.poster_path) {
                container2.appendChild(card2);
            }
        });
    } catch (error) {
        console.error('Error fetching anime:', error);
        showError(container2, 'Failed to load top rated content. Please check your internet connection.');
    }

    // ========== BACKDROP SLIDER ==========
    // Create rotating backdrop with trending movies
    let backdropMovies = [];
    
    // Collect movies with backdrop images for the slider
    if (featuredMovie && featuredMovie.backdrop_path) {
        backdropMovies.push(featuredMovie);
    }
    
    // Add more trending movies for backdrop rotation
    try {
        const trendingResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`);
        const trendingData = await trendingResponse.json();
        
        if (trendingData.results) {
            trendingData.results.slice(0, 8).forEach(movie => {
                if (movie.backdrop_path && !backdropMovies.find(m => m.id === movie.id)) {
                    backdropMovies.push(movie);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching trending movies for backdrop:', error);
    }
    
    // Fallback to topMovies if needed
    if (topMovies.length > 0) {
        topMovies.forEach(movie => {
            if (movie.backdrop_path && !backdropMovies.find(m => m.id === movie.id)) {
                backdropMovies.push(movie);
            }
        });
    }
    
    console.log('Backdrop movies collected:', backdropMovies.length);
    
    if (backdropMovies.length > 0) {
        let backdropIndex = 0;
        
        // Set initial backdrop
        slider.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${backdropMovies[backdropIndex].backdrop_path})`;
        slider.style.opacity = 1;
        
        // Only start rotation if we have more than one backdrop
        if (backdropMovies.length > 1) {
            function updateBackdrop() {
                backdropIndex = (backdropIndex + 1) % backdropMovies.length;
                const currentMovie = backdropMovies[backdropIndex];
                console.log('Updating backdrop and hero content to movie:', currentMovie.title || currentMovie.name);
                
                slider.style.opacity = 0;
            
                setTimeout(async () => {
                    // Update backdrop image
                    slider.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${currentMovie.backdrop_path})`;
                    slider.style.opacity = 1;
                    
                    // Update hero content with the new movie
                    try {
                        let movieDetails = null;
                        if (currentMovie.title) { // It's a movie
                            const detailsResponse = await fetch(`https://api.themoviedb.org/3/movie/${currentMovie.id}?api_key=${API_KEY}`);
                            movieDetails = await detailsResponse.json();
                        }
                        updateHeroSection(currentMovie, movieDetails);
                    } catch (error) {
                        console.error('Error fetching movie details for hero update:', error);
                        // Update hero with basic movie info even if details fetch fails
                        updateHeroSection(currentMovie, null);
                    }
                }, 500); 
            }

            // Start the rotation immediately and then every 5 seconds
            setInterval(updateBackdrop, 5000);
            console.log('Backdrop and hero content rotation started with', backdropMovies.length, 'movies, changing every 5 seconds');
        } else {
            console.log('Only one backdrop available, no rotation needed');
        }
    } else {
        console.log('No backdrop movies available');
    }
}

// Modal functions
async function showMovieModal(movie, details) {
    const modal = document.getElementById('movieModal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalPoster = document.getElementById('modalPoster');
    const modalTitle = document.getElementById('modalTitle');
    const modalOverview = document.getElementById('modalOverview');
    const modalRating = document.getElementById('modalRating');
    const modalYear = document.getElementById('modalYear');
    const modalRuntime = document.getElementById('modalRuntime');
    const modalReleaseDate = document.getElementById('modalReleaseDate');
    const modalGenres = document.getElementById('modalGenres');
    const modalRuntimeDetail = document.getElementById('modalRuntimeDetail');
    const modalRatingDetail = document.getElementById('modalRatingDetail');
    const modalVoteCount = document.getElementById('modalVoteCount');
    const modalLanguage = document.getElementById('modalLanguage');
    const modalPlayBtn = document.getElementById('modalPlayBtn');

    // Get additional details if not provided
    if (!details) {
        try {
            const mediaType = movie.title ? 'movie' : 'tv';
            const detailsResponse = await fetch(`https://api.themoviedb.org/3/${mediaType}/${movie.id}?api_key=${API_KEY}`);
            details = await detailsResponse.json();
        } catch (error) {
            console.error('Error fetching movie details for modal:', error);
            details = {};
        }
    }

    // Populate modal content
    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const mediaType = movie.title ? 'movie' : 'tv';

    // Set backdrop for trailer restoration
    if (modalBackdrop && movie.backdrop_path) {
        const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
        modalBackdrop.src = backdropUrl;
        modalBackdrop.alt = title;
        // Store backdrop URL globally for trailer functionality
        currentMovieBackdrop = backdropUrl;
    }

    // Fetch and store trailer data
    try {
        const trailerData = await fetchMovieTrailer(movie.id, mediaType);
        currentMovieTrailer = trailerData;
        
        // Update play trailer button visibility
        const playTrailerBtn = document.getElementById('playTrailerBtn');
        const playTrailerBtnDesktop = document.getElementById('playTrailerBtnDesktop');
        if (playTrailerBtn) {
            if (trailerData) {
                playTrailerBtn.style.display = 'flex';
                playTrailerBtn.innerHTML = `<i class="fa-solid fa-play mr-1 lg:mr-2 text-xs lg:text-sm"></i><span class="hidden sm:inline">Play Trailer</span><span class="sm:hidden">Play Trailer</span>`;
                playTrailerBtn.onclick = playTrailer;
            } else {
                playTrailerBtn.style.display = 'none';
            }
        }
        if (playTrailerBtnDesktop) {
            if (trailerData) {
                playTrailerBtnDesktop.style.display = 'flex';
                playTrailerBtnDesktop.innerHTML = `<i class="fa-solid fa-play mr-2 text-sm"></i>Play Trailer`;
                playTrailerBtnDesktop.onclick = playTrailer;
            } else {
                playTrailerBtnDesktop.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error fetching trailer:', error);
        currentMovieTrailer = null;
        const playTrailerBtn = document.getElementById('playTrailerBtn');
        const playTrailerBtnDesktop = document.getElementById('playTrailerBtnDesktop');
        if (playTrailerBtn) {
            playTrailerBtn.style.display = 'none';
        }
        if (playTrailerBtnDesktop) {
            playTrailerBtnDesktop.style.display = 'none';
        }
    }

    if (modalPoster && movie.poster_path) {
        modalPoster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        modalPoster.alt = title;
    }

    if (modalTitle) modalTitle.textContent = title;
    if (modalOverview) modalOverview.textContent = movie.overview || 'No overview available.';

    // Rating
    const ratingSpan = modalRating ? modalRating.querySelector('span') : null;
    if (ratingSpan) {
        ratingSpan.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    }

    // Year
    if (modalYear && releaseDate) {
        modalYear.textContent = new Date(releaseDate).getFullYear();
    }

    // Runtime/Seasons
    if (modalRuntime) {
        if (details.runtime) {
            const hours = Math.floor(details.runtime / 60);
            const minutes = details.runtime % 60;
            modalRuntime.textContent = `${hours}h ${minutes}m`;
        } else if (details.number_of_seasons) {
            modalRuntime.textContent = `${details.number_of_seasons} Season${details.number_of_seasons !== 1 ? 's' : ''}`;
        } else {
            modalRuntime.textContent = '';
        }
    }

    // Detailed info
    if (modalReleaseDate && releaseDate) {
        modalReleaseDate.textContent = new Date(releaseDate).toLocaleDateString();
    }

    if (modalGenres && details.genres) {
        modalGenres.textContent = details.genres.map(genre => genre.name).join(', ');
    }

    if (modalRuntimeDetail) {
        if (details.runtime) {
            const hours = Math.floor(details.runtime / 60);
            const minutes = details.runtime % 60;
            modalRuntimeDetail.textContent = `${hours}h ${minutes}m`;
        } else if (details.number_of_seasons) {
            modalRuntimeDetail.textContent = `${details.number_of_seasons} Season${details.number_of_seasons !== 1 ? 's' : ''}, ${details.number_of_episodes || 'Unknown'} Episodes`;
        } else {
            modalRuntimeDetail.textContent = 'Unknown';
        }
    }

    if (modalRatingDetail) {
        modalRatingDetail.textContent = movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'Not rated';
    }

    if (modalVoteCount) {
        modalVoteCount.textContent = movie.vote_count ? movie.vote_count.toLocaleString() : 'Unknown';
    }

    if (modalLanguage && movie.original_language) {
        const languages = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'hi': 'Hindi',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ar': 'Arabic'
        };
        modalLanguage.textContent = languages[movie.original_language] || movie.original_language.toUpperCase();
    }

    // Play button functionality
    if (modalPlayBtn) {
        modalPlayBtn.onclick = () => {
            window.location.href = `viewMovie.html?movieId=${movie.id}&type=${mediaType}`;
        };
    }

    // Show modal
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent body scroll
        
        // Add animation class after a brief delay for smooth entrance
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            setTimeout(() => {
                modalContent.classList.add('show');
            }, 10);
        }
    }
}

function closeModal() {
    const modal = document.getElementById('movieModal');
    if (modal) {
        // Stop trailer if it's playing
        const trailerIframe = document.getElementById('trailerIframe');
        if (trailerIframe) {
            // Call stopTrailer function to restore the backdrop and reset buttons
            if (typeof stopTrailer === 'function') {
                stopTrailer();
            }
        }
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('show');
            // Wait for animation to complete before hiding
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto'; // Restore body scroll
            }, 300);
        } else {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto'; // Restore body scroll
        }
    }
}

// Global function to close modal (accessible from HTML onclick)
window.closeModal = closeModal;

// Function to add horizontal scrolling with mouse wheel
function addHorizontalScrolling(container) {
    container.addEventListener('wheel', (e) => {
        // Only apply horizontal scrolling on desktop (when container is scrollable)
        if (container.scrollWidth > container.clientWidth) {
            e.preventDefault();
            
            // Smooth scroll with variable speed based on wheel delta
            const scrollAmount = Math.abs(e.deltaY) > 50 ? 
                (e.deltaY > 0 ? 300 : -300) : 
                (e.deltaY > 0 ? 150 : -150);
            
            container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    });

    // Add touch/swipe support for mobile
    let isScrolling = false;
    let startX = 0;
    let scrollLeft = 0;

    container.addEventListener('touchstart', (e) => {
        isScrolling = true;
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // Multiply for faster scroll
        container.scrollLeft = scrollLeft - walk;
    });

    container.addEventListener('touchend', () => {
        isScrolling = false;
    });
}

// Initialize horizontal scrolling for all containers
function initializeScrolling() {
    const containers = document.querySelectorAll('.movie-container, .series-container, .anime-container');
    containers.forEach(container => {
        addHorizontalScrolling(container);
    });
}

// Ensure DOM is ready before running
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Home();
        // Initialize scrolling after content is loaded
        setTimeout(initializeScrolling, 1000);
    });
} else {
    Home();
    // Initialize scrolling after content is loaded
    setTimeout(initializeScrolling, 1000);
}
