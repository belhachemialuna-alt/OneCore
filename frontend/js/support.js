// BAYYTI-B1 Support Page
const API_BASE = 'http://localhost:5000/api';

// Notification storage
let notifications = [];
let notificationCheckInterval;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMobileSidebar();
    setupNotificationSystem();
    loadSystemInfo();
    setupSearchFilter();
    setupSupportForm();
    
    // Start notification polling
    startNotificationPolling();
});

// Mobile Sidebar
function setupMobileSidebar() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('mobile-sidebar');
    const closeBtn = document.getElementById('sidebar-close');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
}

// Notification System
function setupNotificationSystem() {
    const notificationBtn = document.getElementById('notificationBtn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', toggleNotificationPanel);
    }
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.toggle('active');
        
        if (panel.classList.contains('active')) {
            loadNotifications();
        }
    }
}

function closeNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) {
        panel.classList.remove('active');
    }
}

// Start polling for notifications
function startNotificationPolling() {
    // Initial load
    checkForNotifications();
    
    // Poll every 5 seconds
    notificationCheckInterval = setInterval(checkForNotifications, 5000);
}

// Check for new notifications
async function checkForNotifications() {
    try {
        // Fetch valve status and system logs
        const [statusRes, logsRes] = await Promise.all([
            fetch(`${API_BASE}/status`),
            fetch(`${API_BASE}/logs?limit=5`)
        ]);
        
        if (statusRes.ok && logsRes.ok) {
            const statusData = await statusRes.json();
            const logsData = await logsRes.json();
            
            // Check valve status
            if (statusData.success && statusData.irrigation) {
                checkValveStatus(statusData.irrigation);
            }
            
            // Check recent logs for events
            if (logsData.success && logsData.data) {
                processLogs(logsData.data);
            }
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

// Check valve status and create notifications
function checkValveStatus(irrigation) {
    const valveOpen = irrigation.valve_open || false;
    const lastAction = localStorage.getItem('last_valve_action');
    const currentState = valveOpen ? 'open' : 'closed';
    
    if (lastAction !== currentState) {
        const notification = {
            id: Date.now(),
            type: valveOpen ? 'success' : 'info',
            icon: valveOpen ? 'fa-valve' : 'fa-valve-circle-check',
            title: valveOpen ? 'Irrigation Started' : 'Irrigation Stopped',
            message: valveOpen ? 'Valve opened - watering in progress' : 'Valve closed - irrigation complete',
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        };
        
        addNotification(notification);
        localStorage.setItem('last_valve_action', currentState);
    }
}

// Process logs for important events
function processLogs(logs) {
    logs.forEach(log => {
        const logTime = new Date(log.timestamp).getTime();
        const lastCheck = parseInt(localStorage.getItem('last_log_check') || '0');
        
        if (logTime > lastCheck) {
            // Check for important events
            if (log.message.includes('Emergency') || log.message.includes('Alert')) {
                const notification = {
                    id: Date.now() + Math.random(),
                    type: 'error',
                    icon: 'fa-triangle-exclamation',
                    title: 'Alert',
                    message: log.message,
                    time: new Date(log.timestamp).toLocaleTimeString(),
                    timestamp: logTime
                };
                addNotification(notification);
            } else if (log.message.includes('Battery low')) {
                const notification = {
                    id: Date.now() + Math.random(),
                    type: 'warning',
                    icon: 'fa-battery-quarter',
                    title: 'Low Battery',
                    message: 'Battery level is critically low',
                    time: new Date(log.timestamp).toLocaleTimeString(),
                    timestamp: logTime
                };
                addNotification(notification);
            }
        }
    });
    
    localStorage.setItem('last_log_check', Date.now().toString());
}

// Add notification
function addNotification(notification) {
    // Check if notification already exists
    if (!notifications.find(n => n.id === notification.id)) {
        notifications.unshift(notification);
        
        // Keep only last 20 notifications
        if (notifications.length > 20) {
            notifications = notifications.slice(0, 20);
        }
        
        updateNotificationBadge();
        updateNotificationList();
        
        // Show toast notification (optional)
        showToast(notification);
    }
}

// Update notification badge
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const count = notifications.length;
        badge.textContent = count > 9 ? '9+' : count;
        
        if (count > 0) {
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
        }
    }
}

// Load notifications into panel
function loadNotifications() {
    updateNotificationList();
}

// Update notification list UI
function updateNotificationList() {
    const list = document.getElementById('notificationList');
    if (!list) return;
    
    if (notifications.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #999;">
                <i class="fa-solid fa-bell-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No notifications</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.type}">
            <div class="notification-item-header">
                <i class="fa-solid ${n.icon}"></i>
                <strong>${n.title}</strong>
            </div>
            <p>${n.message}</p>
            <div class="notification-item-time">${n.time}</div>
        </div>
    `).join('');
}

// Show toast notification (optional)
function showToast(notification) {
    // You can implement a toast/snackbar notification here
    console.log('New notification:', notification);
}

// Load System Info
async function loadSystemInfo() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('deviceName').textContent = data.device || 'BAYYTI-B1';
            document.getElementById('systemVersion').textContent = data.version || '1.0.0';
            
            // Update footer
            document.getElementById('footerDevice').textContent = data.device || 'BAYYTI-B1';
            document.getElementById('footerVersion').textContent = data.version || '1.0.0';
        }
    } catch (error) {
        console.error('Error loading system info:', error);
    }
}

// Search Filter
function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterContent(query);
        });
    }
}

function filterContent(query) {
    if (!query) {
        // Show all content
        document.querySelectorAll('.faq-item, .troubleshoot-card, .content-card').forEach(el => {
            el.style.display = '';
        });
        return;
    }
    
    // Filter FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
    });
    
    // Filter troubleshoot cards
    document.querySelectorAll('.troubleshoot-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
    });
    
    // Filter content cards
    document.querySelectorAll('.content-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
    });
}

// FAQ Toggle
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Support Form
function setupSupportForm() {
    const form = document.getElementById('supportForm');
    
    if (form) {
        form.addEventListener('submit', handleSupportFormSubmit);
    }
}

async function handleSupportFormSubmit(e) {
    e.preventDefault();
    
    const loader = document.getElementById('globalLoader');
    if (loader) loader.classList.add('active');
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        device: document.getElementById('deviceName').textContent,
        version: document.getElementById('systemVersion').textContent,
        timestamp: new Date().toISOString()
    };
    
    // Simulate sending (in production, send to your backend/email service)
    setTimeout(() => {
        if (loader) loader.classList.remove('active');
        
        alert('✅ Thank you! Your message has been received.\n\nOur support team will get back to you within 24 hours.');
        
        // Reset form
        e.target.reset();
        
        // Add notification
        addNotification({
            id: Date.now(),
            type: 'success',
            icon: 'fa-envelope-circle-check',
            title: 'Support Request Sent',
            message: 'Your message has been sent successfully',
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
    }, 1500);
}

// Global Loader Functions
window.showLoader = function() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.classList.add('active');
};

window.hideLoader = function() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.classList.remove('active');
};

// Export functions for use in HTML
window.toggleFAQ = toggleFAQ;
window.scrollToSection = scrollToSection;
window.closeNotificationPanel = closeNotificationPanel;
