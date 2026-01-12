"""
Mock Cloud AI Server for Testing
This simulates a cloud AI service that provides irrigation recommendations.
Run this separately to test cloud AI integration.
"""

from flask import Flask, jsonify, request
from datetime import datetime
import random

app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'Cloud AI Mock Server'})

@app.route('/api/ai/recommend', methods=['POST'])
def recommend():
    """
    Cloud AI recommendation endpoint.
    Receives sensor data and returns irrigation recommendation.
    
    This is a MOCK - in production, this would run ML models.
    """
    data = request.json
    
    soil_moisture = data.get('soil_moisture', 50)
    temperature = data.get('temperature', 25)
    humidity = data.get('humidity', 60)
    battery = data.get('battery', 12)
    crop_type = data.get('crop_type', 'tomato')
    location = data.get('location', 'algeria')
    
    print(f"Cloud AI received request: Soil={soil_moisture}%, Temp={temperature}°C, Crop={crop_type}")
    
    action = 'SKIP'
    duration = 0
    confidence = 0.7
    reason = "Soil moisture adequate"
    
    if soil_moisture < 25:
        action = 'IRRIGATE'
        duration = 600
        confidence = 0.92
        reason = f"Soil very dry ({soil_moisture}%), hot weather ({temperature}°C)"
    elif soil_moisture < 30:
        action = 'IRRIGATE'
        duration = 400
        confidence = 0.85
        reason = f"Soil dry ({soil_moisture}%), moderate conditions"
    elif soil_moisture < 35:
        if temperature > 28:
            action = 'IRRIGATE'
            duration = 300
            confidence = 0.78
            reason = f"Soil moderate ({soil_moisture}%) but high temp ({temperature}°C)"
        else:
            action = 'SKIP'
            confidence = 0.80
            reason = f"Soil acceptable ({soil_moisture}%), normal temp"
    
    if battery < 11.5:
        action = 'SKIP'
        duration = 0
        confidence = 0.95
        reason = f"Battery too low ({battery}V) - safety override"
    
    recommendation = {
        'action': action,
        'duration': duration,
        'confidence': confidence,
        'reason': reason,
        'model': 'mock_ml_v1',
        'timestamp': datetime.now().isoformat(),
        'crop_specific': {
            'crop_type': crop_type,
            'optimal_moisture': 35,
            'water_sensitivity': 'medium'
        },
        'weather_considered': True,
        'location': location
    }
    
    print(f"Cloud AI recommendation: {action} for {duration}s (confidence: {confidence})")
    
    return jsonify(recommendation)

@app.route('/api/ai/train', methods=['POST'])
def train():
    """Mock endpoint for training data submission"""
    data = request.json
    print(f"Training data received: {len(data.get('samples', []))} samples")
    return jsonify({
        'success': True,
        'message': 'Training data queued for processing',
        'model_version': 'v1.2.3'
    })

@app.route('/api/ai/models')
def list_models():
    """List available AI models"""
    return jsonify({
        'models': [
            {
                'name': 'rule_based_v1',
                'type': 'decision_tree',
                'accuracy': 0.87,
                'active': False
            },
            {
                'name': 'ml_regression_v2',
                'type': 'xgboost',
                'accuracy': 0.91,
                'active': True
            },
            {
                'name': 'lstm_forecast_v1',
                'type': 'neural_network',
                'accuracy': 0.89,
                'active': False
            }
        ]
    })

@app.route('/api/ai/stats')
def stats():
    """Get AI service statistics"""
    return jsonify({
        'total_requests': random.randint(1000, 5000),
        'avg_response_time_ms': random.randint(50, 200),
        'accuracy_rate': 0.91,
        'water_saved_percent': 32.5,
        'uptime_hours': random.randint(100, 1000)
    })

if __name__ == '__main__':
    print("=" * 60)
    print("  MOCK CLOUD AI SERVER")
    print("=" * 60)
    print("")
    print("This simulates a cloud AI service for testing.")
    print("In production, this would run ML models (XGBoost, LSTM, etc.)")
    print("")
    print("Endpoints:")
    print("  POST /api/ai/recommend  - Get irrigation recommendation")
    print("  GET  /health            - Health check")
    print("  GET  /api/ai/models     - List AI models")
    print("  GET  /api/ai/stats      - Service statistics")
    print("")
    print("Starting server on http://localhost:8000")
    print("=" * 60)
    print("")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
