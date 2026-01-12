const API_BASE = window.location.origin;
let moistureChart = null;
let tempChart = null;
let updateInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupEventListeners();
    initializeCharts();
    startAutoUpdate();
    loadDashboardData();
    loadSchedules();
    loadLogs();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.dataset.page;
            
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.querySelectorAll('.nav-link').forEach(l => {
                l.classList.remove('active');
            });
            
            document.getElementById(`page-${targetPage}`).classList.add('active');
            link.classList.add('active');
            
            if (targetPage === 'logs') {
                loadLogs();
            } else if (targetPage === 'scheduler') {
                loadSchedules();
            }
        });
    });
}

function setupEventListeners() {
    document.getElementById('valve-on').addEventListener('click', () => {
        controlValve('on');
    });
    
    document.getElementById('valve-off').addEventListener('click', () => {
        controlValve('off');
    });
    
    document.getElementById('emergency-stop').addEventListener('click', () => {
        emergencyStop();
    });
    
    document.getElementById('auto-mode-toggle').addEventListener('change', (e) => {
        toggleAutoMode(e.target.checked);
    });
    
    document.getElementById('add-schedule-btn').addEventListener('click', () => {
        openScheduleModal();
    });
    
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeScheduleModal();
        });
    });
    
    document.getElementById('save-schedule-btn').addEventListener('click', () => {
        saveSchedule();
    });
    
    document.getElementById('refresh-logs').addEventListener('click', () => {
        loadLogs();
    });
}

function initializeCharts() {
    const moistureCtx = document.getElementById('moisture-chart').getContext('2d');
    moistureChart = new Chart(moistureCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Soil Moisture (%)',
                data: [],
                borderColor: '#8B4513',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#FFF' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#AAA' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#AAA' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
    
    const tempCtx = document.getElementById('temp-chart').getContext('2d');
    tempChart = new Chart(tempCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#FF6347',
                    backgroundColor: 'rgba(255, 99, 71, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: '#1E90FF',
                    backgroundColor: 'rgba(30, 144, 255, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#FFF' }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    position: 'left',
                    ticks: { color: '#AAA' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: { color: '#AAA' },
                    grid: { display: false }
                },
                x: {
                    ticks: { color: '#AAA' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function startAutoUpdate() {
    updateInterval = setInterval(() => {
        loadDashboardData();
    }, 5000);
}

async function loadDashboardData() {
    try {
        const [statusRes, sensorsRes, valveRes, alertsRes, aiRes] = await Promise.all([
            fetch(`${API_BASE}/api/status`),
            fetch(`${API_BASE}/api/sensors`),
            fetch(`${API_BASE}/api/valve/status`),
            fetch(`${API_BASE}/api/alerts`),
            fetch(`${API_BASE}/api/ai/recommendation`)
        ]);
        
        const status = await statusRes.json();
        const sensors = await sensorsRes.json();
        const valve = await valveRes.json();
        const alerts = await alertsRes.json();
        const ai = await aiRes.json();
        
        updateStatusDisplay(status, sensors.data, valve.data);
        updateAlerts(alerts.data);
        updateAIRecommendation(ai.data);
        updateCharts(sensors.data);
        updateConnectionStatus(true);
        
        document.getElementById('last-update').textContent = 
            `Last update: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        updateConnectionStatus(false);
    }
}

function updateStatusDisplay(status, sensors, valve) {
    document.getElementById('soil-moisture').textContent = sensors.soil_moisture.toFixed(1);
    document.getElementById('water-flow').textContent = sensors.flow_rate.toFixed(2);
    document.getElementById('temperature').textContent = sensors.temperature.toFixed(1);
    document.getElementById('battery-level').textContent = status.battery.toFixed(0);
    
    document.getElementById('solar-status').textContent = status.solar_status;
    document.getElementById('leak-status').textContent = status.leak_detected ? 'LEAK DETECTED!' : 'OK';
    document.getElementById('leak-status').style.color = status.leak_detected ? '#DC3545' : '#28A745';
    document.getElementById('pressure').textContent = sensors.pressure.toFixed(2) + ' bar';
    document.getElementById('humidity').textContent = sensors.humidity.toFixed(1) + '%';
    
    const valveBadge = document.getElementById('valve-status-badge');
    valveBadge.textContent = valve.valve_state;
    valveBadge.className = 'valve-status ' + (valve.valve_state === 'ON' ? 'on' : 'off');
    
    if (valve.irrigation_active && valve.start_time) {
        const start = new Date(valve.start_time);
        const duration = Math.floor((new Date() - start) / 1000);
        document.getElementById('irrigation-duration').textContent = formatDuration(duration);
        document.getElementById('water-used').textContent = valve.total_water_used.toFixed(2) + ' L';
    } else {
        document.getElementById('irrigation-duration').textContent = '--';
        document.getElementById('water-used').textContent = valve.total_water_used.toFixed(2) + ' L';
    }
}

function updateAlerts(alerts) {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alert.severity}`;
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div style="flex: 1;">
                <strong>${alert.alert_type.replace('_', ' ').toUpperCase()}</strong>
                <p>${alert.message}</p>
            </div>
            <button class="btn btn-secondary" onclick="resolveAlert(${alert.id})">
                <i class="fas fa-check"></i> Resolve
            </button>
        `;
        container.appendChild(alertDiv);
    });
}

function updateAIRecommendation(recommendation) {
    const container = document.getElementById('ai-recommendation');
    
    if (recommendation.should_irrigate) {
        container.innerHTML = `
            <div class="recommendation-status should-irrigate">
                <i class="fas fa-check-circle"></i>
                <h4>Irrigation Recommended</h4>
                <p>${recommendation.reason}</p>
                <p><strong>Recommended Duration:</strong> ${formatDuration(recommendation.recommended_duration)}</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="recommendation-status no-irrigation">
                <i class="fas fa-info-circle"></i>
                <h4>No Irrigation Needed</h4>
                <p>${recommendation.reason}</p>
                <p><strong>Current Moisture:</strong> ${recommendation.current_moisture}%</p>
            </div>
        `;
    }
}

async function updateCharts(sensors) {
    try {
        const historyRes = await fetch(`${API_BASE}/api/sensors/history?limit=20`);
        const history = await historyRes.json();
        
        if (history.success && history.data.length > 0) {
            const data = history.data.reverse();
            
            const labels = data.map(d => {
                const time = new Date(d.timestamp);
                return time.toLocaleTimeString();
            });
            
            moistureChart.data.labels = labels;
            moistureChart.data.datasets[0].data = data.map(d => d.soil_moisture);
            moistureChart.update('none');
            
            tempChart.data.labels = labels;
            tempChart.data.datasets[0].data = data.map(d => d.temperature);
            tempChart.data.datasets[1].data = data.map(d => d.humidity);
            tempChart.update('none');
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function updateConnectionStatus(connected) {
    const indicator = document.getElementById('connection-status');
    if (connected) {
        indicator.innerHTML = '<i class="fas fa-circle"></i> Connected';
        indicator.style.color = '#28A745';
    } else {
        indicator.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
        indicator.style.color = '#DC3545';
    }
}

async function controlValve(action) {
    try {
        const response = await fetch(`${API_BASE}/api/valve/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Valve ${action.toUpperCase()} successful`, 'success');
            loadDashboardData();
        } else {
            showNotification(result.message || 'Operation failed', 'error');
        }
    } catch (error) {
        console.error('Error controlling valve:', error);
        showNotification('Failed to control valve', 'error');
    }
}

async function emergencyStop() {
    if (confirm('Are you sure you want to trigger emergency stop?')) {
        try {
            const response = await fetch(`${API_BASE}/api/emergency-stop`, {
                method: 'POST'
            });
            
            const result = await response.json();
            showNotification('Emergency stop activated!', 'warning');
            loadDashboardData();
        } catch (error) {
            console.error('Error triggering emergency stop:', error);
        }
    }
}

async function toggleAutoMode(enabled) {
    try {
        const response = await fetch(`${API_BASE}/api/ai/auto-mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled })
        });
        
        const result = await response.json();
        showNotification(result.message, 'info');
    } catch (error) {
        console.error('Error toggling auto mode:', error);
    }
}

async function loadSchedules() {
    try {
        const response = await fetch(`${API_BASE}/api/schedules`);
        const result = await response.json();
        
        const container = document.getElementById('schedules-list');
        container.innerHTML = '';
        
        if (result.data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #AAA; padding: 2rem;">No schedules created yet</p>';
            return;
        }
        
        result.data.forEach(schedule => {
            const scheduleDiv = document.createElement('div');
            scheduleDiv.className = 'schedule-item';
            scheduleDiv.innerHTML = `
                <div class="schedule-info">
                    <h4>${schedule.name}</h4>
                    <div class="schedule-details">
                        <span><i class="fas fa-clock"></i> ${schedule.start_time}</span>
                        <span><i class="fas fa-hourglass"></i> ${formatDuration(schedule.duration)}</span>
                        <span><i class="fas fa-calendar"></i> ${schedule.days_of_week}</span>
                    </div>
                </div>
                <div class="schedule-actions">
                    <button class="btn ${schedule.enabled ? 'btn-success' : 'btn-secondary'}" 
                            onclick="toggleSchedule(${schedule.id})">
                        ${schedule.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteSchedule(${schedule.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(scheduleDiv);
        });
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
}

async function loadLogs() {
    try {
        const response = await fetch(`${API_BASE}/api/logs`);
        const result = await response.json();
        
        const tbody = document.getElementById('logs-tbody');
        tbody.innerHTML = '';
        
        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #AAA;">No logs available</td></tr>';
            return;
        }
        
        result.data.forEach(log => {
            const row = document.createElement('tr');
            const time = new Date(log.timestamp).toLocaleString();
            row.innerHTML = `
                <td>${time}</td>
                <td>${log.action}</td>
                <td>${formatDuration(log.duration)}</td>
                <td>${log.water_used.toFixed(2)} L</td>
                <td><span class="badge">${log.trigger_type}</span></td>
                <td>${log.notes || '-'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

function openScheduleModal() {
    document.getElementById('schedule-modal').classList.add('active');
}

function closeScheduleModal() {
    document.getElementById('schedule-modal').classList.remove('active');
    document.getElementById('schedule-name').value = '';
    document.getElementById('schedule-time').value = '';
    document.getElementById('schedule-duration').value = '300';
}

async function saveSchedule() {
    const name = document.getElementById('schedule-name').value;
    const time = document.getElementById('schedule-time').value;
    const duration = parseInt(document.getElementById('schedule-duration').value);
    
    const daysCheckboxes = document.querySelectorAll('.days-selector input[type="checkbox"]:checked');
    const days = Array.from(daysCheckboxes).map(cb => cb.value).join(',');
    
    if (!name || !time) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                start_time: time,
                duration,
                days_of_week: days
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Schedule created successfully', 'success');
            closeScheduleModal();
            loadSchedules();
        } else {
            showNotification('Failed to create schedule', 'error');
        }
    } catch (error) {
        console.error('Error saving schedule:', error);
        showNotification('Failed to create schedule', 'error');
    }
}

async function toggleSchedule(id) {
    try {
        const response = await fetch(`${API_BASE}/api/schedules/${id}/toggle`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Schedule ${result.enabled ? 'enabled' : 'disabled'}`, 'info');
            loadSchedules();
        }
    } catch (error) {
        console.error('Error toggling schedule:', error);
    }
}

async function deleteSchedule(id) {
    if (confirm('Are you sure you want to delete this schedule?')) {
        try {
            const response = await fetch(`${API_BASE}/api/schedules/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Schedule deleted', 'success');
                loadSchedules();
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    }
}

async function resolveAlert(id) {
    try {
        const response = await fetch(`${API_BASE}/api/alerts/${id}/resolve`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error resolving alert:', error);
    }
}

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (secs > 0 || result === '') result += `${secs}s`;
    
    return result.trim();
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#28A745',
        error: '#DC3545',
        warning: '#FFC107',
        info: '#17A2B8'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
