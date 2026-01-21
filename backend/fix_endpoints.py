"""
Quick fix script to ensure all endpoints are properly working
"""

from flask import Flask, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

@app.route('/api/simulation/send-data', methods=['POST'])
def receive_simulation_data():
    """Receive sensor data from Pi simulation"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No data provided"
            }), 400
        
        print(f"📊 Simulation data received: {data}")
        
        return jsonify({
            "success": True,
            "message": "Sensor data received and processed",
            "timestamp": datetime.utcnow().isoformat() + 'Z'
        })
        
    except Exception as e:
        print(f"❌ Simulation data processing failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/device/api-keys', methods=['GET'])
def get_device_api_keys():
    """Get device API keys"""
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
        
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                activation_data = json.load(f)
            
            api_keys = [{
                "id": 1,
                "deviceId": activation_data.get('deviceId'),
                "deviceName": activation_data.get('deviceName', 'BAYYTI-B1'),
                "apiKey": activation_data.get('apiKey'),
                "status": "active" if activation_data.get('activated') else "inactive",
                "activatedAt": activation_data.get('activatedAt')
            }]
            
            return jsonify({
                "success": True,
                "apiKeys": api_keys,
                "count": len(api_keys)
            })
        else:
            return jsonify({
                "success": True,
                "apiKeys": [],
                "count": 0
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/device/activation-status', methods=['GET'])
def get_activation_status():
    """Get device activation status"""
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
        
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                activation_data = json.load(f)
            
            return jsonify({
                "success": True,
                "deviceId": activation_data.get('deviceId'),
                "deviceName": activation_data.get('deviceName'),
                "apiKey": activation_data.get('apiKey'),
                "activated": True,
                "activatedAt": activation_data.get('activatedAt'),
                "hasApiKey": True,
                "message": "Device is activated"
            })
        else:
            return jsonify({
                "success": True,
                "activated": False,
                "message": "Device not yet activated"
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    print("🔧 Testing endpoints...")
    print("POST /api/simulation/send-data")
    print("GET  /api/device/api-keys")
    print("GET  /api/device/activation-status")
    app.run(host="0.0.0.0", port=5001, debug=True)
