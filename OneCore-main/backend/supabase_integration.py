"""
Supabase Integration Module for BAYYTI-B1 Device
Handles device registration and API key storage in Supabase database
"""

import requests
import json
import os
from datetime import datetime

class SupabaseIntegration:
    def __init__(self):
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
        
        # Get Supabase credentials from environment or use detected values
        self.supabase_url = os.getenv('SUPABASE_URL', 'https://zossejntvbzrymetqd.supabase.co')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvc3NlanR2YnpyeW1ldHFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ3NzY5OSwiZXhwIjoyMDUzMDUzNjk5fQ.sb_secret_lp71y4pm70TmbXqoFI967Q_46mgasby')
        
        # Check if we have valid credentials
        if 'your-project' in self.supabase_url or 'your-service-role-key' in self.supabase_key:
            print("⚠️ Supabase credentials not configured - using placeholder values")
            self.enabled = False
        else:
            self.enabled = True
            
        self.headers = {
            'Content-Type': 'application/json',
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Prefer': 'return=representation'
        }
    
    def store_device_activation(self, device_id, api_key, device_name, owner_id, activated_at):
        """Store device activation in Supabase database"""
        if not self.enabled:
            print(f"⚠️ Supabase integration disabled - credentials not configured")
            return False
            
        try:
            # Store in device_api_keys table directly
            api_key_data = {
                'device_id': None,  # Will be set if device exists
                'api_key_hash': api_key,  # In production, hash this with crypto
                'created_at': activated_at,
                'is_active': True
            }
            
            # First, try to find existing device by serial_number
            device_check_url = f"{self.supabase_url}/rest/v1/devices?serial_number=eq.{device_id}&select=id,user_id"
            device_response = requests.get(device_check_url, headers=self.headers, timeout=10)
            
            if device_response.status_code == 200:
                devices = device_response.json()
                if devices and len(devices) > 0:
                    # Device exists, use its ID
                    device_uuid = devices[0]['id']
                    api_key_data['device_id'] = device_uuid
                    
                    # Insert into device_api_keys table
                    api_keys_url = f"{self.supabase_url}/rest/v1/device_api_keys"
                    api_response = requests.post(api_keys_url, json=api_key_data, headers=self.headers, timeout=10)
                    
                    if api_response.status_code in [200, 201]:
                        print(f"✅ API key stored in Supabase device_api_keys table")
                        
                        # Also update the device status
                        device_update_data = {
                            'status': 'active',
                            'has_activated': True,
                            'last_activated': activated_at,
                            'last_seen': activated_at,
                            'api_key_hash': api_key
                        }
                        
                        device_update_url = f"{self.supabase_url}/rest/v1/devices?id=eq.{device_uuid}"
                        update_response = requests.patch(device_update_url, json=device_update_data, headers=self.headers, timeout=10)
                        
                        if update_response.status_code in [200, 204]:
                            print(f"✅ Device status updated in Supabase")
                        
                        return True
                    else:
                        print(f"⚠️ Failed to store API key in Supabase: {api_response.status_code}")
                        print(f"   Response: {api_response.text}")
                        return False
                else:
                    print(f"⚠️ Device not found in Supabase devices table")
                    print(f"   Go to http://localhost:3000/link-device to link this device first")
                    return False
            else:
                print(f"⚠️ Failed to check device in Supabase: {device_response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Network error connecting to Supabase: {e}")
            return False
        except Exception as e:
            print(f"⚠️ Error storing device in Supabase: {e}")
            return False
    
    def get_device_from_supabase(self, device_id):
        """Retrieve device information from Supabase"""
        try:
            url = f"{self.supabase_url}/rest/v1/devices?serial_number=eq.{device_id}"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                devices = response.json()
                if devices:
                    return devices[0]
            return None
        except Exception as e:
            print(f"⚠️ Error retrieving device from Supabase: {e}")
            return None
    
    def test_connection(self):
        """Test connection to Supabase"""
        try:
            url = f"{self.supabase_url}/rest/v1/devices?limit=1"
            response = requests.get(url, headers=self.headers, timeout=5)
            return response.status_code == 200
        except:
            return False

# Global instance
supabase_integration = SupabaseIntegration()
