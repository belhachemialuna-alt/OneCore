// BAYYTI-B1 Dashboard - Real Data Display
const API_BASE = window.location.origin;
let moistureChart, tempChart;
let updateInterval;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadSystemData();
    setupEventListeners();
    setupReturnToSetup();
    setupMobileMenu();
    
    // Update every 5 seconds
    updateInterval = setInterval(loadSystemData, 5000);
});

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

// Initialize charts
function initCharts() {
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
}

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
