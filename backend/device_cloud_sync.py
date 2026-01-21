"""
Device Cloud Synchronization Module
Handles proper linking between BAYYTI-B1 device and Next.js cloud platform
"""

import requests
import json
import os
from datetime import datetime
from api_key_generator import generate_device_api_key

class DeviceCloudSync:
    def __init__(self):
        self.cloud_url = "http://localhost:3000"
        self.device_id = None
        self.load_device_id()
    
    def load_device_id(self):
        """Load device ID from identity system"""
        try:
            import sys
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'device'))
            from device import identity as device_identity
            if device_identity:
                self.device_id = device_identity.get_device_id()
        except Exception as e:
            print(f"⚠️ Failed to load device ID: {e}")
    
    def register_with_cloud(self, device_name="BAYYTI-B1", user_session_token=None):
        """
        Register device with cloud platform
        This creates the device record in Supabase
        """
        if not self.device_id:
            print("❌ No device ID available for registration")
            return False
        
        try:
            # Prepare registration data
            registration_data = {
                "deviceId": self.device_id,
                "deviceName": device_name
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            # Add session token if provided
            if user_session_token:
                headers["x-session-token"] = user_session_token
            
            # Register with cloud platform
            response = requests.post(
                f"{self.cloud_url}/api/device/register",
                json=registration_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Device registered with cloud platform")
                    print(f"   Device ID: {result.get('deviceId')}")
                    print(f"   Status: {result.get('status')}")
                    return True
                else:
                    print(f"⚠️ Cloud registration failed: {result.get('error')}")
                    return False
            else:
                print(f"⚠️ Cloud registration HTTP error: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Network error during cloud registration: {e}")
            return False
        except Exception as e:
            print(f"⚠️ Error during cloud registration: {e}")
            return False
    
    def activate_device_with_cloud(self):
        """
        Activate device and sync with cloud platform
        This generates API key and stores it in both local and cloud
        """
        if not self.device_id:
            print("❌ No device ID available for activation")
            return False
        
        try:
            # Generate proper 26-character API key
            api_key = generate_device_api_key(self.device_id, "BAYYTI-B1")
            
            # Save activation locally
            activation_config = {
                "deviceId": self.device_id,
                "apiKey": api_key,
                "deviceName": "BAYYTI-B1",
                "ownerId": "cloud-sync",
                "activated": True,
                "activatedAt": datetime.utcnow().isoformat() + 'Z',
                "cloudEndpoint": self.cloud_url
            }
            
            config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
            with open(config_path, 'w') as f:
                json.dump(activation_config, f, indent=2)
            
            # Update device identity
            try:
                import sys
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'device'))
                from device import identity as device_identity
                if device_identity:
                    device_identity.update_registration_status(True, api_key, "BAYYTI-B1", "cloud-sync")
                    print(f"✅ Device identity updated locally")
            except Exception as e:
                print(f"⚠️ Failed to update device identity: {e}")
            
            # Try to sync with Supabase
            try:
                from supabase_integration import supabase_integration
                supabase_success = supabase_integration.store_device_activation(
                    self.device_id, api_key, "BAYYTI-B1", "cloud-sync", activation_config['activatedAt']
                )
                if supabase_success:
                    print(f"✅ Device activation synced with Supabase")
                else:
                    print(f"⚠️ Supabase sync failed - device activated locally only")
            except Exception as e:
                print(f"⚠️ Supabase sync error: {e}")
            
            print(f"✅ Device activation completed!")
            print(f"   Device ID: {self.device_id}")
            print(f"   API Key: {api_key}")
            print(f"   Length: {len(api_key)} characters")
            
            return {
                "success": True,
                "deviceId": self.device_id,
                "apiKey": api_key,
                "activated": True,
                "message": "Device activated successfully"
            }
            
        except Exception as e:
            print(f"❌ Device activation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_cloud_connection(self):
        """Test connection to cloud platform"""
        try:
            response = requests.get(f"{self.cloud_url}", timeout=5)
            if response.status_code == 200:
                print(f"✅ Cloud platform accessible at {self.cloud_url}")
                return True
            else:
                print(f"⚠️ Cloud platform returned status: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Cloud platform not accessible: {e}")
            return False
    
    def get_device_status(self):
        """Get current device status"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    activation_data = json.load(f)
                return activation_data
            else:
                return {"activated": False, "message": "Device not activated"}
        except Exception as e:
            return {"error": str(e)}

# Global instance
device_cloud_sync = DeviceCloudSync()

if __name__ == "__main__":
    print("Device Cloud Sync Test")
    print("=" * 40)
    
    # Test cloud connection
    device_cloud_sync.test_cloud_connection()
    
    # Show current status
    status = device_cloud_sync.get_device_status()
    print(f"Current Status: {status}")
    
    # Test activation
    result = device_cloud_sync.activate_device_with_cloud()
    print(f"Activation Result: {result}")
