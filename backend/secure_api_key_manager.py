"""
Secure API Key Manager for BAYYTI-B1 IoT System
Implements market-standard security practices for API key management
"""

import hashlib
import secrets
import string
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

class SecureAPIKeyManager:
    def __init__(self):
        self.api_key_length = 32  # Industry standard length
        self.hash_algorithm = 'sha256'
        
    def generate_secure_api_key(self) -> str:
        """
        Generate a cryptographically secure API key
        Following industry standards: 32 characters, alphanumeric
        """
        alphabet = string.ascii_letters + string.digits
        api_key = ''.join(secrets.choice(alphabet) for _ in range(self.api_key_length))
        return api_key
    
    def hash_api_key(self, api_key: str) -> str:
        """
        Hash API key using SHA-256
        Never store plaintext API keys - industry best practice
        """
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    def verify_api_key(self, provided_key: str, stored_hash: str) -> bool:
        """
        Verify API key by comparing hashes
        Secure validation without exposing plaintext keys
        """
        provided_hash = self.hash_api_key(provided_key)
        return secrets.compare_digest(provided_hash, stored_hash)
    
    def generate_device_id(self) -> str:
        """
        Generate proper device ID format: IRR-ALG-XXXXXX
        Following the specified format for irrigation controllers
        """
        # Generate 6-digit unique identifier
        unique_id = ''.join(secrets.choice(string.digits) for _ in range(6))
        return f"IRR-ALG-{unique_id}"
    
    def create_device_activation_record(self, device_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Create secure device activation record
        API key generated only once during linking process
        """
        api_key = self.generate_secure_api_key()
        api_key_hash = self.hash_api_key(api_key)
        
        activation_record = {
            "device_id": device_id,
            "api_key": api_key,  # Only returned once, never stored
            "api_key_hash": api_key_hash,  # Stored in database
            "user_id": user_id,
            "status": "linked",  # linked -> active after first use
            "created_at": datetime.utcnow().isoformat() + 'Z',
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat() + 'Z'  # 24h to activate
        }
        
        return activation_record
    
    def store_api_key_securely(self, device_id: str, api_key: str) -> bool:
        """
        Store API key securely on device (local file with proper permissions)
        """
        try:
            secure_storage_path = os.path.join(os.path.dirname(__file__), '.device_credentials')
            
            # Create secure storage directory if it doesn't exist
            os.makedirs(secure_storage_path, mode=0o700, exist_ok=True)
            
            credential_file = os.path.join(secure_storage_path, f"{device_id}.json")
            
            credentials = {
                "device_id": device_id,
                "api_key": api_key,
                "stored_at": datetime.utcnow().isoformat() + 'Z',
                "status": "active"
            }
            
            # Write with restricted permissions (owner only)
            with open(credential_file, 'w') as f:
                json.dump(credentials, f, indent=2)
            
            # Set file permissions to owner read/write only
            os.chmod(credential_file, 0o600)
            
            print(f"✅ API key stored securely for device {device_id}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to store API key securely: {e}")
            return False
    
    def load_device_credentials(self, device_id: str) -> Optional[Dict[str, Any]]:
        """
        Load device credentials from secure storage
        """
        try:
            secure_storage_path = os.path.join(os.path.dirname(__file__), '.device_credentials')
            credential_file = os.path.join(secure_storage_path, f"{device_id}.json")
            
            if os.path.exists(credential_file):
                with open(credential_file, 'r') as f:
                    credentials = json.load(f)
                return credentials
            return None
            
        except Exception as e:
            print(f"❌ Failed to load device credentials: {e}")
            return None
    
    def validate_device_request(self, device_id: str, provided_api_key: str, stored_hash: str) -> bool:
        """
        Validate device API request using secure hash comparison
        """
        if not device_id or not provided_api_key or not stored_hash:
            return False
        
        return self.verify_api_key(provided_api_key, stored_hash)
    
    def revoke_api_key(self, device_id: str) -> bool:
        """
        Revoke API key - device must re-activate
        """
        try:
            secure_storage_path = os.path.join(os.path.dirname(__file__), '.device_credentials')
            credential_file = os.path.join(secure_storage_path, f"{device_id}.json")
            
            if os.path.exists(credential_file):
                os.remove(credential_file)
                print(f"✅ API key revoked for device {device_id}")
                return True
            return False
            
        except Exception as e:
            print(f"❌ Failed to revoke API key: {e}")
            return False

# Global instance
secure_api_manager = SecureAPIKeyManager()

if __name__ == "__main__":
    print("Secure API Key Manager Test")
    print("=" * 50)
    
    # Test API key generation
    api_key = secure_api_manager.generate_secure_api_key()
    print(f"Generated API Key: {api_key} (Length: {len(api_key)})")
    
    # Test hashing
    api_hash = secure_api_manager.hash_api_key(api_key)
    print(f"API Key Hash: {api_hash[:16]}...")
    
    # Test verification
    is_valid = secure_api_manager.verify_api_key(api_key, api_hash)
    print(f"Verification: {is_valid}")
    
    # Test device ID generation
    device_id = secure_api_manager.generate_device_id()
    print(f"Device ID: {device_id}")
    
    # Test activation record
    activation = secure_api_manager.create_device_activation_record(device_id, "user123")
    print(f"Activation Record Created: {activation['status']}")
    
    # Test secure storage
    success = secure_api_manager.store_api_key_securely(device_id, api_key)
    print(f"Secure Storage: {success}")
    
    # Test credential loading
    credentials = secure_api_manager.load_device_credentials(device_id)
    print(f"Loaded Credentials: {credentials is not None}")
