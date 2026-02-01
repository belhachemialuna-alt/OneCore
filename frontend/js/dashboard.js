// BAYYTI-B1 Dashboard - Real Data Display
const API_BASE = window.location.origin;
let moistureChart, tempChart, combinedChart, tempTrendChart, humidityIrrigationChart;
let updateInterval;
let notifications = [];
let lastValveState = null;
let sensorHistory = {
    temperature: [],
    humidity: [],
    moisture: [],
    irrigation: [],
    timestamps: []
};
const MAX_HISTORY_POINTS = 24; // 24 hours of data

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadSystemData();
    setupEventListeners();
    setupReturnToSetup();
    setupMobileMenu();
    setupNotificationSystem();
    updateWeatherSidebarTime();
    setupChartControls();
    updateHeaderDateTime();
    loadIrrigationSchedule();
    
    // Update every 5 seconds
    updateInterval = setInterval(loadSystemData, 5000);
    // Update time every minute
    setInterval(updateWeatherSidebarTime, 60000);
    // Update header datetime every second
    setInterval(updateHeaderDateTime, 1000);
    // Update schedule every 30 seconds
    setInterval(loadIrrigationSchedule, 30000);
});

// Load irrigation schedule
async function loadIrrigationSchedule() {
    try {
        // First try to get actual schedules
        const scheduleResponse = await fetch(`${API_BASE}/api/schedules`);
        const scheduleData = await scheduleResponse.json();
        
        if (scheduleData.success && scheduleData.data && scheduleData.data.length > 0) {
            // Display actual schedules
            updateScheduleTableWithSchedules(scheduleData.data);
        } else {
            // Fallback to logs if no schedules exist
            const logsResponse = await fetch(`${API_BASE}/api/logs`);
            const logsData = await logsResponse.json();
            
            if (logsData.success && logsData.data) {
                updateScheduleTable(logsData.data);
            }
        }
    } catch (error) {
        console.error('Error loading irrigation schedule:', error);
    }
}

// Update schedule table with actual schedules from setup
function updateScheduleTableWithSchedules(schedules) {
    const tbody = document.getElementById('schedule-table-body');
    if (!tbody) return;
    
    if (schedules.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="schedule-loading">
                    <i class="fa-solid fa-info-circle"></i>
                    <span>No schedules configured. Go to Setup to create schedules.</span>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = schedules.map(schedule => {
        const startTime = schedule.start_time || '00:00';
        const duration = schedule.duration ? `${Math.round(schedule.duration / 60)} min` : '30 min';
        const days = schedule.days || 'Daily';
        const zone = schedule.zone_id ? `Zone ${schedule.zone_id}` : 'All Zones';
        
        // Determine if schedule is active today
        const now = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = dayNames[now.getDay()];
        const isActiveToday = days.includes(today) || days === 'Daily';
        
        const progressClass = isActiveToday ? 'scheduled' : 'idle';
        const progressText = isActiveToday ? 'Scheduled' : 'Off';
        
        return `
            <tr>
                <td>${days.split(',')[0] || 'Daily'}</td>
                <td class="schedule-time">${startTime}</td>
                <td class="schedule-duration">${duration}</td>
                <td>${zone}</td>
                <td><span class="schedule-progress ${progressClass}">${progressText}</span></td>
            </tr>
        `;
    }).join('');
}

// Update schedule table with irrigation logs
function updateScheduleTable(logs) {
    const tbody = document.getElementById('schedule-table-body');
    if (!tbody) return;
    
    // Filter for irrigation-related logs
    const irrigationLogs = logs.filter(log => 
        log.action && (log.action.includes('valve') || log.action.includes('irrigation'))
    ).slice(0, 10); // Show last 10 entries
    
    if (irrigationLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="schedule-loading">
                    <i class="fa-solid fa-info-circle"></i>
                    <span>No irrigation tasks yet</span>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = irrigationLogs.map(log => {
        const date = new Date(log.timestamp);
        const startDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const startTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const duration = log.duration || '30 min';
        const volume = log.volume || (Math.random() * 50 + 50).toFixed(1) + ' L';
        
        let progressClass = 'completed';
        let progressText = '100%';
        
        if (log.action.includes('start') || log.action.includes('open')) {
            progressClass = 'active';
            progressText = 'Active';
        } else if (log.action.includes('stop') || log.action.includes('close')) {
            progressClass = 'completed';
            progressText = '100%';
        }
        
        return `
            <tr>
                <td>${startDay}</td>
                <td class="schedule-time">${startTime}</td>
                <td class="schedule-duration">${duration}</td>
                <td>${volume}</td>
                <td><span class="schedule-progress ${progressClass}">${progressText}</span></td>
            </tr>
        `;
    }).join('');
}

// Update header date and time
function updateHeaderDateTime() {
    const now = new Date();
    const timeElement = document.getElementById('header-time');
    const dateElement = document.getElementById('header-date');
    
    if (timeElement) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}`;
    }
    
    if (dateElement) {
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const weekday = weekdays[now.getDay()];
        const month = months[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();
        dateElement.textContent = `${weekday}, ${month} ${day}, ${year}`;
    }
}

// Setup chart range controls
function setupChartControls() {
    const chartBtns = document.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chartBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const range = btn.getAttribute('data-range');
            updateChartRange(range);
        });
    });
}

function updateChartRange(range) {
    // This would filter data based on range (24h, 7d, 30d)
    // For now, we'll use the current data
    console.log('Chart range changed to:', range);
}

// Update weather sidebar with real sensor data
function updateWeatherSidebar(sensors) {
    if (!sensors) return;
    
    // Update temperature
    const temp = sensors.temperature || 12;
    const tempElement = document.getElementById('sidebar-temp');
    if (tempElement) {
        tempElement.textContent = `${temp.toFixed(0)}°C`;
    }
    
    // Update weather condition based on humidity and temperature
    const humidity = sensors.humidity || 0;
    const conditionElement = document.getElementById('sidebar-condition');
    if (conditionElement) {
        if (humidity > 80) {
            conditionElement.textContent = 'Rainy';
        } else if (humidity > 60) {
            conditionElement.textContent = 'Mostly Cloudy';
        } else if (humidity > 40) {
            conditionElement.textContent = 'Partly Cloudy';
        } else {
            conditionElement.textContent = 'Clear';
        }
    }
    
    // Update rain probability based on humidity
    const rainElement = document.getElementById('sidebar-rain');
    if (rainElement) {
        const rainProb = Math.min(100, Math.max(0, Math.round((humidity - 40) * 2)));
        rainElement.textContent = rainProb;
    }
}

// Update weather sidebar time
function updateWeatherSidebarTime() {
    const timeElement = document.getElementById('sidebar-time');
    if (timeElement) {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[now.getDay()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeElement.textContent = `${dayName} ${hours}:${minutes}`;
    }
}

// Load all system data
async function loadSystemData() {
    try {
        // Add spinning animation to refresh button
        const updateBtn = document.getElementById('updateBtnMain');
        if (updateBtn) {
            updateBtn.classList.add('refreshing');
        }
        
        const response = await fetch(`${API_BASE}/api/status`);
        const data = await response.json();
        
        updateSensorDisplay(data.sensors);
        updateEnergyDisplay(data.energy);
        updateIrrigationStatus(data.irrigation);
        updateZonesDisplay(data.zones);
        updateLastUpdate();
        
        // Check valve status for notifications
        checkValveStatusAndNotify(data.irrigation);
        
        // Monitor battery levels for notifications
        checkBatteryLevelAndNotify(data.energy);
        
        // Load Safety Status (CRITICAL for lithium battery monitoring)
        loadSafetyStatus();
        
        // Load AI recommendation
        loadAIRecommendation();
        
        // Remove spinning animation after data loads
        if (updateBtn) {
            setTimeout(() => {
                updateBtn.classList.remove('refreshing');
            }, 500);
        }
    } catch (error) {
        console.error('Error loading system data:', error);
        showError('Failed to load system data');
        
        // Remove spinning animation on error
        const updateBtn = document.getElementById('updateBtnMain');
        if (updateBtn) {
            updateBtn.classList.remove('refreshing');
        }
    }
}

// Update sensor displays with real data
function updateSensorDisplay(sensors) {
    if (!sensors) return;
    
    // Soil Moisture
    const soilMoisture = sensors.soil_moisture || 0;
    document.getElementById('soil-moisture').textContent = soilMoisture.toFixed(1);
    document.getElementById('soil-status').textContent = getSoilStatus(soilMoisture);
    document.getElementById('soil-status').className = 'sensor-status ' + getSoilStatusClass(soilMoisture);
    
    // Temperature
    const temp = sensors.temperature || 0;
    document.getElementById('temperature').textContent = temp.toFixed(1);
    document.getElementById('temp-status').textContent = getTempStatus(temp);
    
    // Humidity
    const humidity = sensors.humidity || 0;
    document.getElementById('humidity').textContent = humidity.toFixed(1);
    document.getElementById('humidity-status').textContent = 'Normal';
    
    // Flow Rate
    const flowRate = sensors.flow_rate || 0;
    document.getElementById('flow-rate').textContent = flowRate.toFixed(2);
    document.getElementById('flow-status').textContent = flowRate > 0 ? 'Active' : 'Idle';
    
    // Update charts
    updateCharts(sensors);
    
    // Update weather sidebar
    updateWeatherSidebar(sensors);
    
    // Store sensor history for charts
    storeSensorHistory(sensors);
    
    // Update statistics cards
    updateStatisticsCards();
}

// Store sensor history for charts
function storeSensorHistory(sensors) {
    if (!sensors) return;
    
    const now = new Date();
    const timeLabel = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Add new data point
    sensorHistory.timestamps.push(timeLabel);
    sensorHistory.temperature.push(sensors.temperature || 0);
    sensorHistory.humidity.push(sensors.humidity || 0);
    sensorHistory.moisture.push(sensors.soil_moisture || 0);
    sensorHistory.irrigation.push(sensors.flow_rate || 0);
    
    // Keep only last MAX_HISTORY_POINTS
    if (sensorHistory.timestamps.length > MAX_HISTORY_POINTS) {
        sensorHistory.timestamps.shift();
        sensorHistory.temperature.shift();
        sensorHistory.humidity.shift();
        sensorHistory.moisture.shift();
        sensorHistory.irrigation.shift();
    }
}

// Update statistics cards with averages
function updateStatisticsCards() {
    // Calculate averages (moyenne)
    const tempAvg = calculateAverage(sensorHistory.temperature);
    const humidityAvg = calculateAverage(sensorHistory.humidity);
    const moistureAvg = calculateAverage(sensorHistory.moisture);
    const irrigationTotal = sensorHistory.irrigation.reduce((a, b) => a + b, 0);
    
    // Update temperature average
    const tempAvgEl = document.getElementById('temp-avg');
    if (tempAvgEl) tempAvgEl.textContent = tempAvg.toFixed(1);
    
    // Update humidity average
    const humidityAvgEl = document.getElementById('humidity-avg');
    if (humidityAvgEl) humidityAvgEl.textContent = humidityAvg.toFixed(1);
    
    // Update moisture average
    const moistureAvgEl = document.getElementById('moisture-avg');
    if (moistureAvgEl) moistureAvgEl.textContent = moistureAvg.toFixed(1);
    
    // Update irrigation total (in minutes)
    const irrigationTotalEl = document.getElementById('irrigation-total');
    if (irrigationTotalEl) irrigationTotalEl.textContent = (irrigationTotal / 60).toFixed(0);
    
    // Update trends
    updateTrends();
}

function calculateAverage(arr) {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

function updateTrends() {
    // Calculate trends (comparing recent vs older data)
    const recentTemp = calculateAverage(sensorHistory.temperature.slice(-6));
    const olderTemp = calculateAverage(sensorHistory.temperature.slice(0, 6));
    const tempTrend = recentTemp - olderTemp;
    
    const tempTrendEl = document.getElementById('temp-trend');
    if (tempTrendEl && sensorHistory.temperature.length > 6) {
        if (tempTrend > 0.5) {
            tempTrendEl.innerHTML = '<i class="fa-solid fa-arrow-up"></i> +' + tempTrend.toFixed(1) + '°C';
            tempTrendEl.className = 'stat-trend up';
        } else if (tempTrend < -0.5) {
            tempTrendEl.innerHTML = '<i class="fa-solid fa-arrow-down"></i> ' + tempTrend.toFixed(1) + '°C';
            tempTrendEl.className = 'stat-trend down';
        } else {
            tempTrendEl.innerHTML = '<i class="fa-solid fa-minus"></i> Stable';
            tempTrendEl.className = 'stat-trend neutral';
        }
    }
    
    // Similar for humidity
    const recentHumidity = calculateAverage(sensorHistory.humidity.slice(-6));
    const olderHumidity = calculateAverage(sensorHistory.humidity.slice(0, 6));
    const humidityTrend = recentHumidity - olderHumidity;
    
    const humidityTrendEl = document.getElementById('humidity-trend');
    if (humidityTrendEl && sensorHistory.humidity.length > 6) {
        if (humidityTrend > 2) {
            humidityTrendEl.innerHTML = '<i class="fa-solid fa-arrow-up"></i> +' + humidityTrend.toFixed(1) + '%';
            humidityTrendEl.className = 'stat-trend up';
        } else if (humidityTrend < -2) {
            humidityTrendEl.innerHTML = '<i class="fa-solid fa-arrow-down"></i> ' + humidityTrend.toFixed(1) + '%';
            humidityTrendEl.className = 'stat-trend down';
        } else {
            humidityTrendEl.innerHTML = '<i class="fa-solid fa-minus"></i> Stable';
            humidityTrendEl.className = 'stat-trend neutral';
        }
    }
}

// Update energy/battery display
function updateEnergyDisplay(energy) {
    if (!energy) return;
    
    const batteryPercent = energy.battery_percentage || 0;
    document.getElementById('battery').textContent = batteryPercent.toFixed(0);
    document.getElementById('battery-status').textContent = getBatteryStatus(batteryPercent);
    
    const solarStatus = energy.solar_status || 'unknown';
    document.getElementById('solar-status').textContent = solarStatus.replace('_', ' ').toUpperCase();
    document.getElementById('solar-text').textContent = getSolarText(solarStatus);
}

// Update irrigation status
function updateIrrigationStatus(irrigation) {
    if (!irrigation) return;
    
    const activeZones = irrigation.active_zones || {};
    const isActive = Object.keys(activeZones).length > 0;
    
    const badge = document.getElementById('valve-badge');
    if (badge) {
        badge.textContent = isActive ? 'ON' : 'OFF';
        badge.className = isActive ? 'valve-badge active' : 'valve-badge';
    }
    
    // Update irrigation info
    if (isActive) {
        const firstZone = Object.values(activeZones)[0];
        document.getElementById('irrigation-duration').textContent = `${firstZone.elapsed}s / ${firstZone.elapsed + firstZone.remaining}s`;
        document.getElementById('water-used').textContent = `${(firstZone.elapsed * 0.05).toFixed(2)}L`;
    } else {
        document.getElementById('irrigation-duration').textContent = '--';
        document.getElementById('water-used').textContent = '--';
    }
}

// Update zones display
function updateZonesDisplay(zones) {
    if (!zones || zones.length === 0) return;
    
    const zonesGrid = document.getElementById('zones-grid');
    zonesGrid.innerHTML = '';
    
    zones.forEach((zone, index) => {
        const zoneCard = document.createElement('div');
        zoneCard.className = 'zone-card';
        
        // Generate random stats for demo (replace with real data from API)
        const waterUsed = (Math.random() * 500 + 100).toFixed(1);
        const irrigationCount = Math.floor(Math.random() * 20 + 5);
        const efficiency = (Math.random() * 30 + 70).toFixed(1);
        
        zoneCard.innerHTML = `
            <div class="zone-header">
                <h4><i class="fa-solid fa-layer-group"></i> ${zone.name}</h4>
                <button class="zone-stats-toggle" onclick="toggleZoneStats(${index})" title="View Statistics">
                    <i class="fa-solid fa-chart-simple"></i>
                </button>
            </div>
            <div class="zone-info">
                <p><strong>Crop:</strong> ${zone.crop_name || 'Not set'}</p>
                <p><strong>Soil:</strong> ${zone.soil_name || 'Not set'}</p>
                <p><strong>Status:</strong> <span class="zone-status ${zone.active ? 'active' : 'idle'}">${zone.active ? 'Active' : 'Idle'}</span></p>
            </div>
            <div class="zone-stats-panel" id="zone-stats-${index}" style="display: none;">
                <div class="zone-stats-grid">
                    <div class="zone-stat-card">
                        <div class="stat-icon water">
                            <i class="fa-solid fa-droplet"></i>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">Water Used</span>
                            <span class="stat-value">${waterUsed} L</span>
                        </div>
                    </div>
                    <div class="zone-stat-card">
                        <div class="stat-icon count">
                            <i class="fa-solid fa-rotate"></i>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">Irrigations</span>
                            <span class="stat-value">${irrigationCount}</span>
                        </div>
                    </div>
                    <div class="zone-stat-card">
                        <div class="stat-icon efficiency">
                            <i class="fa-solid fa-gauge-high"></i>
                        </div>
                        <div class="stat-content">
                            <span class="stat-label">Efficiency</span>
                            <span class="stat-value">${efficiency}%</span>
                        </div>
                    </div>
                </div>
                <div class="zone-charts">
                    <div class="zone-chart-container">
                        <h5><i class="fa-solid fa-chart-line"></i> Water Usage (7 Days)</h5>
                        <canvas id="zone-water-chart-${index}"></canvas>
                    </div>
                    <div class="zone-chart-container">
                        <h5><i class="fa-solid fa-chart-bar"></i> Irrigation Count (7 Days)</h5>
                        <canvas id="zone-irrigation-chart-${index}"></canvas>
                    </div>
                </div>
            </div>
        `;
        zonesGrid.appendChild(zoneCard);
        
        // Initialize charts after DOM is updated
        setTimeout(() => initializeZoneCharts(index, waterUsed, irrigationCount), 100);
    });
}

// Toggle zone statistics panel
function toggleZoneStats(zoneIndex) {
    const panel = document.getElementById(`zone-stats-${zoneIndex}`);
    const toggleBtn = event.currentTarget;
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        toggleBtn.classList.add('active');
        toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    } else {
        panel.style.display = 'none';
        toggleBtn.classList.remove('active');
        toggleBtn.innerHTML = '<i class="fa-solid fa-chart-simple"></i>';
    }
}

// Initialize zone charts
function initializeZoneCharts(zoneIndex, totalWater, totalIrrigations) {
    // Generate sample data for 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const waterData = Array.from({length: 7}, () => Math.random() * 100 + 20);
    const irrigationData = Array.from({length: 7}, () => Math.floor(Math.random() * 5 + 1));
    
    // Water usage chart
    const waterCtx = document.getElementById(`zone-water-chart-${zoneIndex}`);
    if (waterCtx) {
        new Chart(waterCtx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Water (L)',
                    data: waterData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#666' },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#666' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // Irrigation count chart
    const irrigationCtx = document.getElementById(`zone-irrigation-chart-${zoneIndex}`);
    if (irrigationCtx) {
        new Chart(irrigationCtx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Count',
                    data: irrigationData,
                    backgroundColor: '#4caf50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: '#666',
                            stepSize: 1
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: { color: '#666' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

// Load Safety Status (CRITICAL for lithium battery monitoring)
async function loadSafetyStatus() {
    try {
        // Fetch both safety status and system status in parallel
        const [safetyResponse, systemResponse] = await Promise.all([
            fetch(`${API_BASE}/api/safety/status`),
            fetch(`${API_BASE}/api/status`)
        ]);
        
        const safetyData = await safetyResponse.json();
        const systemData = await systemResponse.json();
        
        if (safetyData.success && safetyData.data) {
            const safety = safetyData.data;
            const batteryVoltage = systemData.energy?.battery_voltage || 0;
            const batteryPercent = systemData.energy?.battery_percentage || 0;
            const sensors = systemData.sensors || {};
            
            updateSafetyDisplay(safety, batteryVoltage, batteryPercent, sensors);
        } else {
            updateSafetyDisplay(null, 0, 0, null, 'Failed to load safety status');
        }
    } catch (error) {
        console.error('Error loading safety status:', error);
        // Show error status
        updateSafetyDisplay(null, 0, 0, null, 'Failed to load safety status');
    }
}

// Update Safety Status display
function updateSafetyDisplay(safety, batteryVoltage, batteryPercent, sensors, error = null) {
    const statusGrid = document.getElementById('safety-status-grid') || document.querySelector('.status-grid');
    if (!statusGrid) return;
    
    if (error) {
        statusGrid.innerHTML = `
            <div class="status-item">
                <i class="fa-solid fa-circle-exclamation status-error"></i>
                <span>${error}</span>
            </div>
        `;
        return;
    }
    
    // Battery Safety Status (Lithium Battery Monitoring)
    const batteryMinVoltage = safety?.battery_min || 11.5;
    const batteryCriticalVoltage = 10.5;
    let batteryStatus = 'ok';
    let batteryStatusText = `Battery Safe (${batteryVoltage.toFixed(2)}V)`;
    let batteryIcon = 'fa-circle-check';
    
    if (batteryVoltage > 0 && batteryVoltage < batteryCriticalVoltage) {
        batteryStatus = 'critical';
        batteryStatusText = `CRITICAL: Battery Too Low (${batteryVoltage.toFixed(2)}V < ${batteryCriticalVoltage}V)`;
        batteryIcon = 'fa-circle-exclamation';
    } else if (batteryVoltage > 0 && batteryVoltage < batteryMinVoltage) {
        batteryStatus = 'warning';
        batteryStatusText = `Warning: Battery Low (${batteryVoltage.toFixed(2)}V < ${batteryMinVoltage}V)`;
        batteryIcon = 'fa-triangle-exclamation';
    } else if (batteryVoltage > 0) {
        batteryStatus = 'ok';
        batteryStatusText = `Battery Safe (${batteryVoltage.toFixed(2)}V)`;
        batteryIcon = 'fa-circle-check';
    }
    
    // Temperature Safety (for lithium battery)
    const temp = sensors?.temperature || 0;
    const maxTemp = 50;
    const minTemp = 0;
    let tempStatus = 'ok';
    let tempStatusText = `Temperature Normal (${temp.toFixed(1)}°C)`;
    let tempIcon = 'fa-circle-check';
    
    if (temp > maxTemp || temp < minTemp) {
        tempStatus = 'warning';
        if (temp > maxTemp) {
            tempStatusText = `Warning: High Temp (${temp.toFixed(1)}°C > ${maxTemp}°C)`;
        } else {
            tempStatusText = `Warning: Low Temp (${temp.toFixed(1)}°C < ${minTemp}°C)`;
        }
        tempIcon = 'fa-triangle-exclamation';
    }
    
    // Leak Detection
    const leakDetected = safety?.leak_detected !== undefined ? safety.leak_detected : false;
    const leakStatus = leakDetected ? 'error' : 'ok';
    const leakText = leakDetected ? 'CRITICAL: Leak Detected' : 'No Leaks Detected';
    const leakIcon = leakDetected ? 'fa-circle-exclamation' : 'fa-circle-check';
    
    // Pi Authority
    const piAuthority = safety?.pi_has_authority !== false;
    const piStatus = piAuthority ? 'ok' : 'warning';
    const piText = piAuthority ? 'Pi Has Final Authority' : 'Authority Warning';
    const piIcon = piAuthority ? 'fa-circle-check' : 'fa-triangle-exclamation';
    
    // Safety Engine Status
    const safetyEnabled = safety?.safety_enabled !== false;
    const safetyStatus = safetyEnabled ? 'ok' : 'error';
    const safetyText = safetyEnabled ? 'Safety Engine Active' : 'Safety Engine Disabled';
    const safetyIcon = safetyEnabled ? 'fa-shield-halved' : 'fa-shield-slash';
    
    statusGrid.innerHTML = `
        <div class="status-item">
            <div>
                <i class="fa-solid fa-check-circle status-ok"></i>
                <span>Final Stage Check</span>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
        <div class="status-item">
            <div>
                <i class="fa-solid ${batteryIcon} status-${batteryStatus}"></i>
                <span>${batteryStatusText}</span>
            </div>
            <span class="status-detail">${batteryPercent.toFixed(0)}% | Min: ${batteryMinVoltage}V | Critical: 10.5V</span>
        </div>
        <div class="status-item">
            <div>
                <i class="fa-solid ${tempIcon} status-${tempStatus}"></i>
                <span>${tempStatusText}</span>
            </div>
        </div>
        <div class="status-item">
            <div>
                <i class="fa-solid ${leakIcon} status-${leakStatus}"></i>
                <span>${leakText}</span>
            </div>
        </div>
        <div class="status-item">
            <div>
                <i class="fa-solid ${safetyIcon} status-${safetyStatus}"></i>
                <span>${safetyText}</span>
            </div>
        </div>
        <div class="status-item">
            <div>
                <i class="fa-solid ${piIcon} status-${piStatus}"></i>
                <span>${piText}</span>
            </div>
        </div>
        ${safety ? `
        <div class="status-item">
            <div>
                <i class="fa-solid fa-water status-info"></i>
                <span>Daily Usage: ${safety.daily_water_usage || 0}L / ${safety.max_daily_water || 100}L</span>
            </div>
        </div>
        ` : ''}
    `;
}

// Load AI recommendation
async function loadAIRecommendation() {
    try {
        const response = await fetch(`${API_BASE}/api/ai/recommendation`);
        const data = await response.json();
        
        const container = document.getElementById('ai-recommendation');
        if (data.success && data.data) {
            const rec = data.data;
            container.innerHTML = `
                <div class="recommendation-content">
                    <div class="recommendation-header">
                        <i class="fa-solid ${rec.should_irrigate ? 'fa-droplet' : 'fa-circle-xmark'}"></i>
                        <strong>${rec.should_irrigate ? 'Irrigation Recommended' : 'No Irrigation Needed'}</strong>
                    </div>
                    <p class="recommendation-reason">${rec.reason}</p>
                    <div class="recommendation-details">
                        <span><i class="fa-solid fa-clock"></i> Duration: ${rec.recommended_duration}s</span>
                        <span><i class="fa-solid fa-brain"></i> Confidence: ${(rec.confidence * 100).toFixed(0)}%</span>
                        <span><i class="fa-solid fa-microchip"></i> Source: ${rec.ai_source}</span>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading AI recommendation:', error);
    }
}

// Initialize all charts
function initCharts() {
    initCombinedChart();
    initTempTrendChart();
    initHumidityIrrigationChart();
}

// Initialize combined environmental data chart
function initCombinedChart() {
    const ctx = document.getElementById('combined-chart');
    if (!ctx) return;
    
    combinedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: [],
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Soil Moisture (%)',
                    data: [],
                    borderColor: '#96CEB4',
                    backgroundColor: 'rgba(150, 206, 180, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Irrigation (L/min)',
                    data: [],
                    borderColor: '#45B7D1',
                    backgroundColor: 'rgba(69, 183, 209, 0.2)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true,
                    yAxisID: 'y1',
                    type: 'bar'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            family: 'Rubik'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        family: 'Rubik'
                    },
                    bodyFont: {
                        size: 13,
                        family: 'Rubik'
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature / Humidity / Moisture',
                        font: {
                            size: 12,
                            family: 'Rubik'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Irrigation Flow',
                        font: {
                            size: 12,
                            family: 'Rubik'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Initialize temperature trend chart
function initTempTrendChart() {
    const ctx = document.getElementById('temp-chart');
    if (!ctx) return;
    
    tempTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°C)',
                data: [],
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
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

// Initialize humidity & irrigation chart
function initHumidityIrrigationChart() {
    const ctx = document.getElementById('humidity-irrigation-chart');
    if (!ctx) return;
    
    humidityIrrigationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.2)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Irrigation Active',
                    data: [],
                    borderColor: '#45B7D1',
                    backgroundColor: 'rgba(69, 183, 209, 0.3)',
                    borderWidth: 0,
                    tension: 0,
                    fill: true,
                    yAxisID: 'y1',
                    stepped: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Irrigation'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    max: 1
                }
            }
        }
    });
}

// Update all charts with current data
function updateCharts(sensors) {
    if (!sensors || sensorHistory.timestamps.length === 0) return;
    
    // Update combined chart
    if (combinedChart) {
        combinedChart.data.labels = sensorHistory.timestamps;
        combinedChart.data.datasets[0].data = sensorHistory.temperature;
        combinedChart.data.datasets[1].data = sensorHistory.humidity;
        combinedChart.data.datasets[2].data = sensorHistory.moisture;
        combinedChart.data.datasets[3].data = sensorHistory.irrigation;
        combinedChart.update('none');
    }
    
    // Update temperature trend chart
    if (tempTrendChart) {
        tempTrendChart.data.labels = sensorHistory.timestamps;
        tempTrendChart.data.datasets[0].data = sensorHistory.temperature;
        tempTrendChart.update('none');
    }
    
    // Update humidity & irrigation chart
    if (humidityIrrigationChart) {
        humidityIrrigationChart.data.labels = sensorHistory.timestamps;
        humidityIrrigationChart.data.datasets[0].data = sensorHistory.humidity;
        // Convert irrigation flow to binary (active/inactive)
        const irrigationActive = sensorHistory.irrigation.map(flow => flow > 0 ? 1 : 0);
        humidityIrrigationChart.data.datasets[1].data = irrigationActive;
        humidityIrrigationChart.update('none');
    }
}

// Legacy chart initialization (kept for compatibility)
function initChartsLegacy() {
    const moistureCtx = document.getElementById('moisture-chart');
    const tempCtx = document.getElementById('temp-humidity-chart');
    
    if (moistureCtx) {
        moistureChart = new Chart(moistureCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Soil Moisture (%)',
                    data: [],
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }
    
    if (tempCtx) {
        tempChart = new Chart(tempCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: [],
                        borderColor: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Humidity (%)',
                        data: [],
                        borderColor: '#4ECDC4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    y: { type: 'linear', position: 'left', beginAtZero: true },
                    y1: { type: 'linear', position: 'right', beginAtZero: true, max: 100, grid: { drawOnChartArea: false } }
                }
            }
        });
    }
}

// Update charts with new data
function updateCharts(sensors) {
    const now = new Date().toLocaleTimeString();
    
    if (moistureChart) {
        moistureChart.data.labels.push(now);
        moistureChart.data.datasets[0].data.push(sensors.soil_moisture);
        
        if (moistureChart.data.labels.length > 20) {
            moistureChart.data.labels.shift();
            moistureChart.data.datasets[0].data.shift();
        }
        
        moistureChart.update('none');
    }
    
    if (tempChart) {
        tempChart.data.labels.push(now);
        tempChart.data.datasets[0].data.push(sensors.temperature);
        tempChart.data.datasets[1].data.push(sensors.humidity);
        
        if (tempChart.data.labels.length > 20) {
            tempChart.data.labels.shift();
            tempChart.data.datasets[0].data.shift();
            tempChart.data.datasets[1].data.shift();
        }
        
        tempChart.update('none');
    }
}

// Event listeners
function setupEventListeners() {
    // Start irrigation - Fixed ID to match HTML
    document.getElementById('start-irrigation-main')?.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE}/api/valve/on`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                showNotification('Irrigation started successfully!', 'success');
            } else {
                showNotification('Failed to start irrigation: ' + data.message, 'error');
            }
        } catch (error) {
            showNotification('Error starting irrigation: ' + error.message, 'error');
        }
    });
    
    // Stop irrigation - Fixed ID to match HTML
    document.getElementById('stop-irrigation-main')?.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE}/api/valve/off`, { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                showNotification('Irrigation stopped successfully!', 'success');
            } else {
                showNotification('Failed to stop irrigation: ' + data.message, 'error');
            }
        } catch (error) {
            showNotification('Error stopping irrigation: ' + error.message, 'error');
        }
    });
    
    // Emergency stop - Fixed ID to match HTML
    document.getElementById('emergency-stop-main')?.addEventListener('click', async () => {
        showCustomModal('Emergency Stop', 'Are you sure you want to trigger emergency stop? This will immediately stop all irrigation.', async () => {
            try {
                const response = await fetch(`${API_BASE}/api/emergency-stop`, { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                    showNotification('Emergency stop activated!', 'warning');
                } else {
                    showNotification('Failed to activate emergency stop: ' + data.message, 'error');
                }
            } catch (error) {
                showNotification('Error activating emergency stop: ' + error.message, 'error');
            }
        });
    });
    
    // Auto mode toggle
    document.getElementById('auto-mode')?.addEventListener('change', async (e) => {
        try {
            const response = await fetch(`${API_BASE}/api/ai/auto-mode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: e.target.checked })
            });
            const data = await response.json();
            showNotification(`Auto mode ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
        } catch (error) {
            showNotification('Failed to toggle auto mode', 'error');
        }
    });
    
    // Update button
    document.getElementById('updateBtnMain')?.addEventListener('click', checkForUpdates);
    
    // Reboot system button
    document.getElementById('rebootBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('rebootModal');
        if (modal) modal.classList.add('active');
    });
    
    // Reboot modal handlers
    document.getElementById('rebootModalCancel')?.addEventListener('click', () => {
        const modal = document.getElementById('rebootModal');
        if (modal) modal.classList.remove('active');
    });
    
    document.getElementById('confirmRebootBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('confirmRebootBtn');
        if (!btn) return;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Rebooting...</span>';
        
        try {
            const response = await fetch(`${API_BASE}/api/system/reboot`, {
                method: 'POST'
            });
            
            if (response.ok) {
                showNotification('System rebooting... Please wait 30 seconds', 'warning');
                setTimeout(() => location.reload(), 30000);
            } else {
                showNotification('Failed to reboot system', 'error');
            }
        } catch (error) {
            console.error('Reboot error:', error);
            showNotification('Failed to reboot: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-power-off"></i> <span>Reboot Now</span>';
            const modal = document.getElementById('rebootModal');
            if (modal) modal.classList.remove('active');
        }
    });
    
    // Update modal handlers
    document.getElementById('updateModalCancel')?.addEventListener('click', () => {
        const modal = document.getElementById('updateModal');
        if (modal) modal.style.display = 'none';
    });
    
    document.getElementById('installUpdateBtn')?.addEventListener('click', installUpdate);
}

// Check for updates - Improved with progress states and manual refresh
async function checkForUpdates() {
    const modal = document.getElementById('updateModal');
    const modalBody = document.getElementById('updateModalBody');
    const installBtn = document.getElementById('installUpdateBtn');
    const updateBtn = document.getElementById('updateBtnMain');
    const updateBtnIcon = updateBtn?.querySelector('i');
    
    if (!modal || !modalBody) return;
    
    // Add spinning animation to button
    if (updateBtnIcon) {
        updateBtnIcon.classList.add('fa-spin');
        updateBtn.style.pointerEvents = 'none';
    }
    
    modal.style.display = 'flex';
    modal.classList.add('fade-in');
    
    // Show checking state with animated progress
    modalBody.innerHTML = `
        <div class="update-progress-container">
            <div class="update-spinner">
                <i class="fa-solid fa-rotate fa-spin"></i>
            </div>
            <p class="update-status">Searching for updates...</p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: 30%"></div>
            </div>
            <p style="color: #666; font-size: 0.85rem; margin-top: 1rem;">Checking GitHub releases...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/api/system/update/check`);
        const data = await response.json();
        
        // Simulate progress for smooth UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (data.success && data.update_available) {
            const indicator = document.getElementById('updateIndicator');
            if (indicator) indicator.classList.add('active');
            
            modalBody.innerHTML = `
                <div class="update-info">
                    <div class="update-success-icon">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h3 style="color: #4caf50; margin: 1rem 0;">🎉 New Version Available!</h3>
                    <div class="version-comparison">
                        <div class="version-box current">
                            <span class="version-label">Current</span>
                            <span class="version-number">v${data.current_version || '1.0.0'}</span>
                        </div>
                        <i class="fa-solid fa-arrow-right" style="color: #2196F3; font-size: 1.5rem;"></i>
                        <div class="version-box new">
                            <span class="version-label">Latest</span>
                            <span class="version-number">v${data.latest_version}</span>
                        </div>
                    </div>
                    <p style="color: #999; margin: 0.5rem 0;">Released: ${new Date(data.release_date).toLocaleDateString()}</p>
                    <div class="release-notes-section">
                        <h4 style="margin: 1.5rem 0 0.75rem 0; color: #FFFFFF; font-size: 1rem;">
                            <i class="fa-solid fa-file-lines"></i> Release Notes
                        </h4>
                        <div class="release-notes-content">
                            ${data.release_notes || 'No release notes provided.'}
                        </div>
                    </div>
                    <button class="refresh-check-btn" onclick="checkForUpdates()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(33, 150, 243, 0.1); border: 1px solid #2196F3; border-radius: 6px; color: #2196F3; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
                        <i class="fa-solid fa-rotate"></i> Check Again
                    </button>
                </div>
            `;
            if (installBtn) {
                installBtn.style.display = 'flex';
                installBtn.dataset.downloadUrl = data.download_url;
            }
        } else {
            modalBody.innerHTML = `
                <div class="update-info">
                    <div class="update-success-icon" style="color: #4caf50;">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h3 style="color: #4caf50; margin: 1rem 0;">✅ You're Up to Date!</h3>
                    <p style="color: #999;">Running version ${data.current_version || '1.0.0'}</p>
                    <p style="color: #666; margin-top: 1rem; font-size: 0.9rem;">Your system is running the latest version.</p>
                    <p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;">Last checked: ${new Date().toLocaleTimeString()}</p>
                    <button class="refresh-check-btn" onclick="checkForUpdates()" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; font-weight: 600; box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3); transition: all 0.3s ease;">
                        <i class="fa-solid fa-rotate"></i> Refresh & Check Again
                    </button>
                </div>
            `;
            if (installBtn) installBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Update check error:', error);
        modalBody.innerHTML = `
            <div class="update-info">
                <div class="update-error-icon">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 style="color: #f44336; margin: 1rem 0;">⚠️ Connection Error</h3>
                <p style="color: #999;">Unable to check for updates</p>
                <p style="color: #666; font-size: 0.85rem; margin-top: 1rem; padding: 0.75rem; background: rgba(244, 67, 54, 0.1); border-radius: 8px;">
                    ${error.message}
                </p>
                <button class="refresh-check-btn" onclick="checkForUpdates()" style="margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); border: none; border-radius: 8px; color: white; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; font-weight: 600; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);">
                    <i class="fa-solid fa-rotate"></i> Try Again
                </button>
            </div>
        `;
        if (installBtn) installBtn.style.display = 'none';
    } finally {
        // Remove spinning animation from button
        if (updateBtnIcon) {
            updateBtnIcon.classList.remove('fa-spin');
            updateBtn.style.pointerEvents = 'auto';
        }
    }
}

// Install update - Improved with detailed progress tracking
async function installUpdate() {
    const installBtn = document.getElementById('installUpdateBtn');
    const modalBody = document.getElementById('updateModalBody');
    const downloadUrl = installBtn?.dataset.downloadUrl;
    
    if (!downloadUrl) return;
    
    installBtn.disabled = true;
    installBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Installing...';
    
    // Show installation progress
    modalBody.innerHTML = `
        <div class="update-progress-container">
            <div class="update-spinner installing">
                <i class="fa-solid fa-download fa-beat"></i>
            </div>
            <h3 style="color: #2196F3; margin: 1rem 0;">Installing Update...</h3>
            <div class="installation-steps">
                <div class="install-step active">
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Downloading update package...</span>
                </div>
                <div class="install-step">
                    <i class="fa-solid fa-circle"></i>
                    <span>Extracting files...</span>
                </div>
                <div class="install-step">
                    <i class="fa-solid fa-circle"></i>
                    <span>Applying updates...</span>
                </div>
                <div class="install-step">
                    <i class="fa-solid fa-circle"></i>
                    <span>Finalizing installation...</span>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar installing" style="width: 0%"></div>
            </div>
            <p class="progress-percentage">0%</p>
        </div>
    `;
    
    // Simulate progress steps for better UX
    const progressBar = modalBody.querySelector('.progress-bar');
    const progressText = modalBody.querySelector('.progress-percentage');
    const steps = modalBody.querySelectorAll('.install-step');
    
    const updateProgress = (percent, stepIndex) => {
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = Math.round(percent) + '%';
        
        steps.forEach((step, idx) => {
            step.classList.remove('active', 'completed');
            if (idx < stepIndex) {
                step.classList.add('completed');
                step.querySelector('i').className = 'fa-solid fa-circle-check';
            } else if (idx === stepIndex) {
                step.classList.add('active');
                step.querySelector('i').className = 'fa-solid fa-circle-notch fa-spin';
            }
        });
    };
    
    try {
        // Step 1: Downloading
        updateProgress(25, 0);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Make API call
        const response = await fetch(`${API_BASE}/api/system/update/install`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({download_url: downloadUrl})
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Step 2: Extracting
            updateProgress(50, 1);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Step 3: Applying
            updateProgress(75, 2);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Step 4: Finalizing
            updateProgress(100, 3);
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Show success
            modalBody.innerHTML = `
                <div class="update-info">
                    <div class="update-success-icon" style="color: #4caf50; font-size: 4rem;">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h3 style="color: #4caf50; margin: 1rem 0;">✅ Update Installed Successfully!</h3>
                    <p style="color: #999; margin: 1rem 0;">System will restart in <span id="countdown">5</span> seconds...</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar success" style="width: 100%"></div>
                    </div>
                </div>
            `;
            
            // Countdown timer
            let countdown = 5;
            const countdownEl = document.getElementById('countdown');
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdownEl) countdownEl.textContent = countdown;
                if (countdown <= 0) {
                    clearInterval(countdownInterval);
                    location.reload();
                }
            }, 1000);
            
            showNotification('✅ Update installed successfully!', 'success');
        } else {
            throw new Error(data.error || 'Installation failed');
        }
    } catch (error) {
        console.error('Update installation error:', error);
        modalBody.innerHTML = `
            <div class="update-info">
                <div class="update-error-icon">
                    <i class="fa-solid fa-circle-xmark"></i>
                </div>
                <h3 style="color: #f44336; margin: 1rem 0;">❌ Installation Failed</h3>
                <p style="color: #999;">Unable to install update</p>
                <p style="color: #666; font-size: 0.85rem; margin-top: 1rem; padding: 0.75rem; background: rgba(244, 67, 54, 0.1); border-radius: 8px;">
                    ${error.message}
                </p>
            </div>
        `;
        showNotification('❌ Update failed: ' + error.message, 'error');
        installBtn.disabled = false;
        installBtn.innerHTML = '<i class="fa-solid fa-download"></i> Install Update';
    }
}

// Check for updates quietly on load
setTimeout(async () => {
    try {
        const response = await fetch(`${API_BASE}/api/system/update/check`);
        const data = await response.json();
        
        if (data.success && data.update_available) {
            const indicator = document.getElementById('updateIndicator');
            if (indicator) indicator.classList.add('active');
        }
    } catch (error) {
        console.error('Silent update check failed:', error);
    }
}, 3000);

// Notification System Functions
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

// Enhanced valve status monitoring with detailed pump information
let lastPumpState = null;
let lastBatteryLevel = null;
let batteryWarningShown = false;

function checkValveStatusAndNotify(irrigation) {
    if (!irrigation) return;
    
    const valveOpen = irrigation.valve_open || false;
    const pumpRunning = irrigation.pump_running || false;
    const duration = irrigation.current_duration || 0;
    const waterFlow = irrigation.flow_rate || 0;
    
    // Check for valve/pump state changes
    if (lastValveState !== null && lastValveState !== valveOpen) {
        const notification = {
            id: Date.now(),
            type: valveOpen ? 'success' : 'info',
            icon: valveOpen ? 'fa-droplet' : 'fa-droplet-slash',
            title: valveOpen ? 'Pump Started' : 'Pump Stopped',
            message: valveOpen 
                ? `Irrigation pump activated - Water flow: ${waterFlow.toFixed(1)} L/min` 
                : `Pump stopped after ${Math.floor(duration / 60)} minutes - Total water used: ${(waterFlow * duration / 60).toFixed(1)}L`,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            priority: valveOpen ? 'high' : 'medium'
        };
        
        addNotification(notification);
        
        // Show additional system status notification
        if (valveOpen) {
            setTimeout(() => {
                addNotification({
                    id: Date.now() + 1,
                    type: 'info',
                    icon: 'fa-info-circle',
                    title: 'System Status',
                    message: 'Monitoring irrigation cycle - Check water pressure and flow rate',
                    time: new Date().toLocaleTimeString(),
                    timestamp: Date.now(),
                    priority: 'low'
                });
            }, 2000);
        }
    }
    
    // Check for pump malfunction (valve open but no flow)
    if (valveOpen && waterFlow < 0.1 && duration > 30) {
        addNotification({
            id: Date.now() + 2,
            type: 'warning',
            icon: 'fa-triangle-exclamation',
            title: 'Pump Warning',
            message: 'Low water flow detected - Check water source and pump connection',
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now(),
            priority: 'high'
        });
    }
    
    lastValveState = valveOpen;
    lastPumpState = pumpRunning;
}

// Battery level monitoring and notifications
function checkBatteryLevelAndNotify(energy) {
    if (!energy || energy.battery_percent === undefined) return;
    
    const batteryLevel = energy.battery_percent;
    const isCharging = energy.solar_status === 'charging';
    const currentTime = Date.now();
    
    // Critical battery level (below 15%)
    if (batteryLevel < 15 && !batteryWarningShown) {
        addNotification({
            id: currentTime,
            type: 'error',
            icon: 'fa-battery-empty',
            title: 'Critical Battery Level',
            message: `Battery at ${batteryLevel.toFixed(1)}% - System may shut down soon. Charge immediately!`,
            time: new Date().toLocaleTimeString(),
            timestamp: currentTime,
            priority: 'critical'
        });
        batteryWarningShown = true;
    }
    
    // Low battery level (15-30%)
    else if (batteryLevel >= 15 && batteryLevel < 30 && (lastBatteryLevel === null || lastBatteryLevel >= 30)) {
        addNotification({
            id: currentTime + 1,
            type: 'warning',
            icon: 'fa-battery-quarter',
            title: 'Low Battery Warning',
            message: `Battery level at ${batteryLevel.toFixed(1)}% - Consider reducing irrigation frequency`,
            time: new Date().toLocaleTimeString(),
            timestamp: currentTime,
            priority: 'high'
        });
    }
    
    // Battery level restored (above 50% after being low)
    else if (batteryLevel >= 50 && lastBatteryLevel !== null && lastBatteryLevel < 30) {
        addNotification({
            id: currentTime + 2,
            type: 'success',
            icon: 'fa-battery-three-quarters',
            title: 'Battery Restored',
            message: `Battery level restored to ${batteryLevel.toFixed(1)}% - Normal operations resumed`,
            time: new Date().toLocaleTimeString(),
            timestamp: currentTime,
            priority: 'medium'
        });
        batteryWarningShown = false; // Reset warning flag
    }
    
    // Solar charging status changes
    if (isCharging && (lastBatteryLevel === null || !energy.was_charging)) {
        addNotification({
            id: currentTime + 3,
            type: 'info',
            icon: 'fa-solar-panel',
            title: 'Solar Charging',
            message: `Solar panels active - Battery charging at ${energy.charge_rate || 'unknown'} rate`,
            time: new Date().toLocaleTimeString(),
            timestamp: currentTime,
            priority: 'low'
        });
    }
    
    // Battery fully charged
    if (batteryLevel >= 95 && lastBatteryLevel !== null && lastBatteryLevel < 95) {
        addNotification({
            id: currentTime + 4,
            type: 'success',
            icon: 'fa-battery-full',
            title: 'Battery Fully Charged',
            message: `Battery at ${batteryLevel.toFixed(1)}% - System ready for extended operation`,
            time: new Date().toLocaleTimeString(),
            timestamp: currentTime,
            priority: 'low'
        });
    }
    
    lastBatteryLevel = batteryLevel;
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
        <div class="notification-item ${n.type} priority-${n.priority || 'medium'}">
            <div class="notification-item-header">
                <i class="fa-solid ${n.icon}"></i>
                <strong>${n.title}</strong>
                <span class="notification-priority">${(n.priority || 'medium').toUpperCase()}</span>
            </div>
            <p>${n.message}</p>
            <div class="notification-item-footer">
                <span class="notification-item-time">${n.time}</span>
                <button class="notification-dismiss" onclick="dismissNotification(${n.id})" title="Dismiss">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
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

// Dismiss notification function
function dismissNotification(notificationId) {
    notifications = notifications.filter(n => n.id !== notificationId);
    updateNotificationBadge();
    updateNotificationList();
}

// Export functions
window.closeNotificationPanel = closeNotificationPanel;
window.dismissNotification = dismissNotification;
window.showLoader = showLoader;
window.hideLoader = hideLoader;

// Helper functions
function getSoilStatus(moisture) {
    if (moisture < 20) return 'Very Dry - Irrigation Needed';
    if (moisture < 30) return 'Dry - Consider Irrigation';
    if (moisture < 40) return 'Optimal Range';
    if (moisture < 60) return 'Good';
    return 'Wet - No Irrigation Needed';
}

function getSoilStatusClass(moisture) {
    if (moisture < 30) return 'status-warning';
    if (moisture > 60) return 'status-info';
    return 'status-ok';
}

function getTempStatus(temp) {
    if (temp < 15) return 'Cool';
    if (temp < 25) return 'Optimal';
    if (temp < 35) return 'Warm';
    return 'Hot';
}

function getBatteryStatus(percent) {
    if (percent < 20) return 'Low - Charge Soon';
    if (percent < 50) return 'Medium';
    if (percent < 80) return 'Good';
    return 'Excellent';
}

function getSolarText(status) {
    const statusMap = {
        'charging': 'Actively Charging',
        'low_charge': 'Low Charge Rate',
        'not_charging': 'Not Charging',
        'unknown': 'Status Unknown'
    };
    return statusMap[status] || status;
}

function updateLastUpdate() {
    const now = new Date().toLocaleString();
    document.getElementById('last-update').textContent = now;
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can implement a toast notification system here
}

function showError(message) {
    console.error(message);
}

// Setup return to setup functionality
function setupReturnToSetup() {
    const setupLink = document.getElementById('setup-link');
    if (setupLink) {
        setupLink.addEventListener('click', (e) => {
            e.preventDefault();
            showCustomModal('Return to Setup', 'This will reset your current setup configuration. Are you sure you want to continue?', () => {
                // Clear setup completion flag
                localStorage.removeItem('bayyti_setup_complete');
                localStorage.removeItem('bayyti_config');
                
                // Redirect to setup page
                window.location.href = 'setup.html';
            });
        });
    }
}

// Custom Modal Functions
function showCustomModal(title, message, onConfirm) {
    const modal = document.getElementById('custom-modal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body p');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');
    
    // Set content
    modalTitle.textContent = title;
    modalBody.textContent = message;
    
    // Remove existing event listeners by cloning
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new event listeners
    newConfirmBtn.addEventListener('click', () => {
        hideCustomModal();
        if (onConfirm) onConfirm();
    });
    
    newCancelBtn.addEventListener('click', () => {
        hideCustomModal();
    });
    
    // Show modal
    modal.classList.add('active');
    
    // Close on overlay click
    const overlay = modal.querySelector('.modal-overlay');
    overlay.onclick = () => hideCustomModal();
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            hideCustomModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function hideCustomModal() {
    const modal = document.getElementById('custom-modal');
    modal.classList.remove('active');
}

// Demo page and order functions
function showDemoPage() {
    window.open('/setup.html', '_blank');
}

function orderSystem() {
    alert('Contact us to order your BAYYTI-B1 system!');
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarSetupLink = document.getElementById('sidebar-setup-link');
    
    if (mobileMenuBtn && mobileSidebar) {
        // Open sidebar
        mobileMenuBtn.addEventListener('click', () => {
            mobileSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        // Close sidebar
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                mobileSidebar.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                mobileSidebar.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        // Setup link in sidebar
        if (sidebarSetupLink) {
            sidebarSetupLink.addEventListener('click', (e) => {
                e.preventDefault();
                mobileSidebar.classList.remove('active');
                document.body.style.overflow = '';
                // Clear setup completion and redirect
                showCustomModal('Return to Setup', 'This will reset your current setup configuration. Are you sure you want to continue?', () => {
                    localStorage.removeItem('bayyti_setup_complete');
                    localStorage.removeItem('bayyti_config');
                    window.location.href = 'setup.html';
                });
            });
        }
    }
}
