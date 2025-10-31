// TV Support Script for MovieIGuess
// Handles TV remote navigation and Smart TV optimizations

class TVSupport {
    constructor() {
        this.isTV = this.detectTV();
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.init();
    }

    // Detect if running on TV
    detectTV() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isLargeScreen = window.screen.width >= 1920 && window.screen.height >= 1080;
        const isTVUserAgent = /smart-tv|smarttv|googletv|appletv|hbbtv|pov_tv|netcast|roku|dlnadoc|ce-html/i.test(userAgent);
        const isGamepadConnected = navigator.getGamepads && navigator.getGamepads().some(gamepad => gamepad);
        const isTouchDevice = 'ontouchstart' in window;
        
        // TV detection logic
        return isLargeScreen && (!isTouchDevice || isTVUserAgent || isGamepadConnected);
    }

    init() {
        if (!this.isTV) return;

        console.log('🖥️ TV mode detected - Initializing TV support');
        
        // Add TV-specific styles and behaviors
        this.setupTVInterface();
        this.setupRemoteNavigation();
        this.setupGamepadSupport();
        this.addTVNavigationHints();
        
        // Override default behaviors for TV
        this.overrideTVBehaviors();
    }

    setupTVInterface() {
        // Add TV class to body
        document.body.classList.add('tv-mode');
        
        // Hide cursor
        document.body.style.cursor = 'none';
        
        // Update focusable elements
        this.updateFocusableElements();
        
        // Set initial focus
        if (this.focusableElements.length > 0) {
            this.setFocus(0);
        }
    }

    updateFocusableElements() {
        this.focusableElements = Array.from(document.querySelectorAll(`
            button:not([disabled]),
            .movie-card,
            .series-card,
            .anime-card,
            input:not([disabled]),
            .netflix-button,
            [tabindex]:not([tabindex="-1"])
        `)).filter(el => {
            // Filter out hidden elements
            return el.offsetParent !== null && 
                   getComputedStyle(el).visibility !== 'hidden' &&
                   getComputedStyle(el).display !== 'none';
        });
    }

    setFocus(index) {
        // Remove previous focus
        this.focusableElements.forEach(el => {
            el.classList.remove('tv-focused');
            el.blur();
        });

        // Set new focus
        if (this.focusableElements[index]) {
            this.currentFocusIndex = index;
            const element = this.focusableElements[index];
            element.classList.add('tv-focused');
            element.focus();
            
            // Scroll into view if needed
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }

    setupRemoteNavigation() {
        // TV Remote key handling
        document.addEventListener('keydown', (e) => {
            if (!this.isTV) return;

            this.updateFocusableElements(); // Update in case DOM changed

            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateUp();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateDown();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigateLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigateRight();
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.activateElement();
                    break;
                case 'Escape':
                case 'Backspace':
                    e.preventDefault();
                    this.goBack();
                    break;
                case 'Home':
                    e.preventDefault();
                    window.location.href = 'index.html';
                    break;
            }
        });
    }

    navigateUp() {
        const currentElement = this.focusableElements[this.currentFocusIndex];
        if (!currentElement) return;

        const currentRect = currentElement.getBoundingClientRect();
        let bestMatch = null;
        let bestDistance = Infinity;

        this.focusableElements.forEach((element, index) => {
            if (index === this.currentFocusIndex) return;
            
            const rect = element.getBoundingClientRect();
            if (rect.bottom <= currentRect.top) {
                const distance = Math.abs(rect.left - currentRect.left) + 
                               (currentRect.top - rect.bottom);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = index;
                }
            }
        });

        if (bestMatch !== null) {
            this.setFocus(bestMatch);
        }
    }

    navigateDown() {
        const currentElement = this.focusableElements[this.currentFocusIndex];
        if (!currentElement) return;

        const currentRect = currentElement.getBoundingClientRect();
        let bestMatch = null;
        let bestDistance = Infinity;

        this.focusableElements.forEach((element, index) => {
            if (index === this.currentFocusIndex) return;
            
            const rect = element.getBoundingClientRect();
            if (rect.top >= currentRect.bottom) {
                const distance = Math.abs(rect.left - currentRect.left) + 
                               (rect.top - currentRect.bottom);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = index;
                }
            }
        });

        if (bestMatch !== null) {
            this.setFocus(bestMatch);
        }
    }

    navigateLeft() {
        const currentElement = this.focusableElements[this.currentFocusIndex];
        if (!currentElement) return;

        // For horizontal scrolling containers
        const container = currentElement.closest('.movie-container, .series-container, .anime-container');
        if (container) {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        }

        const currentRect = currentElement.getBoundingClientRect();
        let bestMatch = null;
        let bestDistance = Infinity;

        this.focusableElements.forEach((element, index) => {
            if (index === this.currentFocusIndex) return;
            
            const rect = element.getBoundingClientRect();
            if (rect.right <= currentRect.left && 
                Math.abs(rect.top - currentRect.top) < 100) {
                const distance = currentRect.left - rect.right;
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = index;
                }
            }
        });

        if (bestMatch !== null) {
            this.setFocus(bestMatch);
        } else {
            // Fallback to previous element
            const newIndex = Math.max(0, this.currentFocusIndex - 1);
            this.setFocus(newIndex);
        }
    }

    navigateRight() {
        const currentElement = this.focusableElements[this.currentFocusIndex];
        if (!currentElement) return;

        // For horizontal scrolling containers
        const container = currentElement.closest('.movie-container, .series-container, .anime-container');
        if (container) {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        }

        const currentRect = currentElement.getBoundingClientRect();
        let bestMatch = null;
        let bestDistance = Infinity;

        this.focusableElements.forEach((element, index) => {
            if (index === this.currentFocusIndex) return;
            
            const rect = element.getBoundingClientRect();
            if (rect.left >= currentRect.right && 
                Math.abs(rect.top - currentRect.top) < 100) {
                const distance = rect.left - currentRect.right;
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMatch = index;
                }
            }
        });

        if (bestMatch !== null) {
            this.setFocus(bestMatch);
        } else {
            // Fallback to next element
            const newIndex = Math.min(this.focusableElements.length - 1, this.currentFocusIndex + 1);
            this.setFocus(newIndex);
        }
    }

    activateElement() {
        const element = this.focusableElements[this.currentFocusIndex];
        if (element) {
            element.click();
        }
    }

    goBack() {
        // Check if modal is open
        const modal = document.querySelector('#movieModal:not(.hidden), #searchModal:not(.hidden)');
        if (modal) {
            // Close modal
            if (typeof closeModal === 'function') closeModal();
            if (typeof closeSearchModal === 'function') closeSearchModal();
            return;
        }

        // Navigate back in history
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    }

    setupGamepadSupport() {
        if (!navigator.getGamepads) return;

        const checkGamepads = () => {
            const gamepads = navigator.getGamepads();
            for (let gamepad of gamepads) {
                if (gamepad && gamepad.connected) {
                    this.handleGamepadInput(gamepad);
                }
            }
            requestAnimationFrame(checkGamepads);
        };

        checkGamepads();
    }

    handleGamepadInput(gamepad) {
        // Handle gamepad button presses
        const buttons = gamepad.buttons;
        
        // D-pad navigation
        if (buttons[12] && buttons[12].pressed) this.navigateUp();    // D-pad up
        if (buttons[13] && buttons[13].pressed) this.navigateDown();  // D-pad down
        if (buttons[14] && buttons[14].pressed) this.navigateLeft();  // D-pad left
        if (buttons[15] && buttons[15].pressed) this.navigateRight(); // D-pad right
        
        // Action buttons
        if (buttons[0] && buttons[0].pressed) this.activateElement(); // A button
        if (buttons[1] && buttons[1].pressed) this.goBack();          // B button
    }

    addTVNavigationHints() {
        const hints = document.createElement('div');
        hints.className = 'tv-navigation-hint';
        hints.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div>📺 TV Mode</div>
                <div>🎮 Use remote/gamepad to navigate</div>
                <div>↵ Enter to select</div>
                <div>⟵ Back to return</div>
            </div>
        `;
        document.body.appendChild(hints);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (hints.parentNode) {
                hints.style.opacity = '0';
                setTimeout(() => hints.remove(), 1000);
            }
        }, 10000);
    }

    overrideTVBehaviors() {
        // Override hover effects with focus effects
        const style = document.createElement('style');
        style.textContent = `
            .tv-mode *:hover {
                /* Disable hover effects on TV */
            }
            
            .tv-mode .tv-focused {
                outline: 4px solid #E50914 !important;
                outline-offset: 4px !important;
                transform: scale(1.05) !important;
                z-index: 999 !important;
                box-shadow: 0 0 30px rgba(229, 9, 20, 0.6) !important;
            }
        `;
        document.head.appendChild(style);

        // Update focus when DOM changes
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'hidden']
        });
    }
}

// Initialize TV support when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tvSupport = new TVSupport();
    });
} else {
    window.tvSupport = new TVSupport();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TVSupport;
}