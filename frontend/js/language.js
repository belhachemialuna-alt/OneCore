// Language Translation System
const translations = {
    en: {
        // Header
        'project-title': 'Smart Irrigation System',
        'project-name': 'BAYYTI-B1',
        'analytics-title': 'Smart Irrigation Analytics',
        'emergency-title': 'Emergency Controls',
        'hardware-title': 'Hardware Schema',
        'controls-title': 'User & System Controls',
        'support-title': 'Support & Help',
        
        // Navigation
        'nav-dashboard': 'Dashboard',
        'nav-analytics': 'Analytics',
        'nav-emergency': 'Emergency',
        'nav-hardware': 'Hardware',
        'nav-controls': 'Controls',
        'nav-support': 'Support',
        'nav-faq': 'FAQ',
        
        // Tooltips
        'tooltip-alerts': 'Alerts & Warnings',
        'tooltip-notifications': 'System Notifications',
        'tooltip-updates': 'Check for system updates',
        'tooltip-dashboard': 'Dashboard',
        'tooltip-analytics': 'Analytics',
        'tooltip-emergency': 'Emergency Controls',
        'tooltip-hardware': 'Hardware Schema',
        'tooltip-controls': 'User & System Controls',
        'tooltip-support': 'Support',
        'tooltip-reboot': 'Reboot System',
        
        // Dashboard
        'status-online': 'Online',
        'status-offline': 'Offline',
        'valve-status': 'Valve Status',
        'system-pressure': 'System Pressure',
        'water-flow': 'Water Flow',
        'soil-moisture': 'Soil Moisture',
        'battery-level': 'Battery Level',
        'open': 'Open',
        'closed': 'Closed',
        'active-zones': 'Active Zones',
        
        // Support
        'support-heading': 'Contact Support',
        'support-description': 'Send us a message and we\'ll get back to you as soon as possible',
        'your-email': 'Your Email',
        'your-message': 'Your Message',
        'send-message': 'Send Message',
        'email-placeholder': 'Enter your email address',
        'message-placeholder': 'Describe your issue or question...',
        
        // Footer
        'footer-tagline': 'Smart Irrigation System',
        'footer-powered': 'Powered by AI',
        'footer-links': 'Quick Links',
        'footer-resources': 'Resources',
        'footer-status': 'System Status',
        'footer-device': 'Device',
        'footer-version': 'Version',
        'footer-copyright': '© 2024 BAYYTI Smart Irrigation System. All rights reserved.',
        
        // Emergency
        'emergency-heading': 'Emergency Controls',
        'valve-control': 'Valve Control',
        'open-valve': 'Open Valve',
        'close-valve': 'Close Valve',
        'emergency-stop': 'Emergency Stop',
        'pressure-monitor': 'Pressure Monitor',
        'flow-monitor': 'Flow Monitor',
        
        // Buttons
        'btn-close': 'Close',
        'btn-cancel': 'Cancel',
        'btn-confirm': 'Confirm',
        'btn-save': 'Save',
        'btn-update': 'Update',
        
        // Messages
        'msg-loading': 'Loading...',
        'msg-success': 'Success!',
        'msg-error': 'Error occurred',
        'msg-no-data': 'No data available'
    },
    
    ar: {
        // Header
        'project-title': 'نظام الري الذكي',
        'project-name': 'بيتي-B1',
        'analytics-title': 'تحليلات الري الذكي',
        'emergency-title': 'ضوابط الطوارئ',
        'hardware-title': 'مخطط الأجهزة',
        'controls-title': 'إعدادات المستخدم والنظام',
        'support-title': 'الدعم والمساعدة',
        
        // Navigation
        'nav-dashboard': 'لوحة التحكم',
        'nav-analytics': 'التحليلات',
        'nav-emergency': 'الطوارئ',
        'nav-hardware': 'الأجهزة',
        'nav-controls': 'الإعدادات',
        'nav-support': 'الدعم',
        'nav-faq': 'الأسئلة الشائعة',
        
        // Tooltips
        'tooltip-alerts': 'التنبيهات والتحذيرات',
        'tooltip-notifications': 'إشعارات النظام',
        'tooltip-updates': 'التحقق من تحديثات النظام',
        'tooltip-dashboard': 'لوحة التحكم',
        'tooltip-analytics': 'التحليلات',
        'tooltip-emergency': 'ضوابط الطوارئ',
        'tooltip-hardware': 'مخطط الأجهزة',
        'tooltip-controls': 'إعدادات المستخدم والنظام',
        'tooltip-support': 'الدعم',
        'tooltip-reboot': 'إعادة تشغيل النظام',
        
        // Dashboard
        'status-online': 'متصل',
        'status-offline': 'غير متصل',
        'valve-status': 'حالة الصمام',
        'system-pressure': 'ضغط النظام',
        'water-flow': 'تدفق المياه',
        'soil-moisture': 'رطوبة التربة',
        'battery-level': 'مستوى البطارية',
        'open': 'مفتوح',
        'closed': 'مغلق',
        'active-zones': 'المناطق النشطة',
        
        // Support
        'support-heading': 'اتصل بالدعم',
        'support-description': 'أرسل لنا رسالة وسنعود إليك في أقرب وقت ممكن',
        'your-email': 'بريدك الإلكتروني',
        'your-message': 'رسالتك',
        'send-message': 'إرسال الرسالة',
        'email-placeholder': 'أدخل عنوان بريدك الإلكتروني',
        'message-placeholder': 'صف مشكلتك أو سؤالك...',
        
        // Footer
        'footer-tagline': 'نظام الري الذكي',
        'footer-powered': 'مدعوم بالذكاء الاصطناعي',
        'footer-links': 'روابط سريعة',
        'footer-resources': 'الموارد',
        'footer-status': 'حالة النظام',
        'footer-device': 'الجهاز',
        'footer-version': 'الإصدار',
        'footer-copyright': '© 2024 نظام الري الذكي بيتي. جميع الحقوق محفوظة.',
        
        // Emergency
        'emergency-heading': 'ضوابط الطوارئ',
        'valve-control': 'التحكم بالصمام',
        'open-valve': 'فتح الصمام',
        'close-valve': 'إغلاق الصمام',
        'emergency-stop': 'إيقاف الطوارئ',
        'pressure-monitor': 'مراقب الضغط',
        'flow-monitor': 'مراقب التدفق',
        
        // Buttons
        'btn-close': 'إغلاق',
        'btn-cancel': 'إلغاء',
        'btn-confirm': 'تأكيد',
        'btn-save': 'حفظ',
        'btn-update': 'تحديث',
        
        // Messages
        'msg-loading': 'جاري التحميل...',
        'msg-success': 'نجح!',
        'msg-error': 'حدث خطأ',
        'msg-no-data': 'لا توجد بيانات متاحة'
    },
    
    fr: {
        // Header
        'project-title': 'Système d\'Irrigation Intelligent',
        'project-name': 'BAYYTI-B1',
        'analytics-title': 'Analyses d\'Irrigation Intelligente',
        'emergency-title': 'Contrôles d\'Urgence',
        'hardware-title': 'Schéma Matériel',
        'controls-title': 'Contrôles Utilisateur et Système',
        'support-title': 'Assistance et Aide',
        
        // Navigation
        'nav-dashboard': 'Tableau de Bord',
        'nav-analytics': 'Analyses',
        'nav-emergency': 'Urgence',
        'nav-hardware': 'Matériel',
        'nav-controls': 'Contrôles',
        'nav-support': 'Assistance',
        'nav-faq': 'FAQ',
        
        // Tooltips
        'tooltip-alerts': 'Alertes et Avertissements',
        'tooltip-notifications': 'Notifications Système',
        'tooltip-updates': 'Vérifier les mises à jour',
        'tooltip-dashboard': 'Tableau de Bord',
        'tooltip-analytics': 'Analyses',
        'tooltip-emergency': 'Contrôles d\'Urgence',
        'tooltip-hardware': 'Schéma Matériel',
        'tooltip-controls': 'Contrôles',
        'tooltip-support': 'Assistance',
        'tooltip-reboot': 'Redémarrer le Système',
        
        // Dashboard
        'status-online': 'En Ligne',
        'status-offline': 'Hors Ligne',
        'valve-status': 'État de la Vanne',
        'system-pressure': 'Pression du Système',
        'water-flow': 'Débit d\'Eau',
        'soil-moisture': 'Humidité du Sol',
        'battery-level': 'Niveau de Batterie',
        'open': 'Ouvert',
        'closed': 'Fermé',
        'active-zones': 'Zones Actives',
        
        // Support
        'support-heading': 'Contacter l\'Assistance',
        'support-description': 'Envoyez-nous un message et nous vous répondrons dès que possible',
        'your-email': 'Votre Email',
        'your-message': 'Votre Message',
        'send-message': 'Envoyer le Message',
        'email-placeholder': 'Entrez votre adresse email',
        'message-placeholder': 'Décrivez votre problème ou question...',
        
        // Footer
        'footer-tagline': 'Système d\'Irrigation Intelligent',
        'footer-powered': 'Propulsé par IA',
        'footer-links': 'Liens Rapides',
        'footer-resources': 'Ressources',
        'footer-status': 'État du Système',
        'footer-device': 'Appareil',
        'footer-version': 'Version',
        'footer-copyright': '© 2024 Système d\'Irrigation Intelligent BAYYTI. Tous droits réservés.',
        
        // Emergency
        'emergency-heading': 'Contrôles d\'Urgence',
        'valve-control': 'Contrôle de Vanne',
        'open-valve': 'Ouvrir la Vanne',
        'close-valve': 'Fermer la Vanne',
        'emergency-stop': 'Arrêt d\'Urgence',
        'pressure-monitor': 'Moniteur de Pression',
        'flow-monitor': 'Moniteur de Débit',
        
        // Buttons
        'btn-close': 'Fermer',
        'btn-cancel': 'Annuler',
        'btn-confirm': 'Confirmer',
        'btn-save': 'Enregistrer',
        'btn-update': 'Mettre à Jour',
        
        // Messages
        'msg-loading': 'Chargement...',
        'msg-success': 'Succès!',
        'msg-error': 'Erreur survenue',
        'msg-no-data': 'Aucune donnée disponible'
    }
};

// Get current language from localStorage or default to 'en'
function getCurrentLanguage() {
    return localStorage.getItem('app-language') || 'en';
}

// Set language
function setLanguage(lang) {
    localStorage.setItem('app-language', lang);
    applyTranslations(lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update direction for Arabic
    if (lang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl');
    } else {
        document.documentElement.dir = 'ltr';
        document.body.classList.remove('rtl');
    }
    
    // Update language selector
    updateLanguageSelector(lang);
}

// Apply translations to page
function applyTranslations(lang) {
    const trans = translations[lang];
    if (!trans) return;
    
    // Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (trans[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = trans[key];
            } else {
                element.textContent = trans[key];
            }
        }
    });
    
    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (trans[key]) {
            element.title = trans[key];
        }
    });
}

// Update language selector display
function updateLanguageSelector(lang) {
    const flags = {
        en: '🇬🇧',
        ar: '🇸🇦',
        fr: '🇫🇷'
    };
    
    const names = {
        en: 'English',
        ar: 'العربية',
        fr: 'Français'
    };
    
    const selector = document.getElementById('languageSelector');
    if (selector) {
        selector.innerHTML = `${flags[lang]} ${names[lang]}`;
    }
}

// Initialize language system
function initLanguageSystem() {
    const currentLang = getCurrentLanguage();
    setLanguage(currentLang);
    
    // Create language dropdown if it doesn't exist
    createLanguageDropdown();
}

// Create language dropdown
function createLanguageDropdown() {
    // Check if language button exists in header
    const headerRight = document.querySelector('.header-right');
    if (!headerRight) return;
    
    // Check if already exists
    if (document.getElementById('languageDropdown')) return;
    
    // Create language button and dropdown
    const languageBtn = document.createElement('button');
    languageBtn.className = 'header-icon-btn';
    languageBtn.id = 'languageSelector';
    languageBtn.title = 'Change Language';
    languageBtn.innerHTML = '<i class="fa-solid fa-globe"></i>';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'language-dropdown';
    dropdown.id = 'languageDropdown';
    dropdown.style.display = 'none';
    dropdown.innerHTML = `
        <button class="lang-option" data-lang="en">
            <span class="flag">🇬🇧</span>
            <span>English</span>
        </button>
        <button class="lang-option" data-lang="ar">
            <span class="flag">🇸🇦</span>
            <span>العربية</span>
        </button>
        <button class="lang-option" data-lang="fr">
            <span class="flag">🇫🇷</span>
            <span>Français</span>
        </button>
    `;
    
    // Insert before reboot button
    const rebootBtn = document.querySelector('.reboot-btn');
    if (rebootBtn) {
        headerRight.insertBefore(languageBtn, rebootBtn);
    } else {
        headerRight.appendChild(languageBtn);
    }
    
    // Add dropdown after button
    languageBtn.parentElement.appendChild(dropdown);
    
    // Toggle dropdown
    languageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
    });
    
    // Language selection
    dropdown.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
            dropdown.style.display = 'none';
            
            // Reload page to apply translations
            window.location.reload();
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdown.style.display = 'none';
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSystem);
} else {
    initLanguageSystem();
}

// Export functions
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;
