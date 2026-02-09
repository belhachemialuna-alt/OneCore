// Mock Backend Data for Hardware Page
// This provides realistic data when the backend API is unavailable

class MockHardwareAPI {
    constructor() {
        this.isOnline = true;
        this.startTime = Date.now();
        this.deviceId = this.generateDeviceId();
        
        // Initialize mock data
        this.initializeMockData();
        
        // Start data simulation
        this.startDataSimulation();
    }
    
    generateDeviceId() {
        // Use the real BAYYTI-B1 device ID
        return '6e9e6d6c9fe5d8d2586cb42f505a8cd504f3116c3e484d07f01aac4d4a583955';
    }
    
    initializeMockData() {
        this.mockData = {
            system: {
                online: true,
                uptime: 0,
                processor: {
                    model: 'Raspberry Pi 4B',
                    cores: 4,
                    frequency: 1500,
                    architecture: 'ARM Cortex-A72'
                },
                memory: {
                    total: 4 * 1024 * 1024 * 1024, // 4GB in bytes
                    used: 0,
                    percent: 0
                },
                storage: {
                    total: 32 * 1024 * 1024 * 1024, // 32GB in bytes
                    used: 0,
                    percent: 0
                },
                temperature: {
                    cpu: 45
                },
                network: {
                    wifi: true,
                    ethernet: false,
                    ip: '192.168.1.100',
                    ssid: 'TiOne-Network'
                },
                power: {
                    supply: '5V 3A USB-C',
                    voltage: 5.1,
                    current: 2.8
                }
            },
            performance: {
                cpu: {
                    usage_percent: 25,
                    cores: 4,
                    frequency_mhz: 1500,
                    status: 'normal'
                },
                ram: {
                    usage_percent: 35,
                    total_gb: 4.0,
                    used_gb: 1.4,
                    status: 'normal'
                }
            },
            sensors: {
                soil_moisture: 65,
                temperature: 24.5,
                humidity: 68,
                pressure: 14.7
            },
            irrigation: {
                valve_open: false,
                valve_state: 'closed',
                flow_rate: 0,
                duration: 0
            },
            components: {
                valves: {
                    main: { status: 'offline', name: 'Main Control Valve', description: 'Standby' },
                    zone1: { status: 'offline', name: 'Zone 1 Valve', description: 'Closed' },
                    zone2: { status: 'offline', name: 'Zone 2 Valve', description: 'Closed' },
                    zone3: { status: 'offline', name: 'Zone 3 Valve', description: 'Closed' }
                },
                sensors: {
                    pressure: { status: 'online', name: 'Pressure Sensor', description: '14.7 PSI' },
                    soil1: { status: 'online', name: 'Soil Moisture 1', description: '65%' },
                    soil2: { status: 'online', name: 'Soil Moisture 2', description: '58%' },
                    soil3: { status: 'online', name: 'Soil Moisture 3', description: '72%' },
                    temperature: { status: 'online', name: 'Temperature Sensor', description: '24.5°C' },
                    humidity: { status: 'online', name: 'Humidity Sensor', description: '68%' }
                },
                system: {
                    waterSource: { status: 'online', name: 'Water Source', description: 'Connected' },
                    pump: { status: 'offline', name: 'Water Pump', description: 'Standby' },
                    filter: { status: 'online', name: 'Water Filter', description: 'Operational' },
                    controller: { status: 'online', name: 'Raspberry Pi Controller', description: 'GPIO Active' },
                    power: { status: 'online', name: 'Power Supply', description: '5.1V @ 2.8A' },
                    network: { status: 'online', name: 'WiFi Network', description: 'Connected to TiOne-Network' }
                }
            }
        };
        
        // Calculate initial memory and storage usage
        this.updateSystemUsage();
    }
    
    startDataSimulation() {
        // Update data every 2 seconds to simulate real system
        setInterval(() => {
            this.simulateDataChanges();
        }, 2000);
        
        // Update uptime every second
        setInterval(() => {
            this.mockData.system.uptime = Math.floor((Date.now() - this.startTime) / 1000);
        }, 1000);
    }
    
    simulateDataChanges() {
        // Simulate CPU usage fluctuations
        this.mockData.performance.cpu.usage_percent = Math.max(5, 
            this.mockData.performance.cpu.usage_percent + (Math.random() - 0.5) * 10
        );
        this.mockData.performance.cpu.usage_percent = Math.min(95, this.mockData.performance.cpu.usage_percent);
        
        // Simulate RAM usage changes
        this.mockData.performance.ram.usage_percent = Math.max(20, 
            this.mockData.performance.ram.usage_percent + (Math.random() - 0.5) * 5
        );
        this.mockData.performance.ram.usage_percent = Math.min(85, this.mockData.performance.ram.usage_percent);
        
        // Update RAM used GB based on percentage
        this.mockData.performance.ram.used_gb = (this.mockData.performance.ram.usage_percent / 100) * this.mockData.performance.ram.total_gb;
        
        // Simulate temperature changes
        this.mockData.system.temperature.cpu = Math.max(35, 
            this.mockData.system.temperature.cpu + (Math.random() - 0.5) * 3
        );
        this.mockData.system.temperature.cpu = Math.min(75, this.mockData.system.temperature.cpu);
        
        // Simulate sensor readings
        this.mockData.sensors.soil_moisture = Math.max(30, 
            this.mockData.sensors.soil_moisture + (Math.random() - 0.5) * 5
        );
        this.mockData.sensors.soil_moisture = Math.min(90, this.mockData.sensors.soil_moisture);
        
        this.mockData.sensors.temperature = Math.max(18, 
            this.mockData.sensors.temperature + (Math.random() - 0.5) * 2
        );
        this.mockData.sensors.temperature = Math.min(35, this.mockData.sensors.temperature);
        
        this.mockData.sensors.humidity = Math.max(40, 
            this.mockData.sensors.humidity + (Math.random() - 0.5) * 3
        );
        this.mockData.sensors.humidity = Math.min(85, this.mockData.sensors.humidity);
        
        // Update component descriptions with current values
        this.updateComponentDescriptions();
        
        // Update system usage
        this.updateSystemUsage();
    }
    
    updateComponentDescriptions() {
        this.mockData.components.sensors.soil1.description = `${Math.round(this.mockData.sensors.soil_moisture)}%`;
        this.mockData.components.sensors.temperature.description = `${this.mockData.sensors.temperature.toFixed(1)}°C`;
        this.mockData.components.sensors.humidity.description = `${Math.round(this.mockData.sensors.humidity)}%`;
        this.mockData.components.sensors.pressure.description = `${this.mockData.sensors.pressure.toFixed(1)} PSI`;
    }
    
    updateSystemUsage() {
        // Update memory usage
        this.mockData.system.memory.percent = this.mockData.performance.ram.usage_percent;
        this.mockData.system.memory.used = (this.mockData.system.memory.percent / 100) * this.mockData.system.memory.total;
        
        // Update storage usage (slowly increasing)
        const baseUsage = 8 * 1024 * 1024 * 1024; // 8GB base
        const additionalUsage = (this.mockData.system.uptime / 86400) * 100 * 1024 * 1024; // 100MB per day
        this.mockData.system.storage.used = baseUsage + additionalUsage;
        this.mockData.system.storage.percent = (this.mockData.system.storage.used / this.mockData.system.storage.total) * 100;
    }
    
    // API endpoint simulation methods
    async getStatus() {
        return {
            success: true,
            system: this.mockData.system.online,
            sensors: this.mockData.sensors,
            irrigation: this.mockData.irrigation,
            components: this.mockData.components
        };
    }
    
    async getSystemInfo() {
        return {
            success: true,
            processor: this.mockData.system.processor,
            memory: this.mockData.system.memory,
            network: this.mockData.system.network,
            power: this.mockData.system.power,
            storage: this.mockData.system.storage,
            temperature: this.mockData.system.temperature
        };
    }
    
    async getSystemStats() {
        return {
            success: true,
            cpu_percent: this.mockData.performance.cpu.usage_percent,
            mem_percent: this.mockData.performance.ram.usage_percent,
            cpu_cores: this.mockData.performance.cpu.cores,
            cpu_freq: this.mockData.performance.cpu.frequency_mhz,
            mem_total: this.mockData.performance.ram.total_gb,
            mem_used: this.mockData.performance.ram.used_gb
        };
    }
    
    async getSystemMonitor() {
        return {
            success: true,
            data: this.mockData.performance
        };
    }
    
    getDeviceId() {
        return this.deviceId;
    }
    
    // Simulate irrigation control
    toggleIrrigation() {
        const isOpen = !this.mockData.irrigation.valve_open;
        this.mockData.irrigation.valve_open = isOpen;
        this.mockData.irrigation.valve_state = isOpen ? 'open' : 'closed';
        
        // Update component statuses
        this.mockData.components.valves.main.status = isOpen ? 'online' : 'offline';
        this.mockData.components.valves.main.description = isOpen ? 'Open - Water Flowing' : 'Standby';
        this.mockData.components.system.pump.status = isOpen ? 'online' : 'offline';
        this.mockData.components.system.pump.description = isOpen ? 'Running' : 'Standby';
        
        if (isOpen) {
            // Simulate flow rate
            this.mockData.irrigation.flow_rate = 2.5 + Math.random() * 0.5;
        } else {
            this.mockData.irrigation.flow_rate = 0;
        }
        
        return { success: true, valve_open: isOpen };
    }
}

// Initialize mock API
const mockAPI = new MockHardwareAPI();

// Override fetch for API calls
const originalFetch = window.fetch;
window.fetch = async function(url, options) {
    // Check if this is an API call to our backend
    if (url.includes('/api/')) {
        console.log('Intercepting API call:', url);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        try {
            let mockResponse;
            
            if (url.includes('/api/status')) {
                mockResponse = await mockAPI.getStatus();
            } else if (url.includes('/api/system/info')) {
                mockResponse = await mockAPI.getSystemInfo();
            } else if (url.includes('/api/system/monitor')) {
                mockResponse = await mockAPI.getSystemMonitor();
            } else if (url.includes('/api/system')) {
                mockResponse = await mockAPI.getSystemStats();
            } else {
                // Default response for unknown endpoints
                mockResponse = { success: false, error: 'Endpoint not found' };
            }
            
            return new Response(JSON.stringify(mockResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
            
        } catch (error) {
            console.error('Mock API error:', error);
            return new Response(JSON.stringify({ success: false, error: error.message }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
    
    // For non-API calls, use original fetch
    return originalFetch.apply(this, arguments);
};

// Add device ID display functionality
document.addEventListener('DOMContentLoaded', () => {
    // Display device ID
    const deviceIdDisplay = document.getElementById('deviceIdDisplay');
    if (deviceIdDisplay) {
        deviceIdDisplay.textContent = mockAPI.getDeviceId();
    }
    
    // Copy device ID functionality
    const copyBtn = document.getElementById('copyDeviceIdBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(mockAPI.getDeviceId()).then(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i><span>Copy</span>';
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = mockAPI.getDeviceId();
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Copied!</span>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i><span>Copy</span>';
                }, 2000);
            });
        });
    }
});

// Export for global access
window.mockAPI = mockAPI;

console.log('Mock Hardware API initialized - Backend simulation active');
