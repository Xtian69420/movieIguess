// Toast Notification System with Glassmorphism Effects
class ToastManager {
    constructor() {
        this.toasts = [];
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    // Main method to show toast
    show(message, type = 'message', duration = 4000, options = {}) {
        const toast = this.createToast(message, type, duration, options);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 100);

        // Auto remove toast
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        return toast;
    }

    // Create toast element
    createToast(message, type, duration, options) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Add custom classes if provided
        if (options.className) {
            toast.className += ` ${options.className}`;
        }

        // Get icon and colors based on type
        const config = this.getTypeConfig(type);
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">
                    ${config.icon}
                </div>
                <div class="toast-message">
                    ${options.title ? `<div class="toast-title">${options.title}</div>` : ''}
                    <div class="toast-text">${message}</div>
                </div>
                <button class="toast-close" aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            ${options.showProgress !== false ? '<div class="toast-progress"></div>' : ''}
        `;

        // Add click event to close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });

        // Add click to dismiss (optional)
        if (options.clickToDismiss !== false) {
            toast.addEventListener('click', (e) => {
                if (!e.target.closest('.toast-close')) {
                    this.remove(toast);
                }
            });
        }

        // Add progress bar animation
        if (options.showProgress !== false) {
            const progressBar = toast.querySelector('.toast-progress');
            progressBar.style.animationDuration = `${duration}ms`;
        }

        return toast;
    }

    // Get configuration for each toast type
    getTypeConfig(type) {
        const configs = {
            success: {
                icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                       </svg>`
            },
            error: {
                icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                       </svg>`
            },
            warning: {
                icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <circle cx="12" cy="17" r="1"></circle>
                       </svg>`
            },
            message: {
                icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <circle cx="12" cy="8" r="1"></circle>
                       </svg>`
            }
        };

        return configs[type] || configs.message;
    }

    // Remove toast
    remove(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.add('toast-hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            // Remove from toasts array
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    // Remove all toasts
    removeAll() {
        this.toasts.forEach(toast => {
            this.remove(toast);
        });
    }

    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options.duration || 3000, options);
    }

    error(message, options = {}) {
        return this.show(message, 'error', options.duration || 5000, options);
    }

    warning(message, options = {}) {
        return this.show(message, 'warning', options.duration || 4000, options);
    }

    info(message, options = {}) {
        return this.show(message, 'message', options.duration || 4000, options);
    }
}

// Create global instance
const Toast = new ToastManager();

// Global convenience functions
window.showToast = (message, type, duration, options) => {
    return Toast.show(message, type, duration, options);
};

window.showSuccess = (message, options) => Toast.success(message, options);
window.showError = (message, options) => Toast.error(message, options);
window.showWarning = (message, options) => Toast.warning(message, options);
window.showInfo = (message, options) => Toast.info(message, options);

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Toast, ToastManager };
}