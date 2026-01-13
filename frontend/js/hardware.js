// BAYYTI-B1 Hardware Schema Monitor
const API_BASE = 'http://localhost:5000/api';

// Hardware component states
let hardwareState = {
    valves: {},
    sensors: {},
    system: {},
    pipes: {}
};

let updateInterval;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupMobileSidebar();
    loadHardwareStatus();
    loadSystemPerformance();
    updateComponentLists();
    
    // Start real-time monitoring (every 3 seconds)
    updateInterval = setInterval(() => {
        loadHardwareStatus();
        loadSystemPerformance();
    }, 3000);
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
    
    // Main valve status
    hardwareState.valves.main = {
        id: 'main-valve',
        name: 'Main Control Valve',
        status: data.irrigation?.valve_open ? 'online' : 'offline',
        description: data.irrigation?.valve_open ? 'Open - Active' : 'Closed - Inactive'
    };
    
    // Soil moisture sensors for each zone
    if (data.sensors) {
        ['soil_moisture', 'soil_moisture_2', 'soil_moisture_3'].forEach((sensor, index) => {
            const zoneNum = index + 1;
            const value = data.sensors[sensor];
            hardwareState.sensors[`soil-${zoneNum}`] = {
                id: `soil-sensor-${zoneNum}`,
                name: `Soil Sensor ${zoneNum}`,
                status: value !== undefined && value !== null ? 'online' : 'offline',
                description: value !== undefined ? `${value}%` : 'No Data'
            };
        });
    }
    
    // Zone valves (simulate from zones data or create default)
    for (let i = 1; i <= 3; i++) {
        const isActive = data.irrigation?.valve_open && i === 1; // Assume zone 1 is active when valve is open
        hardwareState.valves[`zone-${i}`] = {
            id: `zone-valve-${i}`,
            name: `Zone ${i} Valve`,
            status: isActive ? 'online' : 'offline',
            description: isActive ? 'Active' : 'Inactive'
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
        status: data.irrigation?.valve_open ? 'flowing' : 'idle'
    };
} else {
        // Default 3 zones
        for (let i = 1; i <= 3; i++) {
            hardwareState.valves[`zone-${i}`] = {
                id: `zone-valve-${i}`,
                name: `Zone ${i} Valve`,
                status: 'offline',
                description: 'Inactive'
            };
        }
    }
    
    // Pressure sensor
    hardwareState.sensors.pressure = {
        id: 'pressure-sensor',
        name: 'Pressure Sensor',
        status: data.sensors ? 'online' : 'error',
        description: data.sensors ? 'Monitoring' : 'No Data'
    };
    
    // Soil sensors
    for (let i = 1; i <= 3; i++) {
        hardwareState.sensors[`soil-${i}`] = {
            id: `soil-sensor-${i}`,
            name: `Soil Moisture Sensor ${i}`,
            status: data.sensors?.soil_moisture ? 'online' : 'warning',
            description: data.sensors?.soil_moisture ? `${data.sensors.soil_moisture}%` : 'No Data'
        };
    }
    
    // Sprinklers status based on zones
    if (data.zones && Array.isArray(data.zones)) {
        data.zones.forEach((zone, index) => {
            const zoneNum = index + 1;
            hardwareState.system[`sprinkler-${zoneNum}`] = {
                id: `sprinkler-${zoneNum}`,
                name: `Sprinkler ${zoneNum}`,
                status: zone.active ? 'online' : 'offline',
                description: zone.active ? 'Spraying' : 'Idle'
            };
        });
    } else {
        for (let i = 1; i <= 3; i++) {
            hardwareState.system[`sprinkler-${i}`] = {
                id: `sprinkler-${i}`,
                name: `Sprinkler ${i}`,
                status: 'offline',
                description: 'Idle'
            };
        }
    }
    
    // System components
    hardwareState.system.source = {
        id: 'source-status',
        name: 'Water Source',
        status: 'online',
        description: 'Connected'
    };
    
    hardwareState.system.pump = {
        id: 'pump-status',
        name: 'Water Pump',
        status: data.irrigation?.valve_open ? 'online' : 'offline',
        description: data.irrigation?.valve_open ? 'Running' : 'Standby'
    };
    
    hardwareState.system.filter = {
        id: 'filter-status',
        name: 'Water Filter',
        status: 'online',
        description: 'Clean'
    };
    
    hardwareState.system.pi = {
        id: 'pi-status',
        name: 'Raspberry Pi',
        status: 'online',
        description: 'Operating'
    };
    
    hardwareState.system.power = {
        id: 'power-status',
        name: 'Power Supply',
        status: data.energy?.battery_percentage > 20 ? 'online' : 'warning',
        description: `${data.energy?.battery_percentage || 0}%`
    };
    
    hardwareState.system.wifi = {
        id: 'wifi-status',
        name: 'WiFi Network',
        status: 'online',
        description: 'Connected'
    };
    
    // Pipes status (based on valve status)
    const mainValveOpen = data.irrigation?.valve_open;
    hardwareState.pipes = {
        main: { status: mainValveOpen ? 'online' : 'offline', name: 'Main Supply Line' },
        distribution: { status: mainValveOpen ? 'online' : 'offline', name: 'Distribution Network' }
    };
    
    if (data.zones && Array.isArray(data.zones)) {
        data.zones.forEach((zone, index) => {
            const zoneNum = index + 1;
            hardwareState.pipes[`zone-${zoneNum}`] = {
                status: zone.active ? 'online' : 'offline',
                name: `Zone ${zoneNum} Pipeline`
            };
        });
    }
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
    const mainValveOpen = hardwareState.valves.main.status === 'online';
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
