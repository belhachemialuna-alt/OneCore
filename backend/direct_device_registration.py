"""
Direct Device Registration
Handles device registration without requiring user authentication
Creates device records directly in Supabase for irrigation system linking
"""

import requests
import json
import os
from datetime import datetime
from api_key_generator import generate_device_api_key

def register_device_directly():
    """
    Register device directly with cloud platform without user authentication
    This creates the device record in Supabase for irrigation system linking
    """
    try:
        # Load device ID
        import sys
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'device'))
        from device import identity as device_identity
        
        if not device_identity:
            print("❌ Device identity module not available")
            return False
        
        device_id = device_identity.get_device_id()
        if not device_id:
            print("❌ No device ID available")
            return False
        
        # Generate proper 26-character API key
        api_key = generate_device_api_key(device_id, "BAYYTI-B1")
        
        print(f"🔧 Registering device directly...")
        print(f"   Device ID: {device_id}")
        print(f"   API Key: {api_key} (Length: {len(api_key)})")
        
        # Create device activation locally
        activation_config = {
            "deviceId": device_id,
            "apiKey": api_key,
            "deviceName": "BAYYTI-B1",
            "ownerId": "irrigation-system",
            "activated": True,
            "activatedAt": datetime.now().isoformat() + 'Z',
            "cloudEndpoint": "http://localhost:3000"
        }
        
        # Save activation config
        config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
        with open(config_path, 'w') as f:
            json.dump(activation_config, f, indent=2)
        
        # Update device identity
        device_identity.update_registration_status(True, api_key, "BAYYTI-B1", "irrigation-system")
        
        print(f"✅ Device registered locally")
        
        # Try to register with cloud platform using environment variables
        try:
            # Load environment variables for Supabase
            from dotenv import load_dotenv
            load_dotenv()
            
            supabase_url = os.getenv('SUPABASE_URL', 'https://zossejntvbzrymetqd.supabase.co')
            supabase_key = os.getenv('SUPABASE_SERVICE_KEY')
            
            if supabase_key and 'sb_secret_' in supabase_key:
                headers = {
                    'Content-Type': 'application/json',
                    'apikey': supabase_key,
                    'Authorization': f'Bearer {supabase_key}',
                    'Prefer': 'return=representation'
                }
                
                # Create device record directly in Supabase
                device_data = {
                    'serial_number': device_id,
                    'name': 'BAYYTI-B1',
                    'device_type': 'irrigation_controller',
                    'status': 'active',
                    'api_key_hash': api_key,  # Store the actual key for now
                    'has_activated': True,
                    'linked_at': activation_config['activatedAt'],
                    'last_activated': activation_config['activatedAt'],
                    'last_seen': activation_config['activatedAt'],
                    'user_id': None  # No specific user - system device
                }
                
                # Insert into devices table
                devices_url = f"{supabase_url}/rest/v1/devices"
                response = requests.post(devices_url, json=device_data, headers=headers, timeout=10)
                
                if response.status_code in [200, 201]:
                    print(f"✅ Device registered in Supabase devices table")
                    
                    # Also insert into device_api_keys table
                    device_response = response.json()
                    if device_response and len(device_response) > 0:
                        device_uuid = device_response[0].get('id')
                        
                        api_key_data = {
                            'device_id': device_uuid,
                            'api_key_hash': api_key,
                            'created_at': activation_config['activatedAt'],
                            'is_active': True
                        }
                        
                        api_keys_url = f"{supabase_url}/rest/v1/device_api_keys"
                        api_response = requests.post(api_keys_url, json=api_key_data, headers=headers, timeout=10)
                        
                        if api_response.status_code in [200, 201]:
                            print(f"✅ API key stored in Supabase device_api_keys table")
                        else:
                            print(f"⚠️ Failed to store API key: {api_response.status_code}")
                    
                    return True
                else:
                    print(f"⚠️ Failed to register in Supabase: {response.status_code}")
                    print(f"   Response: {response.text}")
                    return False
            else:
                print(f"⚠️ Supabase service key not configured properly")
                return False
                
        except Exception as e:
            print(f"⚠️ Supabase registration failed: {e}")
            print(f"   Device registered locally only")
            return False
        
    except Exception as e:
        print(f"❌ Device registration failed: {e}")
        return False

def check_device_status():
    """Check current device registration status"""
    try:
        config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                activation_data = json.load(f)
            
            print(f"📊 Device Status:")
            print(f"   Device ID: {activation_data.get('deviceId', 'Unknown')}")
            print(f"   Name: {activation_data.get('deviceName', 'Unknown')}")
            print(f"   API Key: {activation_data.get('apiKey', 'None')}")
            print(f"   Activated: {activation_data.get('activated', False)}")
            print(f"   Activated At: {activation_data.get('activatedAt', 'Never')}")
            
            return activation_data
        else:
            print(f"⚠️ No device activation found")
            return None
    except Exception as e:
        print(f"❌ Error checking device status: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("BAYYTI-B1 Direct Device Registration")
    print("=" * 60)
    
    # Check current status
    current_status = check_device_status()
    
    if not current_status or not current_status.get('activated'):
        print(f"\n🔧 Starting device registration...")
        success = register_device_directly()
        
        if success:
            print(f"\n✅ Device registration completed successfully!")
        else:
            print(f"\n⚠️ Device registration completed with warnings")
    else:
        print(f"\n✅ Device already registered and activated")
    
    print(f"\n📋 Final Status:")
    check_device_status()
    
    print(f"\n🌐 Access Points:")
    print(f"   Local API Keys: http://localhost:5000/api-keys")
    print(f"   Cloud Platform: http://localhost:3000/api-keys")
    print("=" * 60)
