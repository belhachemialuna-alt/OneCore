// Benchmarks Page JavaScript
const API_BASE = window.location.origin;

// Initialize charts
let cpuChart, memoryChart, responseTimeChart, networkChart;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    loadBenchmarkData();
    
    // Refresh button
    document.getElementById('refreshBenchmarks')?.addEventListener('click', function() {
        const icon = this.querySelector('i');
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            icon.style.transform = 'rotate(0deg)';
        }, 500);
        loadBenchmarkData();
    });
    
    // Auto-refresh every 30 seconds
    setInterval(loadBenchmarkData, 30000);
});

// Initialize all charts
function initializeCharts() {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.08)',
                    borderColor: '#DEE2E6'
                },
                ticks: {
                    color: '#495057',
                    font: {
                        size: 11,
                        weight: '500'
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    borderColor: '#DEE2E6'
                },
                ticks: {
                    color: '#495057',
                    font: {
                        size: 11,
                        weight: '500'
                    }
                }
            }
        }
    };
    
    // CPU Chart
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    cpuChart = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'CPU Usage %',
                data: generateRandomData(24, 20, 60),
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#2196F3',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    max: 100,
                    ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Memory Chart
    const memoryCtx = document.getElementById('memoryChart').getContext('2d');
    memoryChart = new Chart(memoryCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'Memory Usage MB',
                data: generateRandomData(24, 300, 600),
                borderColor: '#9C27B0',
                backgroundColor: 'rgba(156, 39, 176, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#9C27B0',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    max: 1024,
                    ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + 'MB';
                        }
                    }
                }
            }
        }
    });
    
    // Response Time Chart
    const responseCtx = document.getElementById('responseTimeChart').getContext('2d');
    responseTimeChart = new Chart(responseCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [{
                label: 'Response Time ms',
                data: generateRandomData(24, 20, 150),
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#FF9800',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: function(value) {
                            return value + 'ms';
                        }
                    }
                }
            }
        }
    });
    
    // Network Chart
    const networkCtx = document.getElementById('networkChart').getContext('2d');
    networkChart = new Chart(networkCtx, {
        type: 'line',
        data: {
            labels: generateTimeLabels(24),
            datasets: [
                {
                    label: 'Upload',
                    data: generateRandomData(24, 0.5, 3),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Download',
                    data: generateRandomData(24, 1, 5),
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: '#2196F3',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            ...chartOptions,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#495057',
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            scales: {
                ...chartOptions.scales,
                y: {
                    ...chartOptions.scales.y,
                    ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: function(value) {
                            return value.toFixed(1) + ' MB/s';
                        }
                    }
                }
            }
        }
    });
}

// Generate time labels for charts
function generateTimeLabels(hours) {
    const labels = [];
    const now = new Date();
    for (let i = hours - 1; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        labels.push(time.getHours() + ':00');
    }
    return labels;
}

// Generate random data for charts
function generateRandomData(count, min, max) {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push(Math.random() * (max - min) + min);
    }
    return data;
}

// Load benchmark data from Raspberry Pi hardware
async function loadBenchmarkData() {
    try {
        // Fetch real data from Raspberry Pi backend
        const response = await fetch(`${API_BASE}/api/system/benchmarks`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            updateBenchmarkUI(data);
        } else {
            console.error('Backend returned error:', data.error);
            showErrorMessage('Failed to fetch real hardware data from Raspberry Pi');
        }
    } catch (error) {
        console.error('Error fetching benchmark data from Raspberry Pi:', error);
        showErrorMessage(`Cannot connect to Raspberry Pi: ${error.message}`);
    }
}

// Show error message to user
function showErrorMessage(message) {
    const container = document.querySelector('.benchmarks-container');
    const existingError = document.getElementById('benchmark-error');
    
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.id = 'benchmark-error';
    errorDiv.style.cssText = 'background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;';
    errorDiv.innerHTML = `
        <i class="fa-solid fa-exclamation-triangle" style="color: #ffc107; font-size: 1.2rem;"></i>
        <div>
            <strong>Connection Error:</strong> ${message}
            <br><small>Make sure the backend server is running on the Raspberry Pi and accessible.</small>
        </div>
    `;
    
    container.insertBefore(errorDiv, container.firstChild);
}

// Update benchmark UI with real Raspberry Pi data
function updateBenchmarkUI(data) {
    // Remove error message if it exists (successful data fetch)
    const existingError = document.getElementById('benchmark-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Update performance cards with real Raspberry Pi data
    document.getElementById('cpuUsage').textContent = parseFloat(data.cpu_usage).toFixed(1) + '%';
    
    const memoryUsageMB = data.memory_usage || 0;
    const memoryTotalMB = data.memory_total || 1024;
    const memoryPercent = ((memoryUsageMB / memoryTotalMB) * 100).toFixed(1);
    document.getElementById('memoryUsage').textContent = memoryUsageMB + 'MB';
    
    document.getElementById('responseTime').textContent = data.response_time + 'ms';
    document.getElementById('systemUptime').textContent = data.uptime;
    
    // Update status indicators based on real values
    updateStatusIndicator('cpuUsage', parseFloat(data.cpu_usage));
    updateStatusIndicator('memoryUsage', parseFloat(memoryPercent));
    updateStatusIndicator('responseTime', parseInt(data.response_time));
    updateStatusIndicator('systemUptime', 0); // Uptime is always stable
    
    // Update charts with new real data point
    updateChartData(cpuChart, parseFloat(data.cpu_usage));
    updateChartData(memoryChart, memoryUsageMB);
    updateChartData(responseTimeChart, parseInt(data.response_time));
    
    // Update network chart if data available
    if (data.net_sent_mb !== undefined && data.net_recv_mb !== undefined) {
        // Calculate current network speed (simplified)
        const uploadSpeed = (data.net_sent_mb / 1024).toFixed(2); // Convert to GB/s approximation
        const downloadSpeed = (data.net_recv_mb / 1024).toFixed(2);
        
        if (networkChart && networkChart.data.datasets.length >= 2) {
            updateChartData(networkChart, parseFloat(uploadSpeed), 0);
            updateChartData(networkChart, parseFloat(downloadSpeed), 1);
        }
    }
    
    console.log('Benchmark data updated from Raspberry Pi:', {
        cpu: data.cpu_usage + '%',
        memory: memoryUsageMB + 'MB / ' + memoryTotalMB + 'MB',
        uptime: data.uptime,
        platform: data.platform,
        architecture: data.architecture
    });
}

// Update status indicator based on metric value
function updateStatusIndicator(metricId, value) {
    let statusElement;
    
    if (metricId === 'cpuUsage') {
        statusElement = document.getElementById('cpuStatus');
        if (value < 50) {
            statusElement.className = 'perf-status good';
            statusElement.textContent = 'Optimal';
        } else if (value < 75) {
            statusElement.className = 'perf-status warning';
            statusElement.textContent = 'Moderate';
        } else {
            statusElement.className = 'perf-status critical';
            statusElement.textContent = 'High';
        }
    } else if (metricId === 'memoryUsage') {
        statusElement = document.getElementById('memoryStatus');
        if (value < 60) {
            statusElement.className = 'perf-status good';
            statusElement.textContent = 'Optimal';
        } else if (value < 80) {
            statusElement.className = 'perf-status warning';
            statusElement.textContent = 'Moderate';
        } else {
            statusElement.className = 'perf-status critical';
            statusElement.textContent = 'High';
        }
    } else if (metricId === 'responseTime') {
        statusElement = document.getElementById('responseStatus');
        if (value < 100) {
            statusElement.className = 'perf-status good';
            statusElement.textContent = 'Excellent';
        } else if (value < 300) {
            statusElement.className = 'perf-status warning';
            statusElement.textContent = 'Good';
        } else {
            statusElement.className = 'perf-status critical';
            statusElement.textContent = 'Slow';
        }
    } else if (metricId === 'systemUptime') {
        statusElement = document.getElementById('uptimeStatus');
        if (statusElement) {
            statusElement.className = 'perf-status good';
            statusElement.textContent = 'Stable';
        }
    }
}

// Update chart with new data point from real Raspberry Pi hardware
function updateChartData(chart, newValue, datasetIndex = 0) {
    if (!chart) return;
    
    // Ensure dataset exists
    if (!chart.data.datasets[datasetIndex]) return;
    
    // Add new data point
    chart.data.datasets[datasetIndex].data.push(newValue);
    
    // Remove oldest data point if more than 24
    if (chart.data.datasets[datasetIndex].data.length > 24) {
        chart.data.datasets[datasetIndex].data.shift();
    }
    
    // Update labels only once (for first dataset)
    if (datasetIndex === 0) {
        const now = new Date();
        chart.data.labels.push(now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
        if (chart.data.labels.length > 24) {
            chart.data.labels.shift();
        }
    }
    
    chart.update('none'); // Update without animation for smoother experience
}

// Export table data to CSV
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = [];
        const cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }
        
        csv.push(row.join(','));
    }
    
    // Download CSV
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Add export functionality to buttons
document.querySelectorAll('.export-btn').forEach((btn, index) => {
    btn.addEventListener('click', function() {
        const tableCard = this.closest('.table-card');
        const table = tableCard.querySelector('table');
        const tableId = table.querySelector('tbody').id;
        const filename = `benchmark_${tableId}_${new Date().toISOString().split('T')[0]}.csv`;
        
        // Get table data
        let csv = [];
        const rows = table.querySelectorAll('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const row = [];
            const cols = rows[i].querySelectorAll('td, th');
            
            for (let j = 0; j < cols.length; j++) {
                // Clean text content
                let text = cols[j].innerText.replace(/\n/g, ' ').trim();
                row.push(`"${text}"`);
            }
            
            csv.push(row.join(','));
        }
        
        // Download CSV
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Visual feedback
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fa-solid fa-check"></i> Exported!';
        this.style.background = 'rgba(76, 175, 80, 0.2)';
        this.style.borderColor = '#4CAF50';
        this.style.color = '#4CAF50';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = 'rgba(33, 150, 243, 0.1)';
            this.style.borderColor = '#2196F3';
            this.style.color = '#2196F3';
        }, 2000);
    });
});
