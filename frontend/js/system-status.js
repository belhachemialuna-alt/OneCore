/**
 * System Status Indicator
 * Fetches system status from backend and displays visual indicator
 */

class SystemStatusManager {
    constructor() {
        this.statusEndpoint = '/api/system/status';
        this.statusIndicator = document.getElementById('systemStatusIndicator');
        this.statusIcon = document.getElementById('statusIcon');
        this.statusText = document.getElementById('statusText');
        this.refreshInterval = 30000; // 30 seconds
        this.intervalId = null;
        
        this.init();
    }
    
    init() {
        if (!this.statusIndicator) {
            console.warn('System status indicator not found');
            return;
        }
        
        this.fetchSystemStatus();
        this.startAutoRefresh();
    }
    
    async fetchSystemStatus() {
        try {
            // Simulate backend call - replace with actual API endpoint
            const response = await this.mockSystemStatusAPI();
            this.updateStatusIndicator(response);
        } catch (error) {
            console.error('Failed to fetch system status:', error);
            this.updateStatusIndicator({
                status: 'offline',
                message: 'Connection Error'
            });
        }
    }
    
    // Mock API - replace with actual backend call
    async mockSystemStatusAPI() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate different status conditions
                const statuses = [
                    { status: 'online', message: 'All Systems Online' },
                    { status: 'online', message: 'Connected' },
                    { status: 'warning', message: 'Minor Issues' },
                    { status: 'offline', message: 'Connection Lost' }
                ];
                
                // 80% chance of online, 15% warning, 5% offline
                const rand = Math.random();
                let selectedStatus;
                
                if (rand < 0.8) {
                    selectedStatus = statuses[Math.random() < 0.5 ? 0 : 1];
                } else if (rand < 0.95) {
                    selectedStatus = statuses[2];
                } else {
                    selectedStatus = statuses[3];
                }
                
                resolve(selectedStatus);
            }, 500);
        });
    }
    
    updateStatusIndicator(statusData) {
        if (!this.statusIndicator || !statusData) return;
        
        // Remove existing status classes
        this.statusIndicator.classList.remove('offline', 'warning', 'online');
        
        // Add new status class
        this.statusIndicator.classList.add(statusData.status);
        
        // Update text
        if (this.statusText) {
            this.statusText.textContent = statusData.message || this.getStatusText(statusData.status);
        }
        
        // Update icon color is handled by CSS classes
        console.log(`System Status Updated: ${statusData.status} - ${statusData.message}`);
    }
    
    getStatusText(status) {
        const statusTexts = {
            online: 'System Online',
            warning: 'System Warning',
            offline: 'System Offline'
        };
        
        return statusTexts[status] || 'Unknown Status';
    }
    
    startAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.intervalId = setInterval(() => {
            this.fetchSystemStatus();
        }, this.refreshInterval);
    }
    
    stopAutoRefresh() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    // Manual refresh method
    refresh() {
        this.fetchSystemStatus();
    }
    
    // Cleanup method
    destroy() {
        this.stopAutoRefresh();
    }
}

// Initialize system status manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.systemStatusManager = new SystemStatusManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.systemStatusManager) {
        window.systemStatusManager.destroy();
    }
});
