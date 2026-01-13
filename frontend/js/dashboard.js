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
        const response = await fetch(`${API_BASE}/api/logs`);
        const data = await response.json();
        
        if (data.success && data.data) {
            updateScheduleTable(data.data);
        }
    } catch (error) {
        console.error('Error loading irrigation schedule:', error);
    }
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
        const response = await fetch(`${API_BASE}/api/status`);
        const data = await response.json();
        
        updateSensorDisplay(data.sensors);
        updateEnergyDisplay(data.energy);
        updateIrrigationStatus(data.irrigation);
        updateZonesDisplay(data.zones);
        updateLastUpdate();
        
        // Check valve status for notifications
        checkValveStatusAndNotify(data.irrigation);
        
        // Load Safety Status (CRITICAL for lithium battery monitoring)
        loadSafetyStatus();
        
        // Load AI recommendation
        loadAIRecommendation();
    } catch (error) {
        console.error('Error loading system data:', error);
        showError('Failed to load system data');
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
    
    zones.forEach(zone => {
        const zoneCard = document.createElement('div');
        zoneCard.className = 'zone-card';
        zoneCard.innerHTML = `
            <h4><i class="fa-solid fa-layer-group"></i> ${zone.name}</h4>
            <div class="zone-info">
                <p><strong>Crop:</strong> ${zone.crop_name || 'Not set'}</p>
                <p><strong>Soil:</strong> ${zone.soil_name || 'Not set'}</p>
                <p><strong>Status:</strong> ${zone.active ? 'Active' : 'Idle'}</p>
            </div>
        `;
        zonesGrid.appendChild(zoneCard);
    });
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
    // Start irrigation
    document.getElementById('start-irrigation')?.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE}/api/valve/on`, { method: 'POST' });
            const data = await response.json();
            showNotification(data.success ? 'Irrigation started' : data.message, data.success ? 'success' : 'error');
            loadSystemData();
        } catch (error) {
            showNotification('Failed to start irrigation', 'error');
        }
    });
    
    // Stop irrigation
    document.getElementById('stop-irrigation')?.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE}/api/valve/off`, { method: 'POST' });
            const data = await response.json();
            showNotification(data.success ? 'Irrigation stopped' : data.message, data.success ? 'success' : 'error');
            loadSystemData();
        } catch (error) {
            showNotification('Failed to stop irrigation', 'error');
        }
    });
    
    // Emergency stop
    document.getElementById('emergency-stop')?.addEventListener('click', async () => {
        showCustomModal('Emergency Stop', 'Are you sure you want to trigger emergency stop? This will immediately stop all irrigation.', async () => {
            try {
                const response = await fetch(`${API_BASE}/api/emergency-stop`, { method: 'POST' });
                const data = await response.json();
                showNotification('Emergency stop activated', 'warning');
                loadSystemData();
            } catch (error) {
                showNotification('Failed to trigger emergency stop', 'error');
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

// Check for updates
async function checkForUpdates() {
    const modal = document.getElementById('updateModal');
    const modalBody = document.getElementById('updateModalBody');
    const installBtn = document.getElementById('installUpdateBtn');
    
    if (!modal || !modalBody) return;
    
    modal.style.display = 'flex';
    modalBody.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Checking for updates...</p>';
    
    try {
        const response = await fetch(`${API_BASE}/api/system/update/check`);
        const data = await response.json();
        
        if (data.success && data.update_available) {
            const indicator = document.getElementById('updateIndicator');
            if (indicator) indicator.classList.add('active');
            
            modalBody.innerHTML = `
                <div class="update-info">
                    <p><strong>🎉 New version available: ${data.latest_version}</strong></p>
                    <p>Current version: 1.0.0</p>
                    <p>Release date: ${new Date(data.release_date).toLocaleDateString()}</p>
                    <h4 style="margin-top: 1rem; color: #FFFFFF;">Release Notes:</h4>
                    <div style="max-height: 200px; overflow-y: auto; background: #1a1a1a; padding: 10px; border-radius: 5px;">
                        ${data.release_notes || 'No release notes provided.'}
                    </div>
                </div>
            `;
            if (installBtn) {
                installBtn.style.display = 'flex';
                installBtn.dataset.downloadUrl = data.download_url;
            }
        } else {
            modalBody.innerHTML = '<p>✅ You are running the latest version</p>';
            if (installBtn) installBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Update check error:', error);
        modalBody.innerHTML = `
            <p>⚠️ Unable to check for updates</p>
            <p style="color: #f44336; font-size: 12px;">${error.message}</p>
        `;
        if (installBtn) installBtn.style.display = 'none';
    }
}

// Install update
async function installUpdate() {
    const installBtn = document.getElementById('installUpdateBtn');
    const downloadUrl = installBtn?.dataset.downloadUrl;
    
    if (!downloadUrl) return;
    
    installBtn.disabled = true;
    installBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Installing...';
    
    try {
        const response = await fetch(`${API_BASE}/api/system/update/install`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({download_url: downloadUrl})
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('✅ Update installed! System will restart in 10 seconds.', 'success');
            setTimeout(() => location.reload(), 10000);
        } else {
            showNotification('❌ Update failed: ' + data.error, 'error');
        }
    } catch (error) {
        showNotification('❌ Update failed: ' + error.message, 'error');
    } finally {
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

function checkValveStatusAndNotify(irrigation) {
    if (!irrigation) return;
    
    const valveOpen = irrigation.valve_open || false;
    
    if (lastValveState !== null && lastValveState !== valveOpen) {
        const notification = {
            id: Date.now(),
            type: valveOpen ? 'success' : 'info',
            icon: valveOpen ? 'fa-droplet' : 'fa-droplet-slash',
            title: valveOpen ? 'Irrigation Started' : 'Irrigation Stopped',
            message: valveOpen ? 'Valve opened - watering in progress' : 'Valve closed - irrigation complete',
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        };
        
        addNotification(notification);
    }
    
    lastValveState = valveOpen;
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
