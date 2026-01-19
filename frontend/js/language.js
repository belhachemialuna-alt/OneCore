// Language Translation System
const translations = {
    en: {
        // Header
        'project-title': 'Smart Irrigation System',
        'project-name': 'ElivateOne',
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
        'nav-space': 'Space Dashboard',
        'space-subtitle': 'Optimized Full-Width Layout',
        'irrigation-tasks-calendar': 'Irrigation Tasks Calendar',
        'tasks-scheduled': 'Tasks Scheduled',
        'auto-refresh': 'Auto-refresh',
        'irrigation-time': 'Irrigation Time',
        'minutes': 'Minutes',
        'today': 'Today',
        'valve-opens': 'Valve Opens',
        'avg-duration': 'Avg Duration',
        'water-used': 'Water Used',
        
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
        'footer-copyright': '© 2024 ElivateOne Smart Irrigation System. All rights reserved.',
        
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
        'msg-no-data': 'No data available',
        
        // Controls Page
        'controls-page-title': 'User & System Controls',
        'controls-page-desc': 'Manage users, configure system settings, and customize your ElivateOne experience',
        
        // Tabs
        'tab-user': 'User Management',
        'tab-system': 'System Settings',
        'tab-network': 'Network',
        'tab-irrigation': 'Irrigation',
        'tab-security': 'Security',
        
        // User Management
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
        
        // System Settings
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
        'auto-refresh': 'Auto-Refresh Data',
        'auto-refresh-desc': 'Automatically update dashboard every 5 seconds',
        'sound-notifications': 'Sound Notifications',
        'sound-notifications-desc': 'Play sound for alerts and warnings',
        'email-notifications': 'Email Notifications',
        'email-notifications-desc': 'Receive alerts via email',
        
        // Network
        'network-config': 'Network Configuration',
        'wifi-settings': 'WiFi Settings',
        'wifi-settings-desc': 'Configure wireless network connection',
        'connected': 'Connected',
        'ssid': 'SSID',
        'ip-address': 'IP Address',
        'signal-strength': 'Signal Strength',
        'change-network': 'Change Network',
        'api-config': 'API Configuration',
        'api-config-desc': 'API server and port settings',
        'api-server': 'API Server',
        'api-port': 'API Port',
        'save-config': 'Save Configuration',
        
        // Irrigation
        'irrigation-config': 'Irrigation Configuration',
        'pressure-limits': 'Pressure Limits',
        'pressure-limits-desc': 'Set safe operating pressure range',
        'min-pressure': 'Minimum Pressure (bar)',
        'max-pressure': 'Maximum Pressure (bar)',
        'update-limits': 'Update Limits',
        'schedule-settings': 'Schedule Settings',
        'schedule-settings-desc': 'Configure automatic irrigation timing',
        'default-duration': 'Default Duration (minutes)',
        'interval-cycles': 'Interval Between Cycles (hours)',
        'save-schedule': 'Save Schedule',
        
        // Security
        'security-settings': 'Security Settings',
        'two-factor': 'Two-Factor Authentication',
        'two-factor-desc': 'Add an extra layer of security (Coming Soon)',
        'session-timeout': 'Session Timeout',
        'session-timeout-desc': 'Auto-logout after 30 minutes of inactivity',
        'activity-log': 'Activity Log',
        'activity-log-desc': 'View recent system activities',
        'user-login': 'User Login',
        'logged-in': 'logged in',
        'settings-changed': 'Settings Changed',
        'network-updated': 'Network configuration updated',
        'irrigation-started': 'Irrigation Started',
        'zone-activated': 'Zone 1 irrigation activated',
        'hours-ago': 'hours ago',
        
        // Danger Zone
        'danger-zone': 'Danger Zone',
        'reset-settings': 'Reset System Settings',
        'reset-settings-desc': 'Restore all settings to factory defaults (keeps user data)',
        'factory-reset': 'Factory Reset',
        'factory-reset-desc': 'Erase all data and restore to factory state (CANNOT BE UNDONE)',
        'btn-reset-settings': 'Reset Settings',
        'btn-factory-reset': 'Factory Reset'
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
        'nav-space': 'لوحة الفضاء',
        'space-subtitle': 'تخطيط محسّن بعرض كامل',
        'irrigation-tasks-calendar': 'تقويم مهام الري',
        'tasks-scheduled': 'المهام المجدولة',
        'auto-refresh': 'التحديث التلقائي',
        'irrigation-time': 'وقت الري',
        'minutes': 'دقائق',
        'today': 'اليوم',
        'valve-opens': 'فتحات الصمام',
        'avg-duration': 'متوسط المدة',
        'water-used': 'المياه المستخدمة',
        
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
        'msg-no-data': 'لا توجد بيانات متاحة',
        
        // Controls Page
        'controls-page-title': 'إعدادات المستخدم والنظام',
        'controls-page-desc': 'إدارة المستخدمين وتكوين إعدادات النظام وتخصيص تجربة بيتي-B1',
        
        // Tabs
        'tab-user': 'إدارة المستخدمين',
        'tab-system': 'إعدادات النظام',
        'tab-network': 'الشبكة',
        'tab-irrigation': 'الري',
        'tab-security': 'الأمان',
        
        // User Management
        'user-account': 'حساب المستخدم',
        'profile-info': 'معلومات الملف الشخصي',
        'profile-desc': 'تحديث معلوماتك الشخصية',
        'full-name': 'الاسم الكامل',
        'email-address': 'عنوان البريد الإلكتروني',
        'role': 'الدور',
        'administrator': 'مسؤول',
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
        
        // System Settings
        'general-settings': 'الإعدادات العامة',
        'device-info': 'معلومات الجهاز',
        'device-info-desc': 'تفاصيل الأجهزة والبرامج',
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
        'dark-mode': 'الوضع الداكن',
        'dark-mode-desc': 'التبديل إلى المظهر الداكن (قريباً)',
        'auto-refresh': 'التحديث التلقائي للبيانات',
        'auto-refresh-desc': 'تحديث لوحة التحكم تلقائياً كل 5 ثوانٍ',
        'sound-notifications': 'إشعارات صوتية',
        'sound-notifications-desc': 'تشغيل صوت للتنبيهات والتحذيرات',
        'email-notifications': 'إشعارات البريد الإلكتروني',
        'email-notifications-desc': 'تلقي التنبيهات عبر البريد الإلكتروني',
        
        // Network
        'network-config': 'تكوين الشبكة',
        'wifi-settings': 'إعدادات WiFi',
        'wifi-settings-desc': 'تكوين اتصال الشبكة اللاسلكية',
        'connected': 'متصل',
        'ssid': 'اسم الشبكة',
        'ip-address': 'عنوان IP',
        'signal-strength': 'قوة الإشارة',
        'change-network': 'تغيير الشبكة',
        'api-config': 'تكوين API',
        'api-config-desc': 'إعدادات خادم ومنفذ API',
        'api-server': 'خادم API',
        'api-port': 'منفذ API',
        'save-config': 'حفظ التكوين',
        
        // Irrigation
        'irrigation-config': 'تكوين الري',
        'pressure-limits': 'حدود الضغط',
        'pressure-limits-desc': 'تعيين نطاق ضغط التشغيل الآمن',
        'min-pressure': 'الحد الأدنى للضغط (بار)',
        'max-pressure': 'الحد الأقصى للضغط (بار)',
        'update-limits': 'تحديث الحدود',
        'schedule-settings': 'إعدادات الجدول',
        'schedule-settings-desc': 'تكوين توقيت الري التلقائي',
        'default-duration': 'المدة الافتراضية (دقائق)',
        'interval-cycles': 'الفاصل الزمني بين الدورات (ساعات)',
        'save-schedule': 'حفظ الجدول',
        
        // Security
        'security-settings': 'إعدادات الأمان',
        'two-factor': 'المصادقة الثنائية',
        'two-factor-desc': 'إضافة طبقة إضافية من الأمان (قريباً)',
        'session-timeout': 'انتهاء مهلة الجلسة',
        'session-timeout-desc': 'تسجيل الخروج التلقائي بعد 30 دقيقة من عدم النشاط',
        'activity-log': 'سجل النشاط',
        'activity-log-desc': 'عرض أنشطة النظام الأخيرة',
        'user-login': 'تسجيل دخول المستخدم',
        'logged-in': 'سجل الدخول',
        'settings-changed': 'تم تغيير الإعدادات',
        'network-updated': 'تم تحديث تكوين الشبكة',
        'irrigation-started': 'بدأ الري',
        'zone-activated': 'تم تنشيط ري المنطقة 1',
        'hours-ago': 'منذ ساعات',
        
        // Danger Zone
        'danger-zone': 'منطقة الخطر',
        'reset-settings': 'إعادة تعيين إعدادات النظام',
        'reset-settings-desc': 'استعادة جميع الإعدادات إلى الإعدادات الافتراضية (يحتفظ ببيانات المستخدم)',
        'factory-reset': 'إعادة التعيين إلى إعدادات المصنع',
        'factory-reset-desc': 'مسح جميع البيانات والاستعادة إلى حالة المصنع (لا يمكن التراجع)',
        'btn-reset-settings': 'إعادة تعيين الإعدادات',
        'btn-factory-reset': 'إعادة تعيين المصنع'
    },
    
    fr: {
        // Header
        'project-title': 'Système d\'Irrigation Intelligent',
        'project-name': 'ElivateOne',
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
        'nav-space': 'Tableau de Bord Espace',
        'space-subtitle': 'Disposition Optimisée Pleine Largeur',
        'irrigation-tasks-calendar': 'Calendrier des Tâches d\'Irrigation',
        'tasks-scheduled': 'Tâches Programmées',
        'auto-refresh': 'Actualisation automatique',
        'irrigation-time': 'Temps d\'Irrigation',
        'minutes': 'Minutes',
        'today': 'Aujourd\'hui',
        'valve-opens': 'Ouvertures de Vanne',
        'avg-duration': 'Durée Moyenne',
        'water-used': 'Eau Utilisée',
        'suspected-farmland': 'Statistiques des terres agricoles suspectes',
        'ai-doubt-stats': 'Statistiques de catégorie de doute IA',
        'area-of-doubt': 'Zone de doute',
        'total-area': 'Surface Totale',
        
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
        'footer-copyright': '© 2024 Système d\'Irrigation Intelligent ElivateOne. Tous droits réservés.',
        
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
        'msg-no-data': 'Aucune donnée disponible',
        
        // Controls Page
        'controls-page-title': 'Contrôles Utilisateur et Système',
        'controls-page-desc': 'Gérer les utilisateurs, configurer les paramètres système et personnaliser votre expérience ElivateOne',
        
        // Tabs
        'tab-user': 'Gestion des Utilisateurs',
        'tab-system': 'Paramètres Système',
        'tab-network': 'Réseau',
        'tab-irrigation': 'Irrigation',
        'tab-security': 'Sécurité',
        
        // User Management
        'user-account': 'Compte Utilisateur',
        'profile-info': 'Informations du Profil',
        'profile-desc': 'Mettre à jour vos informations personnelles',
        'full-name': 'Nom Complet',
        'email-address': 'Adresse Email',
        'role': 'Rôle',
        'administrator': 'Administrateur',
        'operator': 'Opérateur',
        'viewer': 'Observateur',
        'save-changes': 'Enregistrer les Modifications',
        'change-password': 'Changer le Mot de Passe',
        'change-password-desc': 'Mettre à jour le mot de passe de votre compte',
        'current-password': 'Mot de Passe Actuel',
        'new-password': 'Nouveau Mot de Passe',
        'confirm-password': 'Confirmer le Mot de Passe',
        'update-password': 'Mettre à Jour le Mot de Passe',
        'user-access-control': 'Contrôle d\'Accès Utilisateur',
        'add-new-user': 'Ajouter un Nouvel Utilisateur',
        'user': 'Utilisateur',
        'email': 'Email',
        'status': 'Statut',
        'last-login': 'Dernière Connexion',
        'actions': 'Actions',
        'active': 'Actif',
        'just-now': 'À l\'instant',
        
        // System Settings
        'general-settings': 'Paramètres Généraux',
        'device-info': 'Informations de l\'Appareil',
        'device-info-desc': 'Détails matériels et logiciels du système',
        'device-name': 'Nom de l\'Appareil',
        'hardware': 'Matériel',
        'software-version': 'Version du Logiciel',
        'uptime': 'Temps de Fonctionnement',
        'date-time': 'Date et Heure',
        'date-time-desc': 'Configurer la date et l\'heure du système',
        'timezone': 'Fuseau Horaire',
        'time-format': 'Format de l\'Heure',
        'apply-settings': 'Appliquer les Paramètres',
        'display-preferences': 'Affichage et Préférences',
        'dark-mode': 'Mode Sombre',
        'dark-mode-desc': 'Passer au thème sombre (Bientôt Disponible)',
        'auto-refresh': 'Actualisation Automatique',
        'auto-refresh-desc': 'Mettre à jour automatiquement le tableau de bord toutes les 5 secondes',
        'sound-notifications': 'Notifications Sonores',
        'sound-notifications-desc': 'Jouer un son pour les alertes et avertissements',
        'email-notifications': 'Notifications par Email',
        'email-notifications-desc': 'Recevoir des alertes par email',
        
        // Network
        'network-config': 'Configuration Réseau',
        'wifi-settings': 'Paramètres WiFi',
        'wifi-settings-desc': 'Configurer la connexion réseau sans fil',
        'connected': 'Connecté',
        'ssid': 'SSID',
        'ip-address': 'Adresse IP',
        'signal-strength': 'Force du Signal',
        'change-network': 'Changer de Réseau',
        'api-config': 'Configuration API',
        'api-config-desc': 'Paramètres du serveur et du port API',
        'api-server': 'Serveur API',
        'api-port': 'Port API',
        'save-config': 'Enregistrer la Configuration',
        
        // Irrigation
        'irrigation-config': 'Configuration de l\'Irrigation',
        'pressure-limits': 'Limites de Pression',
        'pressure-limits-desc': 'Définir la plage de pression de fonctionnement sûre',
        'min-pressure': 'Pression Minimale (bar)',
        'max-pressure': 'Pression Maximale (bar)',
        'update-limits': 'Mettre à Jour les Limites',
        'schedule-settings': 'Paramètres de Planification',
        'schedule-settings-desc': 'Configurer le calendrier d\'irrigation automatique',
        'default-duration': 'Durée par Défaut (minutes)',
        'interval-cycles': 'Intervalle Entre les Cycles (heures)',
        'save-schedule': 'Enregistrer le Calendrier',
        
        // Security
        'security-settings': 'Paramètres de Sécurité',
        'two-factor': 'Authentification à Deux Facteurs',
        'two-factor-desc': 'Ajouter une couche de sécurité supplémentaire (Bientôt Disponible)',
        'session-timeout': 'Expiration de Session',
        'session-timeout-desc': 'Déconnexion automatique après 30 minutes d\'inactivité',
        'activity-log': 'Journal d\'Activité',
        'activity-log-desc': 'Voir les activités système récentes',
        'user-login': 'Connexion Utilisateur',
        'logged-in': 's\'est connecté',
        'settings-changed': 'Paramètres Modifiés',
        'network-updated': 'Configuration réseau mise à jour',
        'irrigation-started': 'Irrigation Démarrée',
        'zone-activated': 'Irrigation de la zone 1 activée',
        'hours-ago': 'il y a heures',
        
        // Danger Zone
        'danger-zone': 'Zone Dangereuse',
        'reset-settings': 'Réinitialiser les Paramètres Système',
        'reset-settings-desc': 'Restaurer tous les paramètres aux valeurs par défaut (conserve les données utilisateur)',
        'factory-reset': 'Réinitialisation d\'Usine',
        'factory-reset-desc': 'Effacer toutes les données et restaurer à l\'état d\'usine (NE PEUT PAS ÊTRE ANNULÉ)',
        'btn-reset-settings': 'Réinitialiser les Paramètres',
        'btn-factory-reset': 'Réinitialisation d\'Usine'
    }
};

// Get current language from localStorage or default to 'en'
function getCurrentLanguage() {
    return localStorage.getItem('app-language') || 'en';
}

// Initialize language system on page load
function initLanguageSystem() {
    const currentLang = getCurrentLanguage();
    
    // Set direction FIRST
    if (currentLang === 'ar') {
        document.documentElement.dir = 'rtl';
        document.body.classList.add('rtl');
    } else {
        document.documentElement.dir = 'ltr';
        document.body.classList.remove('rtl');
    }
    
    // Set lang attribute
    document.documentElement.lang = currentLang;
    
    // Apply translations
    applyTranslations(currentLang);
    updateLanguageSelector(currentLang);
    
    console.log('Language system initialized:', currentLang);
}

// Set language
function setLanguage(lang) {
    localStorage.setItem('app-language', lang);
    initLanguageSystem();
    
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
                // Preserve HTML structure if element has children
                if (element.children.length === 0) {
                    element.textContent = trans[key];
                } else {
                    // For elements with children, update text nodes only
                    const textNode = Array.from(element.childNodes).find(node => node.nodeType === 3);
                    if (textNode) {
                        textNode.textContent = trans[key];
                    }
                }
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
    
    // Translate aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria');
        if (trans[key]) {
            element.setAttribute('aria-label', trans[key]);
        }
    });
    
    // Update page title if exists
    if (trans['project-title']) {
        const titleElements = document.querySelectorAll('.project-title, .page-title');
        titleElements.forEach(el => {
            if (!el.hasAttribute('data-i18n')) {
                // Don't override if element has specific translation key
                const currentText = el.textContent.trim();
                if (currentText.includes('Dashboard') || currentText.includes('لوحة') || currentText.includes('Tableau')) {
                    el.textContent = trans['nav-dashboard'] || trans['project-title'];
                }
            }
        });
    }
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
