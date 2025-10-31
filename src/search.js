document.addEventListener('DOMContentLoaded', () => {
    console.log('Search script loaded'); // Debug log
    
    const searchIcon = document.querySelector('.fa-magnifying-glass');
    const searchInput = document.querySelector('input[placeholder="Search a movie/series"]');
    const searchModal = document.getElementById('searchModal');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const searchResultsTitle = document.getElementById('searchResultsTitle');
    const searchPaginationContainer = document.getElementById('searchPaginationContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    console.log('Search elements found:', {
        searchIcon: !!searchIcon,
        searchInput: !!searchInput,
        searchModal: !!searchModal
    }); // Debug log

    // Search state
    let currentPage = 1;
    let currentFilter = 'all';
    let totalPages = 1;
    let allResults = [];
    let currentQuery = '';
    let bodyScrollPosition = 0; // Store scroll position
    let searchTimeout; // For debouncing
    let searchDropdown; // Dropdown element

    // Create search dropdown
    function createSearchDropdown() {
        if (searchDropdown) return; // Already created
        
        searchDropdown = document.createElement('div');
        searchDropdown.className = 'search-dropdown hidden';
        searchDropdown.innerHTML = '<div class="search-dropdown-loading">Start typing to search...</div>';
        
        // Position dropdown below search input
        if (searchInput && searchInput.parentNode) {
            searchInput.parentNode.style.position = 'relative';
            searchInput.parentNode.appendChild(searchDropdown);
        }
    }

    // Initialize dropdown
    createSearchDropdown();

    // Add global test function for debugging
    window.testSearchModal = function() {
        console.log('Testing search modal...');
        openSearchModal('test');
    };

    // Click event on search icon
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            console.log('Search icon clicked'); // Debug log
            performSearch();
        });
    } else {
        console.error('Search icon not found');
    }

    // "Enter" key event on input field
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                console.log('Enter key pressed'); // Debug log
                event.preventDefault(); // Prevent form submission behavior
                performSearch();
            }
        });

        // Add live search with debouncing
        searchInput.addEventListener('input', (event) => {
            const query = event.target.value.trim();
            
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            if (query === '') {
                hideSearchDropdown();
                return;
            }

            // Show loading state
            showSearchDropdownLoading();

            // Set new timeout for 500ms delay
            searchTimeout = setTimeout(() => {
                performLiveSearch(query);
            }, 500);
        });

        // Hide dropdown when input loses focus (with slight delay for clicks)
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                hideSearchDropdown();
            }, 200);
        });

        // Show dropdown when input gains focus and has content
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() && searchDropdown && !searchDropdown.classList.contains('hidden')) {
                showSearchDropdown();
            }
        });
    } else {
        console.error('Search input not found');
    }

    // Close button event - simplified like the movie modal
    if (searchCloseBtn) {
        searchCloseBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeSearchModal();
        });
    } else {
        console.error('Search close button not found');
    }

    // Close modal when clicking outside
    if (searchModal) {
        searchModal.addEventListener('click', (event) => {
            if (event.target === searchModal) {
                closeSearchModal();
            }
        });
    }

    // Filter button events
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.type;
            currentPage = 1;
            displayFilteredResults();
        });
    });

    // Escape key to close modal
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !searchModal.classList.contains('hidden')) {
            closeSearchModal();
        }
    });

    // Function to handle search
    function performSearch() {
        console.log('performSearch called'); // Debug log
        const query = searchInput ? searchInput.value.trim() : "";

        console.log('Search query:', query); // Debug log

        if (query !== "") {
            currentQuery = query;
            hideSearchDropdown(); // Hide dropdown when opening modal
            openSearchModal(query);
        } else {
            alert("Please enter a search term.");
        }
    }

    // Function to perform live search for dropdown
    async function performLiveSearch(query) {
        if (!query) return;

        const apiKey = "97df57ffd9278a37bc12191e00332053";
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                displaySearchDropdown(data.results.slice(0, 6)); // Show top 6 results
            } else {
                showSearchDropdownEmpty();
            }
        } catch (error) {
            console.error('Error fetching live search results:', error);
            showSearchDropdownError();
        }
    }

    // Show dropdown with results
    function displaySearchDropdown(results) {
        if (!searchDropdown) return;

        searchDropdown.innerHTML = '';
        
        results.forEach(item => {
            const dropdownItem = document.createElement('div');
            dropdownItem.className = 'search-dropdown-item';
            
            const title = item.title || item.name || 'Unknown Title';
            const mediaType = item.media_type === 'tv' ? 'TV Show' : 'Movie';
            const year = item.release_date || item.first_air_date ? 
                new Date(item.release_date || item.first_air_date).getFullYear() : '';
            const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
            
            const posterPath = item.poster_path ? 
                `https://image.tmdb.org/t/p/w92${item.poster_path}` : 
                'https://via.placeholder.com/92x138?text=No+Image';

            dropdownItem.innerHTML = `
                <img src="${posterPath}" alt="${title}" class="search-dropdown-poster">
                <div class="search-dropdown-info">
                    <div class="search-dropdown-title">${title}</div>
                    <div class="search-dropdown-meta">
                        <span class="search-dropdown-type">${mediaType}</span>
                        ${year ? `<span class="search-dropdown-year">${year}</span>` : ''}
                        <span class="search-dropdown-rating">★ ${rating}</span>
                    </div>
                </div>
            `;

            dropdownItem.addEventListener('click', () => {
                const itemType = item.media_type === 'tv' ? 'tv' : 'movie';
                window.location.href = `viewMovie.html?movieId=${item.id}&type=${itemType}`;
            });

            searchDropdown.appendChild(dropdownItem);
        });

        // Add "View all results" option
        const viewAllItem = document.createElement('div');
        viewAllItem.className = 'search-dropdown-view-all';
        viewAllItem.innerHTML = `<span>View all results for "${searchInput.value}"</span>`;
        viewAllItem.addEventListener('click', () => {
            performSearch();
        });
        searchDropdown.appendChild(viewAllItem);

        showSearchDropdown();
    }

    // Show dropdown
    function showSearchDropdown() {
        if (searchDropdown) {
            searchDropdown.classList.remove('hidden');
        }
    }

    // Hide dropdown
    function hideSearchDropdown() {
        if (searchDropdown) {
            searchDropdown.classList.add('hidden');
        }
    }

    // Show loading state
    function showSearchDropdownLoading() {
        if (searchDropdown) {
            searchDropdown.innerHTML = '<div class="search-dropdown-loading">Searching...</div>';
            showSearchDropdown();
        }
    }

    // Show empty state
    function showSearchDropdownEmpty() {
        if (searchDropdown) {
            searchDropdown.innerHTML = '<div class="search-dropdown-empty">No results found</div>';
            showSearchDropdown();
        }
    }

    // Show error state
    function showSearchDropdownError() {
        if (searchDropdown) {
            searchDropdown.innerHTML = '<div class="search-dropdown-error">Error loading results</div>';
            showSearchDropdown();
        }
    }

    function openSearchModal(query) {
        console.log('openSearchModal called with query:', query); // Debug log
        
        if (!searchModal) {
            console.error('Search modal element not found');
            return;
        }

        console.log('Search modal classes before:', searchModal.className);

        // Save current scroll position
        bodyScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

        // Prevent background scrolling
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${bodyScrollPosition}px`;
        document.body.style.width = '100%';

        // Show modal
        searchModal.classList.remove('hidden');
        searchModal.style.display = 'flex'; // Force display
        searchModal.style.position = 'fixed'; // Force position
        searchModal.style.top = '0'; // Force position
        searchModal.style.left = '0'; // Force position
        searchModal.style.zIndex = '9999'; // Force z-index

        console.log('Search modal classes after:', searchModal.className);
        console.log('Search modal style:', searchModal.style.cssText);

        // Update title
        if (searchResultsTitle) {
            searchResultsTitle.textContent = `Search Results for: "${query}"`;
        }

        // Reset state
        currentPage = 1;
        currentFilter = 'all';
        filterButtons.forEach(btn => {
            if (btn.dataset.type === 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Load search results
        loadSearchResults();
    }

    function closeSearchModal() {
        console.log('closeSearchModal called'); // Debug log
        
        if (searchModal) {
            // Hide the modal
            searchModal.classList.add('hidden');
            searchModal.style.display = 'none';
            
            // Restore background scrolling and scroll position
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            
            // Restore scroll position
            window.scrollTo(0, bodyScrollPosition);
            
            // Clear the search input
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Reset current query
            currentQuery = '';
            
            console.log('Search modal closed successfully');
        } else {
            console.error('Search modal element not found when trying to close');
        }
    }

    async function loadSearchResults() {
        if (!searchResultsContainer) return;

        const apiKey = "97df57ffd9278a37bc12191e00332053";
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(currentQuery)}&language=en-US&page=${currentPage}`;

        searchResultsContainer.innerHTML = '<div class="loading">Loading...</div>';
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                allResults = data.results;
                totalPages = Math.min(data.total_pages, 20); // Limit to 20 pages for performance
                displayFilteredResults();
                updatePagination();
            } else {
                searchResultsContainer.innerHTML = '<div class="no-results">No results found.</div>';
            }
        } catch (error) {
            console.error("TMDB Search Error:", error);
            searchResultsContainer.innerHTML = '<div class="error">Error fetching results.</div>';
        }
    }

    function displayFilteredResults() {
        if (!searchResultsContainer || !allResults.length) return;

        let filteredResults = allResults;
        if (currentFilter !== 'all') {
            filteredResults = allResults.filter(result => result.media_type === currentFilter);
        }

        displayResults(filteredResults);
    }

    function displayResults(results) {
        if (!searchResultsContainer) return;
        
        searchResultsContainer.innerHTML = '';
        
        if (!results || results.length === 0) {
            searchResultsContainer.innerHTML = '<div class="no-results">No results found for this filter.</div>';
            return;
        }

        // Group results by type
        const groupedResults = {};
        results.forEach(result => {
            const type = result.media_type || 'unknown';
            if (!groupedResults[type]) {
                groupedResults[type] = [];
            }
            groupedResults[type].push(result);
        });

        // Display each group
        Object.keys(groupedResults).forEach(type => {
            if (currentFilter === 'all' || currentFilter === type) {
                const typeSection = document.createElement('div');
                typeSection.classList.add('result-type-section');
                
                const typeHeader = document.createElement('h3');
                typeHeader.classList.add('type-header');
                typeHeader.textContent = getTypeLabel(type) + ` (${groupedResults[type].length})`;
                
                const typeResults = document.createElement('div');
                typeResults.classList.add('type-results');
                
                groupedResults[type].forEach(result => {
                    const card = createResultCard(result);
                    typeResults.appendChild(card);
                });
                
                typeSection.appendChild(typeHeader);
                typeSection.appendChild(typeResults);
                searchResultsContainer.appendChild(typeSection);
            }
        });
    }

    function getTypeLabel(type) {
        switch(type) {
            case 'movie': return 'Movies';
            case 'tv': return 'TV Shows';
            case 'person': return 'People';
            default: return 'Other';
        }
    }

    function createResultCard(result) {
        const card = document.createElement('div');
        card.classList.add('result-card');

        const title = result.title || result.name || "No Title";
        
        if (result.poster_path || result.profile_path) {
            const img = document.createElement('img');
            const path = result.poster_path ? result.poster_path : result.profile_path;
            if (path) {
                img.src = `https://image.tmdb.org/t/p/w300${path}`;
                img.alt = title;
                img.classList.add('result-image');
                card.appendChild(img);
            }
        }

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('result-content');

        const titleEl = document.createElement('h4');
        titleEl.textContent = title;
        titleEl.classList.add('result-title');

        const mediaEl = document.createElement('p');
        mediaEl.textContent = `${getTypeLabel(result.media_type)}`;
        mediaEl.classList.add('result-type');

        contentDiv.appendChild(titleEl);
        contentDiv.appendChild(mediaEl);

        if (result.overview) {
            const overviewEl = document.createElement('p');
            overviewEl.textContent = result.overview.length > 150 
                ? result.overview.substring(0, 150) + "..." 
                : result.overview;
            overviewEl.classList.add('result-overview');
            contentDiv.appendChild(overviewEl);
        }

        // Add rating if available
        if (result.vote_average && result.media_type !== 'person') {
            const ratingEl = document.createElement('div');
            ratingEl.classList.add('result-rating');
            ratingEl.innerHTML = `<i class="fa-solid fa-star"></i> ${result.vote_average.toFixed(1)}`;
            contentDiv.appendChild(ratingEl);
        }

        // Add release date if available
        const releaseDate = result.release_date || result.first_air_date;
        if (releaseDate) {
            const dateEl = document.createElement('p');
            dateEl.classList.add('result-date');
            dateEl.textContent = new Date(releaseDate).getFullYear();
            contentDiv.appendChild(dateEl);
        }

        card.appendChild(contentDiv);

        // Add click event
        if (result.media_type !== 'person') {
            card.addEventListener('click', () => {
                console.log(`Clicked result ID: ${result.id}`);
                window.location.href = `viewMovie.html?movieId=${result.id}&type=${result.media_type}`;
            });
            card.style.cursor = 'pointer';
        }

        return card;
    }

    function updatePagination() {
        if (!searchPaginationContainer) return;
        
        searchPaginationContainer.innerHTML = '';
        
        if (totalPages <= 1) return;

        const pagination = document.createElement('div');
        pagination.classList.add('pagination');

        // Previous button
        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.classList.add('page-btn');
            prevBtn.textContent = 'Previous';
            prevBtn.addEventListener('click', () => {
                currentPage--;
                loadSearchResults();
            });
            pagination.appendChild(prevBtn);
        }

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.classList.add('page-btn');
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                loadSearchResults();
            });
            pagination.appendChild(pageBtn);
        }

        // Next button
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.classList.add('page-btn');
            nextBtn.textContent = 'Next';
            nextBtn.addEventListener('click', () => {
                currentPage++;
                loadSearchResults();
            });
            pagination.appendChild(nextBtn);
        }

        searchPaginationContainer.appendChild(pagination);
    }
});