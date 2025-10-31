// Loading skeleton component
function createLoadingSkeleton() {
    const skeleton = document.createElement('div');
    skeleton.className = 'flex-shrink-0 w-48 lg:w-56';
    skeleton.innerHTML = `
        <div class="relative overflow-hidden rounded-lg bg-netflix-gray shadow-lg">
            <div class="shimmer w-full h-72 lg:h-80 bg-gray-700 animate-pulse"></div>
            <div class="p-4">
                <div class="shimmer h-4 bg-gray-600 rounded mb-2 animate-pulse"></div>
                <div class="shimmer h-3 bg-gray-600 rounded w-3/4 animate-pulse"></div>
            </div>
        </div>
    `;
    return skeleton;
}

// Add loading skeletons
function showLoadingSkeletons() {
    const containers = [
        document.querySelector('.movie-container'),
        document.querySelector('.series-container'),
        document.querySelector('.anime-container')
    ];

    containers.forEach(container => {
        if (container) {
            // Clear existing content
            container.innerHTML = '';
            // Add 8 skeleton items
            for (let i = 0; i < 8; i++) {
                container.appendChild(createLoadingSkeleton());
            }
        }
    });
}

// Enhanced error handling
function showError(container, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'flex items-center justify-center p-8 text-gray-400';
    errorDiv.innerHTML = `
        <div class="text-center">
            <i class="fa-solid fa-exclamation-triangle text-4xl mb-4 text-netflix-red"></i>
            <p class="text-lg mb-2">Oops! Something went wrong</p>
            <p class="text-sm">${message}</p>
            <button onclick="location.reload()" class="mt-4 bg-netflix-red text-white px-6 py-2 rounded hover:bg-red-700 transition-colors">
                Try Again
            </button>
        </div>
    `;
    container.innerHTML = '';
    container.appendChild(errorDiv);
}

// Export functions for use in home.js
window.createLoadingSkeleton = createLoadingSkeleton;
window.showLoadingSkeletons = showLoadingSkeletons;
window.showError = showError;