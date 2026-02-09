/**
 * Valve Statistics Manager
 * Tracks and displays valve open count and duration statistics
 */

class ValveStatsManager {
    constructor() {
        this.stats = {
            totalOpens: 0,
            totalDuration: 0,
            todayOpens: 0,
            avgDuration: 0
        };
        
        this.init();
    }
    
    init() {
        this.loadStats();
        this.updateDisplay();
        this.startAutoUpdate();
    }
    
    async loadStats() {
        try {
            // Fetch valve statistics from API
            const response = await fetch('/api/valve/stats');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.stats = {
                        totalOpens: data.data.total_opens || 0,
                        totalDuration: data.data.total_duration || 0,
                        todayOpens: data.data.today_opens || 0,
                        avgDuration: data.data.avg_duration || 0
                    };
                }
            } else {
                // Use mock data if API fails
                this.generateMockStats();
            }
        } catch (error) {
            console.error('Error loading valve stats:', error);
            this.generateMockStats();
        }
        
        this.updateDisplay();
    }
    
    generateMockStats() {
        // Generate realistic mock data
        this.stats = {
            totalOpens: Math.floor(Math.random() * 500) + 100,
            totalDuration: Math.floor(Math.random() * 5000) + 1000,
            todayOpens: Math.floor(Math.random() * 10) + 1,
            avgDuration: Math.floor(Math.random() * 30) + 10
        };
    }
    
    updateDisplay() {
        // Update valve open count
        const openCountEl = document.getElementById('valve-open-count');
        if (openCountEl) {
            openCountEl.textContent = this.stats.totalOpens.toLocaleString();
        }
        
        // Update total duration
        const totalDurationEl = document.getElementById('valve-total-duration');
        if (totalDurationEl) {
            totalDurationEl.textContent = this.formatDuration(this.stats.totalDuration);
        }
        
        // Update today's opens
        const todayCountEl = document.getElementById('valve-today-count');
        if (todayCountEl) {
            todayCountEl.textContent = this.stats.todayOpens.toLocaleString();
        }
        
        // Update average duration
        const avgDurationEl = document.getElementById('valve-avg-duration');
        if (avgDurationEl) {
            avgDurationEl.textContent = this.formatDuration(this.stats.avgDuration);
        }
    }
    
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${Math.round(minutes)} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = Math.round(minutes % 60);
            return `${hours}h ${mins}m`;
        }
    }
    
    incrementOpenCount() {
        this.stats.totalOpens++;
        this.stats.todayOpens++;
        this.updateDisplay();
        this.saveStats();
    }
    
    addDuration(minutes) {
        this.stats.totalDuration += minutes;
        this.stats.avgDuration = this.stats.totalDuration / this.stats.totalOpens;
        this.updateDisplay();
        this.saveStats();
    }
    
    async saveStats() {
        try {
            await fetch('/api/valve/stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.stats)
            });
        } catch (error) {
            console.error('Error saving valve stats:', error);
        }
    }
    
    startAutoUpdate() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.loadStats();
        }, 30000);
    }
}

// Initialize valve stats manager
let valveStatsManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        valveStatsManager = new ValveStatsManager();
    });
} else {
    valveStatsManager = new ValveStatsManager();
}

// Sync irrigation control buttons
document.addEventListener('DOMContentLoaded', () => {
    // Sync start buttons
    const startBtn = document.getElementById('start-irrigation-right');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (valveStatsManager) {
                valveStatsManager.incrementOpenCount();
            }
            // Update valve badge
            const badge = document.getElementById('valve-badge-right');
            if (badge) {
                badge.textContent = 'ON';
                badge.classList.add('active');
            }
        });
    }
    
    // Sync stop buttons
    const stopBtn = document.getElementById('stop-irrigation-right');
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            // Update valve badge
            const badge = document.getElementById('valve-badge-right');
            if (badge) {
                badge.textContent = 'OFF';
                badge.classList.remove('active');
            }
        });
    }
    
    // Emergency stop
    const emergencyBtn = document.getElementById('emergency-stop-right');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => {
            // Update valve badge
            const badge = document.getElementById('valve-badge-right');
            if (badge) {
                badge.textContent = 'OFF';
                badge.classList.remove('active');
            }
        });
    }
});
