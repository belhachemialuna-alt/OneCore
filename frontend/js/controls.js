// BAYYTI-B1 User & System Controls
const API_BASE = 'http://localhost:5000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMobileSidebar();
    setupTabs();
    loadSystemInfo();
    setupEventListeners();
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

// Tab System
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Remove active from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active to clicked tab and corresponding content
            btn.classList.add('active');
            const content = document.getElementById(`tab-${tabName}`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

// Load System Information
async function loadSystemInfo() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        if (data.success) {
            // Update device info
            document.getElementById('deviceName').textContent = data.device || 'BAYYTI-B1';
            document.getElementById('softwareVersion').textContent = data.version || '1.0.0';
            
            // Update footer
            document.getElementById('device-name').textContent = data.device || 'BAYYTI-B1';
            document.getElementById('system-version').textContent = data.version || '1.0.0';
        }
    } catch (error) {
        console.error('Error loading system info:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Auto-refresh toggle
    const autoRefresh = document.getElementById('autoRefresh');
    if (autoRefresh) {
        autoRefresh.addEventListener('change', (e) => {
            localStorage.setItem('autoRefresh', e.target.checked);
            showToast(e.target.checked ? 'Auto-refresh enabled' : 'Auto-refresh disabled');
        });
        
        // Load saved preference
        const saved = localStorage.getItem('autoRefresh');
        if (saved !== null) {
            autoRefresh.checked = saved === 'true';
        }
    }
    
    // Sound notifications
    const soundNotif = document.getElementById('soundNotifications');
    if (soundNotif) {
        soundNotif.addEventListener('change', (e) => {
            localStorage.setItem('soundNotifications', e.target.checked);
            showToast(e.target.checked ? 'Sound notifications enabled' : 'Sound notifications disabled');
        });
        
        const saved = localStorage.getItem('soundNotifications');
        if (saved !== null) {
            soundNotif.checked = saved === 'true';
        }
    }
    
    // Email notifications
    const emailNotif = document.getElementById('emailNotifications');
    if (emailNotif) {
        emailNotif.addEventListener('change', (e) => {
            localStorage.setItem('emailNotifications', e.target.checked);
            showToast(e.target.checked ? 'Email notifications enabled' : 'Email notifications disabled');
        });
        
        const saved = localStorage.getItem('emailNotifications');
        if (saved !== null) {
            emailNotif.checked = saved === 'true';
        }
    }
    
    // Session timeout
    const sessionTimeout = document.getElementById('sessionTimeout');
    if (sessionTimeout) {
        sessionTimeout.addEventListener('change', (e) => {
            localStorage.setItem('sessionTimeout', e.target.checked);
            showToast(e.target.checked ? 'Session timeout enabled' : 'Session timeout disabled');
        });
        
        const saved = localStorage.setItem('sessionTimeout');
        if (saved !== null) {
            sessionTimeout.checked = saved === 'true';
        }
    }
}

// Show Toast Notification
function showToast(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: #000;
        color: #fff;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Global Loader Functions
function showLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.classList.add('active');
}

function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.classList.remove('active');
}

// Export functions
window.showLoader = showLoader;
window.hideLoader = hideLoader;

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
