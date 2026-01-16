"""
Device Identity Management Module
Generates and persists a stable device ID for VPS cloud integration.
The device ID is generated once and persists across reboots.
"""

import uuid
import hashlib
import platform
import os
import json
from pathlib import Path

# Device identity file location
DEVICE_FILE = os.path.join(os.path.dirname(__file__), "device_identity.json")

def generate_device_id():
    """
    Generate a unique device ID based on hardware characteristics.
    Uses MAC address, system info, and machine type for uniqueness.
    
    Returns:
        str: SHA256 hash representing the device ID
    """
    # Get MAC address (unique per network interface)
    mac = uuid.getnode()
    
    # Get system information
    system = platform.system()
    machine = platform.machine()
    node = platform.node()
    
    # Combine all unique identifiers
    raw = f"{mac}{system}{machine}{node}"
    
    # Generate SHA256 hash for consistent format
    device_id = hashlib.sha256(raw.encode()).hexdigest()
    
    return device_id

def get_device_identity():
    """
    Get or create device identity.
    If identity file exists, load it. Otherwise, create new identity.
    
    Returns:
        dict: Device identity containing deviceId, registered status, and apiKey
    """
    # Check if identity file exists
    if os.path.exists(DEVICE_FILE):
        try:
            with open(DEVICE_FILE, "r") as f:
                identity = json.load(f)
                # Validate required fields
                if "deviceId" in identity and "registered" in identity:
                    return identity
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error reading device identity file: {e}")
            # Continue to create new identity
    
    # Create new identity
    identity = {
        "deviceId": generate_device_id(),
        "registered": False,
        "apiKey": None,
        "deviceName": None,
        "ownerId": None,
        "createdAt": None
    }
    
    # Save identity to file
    try:
        with open(DEVICE_FILE, "w") as f:
            json.dump(identity, f, indent=2)
        print(f"New device identity created: {identity['deviceId']}")
    except IOError as e:
        print(f"Error saving device identity: {e}")
    
    return identity

def update_device_identity(api_key=None, registered=None, device_name=None, owner_id=None):
    """
    Update device identity with registration information.
    
    Args:
        api_key (str, optional): API key from VPS registration
        registered (bool, optional): Registration status
        device_name (str, optional): Device name from registration
        owner_id (str, optional): Owner user ID from VPS
    
    Returns:
        dict: Updated device identity
    """
    identity = get_device_identity()
    
    # Update fields if provided
    if api_key is not None:
        identity["apiKey"] = api_key
    if registered is not None:
        identity["registered"] = registered
    if device_name is not None:
        identity["deviceName"] = device_name
    if owner_id is not None:
        identity["ownerId"] = owner_id
    
    # Update timestamp
    from datetime import datetime
    identity["updatedAt"] = datetime.utcnow().isoformat()
    
    # Save updated identity
    try:
        with open(DEVICE_FILE, "w") as f:
            json.dump(identity, f, indent=2)
        print(f"Device identity updated: registered={identity['registered']}")
    except IOError as e:
        print(f"Error updating device identity: {e}")
    
    return identity

def is_device_registered():
    """
    Check if device is registered with VPS.
    
    Returns:
        bool: True if device is registered, False otherwise
    """
    identity = get_device_identity()
    return identity.get("registered", False) and identity.get("apiKey") is not None

def get_device_api_key():
    """
    Get device API key for VPS authentication.
    
    Returns:
        str or None: API key if registered, None otherwise
    """
    identity = get_device_identity()
    return identity.get("apiKey")

def reset_device_identity():
    """
    Reset device identity (for testing or re-registration).
    WARNING: This will require re-pairing with VPS.
    
    Returns:
        dict: New device identity
    """
    if os.path.exists(DEVICE_FILE):
        os.remove(DEVICE_FILE)
    return get_device_identity()
