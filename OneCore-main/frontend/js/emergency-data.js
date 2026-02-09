// Emergency Page Data Management and Initialization
// Handles real-time data updates for emergency controls

class EmergencyDataManager {
    constructor() {
        this.valveState = 'closed';
        this.pressureValue = 2.3;
        this.flowRate = 0.0;
        this.lastAction = new Date().toLocaleTimeString();
        this.alerts = [];
        
        this.initializeData();
        this.startDataUpdates();
    }
    
    initializeData() {
        // Initialize valve status
        this.updateValveDisplay();
        
        // Initialize pressure monitor
        this.updatePressureDisplay();
        
        // Initialize flow monitor
        this.updateFlowDisplay();
        
        // Load sample alerts
        this.loadSampleAlerts();
        
        // Initialize charts
        this.initializeCharts();
    }
    
    updateValveDisplay() {
        // Update original valve display
        const valveStateElement = document.getElementById('valveState');
        const valveIcon = document.querySelector('.valve-icon');
        const lastActionElement = document.getElementById('lastAction');
        
        if (valveStateElement) {
            valveStateElement.textContent = this.valveState.toUpperCase();
            valveStateElement.className = `valve-state ${this.valveState}`;
        }
        
        if (valveIcon) {
            valveIcon.className = `valve-icon ${this.valveState}`;
        }
        
        if (lastActionElement) {
            lastActionElement.textContent = this.lastAction;
        }
        
        // Update compact valve display
        const valveStateCompactElement = document.getElementById('valveStateCompact');
        const valveIconSmall = document.querySelector('.valve-icon-small');
        
        if (valveStateCompactElement) {
            valveStateCompactElement.textContent = this.valveState.toUpperCase();
            valveStateCompactElement.className = `valve-state-compact ${this.valveState}`;
        }
        
        if (valveIconSmall) {
            valveIconSmall.className = `valve-icon-small ${this.valveState}`;
        }
    }
    
    updatePressureDisplay() {
        const pressureValueElement = document.getElementById('pressureValue');
        const pressureValueCompactElement = document.getElementById('pressureValueCompact');
        
        if (pressureValueElement) {
            pressureValueElement.textContent = this.pressureValue.toFixed(1);
        }
        
        if (pressureValueCompactElement) {
            pressureValueCompactElement.textContent = this.pressureValue.toFixed(1);
        }
    }
    
    updateFlowDisplay() {
        const flowValueElement = document.getElementById('flowValue');
        const flowStatusElement = document.getElementById('flowStatus');
        
        if (flowValueElement) {
            flowValueElement.textContent = this.flowRate.toFixed(1);
        }
        
        if (flowStatusElement) {
            if (this.flowRate > 0) {
                flowStatusElement.className = 'flow-status active';
                flowStatusElement.innerHTML = '<i class="fa-solid fa-circle"></i><span>Active Flow</span>';
            } else {
                flowStatusElement.className = 'flow-status';
                flowStatusElement.innerHTML = '<i class="fa-solid fa-circle"></i><span>No Flow</span>';
            }
        }
    }
    
    loadSampleAlerts() {
        this.alerts = [
            {
                type: 'warning',
                icon: 'fa-triangle-exclamation',
                title: 'Low Pressure Warning',
                message: 'Water pressure is below normal. 1.8 bar (Normal: 2.0-3.5 bar)',
                time: '18:29:11'
            }
        ];
        
        this.updateAlertsDisplay();
    }
    
    updateAlertsDisplay() {
        const alertsGrid = document.getElementById('alertsGrid');
        if (!alertsGrid) return;
        
        if (this.alerts.length === 0) {
            alertsGrid.innerHTML = `
                <div class="no-alerts">
                    <i class="fa-solid fa-shield-check"></i>
                    <h3>No Active Alerts</h3>
                    <p>All systems are operating normally</p>
                </div>
            `;
        } else {
            alertsGrid.innerHTML = this.alerts.map(alert => `
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
    }
    
    initializeCharts() {
        // Initialize valve timeline chart
        this.initializeValveTimelineChart();
        
        // Initialize pressure history chart
        this.initializePressureChart();
        
        // Initialize flow rate chart
        this.initializeFlowChart();
        
        // Initialize daily summary chart
        this.initializeDailySummaryChart();
        
        // Initialize status pie chart
        this.initializeStatusPieChart();
    }
    
    initializeValveTimelineChart() {
        const ctx = document.getElementById('valveTimelineChart');
        if (!ctx) return;
        
        const timeLabels = [];
        const valveData = [];
        
        // Generate sample data for last 24 hours
        for (let i = 23; i >= 0; i--) {
            const time = new Date();
            time.setHours(time.getHours() - i);
            timeLabels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            valveData.push(Math.random() > 0.7 ? 1 : 0); // Random valve states
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Valve Open',
                    data: valveData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    stepped: true
                }, {
                    label: 'Valve Closed',
                    data: valveData.map(v => v === 0 ? 1 : 0),
                    borderColor: '#DC3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    stepped: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return value === 1 ? 'Open' : 'Closed';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }
    
    initializePressureChart() {
        const ctx = document.getElementById('pressureHistoryChart');
        if (!ctx) return;
        
        const timeLabels = [];
        const pressureData = [];
        
        for (let i = 59; i >= 0; i--) {
            const time = new Date();
            time.setMinutes(time.getMinutes() - i);
            timeLabels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            pressureData.push(2.0 + Math.random() * 1.5); // Random pressure between 2.0-3.5
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Pressure (bar)',
                    data: pressureData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 4,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + ' bar';
                            }
                        }
                    }
                }
            }
        });
    }
    
    initializeFlowChart() {
        const ctx = document.getElementById('flowHistoryChart');
        if (!ctx) return;
        
        const timeLabels = [];
        const flowData = [];
        
        for (let i = 59; i >= 0; i--) {
            const time = new Date();
            time.setMinutes(time.getMinutes() - i);
            timeLabels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
            flowData.push(Math.random() * 15); // Random flow 0-15 L/min
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Flow Rate (L/min)',
                    data: flowData,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + ' L/min';
                            }
                        }
                    }
                }
            }
        });
    }
    
    initializeDailySummaryChart() {
        const ctx = document.getElementById('dailySummaryChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Operation Hours',
                    data: [6.5, 7.2, 5.8, 8.1, 6.9, 4.3, 5.5],
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: '#4CAF50',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    }
                }
            }
        });
    }
    
    initializeStatusPieChart() {
        const ctx = document.getElementById('statusPieChart');
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Operational', 'Maintenance', 'Offline'],
                datasets: [{
                    data: [85, 10, 5],
                    backgroundColor: ['#4CAF50', '#FF9800', '#DC3545'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    startDataUpdates() {
        // Update data every 5 seconds
        setInterval(() => {
            this.simulateDataChanges();
        }, 5000);
    }
    
    simulateDataChanges() {
        // Simulate pressure fluctuations
        this.pressureValue = Math.max(1.5, Math.min(3.8, 
            this.pressureValue + (Math.random() - 0.5) * 0.2
        ));
        
        // Simulate flow rate changes
        if (this.valveState === 'open') {
            this.flowRate = Math.max(0, Math.min(20, 
                this.flowRate + (Math.random() - 0.5) * 2
            ));
        } else {
            this.flowRate = Math.max(0, this.flowRate - 0.5);
        }
        
        this.updatePressureDisplay();
        this.updateFlowDisplay();
    }
    
    // Control functions
    openValve() {
        this.valveState = 'open';
        this.lastAction = new Date().toLocaleTimeString();
        this.flowRate = 8 + Math.random() * 5; // Start with some flow
        this.updateValveDisplay();
        this.updateFlowDisplay();
        console.log('Valve opened');
    }
    
    closeValve() {
        this.valveState = 'closed';
        this.lastAction = new Date().toLocaleTimeString();
        this.flowRate = 0;
        this.updateValveDisplay();
        this.updateFlowDisplay();
        console.log('Valve closed');
    }
    
    emergencyStop() {
        this.valveState = 'closed';
        this.lastAction = new Date().toLocaleTimeString();
        this.flowRate = 0;
        this.updateValveDisplay();
        this.updateFlowDisplay();
        
        // Add emergency alert
        this.alerts.unshift({
            type: 'critical',
            icon: 'fa-hand',
            title: 'Emergency Stop Activated',
            message: 'All irrigation operations have been halted by emergency stop',
            time: new Date().toLocaleTimeString()
        });
        this.updateAlertsDisplay();
        console.log('Emergency stop activated');
    }
}

// Initialize emergency data manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.emergencyData = new EmergencyDataManager();
    
    // Bind control buttons (both original and compact versions)
    const openValveBtn = document.getElementById('openValveBtn');
    const closeValveBtn = document.getElementById('closeValveBtn');
    const emergencyStopBtn = document.getElementById('emergencyStopBtn');
    
    const openValveBtnCompact = document.getElementById('openValveBtnCompact');
    const closeValveBtnCompact = document.getElementById('closeValveBtnCompact');
    const emergencyStopBtnCompact = document.getElementById('emergencyStopBtnCompact');
    
    if (openValveBtn) {
        openValveBtn.addEventListener('click', () => {
            window.emergencyData.openValve();
        });
    }
    
    if (closeValveBtn) {
        closeValveBtn.addEventListener('click', () => {
            window.emergencyData.closeValve();
        });
    }
    
    if (emergencyStopBtn) {
        emergencyStopBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to activate emergency stop? This will halt all irrigation operations.')) {
                window.emergencyData.emergencyStop();
            }
        });
    }
    
    // Bind compact control buttons
    if (openValveBtnCompact) {
        openValveBtnCompact.addEventListener('click', () => {
            window.emergencyData.openValve();
        });
    }
    
    if (closeValveBtnCompact) {
        closeValveBtnCompact.addEventListener('click', () => {
            window.emergencyData.closeValve();
        });
    }
    
    if (emergencyStopBtnCompact) {
        emergencyStopBtnCompact.addEventListener('click', () => {
            if (confirm('Are you sure you want to activate emergency stop? This will halt all irrigation operations.')) {
                window.emergencyData.emergencyStop();
            }
        });
    }
    
    console.log('Emergency data manager initialized');
});

// Export chart to PDF function
function exportChartToPDF(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.download = filename + '_' + new Date().toISOString().split('T')[0] + '.png';
    link.href = canvas.toDataURL();
    link.click();
    
    console.log(`Chart ${chartId} exported as ${filename}`);
}
