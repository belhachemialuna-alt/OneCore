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
                'close_menu': 'Close Menu',
                
                // Space Dashboard Page
                'nav-space': 'Space Dashboard',
                'irrigation-tasks-calendar': 'Irrigation Tasks Calendar',
                'tasks-scheduled': 'Tasks Scheduled',
                'auto-refresh': 'Auto-refresh',
                'active-zones': 'Active Zones',
                'system-status': 'System Status',
                'water-usage': 'Water Usage Today',
                'temperature': 'Temperature',
                'humidity': 'Humidity',
                'soil-moisture': 'Soil Moisture',
                'weather-forecast': 'Weather Forecast',
                'schedule-irrigation': 'Schedule Irrigation',
                'quick-actions': 'Quick Actions',
                'manual-watering': 'Manual Watering',
                'view-reports': 'View Reports',
                'system-settings': 'System Settings',
                
                // Analytics Page
                'nav-analytics': 'Performance Benchmarks',
                'suspected-farmland': 'Suspected farmland statistics',
                'ai-doubt-stats': 'AI doubt category statistics',
                'area-of-doubt': 'Area of doubt',
                'total-area': 'Total Area',
                'water-consumption': 'Water Consumption',
                'irrigation-efficiency': 'Irrigation Efficiency',
                'crop-yield': 'Crop Yield Analysis',
                'weather-impact': 'Weather Impact',
                'export-data': 'Export Data',
                'generate-report': 'Generate Report',
                
                // Hardware Page
                'nav-hardware': 'Hardware Schema',
                'system-overview': 'System Overview',
                'device-status': 'Device Status',
                'sensor-readings': 'Sensor Readings',
                'network-connectivity': 'Network Connectivity',
                'cpu-usage': 'CPU Usage',
                'memory-usage': 'Memory Usage',
                'storage-info': 'Storage Information',
                'temperature-monitoring': 'Temperature Monitoring',
                'diagnostics': 'Diagnostics',
                'maintenance-mode': 'Maintenance Mode',
                
                // Controls Page
                'nav-controls': 'User & System Controls',
                'user-account': 'User Account',
                'profile-info': 'Profile Information',
                'profile-desc': 'Update your personal information',
                'full-name': 'Full Name',
                'email-address': 'Email Address',
                'role': 'Role',
                'administrator': 'Administrator',
                'operator': 'Operator',
                'viewer': 'Viewer',
                'save-changes': 'Save Changes',
                'change-password': 'Change Password',
                'change-password-desc': 'Update your account password',
                'current-password': 'Current Password',
                'new-password': 'New Password',
                'confirm-password': 'Confirm Password',
                'update-password': 'Update Password',
                'user-access-control': 'User Access Control',
                'add-new-user': 'Add New User',
                'user': 'User',
                'email': 'Email',
                'status': 'Status',
                'last-login': 'Last Login',
                'actions': 'Actions',
                'active': 'Active',
                'just-now': 'Just now',
                
                // Emergency Page
                'nav-emergency': 'Emergency Controls',
                'emergency-stop': 'Emergency Stop',
                'system-shutdown': 'System Shutdown',
                'water-shutoff': 'Water Shutoff',
                'alert-notifications': 'Alert Notifications',
                'emergency-contacts': 'Emergency Contacts',
                'backup-systems': 'Backup Systems',
                'restore-operations': 'Restore Operations',
                
                // AI Page
                'nav-ai': 'AI Model Testing',
                'model-performance': 'Model Performance',
                'training-data': 'Training Data',
                'prediction-accuracy': 'Prediction Accuracy',
                'model-settings': 'Model Settings',
                'run-test': 'Run Test',
                'analyze-results': 'Analyze Results',
                
                // FAQ Page
                'nav-faq': 'Frequently Asked Questions',
                'search-faq': 'Search FAQ',
                'general-questions': 'General Questions',
                'technical-support': 'Technical Support',
                'troubleshooting': 'Troubleshooting',
                'installation-guide': 'Installation Guide',
                'contact-support': 'Contact Support',
                
                // Additional Space Dashboard content
                'irrigation-control': 'Irrigation Control',
                'start-irrigation': 'Start Irrigation',
                'stop-irrigation': 'Stop Irrigation',
                'emergency-stop': 'Emergency Stop',
                'ask-assistant': 'Ask Assistant',
                'duration': 'Duration',
                'water-used': 'Water Used',
                'last-irrigation': 'Last Irrigation',
                'real-time-sensor-data': 'Real-Time Sensor Data',
                'soil-moisture': 'Soil Moisture',
                'battery-level': 'Battery Level',
                'loading': 'Loading...',
                'off': 'OFF',
                'on': 'ON',
                
                // Additional Analytics page content
                'ai-confidence': 'AI Confidence',
                'data-points': 'Data Points',
                'real-time-monitoring': 'Real-time monitoring & analysis',
                'select-zone': 'Select Zone for Analysis',
                'export-pdf': 'Export to PDF',
                'trend-analysis': 'Trend Analysis',
                
                // Hardware page content
                'device-id': 'Device ID',
                'copy-device-id': 'Copy Device ID',
                'device-setup-hint': 'Copy ID → Visit cloud.ielivate.com → Add Device → Verify Connection',
                'component-status': 'Component Status',
                'system-performance': 'System Performance',
                'cpu-cores': '1 Core',
                'normal': 'Normal',
                
                // Emergency page content
                'pressure-monitor': 'Pressure Monitor',
                'normal-pressure-range': 'Normal: 2.0 - 3.5 bar',
                'active-alerts-warnings': 'Active Alerts & Warnings',
                'emergency-valve-control': 'Emergency Valve Control',
                'main-irrigation-valve': 'Main Irrigation Valve',
                'closed': 'CLOSED',
                'last-action': 'Last action',
                'open-valve': 'OPEN VALVE',
                'close-valve': 'CLOSE VALVE',
                'flow-rate': 'Flow Rate',
                'no-flow': 'No Flow',
                
                // Controls page content (many already have data-i18n attributes)
                'general-settings': 'General Settings',
                'device-info': 'Device Information',
                'device-info-desc': 'System hardware and software details',
                'device-name': 'Device Name',
                'hardware': 'Hardware',
                'software-version': 'Software Version',
                'uptime': 'Uptime',
                'date-time': 'Date & Time',
                'date-time-desc': 'Configure system date and time',
                'timezone': 'Timezone',
                'time-format': 'Time Format',
                'apply-settings': 'Apply Settings',
                'display-preferences': 'Display & Preferences',
                'dark-mode': 'Dark Mode',
                'dark-mode-desc': 'Switch to dark theme (Coming Soon)',
                
                // Setup page content
                'welcome-to-pulse': 'Welcome to Pulse',
                'smart-irrigation-subtitle': 'Smart Irrigation System with AI Decision Making',
                'water-optimization': 'Water Optimization',
                'water-optimization-desc': 'Save up to 40% water with intelligent irrigation',
                'solar-powered': 'Solar Powered',
                'solar-powered-desc': 'Eco-friendly operation with battery backup',
                'decisions': 'Decisions',
                'decisions-desc': 'Smart irrigation based on crop and soil needs',
                'remote-control': 'Remote Control',
                'remote-control-desc': 'Monitor and control from anywhere',
                'get-started': 'Get Started',
                'network-setup': 'Network Setup',
                'connect-device': 'Connect your device to internet',
                'system-configuration': 'System Configuration', 
                'crop-soil-setup': 'Crop & Soil Setup',
                'irrigation-schedule': 'Irrigation Schedule',
                'setup-complete': 'Setup Complete',
                'network-configured': 'Network configured',
                'location-set': 'Location set',
                'zones-configured': 'Zones configured',
                'reset-setup': 'Reset Setup',
                'go-to-dashboard': 'Go to Dashboard',
                'loading': 'Loading...',
                'welcome': 'Welcome',
                'network': 'Network',
                'system': 'System',
                'crop-soil': 'Crop & Soil',
                'schedule': 'Schedule',
                'start-setup': 'Start Setup'
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
                'close_menu': 'Fermer le Menu',
                
                // Space Dashboard Page
                'nav-space': 'Tableau de Bord Spatial',
                'irrigation-tasks-calendar': 'Calendrier des Tâches d\'Irrigation',
                'tasks-scheduled': 'Tâches Programmées',
                'auto-refresh': 'Actualisation automatique',
                'active-zones': 'Zones Actives',
                'system-status': 'État du Système',
                'water-usage': 'Utilisation d\'Eau Aujourd\'hui',
                'temperature': 'Température',
                'humidity': 'Humidité',
                'soil-moisture': 'Humidité du Sol',
                'weather-forecast': 'Prévisions Météorologiques',
                'schedule-irrigation': 'Programmer l\'Irrigation',
                'quick-actions': 'Actions Rapides',
                'manual-watering': 'Arrosage Manuel',
                'view-reports': 'Voir les Rapports',
                'system-settings': 'Paramètres du Système',
                
                // Analytics Page
                'nav-analytics': 'Analyses de Performance',
                'suspected-farmland': 'Statistiques de terres agricoles suspectes',
                'ai-doubt-stats': 'Statistiques de catégorie de doute IA',
                'area-of-doubt': 'Zone de doute',
                'total-area': 'Surface Totale',
                'water-consumption': 'Consommation d\'Eau',
                'irrigation-efficiency': 'Efficacité d\'Irrigation',
                'crop-yield': 'Analyse du Rendement des Cultures',
                'weather-impact': 'Impact Météorologique',
                'export-data': 'Exporter les Données',
                'generate-report': 'Générer un Rapport',
                
                // Hardware Page
                'nav-hardware': 'Schéma Matériel',
                'system-overview': 'Aperçu du Système',
                'device-status': 'État des Appareils',
                'sensor-readings': 'Lectures des Capteurs',
                'network-connectivity': 'Connectivité Réseau',
                'cpu-usage': 'Utilisation du CPU',
                'memory-usage': 'Utilisation de la Mémoire',
                'storage-info': 'Informations de Stockage',
                'temperature-monitoring': 'Surveillance de la Température',
                'diagnostics': 'Diagnostics',
                'maintenance-mode': 'Mode Maintenance',
                
                // Controls Page
                'nav-controls': 'Contrôles Utilisateur et Système',
                'user-account': 'Compte Utilisateur',
                'profile-info': 'Informations du Profil',
                'profile-desc': 'Mettez à jour vos informations personnelles',
                'full-name': 'Nom Complet',
                'email-address': 'Adresse E-mail',
                'role': 'Rôle',
                'administrator': 'Administrateur',
                'operator': 'Opérateur',
                'viewer': 'Visualiseur',
                'save-changes': 'Enregistrer les Modifications',
                'change-password': 'Changer le Mot de Passe',
                'change-password-desc': 'Mettez à jour le mot de passe de votre compte',
                'current-password': 'Mot de Passe Actuel',
                'new-password': 'Nouveau Mot de Passe',
                'confirm-password': 'Confirmer le Mot de Passe',
                'update-password': 'Mettre à Jour le Mot de Passe',
                'user-access-control': 'Contrôle d\'Accès Utilisateur',
                'add-new-user': 'Ajouter un Nouvel Utilisateur',
                'user': 'Utilisateur',
                'email': 'E-mail',
                'status': 'Statut',
                'last-login': 'Dernière Connexion',
                'actions': 'Actions',
                'active': 'Actif',
                'just-now': 'À l\'instant',
                
                // Emergency Page
                'nav-emergency': 'Contrôles d\'Urgence',
                'emergency-stop': 'Arrêt d\'Urgence',
                'system-shutdown': 'Arrêt du Système',
                'water-shutoff': 'Coupure d\'Eau',
                'alert-notifications': 'Notifications d\'Alerte',
                'emergency-contacts': 'Contacts d\'Urgence',
                'backup-systems': 'Systèmes de Sauvegarde',
                'restore-operations': 'Restaurer les Opérations',
                
                // AI Page
                'nav-ai': 'Test de Modèle IA',
                'model-performance': 'Performance du Modèle',
                'training-data': 'Données d\'Entraînement',
                'prediction-accuracy': 'Précision des Prédictions',
                'model-settings': 'Paramètres du Modèle',
                'run-test': 'Lancer le Test',
                'analyze-results': 'Analyser les Résultats',
                
                // FAQ Page
                'nav-faq': 'Questions Fréquemment Posées',
                'search-faq': 'Rechercher dans la FAQ',
                'general-questions': 'Questions Générales',
                'technical-support': 'Support Technique',
                'troubleshooting': 'Dépannage',
                'installation-guide': 'Guide d\'Installation',
                'contact-support': 'Contacter le Support',
                
                // Additional Space Dashboard content
                'irrigation-control': 'Contrôle d\'Irrigation',
                'start-irrigation': 'Démarrer l\'Irrigation',
                'stop-irrigation': 'Arrêter l\'Irrigation',
                'emergency-stop': 'Arrêt d\'Urgence',
                'ask-assistant': 'Demander à l\'Assistant',
                'duration': 'Durée',
                'water-used': 'Eau Utilisée',
                'last-irrigation': 'Dernière Irrigation',
                'real-time-sensor-data': 'Données de Capteur en Temps Réel',
                'soil-moisture': 'Humidité du Sol',
                'battery-level': 'Niveau de Batterie',
                'loading': 'Chargement...',
                'off': 'ARRÊT',
                'on': 'MARCHE',
                
                // Additional Analytics page content
                'ai-confidence': 'Confiance IA',
                'data-points': 'Points de Données',
                'real-time-monitoring': 'Surveillance et analyse en temps réel',
                'select-zone': 'Sélectionner une Zone pour l\'Analyse',
                'export-pdf': 'Exporter en PDF',
                'trend-analysis': 'Analyse des Tendances',
                
                // Hardware page content
                'device-id': 'ID de l\'Appareil',
                'copy-device-id': 'Copier l\'ID de l\'Appareil',
                'device-setup-hint': 'Copier ID → Visiter cloud.ielivate.com → Ajouter Appareil → Vérifier Connexion',
                'component-status': 'État des Composants',
                'system-performance': 'Performance du Système',
                'cpu-cores': '1 Cœur',
                'normal': 'Normal',
                
                // Emergency page content
                'pressure-monitor': 'Moniteur de Pression',
                'normal-pressure-range': 'Normal: 2.0 - 3.5 bar',
                'active-alerts-warnings': 'Alertes et Avertissements Actifs',
                'emergency-valve-control': 'Contrôle de Vanne d\'Urgence',
                'main-irrigation-valve': 'Vanne d\'Irrigation Principale',
                'closed': 'FERMÉ',
                'last-action': 'Dernière action',
                'open-valve': 'OUVRIR VANNE',
                'close-valve': 'FERMER VANNE',
                'flow-rate': 'Débit',
                'no-flow': 'Pas de Débit',
                
                // Controls page content
                'general-settings': 'Paramètres Généraux',
                'device-info': 'Informations de l\'Appareil',
                'device-info-desc': 'Détails matériels et logiciels du système',
                'device-name': 'Nom de l\'Appareil',
                'hardware': 'Matériel',
                'software-version': 'Version Logicielle',
                'uptime': 'Temps de Fonctionnement',
                'date-time': 'Date et Heure',
                'date-time-desc': 'Configurer la date et l\'heure du système',
                'timezone': 'Fuseau Horaire',
                'time-format': 'Format de l\'Heure',
                'apply-settings': 'Appliquer les Paramètres',
                'display-preferences': 'Affichage et Préférences',
                'dark-mode': 'Mode Sombre',
                'dark-mode-desc': 'Basculer vers le thème sombre (Bientôt Disponible)',
                
                // Setup page content
                'welcome-to-pulse': 'Bienvenue chez Pulse',
                'smart-irrigation-subtitle': 'Système d\'Irrigation Intelligent avec Prise de Décision IA',
                'water-optimization': 'Optimisation de l\'Eau',
                'water-optimization-desc': 'Économisez jusqu\'à 40% d\'eau avec une irrigation intelligente',
                'solar-powered': 'Alimenté par l\'Énergie Solaire',
                'solar-powered-desc': 'Fonctionnement écologique avec sauvegarde de batterie',
                'decisions': 'Décisions',
                'decisions-desc': 'Irrigation intelligente basée sur les besoins des cultures et du sol',
                'remote-control': 'Contrôle à Distance',
                'remote-control-desc': 'Surveiller et contrôler depuis n\'importe où',
                'get-started': 'Commencer',
                'network-setup': 'Configuration Réseau',
                'connect-device': 'Connectez votre appareil à internet',
                'system-configuration': 'Configuration Système',
                'crop-soil-setup': 'Configuration Culture et Sol',
                'irrigation-schedule': 'Programme d\'Irrigation',
                'setup-complete': 'Configuration Terminée',
                'network-configured': 'Réseau configuré',
                'location-set': 'Emplacement défini',
                'zones-configured': 'Zones configurées',
                'reset-setup': 'Réinitialiser la Configuration',
                'go-to-dashboard': 'Aller au Tableau de Bord',
                'loading': 'Chargement...',
                'welcome': 'Bienvenue',
                'network': 'Réseau',
                'system': 'Système',
                'crop-soil': 'Culture et Sol',
                'schedule': 'Planification',
                'start-setup': 'Commencer la Configuration'
            },
            ar: {
                // Header
                'alerts_warnings': 'التنبيهات والتحذيرات',
                'system_notifications': 'إشعارات النظام',
                'check_updates': 'التحقق من تحديثات النظام',
                'analytics_dashboard': 'عرض لوحة معلومات التحليلات',
                'emergency_controls': 'عناصر التحكم في الطوارئ',
                'hardware_schema': 'مخطط الأجهزة',
                'user_system_controls': 'عناصر التحكم في النظام والمستخدم',
                'ai_model_testing': 'اختبار نموذج الذكاء الاصطناعي',
                'support': 'الدعم',
                'faq': 'الأسئلة الشائعة',
                'switch_language': 'تبديل اللغة',
                'return_setup': 'العودة إلى الإعداد',
                'reboot_system': 'إعادة تشغيل النظام',
                'dashboard': 'لوحة التحكم',
                
                // Navigation
                'space_dashboard': 'لوحة معلومات المساحة',
                'search_placeholder': 'البحث عن الخيارات والعناصر والإعدادات...',
                'searching': 'جاري البحث...',
                
                // Common
                'loading': 'جاري التحميل...',
                'menu': 'القائمة',
                'close_menu': 'إغلاق القائمة',
                
                // Space Dashboard Page
                'nav-space': 'لوحة معلومات المساحة',
                'irrigation-tasks-calendar': 'تقويم مهام الري',
                'tasks-scheduled': 'المهام المجدولة',
                'auto-refresh': 'التحديث التلقائي',
                'active-zones': 'المناطق النشطة',
                'system-status': 'حالة النظام',
                'water-usage': 'استخدام المياه اليوم',
                'temperature': 'درجة الحرارة',
                'humidity': 'الرطوبة',
                'soil-moisture': 'رطوبة التربة',
                'weather-forecast': 'توقعات الطقس',
                'schedule-irrigation': 'جدولة الري',
                'quick-actions': 'الإجراءات السريعة',
                'manual-watering': 'الري اليدوي',
                'view-reports': 'عرض التقارير',
                'system-settings': 'إعدادات النظام',
                
                // Analytics Page
                'nav-analytics': 'مقاييس الأداء',
                'suspected-farmland': 'إحصائيات الأراضي الزراعية المشتبه بها',
                'ai-doubt-stats': 'إحصائيات فئة شك الذكاء الاصطناعي',
                'area-of-doubt': 'منطقة الشك',
                'total-area': 'إجمالي المساحة',
                'water-consumption': 'استهلاك المياه',
                'irrigation-efficiency': 'كفاءة الري',
                'crop-yield': 'تحليل إنتاج المحاصيل',
                'weather-impact': 'تأثير الطقس',
                'export-data': 'تصدير البيانات',
                'generate-report': 'إنشاء تقرير',
                
                // Hardware Page
                'nav-hardware': 'مخطط الأجهزة',
                'system-overview': 'نظرة عامة على النظام',
                'device-status': 'حالة الأجهزة',
                'sensor-readings': 'قراءات المستشعرات',
                'network-connectivity': 'الاتصال بالشبكة',
                'cpu-usage': 'استخدام المعالج',
                'memory-usage': 'استخدام الذاكرة',
                'storage-info': 'معلومات التخزين',
                'temperature-monitoring': 'مراقبة درجة الحرارة',
                'diagnostics': 'التشخيصات',
                'maintenance-mode': 'وضع الصيانة',
                
                // Controls Page
                'nav-controls': 'عناصر التحكم في النظام والمستخدم',
                'user-account': 'حساب المستخدم',
                'profile-info': 'معلومات الملف الشخصي',
                'profile-desc': 'تحديث معلوماتك الشخصية',
                'full-name': 'الاسم الكامل',
                'email-address': 'عنوان البريد الإلكتروني',
                'role': 'الدور',
                'administrator': 'مدير',
                'operator': 'مشغل',
                'viewer': 'مشاهد',
                'save-changes': 'حفظ التغييرات',
                'change-password': 'تغيير كلمة المرور',
                'change-password-desc': 'تحديث كلمة مرور حسابك',
                'current-password': 'كلمة المرور الحالية',
                'new-password': 'كلمة المرور الجديدة',
                'confirm-password': 'تأكيد كلمة المرور',
                'update-password': 'تحديث كلمة المرور',
                'user-access-control': 'التحكم في وصول المستخدم',
                'add-new-user': 'إضافة مستخدم جديد',
                'user': 'المستخدم',
                'email': 'البريد الإلكتروني',
                'status': 'الحالة',
                'last-login': 'آخر تسجيل دخول',
                'actions': 'الإجراءات',
                'active': 'نشط',
                'just-now': 'الآن',
                
                // Emergency Page
                'nav-emergency': 'عناصر التحكم في الطوارئ',
                'emergency-stop': 'إيقاف الطوارئ',
                'system-shutdown': 'إيقاف النظام',
                'water-shutoff': 'قطع المياه',
                'alert-notifications': 'إشعارات التنبيه',
                'emergency-contacts': 'جهات اتصال الطوارئ',
                'backup-systems': 'أنظمة النسخ الاحتياطي',
                'restore-operations': 'استعادة العمليات',
                
                // AI Page
                'nav-ai': 'اختبار نموذج الذكاء الاصطناعي',
                'model-performance': 'أداء النموذج',
                'training-data': 'بيانات التدريب',
                'prediction-accuracy': 'دقة التنبؤ',
                'model-settings': 'إعدادات النموذج',
                'run-test': 'تشغيل الاختبار',
                'analyze-results': 'تحليل النتائج',
                
                // FAQ Page
                'nav-faq': 'الأسئلة الشائعة',
                'search-faq': 'البحث في الأسئلة الشائعة',
                'general-questions': 'الأسئلة العامة',
                'technical-support': 'الدعم التقني',
                'troubleshooting': 'استكشاف الأخطاء وإصلاحها',
                'installation-guide': 'دليل التثبيت',
                'contact-support': 'الاتصال بالدعم',
                
                // Additional Space Dashboard content
                'irrigation-control': 'التحكم في الري',
                'start-irrigation': 'بدء الري',
                'stop-irrigation': 'إيقاف الري',
                'emergency-stop': 'إيقاف الطوارئ',
                'ask-assistant': 'سؤال المساعد',
                'duration': 'المدة',
                'water-used': 'المياه المستخدمة',
                'last-irrigation': 'آخر ري',
                'real-time-sensor-data': 'بيانات المستشعر في الوقت الفعلي',
                'soil-moisture': 'رطوبة التربة',
                'battery-level': 'مستوى البطارية',
                'loading': 'جاري التحميل...',
                'off': 'إيقاف',
                'on': 'تشغيل',
                
                // Additional Analytics page content
                'ai-confidence': 'ثقة الذكاء الاصطناعي',
                'data-points': 'نقاط البيانات',
                'real-time-monitoring': 'المراقبة والتحليل في الوقت الفعلي',
                'select-zone': 'تحديد المنطقة للتحليل',
                'export-pdf': 'تصدير إلى PDF',
                'trend-analysis': 'تحليل الاتجاهات',
                
                // Hardware page content
                'device-id': 'معرف الجهاز',
                'copy-device-id': 'نسخ معرف الجهاز',
                'device-setup-hint': 'نسخ المعرف ← زيارة cloud.ielivate.com ← إضافة جهاز ← التحقق من الاتصال',
                'component-status': 'حالة المكونات',
                'system-performance': 'أداء النظام',
                'cpu-cores': '1 نواة',
                'normal': 'طبيعي',
                
                // Emergency page content
                'pressure-monitor': 'مراقب الضغط',
                'normal-pressure-range': 'طبيعي: 2.0 - 3.5 بار',
                'active-alerts-warnings': 'التنبيهات والتحذيرات النشطة',
                'emergency-valve-control': 'التحكم في صمام الطوارئ',
                'main-irrigation-valve': 'صمام الري الرئيسي',
                'closed': 'مغلق',
                'last-action': 'آخر إجراء',
                'open-valve': 'فتح الصمام',
                'close-valve': 'إغلاق الصمام',
                'flow-rate': 'معدل التدفق',
                'no-flow': 'لا توجد تدفق',
                
                // Controls page content
                'general-settings': 'الإعدادات العامة',
                'device-info': 'معلومات الجهاز',
                'device-info-desc': 'تفاصيل أجهزة وبرامج النظام',
                'device-name': 'اسم الجهاز',
                'hardware': 'الأجهزة',
                'software-version': 'إصدار البرنامج',
                'uptime': 'وقت التشغيل',
                'date-time': 'التاريخ والوقت',
                'date-time-desc': 'تكوين تاريخ ووقت النظام',
                'timezone': 'المنطقة الزمنية',
                'time-format': 'تنسيق الوقت',
                'apply-settings': 'تطبيق الإعدادات',
                'display-preferences': 'العرض والتفضيلات',
                'dark-mode': 'الوضع المظلم',
                'dark-mode-desc': 'التبديل إلى الموضوع المظلم (قريباً)',
                
                // Setup page content
                'welcome-to-pulse': 'أهلاً بك في Pulse',
                'smart-irrigation-subtitle': 'نظام الري الذكي مع اتخاذ القرارات بالذكاء الاصطناعي',
                'water-optimization': 'تحسين المياه',
                'water-optimization-desc': 'وفر حتى 40% من المياه مع الري الذكي',
                'solar-powered': 'يعمل بالطاقة الشمسية',
                'solar-powered-desc': 'تشغيل صديق للبيئة مع نسخ احتياطي للبطارية',
                'decisions': 'القرارات',
                'decisions-desc': 'ري ذكي يعتمد على احتياجات المحاصيل والتربة',
                'remote-control': 'التحكم عن بُعد',
                'remote-control-desc': 'راقب وتحكم من أي مكان',
                'get-started': 'ابدأ',
                'network-setup': 'إعداد الشبكة',
                'connect-device': 'اربط جهازك بالإنترنت',
                'system-configuration': 'تكوين النظام',
                'crop-soil-setup': 'إعداد المحاصيل والتربة',
                'irrigation-schedule': 'جدول الري',
                'setup-complete': 'اكتمل الإعداد',
                'network-configured': 'تم تكوين الشبكة',
                'location-set': 'تم تعيين الموقع',
                'zones-configured': 'تم تكوين المناطق',
                'reset-setup': 'إعادة تعيين الإعداد',
                'go-to-dashboard': 'انتقل إلى لوحة التحكم',
                'loading': 'جاري التحميل...',
                'welcome': 'مرحباً',
                'network': 'الشبكة',
                'system': 'النظام',
                'crop-soil': 'المحاصيل والتربة',
                'schedule': 'الجدولة',
                'start-setup': 'بدء الإعداد'
            }
        };
        
        this.init();
    }
    
    init() {
        // Set initial RTL direction and language
        if (this.currentLanguage === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = this.currentLanguage;
            document.body.classList.remove('rtl');
        }
        
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
        // Cycle through languages: en -> fr -> ar -> en
        const languages = ['en', 'fr', 'ar'];
        const currentIndex = languages.indexOf(this.currentLanguage);
        this.currentLanguage = languages[(currentIndex + 1) % languages.length];
        
        localStorage.setItem('app_language', this.currentLanguage);
        
        // Handle RTL for Arabic
        if (this.currentLanguage === 'ar') {
            document.documentElement.dir = 'rtl';
            document.documentElement.lang = 'ar';
            document.body.classList.add('rtl');
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = this.currentLanguage;
            document.body.classList.remove('rtl');
        }
        
        this.applyTranslations();
        
        // Show language change notification
        this.showLanguageNotification();
    }
    
    translate(key) {
        return this.translations[this.currentLanguage][key] || this.translations['en'][key] || key;
    }
    
    applyTranslations() {
        // Translate all page content with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translated = this.translate(key);
            if (translated && translated !== key) {
                element.textContent = translated;
            }
        });
        
        // Translate title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translated = this.translate(key);
            if (translated && translated !== key) {
                element.title = translated;
            }
        });
        
        // Translate aria-label attributes
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const translated = this.translate(key);
            if (translated && translated !== key) {
                element.setAttribute('aria-label', translated);
            }
        });
        
        // Header buttons (only update titles, not text)
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
        
        // Mobile search placeholder
        const mobileSearchInput = document.getElementById('mobileSearchBar');
        if (mobileSearchInput) {
            mobileSearchInput.placeholder = this.translate('search_placeholder');
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
        const messages = {
            en: 'Language changed to English',
            fr: 'Langue changée en Français',
            ar: 'تم تغيير اللغة إلى العربية'
        };
        
        const notification = document.createElement('div');
        notification.className = 'language-notification';
        notification.innerHTML = `
            <i class="fa-solid fa-globe"></i>
            <span>${messages[this.currentLanguage]}</span>
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
