"""
Local API Server
Exposes device ID to frontend for pairing.
Runs on port 5000 - this is the bridge between device and HTML UI.

CRITICAL: This must run on port 5000 for frontend to access device ID.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import identity
import threading

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

@app.route("/device-id", methods=["GET"])
def get_device_id():
    """
    Expose device ID for pairing.
    Frontend calls this to retrieve device ID.
    
    Returns:
        JSON: Device ID and registration status
    """
    device_identity = identity.load_identity()
    
    return jsonify({
        "success": True,
        "deviceId": device_identity["deviceId"],
        "registered": device_identity["registered"],
        "deviceName": device_identity.get("deviceName"),
        "timestamp": device_identity.get("updatedAt")
    })

@app.route("/device-status", methods=["GET"])
def get_device_status():
    """
    Get detailed device status.
    
    Returns:
        JSON: Complete device status
    """
    device_identity = identity.load_identity()
    
    return jsonify({
        "success": True,
        "deviceId": device_identity["deviceId"],
        "registered": device_identity["registered"],
        "hasApiKey": device_identity.get("apiKey") is not None,
        "deviceName": device_identity.get("deviceName"),
        "ownerId": device_identity.get("ownerId"),
        "createdAt": device_identity.get("createdAt"),
        "updatedAt": device_identity.get("updatedAt")
    })

@app.route("/device-register", methods=["POST"])
def register_device():
    """
    Local endpoint to update device registration status.
    Called after successful VPS registration.
    
    Expected JSON body:
    {
        "apiKey": "xxx",
        "deviceName": "My Device",
        "ownerId": "user123"
    }
    
    Returns:
        JSON: Updated device identity
    """
    data = request.get_json()
    
    if not data:
        return jsonify({
            "success": False,
            "error": "No data provided"
        }), 400
    
    api_key = data.get("apiKey")
    device_name = data.get("deviceName")
    owner_id = data.get("ownerId")
    
    if not api_key:
        return jsonify({
            "success": False,
            "error": "API key is required"
        }), 400
    
    # Update device identity
    updated_identity = identity.update_identity(
        api_key=api_key,
        registered=True,
        device_name=device_name,
        owner_id=owner_id
    )
    
    return jsonify({
        "success": True,
        "message": "Device registered successfully",
        "deviceId": updated_identity["deviceId"],
        "registered": updated_identity["registered"]
    })

@app.route("/device-unregister", methods=["POST"])
def unregister_device():
    """
    Unregister device from VPS (for re-pairing).
    
    Returns:
        JSON: Success status
    """
    updated_identity = identity.update_identity(
        api_key=None,
        registered=False,
        device_name=None,
        owner_id=None
    )
    
    return jsonify({
        "success": True,
        "message": "Device unregistered successfully",
        "deviceId": updated_identity["deviceId"]
    })

@app.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON: Server health status
    """
    return jsonify({
        "success": True,
        "status": "running",
        "service": "Device Local API",
        "port": 5000
    })

def start_local_api(host="0.0.0.0", port=5000, debug=False):
    """
    Start the local API server.
    
    Args:
        host (str): Host to bind to (default: 0.0.0.0 for all interfaces)
        port (int): Port to listen on (default: 5000)
        debug (bool): Enable debug mode
    """
    print(f"Starting Device Local API on {host}:{port}")
    app.run(host=host, port=port, debug=debug, threaded=True)

def start_local_api_background(host="0.0.0.0", port=5000):
    """
    Start the local API server in a background thread.
    
    Args:
        host (str): Host to bind to
        port (int): Port to listen on
    
    Returns:
        threading.Thread: Server thread
    """
    server_thread = threading.Thread(
        target=start_local_api,
        args=(host, port, False),
        daemon=True
    )
    server_thread.start()
    print(f"Device Local API started in background on {host}:{port}")
    return server_thread

if __name__ == "__main__":
    # Run standalone for testing
    start_local_api(debug=True)
