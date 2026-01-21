"""
Supabase Investigation Script
Debug and investigate why API keys are not being stored in Supabase
Verify database connectivity and data integrity
"""

import requests
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from secure_api_key_manager import secure_api_manager

class SupabaseInvestigator:
    def __init__(self):
        load_dotenv()
        self.supabase_url = os.getenv('SUPABASE_URL', 'https://zossejntvbzrymetqd.supabase.co')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvc3NlanR2YnpyeW1ldHFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ3NzY5OSwiZXhwIjoyMDUzMDUzNjk5fQ.sb_secret_lp71y4pm70TmbXqoFI967Q_46mgasby')
        
        self.headers = {
            'Content-Type': 'application/json',
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Prefer': 'return=representation'
        }
        
        print(f"🔍 Investigating Supabase: {self.supabase_url}")
        print(f"🔑 Using Service Key: {self.supabase_key[:20]}...")
    
    def test_connection(self):
        """Test basic connectivity to Supabase"""
        try:
            print("\n" + "="*60)
            print("🌐 TESTING SUPABASE CONNECTION")
            print("="*60)
            
            # Test basic connection
            response = requests.get(f"{self.supabase_url}/rest/v1/", headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                print("✅ Supabase connection: SUCCESS")
                return True
            else:
                print(f"❌ Supabase connection failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def check_tables_exist(self):
        """Check if required tables exist"""
        try:
            print("\n" + "="*60)
            print("📊 CHECKING DATABASE TABLES")
            print("="*60)
            
            tables_to_check = ['devices', 'device_api_keys']
            
            for table in tables_to_check:
                try:
                    response = requests.get(
                        f"{self.supabase_url}/rest/v1/{table}?limit=1",
                        headers=self.headers,
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        print(f"✅ Table '{table}': EXISTS")
                    else:
                        print(f"❌ Table '{table}': ERROR {response.status_code}")
                        print(f"   Response: {response.text}")
                        
                except Exception as e:
                    print(f"❌ Table '{table}': ERROR - {e}")
            
            return True
            
        except Exception as e:
            print(f"❌ Table check error: {e}")
            return False
    
    def investigate_devices_table(self):
        """Investigate devices table content"""
        try:
            print("\n" + "="*60)
            print("🔍 INVESTIGATING DEVICES TABLE")
            print("="*60)
            
            response = requests.get(
                f"{self.supabase_url}/rest/v1/devices",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                devices = response.json()
                print(f"📊 Total devices found: {len(devices)}")
                
                if devices:
                    for i, device in enumerate(devices):
                        print(f"\n📱 Device {i+1}:")
                        print(f"   ID: {device.get('id', 'N/A')}")
                        print(f"   Serial: {device.get('serial_number', 'N/A')}")
                        print(f"   Name: {device.get('name', 'N/A')}")
                        print(f"   Status: {device.get('status', 'N/A')}")
                        print(f"   Has API Key Hash: {'Yes' if device.get('api_key_hash') else 'No'}")
                        print(f"   User ID: {device.get('user_id', 'N/A')}")
                        print(f"   Created: {device.get('created_at', 'N/A')}")
                else:
                    print("⚠️ No devices found in database")
                    
                return devices
            else:
                print(f"❌ Failed to query devices: {response.status_code}")
                print(f"   Response: {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ Devices investigation error: {e}")
            return []
    
    def investigate_api_keys_table(self):
        """Investigate device_api_keys table content"""
        try:
            print("\n" + "="*60)
            print("🔍 INVESTIGATING DEVICE_API_KEYS TABLE")
            print("="*60)
            
            response = requests.get(
                f"{self.supabase_url}/rest/v1/device_api_keys",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                api_keys = response.json()
                print(f"🔑 Total API keys found: {len(api_keys)}")
                
                if api_keys:
                    for i, key in enumerate(api_keys):
                        print(f"\n🔐 API Key {i+1}:")
                        print(f"   ID: {key.get('id', 'N/A')}")
                        print(f"   Device ID: {key.get('device_id', 'N/A')}")
                        print(f"   Has Hash: {'Yes' if key.get('api_key_hash') else 'No'}")
                        print(f"   Active: {key.get('is_active', 'N/A')}")
                        print(f"   Created: {key.get('created_at', 'N/A')}")
                else:
                    print("⚠️ No API keys found in database")
                    
                return api_keys
            else:
                print(f"❌ Failed to query API keys: {response.status_code}")
                print(f"   Response: {response.text}")
                return []
                
        except Exception as e:
            print(f"❌ API keys investigation error: {e}")
            return []
    
    def test_insert_device(self):
        """Test inserting a device record"""
        try:
            print("\n" + "="*60)
            print("🧪 TESTING DEVICE INSERT")
            print("="*60)
            
            # Generate test device
            device_id = secure_api_manager.generate_device_id()
            activation_record = secure_api_manager.create_device_activation_record(device_id)
            
            device_data = {
                'serial_number': device_id,
                'name': 'TEST-BAYYTI-B1',
                'device_type': 'irrigation_controller',
                'status': 'linked',
                'api_key_hash': activation_record['api_key_hash'],
                'has_activated': True,
                'linked_at': activation_record['created_at'],
                'last_activated': activation_record['created_at'],
                'last_seen': activation_record['created_at'],
                'user_id': None
            }
            
            print(f"📝 Inserting test device: {device_id}")
            
            response = requests.post(
                f"{self.supabase_url}/rest/v1/devices",
                json=device_data,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                print("✅ Device insert: SUCCESS")
                print(f"   Device UUID: {result[0].get('id') if result else 'N/A'}")
                
                # Test API key insert
                if result:
                    device_uuid = result[0]['id']
                    api_key_data = {
                        'device_id': device_uuid,
                        'api_key_hash': activation_record['api_key_hash'],
                        'created_at': activation_record['created_at'],
                        'is_active': True
                    }
                    
                    api_response = requests.post(
                        f"{self.supabase_url}/rest/v1/device_api_keys",
                        json=api_key_data,
                        headers=self.headers,
                        timeout=10
                    )
                    
                    if api_response.status_code in [200, 201]:
                        print("✅ API key insert: SUCCESS")
                    else:
                        print(f"❌ API key insert failed: {api_response.status_code}")
                        print(f"   Response: {api_response.text}")
                
                return True
            else:
                print(f"❌ Device insert failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Insert test error: {e}")
            return False
    
    def check_pi_communication_readiness(self):
        """Check if Pi script is ready for communication"""
        try:
            print("\n" + "="*60)
            print("🤖 CHECKING PI SCRIPT COMMUNICATION READINESS")
            print("="*60)
            
            # Check local device server
            try:
                health_response = requests.get("http://localhost:5000/api/health", timeout=5)
                if health_response.status_code == 200:
                    print("✅ Local device server: ONLINE")
                else:
                    print(f"⚠️ Local device server: HTTP {health_response.status_code}")
            except Exception as e:
                print(f"❌ Local device server: OFFLINE - {e}")
            
            # Check device activation endpoint
            try:
                status_response = requests.get("http://localhost:5000/api/device/activation-status", timeout=5)
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    print("✅ Device activation endpoint: WORKING")
                    print(f"   Device activated: {status_data.get('activated', False)}")
                    print(f"   Has API key: {status_data.get('hasApiKey', False)}")
                else:
                    print(f"⚠️ Device activation endpoint: HTTP {status_response.status_code}")
            except Exception as e:
                print(f"❌ Device activation endpoint: ERROR - {e}")
            
            # Check API keys endpoint
            try:
                keys_response = requests.get("http://localhost:5000/api/device/api-keys", timeout=5)
                if keys_response.status_code == 200:
                    keys_data = keys_response.json()
                    print("✅ API keys endpoint: WORKING")
                    print(f"   API keys count: {keys_data.get('count', 0)}")
                else:
                    print(f"⚠️ API keys endpoint: HTTP {keys_response.status_code}")
            except Exception as e:
                print(f"❌ API keys endpoint: ERROR - {e}")
            
            # Check if device has proper credentials
            try:
                config_path = os.path.join(os.path.dirname(__file__), 'device_activation.json')
                if os.path.exists(config_path):
                    with open(config_path, 'r') as f:
                        activation_data = json.load(f)
                    
                    print("✅ Device credentials file: EXISTS")
                    print(f"   Device ID: {activation_data.get('deviceId', 'N/A')}")
                    print(f"   Has API key: {'Yes' if activation_data.get('apiKey') else 'No'}")
                    print(f"   Activated: {activation_data.get('activated', False)}")
                    
                    # Verify API key format
                    api_key = activation_data.get('apiKey')
                    if api_key:
                        print(f"   API key length: {len(api_key)} characters")
                        if len(api_key) >= 26:
                            print("✅ API key format: VALID")
                        else:
                            print("⚠️ API key format: TOO SHORT")
                else:
                    print("❌ Device credentials file: NOT FOUND")
                    
            except Exception as e:
                print(f"❌ Credentials check error: {e}")
            
            return True
            
        except Exception as e:
            print(f"❌ Pi communication check error: {e}")
            return False
    
    def run_full_investigation(self):
        """Run complete investigation"""
        print("🔍 SUPABASE & PI COMMUNICATION INVESTIGATION")
        print("=" * 80)
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("=" * 80)
        
        # Test connection
        connection_ok = self.test_connection()
        
        # Check tables
        tables_ok = self.check_tables_exist()
        
        # Investigate existing data
        devices = self.investigate_devices_table()
        api_keys = self.investigate_api_keys_table()
        
        # Test insert capability
        insert_ok = self.test_insert_device()
        
        # Check Pi communication
        pi_ready = self.check_pi_communication_readiness()
        
        # Summary
        print("\n" + "="*60)
        print("📋 INVESTIGATION SUMMARY")
        print("="*60)
        print(f"Supabase Connection: {'✅ OK' if connection_ok else '❌ FAILED'}")
        print(f"Database Tables: {'✅ OK' if tables_ok else '❌ FAILED'}")
        print(f"Existing Devices: {len(devices)} found")
        print(f"Existing API Keys: {len(api_keys)} found")
        print(f"Insert Capability: {'✅ OK' if insert_ok else '❌ FAILED'}")
        print(f"Pi Communication: {'✅ READY' if pi_ready else '❌ NOT READY'}")
        
        # Recommendations
        print("\n" + "="*60)
        print("💡 RECOMMENDATIONS")
        print("="*60)
        
        if not connection_ok:
            print("❌ Fix Supabase connection - check URL and service key")
        
        if len(devices) == 0:
            print("⚠️ No devices in database - run device linking process")
        
        if len(api_keys) == 0:
            print("⚠️ No API keys in database - API keys not being stored properly")
        
        if connection_ok and tables_ok and insert_ok:
            print("✅ Supabase is working correctly - API keys should be stored")
        
        if pi_ready:
            print("✅ Pi script is ready for communication and AI decisions")
        else:
            print("❌ Pi script needs configuration for proper communication")

if __name__ == "__main__":
    investigator = SupabaseInvestigator()
    investigator.run_full_investigation()
