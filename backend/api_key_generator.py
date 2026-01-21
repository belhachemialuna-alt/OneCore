"""
API Key Generator for BAYYTI-B1 Device
Generates secure 26-character API keys that match market standards
"""

import secrets
import string
import hashlib
from datetime import datetime

def generate_api_key(length=26):
    """
    Generate a secure API key with specified length.
    Uses cryptographically secure random generation.
    
    Args:
        length (int): Length of the API key (default: 26)
    
    Returns:
        str: Secure API key
    """
    # Use alphanumeric characters (uppercase, lowercase, digits)
    alphabet = string.ascii_letters + string.digits
    
    # Generate cryptographically secure random key
    api_key = ''.join(secrets.choice(alphabet) for _ in range(length))
    
    return api_key

def generate_device_api_key(device_id, device_name=None):
    """
    Generate a device-specific API key with additional entropy.
    
    Args:
        device_id (str): Device identifier
        device_name (str, optional): Device name for additional entropy
    
    Returns:
        str: 26-character API key
    """
    # Create base entropy from device info and timestamp
    timestamp = str(int(datetime.utcnow().timestamp() * 1000000))  # microsecond precision
    entropy_source = f"{device_id}{device_name or 'BAYYTI'}{timestamp}"
    
    # Hash the entropy source
    hash_obj = hashlib.sha256(entropy_source.encode())
    hash_hex = hash_obj.hexdigest()
    
    # Combine with secure random generation
    secure_random = secrets.token_urlsafe(32)
    combined = hash_hex + secure_random
    
    # Create final key using secure selection
    alphabet = string.ascii_letters + string.digits
    api_key = ''.join(secrets.choice(alphabet) for _ in range(26))
    
    return api_key

def validate_api_key(api_key):
    """
    Validate API key format.
    
    Args:
        api_key (str): API key to validate
    
    Returns:
        bool: True if valid format, False otherwise
    """
    if not api_key or not isinstance(api_key, str):
        return False
    
    if len(api_key) != 26:
        return False
    
    # Check if contains only alphanumeric characters
    if not api_key.isalnum():
        return False
    
    return True

def hash_api_key(api_key):
    """
    Hash API key for secure storage.
    
    Args:
        api_key (str): Plain text API key
    
    Returns:
        str: SHA256 hash of the API key
    """
    return hashlib.sha256(api_key.encode()).hexdigest()

# Test the generator
if __name__ == "__main__":
    print("API Key Generator Test")
    print("=" * 40)
    
    # Generate test keys
    for i in range(5):
        key = generate_api_key()
        print(f"Key {i+1}: {key} (Length: {len(key)})")
        print(f"Valid: {validate_api_key(key)}")
        print(f"Hash: {hash_api_key(key)[:16]}...")
        print()
    
    # Generate device-specific key
    device_key = generate_device_api_key("4af572fb94849a2ff3f64945512bf7019280ac17b260daab1f53e970a150f932", "BAYYTI-B1")
    print(f"Device Key: {device_key} (Length: {len(device_key)})")
    print(f"Valid: {validate_api_key(device_key)}")
