"""
Pi Simulation Endpoints
Handles data exchange between Pi simulation and cloud platform
"""

from flask import jsonify, request
import json
import requests
from datetime import datetime
from secure_device_manager import secure_device_manager

def add_pi_simulation_routes(app):
    """Add Pi simulation routes to the Flask app"""
    
    @app.route('/api/simulation/send-data', methods=['POST'])
    def receive_simulation_data():
        """
        Receive sensor data from Pi simulation and forward to cloud platform
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            device_id = data.get('deviceId')
            api_key = data.get('apiKey')
            sensors = data.get('sensors', {})
            
            # Validate device authentication
            if device_id and api_key:
                is_valid = secure_device_manager.validate_api_request(device_id, api_key)
                if not is_valid:
                    return jsonify({
                        "success": False,
                        "error": "Invalid API key"
                    }), 401
            
            # Process sensor data
            processed_data = {
                "deviceId": device_id,
                "timestamp": data.get('timestamp', datetime.utcnow().isoformat() + 'Z'),
                "sensorData": sensors,
                "dataType": "simulation",
                "status": "received"
            }
            
            # Store data locally (simulate cloud storage)
            try:
                storage_path = os.path.join(os.path.dirname(__file__), 'simulation_data.json')
                
                # Load existing data
                existing_data = []
                if os.path.exists(storage_path):
                    with open(storage_path, 'r') as f:
                        existing_data = json.load(f)
                
                # Add new data
                existing_data.append(processed_data)
                
                # Keep only last 100 entries
                if len(existing_data) > 100:
                    existing_data = existing_data[-100:]
                
                # Save updated data
                with open(storage_path, 'w') as f:
                    json.dump(existing_data, f, indent=2)
                
                print(f"📊 Simulation data received from {device_id}")
                print(f"   Soil Moisture: {sensors.get('soilMoisture', 'N/A')}%")
                print(f"   Temperature: {sensors.get('temperature', 'N/A')}°C")
                print(f"   Humidity: {sensors.get('humidity', 'N/A')}%")
                
            except Exception as e:
                print(f"⚠️ Failed to store simulation data: {e}")
            
            # Try to forward to cloud platform (Next.js)
            try:
                cloud_response = await forward_to_cloud_platform(processed_data)
                if cloud_response:
                    print(f"✅ Data forwarded to cloud platform")
                else:
                    print(f"⚠️ Cloud platform not available - data stored locally")
            except Exception as e:
                print(f"⚠️ Cloud forwarding failed: {e}")
            
            return jsonify({
                "success": True,
                "message": "Sensor data received and processed",
                "dataId": len(existing_data),
                "timestamp": processed_data["timestamp"]
            })
            
        except Exception as e:
            print(f"❌ Simulation data processing failed: {e}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    @app.route('/api/simulation/get-decisions', methods=['GET'])
    def get_ai_decisions():
        """
        Get AI decisions for the Pi simulation
        """
        try:
            # Load recent sensor data to generate decisions
            storage_path = os.path.join(os.path.dirname(__file__), 'simulation_data.json')
            
            if not os.path.exists(storage_path):
                return jsonify({
                    "success": True,
                    "decisions": [],
                    "message": "No sensor data available"
                })
            
            with open(storage_path, 'r') as f:
                sensor_data = json.load(f)
            
            if not sensor_data:
                return jsonify({
                    "success": True,
                    "decisions": [],
                    "message": "No recent data"
                })
            
            # Get latest sensor reading
            latest_data = sensor_data[-1]
            sensors = latest_data.get('sensorData', {})
            
            # Generate AI decisions based on sensor data
            decisions = generate_ai_decisions(sensors)
            
            return jsonify({
                "success": True,
                "decisions": decisions,
                "basedOnData": latest_data["timestamp"],
                "deviceId": latest_data.get("deviceId")
            })
            
        except Exception as e:
            print(f"❌ Failed to get AI decisions: {e}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    @app.route('/api/simulation/status', methods=['GET'])
    def get_simulation_status():
        """
        Get current simulation status and statistics
        """
        try:
            storage_path = os.path.join(os.path.dirname(__file__), 'simulation_data.json')
            
            stats = {
                "totalDataPoints": 0,
                "lastDataReceived": None,
                "deviceStatus": "unknown",
                "cloudConnection": "unknown"
            }
            
            if os.path.exists(storage_path):
                with open(storage_path, 'r') as f:
                    data = json.load(f)
                    stats["totalDataPoints"] = len(data)
                    if data:
                        stats["lastDataReceived"] = data[-1]["timestamp"]
                        stats["deviceStatus"] = "active"
            
            # Test cloud connection
            try:
                cloud_test = requests.get("http://localhost:3000", timeout=2)
                stats["cloudConnection"] = "connected" if cloud_test.status_code == 200 else "error"
            except:
                stats["cloudConnection"] = "disconnected"
            
            return jsonify({
                "success": True,
                "status": stats
            })
            
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500

def generate_ai_decisions(sensors):
    """
    Generate AI decisions based on sensor data
    Simulates intelligent irrigation system decisions
    """
    decisions = []
    current_time = datetime.now().strftime("%H:%M:%S")
    
    # Soil moisture analysis
    soil_moisture = sensors.get('soilMoisture', 50)
    if soil_moisture < 25:
        decisions.append({
            "id": f"irrigation_{current_time}",
            "type": "IRRIGATION",
            "priority": "HIGH",
            "action": "Start irrigation system",
            "duration": "20 minutes",
            "reason": f"Soil moisture critically low ({soil_moisture}%)",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "zone": "all",
                "intensity": "high",
                "duration_minutes": 20
            }
        })
    elif soil_moisture < 40:
        decisions.append({
            "id": f"irrigation_light_{current_time}",
            "type": "IRRIGATION",
            "priority": "MEDIUM",
            "action": "Light irrigation",
            "duration": "10 minutes",
            "reason": f"Soil moisture low ({soil_moisture}%)",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "zone": "all",
                "intensity": "medium",
                "duration_minutes": 10
            }
        })
    elif soil_moisture > 85:
        decisions.append({
            "id": f"drainage_{current_time}",
            "type": "DRAINAGE",
            "priority": "MEDIUM",
            "action": "Enable drainage system",
            "duration": "15 minutes",
            "reason": f"Soil moisture too high ({soil_moisture}%)",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "drainage_rate": "medium"
            }
        })
    
    # Temperature analysis
    temperature = sensors.get('temperature', 25)
    if temperature > 35:
        decisions.append({
            "id": f"cooling_{current_time}",
            "type": "COOLING",
            "priority": "HIGH",
            "action": "Activate cooling system",
            "duration": "30 minutes",
            "reason": f"Temperature too high ({temperature}°C)",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "cooling_intensity": "high",
                "fan_speed": "maximum"
            }
        })
    elif temperature < 5:
        decisions.append({
            "id": f"heating_{current_time}",
            "type": "HEATING",
            "priority": "HIGH",
            "action": "Enable frost protection",
            "duration": "60 minutes",
            "reason": f"Temperature too low ({temperature}°C)",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "heating_mode": "frost_protection"
            }
        })
    
    # pH level analysis
    ph_level = sensors.get('phLevel', 7.0)
    if ph_level < 6.0:
        decisions.append({
            "id": f"ph_adjust_{current_time}",
            "type": "PH_ADJUSTMENT",
            "priority": "MEDIUM",
            "action": "Add alkaline solution",
            "duration": "5 minutes",
            "reason": f"pH too acidic ({ph_level})",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "solution_type": "alkaline",
                "dosage": "low"
            }
        })
    elif ph_level > 8.0:
        decisions.append({
            "id": f"ph_adjust_{current_time}",
            "type": "PH_ADJUSTMENT",
            "priority": "MEDIUM",
            "action": "Add acidic solution",
            "duration": "5 minutes",
            "reason": f"pH too alkaline ({ph_level})",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "solution_type": "acidic",
                "dosage": "low"
            }
        })
    
    # Water level check
    water_level = sensors.get('waterLevel', 100)
    if water_level < 20:
        decisions.append({
            "id": f"water_refill_{current_time}",
            "type": "MAINTENANCE",
            "priority": "HIGH",
            "action": "Refill water tank",
            "duration": "immediate",
            "reason": f"Water level critically low ({water_level}%)",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "tank_id": "main",
                "refill_to": 100
            }
        })
    
    # Light level analysis
    light_level = sensors.get('lightLevel', 800)
    if light_level < 200:
        decisions.append({
            "id": f"lighting_{current_time}",
            "type": "LIGHTING",
            "priority": "LOW",
            "action": "Enable grow lights",
            "duration": "4 hours",
            "reason": f"Light level low ({light_level} lux)",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "light_intensity": "medium",
                "spectrum": "full"
            }
        })
    
    # If everything is optimal
    if not decisions:
        decisions.append({
            "id": f"status_{current_time}",
            "type": "STATUS",
            "priority": "LOW",
            "action": "Continue monitoring",
            "duration": "ongoing",
            "reason": "All parameters within optimal range",
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "parameters": {
                "monitoring_interval": "normal"
            }
        })
    
    return decisions

async def forward_to_cloud_platform(data):
    """
    Forward sensor data to Next.js cloud platform
    """
    try:
        # This would normally send to Next.js API endpoint
        # For simulation, we'll just log it
        print(f"🌐 Forwarding data to cloud platform...")
        print(f"   Device: {data.get('deviceId', 'Unknown')}")
        print(f"   Timestamp: {data.get('timestamp')}")
        return True
    except Exception as e:
        print(f"❌ Cloud forwarding failed: {e}")
        return False

import os

print("✅ Pi simulation endpoints registered:")
print("  POST /api/simulation/send-data")
print("  GET  /api/simulation/get-decisions")
print("  GET  /api/simulation/status")
