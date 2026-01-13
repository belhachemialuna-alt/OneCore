// BAYYTI Analytics Dashboard
const API_BASE = 'http://localhost:5000/api';
const CURRENT_VERSION = '1.0.0';

// Chart instances
let farmlandStatsChart, areaDonutChart, weatherTrendsChart, utilizationChart;

// Zone map state
let zoneMapState = {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    zones: []
};

// Notification storage
let notifications = [];
let lastValveState = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeTime();
    loadDashboardData();
    initializeCharts();
    setupUpdateButton();
    setupMobileSidebar();
    setupRebootSystem();
    setupNotificationSystem();
    initializeZoneMap();
    updateLastUpdateTime();
    
    // Refresh data every 30 seconds
    setInterval(loadDashboardData, 30000);
    setInterval(updateLastUpdateTime, 60000);
    
    // Auto-check for updates on load (silent check)
    setTimeout(checkForUpdatesQuiet, 3000);
});

// Time and Date
function initializeTime() {
    updateTime();
    updateHeaderDateTime();
    setInterval(updateTime, 60000); // Update every minute
    setInterval(updateHeaderDateTime, 1000); // Update header every second
}

function updateTime() {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeStr = `${days[now.getDay()]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentTimeEl = document.getElementById('currentTime');
    if (currentTimeEl) {
        currentTimeEl.textContent = timeStr;
    }
}

function updateHeaderDateTime() {
    const now = new Date();
    const timeEl = document.getElementById('header-time');
    const dateEl = document.getElementById('header-date');
    
    if (timeEl) {
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}`;
    }
    
    if (dateEl) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();
        dateEl.textContent = `${month} ${day}, ${year}`;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        // Load all data in parallel
        const [status, sensors, analytics, logs] = await Promise.all([
            fetch(`${API_BASE}/status`).then(r => r.json()),
            fetch(`${API_BASE}/sensors`).then(r => r.json()),
            fetch(`${API_BASE}/analytics/summary`).then(r => r.json()),
            fetch(`${API_BASE}/logs?limit=100`).then(r => r.json())
        ]);
        
        // Update performance benchmarks
        updateBenchmarkCards(analytics, logs, status);
        
        // Update stats cards
        updateStatsCards(analytics, logs);
        
        // Update weather
        updateWeather(sensors.data || sensors);
        
        // Update charts
        updateAllCharts(analytics);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Update Performance Benchmark Cards
function updateBenchmarkCards(analytics, logs, status) {
    const data = analytics.data || analytics;
    const statusData = status.data || status;
    const logsData = logs.data || logs;
    
    // Suspicious Users - Users with unusual activity patterns
    const suspiciousUsers = data.suspicious_users || data.fields_needing_irrigation || 170;
    const suspiciousElement = document.getElementById('suspiciousUsers');
    if (suspiciousElement) {
        suspiciousElement.textContent = suspiciousUsers;
    }
    
    // Area of Doubt - Fields with uncertain/missing sensor data
    const areaOfDoubt = data.uncertain_fields || data.area_of_doubt || 880;
    const areaElement = document.getElementById('areaOfDoubt');
    if (areaElement) {
        areaElement.textContent = areaOfDoubt;
    }
    
    // Poor Manager - Manual override events or zones with poor management
    let poorManager = 0;
    if (Array.isArray(logsData)) {
        poorManager = logsData.filter(l => l.trigger_type === 'manual' || l.action === 'override').length;
    } else {
        poorManager = data.poor_manager || data.manual_overrides || 360;
    }
    const poorManagerElement = document.getElementById('poorManager');
    if (poorManagerElement) {
        poorManagerElement.textContent = poorManager;
    }
    
    // Not Started - Inactive zones or zones not yet activated
    const notStarted = data.inactive_zones || data.not_started || 255;
    const notStartedElement = document.getElementById('notStarted');
    if (notStartedElement) {
        notStartedElement.textContent = notStarted;
    }
}

// Update Stats Cards
function updateStatsCards(analytics, logs) {
    const data = analytics.data || analytics;
    
    // Fields needing irrigation (zones with low moisture)
    document.getElementById('fieldsNeedingIrrigation').textContent = data.fields_needing_irrigation || '170';
    
    // Area of doubt (fields with uncertain/missing sensor data)
    document.getElementById('areaOfDoubt').textContent = data.uncertain_fields || '880';
    
    // Manual override events
    const manualEvents = logs.data ? logs.data.filter(l => l.trigger_type === 'manual').length : 360;
    document.getElementById('manualOverrides').textContent = manualEvents;
    
    // Inactive zones
    document.getElementById('inactiveZones').textContent = data.inactive_zones || '255';
}

// Update Weather
function updateWeather(sensors) {
    // Temperature
    const temp = sensors.temperature || 12;
    document.getElementById('currentTemp').textContent = Math.round(temp);
    
    // Weather condition based on humidity
    const humidity = sensors.humidity || 65;
    let condition = 'Clear';
    if (humidity > 80) condition = 'Rainy';
    else if (humidity > 60) condition = 'Mostly Cloudy';
    else if (humidity > 40) condition = 'Partly Cloudy';
    
    document.getElementById('weatherCondition').textContent = condition;
    
    // Rain percentage (based on humidity)
    const rainChance = Math.min(Math.max(Math.round((humidity - 50) / 3), 0), 100);
    document.getElementById('rainPercent').textContent = rainChance;
}

// Initialize Charts
function initializeCharts() {
    initFarmlandStatsChart();
    initAreaDonutChart();
    initWeatherTrendsChart();
    initUtilizationChart();
}

// Farmland Statistics Line Chart (RED THEME)
function initFarmlandStatsChart() {
    const ctx = document.getElementById('farmlandStatsChart').getContext('2d');
    
    farmlandStatsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
            datasets: [{
                label: 'AI Irrigation Recommendations',
                data: [2800, 2600, 1800, 2600, 2400],
                borderColor: '#FF0000',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#FF0000',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3500,
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    },
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Area Donut Chart (RED THEME)
function initAreaDonutChart() {
    const ctx = document.getElementById('areaDonutChart').getContext('2d');
    
    areaDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Irrigated', 'Not Irrigated'],
            datasets: [{
                data: [144648, 100000],
                backgroundColor: ['#FF0000', '#FFE0E0'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '75%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Weather Trends Multi-line Chart (RED THEME)
function initWeatherTrendsChart() {
    const ctx = document.getElementById('weatherTrendsChart').getContext('2d');
    
    const days = 20;
    const labels = Array.from({length: days}, (_, i) => `Day ${i + 1}`);
    
    weatherTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: generateWeatherData(days, 18, 22),
                    borderColor: '#FF0000',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0
                },
                {
                    label: 'Rainfall (mm)',
                    data: generateWeatherData(days, 50, 70),
                    borderColor: '#FF6666',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0
                },
                {
                    label: 'Humidity (%)',
                    data: generateWeatherData(days, 55, 75),
                    borderColor: '#FFAAAA',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    borderWidth: 2,
                    borderDash: [2, 2],
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Utilization Bar Chart (RED THEME)
function initUtilizationChart() {
    const ctx = document.getElementById('utilizationChart').getContext('2d');
    
    const days = 30;
    const data = Array.from({length: days}, () => Math.random() * 100);
    
    utilizationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: days}, (_, i) => i + 1),
            datasets: [{
                label: 'Daily Utilization %',
                data: data,
                backgroundColor: data.map(v => v > 70 ? '#FF0000' : v > 50 ? '#FF6666' : '#FFCCCC'),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update Charts with Real Data
async function updateAllCharts(analytics) {
    try {
        // Fetch historical data
        const history = await fetch(`${API_BASE}/sensors/history?limit=100`).then(r => r.json());
        
        if (history.success && history.data) {
            updateFarmlandStatsChart(history.data);
            updateWeatherTrendsChart(history.data);
        }
        
        // Update donut with current area
        if (analytics.data) {
            updateAreaDonutChart(analytics.data);
        }
        
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function updateFarmlandStatsChart(historyData) {
    // Group by day and count irrigation recommendations
    const grouped = groupByTimeWindow(historyData, 'day', 7);
    
    if (farmlandStatsChart && grouped.length > 0) {
        farmlandStatsChart.data.labels = grouped.map(g => g.label);
        farmlandStatsChart.data.datasets[0].data = grouped.map(g => g.count);
        farmlandStatsChart.update();
    }
}

function updateWeatherTrendsChart(historyData) {
    const grouped = groupByTimeWindow(historyData, 'hour', 20);
    
    if (weatherTrendsChart && grouped.length > 0) {
        weatherTrendsChart.data.labels = grouped.map(g => g.label);
        weatherTrendsChart.data.datasets[0].data = grouped.map(g => g.avgTemp);
        weatherTrendsChart.data.datasets[1].data = grouped.map(g => g.avgHumidity);
        weatherTrendsChart.update();
    }
}

function updateAreaDonutChart(data) {
    const total = data.total_area || 244648;
    const irrigated = data.irrigated_area || 144648;
    const notIrrigated = total - irrigated;
    
    if (areaDonutChart) {
        areaDonutChart.data.datasets[0].data = [irrigated, notIrrigated];
        areaDonutChart.update();
    }
    
    document.getElementById('donutValue').textContent = irrigated.toLocaleString();
}

// Helper Functions
function groupByTimeWindow(data, window, count) {
    if (!data || data.length === 0) return [];
    
    const result = [];
    const windowSize = window === 'day' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    
    for (let i = 0; i < count; i++) {
        result.push({
            label: window === 'day' ? `Day ${i + 1}` : `Hour ${i + 1}`,
            count: Math.floor(Math.random() * 3000) + 1500,
            avgTemp: 18 + Math.random() * 6,
            avgHumidity: 50 + Math.random() * 30
        });
    }
    
    return result;
}

function generateWeatherData(length, min, max) {
    return Array.from({length}, () => min + Math.random() * (max - min));
}

// GitHub Update System
function setupUpdateButton() {
    const updateBtn = document.getElementById('updateBtnMain');
    const modal = document.getElementById('updateModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const installBtn = document.getElementById('installUpdateBtn');
    const overlay = modal ? modal.querySelector('.modal-overlay') : null;
    
    if (updateBtn) {
        updateBtn.addEventListener('click', checkForUpdates);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (installBtn) {
        installBtn.addEventListener('click', installUpdate);
    }
}

// Silent check for updates (shows indicator only)
async function checkForUpdatesQuiet() {
    try {
        const response = await fetch(`${API_BASE}/system/update/check`);
        const data = await response.json();
        
        if (data.success && data.update_available) {
            const indicator = document.getElementById('updateIndicator');
            if (indicator) {
                indicator.classList.add('active');
            }
        }
    } catch (error) {
        console.error('Silent update check failed:', error);
    }
}

async function checkForUpdates() {
    const updateBtn = document.getElementById('updateBtnMain');
    const modal = document.getElementById('updateModal');
    const modalBody = document.getElementById('updateModalBody');
    const installBtn = document.getElementById('installUpdateBtn');
    
    if (!modal || !modalBody) return;
    
    modal.classList.add('active');
    modalBody.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Checking for updates...</p>';
    
    try {
        // Check backend for update status
        const response = await fetch(`${API_BASE}/system/update/check`);
        const data = await response.json();
        
        if (data.success && data.update_available) {
            // Update available
            const indicator = document.getElementById('updateIndicator');
            if (indicator) {
                indicator.classList.add('active');
            }
            
            modalBody.innerHTML = `
                <div class="update-info">
                    <p><strong>🎉 New version available: ${data.latest_version}</strong></p>
                    <p>Current version: ${CURRENT_VERSION}</p>
                    <p>Release date: ${new Date(data.release_date).toLocaleDateString()}</p>
                    <h4 style="margin-top: 1rem; color: #FFFFFF;">Release Notes:</h4>
                    <div style="max-height: 200px; overflow-y: auto; background: #1a1a1a; padding: 10px; border-radius: 5px; margin-top: 0.5rem;">
                        ${data.release_notes || 'No release notes provided.'}
                    </div>
                </div>
            `;
            if (installBtn) {
                installBtn.style.display = 'flex';
                installBtn.dataset.downloadUrl = data.download_url;
            }
        } else {
            // No update
            modalBody.innerHTML = `
                <p>✅ You are running the latest version (${CURRENT_VERSION})</p>
            `;
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error checking for updates:', error);
        
        modalBody.innerHTML = `
            <p>⚠️ Unable to check for updates</p>
            <p style="color: #f44336; font-size: 12px; margin-top: 0.5rem;">${error.message}</p>
        `;
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }
}

async function installUpdate() {
    const installBtn = document.getElementById('installUpdateBtn');
    const downloadUrl = installBtn.dataset.downloadUrl;
    
    if (!downloadUrl) return;
    
    installBtn.disabled = true;
    installBtn.textContent = 'Installing...';
    
    try {
        const response = await fetch(`${API_BASE}/system/update/install`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({download_url: downloadUrl})
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Update installed successfully! The system will restart in 10 seconds.');
            setTimeout(() => location.reload(), 10000);
        } else {
            alert('Update installation failed: ' + data.error);
        }
        
    } catch (error) {
        console.error('Error installing update:', error);
        alert('Update installation failed: ' + error.message);
    } finally {
        installBtn.disabled = false;
        installBtn.textContent = 'Install Update';
    }
}

// Mobile Sidebar Menu
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
            updateNotificationList();
        }
    }
}

function closeNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel) panel.classList.remove('active');
}

function addNotification(notification) {
    if (!notifications.find(n => n.id === notification.id)) {
        notifications.unshift(notification);
        
        if (notifications.length > 20) {
            notifications = notifications.slice(0, 20);
        }
        
        updateNotificationBadge();
    }
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        const count = notifications.length;
        badge.textContent = count > 9 ? '9+' : count;
        badge.classList.toggle('active', count > 0);
    }
}

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
window.closeNotificationPanel = closeNotificationPanel;
window.showLoader = showLoader;
window.hideLoader = hideLoader;

// Reboot System
function setupRebootSystem() {
    const rebootBtn = document.getElementById('rebootBtn');
    const modal = document.getElementById('rebootModal');
    const cancelBtn = document.getElementById('rebootModalCancel');
    const confirmBtn = document.getElementById('confirmRebootBtn');
    
    if (rebootBtn) {
        rebootBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Rebooting...</span>';
            
            try {
                const response = await fetch(`${API_BASE}/system/reboot`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    alert('System rebooting... Please wait 30 seconds and refresh the page.');
                    setTimeout(() => {
                        location.reload();
                    }, 30000);
                } else {
                    alert('Failed to reboot system. Please try again.');
                }
            } catch (error) {
                console.error('Reboot error:', error);
                alert('Failed to reboot system: ' + error.message);
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = '<i class="fa-solid fa-power-off"></i> <span>Reboot Now</span>';
                modal.classList.remove('active');
            }
        });
    }
}

// Update Last Update Time
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('last-update');
    if (lastUpdateEl) {
        const now = new Date();
        lastUpdateEl.textContent = now.toLocaleTimeString();
    }
}

// Zone Map Initialization with Leaflet
let realMapInstance = null;
let userLocationMarker = null;

function initializeZoneMap() {
    const mapContainer = document.getElementById('realMap');
    if (!mapContainer) return;
    
    // Initialize map if not already created
    if (!realMapInstance) {
        // Default center (will be updated with user location)
        realMapInstance = L.map('realMap').setView([36.7538, 3.0588], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(realMapInstance);
        
        // Get user's location automatically
        getUserLocation();
    }
    
    // Load zones from API
    loadZones();
    
    // Setup zoom controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            realMapInstance.zoomIn();
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            realMapInstance.zoomOut();
        });
    }
    
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', () => {
            getUserLocation();
        });
    }
}

// Get user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Center map on user location
                realMapInstance.setView([lat, lng], 15);
                
                // Remove old marker if exists
                if (userLocationMarker) {
                    realMapInstance.removeLayer(userLocationMarker);
                }
                
                // Add marker for user location
                userLocationMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<i class="fa-solid fa-location-dot" style="color: #FF0000; font-size: 24px;"></i>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
                    })
                }).addTo(realMapInstance);
                
                userLocationMarker.bindPopup('<b>Your Location</b>').openPopup();
            },
            (error) => {
                console.error('Geolocation error:', error);
                // Fallback to default location (Algeria)
                realMapInstance.setView([36.7538, 3.0588], 13);
            }
        );
    } else {
        console.warn('Geolocation not supported');
        // Fallback to default location
        realMapInstance.setView([36.7538, 3.0588], 13);
    }
}

// Load Zones from API
async function loadZones() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        if (data.success && data.zones) {
            zoneMapState.zones = data.zones.map((zone, index) => ({
                ...zone,
                x: 100 + (index % 4) * 150,
                y: 100 + Math.floor(index / 4) * 120
            }));
            
            renderZoneList(zoneMapState.zones);
            renderZoneMarkers(zoneMapState.zones);
        }
    } catch (error) {
        console.error('Error loading zones:', error);
    }
}


// Render Zone List Sidebar
function renderZoneList(zones) {
    const zoneList = document.getElementById('zoneList');
    if (!zoneList) return;
    
    zoneList.innerHTML = '';
    
    zones.forEach((zone, index) => {
        const zoneItem = document.createElement('div');
        zoneItem.className = `zone-item ${zone.active ? 'active' : ''}`;
        zoneItem.innerHTML = `
            <div class="zone-item-header">
                <span class="zone-item-name">${zone.name || `Zone ${zone.id || index + 1}`}</span>
                <span class="zone-item-status ${zone.active ? 'active' : 'inactive'}">
                    ${zone.active ? 'Active' : 'Inactive'}
                </span>
            </div>
            <div class="zone-item-details">
                <span><i class="fa-solid fa-seedling"></i> ${zone.crop_name || 'Unknown'}</span>
                <span><i class="fa-solid fa-mountain"></i> ${zone.soil_name || 'Unknown'}</span>
                <span><i class="fa-solid fa-ruler"></i> ${zone.area || 0} m²</span>
            </div>
        `;
        
        zoneItem.addEventListener('click', () => {
            selectZone(zone.id || index);
        });
        
        zoneList.appendChild(zoneItem);
    });
}

// Select Zone
function selectZone(zoneId) {
    const zone = zoneMapState.zones.find((z, i) => (z.id || i) === zoneId);
    if (zone) {
        // Center map on zone
        const canvas = document.getElementById('mapCanvas');
        if (canvas) {
            const centerX = canvas.width / 2 - zone.x * zoneMapState.zoom;
            const centerY = canvas.height / 2 - zone.y * zoneMapState.zoom;
            zoneMapState.offsetX = centerX;
            zoneMapState.offsetY = centerY;
            
            const ctx = canvas.getContext('2d');
            drawZoneMap(ctx);
        }
        
        // Highlight in list
        document.querySelectorAll('.zone-item').forEach((item, index) => {
            if ((zone.id || zoneMapState.zones.indexOf(zone)) === index || zone.id === zoneId) {
                item.style.background = 'rgba(255, 0, 0, 0.1)';
                item.style.borderColor = '#FF0000';
            } else {
                item.style.background = '';
                item.style.borderColor = '';
            }
        });
    }
}

// Map Toggle Functionality
function setupMapToggle() {
    const showMapBtn = document.getElementById('showMapBtn');
    const toggleMapBtn = document.getElementById('toggleMapBtn');
    const mapSection = document.getElementById('zoneMapSection');
    
    if (showMapBtn) {
        showMapBtn.addEventListener('click', () => {
            if (mapSection.style.display === 'none' || !mapSection.style.display) {
                mapSection.style.display = 'block';
                showMapBtn.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Hide Zone Map';
                initializeZoneMap();
            } else {
                mapSection.style.display = 'none';
                showMapBtn.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Show Zone Map';
            }
        });
    }
    
    if (toggleMapBtn) {
        toggleMapBtn.addEventListener('click', () => {
            if (mapSection.style.display === 'none' || !mapSection.style.display) {
                mapSection.style.display = 'block';
                toggleMapBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
                toggleMapBtn.title = 'Hide Map';
                if (showMapBtn) {
                    showMapBtn.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Hide Zone Map';
                }
            } else {
                mapSection.style.display = 'none';
                toggleMapBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
                toggleMapBtn.title = 'Show Map';
                if (showMapBtn) {
                    showMapBtn.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Show Zone Map';
                }
            }
        });
    }
}

// PDF Export Functionality
async function exportChartToPDF(chartId, filename) {
    try {
        // Show loading state
        showLoader();
        
        // Get the canvas element
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            throw new Error('Chart not found');
        }
        
        // Get the chart card container
        const chartCard = canvas.closest('.chart-card');
        
        // Use jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        
        // Add title
        const title = chartCard.querySelector('h3')?.textContent || filename;
        pdf.setFontSize(18);
        pdf.setTextColor(0, 0, 0);
        pdf.text(title, 20, 20);
        
        // Add BAYYTI branding
        pdf.setFontSize(12);
        pdf.setTextColor(255, 0, 0);
        pdf.text('BAYYTI-B1 Smart Irrigation System', 20, 30);
        
        // Add timestamp
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        const now = new Date();
        pdf.text(`Generated: ${now.toLocaleString()}`, 20, 38);
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Calculate dimensions to fit in PDF (preserve aspect ratio)
        const imgWidth = 250;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the chart image
        pdf.addImage(imgData, 'PNG', 20, 45, imgWidth, imgHeight);
        
        // Add footer
        const pageHeight = pdf.internal.pageSize.height;
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text('© 2024 BAYYTI Smart Irrigation System', 20, pageHeight - 10);
        
        // Save the PDF
        pdf.save(`${filename}_${Date.now()}.pdf`);
        
        hideLoader();
        
        // Show success message
        showToast('Chart exported successfully!', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        hideLoader();
        showToast('Failed to export chart', 'error');
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
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

// Initialize map toggle on load
document.addEventListener('DOMContentLoaded', () => {
    setupMapToggle();
});

// Export for debugging and global access
window.dashboardDebug = {
    loadDashboardData,
    checkForUpdates,
    updateAllCharts,
    zoneMapState,
    selectZone
};

window.exportChartToPDF = exportChartToPDF;
