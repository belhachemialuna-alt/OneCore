from flask import Flask, jsonify, request, send_from_directory, make_response
from flask_cors import CORS
import os
import json
from datetime import datetime
from database import (init_database, get_recent_sensor_data, get_recent_logs, 
                     get_active_schedules, get_unresolved_alerts, get_db)
from main_controller import MainController
from auth import require_api_key, create_api_key, get_all_api_keys, revoke_api_key
from config import DEVICE_NAME, API_VERSION
from irrigation_service import IrrigationService
from ai_decision_service import AIDecisionService
from sensor_service import SensorService

app = Flask(__name__, static_folder='../frontend')
CORS(app)

init_database()

# Initialize main controller with new architecture
controller = MainController()

# Initialize services for backward compatibility with API endpoints
irrigation_service = IrrigationService()
sensor_service = SensorService()
ai_service = AIDecisionService(irrigation_service, sensor_service)

# Disable caching for all responses
@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/favicon.ico')
def favicon():
    """Serve favicon with correct MIME type"""
    return send_from_directory(app.static_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def index():
    # Check if setup is completed
    if not controller.system_config.get('setup_completed', False):
        return send_from_directory(app.static_folder, 'setup.html')
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route("/api/status")
def status():
    """Get complete system status with REAL data from new controllers"""
    system_status = controller.get_system_status()
    
    # Add zone information with crop/soil names
    zones_with_details = []
    for zone in system_status.get('zones', []):
        crop = controller.get_crop_by_id(zone.get('crop_id'))
        soil = controller.get_soil_by_id(zone.get('soil_id'))
        zones_with_details.append({
            **zone,
            'crop_name': crop['name'] if crop else 'Unknown',
            'soil_name': soil['name'] if soil else 'Unknown',
            'active': False
        })
    
    return jsonify({
        "success": True,
        "device": system_status.get('device_name', DEVICE_NAME),
        "version": API_VERSION,
        "sensors": system_status.get('sensors', {}),
        "energy": system_status.get('energy', {}),
        "irrigation": system_status.get('irrigation', {}),
        "zones": zones_with_details,
        "timestamp": system_status.get('timestamp')
    })

@app.route("/api/sensors")
def sensors():
    """Get real sensor data from sensor_reader"""
    data = controller.sensor_reader.read_all_sensors()
    return jsonify({
        "success": True,
        "data": data
    })

@app.route("/api/sensors/history")
def sensor_history():
    limit = request.args.get('limit', 100, type=int)
    data = get_recent_sensor_data(limit)
    return jsonify({
        "success": True,
        "count": len(data),
        "data": data
    })

@app.route("/api/valve/on", methods=["POST"])
def valve_on():
    duration = request.json.get('duration') if request.json else None
    result = irrigation_service.valve_on(trigger_type='manual', duration=duration)
    return jsonify(result)

@app.route("/api/valve/off", methods=["POST"])
def valve_off():
    result = irrigation_service.valve_off()
    return jsonify(result)

@app.route("/api/valve/status")
def valve_status():
    status = irrigation_service.get_status()
    return jsonify({
        "success": True,
        "data": status
    })

@app.route("/api/emergency-stop", methods=["POST"])
def emergency_stop():
    result = irrigation_service.emergency_stop()
    return jsonify(result)

@app.route("/api/logs")
def logs():
    limit = request.args.get('limit', 50, type=int)
    data = get_recent_logs(limit)
    return jsonify({
        "success": True,
        "count": len(data),
        "data": data
    })

@app.route("/api/schedules", methods=["GET"])
def get_schedules():
    schedules = get_active_schedules()
    return jsonify({
        "success": True,
        "count": len(schedules),
        "data": schedules
    })

@app.route("/api/schedules", methods=["POST"])
def create_schedule():
    data = request.json
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO schedules (name, start_time, duration, days_of_week, soil_threshold)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data.get('name'),
            data.get('start_time'),
            data.get('duration', 300),
            data.get('days_of_week', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'),
            data.get('soil_threshold', 30)
        ))
        conn.commit()
        schedule_id = cursor.lastrowid
    
    return jsonify({
        "success": True,
        "message": "Schedule created",
        "schedule_id": schedule_id
    })

@app.route("/api/schedules/<int:schedule_id>", methods=["DELETE"])
def delete_schedule(schedule_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM schedules WHERE id = ?', (schedule_id,))
        conn.commit()
    
    return jsonify({
        "success": True,
        "message": "Schedule deleted"
    })

@app.route("/api/schedules/<int:schedule_id>/toggle", methods=["POST"])
def toggle_schedule(schedule_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT enabled FROM schedules WHERE id = ?', (schedule_id,))
        result = cursor.fetchone()
        
        if result:
            new_state = 0 if result[0] else 1
            cursor.execute('UPDATE schedules SET enabled = ? WHERE id = ?', (new_state, schedule_id))
            conn.commit()
            
            return jsonify({
                "success": True,
                "enabled": bool(new_state)
            })
    
    return jsonify({
        "success": False,
        "message": "Schedule not found"
    }), 404

@app.route("/api/alerts")
def get_alerts():
    alerts = get_unresolved_alerts()
    return jsonify({
        "success": True,
        "count": len(alerts),
        "data": alerts
    })

@app.route("/api/alerts/<int:alert_id>/resolve", methods=["POST"])
def resolve_alert(alert_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('UPDATE alerts SET resolved = 1 WHERE id = ?', (alert_id,))
        conn.commit()
    
    return jsonify({
        "success": True,
        "message": "Alert resolved"
    })

@app.route("/api/ai/recommendation")
def ai_recommendation():
    """Get AI recommendation using new decision engine"""
    try:
        # Get first zone or default
        zones = controller.system_config.get('zones', [])
        if zones:
            decision = controller.make_irrigation_decision(zones[0]['id'])
        else:
            # Fallback to basic recommendation
            sensors = controller.sensor_reader.read_all_sensors()
            energy = controller.energy_manager.get_status()
            decision = {
                'should_irrigate': sensors['soil_moisture'] < 30,
                'reason': f"Soil moisture: {sensors['soil_moisture']}%",
                'recommended_duration': 300,
                'confidence': 0.8,
                'ai_source': 'local_ai'
            }
        
        return jsonify({
            "success": True,
            "data": decision
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

# Setup endpoints
@app.route("/api/setup/data")
def setup_data():
    """Get data for setup wizard"""
    return jsonify({
        "success": True,
        "crops": controller.crops_data.get('crops', []),
        "soil_types": controller.soil_types_data.get('soil_types', []),
        "wilayas": controller.load_json('wilayas.json').get('wilayas', [])
    })

@app.route("/api/setup/complete", methods=["POST"])
def complete_setup():
    """Complete setup and save configuration"""
    try:
        config = request.json
        config['setup_completed'] = True
        controller.save_system_config(config)
        
        return jsonify({
            "success": True,
            "message": "Setup completed successfully"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route("/api/ai/cloud/enable", methods=["POST"])
def enable_cloud_ai():
    data = request.json
    cloud_url = data.get('cloud_url', 'http://localhost:8000')
    
    return jsonify({
        "success": True,
        "message": f"Cloud AI enabled: {cloud_url}",
        "reminder": "Pi validates all cloud AI decisions"
    })

@app.route("/api/ai/cloud/disable", methods=["POST"])
def disable_cloud_ai():
    ai_service.disable_cloud_ai()
    
    return jsonify({
        "success": True,
        "message": "Cloud AI disabled - using local AI only",
        "reminder": "Pi continues to validate all decisions"
    })

@app.route("/api/ai/cloud/status")
def cloud_ai_status():
    return jsonify({
        "success": True,
        "cloud_enabled": ai_service.hybrid_ai.cloud_client.enabled,
        "cloud_url": ai_service.hybrid_ai.cloud_client.cloud_api_url,
        "local_ai_active": True,
        "pi_has_authority": True,
        "validation_enabled": True
    })

@app.route("/api/safety/status")
def safety_status():
    safety_status = irrigation_service.safety_engine.get_safety_status()
    return jsonify({
        "success": True,
        "data": safety_status,
        "message": "Local safety rules active - Pi has final authority"
    })

@app.route("/api/safety/rules")
def safety_rules():
    rules = {
        "battery_min_voltage": irrigation_service.safety_engine.min_battery_voltage,
        "battery_critical_voltage": irrigation_service.safety_engine.critical_battery_voltage,
        "max_soil_moisture": irrigation_service.safety_engine.max_soil_moisture,
        "min_soil_moisture": irrigation_service.safety_engine.min_soil_moisture,
        "max_temperature": irrigation_service.safety_engine.max_temperature,
        "min_temperature": irrigation_service.safety_engine.min_temperature,
        "max_consecutive_irrigations": irrigation_service.safety_engine.max_consecutive_irrigations,
        "min_irrigation_interval": irrigation_service.safety_engine.min_irrigation_interval,
        "max_daily_water_usage": irrigation_service.safety_engine.max_daily_water_usage,
        "pi_authority": "FINAL",
        "cloud_ai_authority": "ADVISORY_ONLY"
    }
    return jsonify({
        "success": True,
        "rules": rules,
        "message": "These rules CANNOT be overridden by cloud AI"
    })

@app.route("/api/ai/auto-mode", methods=["POST"])
def toggle_auto_mode():
    data = request.json
    enabled = data.get('enabled', False)
    
    return jsonify({
        "success": True,
        "auto_mode": enabled,
        "message": f"Auto mode {'enabled' if enabled else 'disabled'}"
    })

@app.route("/api/stats/summary")
def stats_summary():
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM irrigation_logs WHERE DATE(timestamp) = DATE("now")')
        today_irrigations = cursor.fetchone()[0]
        
        cursor.execute('SELECT SUM(water_used) FROM irrigation_logs WHERE DATE(timestamp) = DATE("now")')
        today_water = cursor.fetchone()[0] or 0
        
        cursor.execute('SELECT AVG(soil_moisture) FROM sensor_readings WHERE DATE(timestamp) = DATE("now")')
        avg_moisture = cursor.fetchone()[0] or 0
    
    return jsonify({
        "success": True,
        "data": {
            "today_irrigations": today_irrigations,
            "today_water_used": round(today_water, 2),
            "avg_soil_moisture": round(avg_moisture, 2),
            "system_uptime": "24h 15m"
        }
    })

@app.route("/api/auth/keys", methods=["GET"])
@require_api_key
def list_api_keys():
    keys = get_all_api_keys()
    return jsonify({
        "success": True,
        "data": keys
    })

@app.route("/api/auth/keys", methods=["POST"])
@require_api_key
def create_new_api_key():
    data = request.json
    name = data.get('name', 'Unnamed Key')
    key = create_api_key(name)
    
    return jsonify({
        "success": True,
        "api_key": key,
        "message": "Save this key securely. It won't be shown again."
    })

@app.route("/api/auth/keys/<int:key_id>", methods=["DELETE"])
@require_api_key
def delete_api_key(key_id):
    revoke_api_key(key_id)
    return jsonify({
        "success": True,
        "message": "API key revoked"
    })

@app.route("/api/analytics/summary")
def analytics_summary():
    """Get analytics summary for dashboard"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Fields needing irrigation (zones with moisture < threshold)
            cursor.execute('''
                SELECT COUNT(DISTINCT zone_id) 
                FROM sensor_readings 
                WHERE soil_moisture < 30 
                AND DATE(timestamp) = DATE("now")
            ''')
            fields_needing = cursor.fetchone()[0] or 0
            
            # Uncertain fields (zones with missing/old data)
            cursor.execute('''
                SELECT COUNT(*) FROM (
                    SELECT zone_id, MAX(timestamp) as last_reading
                    FROM sensor_readings
                    GROUP BY zone_id
                    HAVING julianday('now') - julianday(last_reading) > 1
                )
            ''')
            uncertain = cursor.fetchone()[0] or 0
            
            # Inactive zones
            cursor.execute('''
                SELECT COUNT(*) FROM (
                    SELECT zone_id
                    FROM sensor_readings
                    GROUP BY zone_id
                    HAVING MAX(timestamp) < datetime('now', '-7 days')
                )
            ''')
            inactive = cursor.fetchone()[0] or 0
            
            # Area calculations
            total_area = 244648  # Default value
            irrigated_area = 144648
            
        return jsonify({
            "success": True,
            "data": {
                "fields_needing_irrigation": fields_needing,
                "uncertain_fields": uncertain,
                "inactive_zones": inactive,
                "total_area": total_area,
                "irrigated_area": irrigated_area
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route("/api/system/update/check")
def check_update():
    """Check for system updates from GitHub"""
    import requests
    
    try:
        # Replace with your actual GitHub repo
        github_repo = os.environ.get('GITHUB_REPO', 'YOUR_USERNAME/YOUR_REPO')
        api_url = f'https://api.github.com/repos/{github_repo}/releases/latest'
        
        response = requests.get(api_url, timeout=10)
        
        if response.status_code == 200:
            release_data = response.json()
            latest_version = release_data['tag_name'].replace('v', '')
            current_version = '1.0.0'  # Read from config or file
            
            update_available = latest_version != current_version
            
            return jsonify({
                "success": True,
                "update_available": update_available,
                "current_version": current_version,
                "latest_version": latest_version,
                "release_date": release_data['published_at'],
                "release_notes": release_data['body'],
                "download_url": release_data['zipball_url']
            })
        else:
            return jsonify({
                "success": False,
                "error": "Unable to fetch release information"
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route("/api/system/update/install", methods=["POST"])
@require_api_key
def install_update():
    """Install system update"""
    import subprocess
    
    try:
        data = request.json
        download_url = data.get('download_url')
        
        if not download_url:
            return jsonify({
                "success": False,
                "error": "No download URL provided"
            })
        
        # Trigger update script
        update_script = os.path.join(os.path.dirname(__file__), '../scripts/update_system.py')
        
        if os.path.exists(update_script):
            subprocess.Popen(['python3', update_script, download_url])
            
            return jsonify({
                "success": True,
                "message": "Update installation started"
            })
        else:
            return jsonify({
                "success": False,
                "error": "Update script not found"
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == "__main__":
    print(f"Starting {DEVICE_NAME} API Server v{API_VERSION}")
    print("API Endpoints available at http://localhost:5000/api/")
    print("Dashboard available at http://localhost:5000/")
    app.run(host="0.0.0.0", port=5000, debug=True)
