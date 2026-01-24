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
    Uses MAC address, system info, machine type, and hardware-specific IDs for uniqueness.
    Works on Windows, Linux, and Raspberry Pi.
    
    Returns:
        str: SHA256 hash representing the device ID
    """
    identifiers = []
    
    # 1. MAC address (unique per network interface)
    mac = uuid.getnode()
    identifiers.append(str(mac))
    
    # 2. System information
    system = platform.system()
    machine = platform.machine()
    node = platform.node()
    identifiers.extend([system, machine, node])
    
    # 3. Raspberry Pi CPU Serial (if available)
    try:
        with open('/proc/cpuinfo', 'r') as f:
            for line in f:
                if line.startswith('Serial'):
                    serial = line.split(':')[1].strip()
                    identifiers.append(serial)
                    break
    except (FileNotFoundError, IOError, PermissionError):
        pass  # Not on Raspberry Pi or no access
    
    # 4. Machine ID (Linux/systemd)
    try:
        with open('/etc/machine-id', 'r') as f:
            machine_id = f.read().strip()
            identifiers.append(machine_id)
    except (FileNotFoundError, IOError, PermissionError):
        pass  # Not available on this system
    
    # 5. Windows Product ID (if on Windows)
    if system == 'Windows':
        try:
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion")
            product_id, _ = winreg.QueryValueEx(key, "ProductId")
            identifiers.append(product_id)
            winreg.CloseKey(key)
        except:
            pass  # Registry access failed
    
    # Combine all unique identifiers
    raw = '|'.join(identifiers)
    
    # Generate SHA256 hash for consistent format
    device_id = hashlib.sha256(raw.encode()).hexdigest()
    
    return device_id

def get_device_identity():
    """
    Get or create device identity.
    CRITICAL: Device ID is ALWAYS regenerated based on current hardware.
    This ensures each physical device gets a unique ID.
    
    Returns:
        dict: Device identity containing deviceId, registered status, and apiKey
    """
    # ALWAYS generate device ID based on current hardware
    current_hardware_id = generate_device_id()
    
    # Check if identity file exists
    if os.path.exists(DEVICE_FILE):
        try:
            with open(DEVICE_FILE, "r") as f:
                identity = json.load(f)
                
                # Check if device ID matches current hardware
                stored_id = identity.get("deviceId")
                
                if stored_id != current_hardware_id:
                    # Hardware changed or old static ID detected
                    print(f"⚠️  Device ID mismatch detected!")
                    print(f"   Stored ID:  {stored_id[:32]}...")
                    print(f"   Hardware ID: {current_hardware_id[:32]}...")
                    print(f"   Regenerating device ID based on current hardware...")
                    
                    # Update to hardware-based ID
                    identity["deviceId"] = current_hardware_id
                    identity["updatedAt"] = datetime.utcnow().isoformat()
                    
                    # Save updated identity
                    with open(DEVICE_FILE, "w") as f:
                        json.dump(identity, f, indent=2)
                    
                    print(f"✅ Device ID updated to hardware-based ID")
                
                return identity
                
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error reading device identity file: {e}")
            # Continue to create new identity
    
    # Create new identity with hardware-based ID
    from datetime import datetime
    identity = {
        "deviceId": current_hardware_id,
        "registered": False,
        "apiKey": None,
        "deviceName": None,
        "ownerId": None,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    # Save identity to file
    try:
        with open(DEVICE_FILE, "w") as f:
            json.dump(identity, f, indent=2)
        print(f"✅ New device identity created: {identity['deviceId'][:32]}...")
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
