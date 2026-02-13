// Global Search Functionality for OneCore System
// This script provides search functionality across all pages

class GlobalSearch {
    constructor() {
        this.searchTimeout = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeSearch());
        } else {
            this.initializeSearch();
        }
    }

    initializeSearch() {
        const searchInput = document.getElementById('global-search');
        const searchBtn = document.getElementById('search-btn');
        const searchResults = document.getElementById('search-results');
        const searchContent = document.getElementById('search-content');
        const searchLoading = document.getElementById('search-loading');
        
        if (!searchInput || !searchBtn) return;
        
        // Search button click
        searchBtn.addEventListener('click', () => this.performSearch());
        
        // Enter key search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Live search as user types (with debounce)
        searchInput.addEventListener('input', () => {
            clearTimeout(this.searchTimeout);
            const query = searchInput.value.trim();
            
            if (query.length >= 2) {
                this.searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 300);
            } else {
                searchResults.style.display = 'none';
            }
        });
        
        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-search')) {
                searchResults.style.display = 'none';
            }
        });
    }

    async performSearch() {
        const searchInput = document.getElementById('global-search');
        const searchResults = document.getElementById('search-results');
        const searchContent = document.getElementById('search-content');
        const searchLoading = document.getElementById('search-loading');
        
        const query = searchInput.value.trim();
        if (!query) return;
        
        searchResults.style.display = 'block';
        searchLoading.style.display = 'block';
        searchContent.innerHTML = '';
        
        try {
            // Backend search API call
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            });
            
            const data = await response.json();
            this.displaySearchResults(data.results || []);
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to frontend-only search
            const fallbackResults = this.performFrontendSearch(query);
            this.displaySearchResults(fallbackResults);
        } finally {
            searchLoading.style.display = 'none';
        }
    }

    performFrontendSearch(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        // Search through common options and pages
        const searchItems = [
            {
                title: 'AI Decision Engine',
                description: 'Configure AI settings and decision parameters',
                path: 'ai.html',
                keywords: ['ai', 'decision', 'artificial', 'intelligence', 'smart', 'automation']
            },
            {
                title: 'Hardware Configuration',
                description: 'Hardware setup and sensor configuration',
                path: 'hardware.html',
                keywords: ['hardware', 'sensor', 'configuration', 'setup', 'device']
            },
            {
                title: 'User Controls',
                description: 'System controls and user management',
                path: 'controls.html',
                keywords: ['control', 'user', 'settings', 'management', 'permissions']
            },
            {
                title: 'Analytics Dashboard',
                description: 'Performance analytics and data visualization',
                path: 'analytics.html',
                keywords: ['analytics', 'data', 'charts', 'performance', 'statistics']
            },
            {
                title: 'Emergency Controls',
                description: 'Emergency shutdown and safety controls',
                path: 'emergency.html',
                keywords: ['emergency', 'safety', 'shutdown', 'stop', 'alert']
            },
            {
                title: 'Space Dashboard',
                description: 'Main space control dashboard',
                path: 'space.html',
                keywords: ['space', 'dashboard', 'main', 'control', 'overview']
            },
            {
                title: 'Main Dashboard',
                description: 'System overview and main dashboard',
                path: 'index.html',
                keywords: ['dashboard', 'main', 'overview', 'home', 'system']
            },
            {
                title: 'Water Optimization',
                description: 'Water usage optimization and efficiency settings',
                path: 'space.html#water',
                keywords: ['water', 'optimization', 'efficiency', 'usage', 'conservation']
            },
            {
                title: 'Solar Power Management',
                description: 'Solar power configuration and monitoring',
                path: 'space.html#solar',
                keywords: ['solar', 'power', 'energy', 'battery', 'renewable']
            },
            {
                title: 'Remote Access',
                description: 'Remote monitoring and control access',
                path: 'device-link.html',
                keywords: ['remote', 'access', 'monitoring', 'connection', 'mobile']
            },
            {
                title: 'Device Pairing',
                description: 'Pair and link new devices',
                path: 'device-pairing.html',
                keywords: ['device', 'pairing', 'link', 'connect', 'setup']
            },
            {
                title: 'Support & Help',
                description: 'Help documentation and support',
                path: 'support.html',
                keywords: ['support', 'help', 'documentation', 'assistance', 'faq']
            },
            {
                title: 'FAQ',
                description: 'Frequently asked questions',
                path: 'faq.html',
                keywords: ['faq', 'questions', 'answers', 'help', 'common']
            },
            {
                title: 'API Keys',
                description: 'Manage API keys and integrations',
                path: 'api-keys.html',
                keywords: ['api', 'keys', 'integration', 'tokens', 'access']
            },
            {
                title: 'Benchmarks',
                description: 'System performance benchmarks',
                path: 'benchmarks.html',
                keywords: ['benchmark', 'performance', 'test', 'speed', 'metrics']
            },
            {
                title: 'System Setup',
                description: 'Initial system setup and configuration',
                path: 'setup.html',
                keywords: ['setup', 'configuration', 'initial', 'wizard', 'install']
            }
        ];
        
        // Search through irrigation and crop specific items
        const irrigationItems = [
            {
                title: 'Irrigation Schedule',
                description: 'Set up and manage irrigation schedules',
                path: 'space.html#irrigation',
                keywords: ['irrigation', 'schedule', 'watering', 'timing', 'automatic']
            },
            {
                title: 'Soil Monitoring',
                description: 'Monitor soil moisture and conditions',
                path: 'space.html#soil',
                keywords: ['soil', 'moisture', 'monitoring', 'sensors', 'conditions']
            },
            {
                title: 'Crop Management',
                description: 'Manage crop types and growing conditions',
                path: 'space.html#crops',
                keywords: ['crop', 'plants', 'growing', 'agriculture', 'farming']
            },
            {
                title: 'Weather Integration',
                description: 'Weather data and forecasting',
                path: 'space.html#weather',
                keywords: ['weather', 'forecast', 'rain', 'temperature', 'climate']
            }
        ];

        const allItems = [...searchItems, ...irrigationItems];
        
        allItems.forEach(item => {
            const titleMatch = item.title.toLowerCase().includes(lowerQuery);
            const descMatch = item.description.toLowerCase().includes(lowerQuery);
            const keywordMatch = item.keywords.some(keyword => keyword.includes(lowerQuery));
            
            if (titleMatch || descMatch || keywordMatch) {
                results.push(item);
            }
        });
        
        return results;
    }

    displaySearchResults(results) {
        const searchContent = document.getElementById('search-content');
        
        if (results.length === 0) {
            searchContent.innerHTML = '<div class="search-no-results">No results found. Try different keywords.</div>';
            return;
        }
        
        searchContent.innerHTML = results.map(item => `
            <div class="search-item" onclick="GlobalSearch.navigateToResult('${item.path}')">
                <div class="search-item-title">${item.title}</div>
                <div class="search-item-description">${item.description}</div>
                <div class="search-item-path">${item.path}</div>
            </div>
        `).join('');
    }

    static navigateToResult(path) {
        const searchResults = document.getElementById('search-results');
        const searchInput = document.getElementById('global-search');
        
        searchResults.style.display = 'none';
        searchInput.value = '';
        
        if (path.includes('#')) {
            const [page, anchor] = path.split('#');
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            if (page === currentPage || (page === 'index.html' && currentPage === '')) {
                // Same page, just scroll to anchor
                const element = document.getElementById(anchor);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                } else {
                    // If anchor doesn't exist, show notification
                    console.log(`Searching for: ${anchor}`);
                }
            } else {
                window.location.href = path;
            }
        } else {
            window.location.href = path;
        }
    }
}

// Initialize global search when script loads
const globalSearch = new GlobalSearch();

// Make navigateToResult available globally for onclick handlers
window.GlobalSearch = GlobalSearch;
