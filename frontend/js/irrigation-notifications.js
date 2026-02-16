/**
 * Irrigation System Notification Manager
 * Handles real-time notifications for irrigation operations
 */

class IrrigationNotificationManager {
    constructor() {
        this.activeOperations = new Map();
        this.sensorData = new Map();
        this.scheduleTimers = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startMonitoring();
    }

    setupEventListeners() {
        // Listen for irrigation system events
        document.addEventListener('irrigationStart', (e) => this.handleIrrigationStart(e.detail));
        document.addEventListener('irrigationStop', (e) => this.handleIrrigationStop(e.detail));
        document.addEventListener('valveOperation', (e) => this.handleValveOperation(e.detail));
        document.addEventListener('sensorUpdate', (e) => this.handleSensorUpdate(e.detail));
        document.addEventListener('scheduleEvent', (e) => this.handleScheduleEvent(e.detail));
        document.addEventListener('systemError', (e) => this.handleSystemError(e.detail));
    }

    startMonitoring() {
        // Monitor system status every 30 seconds
        setInterval(() => {
            this.checkSystemStatus();
        }, 30000);

        // Check for scheduled events every minute
        setInterval(() => {
            this.checkScheduledEvents();
        }, 60000);
    }

    handleIrrigationStart(data) {
        const { zone, duration, mode } = data;
        this.activeOperations.set(zone, {
            type: 'irrigation',
            startTime: new Date(),
            duration: duration,
            mode: mode
        });

        addIrrigationNotification(
            `Irrigation started in Zone ${zone} for ${duration} minutes`,
            {
                zone: zone,
                action: `${mode} mode - ${duration}min`,
                priority: 'high',
                title: 'Irrigation Started'
            }
        );

        // Schedule completion notification
        setTimeout(() => {
            this.handleIrrigationComplete(zone);
        }, duration * 60000);
    }

    handleIrrigationStop(data) {
        const { zone, reason } = data;
        this.activeOperations.delete(zone);

        const message = reason === 'manual' 
            ? `Irrigation manually stopped in Zone ${zone}`
            : `Irrigation completed in Zone ${zone}`;

        addIrrigationNotification(message, {
            zone: zone,
            action: reason === 'manual' ? 'Manual Stop' : 'Completed',
            priority: 'medium',
            title: 'Irrigation Stopped'
        });
    }

    handleIrrigationComplete(zone) {
        if (this.activeOperations.has(zone)) {
            this.activeOperations.delete(zone);
            addIrrigationNotification(
                `Irrigation cycle completed successfully in Zone ${zone}`,
                {
                    zone: zone,
                    action: 'Cycle Complete',
                    priority: 'medium',
                    title: 'Irrigation Complete'
                }
            );
        }
    }

    handleValveOperation(data) {
        const { zone, valve, action, status } = data;
        
        let message, notificationType;
        if (action === 'open') {
            message = `Valve ${valve} opened in Zone ${zone}`;
            notificationType = status === 'success' ? 'success' : 'error';
        } else {
            message = `Valve ${valve} closed in Zone ${zone}`;
            notificationType = status === 'success' ? 'info' : 'error';
        }

        addValveNotification(message, zone, `${action.toUpperCase()} - ${valve}`, {
            priority: status === 'error' ? 'high' : 'medium',
            title: status === 'error' ? 'Valve Error' : 'Valve Operation'
        });
    }

    handleSensorUpdate(data) {
        const { deviceId, sensorType, value, status, threshold } = data;
        this.sensorData.set(deviceId, { ...data, timestamp: new Date() });

        // Check for threshold violations
        if (threshold && (value > threshold.max || value < threshold.min)) {
            addSensorNotification(
                `${sensorType} reading ${value} is outside normal range (${threshold.min}-${threshold.max})`,
                deviceId,
                {
                    priority: 'high',
                    title: 'Sensor Alert',
                    action: `${sensorType}: ${value}`
                }
            );
        } else if (status === 'error') {
            addSensorNotification(
                `Sensor error detected on ${deviceId}`,
                deviceId,
                {
                    priority: 'high',
                    title: 'Sensor Error'
                }
            );
        }
    }

    handleScheduleEvent(data) {
        const { zone, event, time, status } = data;
        
        if (event === 'scheduled_start') {
            addScheduleNotification(
                `Scheduled irrigation will start in Zone ${zone} at ${time}`,
                zone,
                {
                    priority: 'low',
                    title: 'Upcoming Schedule',
                    action: `Start at ${time}`
                }
            );
        } else if (event === 'schedule_missed') {
            addScheduleNotification(
                `Scheduled irrigation missed in Zone ${zone} - system was offline`,
                zone,
                {
                    priority: 'medium',
                    title: 'Schedule Missed',
                    action: 'Missed Event'
                }
            );
        }
    }

    handleSystemError(data) {
        const { component, error, severity, zone } = data;
        
        if (severity === 'critical') {
            addEmergencyNotification(
                `Critical system error in ${component}: ${error}`,
                {
                    zone: zone,
                    action: 'CRITICAL ERROR',
                    title: 'System Emergency'
                }
            );
        } else {
            addMaintenanceNotification(
                `${component} requires attention: ${error}`,
                {
                    zone: zone,
                    action: 'Maintenance Required',
                    priority: severity === 'high' ? 'high' : 'medium'
                }
            );
        }
    }

    checkSystemStatus() {
        // Simulate system status checks
        const zones = [1, 2, 3, 4];
        
        zones.forEach(zone => {
            // Check for stuck valves
            if (Math.random() < 0.01) { // 1% chance
                this.handleValveOperation({
                    zone: zone,
                    valve: `V${zone}`,
                    action: 'stuck',
                    status: 'error'
                });
            }

            // Check for low water pressure
            if (Math.random() < 0.005) { // 0.5% chance
                addMaintenanceNotification(
                    `Low water pressure detected in Zone ${zone}`,
                    {
                        zone: zone,
                        action: 'Pressure Check',
                        priority: 'medium'
                    }
                );
            }
        });
    }

    checkScheduledEvents() {
        // Check for upcoming scheduled events
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        
        // Simulate scheduled events
        if (now.getHours() === 6 && now.getMinutes() === 0) {
            this.handleScheduleEvent({
                zone: 1,
                event: 'scheduled_start',
                time: '06:30',
                status: 'pending'
            });
        }
        
        if (now.getHours() === 18 && now.getMinutes() === 0) {
            this.handleScheduleEvent({
                zone: 2,
                event: 'scheduled_start',
                time: '18:30',
                status: 'pending'
            });
        }
    }

    // Public methods for manual triggering
    triggerIrrigationStart(zone, duration = 15, mode = 'auto') {
        this.handleIrrigationStart({ zone, duration, mode });
    }

    triggerValveOperation(zone, valve, action) {
        this.handleValveOperation({
            zone: zone,
            valve: valve,
            action: action,
            status: 'success'
        });
    }

    triggerSensorUpdate(deviceId, sensorType, value) {
        this.handleSensorUpdate({
            deviceId: deviceId,
            sensorType: sensorType,
            value: value,
            status: 'normal',
            threshold: sensorType === 'moisture' ? { min: 20, max: 80 } : null
        });
    }

    triggerMaintenanceAlert(component, message) {
        this.handleSystemError({
            component: component,
            error: message,
            severity: 'medium'
        });
    }

    triggerEmergencyAlert(component, message) {
        this.handleSystemError({
            component: component,
            error: message,
            severity: 'critical'
        });
    }
}

// Initialize the irrigation notification manager
let irrigationNotificationManager;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        irrigationNotificationManager = new IrrigationNotificationManager();
        window.irrigationNotificationManager = irrigationNotificationManager;
    });
} else {
    irrigationNotificationManager = new IrrigationNotificationManager();
    window.irrigationNotificationManager = irrigationNotificationManager;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IrrigationNotificationManager };
}
