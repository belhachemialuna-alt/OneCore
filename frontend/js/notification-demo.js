/**
 * Notification System Demo
 * Provides demo functionality to test enhanced irrigation notifications
 */

class NotificationDemo {
    constructor() {
        this.demoInterval = null;
        this.init();
    }

    init() {
        this.createDemoControls();
        this.setupEventListeners();
    }

    createDemoControls() {
        // Check if demo controls already exist
        if (document.getElementById('notification-demo-panel')) {
            return;
        }

        const demoPanel = document.createElement('div');
        demoPanel.id = 'notification-demo-panel';
        demoPanel.className = 'demo-panel';
        
        demoPanel.innerHTML = `
            <div class="demo-header">
                <h4><i class="fa-solid fa-flask"></i> Notification Demo</h4>
                <button class="demo-toggle" id="demo-toggle">
                    <i class="fa-solid fa-chevron-up"></i>
                </button>
            </div>
            <div class="demo-content" id="demo-content">
                <div class="demo-section">
                    <h5>Irrigation Operations</h5>
                    <div class="demo-buttons">
                        <button class="demo-btn irrigation" onclick="notificationDemo.triggerIrrigation()">
                            <i class="fa-solid fa-droplet"></i> Start Irrigation
                        </button>
                        <button class="demo-btn valve" onclick="notificationDemo.triggerValve()">
                            <i class="fa-solid fa-faucet"></i> Valve Operation
                        </button>
                        <button class="demo-btn sensor" onclick="notificationDemo.triggerSensor()">
                            <i class="fa-solid fa-thermometer-half"></i> Sensor Alert
                        </button>
                    </div>
                </div>
                <div class="demo-section">
                    <h5>System Events</h5>
                    <div class="demo-buttons">
                        <button class="demo-btn schedule" onclick="notificationDemo.triggerSchedule()">
                            <i class="fa-solid fa-clock"></i> Schedule Event
                        </button>
                        <button class="demo-btn maintenance" onclick="notificationDemo.triggerMaintenance()">
                            <i class="fa-solid fa-wrench"></i> Maintenance
                        </button>
                        <button class="demo-btn emergency" onclick="notificationDemo.triggerEmergency()">
                            <i class="fa-solid fa-triangle-exclamation"></i> Emergency
                        </button>
                    </div>
                </div>
                <div class="demo-section">
                    <h5>Auto Demo</h5>
                    <div class="demo-buttons">
                        <button class="demo-btn auto" id="auto-demo-btn" onclick="notificationDemo.toggleAutoDemo()">
                            <i class="fa-solid fa-play"></i> Start Auto Demo
                        </button>
                        <button class="demo-btn clear" onclick="notificationDemo.clearAll()">
                            <i class="fa-solid fa-trash"></i> Clear All
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add demo panel to body
        document.body.appendChild(demoPanel);

        // Add demo styles
        this.addDemoStyles();
    }

    addDemoStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .demo-panel {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 320px;
                background: #000000;
                border: 2px solid #FF0000;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                font-family: 'Fira Sans Condensed', sans-serif;
            }

            .demo-header {
                background: #FF0000;
                color: white;
                padding: 12px 16px;
                border-radius: 10px 10px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
            }

            .demo-header h4 {
                margin: 0;
                font-size: 1rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .demo-toggle {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .demo-toggle:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .demo-content {
                padding: 16px;
                max-height: 400px;
                overflow-y: auto;
            }

            .demo-content.collapsed {
                display: none;
            }

            .demo-section {
                margin-bottom: 16px;
            }

            .demo-section h5 {
                color: #FF0000;
                margin: 0 0 8px 0;
                font-size: 0.9rem;
                font-weight: 600;
            }

            .demo-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }

            .demo-btn {
                background: #333;
                color: white;
                border: 1px solid #555;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }

            .demo-btn:hover {
                background: #444;
                border-color: #666;
            }

            .demo-btn.irrigation { border-color: #007bff; }
            .demo-btn.valve { border-color: #28a745; }
            .demo-btn.sensor { border-color: #ffc107; }
            .demo-btn.schedule { border-color: #6f42c1; }
            .demo-btn.maintenance { border-color: #fd7e14; }
            .demo-btn.emergency { border-color: #dc3545; }
            .demo-btn.auto { border-color: #17a2b8; }
            .demo-btn.clear { border-color: #6c757d; }

            .demo-btn.irrigation:hover { background: rgba(0, 123, 255, 0.2); }
            .demo-btn.valve:hover { background: rgba(40, 167, 69, 0.2); }
            .demo-btn.sensor:hover { background: rgba(255, 193, 7, 0.2); }
            .demo-btn.schedule:hover { background: rgba(111, 66, 193, 0.2); }
            .demo-btn.maintenance:hover { background: rgba(253, 126, 20, 0.2); }
            .demo-btn.emergency:hover { background: rgba(220, 53, 69, 0.2); }
            .demo-btn.auto:hover { background: rgba(23, 162, 184, 0.2); }
            .demo-btn.clear:hover { background: rgba(108, 117, 125, 0.2); }

            @media (max-width: 768px) {
                .demo-panel {
                    left: 10px;
                    right: 10px;
                    width: auto;
                    bottom: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Toggle demo panel
        document.addEventListener('click', (e) => {
            if (e.target.closest('.demo-header')) {
                this.togglePanel();
            }
        });
    }

    togglePanel() {
        const content = document.getElementById('demo-content');
        const toggle = document.getElementById('demo-toggle');
        
        if (content && toggle) {
            content.classList.toggle('collapsed');
            const icon = toggle.querySelector('i');
            if (content.classList.contains('collapsed')) {
                icon.className = 'fa-solid fa-chevron-down';
            } else {
                icon.className = 'fa-solid fa-chevron-up';
            }
        }
    }

    triggerIrrigation() {
        const zone = Math.floor(Math.random() * 4) + 1;
        const duration = [10, 15, 20, 30][Math.floor(Math.random() * 4)];
        
        if (window.irrigationNotificationManager) {
            window.irrigationNotificationManager.triggerIrrigationStart(zone, duration, 'auto');
        } else {
            addIrrigationNotification(
                `Irrigation started in Zone ${zone} for ${duration} minutes`,
                { zone: zone, action: `Auto mode - ${duration}min`, priority: 'high' }
            );
        }
    }

    triggerValve() {
        const zone = Math.floor(Math.random() * 4) + 1;
        const valve = `V${zone}`;
        const action = Math.random() > 0.5 ? 'open' : 'close';
        
        if (window.irrigationNotificationManager) {
            window.irrigationNotificationManager.triggerValveOperation(zone, valve, action);
        } else {
            addValveNotification(
                `Valve ${valve} ${action}ed in Zone ${zone}`,
                zone,
                `${action.toUpperCase()} - ${valve}`,
                { priority: 'medium' }
            );
        }
    }

    triggerSensor() {
        const devices = ['TEMP-01', 'MOIST-02', 'PH-03', 'FLOW-04'];
        const deviceId = devices[Math.floor(Math.random() * devices.length)];
        const sensorType = deviceId.split('-')[0].toLowerCase();
        const value = Math.floor(Math.random() * 100);
        
        if (window.irrigationNotificationManager) {
            window.irrigationNotificationManager.triggerSensorUpdate(deviceId, sensorType, value);
        } else {
            addSensorNotification(
                `${sensorType} sensor reading: ${value}`,
                deviceId,
                { action: `${sensorType}: ${value}`, priority: 'medium' }
            );
        }
    }

    triggerSchedule() {
        const zone = Math.floor(Math.random() * 4) + 1;
        const events = ['scheduled_start', 'schedule_missed'];
        const event = events[Math.floor(Math.random() * events.length)];
        const time = new Date(Date.now() + 30 * 60000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let message;
        if (event === 'scheduled_start') {
            message = `Scheduled irrigation will start in Zone ${zone} at ${time}`;
        } else {
            message = `Scheduled irrigation missed in Zone ${zone} - system was offline`;
        }
        
        addScheduleNotification(message, zone, {
            action: event === 'scheduled_start' ? `Start at ${time}` : 'Missed Event',
            priority: event === 'scheduled_start' ? 'low' : 'medium'
        });
    }

    triggerMaintenance() {
        const components = ['Water Pump', 'Filter System', 'Pressure Sensor', 'Main Valve'];
        const component = components[Math.floor(Math.random() * components.length)];
        const issues = ['requires cleaning', 'needs calibration', 'showing wear', 'due for service'];
        const issue = issues[Math.floor(Math.random() * issues.length)];
        
        if (window.irrigationNotificationManager) {
            window.irrigationNotificationManager.triggerMaintenanceAlert(component, issue);
        } else {
            addMaintenanceNotification(
                `${component} ${issue}`,
                { action: 'Maintenance Required', priority: 'medium' }
            );
        }
    }

    triggerEmergency() {
        const emergencies = [
            { component: 'Water Pump', error: 'Motor overheating detected' },
            { component: 'Main Line', error: 'Pressure drop - possible leak' },
            { component: 'Control System', error: 'Communication failure' },
            { component: 'Power Supply', error: 'Voltage fluctuation detected' }
        ];
        const emergency = emergencies[Math.floor(Math.random() * emergencies.length)];
        
        if (window.irrigationNotificationManager) {
            window.irrigationNotificationManager.triggerEmergencyAlert(emergency.component, emergency.error);
        } else {
            addEmergencyNotification(
                `Critical system error in ${emergency.component}: ${emergency.error}`,
                { action: 'CRITICAL ERROR', priority: 'high' }
            );
        }
    }

    toggleAutoDemo() {
        const btn = document.getElementById('auto-demo-btn');
        const icon = btn.querySelector('i');
        
        if (this.demoInterval) {
            // Stop auto demo
            clearInterval(this.demoInterval);
            this.demoInterval = null;
            btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Auto Demo';
        } else {
            // Start auto demo
            btn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop Auto Demo';
            
            this.demoInterval = setInterval(() => {
                const actions = [
                    () => this.triggerIrrigation(),
                    () => this.triggerValve(),
                    () => this.triggerSensor(),
                    () => this.triggerSchedule(),
                    () => this.triggerMaintenance()
                ];
                
                // Randomly trigger an action
                const action = actions[Math.floor(Math.random() * actions.length)];
                action();
                
                // Occasionally trigger emergency (5% chance)
                if (Math.random() < 0.05) {
                    setTimeout(() => this.triggerEmergency(), 2000);
                }
            }, 3000); // Every 3 seconds
        }
    }

    clearAll() {
        if (window.notificationSystem) {
            window.notificationSystem.clearAllNotifications();
        }
    }
}

// Initialize demo when DOM is ready
let notificationDemo;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for other systems to initialize
        setTimeout(() => {
            notificationDemo = new NotificationDemo();
            window.notificationDemo = notificationDemo;
        }, 1000);
    });
} else {
    setTimeout(() => {
        notificationDemo = new NotificationDemo();
        window.notificationDemo = notificationDemo;
    }, 1000);
}
