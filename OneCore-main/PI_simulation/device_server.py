#!/usr/bin/env python3
"""
Device Server for OneCore PI Simulation
Handles device registration, API key management, and provides device ID
"""

import uuid
import hashlib
import platform
import json
import os
import time
import threading
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for web interface

class DeviceManager:
    def __init__(self):
        self.device_id = self._generate_device_id()
        self.api_key = None
        self.config_file = "device_config.json"
        self.load_config()
        
    def _generate_device_id(self):
        """Generate unique device ID based on hardware"""
        try:
            # Get MAC address and system info
            mac = uuid.getnode()
            system = platform.system()
            machine = platform.machine()
            processor = platform.processor()
            
            # Create unique string
            raw_id = f"{mac}{system}{machine}{processor}"
            
            # Generate SHA256 hash
            device_hash = hashlib.sha256(raw_id.encode()).hexdigest()
            
            logger.info(f"Generated Device ID: {device_hash[:16]}...")
            return device_hash
            
        except Exception as e:
            logger.error(f"Error generating device ID: {e}")
            # Fallback to UUID if hardware info fails
            fallback_id = str(uuid.uuid4()).replace('-', '')
            logger.warning(f"Using fallback Device ID: {fallback_id[:16]}...")
            return fallback_id
    
    def load_config(self):
        """Load device configuration from file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    self.api_key = config.get('api_key')
                    logger.info("✅ Device configuration loaded")
            else:
                logger.info("No existing configuration found")
        except Exception as e:
            logger.error(f"Error loading config: {e}")
    
    def save_config(self):
        """Save device configuration to file"""
        try:
            config = {
                'device_id': self.device_id,
                'api_key': self.api_key,
                'last_updated': time.time()
            }
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
            logger.info("✅ Device configuration saved")
        except Exception as e:
            logger.error(f"Error saving config: {e}")
    
    def set_api_key(self, api_key):
        """Set and save API key"""
        self.api_key = api_key
        self.save_config()
        logger.info("✅ API key updated")
    
    def is_registered(self):
        """Check if device has valid API key"""
        return self.api_key is not None
    
    def send_heartbeat(self, cloud_endpoint="http://localhost:3000"):
        """Send heartbeat to cloud dashboard"""
        if not self.is_registered():
            logger.warning("⚠️ Cannot send heartbeat - device not registered")
            return False
        
        try:
            response = requests.post(
                f"{cloud_endpoint}/api/device/heartbeat",
                headers={
                    "Authorization": f"Device {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "deviceId": self.device_id,
                    "timestamp": time.time()
                },
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info("💓 Heartbeat sent successfully")
                return True
            else:
                logger.warning(f"⚠️ Heartbeat failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.warning(f"⚠️ Heartbeat connection failed: {e}")
            return False

# Global device manager instance
device_manager = DeviceManager()

@app.route('/device-id', methods=['GET'])
def get_device_id():
    """Get device ID for registration"""
    return jsonify({
        "deviceId": device_manager.device_id,
        "registered": device_manager.is_registered(),
        "timestamp": time.time()
    })

@app.route('/save-api-key', methods=['POST'])
def save_api_key():
    """Save API key from registration process"""
    try:
        data = request.json
        api_key = data.get('apiKey')
        
        if not api_key:
            return jsonify({"success": False, "error": "API key required"}), 400
        
        device_manager.set_api_key(api_key)
        
        return jsonify({
            "success": True,
            "message": "API key saved successfully",
            "deviceId": device_manager.device_id
        })
        
    except Exception as e:
        logger.error(f"Error saving API key: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/status', methods=['GET'])
def get_status():
    """Get device status"""
    return jsonify({
        "deviceId": device_manager.device_id,
        "registered": device_manager.is_registered(),
        "apiKey": "***" if device_manager.api_key else None,
        "timestamp": time.time()
    })

@app.route('/heartbeat', methods=['POST'])
def manual_heartbeat():
    """Manually trigger heartbeat"""
    try:
        data = request.json or {}
        cloud_endpoint = data.get('cloudEndpoint', 'http://localhost:3000')
        
        success = device_manager.send_heartbeat(cloud_endpoint)
        
        return jsonify({
            "success": success,
            "message": "Heartbeat sent" if success else "Heartbeat failed",
            "timestamp": time.time()
        })
        
    except Exception as e:
        logger.error(f"Error sending heartbeat: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

def heartbeat_loop():
    """Background heartbeat loop"""
    while True:
        try:
            if device_manager.is_registered():
                device_manager.send_heartbeat()
            time.sleep(60)  # Send heartbeat every minute
        except Exception as e:
            logger.error(f"Heartbeat loop error: {e}")
            time.sleep(60)

def main():
    """Start the device server"""
    logger.info("🚀 Starting OneCore Device Server")
    logger.info(f"🆔 Device ID: {device_manager.device_id[:16]}...")
    logger.info(f"🔑 Registered: {'Yes' if device_manager.is_registered() else 'No'}")
    
    # Start heartbeat in background thread
    heartbeat_thread = threading.Thread(target=heartbeat_loop, daemon=True)
    heartbeat_thread.start()
    logger.info("💓 Heartbeat service started")
    
    # Start Flask server
    logger.info("🌐 Starting web server on http://localhost:5000")
    logger.info("📝 Registration interface: device_registration.html")
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")

if __name__ == "__main__":
    main()
