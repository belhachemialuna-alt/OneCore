"""
Device Pairing Local Server
Provides a local HTTP endpoint for device pairing with VPS.
This server exposes the device ID for HTML-based pairing.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from device_identity import get_device_identity, update_device_identity, is_device_registered
import threading

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests for pairing

@app.route("/device-id", methods=["GET"])
def get_device_id():
    """
    Expose device ID for pairing.
    Used by HTML pairing interface to retrieve device ID.
    
    Returns:
        JSON: Device ID and registration status
    """
    identity = get_device_identity()
    
    return jsonify({
        "success": True,
        "deviceId": identity["deviceId"],
        "registered": identity["registered"],
        "deviceName": identity.get("deviceName"),
        "timestamp": identity.get("updatedAt")
    })

@app.route("/device-status", methods=["GET"])
def get_device_status():
    """
    Get detailed device status including registration info.
    
    Returns:
        JSON: Complete device status
    """
    identity = get_device_identity()
    
    return jsonify({
        "success": True,
        "deviceId": identity["deviceId"],
        "registered": identity["registered"],
        "hasApiKey": identity.get("apiKey") is not None,
        "deviceName": identity.get("deviceName"),
        "ownerId": identity.get("ownerId"),
        "createdAt": identity.get("createdAt"),
        "updatedAt": identity.get("updatedAt")
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
    identity = update_device_identity(
        api_key=api_key,
        registered=True,
        device_name=device_name,
        owner_id=owner_id
    )
    
    return jsonify({
        "success": True,
        "message": "Device registered successfully",
        "deviceId": identity["deviceId"],
        "registered": identity["registered"]
    })

@app.route("/device-unregister", methods=["POST"])
def unregister_device():
    """
    Unregister device from VPS (for re-pairing).
    
    Returns:
        JSON: Success status
    """
    identity = update_device_identity(
        api_key=None,
        registered=False,
        device_name=None,
        owner_id=None
    )
    
    return jsonify({
        "success": True,
        "message": "Device unregistered successfully",
        "deviceId": identity["deviceId"]
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
        "service": "Device Pairing Server"
    })

def start_pairing_server(host="0.0.0.0", port=5001, debug=False):
    """
    Start the device pairing server.
    
    Args:
        host (str): Host to bind to (default: 0.0.0.0 for all interfaces)
        port (int): Port to listen on (default: 5001)
        debug (bool): Enable debug mode
    """
    print(f"Starting Device Pairing Server on {host}:{port}")
    app.run(host=host, port=port, debug=debug, threaded=True)

def start_pairing_server_background(host="0.0.0.0", port=5001):
    """
    Start the device pairing server in a background thread.
    
    Args:
        host (str): Host to bind to
        port (int): Port to listen on
    
    Returns:
        threading.Thread: Server thread
    """
    server_thread = threading.Thread(
        target=start_pairing_server,
        args=(host, port, False),
        daemon=True
    )
    server_thread.start()
    print(f"Device Pairing Server started in background on {host}:{port}")
    return server_thread

if __name__ == "__main__":
    # Run standalone for testing
    start_pairing_server(debug=True)
