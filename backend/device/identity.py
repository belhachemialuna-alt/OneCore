"""
Device Identity Module
Generates and manages stable device ID and API key.
This is the source of truth for device identification.

CRITICAL: Device ID never changes after first generation.
"""

import uuid
import hashlib
import platform
import json
import os
from datetime import datetime

# Device identity file location
DEVICE_FILE = os.path.join(os.path.dirname(__file__), "..", "device_identity.json")

def generate_device_id():
    """
    Generate a unique, stable device ID based on hardware characteristics.
    
    Uses:
    - MAC address (uuid.getnode())
    - System type (platform.system())
    - Machine architecture (platform.machine())
    
    Returns:
        str: SHA256 hash of combined hardware identifiers
    """
    # Get hardware identifiers
    mac = uuid.getnode()
    system = platform.system()
    machine = platform.machine()
    
    # Combine into unique string
    raw = f"{mac}{system}{machine}"
    
    # Generate SHA256 hash for consistent format
    device_id = hashlib.sha256(raw.encode()).hexdigest()
    
    return device_id

def load_identity():
    """
    Load device identity from file.
    If file doesn't exist, create new identity.
    
    Returns:
        dict: Device identity containing deviceId, apiKey, registered status
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
            print(f"Error reading device identity: {e}")
            # Continue to create new identity
    
    # Create new identity
    identity = {
        "deviceId": generate_device_id(),
        "apiKey": None,
        "registered": False,
        "deviceName": None,
        "ownerId": None,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": None
    }
    
    # Save to file
    save_identity(identity)
    print(f"New device identity created: {identity['deviceId']}")
    
    return identity

def save_identity(identity):
    """
    Save device identity to file.
    
    Args:
        identity (dict): Device identity to save
    """
    try:
        # Update timestamp
        identity["updatedAt"] = datetime.utcnow().isoformat()
        
        # Write to file
        with open(DEVICE_FILE, "w") as f:
            json.dump(identity, f, indent=2)
    except IOError as e:
        print(f"Error saving device identity: {e}")

def update_identity(api_key=None, registered=None, device_name=None, owner_id=None):
    """
    Update device identity with new information.
    
    Args:
        api_key (str, optional): API key from VPS
        registered (bool, optional): Registration status
        device_name (str, optional): Device name
        owner_id (str, optional): Owner user ID
    
    Returns:
        dict: Updated identity
    """
    identity = load_identity()
    
    # Update fields if provided
    if api_key is not None:
        identity["apiKey"] = api_key
    if registered is not None:
        identity["registered"] = registered
    if device_name is not None:
        identity["deviceName"] = device_name
    if owner_id is not None:
        identity["ownerId"] = owner_id
    
    # Save updated identity
    save_identity(identity)
    
    return identity

def is_registered():
    """
    Check if device is registered with VPS.
    
    Returns:
        bool: True if registered with API key, False otherwise
    """
    identity = load_identity()
    return identity.get("registered", False) and identity.get("apiKey") is not None

def get_device_id():
    """
    Get device ID.
    
    Returns:
        str: Device ID
    """
    identity = load_identity()
    return identity.get("deviceId")

def get_api_key():
    """
    Get device API key for VPS authentication.
    
    Returns:
        str or None: API key if registered, None otherwise
    """
    identity = load_identity()
    return identity.get("apiKey")

def reset_identity():
    """
    Reset device identity (for testing or re-registration).
    WARNING: This will require re-pairing with VPS.
    
    Returns:
        dict: New device identity
    """
    if os.path.exists(DEVICE_FILE):
        os.remove(DEVICE_FILE)
        print("Device identity reset")
    return load_identity()


# Auto-load identity on module import
_identity = load_identity()
print(f"Device ID: {_identity['deviceId']}")
print(f"Registered: {_identity['registered']}")
