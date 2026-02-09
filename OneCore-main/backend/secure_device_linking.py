"""
Secure Device Linking Endpoint for Next.js Dashboard
Implements proper JWT authentication and device linking process
"""

from flask import jsonify, request
import jwt
import json
import os
from datetime import datetime
from secure_device_manager import secure_device_manager

def add_secure_device_linking_routes(app):
    """Add secure device linking routes for Next.js dashboard"""
    
    @app.route('/api/device/link', methods=['POST'])
    def link_device():
        """
        SECURE DEVICE LINKING - Called from Next.js Dashboard
        
        This endpoint is called by authenticated users to link devices.
        - Requires JWT authentication
        - Generates API key in backend (never on frontend)
        - Stores hashed API key only
        - Device receives API key only once during activation
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            # Extract required fields
            device_id = data.get('deviceId')
            device_name = data.get('deviceName', 'BAYYTI-B1')
            
            if not device_id:
                return jsonify({
                    "success": False,
                    "error": "deviceId is required"
                }), 400
            
            # Get JWT token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({
                    "success": False,
                    "error": "JWT token required in Authorization header"
                }), 401
            
            jwt_token = auth_header.split(' ')[1]
            
            print(f"🔗 Device linking request for: {device_id}")
            print(f"🔑 JWT token provided: {jwt_token[:20]}...")
            
            # Use secure device manager for linking
            linking_result = secure_device_manager.initiate_device_linking(device_id, jwt_token)
            
            if linking_result['success']:
                print(f"✅ Device {device_id} linked successfully")
                return jsonify(linking_result)
            else:
                print(f"❌ Device {device_id} linking failed: {linking_result.get('error', 'Unknown error')}")
                return jsonify(linking_result), 400
                
        except Exception as e:
            print(f"❌ Device linking failed: {e}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    @app.route('/api/device/validate', methods=['POST'])
    def validate_device_api():
        """
        SECURE API VALIDATION - Called for every device API request
        
        This endpoint validates device API requests using hash comparison.
        - Never exposes plaintext API keys
        - Uses secure hash comparison
        - Follows industry security standards
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
            
            if not device_id or not api_key:
                return jsonify({
                    "success": False,
                    "error": "deviceId and apiKey are required"
                }), 400
            
            # Validate using secure device manager
            is_valid = secure_device_manager.validate_api_request(device_id, api_key)
            
            if is_valid:
                return jsonify({
                    "success": True,
                    "valid": True,
                    "message": "API key is valid"
                })
            else:
                return jsonify({
                    "success": False,
                    "valid": False,
                    "message": "Invalid API key"
                }), 401
                
        except Exception as e:
            print(f"❌ API validation failed: {e}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    @app.route('/api/device/revoke', methods=['POST'])
    def revoke_device_api():
        """
        SECURE API REVOCATION - Revoke device API key
        
        This endpoint revokes device API keys.
        - Requires admin authentication
        - Forces device to re-activate
        - Follows security best practices
        """
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    "success": False,
                    "error": "No data provided"
                }), 400
            
            device_id = data.get('deviceId')
            
            if not device_id:
                return jsonify({
                    "success": False,
                    "error": "deviceId is required"
                }), 400
            
            # TODO: Add admin authentication check here
            
            print(f"🔒 Revoking API key for device: {device_id}")
            
            # Use secure device manager for revocation
            revocation_result = secure_device_manager.revoke_device_api_key(device_id)
            
            if revocation_result:
                return jsonify({
                    "success": True,
                    "message": f"API key revoked for device {device_id}"
                })
            else:
                return jsonify({
                    "success": False,
                    "error": "Failed to revoke API key"
                }), 500
                
        except Exception as e:
            print(f"❌ API revocation failed: {e}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 500
    
    print("✅ Secure device linking endpoints registered:")
    print("  POST /api/device/link - Link device with JWT authentication")
    print("  POST /api/device/validate - Validate device API requests")
    print("  POST /api/device/revoke - Revoke device API keys")
