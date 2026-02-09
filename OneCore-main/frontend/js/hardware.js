// ElivateOne Hardware Schema Monitor
const API_BASE = window.location.origin + '/api';

// Hardware component states
let hardwareState = {
    valves: {},
    sensors: {},
    system: {},
    pipes: {}
};

let updateInterval;

// Chart instances
let cpuChart = null;
let ramChart = null;

// Chart data arrays (store last 60 data points)
const maxDataPoints = 60;
let cpuData = [];
let ramData = [];
let timeLabels = [];

// Update Header DateTime
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
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', options);
        dateElement.textContent = dateStr;
    }
}

// Load System Architecture Information
async function loadSystemArchitecture() {
    try {
        const response = await fetch(`${API_BASE}/system/info`);
        const data = await response.json();
        
        if (data.success) {
            // Update Processor
            const processorEl = document.getElementById('system-processor');
            const processorDetailEl = document.getElementById('system-processor-detail');
            if (processorEl && data.processor) {
                processorEl.textContent = data.processor.model || 'Raspberry Pi 4B';
                if (processorDetailEl) {
                    processorDetailEl.textContent = `${data.processor.cores || 4} Cores @ ${data.processor.frequency || '1.5'} GHz`;
                }
            }
            
            // Update Memory
            const memoryEl = document.getElementById('system-memory');
            const memoryDetailEl = document.getElementById('system-memory-detail');
            if (memoryEl && data.memory) {
                const totalGB = (data.memory.total / (1024 * 1024 * 1024)).toFixed(1);
                const usedGB = (data.memory.used / (1024 * 1024 * 1024)).toFixed(1);
                memoryEl.textContent = `${totalGB} GB LPDDR4`;
                if (memoryDetailEl) {
                    memoryDetailEl.textContent = `${usedGB} GB Used (${data.memory.percent || 0}%)`;
                }
            }
            
            // Update Connectivity
            const connectivityEl = document.getElementById('system-connectivity');
            const connectivityDetailEl = document.getElementById('system-connectivity-detail');
            if (connectivityEl && data.network) {
                const interfaces = [];
                if (data.network.wifi) interfaces.push('WiFi 5');
                if (data.network.ethernet) interfaces.push('Ethernet');
                connectivityEl.textContent = interfaces.join(' + ') || 'WiFi 5 + Ethernet';
                if (connectivityDetailEl) {
                    const ip = data.network.ip || 'Not Connected';
                    connectivityDetailEl.textContent = `IP: ${ip}`;
                }
            }
            
            // Update Power
            const powerEl = document.getElementById('system-power');
            const powerDetailEl = document.getElementById('system-power-detail');
            if (powerEl && data.power) {
                powerEl.textContent = data.power.supply || '5V 3A USB-C';
                if (powerDetailEl) {
                    const voltage = data.power.voltage || '5.0';
                    const current = data.power.current || '3.0';
                    powerDetailEl.textContent = `${voltage}V @ ${current}A`;
                }
            }
            
            // Update Storage
            const storageEl = document.getElementById('system-storage');
            const storageDetailEl = document.getElementById('system-storage-detail');
            if (storageEl && data.storage) {
                const totalGB = (data.storage.total / (1024 * 1024 * 1024)).toFixed(0);
                const usedGB = (data.storage.used / (1024 * 1024 * 1024)).toFixed(1);
                storageEl.textContent = `${totalGB} GB Storage`;
                if (storageDetailEl) {
                    storageDetailEl.textContent = `${usedGB} GB Used (${data.storage.percent || 0}%)`;
                }
            }
            
            // Update Temperature
            const temperatureEl = document.getElementById('system-temperature');
            const temperatureDetailEl = document.getElementById('system-temperature-detail');
            if (temperatureEl && data.temperature) {
                const temp = data.temperature.cpu || 0;
                temperatureEl.textContent = `${temp}°C`;
                if (temperatureDetailEl) {
                    let status = 'Normal';
                    if (temp > 70) status = 'High';
                    else if (temp > 80) status = 'Critical';
                    temperatureDetailEl.textContent = `Status: ${status}`;
                }
            }
        }
    } catch (error) {
        console.error('Error loading system architecture:', error);
        // Set default values on error
        document.getElementById('system-processor').textContent = 'Raspberry Pi 4B';
        document.getElementById('system-processor-detail').textContent = '4 Cores @ 1.5 GHz';
        document.getElementById('system-memory').textContent = '4 GB LPDDR4';
        document.getElementById('system-memory-detail').textContent = 'System info unavailable';
        document.getElementById('system-connectivity').textContent = 'WiFi 5 + Ethernet';
        document.getElementById('system-connectivity-detail').textContent = 'Network info unavailable';
        document.getElementById('system-power').textContent = '5V 3A USB-C';
        document.getElementById('system-power-detail').textContent = 'Power info unavailable';
        document.getElementById('system-storage').textContent = '32 GB Storage';
        document.getElementById('system-storage-detail').textContent = 'Storage info unavailable';
        document.getElementById('system-temperature').textContent = '--°C';
        document.getElementById('system-temperature-detail').textContent = 'Temperature unavailable';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if real API is not available
    if (!window.realHardwareAPI) {
        setupMobileSidebar();
        initializeCharts();
        loadHardwareStatus();
        loadSystemPerformance();
        loadSystemStats();
        updateComponentLists();
        loadSystemArchitecture();
        
        // Initialize clock
        updateHeaderDateTime();
        setInterval(updateHeaderDateTime, 1000);
        
        // Start real-time monitoring (every 2 seconds)
        updateInterval = setInterval(() => {
            loadHardwareStatus();
            loadSystemPerformance();
            loadSystemStats();
            loadSystemArchitecture();
        }, 2000);
    } else {
        // Just setup mobile sidebar and clock for real API
        setupMobileSidebar();
        updateHeaderDateTime();
        setInterval(updateHeaderDateTime, 1000);
    }
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

// Load Hardware Status from API
async function loadHardwareStatus() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        const data = await response.json();
        
        if (data.success) {
            // Update hardware state from API data
            updateHardwareState(data);
            
            // Update SVG indicators
            updateSVGIndicators();
            
            // Update component lists
            updateComponentLists();
            
            // Update summary counters
            updateSummaryCounters();
        }
    } catch (error) {
        console.error('Error loading hardware status:', error);
        // Set offline status for components if API fails
        setAllComponentsOffline();
    }
}

// Update hardware state from API data
function updateHardwareState(data) {
    // Use components data if available (from mock API)
    if (data.components) {
        hardwareState.valves = data.components.valves || {};
        hardwareState.sensors = data.components.sensors || {};
        hardwareState.system = data.components.system || {};
        
        // Add pipes status
        hardwareState.pipes = {
            main: {
                name: 'Main Water Line',
                status: data.irrigation?.valve_open ? 'online' : 'offline'
            }
        };
        return;
    }
    
    // Fallback to original logic for real API
    // Water source - check if system is running
    hardwareState.system.waterSource = {
        id: 'water-source',
        name: 'Water Source',
        status: data.system ? 'online' : 'offline',
        description: data.system ? 'Connected' : 'Disconnected'
    };
    
    // Pump - check if valve is open (pump should be running)
    hardwareState.system.pump = {
        id: 'pump',
        name: 'Water Pump',
        status: data.irrigation?.valve_open ? 'online' : 'offline',
        description: data.irrigation?.valve_open ? 'Running' : 'Standby'
    };
    
    // Filter - always online if system is running
    hardwareState.system.filter = {
        id: 'filter',
        name: 'Water Filter',
        status: data.system ? 'online' : 'offline',
        description: data.system ? 'Operational' : 'Offline'
    };
    
    // Pressure sensor - check if sensors are working
    hardwareState.sensors.pressure = {
        id: 'pressure-sensor',
        name: 'Pressure Sensor',
        status: data.sensors?.pressure !== undefined ? 'online' : 'offline',
        description: data.sensors?.pressure !== undefined ? `${data.sensors.pressure} PSI` : 'No Data'
    };
    
    // Main valve
    hardwareState.valves.main = {
        id: 'main-valve',
        name: 'Main Control Valve',
        status: data.irrigation?.valve_state === 'open' ? 'online' : 'offline',
        description: data.irrigation?.valve_state === 'open' ? 'Open - Water Flowing' : 'Closed'
    };
    
    // Soil moisture sensors - only show if they exist in data
    if (data.sensors) {
        const soilMoisture = data.sensors.soil_moisture;
        if (soilMoisture !== undefined && soilMoisture !== null) {
            hardwareState.sensors['soil-1'] = {
                id: 'soil-sensor-1',
                name: 'Soil Moisture Sensor',
                status: 'online',
                description: `${soilMoisture}%`
            };
        }
    }
    
    // Temperature sensor
    if (data.sensors?.temperature !== undefined) {
        hardwareState.sensors.temperature = {
            id: 'temp-sensor',
            name: 'Temperature Sensor',
            status: 'online',
            description: `${data.sensors.temperature}°C`
        };
    }
    
    // Humidity sensor
    if (data.sensors?.humidity !== undefined) {
        hardwareState.sensors.humidity = {
            id: 'humidity-sensor',
            name: 'Humidity Sensor',
            status: 'online',
            description: `${data.sensors.humidity}%`
        };
    }
    
    // Raspberry Pi GPIO status
    hardwareState.system.gpio = {
        id: 'raspberry-pi',
        name: 'Raspberry Pi GPIO',
        status: data.system ? 'online' : 'offline',
        description: data.system ? 'GPIO Pins Active' : 'Offline'
    };
    
    // Pipes - check water flow
    hardwareState.pipes.main = {
        name: 'Main Water Line',
        status: data.irrigation?.valve_open ? 'online' : 'offline'
    };
}

// Update SVG indicators based on hardware state
function updateSVGIndicators() {
    // Update all status indicators in the SVG
    Object.values(hardwareState.valves).forEach(valve => {
        updateSVGElement(valve.id + '-status', valve.status);
    });
    
    Object.values(hardwareState.sensors).forEach(sensor => {
        updateSVGElement(sensor.id + '-status', sensor.status);
    });
    
    Object.values(hardwareState.system).forEach(component => {
        updateSVGElement(component.id, component.status);
    });
    
    // Update pipes
    const mainValveOpen = hardwareState.valves.main?.status === 'online';
    if (mainValveOpen) {
        document.querySelectorAll('.pipe').forEach(pipe => {
            pipe.classList.add('active');
        });
    } else {
        document.querySelectorAll('.pipe').forEach(pipe => {
            pipe.classList.remove('active');
        });
    }
}

// Update individual SVG element
function updateSVGElement(elementId, status) {
    const element = document.getElementById(elementId);
    if (element) {
        // Remove all status classes
        element.classList.remove('online', 'offline', 'error', 'warning');
        
        // Add new status class
        element.classList.add(status);
        
        // Update fill color based on status
        switch(status) {
            case 'online':
                element.setAttribute('fill', '#4caf50');
                break;
            case 'offline':
                element.setAttribute('fill', '#757575');
                break;
            case 'error':
                element.setAttribute('fill', '#DC3545');
                break;
            case 'warning':
                element.setAttribute('fill', '#FFC107');
                break;
        }
    }
}

// Update component lists in the UI
function updateComponentLists() {
    // Update Valves List
    const valvesList = document.getElementById('valves-list');
    if (valvesList) {
        valvesList.innerHTML = Object.values(hardwareState.valves).map(valve => `
            <div class="component-item ${valve.status}">
                <div class="component-info">
                    <div class="component-icon">
                        <i class="fa-solid fa-valve"></i>
                    </div>
                    <div class="component-details">
                        <strong>${valve.name}</strong>
                        <span>${valve.description}</span>
                    </div>
                </div>
                <div class="component-status ${valve.status}">
                    <i class="fa-solid fa-circle"></i>
                    <span>${capitalizeFirst(valve.status)}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Update Sensors List
    const sensorsList = document.getElementById('sensors-list');
    if (sensorsList) {
        sensorsList.innerHTML = Object.values(hardwareState.sensors).map(sensor => `
            <div class="component-item ${sensor.status}">
                <div class="component-info">
                    <div class="component-icon">
                        <i class="fa-solid fa-microchip"></i>
                    </div>
                    <div class="component-details">
                        <strong>${sensor.name}</strong>
                        <span>${sensor.description}</span>
                    </div>
                </div>
                <div class="component-status ${sensor.status}">
                    <i class="fa-solid fa-circle"></i>
                    <span>${capitalizeFirst(sensor.status)}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Update System List
    const systemList = document.getElementById('system-list');
    if (systemList) {
        systemList.innerHTML = Object.values(hardwareState.system).map(component => `
            <div class="component-item ${component.status}">
                <div class="component-info">
                    <div class="component-icon">
                        <i class="fa-solid fa-server"></i>
                    </div>
                    <div class="component-details">
                        <strong>${component.name}</strong>
                        <span>${component.description}</span>
                    </div>
                </div>
                <div class="component-status ${component.status}">
                    <i class="fa-solid fa-circle"></i>
                    <span>${capitalizeFirst(component.status)}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Update Pipes List
    const pipesList = document.getElementById('pipes-list');
    if (pipesList) {
        pipesList.innerHTML = Object.values(hardwareState.pipes).map(pipe => `
            <div class="component-item ${pipe.status}">
                <div class="component-info">
                    <div class="component-icon">
                        <i class="fa-solid fa-pipe"></i>
                    </div>
                    <div class="component-details">
                        <strong>${pipe.name}</strong>
                        <span>${pipe.status === 'online' ? 'Water Flowing' : 'No Flow'}</span>
                    </div>
                </div>
                <div class="component-status ${pipe.status}">
                    <i class="fa-solid fa-circle"></i>
                    <span>${capitalizeFirst(pipe.status)}</span>
                </div>
            </div>
        `).join('');
    }
}

// Update summary counters
function updateSummaryCounters() {
    let onlineCount = 0;
    let offlineCount = 0;
    let errorCount = 0;
    
    // Count status from all components
    const allComponents = [
        ...Object.values(hardwareState.valves),
        ...Object.values(hardwareState.sensors),
        ...Object.values(hardwareState.system)
    ];
    
    allComponents.forEach(component => {
        if (component.status === 'online') {
            onlineCount++;
        } else if (component.status === 'offline') {
            offlineCount++;
        } else if (component.status === 'error' || component.status === 'warning') {
            errorCount++;
        }
    });
    
    // Update UI
    document.getElementById('onlineCount').textContent = onlineCount;
    document.getElementById('offlineCount').textContent = offlineCount;
    document.getElementById('errorCount').textContent = errorCount;
}

// Set all components offline (when API fails)
function setAllComponentsOffline() {
    Object.keys(hardwareState).forEach(category => {
        Object.keys(hardwareState[category]).forEach(key => {
            if (hardwareState[category][key].status) {
                hardwareState[category][key].status = 'error';
                hardwareState[category][key].description = 'Connection Lost';
            }
        });
    });
    
    updateSVGIndicators();
    updateComponentLists();
    updateSummaryCounters();
}

// Initialize Chart.js charts
function initializeCharts() {
    // CPU Chart
    const cpuCtx = document.getElementById('cpuChart');
    if (cpuCtx) {
        cpuChart = new Chart(cpuCtx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'CPU Usage (%)',
                    data: cpuData,
                    borderColor: '#FF5722',
                    backgroundColor: 'rgba(255, 87, 34, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        callbacks: {
                            label: function(context) {
                                return 'CPU: ' + context.parsed.y.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // RAM Chart
    const ramCtx = document.getElementById('ramChart');
    if (ramCtx) {
        ramChart = new Chart(ramCtx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'RAM Usage (%)',
                    data: ramData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        callbacks: {
                            label: function(context) {
                                return 'RAM: ' + context.parsed.y.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

// Load real system stats from /api/system endpoint
async function loadSystemStats() {
    try {
        const response = await fetch(`${API_BASE}/system`);
        const data = await response.json();
        
        if (data.cpu_percent !== undefined && data.mem_percent !== undefined) {
            updateSystemStats(data);
            updateCharts(data);
        }
    } catch (error) {
        console.error('Error loading system stats:', error);
    }
}

// Update system stats display
function updateSystemStats(data) {
    // CPU Updates
    const cpuUsage = data.cpu_percent || 0;
    const cpuCores = data.cpu_cores || 1;
    const cpuFreq = data.cpu_freq || 0;
    
    document.getElementById('cpuUsage').textContent = cpuUsage.toFixed(1);
    document.getElementById('cpuCores').textContent = `${cpuCores} Core${cpuCores > 1 ? 's' : ''}`;
    document.getElementById('cpuFreq').textContent = cpuFreq > 0 ? `${cpuFreq} MHz` : 'N/A';
    document.getElementById('cpuProgress').style.width = `${cpuUsage}%`;
    
    // Update CPU status based on usage
    let cpuStatus = 'Normal';
    const cpuProgress = document.getElementById('cpuProgress');
    cpuProgress.className = 'performance-progress';
    
    if (cpuUsage >= 90) {
        cpuStatus = 'Critical';
        cpuProgress.classList.add('critical');
    } else if (cpuUsage >= 70) {
        cpuStatus = 'High';
        cpuProgress.classList.add('high');
    } else {
        cpuProgress.classList.add('normal');
    }
    
    document.getElementById('cpuStatus').textContent = cpuStatus;
    
    // RAM Updates
    const ramUsage = data.mem_percent || 0;
    const ramTotal = data.mem_total || 0;
    const ramUsed = data.mem_used || 0;
    
    document.getElementById('ramUsage').textContent = ramUsage.toFixed(1);
    document.getElementById('ramTotal').textContent = `${ramTotal.toFixed(1)} GB Total`;
    document.getElementById('ramDetail').textContent = `${ramUsed.toFixed(2)} / ${ramTotal.toFixed(2)} GB`;
    document.getElementById('ramProgress').style.width = `${ramUsage}%`;
    
    // Update RAM status based on usage
    let ramStatus = 'Normal';
    const ramProgress = document.getElementById('ramProgress');
    ramProgress.className = 'performance-progress';
    
    if (ramUsage >= 90) {
        ramStatus = 'Critical';
        ramProgress.classList.add('critical');
    } else if (ramUsage >= 70) {
        ramStatus = 'High';
        ramProgress.classList.add('high');
    } else {
        ramProgress.classList.add('normal');
    }
    
    document.getElementById('ramStatus').textContent = ramStatus;
}

// Update charts with new data
function updateCharts(data) {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                    now.getMinutes().toString().padStart(2, '0') + ':' + 
                    now.getSeconds().toString().padStart(2, '0');
    
    // Add new data points
    cpuData.push(data.cpu_percent || 0);
    ramData.push(data.mem_percent || 0);
    timeLabels.push(timeStr);
    
    // Keep only last 60 data points
    if (cpuData.length > maxDataPoints) {
        cpuData.shift();
        ramData.shift();
        timeLabels.shift();
    }
    
    // Update charts
    if (cpuChart) {
        cpuChart.update('none');
    }
    if (ramChart) {
        ramChart.update('none');
    }
}

// Load System Performance (CPU & RAM)
async function loadSystemPerformance() {
    try {
        const response = await fetch(`${API_BASE}/system/monitor`);
        const data = await response.json();
        
        if (data.success && data.data) {
            updateSystemPerformance(data.data);
        }
    } catch (error) {
        console.error('Error loading system performance:', error);
    }
}

// Update System Performance Display
function updateSystemPerformance(systemData) {
    // CPU Updates
    const cpuUsage = systemData.cpu?.usage_percent || 0;
    const cpuCores = systemData.cpu?.cores || 1;
    const cpuFreq = systemData.cpu?.frequency_mhz || 0;
    const cpuStatus = systemData.cpu?.status || 'normal';
    
    document.getElementById('cpuUsage').textContent = cpuUsage.toFixed(1);
    document.getElementById('cpuCores').textContent = `${cpuCores} Core${cpuCores > 1 ? 's' : ''}`;
    document.getElementById('cpuFreq').textContent = cpuFreq > 0 ? `${cpuFreq} MHz` : 'N/A';
    document.getElementById('cpuStatus').textContent = capitalizeFirst(cpuStatus);
    document.getElementById('cpuProgress').style.width = `${cpuUsage}%`;
    
    // Update CPU progress bar color based on usage
    const cpuProgress = document.getElementById('cpuProgress');
    cpuProgress.className = 'performance-progress';
    if (cpuUsage >= 95) {
        cpuProgress.classList.add('critical');
    } else if (cpuUsage >= 80) {
        cpuProgress.classList.add('high');
    } else {
        cpuProgress.classList.add('normal');
    }
    
    // Update CPU status color
    const cpuStatusEl = document.getElementById('cpuStatus');
    cpuStatusEl.className = 'performance-status';
    cpuStatusEl.classList.add(cpuStatus);
    
    // RAM Updates
    const ramUsage = systemData.ram?.usage_percent || 0;
    const ramTotal = systemData.ram?.total_gb || 0;
    const ramUsed = systemData.ram?.used_gb || 0;
    const ramStatus = systemData.ram?.status || 'normal';
    
    document.getElementById('ramUsage').textContent = ramUsage.toFixed(1);
    document.getElementById('ramTotal').textContent = `${ramTotal.toFixed(1)} GB Total`;
    document.getElementById('ramDetail').textContent = `${ramUsed.toFixed(2)} / ${ramTotal.toFixed(2)} GB`;
    document.getElementById('ramStatus').textContent = capitalizeFirst(ramStatus);
    document.getElementById('ramProgress').style.width = `${ramUsage}%`;
    
    // Update RAM progress bar color based on usage
    const ramProgress = document.getElementById('ramProgress');
    ramProgress.className = 'performance-progress';
    if (ramUsage >= 95) {
        ramProgress.classList.add('critical');
    } else if (ramUsage >= 80) {
        ramProgress.classList.add('high');
    } else {
        ramProgress.classList.add('normal');
    }
    
    // Update RAM status color
    const ramStatusEl = document.getElementById('ramStatus');
    ramStatusEl.className = 'performance-status';
    ramStatusEl.classList.add(ramStatus);
}

// Utility: Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

// Add click listeners to SVG components for details
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.component').forEach(component => {
        component.addEventListener('click', function() {
            const componentId = this.id;
            showComponentDetails(componentId);
        });
    });
});

// Show component details (optional)
function showComponentDetails(componentId) {
    console.log('Component clicked:', componentId);
    // You can add a modal or tooltip here to show detailed component info
}
