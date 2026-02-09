"""
Cloud Integration Bridge for Tione-Eollinea
Connects existing backend to cloud.ielivate.com
Transforms data formats and handles authentication
"""

import requests
import json
from datetime import datetime
from typing import Dict, Any, Optional
from device_identity import get_device_api_key, get_device_identity, is_device_registered, update_device_identity

class CloudIntegration:
    """Bridge between backend and cloud.ielivate.com"""
    
    def __init__(self, cloud_url: str = "https://cloud.ielivate.com"):
        """
        Initialize cloud integration.
        
        Args:
            cloud_url: Base URL of cloud platform
        """
        self.cloud_url = cloud_url.rstrip('/')
        self.device_identity = get_device_identity()
        self.device_id = self.device_identity["deviceId"]
        self.timeout = 15
        self.retry_attempts = 3
        self.retry_delay = 5
        
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication"""
        api_key = get_device_api_key()
        
        if not api_key:
            raise ValueError("Device not registered. API key not found.")
        
        return {
            "Content-Type": "application/json",
            "X-Device-API-Key": api_key,
            "User-Agent": "TioneEollinea-Backend/1.0.0"
        }
    
    def check_registration(self) -> bool:
        """Check if device is registered"""
        return is_device_registered()
    
    def register_device(self, device_name: str = None) -> Dict[str, Any]:
        """
        Register device with cloud platform.
        
        Flow:
        1. Generate device ID (already done in device_identity)
        2. Send POST /api/devices/register
        3. Receive API key
        4. Store API key locally
        
        Args:
            device_name: Optional device name
            
        Returns:
            Registration result with API key
        """
        endpoint = f"{self.cloud_url}/api/devices/register"
        
        payload = {
            "deviceId": self.device_id,
            "deviceName": device_name or f"BAYYTI-{self.device_id[:8]}",
            "deviceType": "irrigation_controller",
            "firmware": "1.0.0"
        }
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                api_key = result.get('apiKey')
                
                if api_key:
                    # Store API key locally
                    update_device_identity(
                        api_key=api_key,
                        registered=True,
                        device_name=device_name
                    )
                    print(f"✓ Device registered successfully!")
                    print(f"  Device ID: {self.device_id}")
                    print(f"  API Key: {api_key[:20]}...")
                    return {
                        "success": True,
                        "apiKey": api_key,
                        "deviceId": self.device_id,
                        "message": "Device registered successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": "No API key received from cloud"
                    }
            elif response.status_code == 409:
                return {
                    "success": False,
                    "error": "Device already registered. Use link-device page to get API key."
                }
            else:
                return {
                    "success": False,
                    "error": f"Registration failed: HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Registration error: {str(e)}"
            }
    
    def transform_sensor_data(self, backend_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform backend sensor data format to cloud format.
        
        Backend format (snake_case):
        {
            "soil_moisture": 45.2,
            "temperature": 24.5,
            "humidity": 65.0,
            "water_flow": 0.0,
            "water_pressure": 2.5,
            "battery_voltage": 12.4,
            "solar_voltage": 18.2
        }
        
        Cloud format (camelCase):
        {
            "temperature": 24.5,
            "humidity": 65.0,
            "soilMoisture": 45.2,
            "timestamp": "2026-01-18T...",
            "metadata": {...}
        }
        """
        cloud_data = {
            "temperature": backend_data.get("temperature"),
            "humidity": backend_data.get("humidity"),
            "soilMoisture": backend_data.get("soil_moisture"),
            "timestamp": datetime.utcnow().isoformat() + 'Z'
        }
        
        # Add extra data to metadata
        metadata = {}
        if "water_flow" in backend_data:
            metadata["waterFlow"] = backend_data["water_flow"]
        if "water_pressure" in backend_data:
            metadata["waterPressure"] = backend_data["water_pressure"]
        if "battery_voltage" in backend_data:
            metadata["batteryVoltage"] = backend_data["battery_voltage"]
        if "solar_voltage" in backend_data:
            metadata["solarVoltage"] = backend_data["solar_voltage"]
        if "flow_rate" in backend_data:
            metadata["flowRate"] = backend_data["flow_rate"]
        if "pressure" in backend_data:
            metadata["pressure"] = backend_data["pressure"]
        
        if metadata:
            cloud_data["metadata"] = metadata
        
        return cloud_data
    
    def send_sensor_data(self, sensor_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send sensor data to cloud.
        
        Args:
            sensor_data: Backend sensor data format
            
        Returns:
            Response from cloud or error
        """
        if not self.check_registration():
            return {
                "success": False,
                "error": "Device not registered with cloud"
            }
        
        # Transform data format
        cloud_data = self.transform_sensor_data(sensor_data)
        
        endpoint = f"{self.cloud_url}/api/devices/data"
        
        for attempt in range(self.retry_attempts):
            try:
                response = requests.post(
                    endpoint,
                    headers=self._get_headers(),
                    json=cloud_data,
                    timeout=self.timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✓ Data sent to cloud - ID: {result.get('dataId', 'N/A')}")
                    
                    # Check for pending commands
                    commands = result.get('commands', [])
                    if commands:
                        print(f"📥 Received {len(commands)} command(s) from cloud")
                    
                    return result
                    
                elif response.status_code == 401:
                    return {
                        "success": False,
                        "error": "Authentication failed - Invalid API key"
                    }
                    
                else:
                    error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                    if attempt < self.retry_attempts - 1:
                        print(f"⚠️  {error_msg} - Retrying...")
                        import time
                        time.sleep(self.retry_delay)
                    else:
                        return {"success": False, "error": error_msg}
                    
            except requests.exceptions.Timeout:
                if attempt < self.retry_attempts - 1:
                    print(f"⚠️  Request timeout - Retrying...")
                    import time
                    time.sleep(self.retry_delay)
                else:
                    return {"success": False, "error": "Request timeout"}
                    
            except requests.exceptions.ConnectionError:
                if attempt < self.retry_attempts - 1:
                    print(f"⚠️  Connection error - Retrying...")
                    import time
                    time.sleep(self.retry_delay)
                else:
                    return {"success": False, "error": "Cannot reach cloud server"}
                    
            except Exception as e:
                return {"success": False, "error": f"Unexpected error: {str(e)}"}
        
        return {"success": False, "error": "Max retries exceeded"}
    
    def fetch_commands(self) -> Dict[str, Any]:
        """
        Fetch pending commands from cloud.
        
        Returns:
            Commands from cloud or error
        """
        if not self.check_registration():
            return {
                "success": False,
                "error": "Device not registered"
            }
        
        endpoint = f"{self.cloud_url}/api/devices/commands"
        
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
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def update_command_status(self, command_id: str, status: str, error: Optional[str] = None) -> Dict[str, Any]:
        """
        Update command execution status.
        
        Args:
            command_id: Command ID from cloud
            status: 'executed' or 'failed'
            error: Error message if failed
            
        Returns:
            Response from cloud
        """
        if not self.check_registration():
            return {"success": False, "error": "Device not registered"}
        
        endpoint = f"{self.cloud_url}/api/devices/commands"
        
        payload = {
            "commandId": command_id,
            "status": status
        }
        
        if error:
            payload["error"] = error
        
        try:
            response = requests.put(
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
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def execute_command(self, command: Dict[str, Any], irrigation_controller=None) -> Dict[str, Any]:
        """
        Execute a command received from cloud.
        
        Args:
            command: Command object from cloud
            irrigation_controller: IrrigationController instance (optional)
            
        Returns:
            Execution result
        """
        command_id = command.get('id')
        command_type = command.get('type')
        params = command.get('params', {})
        
        try:
            if command_type == 'start_irrigation':
                if not irrigation_controller:
                    raise ValueError("Irrigation controller not available")
                
                zone_id = params.get('zoneId', 1)
                duration = params.get('duration', 300)
                
                result = irrigation_controller.start_irrigation(
                    zone_id=zone_id,
                    duration=duration,
                    trigger='cloud_command'
                )
                
                if result.get('success'):
                    self.update_command_status(command_id, 'executed')
                    return {"success": True, "message": "Irrigation started"}
                else:
                    error_msg = result.get('message', 'Unknown error')
                    self.update_command_status(command_id, 'failed', error_msg)
                    return {"success": False, "error": error_msg}
                    
            elif command_type == 'stop_irrigation':
                if not irrigation_controller:
                    raise ValueError("Irrigation controller not available")
                
                zone_id = params.get('zoneId', 1)
                result = irrigation_controller.stop_irrigation(zone_id)
                
                if result.get('success'):
                    self.update_command_status(command_id, 'executed')
                    return {"success": True, "message": "Irrigation stopped"}
                else:
                    error_msg = result.get('message', 'Unknown error')
                    self.update_command_status(command_id, 'failed', error_msg)
                    return {"success": False, "error": error_msg}
                    
            else:
                error_msg = f"Unknown command type: {command_type}"
                self.update_command_status(command_id, 'failed', error_msg)
                return {"success": False, "error": error_msg}
                
        except Exception as e:
            error_msg = f"Command execution error: {str(e)}"
            self.update_command_status(command_id, 'failed', error_msg)
            return {"success": False, "error": error_msg}
    
    def get_status(self) -> Dict[str, Any]:
        """Get cloud integration status"""
        identity = get_device_identity()
        return {
            "registered": self.check_registration(),
            "cloud_url": self.cloud_url,
            "device_id": self.device_id,
            "device_name": identity.get('deviceName'),
            "has_api_key": get_device_api_key() is not None,
            "owner_id": identity.get('ownerId')
        }
    
    def sync_with_cloud(self, sensor_data: Dict[str, Any], irrigation_controller=None) -> Dict[str, Any]:
        """
        Complete sync cycle with cloud:
        1. Send sensor data
        2. Receive pending commands
        3. Execute commands
        
        Args:
            sensor_data: Sensor readings from backend
            irrigation_controller: Optional irrigation controller for command execution
            
        Returns:
            Sync result with command execution status
        """
        if not self.check_registration():
            return {
                "success": False,
                "error": "Device not registered",
                "registration_url": f"{self.cloud_url}/link-device",
                "device_id": self.device_id
            }
        
        # Send sensor data
        data_result = self.send_sensor_data(sensor_data)
        
        if not data_result.get('success', True):
            return data_result
        
        # Check for commands in response
        commands = data_result.get('commands', [])
        executed_commands = []
        
        if commands and irrigation_controller:
            for command in commands:
                exec_result = self.execute_command(command, irrigation_controller)
                executed_commands.append({
                    "command_id": command.get('id'),
                    "type": command.get('type'),
                    "result": exec_result
                })
        
        return {
            "success": True,
            "data_sent": True,
            "commands_executed": len(executed_commands),
            "commands": executed_commands
        }


# Example usage
if __name__ == "__main__":
    # Initialize integration
    integration = CloudIntegration()
    
    # Check status
    status = integration.get_status()
    print("Cloud Integration Status:", json.dumps(status, indent=2))
    
    if not status["registered"]:
        print("\n⚠️  Device not registered!")
        print("Please register at: https://cloud.ielivate.com/link-device")
        print(f"Device ID: {status['device_id']}")
    else:
        # Test sending data
        print("\n📤 Testing data transmission...")
        
        test_data = {
            "soil_moisture": 45.2,
            "temperature": 24.5,
            "humidity": 65.0,
            "water_flow": 0.0,
            "water_pressure": 2.5,
            "battery_voltage": 12.4,
            "solar_voltage": 18.2
        }
        
        result = integration.send_sensor_data(test_data)
        print("Result:", json.dumps(result, indent=2))
