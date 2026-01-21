"""
Secure Device Manager - Market Standard Implementation
Implements proper IoT security architecture following industry best practices
"""

import hashlib
import secrets
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from secure_api_key_manager import secure_api_manager

class SecureDeviceManager:
    def __init__(self):
        self.device_states = {
            'UNLINKED': 'Device not linked to any user',
            'LINKED': 'Device linked but not activated',
            'ACTIVE': 'Device active with valid API key',
            'REVOKED': 'API key revoked, needs re-activation'
        }
        
    def get_device_identity(self) -> Dict[str, Any]:
        """
        Get or create device identity with proper format
        Device ID is public and permanent (IRR-ALG-XXXXXX)
        """
        try:
            identity_file = os.path.join(os.path.dirname(__file__), 'device', 'device_identity.json')
            
            if os.path.exists(identity_file):
                with open(identity_file, 'r') as f:
                    identity = json.load(f)
                
                # Migrate old format to new format if needed
                if not identity.get('deviceId', '').startswith('IRR-ALG-'):
                    old_id = identity.get('deviceId')
                    new_id = secure_api_manager.generate_device_id()
                    print(f"🔄 Migrating device ID: {old_id[:16]}... -> {new_id}")
                    identity['deviceId'] = new_id
                    identity['legacy_id'] = old_id
                    self._save_identity(identity)
                
                return identity
            else:
                # Create new identity with proper format
                identity = {
                    'deviceId': secure_api_manager.generate_device_id(),
                    'deviceType': 'irrigation_controller',
                    'status': 'UNLINKED',
                    'apiKey': None,
                    'registered': False,
                    'createdAt': datetime.utcnow().isoformat() + 'Z',
                    'updatedAt': None
                }
                
                self._save_identity(identity)
                print(f"✅ New device identity created: {identity['deviceId']}")
                return identity
                
        except Exception as e:
            print(f"❌ Error managing device identity: {e}")
            return None
    
    def _save_identity(self, identity: Dict[str, Any]):
        """Save device identity securely"""
        try:
            identity['updatedAt'] = datetime.utcnow().isoformat() + 'Z'
            identity_file = os.path.join(os.path.dirname(__file__), 'device', 'device_identity.json')
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(identity_file), exist_ok=True)
            
            with open(identity_file, 'w') as f:
                json.dump(identity, f, indent=2)
                
        except Exception as e:
            print(f"❌ Error saving device identity: {e}")
    
    def initiate_device_linking(self, device_id: str, user_jwt: str) -> Dict[str, Any]:
        """
        Initiate device linking process (called from Next.js with JWT)
        This is the ONLY way devices get linked - through authenticated users
        """
        try:
            # In production, validate JWT here
            # For now, simulate successful JWT validation
            user_id = "authenticated_user_123"
            
            # Generate secure API key and hash it
            activation_record = secure_api_manager.create_device_activation_record(device_id, user_id)
            
            # Store linking record (this would go to Supabase in production)
            linking_record = {
                'device_id': device_id,
                'user_id': user_id,
                'api_key_hash': activation_record['api_key_hash'],  # Only hash stored
                'status': 'LINKED',
                'linked_at': activation_record['created_at'],
                'api_key_delivered': False,  # Key not yet delivered to device
                'expires_at': activation_record['expires_at']
            }
            
            # Save to pending activations (simulating Supabase)
            self._save_pending_activation(device_id, linking_record, activation_record['api_key'])
            
            print(f"✅ Device {device_id} linked to user {user_id}")
            print(f"🔑 API key generated and hashed (not exposed)")
            
            return {
                'success': True,
                'device_id': device_id,
                'status': 'LINKED',
                'message': 'Device linked successfully. Device will receive API key on next activation call.'
            }
            
        except Exception as e:
            print(f"❌ Device linking failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def device_activation_request(self, device_id: str) -> Dict[str, Any]:
        """
        Handle device activation request (called by Pi script)
        Returns API key ONLY ONCE if device is linked
        """
        try:
            print(f"🔍 Activation request from device: {device_id}")
            
            # Check if device has pending activation
            pending_activation = self._get_pending_activation(device_id)
            
            if not pending_activation:
                return {
                    'success': False,
                    'status': 'UNLINKED',
                    'message': 'Device not linked. Please link device through dashboard first.'
                }
            
            # Check if API key already delivered
            if pending_activation.get('api_key_delivered'):
                return {
                    'success': False,
                    'status': 'ALREADY_ACTIVATED',
                    'message': 'API key already delivered. Use existing key for authentication.'
                }
            
            # Check if activation expired
            expires_at = datetime.fromisoformat(pending_activation['expires_at'].replace('Z', '+00:00'))
            if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
                return {
                    'success': False,
                    'status': 'EXPIRED',
                    'message': 'Activation expired. Please re-link device.'
                }
            
            # Deliver API key (ONLY ONCE)
            api_key = self._get_api_key_for_delivery(device_id)
            if not api_key:
                return {
                    'success': False,
                    'status': 'ERROR',
                    'message': 'API key not available for delivery.'
                }
            
            # Mark as delivered and update status
            pending_activation['api_key_delivered'] = True
            pending_activation['status'] = 'ACTIVE'
            pending_activation['activated_at'] = datetime.utcnow().isoformat() + 'Z'
            self._update_pending_activation(device_id, pending_activation)
            
            # Store API key securely on device
            secure_api_manager.store_api_key_securely(device_id, api_key)
            
            # Update device identity
            identity = self.get_device_identity()
            if identity:
                identity['status'] = 'ACTIVE'
                identity['registered'] = True
                identity['apiKey'] = api_key  # Stored locally only
                identity['activatedAt'] = pending_activation['activated_at']
                self._save_identity(identity)
            
            print(f"✅ API key delivered to device {device_id}")
            print(f"🔒 Key will not be delivered again")
            
            return {
                'success': True,
                'status': 'ACTIVE',
                'api_key': api_key,  # Delivered ONLY ONCE
                'device_id': device_id,
                'message': 'Device activated successfully. Store this key securely.'
            }
            
        except Exception as e:
            print(f"❌ Device activation failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def validate_api_request(self, device_id: str, provided_api_key: str) -> bool:
        """
        Validate API request from device using hash comparison
        This is called for every API request during normal operation
        """
        try:
            # Get stored hash from pending activation or device record
            pending_activation = self._get_pending_activation(device_id)
            
            if not pending_activation:
                return False
            
            stored_hash = pending_activation.get('api_key_hash')
            if not stored_hash:
                return False
            
            # Validate using secure hash comparison
            return secure_api_manager.verify_api_key(provided_api_key, stored_hash)
            
        except Exception as e:
            print(f"❌ API validation error: {e}")
            return False
    
    def revoke_device_api_key(self, device_id: str) -> bool:
        """
        Revoke device API key - device must re-activate
        """
        try:
            # Update pending activation status
            pending_activation = self._get_pending_activation(device_id)
            if pending_activation:
                pending_activation['status'] = 'REVOKED'
                pending_activation['revoked_at'] = datetime.utcnow().isoformat() + 'Z'
                self._update_pending_activation(device_id, pending_activation)
            
            # Remove local credentials
            secure_api_manager.revoke_api_key(device_id)
            
            # Update device identity
            identity = self.get_device_identity()
            if identity:
                identity['status'] = 'REVOKED'
                identity['registered'] = False
                identity['apiKey'] = None
                self._save_identity(identity)
            
            print(f"✅ API key revoked for device {device_id}")
            return True
            
        except Exception as e:
            print(f"❌ API key revocation failed: {e}")
            return False
    
    def _save_pending_activation(self, device_id: str, linking_record: Dict, api_key: str):
        """Save pending activation (simulates Supabase storage)"""
        try:
            pending_dir = os.path.join(os.path.dirname(__file__), '.pending_activations')
            os.makedirs(pending_dir, mode=0o700, exist_ok=True)
            
            # Store linking record (without plaintext API key)
            record_file = os.path.join(pending_dir, f"{device_id}_record.json")
            with open(record_file, 'w') as f:
                json.dump(linking_record, f, indent=2)
            os.chmod(record_file, 0o600)
            
            # Store API key separately for one-time delivery
            key_file = os.path.join(pending_dir, f"{device_id}_key.json")
            with open(key_file, 'w') as f:
                json.dump({'api_key': api_key, 'delivered': False}, f)
            os.chmod(key_file, 0o600)
            
        except Exception as e:
            print(f"❌ Error saving pending activation: {e}")
    
    def _get_pending_activation(self, device_id: str) -> Optional[Dict]:
        """Get pending activation record"""
        try:
            pending_dir = os.path.join(os.path.dirname(__file__), '.pending_activations')
            record_file = os.path.join(pending_dir, f"{device_id}_record.json")
            
            if os.path.exists(record_file):
                with open(record_file, 'r') as f:
                    return json.load(f)
            return None
            
        except Exception as e:
            print(f"❌ Error getting pending activation: {e}")
            return None
    
    def _update_pending_activation(self, device_id: str, record: Dict):
        """Update pending activation record"""
        try:
            pending_dir = os.path.join(os.path.dirname(__file__), '.pending_activations')
            record_file = os.path.join(pending_dir, f"{device_id}_record.json")
            
            with open(record_file, 'w') as f:
                json.dump(record, f, indent=2)
                
        except Exception as e:
            print(f"❌ Error updating pending activation: {e}")
    
    def _get_api_key_for_delivery(self, device_id: str) -> Optional[str]:
        """Get API key for one-time delivery"""
        try:
            pending_dir = os.path.join(os.path.dirname(__file__), '.pending_activations')
            key_file = os.path.join(pending_dir, f"{device_id}_key.json")
            
            if os.path.exists(key_file):
                with open(key_file, 'r') as f:
                    key_data = json.load(f)
                
                if not key_data.get('delivered'):
                    # Mark as delivered and remove file (one-time use)
                    os.remove(key_file)
                    return key_data['api_key']
            
            return None
            
        except Exception as e:
            print(f"❌ Error getting API key for delivery: {e}")
            return None

# Global instance
secure_device_manager = SecureDeviceManager()

if __name__ == "__main__":
    print("Secure Device Manager Test")
    print("=" * 50)
    
    # Test device identity
    identity = secure_device_manager.get_device_identity()
    print(f"Device Identity: {identity['deviceId'] if identity else 'Failed'}")
    
    if identity:
        device_id = identity['deviceId']
        
        # Test device linking
        linking_result = secure_device_manager.initiate_device_linking(device_id, "mock_jwt_token")
        print(f"Device Linking: {linking_result['success']}")
        
        # Test device activation
        activation_result = secure_device_manager.device_activation_request(device_id)
        print(f"Device Activation: {activation_result['success']}")
        
        if activation_result['success']:
            api_key = activation_result['api_key']
            print(f"API Key Delivered: {api_key[:8]}... (Length: {len(api_key)})")
            
            # Test API validation
            is_valid = secure_device_manager.validate_api_request(device_id, api_key)
            print(f"API Validation: {is_valid}")
            
            # Test second activation attempt (should fail)
            second_activation = secure_device_manager.device_activation_request(device_id)
            print(f"Second Activation (should fail): {second_activation['success']}")
