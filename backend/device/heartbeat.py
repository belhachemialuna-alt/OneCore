"""
Heartbeat Module
Sends periodic heartbeat to VPS to maintain online status.
Runs in background thread.
"""

import sys
import os
import time
import threading
import requests
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import identity

class Heartbeat:
    """
    Manages periodic heartbeat to VPS.
    """
    
    def __init__(self, vps_url=None, interval=300):
        """
        Initialize heartbeat.
        
        Args:
            vps_url (str): VPS server URL
            interval (int): Heartbeat interval in seconds (default: 300 = 5 minutes)
        """
        self.vps_url = vps_url or "https://your-vps.com"
        self.interval = interval
        self.running = False
        self.thread = None
        self.last_heartbeat = None
        self.last_status = None
        
        # Load device identity
        self.device_identity = identity.load_identity()
        
        print(f"Heartbeat initialized: interval={interval}s")
    
    def _get_headers(self):
        """
        Get request headers with device authentication.
        
        Returns:
            dict: Request headers
        """
        api_key = self.device_identity.get("apiKey")
        
        if not api_key:
            return None
        
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
    
    def send_heartbeat(self):
        """
        Send single heartbeat to VPS.
        
        Returns:
            dict: Response from VPS or error
        """
        if not self.is_registered():
            return {
                "success": False,
                "error": "Device not registered"
            }
        
        endpoint = f"{self.vps_url}/api/device/heartbeat"
        
        payload = {
            "deviceId": self.device_identity["deviceId"],
            "timestamp": datetime.utcnow().isoformat(),
            "status": "online"
        }
        
        try:
            headers = self._get_headers()
            if not headers:
                return {"success": False, "error": "No API key"}
            
            response = requests.post(
                endpoint,
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                self.last_heartbeat = datetime.utcnow()
                self.last_status = "success"
                return response.json()
            else:
                self.last_status = f"error_{response.status_code}"
                return {
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                }
                
        except requests.exceptions.Timeout:
            self.last_status = "timeout"
            return {"success": False, "error": "Timeout"}
        except requests.exceptions.ConnectionError:
            self.last_status = "connection_error"
            return {"success": False, "error": "Connection error"}
        except Exception as e:
            self.last_status = "error"
            return {"success": False, "error": str(e)}
    
    def _heartbeat_loop(self):
        """
        Background heartbeat loop.
        """
        print(f"Heartbeat loop started (interval: {self.interval}s)")
        
        while self.running:
            if self.is_registered():
                result = self.send_heartbeat()
                if result.get("success"):
                    print(f"Heartbeat sent successfully")
                else:
                    print(f"Heartbeat failed: {result.get('error')}")
            else:
                print("Heartbeat skipped: Device not registered")
            
            # Sleep for interval
            time.sleep(self.interval)
    
    def start(self):
        """
        Start heartbeat in background thread.
        """
        if self.running:
            print("Heartbeat already running")
            return
        
        self.running = True
        self.thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        self.thread.start()
        print("Heartbeat started")
    
    def stop(self):
        """
        Stop heartbeat.
        """
        if not self.running:
            print("Heartbeat not running")
            return
        
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        print("Heartbeat stopped")
    
    def get_status(self):
        """
        Get heartbeat status.
        
        Returns:
            dict: Heartbeat status
        """
        return {
            "running": self.running,
            "interval": self.interval,
            "last_heartbeat": self.last_heartbeat.isoformat() if self.last_heartbeat else None,
            "last_status": self.last_status,
            "registered": self.is_registered()
        }


# Create singleton instance
_heartbeat = None

def get_heartbeat(vps_url=None, interval=300):
    """
    Get or create heartbeat instance.
    
    Args:
        vps_url (str, optional): VPS URL
        interval (int, optional): Heartbeat interval in seconds
    
    Returns:
        Heartbeat: Heartbeat instance
    """
    global _heartbeat
    if _heartbeat is None:
        _heartbeat = Heartbeat(vps_url, interval)
    return _heartbeat

def start_heartbeat(vps_url=None, interval=300):
    """
    Start heartbeat (convenience function).
    
    Args:
        vps_url (str, optional): VPS URL
        interval (int, optional): Heartbeat interval in seconds
    """
    hb = get_heartbeat(vps_url, interval)
    hb.start()

def stop_heartbeat():
    """
    Stop heartbeat (convenience function).
    """
    if _heartbeat:
        _heartbeat.stop()

def get_heartbeat_status():
    """
    Get heartbeat status (convenience function).
    
    Returns:
        dict: Heartbeat status
    """
    if _heartbeat:
        return _heartbeat.get_status()
    return {"running": False, "error": "Heartbeat not initialized"}
