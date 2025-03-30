document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.querySelector('.fa-magnifying-glass');
    const searchInput = document.querySelector('header input[placeholder="Search a movie/series"]');

    // Click event on search icon
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            performSearch();
        });
    }

    // "Enter" key event on input field
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission behavior
                performSearch();
            }
        });
    }
});

// Function to handle search
function performSearch() {
    const input = document.querySelector('header input[placeholder="Search a movie/series"]');
    const query = input ? input.value.trim() : "";

    if (query !== "") {
        openSearchModal(query);
    } else {
        alert("Please enter a search term.");
    }
}

function openSearchModal(query) {
    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('search-modal-overlay');

    const modalCard = document.createElement('div');
    modalCard.classList.add('search-modal-card');

    const backButton = document.createElement('button');
    backButton.classList.add('modal-back-button');
    backButton.innerHTML = '<i class="fa-solid fa-x"></i>';
    backButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });

    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });

    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('search-results-container');

    modalCard.appendChild(backButton);
    modalCard.appendChild(resultsContainer);
    modalOverlay.appendChild(modalCard);
    document.body.appendChild(modalOverlay);

    const apiKey = "97df57ffd9278a37bc12191e00332053";
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`;

    axios.get(url)
        .then(response => {
            const results = response.data.results;
            if (!results || results.length === 0) {
                resultsContainer.textContent = "No results found.";
            } else {
                console.log(results);
                results.forEach(result => {
                    const card = document.createElement('div');
                    card.classList.add('result-card');

                    const title = result.title || result.name || "No Title";
                    const titleEl = document.createElement('h3');
                    titleEl.textContent = title;

                    const mediaEl = document.createElement('p');
                    mediaEl.textContent = `Type: ${result.media_type || "unknown"}`;

                    if (result.poster_path || result.profile_path) {
                        const img = document.createElement('img');
                        const path = result.poster_path ? result.poster_path : result.profile_path;
                        if (path) {
                            img.src = `https://image.tmdb.org/t/p/w200${path}`;
                            img.alt = title;
                            card.appendChild(img);
                            card.appendChild(titleEl);
                            card.appendChild(mediaEl);
                            resultsContainer.appendChild(card);
                        }
                    }

                    if (result.overview) {
                        const overviewEl = document.createElement('p');
                        overviewEl.textContent = result.overview.length > 100 
                            ? result.overview.substring(0, 100) + "..." 
                            : result.overview;
                        card.appendChild(overviewEl);
                    }

                    // Add click event to log the result's id
                    card.addEventListener('click', () => {
                        console.log(`Clicked result ID: ${result.id}`);
                        window.location.href=`viewMovie.html?movieId=${result.id}&type=${result.media_type}`;
                    });

                    resultsContainer.appendChild(card);
                });
            }
        })
        .catch(error => {
            resultsContainer.textContent = "Error fetching results.";
            console.error("TMDB Search Error:", error);
        });
}
