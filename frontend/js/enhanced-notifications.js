/**
 * Enhanced Clean Black Notification System
 * Provides smooth, modern notifications with clean black styling
 */

class EnhancedNotificationSystem {
    constructor() {
        this.notifications = [];
        this.notificationId = 0;
        this.maxNotifications = 50;
        this.autoCloseDelay = 5000;
        this.init();
    }

    init() {
        this.createNotificationPanel();
        this.setupEventListeners();
        this.loadStoredNotifications();
    }

    createNotificationPanel() {
        // Check if panel already exists
        if (document.getElementById('notificationPanel')) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.className = 'notification-panel';
        
        panel.innerHTML = `
            <div class="notification-header">
                <h3><i class="fa-solid fa-bell"></i> Notifications</h3>
                <button class="close-panel" onclick="notificationSystem.closePanel()">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            <div class="notification-list" id="notificationList">
                <div class="notification-empty" id="notificationEmpty">
                    <i class="fa-solid fa-bell-slash"></i>
                    <h4>No Notifications</h4>
                    <p>You're all caught up! New notifications will appear here.</p>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    setupEventListeners() {
        // Notification button click - use setTimeout to ensure DOM is ready
        setTimeout(() => {
            const notificationBtn = document.getElementById('notificationBtn');
            if (notificationBtn) {
                // Remove any existing listeners first
                notificationBtn.removeEventListener('click', this.togglePanel);
                notificationBtn.addEventListener('click', () => this.togglePanel());
                console.log('Notification button listener attached successfully');
            } else {
                console.warn('Notification button not found');
            }
        }, 100);

        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notificationPanel');
            const btn = document.getElementById('notificationBtn');
            
            if (panel && panel.classList.contains('active') && 
                !panel.contains(e.target) && !btn.contains(e.target)) {
                this.closePanel();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePanel();
            }
        });
    }

    togglePanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.toggle('active');
            this.updateEmptyState();
        }
    }

    openPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.add('active');
            this.updateEmptyState();
        }
    }

    closePanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.remove('active');
        }
    }

    addNotification(message, type = 'info', options = {}) {
        const notification = {
            id: ++this.notificationId,
            message: message,
            type: type,
            timestamp: new Date(),
            priority: options.priority || 'medium',
            title: options.title || this.getDefaultTitle(type),
            icon: options.icon || this.getDefaultIcon(type),
            persistent: options.persistent || false,
            autoClose: options.autoClose !== false
        };

        this.notifications.unshift(notification);
        
        // Limit notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }

        this.renderNotifications();
        this.updateBadge();
        this.saveNotifications();

        // Show toast if panel is closed
        const panel = document.getElementById('notificationPanel');
        if (!panel || !panel.classList.contains('active')) {
            this.showToast(notification);
        }

        // Auto-close non-persistent notifications
        if (notification.autoClose && !notification.persistent) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, this.autoCloseDelay);
        }

        return notification.id;
    }

    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.renderNotifications();
        this.updateBadge();
        this.saveNotifications();
    }

    clearAllNotifications() {
        this.notifications = [];
        this.renderNotifications();
        this.updateBadge();
        this.saveNotifications();
    }

    renderNotifications() {
        const list = document.getElementById('notificationList');
        if (!list) return;

        if (this.notifications.length === 0) {
            this.updateEmptyState();
            return;
        }

        list.innerHTML = this.notifications.map(notification => 
            this.createNotificationHTML(notification)
        ).join('');

        this.updateEmptyState();
    }

    createNotificationHTML(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const priorityClass = notification.priority ? `priority-${notification.priority}` : '';
        
        return `
            <div class="notification-item ${notification.type} ${priorityClass}" data-id="${notification.id}">
                <div class="notification-item-header">
                    <i class="${notification.icon}"></i>
                    <strong>${notification.title}</strong>
                    ${notification.priority !== 'low' ? `<span class="notification-priority">${notification.priority}</span>` : ''}
                </div>
                <p>${notification.message}</p>
                <div class="notification-item-footer">
                    <span class="notification-item-time">${timeAgo}</span>
                    <button class="notification-dismiss" onclick="notificationSystem.removeNotification(${notification.id})" title="Dismiss">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateEmptyState() {
        const list = document.getElementById('notificationList');
        const empty = document.getElementById('notificationEmpty');
        
        if (!list || !empty) return;

        if (this.notifications.length === 0) {
            empty.style.display = 'flex';
        } else {
            empty.style.display = 'none';
        }
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        const count = this.notifications.length;
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
        }
    }

    showToast(notification) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification ${notification.type}`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${notification.icon}"></i>
                <div class="toast-message">
                    <strong>${notification.title}</strong><br>
                    ${notification.message}
                </div>
            </div>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto-remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        });
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }

    getDefaultIcon(type) {
        const icons = {
            success: 'fa-solid fa-check-circle',
            error: 'fa-solid fa-exclamation-circle',
            warning: 'fa-solid fa-exclamation-triangle',
            info: 'fa-solid fa-info-circle'
        };
        return icons[type] || 'fa-solid fa-bell';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    saveNotifications() {
        try {
            const data = {
                notifications: this.notifications.slice(0, 20), // Save only recent 20
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('enhanced_notifications', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save notifications:', e);
        }
    }

    loadStoredNotifications() {
        try {
            const stored = localStorage.getItem('enhanced_notifications');
            if (stored) {
                const data = JSON.parse(stored);
                
                // Only load notifications from last 24 hours
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                
                this.notifications = data.notifications
                    .map(n => ({...n, timestamp: new Date(n.timestamp)}))
                    .filter(n => n.timestamp > dayAgo);
                
                this.renderNotifications();
                this.updateBadge();
            }
        } catch (e) {
            console.warn('Failed to load stored notifications:', e);
        }
    }

    // Convenience methods for different notification types
    success(message, options = {}) {
        return this.addNotification(message, 'success', {
            title: 'Success',
            icon: 'fa-solid fa-check-circle',
            ...options
        });
    }

    error(message, options = {}) {
        return this.addNotification(message, 'error', {
            title: 'Error',
            icon: 'fa-solid fa-exclamation-circle',
            priority: 'high',
            persistent: true,
            ...options
        });
    }

    warning(message, options = {}) {
        return this.addNotification(message, 'warning', {
            title: 'Warning',
            icon: 'fa-solid fa-exclamation-triangle',
            priority: 'medium',
            ...options
        });
    }

    info(message, options = {}) {
        return this.addNotification(message, 'info', {
            title: 'Information',
            icon: 'fa-solid fa-info-circle',
            ...options
        });
    }
}

// Initialize the notification system
let notificationSystem;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        notificationSystem = new EnhancedNotificationSystem();
        window.notificationSystem = notificationSystem;
    });
} else {
    notificationSystem = new EnhancedNotificationSystem();
    window.notificationSystem = notificationSystem;
}

// Global function for backward compatibility
function showNotification(message, type = 'info', options = {}) {
    if (notificationSystem) {
        return notificationSystem.addNotification(message, type, options);
    }
}

// Make functions globally available
window.showNotification = showNotification;

// Page transition enhancements
function addPageTransitions() {
    // Add transition class to body
    document.body.classList.add('page-transition');
    
    // Handle page navigation with smooth transitions
    const links = document.querySelectorAll('a[href$=".html"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                e.preventDefault();
                
                // Add fade out effect
                document.body.classList.add('page-fade-out');
                
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });
    });
    
    // Add fade in effect when page loads
    window.addEventListener('load', () => {
        document.body.classList.add('page-fade-in');
    });
}

// Initialize page transitions
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addPageTransitions);
} else {
    addPageTransitions();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedNotificationSystem, showNotification };
}
