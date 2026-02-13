// Language Switch Functionality
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('app_language') || 'en';
        this.translations = {
            en: {
                // Header
                'alerts_warnings': 'Alerts & Warnings',
                'system_notifications': 'System Notifications',
                'check_updates': 'Check for system updates',
                'analytics_dashboard': 'View Analytics Dashboard',
                'emergency_controls': 'Emergency Controls',
                'hardware_schema': 'Hardware Schema',
                'user_system_controls': 'User & System Controls',
                'ai_model_testing': 'AI Model Testing',
                'support': 'Support',
                'faq': 'FAQ',
                'switch_language': 'Switch Language',
                'return_setup': 'Return to Setup',
                'reboot_system': 'Reboot System',
                'dashboard': 'Dashboard',
                
                // Navigation
                'space_dashboard': 'Space Dashboard',
                'search_placeholder': 'Search options, controls, settings...',
                'searching': 'Searching...',
                
                // Common
                'loading': 'Loading...',
                'menu': 'Menu',
                'close_menu': 'Close Menu'
            },
            fr: {
                // Header
                'alerts_warnings': 'Alertes et Avertissements',
                'system_notifications': 'Notifications Système',
                'check_updates': 'Vérifier les mises à jour système',
                'analytics_dashboard': 'Voir le Tableau de Bord Analytique',
                'emergency_controls': 'Contrôles d\'Urgence',
                'hardware_schema': 'Schéma Matériel',
                'user_system_controls': 'Contrôles Utilisateur et Système',
                'ai_model_testing': 'Test de Modèle IA',
                'support': 'Support',
                'faq': 'FAQ',
                'switch_language': 'Changer de Langue',
                'return_setup': 'Retour à la Configuration',
                'reboot_system': 'Redémarrer le Système',
                'dashboard': 'Tableau de Bord',
                
                // Navigation
                'space_dashboard': 'Tableau de Bord Spatial',
                'search_placeholder': 'Rechercher options, contrôles, paramètres...',
                'searching': 'Recherche...',
                
                // Common
                'loading': 'Chargement...',
                'menu': 'Menu',
                'close_menu': 'Fermer le Menu'
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupLanguageButton();
        this.applyTranslations();
    }
    
    setupLanguageButton() {
        const languageBtn = document.getElementById('languageBtn');
        if (languageBtn) {
            languageBtn.addEventListener('click', () => {
                this.toggleLanguage();
            });
            
            // Update button title
            languageBtn.title = this.translate('switch_language');
        }
    }
    
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'fr' : 'en';
        localStorage.setItem('app_language', this.currentLanguage);
        this.applyTranslations();
        
        // Show language change notification
        this.showLanguageNotification();
    }
    
    translate(key) {
        return this.translations[this.currentLanguage][key] || this.translations['en'][key] || key;
    }
    
    applyTranslations() {
        // Header buttons
        const elements = {
            '#alertBtn': 'alerts_warnings',
            '#notificationBtn': 'system_notifications',
            '#updateBtnMain': 'check_updates',
            '#languageBtn': 'switch_language',
            '#rebootBtn': 'reboot_system',
            '#setup-link': 'return_setup',
            '[title="View Analytics Dashboard"]': 'analytics_dashboard',
            '[title="Emergency Controls"]': 'emergency_controls',
            '[title="Hardware Schema"]': 'hardware_schema',
            '[title="User & System Controls"]': 'user_system_controls',
            '[title="AI Model Testing"]': 'ai_model_testing',
            '[title="Support"]': 'support',
            '[title="FAQ"]': 'faq',
            '[title="Dashboard"]': 'dashboard'
        };
        
        Object.entries(elements).forEach(([selector, key]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.title = this.translate(key);
            }
        });
        
        // Navigation text
        const navTitle = document.querySelector('.nav-title span');
        if (navTitle) {
            const currentPage = this.getCurrentPageType();
            if (currentPage) {
                navTitle.textContent = this.translate(currentPage);
            }
        }
        
        // Mobile page title
        const mobilePageTitle = document.querySelector('.mobile-page-title-text');
        if (mobilePageTitle) {
            const currentPage = this.getCurrentPageType();
            if (currentPage) {
                mobilePageTitle.textContent = this.translate(currentPage);
            }
        }
        
        // Search placeholder
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.placeholder = this.translate('search_placeholder');
        }
        
        // Loading text
        const loaderText = document.querySelector('.loader-text');
        if (loaderText) {
            loaderText.textContent = this.translate('loading');
        }
        
        // Searching text
        const searchingText = document.querySelector('#search-loading span');
        if (searchingText) {
            searchingText.textContent = this.translate('searching');
        }
        
        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-label', this.translate('menu'));
        }
        
        const sidebarClose = document.getElementById('sidebar-close');
        if (sidebarClose) {
            sidebarClose.setAttribute('aria-label', this.translate('close_menu'));
        }
    }
    
    getCurrentPageType() {
        const path = window.location.pathname;
        if (path.includes('space.html')) return 'space_dashboard';
        if (path.includes('faq.html')) return 'faq';
        if (path.includes('controls.html')) return 'user_system_controls';
        if (path.includes('emergency.html')) return 'emergency_controls';
        if (path.includes('analytics.html')) return 'analytics_dashboard';
        if (path.includes('support.html')) return 'support';
        if (path.includes('ai.html')) return 'ai_model_testing';
        if (path.includes('hardware.html')) return 'hardware_schema';
        return 'dashboard';
    }
    
    showLanguageNotification() {
        const notification = document.createElement('div');
        notification.className = 'language-notification';
        notification.innerHTML = `
            <i class="fa-solid fa-globe"></i>
            <span>${this.currentLanguage === 'en' ? 'Language changed to English' : 'Langue changée en Français'}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize language manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
});

// Export for use in other scripts
window.LanguageManager = LanguageManager;
