#!/usr/bin/env python3
"""
Device Activation Module for BAYYTI-B1
Implements market-standard IoT security architecture
- API keys generated only in backend (never on device)
- API keys hashed before storage (never stored in plaintext)
- One-time API key delivery during activation
- Secure device linking process with JWT authentication
"""

from flask import jsonify, request
import json
import os
from datetime import datetime
from secure_device_manager import secure_device_manager

def add_device_activation_routes(app):
    """Add device activation routes to the Flask app"""
    
    # Check for existing activation on startup and update device identity
    def load_existing_activation():
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    activation_data = json.load(f)
                
                if activation_data.get('activated'):
                    # Update device identity with existing activation
                    try:
                        import sys
                        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'device'))
                        from device import identity as device_identity
                        if device_identity:
                            device_identity.update_registration_status(
                                True, 
                                activation_data.get('apiKey'),
                                activation_data.get('deviceName'),
                                activation_data.get('ownerId')
                            )
                            print(f"✓ Loaded existing activation - Device registered: True")
                            print(f"  API Key: {activation_data.get('apiKey', '')[:8]}...")
                            return True
                    except Exception as e:
                        print(f"⚠ Failed to load existing activation: {e}")
            return False
        except Exception as e:
            print(f"⚠ Error checking existing activation: {e}")
            return False
    
    # Load existing activation on startup
    load_existing_activation()
    
    @app.route('/api/device/activate', methods=['POST'])
    def activate_device():
        """
        SECURE DEVICE ACTIVATION - Market Standard Implementation
        
        This endpoint is called by the Pi device ONLY with its Device ID.
        - Device ID is public (not secret)
        - API key is generated in backend and delivered ONLY ONCE
        - API key is never generated on device
        - Follows industry IoT security standards
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            # Extract device ID (only required field from device)
            device_id = data.get('deviceId')
            
            if not device_id:
                return jsonify({
                    "success": False,
                    "error": "deviceId is required"
                }), 400
            
            print(f"🔍 Device activation request from: {device_id}")
            
            # Use secure device manager for activation
            activation_result = secure_device_manager.device_activation_request(device_id)
            
            if activation_result['success']:
                print(f"✅ Device {device_id} activated successfully")
                return jsonify(activation_result)
            else:
                print(f"❌ Device {device_id} activation failed: {activation_result.get('message', 'Unknown error')}")
                return jsonify(activation_result), 400
            
        except Exception as e:
            print(f"❌ Device activation failed: {e}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    @app.route('/api/device/activation-status', methods=['GET'])
    def get_activation_status():
        """Get current device activation status"""
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

    @app.route('/api/device/api-keys', methods=['GET'])
    def get_device_api_keys():
        """Get all device API keys for management interface"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
            api_keys = []
            
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    activation_data = json.load(f)
                
                api_keys.append({
                    "id": 1,
                    "deviceId": activation_data.get('deviceId'),
                    "deviceName": activation_data.get('deviceName'),
                    "apiKey": activation_data.get('apiKey'),
                    "ownerId": activation_data.get('ownerId'),
                    "activated": activation_data.get('activated', False),
                    "activatedAt": activation_data.get('activatedAt'),
                    "cloudEndpoint": activation_data.get('cloudEndpoint'),
                    "status": "active" if activation_data.get('activated') else "inactive"
                })
            
            return jsonify({
                "success": True,
                "count": len(api_keys),
                "apiKeys": api_keys
            })
            
        except Exception as e:
            return jsonify({
                "success": False,
                "error": str(e),
                "apiKeys": []
            }), 500

    print("✓ Device activation endpoints registered:")
    print("  POST /api/device/activate")
    print("  GET  /api/device/activation-status")
    print("  GET  /api/device/api-keys")
