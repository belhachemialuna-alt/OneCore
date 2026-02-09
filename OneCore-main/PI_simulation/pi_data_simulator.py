#!/usr/bin/env python3
"""
PI Data Simulator
Generates and sends realistic sensor data to the cloud dashboard
Supports both localhost development and Pi deployment
"""

import requests
import json
import time
import random
import argparse
from datetime import datetime
from typing import Dict, Any, Optional
import logging
import uuid
import hashlib
import platform
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PIDataSimulator:
    def __init__(self, 
                 cloud_endpoint: str = "http://localhost:3000",
                 pi_server: str = "http://localhost:5000",
                 device_id: str = None,
                 api_key: str = None,
                 auto_register: bool = False):
        """
        Initialize the PI Data Simulator
        
        Args:
            cloud_endpoint: Cloud dashboard endpoint (NextJS app)
            pi_server: Local PI server endpoint (Flask backend)
            device_id: Unique device identifier (auto-generated if None)
            api_key: Device API key for authentication (loaded from config if None)
            auto_register: Whether to attempt automatic registration
        """
        self.cloud_endpoint = cloud_endpoint.rstrip('/')
        self.pi_server = pi_server.rstrip('/')
        self.auto_register = auto_register
        
        # Load or generate device ID and API key
        self.device_id = device_id or self._generate_device_id()
        self.api_key = api_key or self._load_api_key()
        
        if not self.api_key:
            logger.warning("⚠️ No API key found. Device needs to be registered first.")
            logger.info("📝 Use device_registration.html to register this device")
        
        # Sensor baseline values for realistic simulation
        self.baselines = {
            'temperature': 25.0,  # °C
            'humidity': 60.0,     # %
            'soilMoisture': 45.0, # %
            'ph': 7.0,           # pH units
            'light': 800,        # lux
            'pressure': 1013.25, # hPa
            'windSpeed': 5.0,    # km/h
        }
        
        # Variation ranges for realistic data
        self.variations = {
            'temperature': 15.0,  # ±15°C
            'humidity': 30.0,     # ±30%
            'soilMoisture': 40.0, # ±40%
            'ph': 1.5,           # ±1.5 pH
            'light': 500,        # ±500 lux
            'pressure': 50.0,    # ±50 hPa
            'windSpeed': 10.0,   # ±10 km/h
        }
        
        self.running = False
        self.config_file = "device_config.json"
        
    def _generate_device_id(self) -> str:
        """Generate unique device ID based on hardware"""
        try:
            mac = uuid.getnode()
            system = platform.system()
            machine = platform.machine()
            processor = platform.processor()
            
            raw_id = f"{mac}{system}{machine}{processor}"
            device_hash = hashlib.sha256(raw_id.encode()).hexdigest()
            
            logger.info(f"🆔 Generated Device ID: {device_hash[:16]}...")
            return device_hash
            
        except Exception as e:
            logger.error(f"Error generating device ID: {e}")
            fallback_id = str(uuid.uuid4()).replace('-', '')
            logger.warning(f"Using fallback Device ID: {fallback_id[:16]}...")
            return fallback_id
    
    def _load_api_key(self) -> Optional[str]:
        """Load API key from configuration file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    config = json.load(f)
                    api_key = config.get('api_key')
                    if api_key:
                        logger.info("✅ API key loaded from configuration")
                        return api_key
        except Exception as e:
            logger.error(f"Error loading API key: {e}")
        
        return None
    
    def check_registration_status(self) -> bool:
        """Check if device is properly registered"""
        if not self.api_key:
            logger.warning("❌ Device not registered - no API key")
            return False
        
        # Test API key with a heartbeat
        try:
            response = requests.post(
                f"{self.cloud_endpoint}/api/device/heartbeat",
                headers={
                    "Authorization": f"Device {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "deviceId": self.device_id,
                    "timestamp": time.time()
                },
                timeout=5
            )
            
            if response.status_code == 200:
                logger.info("✅ Device registration verified")
                return True
            else:
                logger.warning(f"⚠️ Registration check failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.warning(f"⚠️ Could not verify registration: {e}")
            return False
        
    def generate_sensor_data(self) -> Dict[str, Any]:
        """Generate realistic sensor data with natural variations"""
        
        # Add time-based variations (day/night cycles, seasonal changes)
        hour = datetime.now().hour
        day_factor = 0.5 + 0.5 * abs(12 - hour) / 12  # Peak at noon/midnight
        
        data = {}
        for sensor, baseline in self.baselines.items():
            variation = self.variations[sensor]
            
            # Base random variation
            random_factor = (random.random() - 0.5) * 2  # -1 to 1
            
            # Time-based adjustments
            if sensor == 'temperature':
                # Warmer during day, cooler at night
                time_adjustment = 5 * (0.5 - day_factor)
                value = baseline + (random_factor * variation * 0.7) + time_adjustment
            elif sensor == 'light':
                # Much higher during day
                if 6 <= hour <= 18:  # Daylight hours
                    value = baseline + (random_factor * variation * 0.5) + (day_factor * 1000)
                else:  # Night
                    value = max(10, baseline * 0.1 + (random_factor * 50))
            elif sensor == 'humidity':
                # Inverse relationship with temperature
                temp_factor = -0.3 * (data.get('temperature', baseline) - baseline)
                value = baseline + (random_factor * variation * 0.8) + temp_factor
            else:
                value = baseline + (random_factor * variation * 0.8)
            
            # Apply realistic constraints
            if sensor == 'humidity' or sensor == 'soilMoisture':
                value = max(0, min(100, value))
            elif sensor == 'ph':
                value = max(4.0, min(10.0, value))
            elif sensor == 'light':
                value = max(0, value)
            elif sensor == 'temperature':
                value = max(-20, min(60, value))
            
            data[sensor] = round(value, 2)
        
        # Add metadata
        data.update({
            'timestamp': datetime.now().isoformat(),
            'deviceId': self.device_id,
            'location': 'Simulation Lab',
            'metadata': {
                'source': 'pi_simulator',
                'version': '1.0.0',
                'simulation_mode': True,
                'hour': hour,
                'day_factor': round(day_factor, 2)
            }
        })
        
        return data
    
    def send_to_cloud(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send data to cloud dashboard (NextJS app)"""
        try:
            headers = {
                'Content-Type': 'application/json',
                'X-Device-API-Key': self.api_key
            }
            
            response = requests.post(
                f"{self.cloud_endpoint}/api/devices/data",
                json=data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"✅ Cloud: {result.get('decision', {}).get('action', 'NO_ACTION')}")
                return result
            else:
                logger.error(f"❌ Cloud error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Cloud connection failed: {e}")
            return None
    
    def send_to_pi_server(self, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Send data to local PI server (Flask backend)"""
        try:
            headers = {
                'Content-Type': 'application/json',
                'X-API-Key': self.api_key
            }
            
            response = requests.post(
                f"{self.pi_server}/api/sensor-data",
                json=data,
                headers=headers,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"🔧 PI Server: {result.get('status', 'OK')}")
                return result
            else:
                logger.warning(f"⚠️ PI Server: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.warning(f"⚠️ PI Server connection failed: {e}")
            return None
    
    def simulate_single_reading(self) -> Dict[str, Any]:
        """Generate and send a single sensor reading"""
        # Check registration status first
        if not self.api_key:
            logger.error("❌ Cannot send data - device not registered")
            logger.info("📝 Please register device using device_registration.html")
            return {
                'error': 'Device not registered',
                'registration_url': 'device_registration.html'
            }
        
        data = self.generate_sensor_data()
        
        logger.info(f"📊 Generated data: T={data['temperature']}°C, H={data['humidity']}%, SM={data['soilMoisture']}%")
        
        results = {
            'data': data,
            'cloud_response': None,
            'pi_response': None
        }
        
        # Send to cloud dashboard
        cloud_result = self.send_to_cloud(data)
        if cloud_result:
            results['cloud_response'] = cloud_result
        
        # Send to PI server
        pi_result = self.send_to_pi_server(data)
        if pi_result:
            results['pi_response'] = pi_result
        
        return results
    
    def start_continuous_simulation(self, interval: int = 30):
        """Start continuous data simulation"""
        logger.info(f"🚀 Starting continuous simulation (interval: {interval}s)")
        logger.info(f"📡 Cloud endpoint: {self.cloud_endpoint}")
        logger.info(f"🔧 PI server: {self.pi_server}")
        logger.info(f"🆔 Device ID: {self.device_id[:16]}...")
        
        # Check registration status
        if not self.check_registration_status():
            logger.error("❌ Cannot start simulation - device not properly registered")
            logger.info("📝 Please register device using device_registration.html")
            return
        
        self.running = True
        
        try:
            while self.running:
                self.simulate_single_reading()
                
                if self.running:  # Check again in case stop was called
                    time.sleep(interval)
                    
        except KeyboardInterrupt:
            logger.info("🛑 Simulation stopped by user")
        except Exception as e:
            logger.error(f"❌ Simulation error: {e}")
        finally:
            self.running = False
    
    def stop_simulation(self):
        """Stop the continuous simulation"""
        self.running = False
        logger.info("🛑 Stopping simulation...")

def main():
    parser = argparse.ArgumentParser(description='PI Data Simulator with Device Linking')
    parser.add_argument('--cloud', default='http://localhost:3000', 
                       help='Cloud dashboard endpoint')
    parser.add_argument('--pi-server', default='http://localhost:5000', 
                       help='PI server endpoint')
    parser.add_argument('--pi-ip', default=None,
                       help='PI IP address (e.g., 192.168.137.193)')
    parser.add_argument('--device-id', default=None,
                       help='Device ID (auto-generated if not provided)')
    parser.add_argument('--api-key', default=None,
                       help='API key for authentication (loaded from config if not provided)')
    parser.add_argument('--interval', type=int, default=30,
                       help='Data sending interval in seconds')
    parser.add_argument('--single', action='store_true',
                       help='Send single reading and exit')
    parser.add_argument('--check-registration', action='store_true',
                       help='Check device registration status and exit')
    
    args = parser.parse_args()
    
    # If PI IP is provided, use it for the PI server
    pi_server = args.pi_server
    if args.pi_ip:
        pi_server = f"http://{args.pi_ip}:5000"
    
    simulator = PIDataSimulator(
        cloud_endpoint=args.cloud,
        pi_server=pi_server,
        device_id=args.device_id,
        api_key=args.api_key
    )
    
    if args.check_registration:
        status = simulator.check_registration_status()
        print(f"Device Registration Status: {'✅ Registered' if status else '❌ Not Registered'}")
        print(f"Device ID: {simulator.device_id[:16]}...")
        if not status:
            print("To register: Open device_registration.html in your browser")
        return
    
    if args.single:
        result = simulator.simulate_single_reading()
        print(json.dumps(result, indent=2, default=str))
    else:
        simulator.start_continuous_simulation(args.interval)

if __name__ == "__main__":
    main()
