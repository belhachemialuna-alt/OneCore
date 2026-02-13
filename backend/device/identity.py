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
    Generate a unique, stable device ID based on enhanced hardware characteristics.
    Uses comprehensive hardware fingerprinting to ensure uniqueness between devices.
    
    Returns:
        str: SHA256 hash of combined hardware identifiers
    """
    # Import enhanced fingerprinting
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    
    try:
        from enhanced_hardware_fingerprint import get_enhanced_hardware_fingerprint
        return get_enhanced_hardware_fingerprint()
    except ImportError:
        # Fallback to original method if enhanced module not available
        print("⚠️ Enhanced fingerprinting not available, using fallback method")
        return _generate_device_id_fallback()

def _generate_device_id_fallback():
    """
    Fallback device ID generation method (original implementation).
    Used only if enhanced fingerprinting module is not available.
    
    Returns:
        str: SHA256 hash of basic hardware identifiers
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
    if platform.system() == 'Windows':
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

def load_identity():
    """
    Load device identity from file.
    CRITICAL: Always validates device ID against current hardware.
    If mismatch detected, regenerates ID based on hardware.
    
    Returns:
        dict: Device identity containing deviceId, apiKey, registered status
    """
    # ALWAYS generate device ID based on current hardware
    current_hardware_id = generate_device_id()
    
    # Check if identity file exists
    if os.path.exists(DEVICE_FILE):
        try:
            with open(DEVICE_FILE, "r") as f:
                identity = json.load(f)
                
                # Validate device ID matches current hardware
                stored_id = identity.get("deviceId")
                
                if stored_id != current_hardware_id:
                    # Hardware changed or old static ID detected
                    print(f"⚠️  Device ID mismatch detected!")
                    print(f"   Stored ID:  {stored_id[:32] if stored_id else 'None'}...")
                    print(f"   Hardware ID: {current_hardware_id[:32]}...")
                    print(f"   Regenerating device ID based on current hardware...")
                    
                    # Update to hardware-based ID
                    identity["deviceId"] = current_hardware_id
                    identity["updatedAt"] = datetime.utcnow().isoformat()
                    
                    # Save updated identity
                    save_identity(identity)
                    print(f"✅ Device ID updated to hardware-based ID")
                
                return identity
                
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error reading device identity: {e}")
            # Continue to create new identity
    
    # Create new identity with hardware-based ID
    identity = {
        "deviceId": current_hardware_id,
        "apiKey": None,
        "registered": False,
        "deviceName": None,
        "ownerId": None,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": None
    }
    
    # Save to file
    save_identity(identity)
    print(f"✅ New device identity created: {identity['deviceId'][:32]}...")
    
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

def update_registration_status(registered, api_key=None, device_name=None, owner_id=None):
    """
    Update device registration status and related information.
    This method is called by the device activation system.
    
    Args:
        registered (bool): Registration status
        api_key (str, optional): API key from activation
        device_name (str, optional): Device name
        owner_id (str, optional): Owner user ID
    
    Returns:
        dict: Updated identity
    """
    return update_identity(
        api_key=api_key,
        registered=registered,
        device_name=device_name,
        owner_id=owner_id
    )

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
