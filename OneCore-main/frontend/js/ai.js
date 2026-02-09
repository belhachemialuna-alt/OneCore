// BAYYTI-B1 AI Model Testing
const API_BASE = window.location.origin;
let currentModel = 'local-basic';
let predictionCount = 0;
let modelComparisons = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupMobileMenu();
    updateParameterDisplays();
    loadModelStatus();
});

// Setup event listeners
function setupEventListeners() {
    // Model selection
    document.querySelectorAll('.btn-select').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const model = e.currentTarget.getAttribute('data-model');
            if (!e.currentTarget.disabled) {
                selectModel(model);
            }
        });
    });
    
    // Parameter sliders
    document.getElementById('soil-moisture-input').addEventListener('input', updateParameterDisplays);
    document.getElementById('temperature-input').addEventListener('input', updateParameterDisplays);
    document.getElementById('humidity-input').addEventListener('input', updateParameterDisplays);
    document.getElementById('rainfall-input').addEventListener('input', updateParameterDisplays);
    
    // Run prediction button
    document.getElementById('run-prediction').addEventListener('click', runPrediction);
}

// Update parameter displays
function updateParameterDisplays() {
    const soilMoisture = document.getElementById('soil-moisture-input').value;
    const temperature = document.getElementById('temperature-input').value;
    const humidity = document.getElementById('humidity-input').value;
    const rainfall = document.getElementById('rainfall-input').value;
    
    document.getElementById('soil-moisture-value').textContent = `${soilMoisture}%`;
    document.getElementById('temperature-value').textContent = `${temperature}°C`;
    document.getElementById('humidity-value').textContent = `${humidity}%`;
    document.getElementById('rainfall-value').textContent = `${rainfall}mm`;
}

// Select model
function selectModel(modelId) {
    currentModel = modelId;
    
    // Update UI
    document.querySelectorAll('.model-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const selectedCard = document.querySelector(`.model-card[data-model="${modelId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Update status
    const modelNames = {
        'local-basic': 'Local Basic Model',
        'ml-optimized': 'ML Optimized Model',
        'cloud-advanced': 'Cloud Advanced Model',
        'custom': 'Custom Model'
    };
    
    document.getElementById('active-model').textContent = modelNames[modelId] || 'Unknown Model';
    
    // Show notification
    showNotification(`Switched to ${modelNames[modelId]}`, 'success');
}

// Run prediction
async function runPrediction() {
    const btn = document.getElementById('run-prediction');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running...';
    
    // Get parameters
    const params = {
        soilMoisture: parseFloat(document.getElementById('soil-moisture-input').value),
        temperature: parseFloat(document.getElementById('temperature-input').value),
        humidity: parseFloat(document.getElementById('humidity-input').value),
        rainfall: parseFloat(document.getElementById('rainfall-input').value),
        model: currentModel
    };
    
    try {
        // Simulate AI prediction (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const prediction = generatePrediction(params);
        displayResults(prediction);
        updateComparison(prediction);
        
        predictionCount++;
        document.getElementById('predictions-count').textContent = predictionCount;
        
        showNotification('Prediction completed successfully', 'success');
    } catch (error) {
        console.error('Prediction error:', error);
        showNotification('Prediction failed', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-play"></i> Run Prediction';
    }
}

// Generate prediction (simulated)
function generatePrediction(params) {
    const { soilMoisture, temperature, humidity, rainfall } = params;
    
    // Simple rule-based prediction
    let shouldIrrigate = false;
    let duration = 0;
    let confidence = 0;
    let waterAmount = 0;
    
    if (currentModel === 'local-basic') {
        // Basic threshold-based logic
        if (soilMoisture < 40 && rainfall < 5) {
            shouldIrrigate = true;
            duration = Math.max(10, (40 - soilMoisture) * 2);
            waterAmount = duration * 5;
        }
        confidence = 75 + Math.random() * 15;
    } else if (currentModel === 'ml-optimized') {
        // More sophisticated logic
        const moistureDeficit = Math.max(0, 50 - soilMoisture);
        const tempFactor = temperature > 30 ? 1.2 : 1.0;
        const humidityFactor = humidity < 50 ? 1.1 : 0.9;
        
        if (moistureDeficit > 5 && rainfall < 3) {
            shouldIrrigate = true;
            duration = Math.round(moistureDeficit * tempFactor * humidityFactor * 1.5);
            waterAmount = duration * 5.5;
        }
        confidence = 85 + Math.random() * 10;
    }
    
    return {
        model: currentModel,
        shouldIrrigate,
        duration: Math.round(duration),
        confidence: Math.round(confidence),
        waterAmount: Math.round(waterAmount),
        timestamp: new Date(),
        params
    };
}

// Display results
function displayResults(prediction) {
    const container = document.getElementById('results-container');
    
    const recommendation = prediction.shouldIrrigate ? 
        `<div class="badge badge-success"><i class="fa-solid fa-check-circle"></i> Irrigate Recommended</div>` :
        `<div class="badge badge-warning"><i class="fa-solid fa-times-circle"></i> No Irrigation Needed</div>`;
    
    container.innerHTML = `
        <div class="results-grid">
            <div class="result-card">
                <div class="result-label">Recommendation</div>
                <div class="result-value">${recommendation}</div>
            </div>
            <div class="result-card">
                <div class="result-label">Duration</div>
                <div class="result-value">
                    ${prediction.duration}<span class="result-unit">min</span>
                </div>
            </div>
            <div class="result-card">
                <div class="result-label">Confidence</div>
                <div class="result-value">
                    ${prediction.confidence}<span class="result-unit">%</span>
                </div>
            </div>
            <div class="result-card">
                <div class="result-label">Water Amount</div>
                <div class="result-value">
                    ${prediction.waterAmount}<span class="result-unit">L</span>
                </div>
            </div>
        </div>
    `;
}

// Update comparison table
function updateComparison(prediction) {
    modelComparisons.push(prediction);
    
    const tbody = document.getElementById('comparison-tbody');
    const modelNames = {
        'local-basic': 'Local Basic',
        'ml-optimized': 'ML Optimized',
        'cloud-advanced': 'Cloud Advanced',
        'custom': 'Custom'
    };
    
    // Group by model
    const grouped = {};
    modelComparisons.forEach(p => {
        if (!grouped[p.model]) {
            grouped[p.model] = {
                count: 0,
                totalConfidence: 0,
                totalWater: 0,
                avgDuration: 0
            };
        }
        grouped[p.model].count++;
        grouped[p.model].totalConfidence += p.confidence;
        grouped[p.model].totalWater += p.waterAmount;
        grouped[p.model].avgDuration += p.duration;
    });
    
    tbody.innerHTML = Object.keys(grouped).map(model => {
        const data = grouped[model];
        const avgConfidence = Math.round(data.totalConfidence / data.count);
        const avgWater = Math.round(data.totalWater / data.count);
        const avgDuration = Math.round(data.avgDuration / data.count);
        
        const speed = model === 'local-basic' ? 'Fast' : model === 'ml-optimized' ? 'Medium' : 'Slow';
        const waterSaved = Math.max(0, 100 - avgWater);
        
        return `
            <tr>
                <td><strong>${modelNames[model]}</strong></td>
                <td>${avgConfidence}%</td>
                <td>${speed}</td>
                <td>${waterSaved}L saved</td>
                <td><span class="badge badge-success"><i class="fa-solid fa-check"></i> Active</span></td>
            </tr>
        `;
    }).join('');
    
    // Update accuracy rate
    if (modelComparisons.length > 0) {
        const avgAccuracy = Math.round(
            modelComparisons.reduce((sum, p) => sum + p.confidence, 0) / modelComparisons.length
        );
        document.getElementById('accuracy-rate').textContent = `${avgAccuracy}%`;
    }
}

// Load model status
async function loadModelStatus() {
    // Simulate loading status
    document.getElementById('active-model').textContent = 'Local Basic Model';
    document.getElementById('predictions-count').textContent = '0';
    document.getElementById('accuracy-rate').textContent = '--';
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple console notification for now
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileSidebar = document.getElementById('mobileSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    
    if (mobileMenuBtn && mobileSidebar) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileSidebar.classList.add('active');
        });
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                mobileSidebar.classList.remove('active');
            });
        }
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                mobileSidebar.classList.remove('active');
            });
        }
    }
}
