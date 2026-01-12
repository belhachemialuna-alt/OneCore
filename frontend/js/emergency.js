// BAYYTI-B1 Emergency Controls
const API_BASE = 'http://localhost:5000/api';

// State management
let alerts = [];
let notifications = [];
let valveHistory = [];
let charts = {};
let updateInterval;
let alertCheckInterval;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMobileSidebar();
    setupAlertSystem();
    setupNotificationSystem();
    setupValveControls();
    initializeCharts();
    loadSystemData();
    
    // Start real-time updates
    updateInterval = setInterval(loadSystemData, 5000);
    alertCheckInterval = setInterval(checkForAlerts, 3000);
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

// Alert System
function setupAlertSystem() {
    const alertBtn = document.getElementById('alertBtn');
    
    if (alertBtn) {
        alertBtn.addEventListener('click', toggleAlertPanel);
    }
}

function toggleAlertPanel() {
    const panel = document.getElementById('alertPanel');
    if (panel) {
        panel.classList.toggle('active');
        
        if (panel.classList.contains('active')) {
            updateAlertPanelList();
        }
    }
}

function closeAlertPanel() {
    const panel = document.getElementById('alertPanel');
    if (panel) panel.classList.remove('active');
}

// Check for Alerts (Valve failure, Low pressure, Leak, Power issue)
async function checkForAlerts() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        if (data.success) {
            // Check for various alert conditions
            checkValveFailure(data.irrigation);
            checkPressure(data.sensors);
            checkLeakDetection(data.irrigation);
            checkPowerIssues(data.energy);
        }
    } catch (error) {
        console.error('Error checking alerts:', error);
    }
}

function checkValveFailure(irrigation) {
    if (!irrigation) return;
    
    // Simulate valve failure detection (you'd have real logic here)
    const shouldBeOpen = irrigation.valve_open;
    const actuallyOpen = irrigation.valve_open; // In real system, check actual sensor
    
    // If valve command doesn't match actual state
    if (Math.random() < 0.01) { // 1% chance for demo purposes
        addAlert({
            id: 'valve-failure-' + Date.now(),
            type: 'critical',
            icon: 'fa-valve',
            title: 'Valve Failure Detected',
            message: 'Valve is not responding to commands. Immediate attention required.',
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
    }
}

function checkPressure(sensors) {
    if (!sensors) return;
    
    // Simulate pressure reading (replace with actual sensor data)
    const pressure = 2.5 + (Math.random() - 0.5) * 2; // 1.5 - 3.5 bar
    
    if (pressure < 2.0) {
        addAlert({
            id: 'low-pressure-' + Date.now(),
            type: 'warning',
            icon: 'fa-gauge-simple-low',
            title: 'Low Pressure Warning',
            message: `Water pressure is below normal: ${pressure.toFixed(1)} bar (Normal: 2.0-3.5 bar)`,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
    } else if (pressure > 3.5) {
        addAlert({
            id: 'high-pressure-' + Date.now(),
            type: 'warning',
            icon: 'fa-gauge-simple-high',
            title: 'High Pressure Warning',
            message: `Water pressure is above normal: ${pressure.toFixed(1)} bar (Normal: 2.0-3.5 bar)`,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
    }
}

function checkLeakDetection(irrigation) {
    if (!irrigation) return;
    
    // Simulate leak detection (replace with actual logic)
    if (Math.random() < 0.005) { // 0.5% chance for demo
        addAlert({
            id: 'leak-detected-' + Date.now(),
            type: 'critical',
            icon: 'fa-droplet-slash',
            title: 'Leak Detected',
            message: 'Abnormal water flow detected. Possible leak in the system.',
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
    }
}

function checkPowerIssues(energy) {
    if (!energy) return;
    
    const battery = energy.battery_percentage || 0;
    const solar = energy.solar_charging || false;
    
    if (battery < 15) {
        addAlert({
            id: 'power-critical-' + Date.now(),
            type: 'critical',
            icon: 'fa-battery-empty',
            title: 'Critical Power Issue',
            message: `Battery critically low: ${battery}%. System may shutdown soon.`,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
    } else if (battery < 30 && !solar) {
        addAlert({
            id: 'power-warning-' + Date.now(),
            type: 'warning',
            icon: 'fa-battery-quarter',
            title: 'Power Warning',
            message: `Battery low: ${battery}%. Solar charging not active.`,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
    }
}

function addAlert(alert) {
    // Check if alert already exists (avoid duplicates)
    const exists = alerts.find(a => a.id === alert.id || 
        (a.title === alert.title && Date.now() - a.timestamp < 60000)); // Within 1 minute
    
    if (!exists) {
        alerts.unshift(alert);
        
        // Keep only last 50 alerts
        if (alerts.length > 50) {
            alerts = alerts.slice(0, 50);
        }
        
        updateAlertCounter();
        updateAlertsGrid();
        updateEmergencyBanner();
    }
}

function updateAlertCounter() {
    const counter = document.getElementById('alertCounter');
    if (counter) {
        const activeAlerts = alerts.length;
        counter.textContent = activeAlerts > 9 ? '9+' : activeAlerts;
        counter.classList.toggle('active', activeAlerts > 0);
    }
}

function updateAlertsGrid() {
    const grid = document.getElementById('alertsGrid');
    if (!grid) return;
    
    if (alerts.length === 0) {
        grid.innerHTML = `
            <div class="alert-card info" style="grid-column: 1/-1;">
                <div class="alert-icon">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <div class="alert-content">
                    <h4>All Systems Normal</h4>
                    <p>No active alerts or warnings at this time.</p>
                    <div class="alert-time">System monitoring active</div>
                </div>
            </div>
        `;
        return;
    }
    
    // Show last 6 alerts
    grid.innerHTML = alerts.slice(0, 6).map(alert => `
        <div class="alert-card ${alert.type}">
            <div class="alert-icon">
                <i class="fa-solid ${alert.icon}"></i>
            </div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
                <div class="alert-time">${alert.time}</div>
            </div>
        </div>
    `).join('');
}

function updateAlertPanelList() {
    const list = document.getElementById('alertPanelList');
    if (!list) return;
    
    if (alerts.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #999;">
                <i class="fa-solid fa-shield-halved" style="font-size: 3rem; margin-bottom: 1rem; color: var(--success-green);"></i>
                <p>No active alerts</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = alerts.map(alert => `
        <div class="alert-card ${alert.type}" style="margin-bottom: 0.75rem;">
            <div class="alert-icon">
                <i class="fa-solid ${alert.icon}"></i>
            </div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
                <div class="alert-time">${alert.time}</div>
            </div>
        </div>
    `).join('');
}

function updateEmergencyBanner() {
    const banner = document.getElementById('emergencyBanner');
    if (!banner) return;
    
    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    
    if (criticalAlerts.length > 0) {
        banner.classList.add('danger');
        banner.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div class="banner-content">
                <h2>Emergency Alert Active</h2>
                <p>${criticalAlerts.length} critical issue(s) detected - Immediate action required</p>
            </div>
        `;
    } else {
        banner.classList.remove('danger');
        banner.innerHTML = `
            <i class="fa-solid fa-shield-halved"></i>
            <div class="banner-content">
                <h2>Emergency Control Center</h2>
                <p>All systems operational - Ready for emergency intervention</p>
            </div>
        `;
    }
}

// Notification System (same as other pages)
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

// Valve Controls
function setupValveControls() {
    const openBtn = document.getElementById('openValveBtn');
    const closeBtn = document.getElementById('closeValveBtn');
    const stopBtn = document.getElementById('emergencyStopBtn');
    
    if (openBtn) {
        openBtn.addEventListener('click', () => controlValve('open'));
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => controlValve('close'));
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', emergencyStop);
    }
}

async function controlValve(action) {
    if (!confirm(`Are you sure you want to ${action} the valve?`)) {
        return;
    }
    
    showLoader();
    
    try {
        const response = await fetch(`${API_BASE}/control/valve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Add to valve history
            valveHistory.unshift({
                action: action,
                time: new Date(),
                success: true
            });
            
            // Reload data immediately
            await loadSystemData();
            
            alert(`✅ Valve ${action === 'open' ? 'opened' : 'closed'} successfully`);
        } else {
            alert(`❌ Failed to ${action} valve: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Valve control error:', error);
        alert(`❌ Error controlling valve: ${error.message}`);
    } finally {
        hideLoader();
    }
}

async function emergencyStop() {
    if (!confirm('⚠️ EMERGENCY STOP - This will immediately close the valve and halt all operations. Continue?')) {
        return;
    }
    
    showLoader();
    
    try {
        const response = await fetch(`${API_BASE}/control/emergency-stop`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            valveHistory.unshift({
                action: 'emergency_stop',
                time: new Date(),
                success: true
            });
            
            await loadSystemData();
            
            alert('🛑 EMERGENCY STOP ACTIVATED - All operations halted');
        } else {
            alert(`❌ Emergency stop failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Emergency stop error:', error);
        alert(`❌ Error: ${error.message}`);
    } finally {
        hideLoader();
    }
}

// Load System Data
async function loadSystemData() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        if (data.success) {
            updateValveStatus(data.irrigation);
            updatePressureMonitor(data.sensors);
            updateFlowMonitor(data.irrigation);
            updateSystemHealth(data);
            updateCharts(data);
        }
    } catch (error) {
        console.error('Error loading system data:', error);
    }
}

function updateValveStatus(irrigation) {
    if (!irrigation) return;
    
    const valveIcon = document.querySelector('.valve-icon');
    const valveState = document.getElementById('valveState');
    const lastAction = document.getElementById('lastAction');
    
    const isOpen = irrigation.valve_open || false;
    
    if (valveIcon) {
        valveIcon.classList.toggle('open', isOpen);
        valveIcon.classList.toggle('closed', !isOpen);
    }
    
    if (valveState) {
        valveState.textContent = isOpen ? 'OPEN' : 'CLOSED';
        valveState.classList.toggle('open', isOpen);
        valveState.classList.toggle('closed', !isOpen);
    }
    
    if (lastAction) {
        const lastTime = irrigation.last_action_time || new Date().toLocaleTimeString();
        lastAction.textContent = lastTime;
    }
}

function updatePressureMonitor(sensors) {
    const pressureValue = document.getElementById('pressureValue');
    
    // Simulate pressure (replace with actual sensor data)
    const pressure = 2.5 + (Math.random() - 0.5) * 0.5;
    
    if (pressureValue) {
        pressureValue.textContent = pressure.toFixed(1);
    }
}

function updateFlowMonitor(irrigation) {
    const flowValue = document.getElementById('flowValue');
    const flowStatus = document.getElementById('flowStatus');
    
    const isOpen = irrigation?.valve_open || false;
    const flow = isOpen ? 15.5 + (Math.random() - 0.5) * 2 : 0;
    
    if (flowValue) {
        flowValue.textContent = flow.toFixed(1);
    }
    
    if (flowStatus) {
        flowStatus.classList.toggle('active', isOpen);
        flowStatus.innerHTML = isOpen 
            ? '<i class="fa-solid fa-circle"></i><span>Flow Active</span>'
            : '<i class="fa-solid fa-circle"></i><span>No Flow</span>';
    }
}

function updateSystemHealth(data) {
    // Update health cards based on system status
    const healthValve = document.getElementById('healthValve');
    const healthPressure = document.getElementById('healthPressure');
    const healthPower = document.getElementById('healthPower');
    const healthSensors = document.getElementById('healthSensors');
    
    // Check for critical alerts
    const criticalAlerts = alerts.filter(a => a.type === 'critical');
    
    if (criticalAlerts.some(a => a.title.includes('Valve'))) {
        setHealthStatus(healthValve, 'danger', 'Failed', 30);
    } else {
        setHealthStatus(healthValve, 'success', 'Operational', 100);
    }
    
    if (criticalAlerts.some(a => a.title.includes('Pressure'))) {
        setHealthStatus(healthPressure, 'warning', 'Abnormal', 60);
    } else {
        setHealthStatus(healthPressure, 'success', 'Normal', 95);
    }
    
    const battery = data.energy?.battery_percentage || 0;
    if (battery < 20) {
        setHealthStatus(healthPower, 'danger', 'Critical', battery);
    } else if (battery < 40) {
        setHealthStatus(healthPower, 'warning', 'Low', battery);
    } else {
        setHealthStatus(healthPower, 'success', 'Stable', battery);
    }
    
    setHealthStatus(healthSensors, 'success', 'Online', 100);
}

function setHealthStatus(element, type, status, percentage) {
    if (!element) return;
    
    element.className = `health-card ${type}`;
    
    const statusEl = element.querySelector('.health-status');
    if (statusEl) statusEl.textContent = status;
    
    const progressEl = element.querySelector('.health-progress');
    if (progressEl) progressEl.style.width = percentage + '%';
}

// Initialize Charts
function initializeCharts() {
    initValveTimelineChart();
    initPressureHistoryChart();
    initFlowHistoryChart();
    initDailySummaryChart();
    initStatusPieChart();
    
    // Setup chart controls
    setupChartControls();
}

function initValveTimelineChart() {
    const ctx = document.getElementById('valveTimelineChart');
    if (!ctx) return;
    
    // Generate mock data for valve operations
    const labels = [];
    const openData = [];
    const closedData = [];
    
    for (let i = 23; i >= 0; i--) {
        const hour = new Date();
        hour.setHours(hour.getHours() - i);
        labels.push(hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Simulate valve state (1 = open, 0 = closed)
        const isOpen = Math.random() > 0.6 ? 1 : 0;
        openData.push(isOpen);
        closedData.push(1 - isOpen);
    }
    
    charts.valveTimeline = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Valve Open',
                data: openData,
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 2
            }, {
                label: 'Valve Closed',
                data: closedData,
                backgroundColor: 'rgba(220, 53, 69, 0.8)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 3,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Time',
                        font: { weight: 'bold' }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        callback: function(value) {
                            return value === 1 ? 'Active' : '';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Valve Status',
                        font: { weight: 'bold' }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Last 24 Hours Valve Operation History',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + (context.parsed.y === 1 ? 'Active' : 'Inactive');
                        }
                    }
                }
            }
        }
    });
}

function initPressureHistoryChart() {
    const ctx = document.getElementById('pressureHistoryChart');
    if (!ctx) return;
    
    const labels = [];
    const data = [];
    
    for (let i = 59; i >= 0; i--) {
        const time = new Date();
        time.setMinutes(time.getMinutes() - i);
        labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Simulate pressure between 2.0 and 3.5 bar
        data.push(2.5 + Math.sin(i / 10) * 0.5 + (Math.random() - 0.5) * 0.2);
    }
    
    charts.pressureHistory = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Water Pressure',
                data: data,
                borderColor: '#FF0000',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Last Hour)',
                        font: { weight: 'bold' }
                    },
                    ticks: {
                        maxTicksLimit: 12
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 1.5,
                    max: 4.0,
                    title: {
                        display: true,
                        text: 'Pressure (bar)',
                        font: { weight: 'bold' }
                    },
                    grid: {
                        color: function(context) {
                            // Highlight normal range
                            const value = context.tick.value;
                            if (value >= 2.0 && value <= 3.5) {
                                return 'rgba(76, 175, 80, 0.2)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Pressure: ' + context.parsed.y.toFixed(2) + ' bar';
                        }
                    }
                }
            }
        }
    });
}

function initFlowHistoryChart() {
    const ctx = document.getElementById('flowHistoryChart');
    if (!ctx) return;
    
    const labels = [];
    const data = [];
    
    for (let i = 59; i >= 0; i--) {
        const time = new Date();
        time.setMinutes(time.getMinutes() - i);
        labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
        // Simulate flow rate (0-20 L/min)
        const baseFlow = Math.random() > 0.3 ? 15 : 0;
        data.push(baseFlow + (Math.random() - 0.5) * 2);
    }
    
    charts.flowHistory = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Flow Rate',
                data: data,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Last Hour)',
                        font: { weight: 'bold' }
                    },
                    ticks: {
                        maxTicksLimit: 12
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 25,
                    title: {
                        display: true,
                        text: 'Flow Rate (L/min)',
                        font: { weight: 'bold' }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Flow: ' + context.parsed.y.toFixed(1) + ' L/min';
                        }
                    }
                }
            }
        }
    });
}

function initDailySummaryChart() {
    const ctx = document.getElementById('dailySummaryChart');
    if (!ctx) return;
    
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const openHours = [3.2, 2.8, 4.1, 3.5, 2.9, 4.5, 3.8];
    const cycles = [5, 4, 6, 5, 4, 7, 6];
    
    charts.dailySummary = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hours Active',
                data: openHours,
                backgroundColor: 'rgba(255, 0, 0, 0.8)',
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 2,
                yAxisID: 'y'
            }, {
                label: 'Irrigation Cycles',
                data: cycles,
                backgroundColor: 'rgba(33, 150, 243, 0.8)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 2,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Day of Week',
                        font: { weight: 'bold' }
                    }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Hours',
                        font: { weight: 'bold' }
                    },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Cycles',
                        font: { weight: 'bold' }
                    },
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function initStatusPieChart() {
    const ctx = document.getElementById('statusPieChart');
    if (!ctx) return;
    
    charts.statusPie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Operational', 'Idle', 'Maintenance', 'Error'],
            datasets: [{
                data: [65, 25, 8, 2],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(33, 150, 243, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(33, 150, 243, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

function setupChartControls() {
    const buttons = document.querySelectorAll('.chart-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all buttons
            buttons.forEach(b => b.classList.remove('active'));
            
            // Add active to clicked button
            this.classList.add('active');
            
            // Get selected range
            const range = this.dataset.range;
            
            // Update chart based on range (you would fetch different data here)
            console.log('Chart range changed to:', range);
        });
    });
}

function updateCharts(data) {
    // Update charts with real-time data
    // This would be more sophisticated in production
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
window.closeAlertPanel = closeAlertPanel;
window.closeNotificationPanel = closeNotificationPanel;
window.showLoader = showLoader;
window.hideLoader = hideLoader;
