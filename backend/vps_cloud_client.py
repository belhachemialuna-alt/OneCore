"""
VPS Cloud Client
Handles communication between physical device and VPS cloud server.
Sends sensor data and receives commands/configurations.
"""

import requests
import json
from datetime import datetime
from device_identity import get_device_identity, is_device_registered, get_device_api_key
import time

class VPSCloudClient:
    """Client for communicating with VPS cloud server."""
    
    def __init__(self, vps_url=None, timeout=10):
        """
        Initialize VPS Cloud Client.
        
        Args:
            vps_url (str): Base URL of VPS server (e.g., https://your-vps.com)
            timeout (int): Request timeout in seconds
        """
        self.vps_url = vps_url or "https://your-vps.com"
        self.timeout = timeout
        self.device_identity = get_device_identity()
        self.last_sync = None
        
    def _get_headers(self):
        """
        Get request headers with device authentication.
        
        Returns:
            dict: Request headers
        """
        api_key = get_device_api_key()
        
        if not api_key:
            raise ValueError("Device not registered. API key not found.")
        
        return {
            "Content-Type": "application/json",
            "Authorization": f"Device {api_key}",
            "X-Device-ID": self.device_identity["deviceId"]
        }
    
    def check_registration(self):
        """
        Check if device is registered with VPS.
        
        Returns:
            bool: True if registered, False otherwise
        """
        return is_device_registered()
    
    def send_sensor_data(self, sensor_data):
        """
        Send sensor data to VPS cloud.
        
        Args:
            sensor_data (dict): Sensor readings
                {
                    "soil_moisture": float,
                    "temperature": float,
                    "humidity": float,
                    "water_flow": float,
                    "water_pressure": float,
                    "battery_voltage": float,
                    "solar_voltage": float
                }
        
        Returns:
            dict: Response from VPS or error
        """
        if not self.check_registration():
            return {
                "success": False,
                "error": "Device not registered with VPS"
            }
        
        endpoint = f"{self.vps_url}/api/device/data"
        
        payload = {
            "deviceId": self.device_identity["deviceId"],
            "timestamp": datetime.utcnow().isoformat(),
            "sensors": sensor_data
        }
        
        try:
            response = requests.post(
                endpoint,
                headers=self._get_headers(),
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                self.last_sync = datetime.utcnow()
                return response.json()
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Request timeout"
            }
        except requests.exceptions.ConnectionError:
            return {
                "success": False,
                "error": "Connection error. VPS may be unreachable."
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    def send_irrigation_event(self, event_data):
        """
        Send irrigation event to VPS cloud.
        
        Args:
            event_data (dict): Irrigation event details
                {
                    "zone_id": int,
                    "action": str (start/stop),
                    "duration": int (seconds),
                    "water_used": float (liters),
                    "trigger": str (manual/scheduled/ai)
                }
        
        Returns:
            dict: Response from VPS or error
        """
        if not self.check_registration():
            return {
                "success": False,
                "error": "Device not registered with VPS"
            }
        
        endpoint = f"{self.vps_url}/api/device/irrigation"
        
        payload = {
            "deviceId": self.device_identity["deviceId"],
            "timestamp": datetime.utcnow().isoformat(),
            "event": event_data
        }
        
        try:
            response = requests.post(
                endpoint,
                headers=self._get_headers(),
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error sending irrigation event: {str(e)}"
            }
    
    def send_alert(self, alert_data):
        """
        Send alert/notification to VPS cloud.
        
        Args:
            alert_data (dict): Alert details
                {
                    "type": str (leak/battery_low/sensor_error),
                    "severity": str (info/warning/critical),
                    "message": str,
                    "details": dict
                }
        
        Returns:
            dict: Response from VPS or error
        """
        if not self.check_registration():
            return {
                "success": False,
                "error": "Device not registered with VPS"
            }
        
        endpoint = f"{self.vps_url}/api/device/alert"
        
        payload = {
            "deviceId": self.device_identity["deviceId"],
            "timestamp": datetime.utcnow().isoformat(),
            "alert": alert_data
        }
        
        try:
            response = requests.post(
                endpoint,
                headers=self._get_headers(),
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error sending alert: {str(e)}"
            }
    
    def get_device_config(self):
        """
        Fetch device configuration from VPS.
        
        Returns:
            dict: Device configuration or error
        """
        if not self.check_registration():
            return {
                "success": False,
                "error": "Device not registered with VPS"
            }
        
        endpoint = f"{self.vps_url}/api/device/config"
        
        try:
            response = requests.get(
                endpoint,
                headers=self._get_headers(),
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error fetching config: {str(e)}"
            }
    
    def heartbeat(self):
        """
        Send heartbeat to VPS to indicate device is online.
        
        Returns:
            dict: Response from VPS or error
        """
        if not self.check_registration():
            return {
                "success": False,
                "error": "Device not registered with VPS"
            }
        
        endpoint = f"{self.vps_url}/api/device/heartbeat"
        
        payload = {
            "deviceId": self.device_identity["deviceId"],
            "timestamp": datetime.utcnow().isoformat(),
            "status": "online"
        }
        
        try:
            response = requests.post(
                endpoint,
                headers=self._get_headers(),
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Error sending heartbeat: {str(e)}"
            }
    
    def get_status(self):
        """
        Get VPS cloud client status.
        
        Returns:
            dict: Client status
        """
        return {
            "registered": self.check_registration(),
            "vps_url": self.vps_url,
            "device_id": self.device_identity["deviceId"],
            "last_sync": self.last_sync.isoformat() if self.last_sync else None
        }


# Example usage
if __name__ == "__main__":
    # Initialize client
    client = VPSCloudClient(vps_url="https://your-vps.com")
    
    # Check registration
    if not client.check_registration():
        print("Device not registered. Please pair with VPS first.")
    else:
        # Send test sensor data
        sensor_data = {
            "soil_moisture": 45.2,
            "temperature": 24.5,
            "humidity": 65.0,
            "water_flow": 0.0,
            "water_pressure": 2.5,
            "battery_voltage": 12.4,
            "solar_voltage": 18.2
        }
        
        result = client.send_sensor_data(sensor_data)
        print("Sensor data sent:", result)
