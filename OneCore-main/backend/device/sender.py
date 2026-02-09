"""
Sender Module
Sends sensor data and events to VPS cloud.
Handles all cloud communication.
"""

import sys
import os
import requests
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import identity

class CloudSender:
    """
    Handles sending data to VPS cloud.
    """
    
    def __init__(self, vps_url=None, timeout=10):
        """
        Initialize cloud sender.
        
        Args:
            vps_url (str): VPS server URL
            timeout (int): Request timeout in seconds
        """
        self.vps_url = vps_url or "https://your-vps.com"
        self.timeout = timeout
        self.last_sync = None
        
        # Load device identity
        self.device_identity = identity.load_identity()
        
        print(f"CloudSender initialized: {self.vps_url}")
    
    def _get_headers(self):
        """
        Get request headers with device authentication.
        
        Returns:
            dict: Request headers
        """
        api_key = self.device_identity.get("apiKey")
        
        if not api_key:
            raise ValueError("Device not registered. API key not found.")
        
        return {
            "Content-Type": "application/json",
            "Authorization": f"Device {api_key}",
            "X-Device-ID": self.device_identity["deviceId"]
        }
    
    def is_registered(self):
        """
        Check if device is registered.
        
        Returns:
            bool: True if registered, False otherwise
        """
        return identity.is_registered()
    
    def send_sensor_data(self, sensor_data):
        """
        Send sensor data to VPS.
        
        Args:
            sensor_data (dict): Sensor readings
        
        Returns:
            dict: Response from VPS or error
        """
        if not self.is_registered():
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
            return {"success": False, "error": "Request timeout"}
        except requests.exceptions.ConnectionError:
            return {"success": False, "error": "Connection error"}
        except Exception as e:
            return {"success": False, "error": f"Error: {str(e)}"}
    
    def send_irrigation_event(self, event_data):
        """
        Send irrigation event to VPS.
        
        Args:
            event_data (dict): Irrigation event details
        
        Returns:
            dict: Response from VPS or error
        """
        if not self.is_registered():
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
            return {"success": False, "error": f"Error: {str(e)}"}
    
    def send_alert(self, alert_data):
        """
        Send alert to VPS.
        
        Args:
            alert_data (dict): Alert details
        
        Returns:
            dict: Response from VPS or error
        """
        if not self.is_registered():
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
            return {"success": False, "error": f"Error: {str(e)}"}
    
    def get_status(self):
        """
        Get sender status.
        
        Returns:
            dict: Sender status
        """
        return {
            "registered": self.is_registered(),
            "vps_url": self.vps_url,
            "device_id": self.device_identity["deviceId"],
            "last_sync": self.last_sync.isoformat() if self.last_sync else None
        }


# Create singleton instance
_sender = None

def get_sender(vps_url=None):
    """
    Get or create sender instance.
    
    Args:
        vps_url (str, optional): VPS URL
    
    Returns:
        CloudSender: Sender instance
    """
    global _sender
    if _sender is None:
        _sender = CloudSender(vps_url)
    return _sender

def send_sensor_data(sensor_data, vps_url=None):
    """
    Send sensor data (convenience function).
    
    Args:
        sensor_data (dict): Sensor readings
        vps_url (str, optional): VPS URL
    
    Returns:
        dict: Response
    """
    sender = get_sender(vps_url)
    return sender.send_sensor_data(sensor_data)

def send_irrigation_event(event_data, vps_url=None):
    """
    Send irrigation event (convenience function).
    
    Args:
        event_data (dict): Event details
        vps_url (str, optional): VPS URL
    
    Returns:
        dict: Response
    """
    sender = get_sender(vps_url)
    return sender.send_irrigation_event(event_data)

def send_alert(alert_data, vps_url=None):
    """
    Send alert (convenience function).
    
    Args:
        alert_data (dict): Alert details
        vps_url (str, optional): VPS URL
    
    Returns:
        dict: Response
    """
    sender = get_sender(vps_url)
    return sender.send_alert(alert_data)
