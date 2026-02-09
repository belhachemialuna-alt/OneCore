"""
Device Main Orchestrator
Coordinates all device modules:
- Identity management
- Local API server
- Sensor reading
- Cloud data sending
- Heartbeat

This is the entry point for the device system.
"""

import sys
import os
import time
import threading

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Import device modules
import identity
import local_api
import sensors
import sender
import heartbeat
import config

class DeviceOrchestrator:
    """
    Main orchestrator for device functionality.
    Coordinates all device modules.
    """
    
    def __init__(self, vps_url=None, sensor_interval=60, heartbeat_interval=300):
        """
        Initialize device orchestrator.
        
        Args:
            vps_url (str, optional): VPS server URL
            sensor_interval (int): Sensor reading interval in seconds (default: 60)
            heartbeat_interval (int): Heartbeat interval in seconds (default: 300)
        """
        self.vps_url = vps_url or config.DeviceConfig.get_vps_url()
        self.sensor_interval = sensor_interval
        self.heartbeat_interval = heartbeat_interval
        self.running = False
        
        # Initialize modules
        print("=" * 60)
        print("DEVICE ORCHESTRATOR INITIALIZATION")
        print("=" * 60)
        
        # Show network configuration
        config.print_network_info()
        
        # 1. Device Identity
        self.device_identity = identity.load_identity()
        print(f"✓ Device ID: {self.device_identity['deviceId']}")
        print(f"✓ Registered: {self.device_identity['registered']}")
        
        # 2. Sensors
        self.sensors = sensors.Sensors()
        sensor_status = self.sensors.get_status()
        print(f"✓ Sensors: {sensor_status['mode']} mode")
        
        # 3. Cloud Sender
        self.sender = sender.CloudSender(vps_url=self.vps_url)
        print(f"✓ Cloud Sender: {self.vps_url}")
        
        # 4. Heartbeat
        self.heartbeat = heartbeat.Heartbeat(
            vps_url=self.vps_url,
            interval=self.heartbeat_interval
        )
        print(f"✓ Heartbeat: {self.heartbeat_interval}s interval")
        
        # 5. Local API Server
        print(f"✓ Local API: Will start on port 5000")
        
        print("=" * 60)
    
    def start_local_api(self):
        """
        Start local API server in background.
        """
        print("Starting Local API server...")
        local_api.start_local_api_background(host="0.0.0.0", port=5000)
        print("✓ Local API server started on port 5000")
    
    def start_heartbeat(self):
        """
        Start heartbeat.
        """
        if self.device_identity['registered']:
            print("Starting Heartbeat...")
            self.heartbeat.start()
            print("✓ Heartbeat started")
        else:
            print("⚠ Heartbeat not started: Device not registered")
    
    def start_sensor_loop(self):
        """
        Start sensor reading and cloud sync loop.
        """
        print(f"Starting Sensor Loop (interval: {self.sensor_interval}s)...")
        self.running = True
        
        def sensor_loop():
            while self.running:
                try:
                    # Read sensors
                    sensor_data = self.sensors.read_all()
                    print(f"Sensors: {sensor_data}")
                    
                    # Send to cloud if registered
                    if self.device_identity['registered']:
                        result = self.sender.send_sensor_data(sensor_data)
                        if result.get('success'):
                            print("✓ Data sent to cloud")
                        else:
                            print(f"✗ Cloud sync failed: {result.get('error')}")
                    else:
                        print("⚠ Cloud sync skipped: Device not registered")
                    
                except Exception as e:
                    print(f"Error in sensor loop: {e}")
                
                # Sleep for interval
                time.sleep(self.sensor_interval)
        
        # Start in background thread
        sensor_thread = threading.Thread(target=sensor_loop, daemon=True)
        sensor_thread.start()
        print("✓ Sensor loop started")
    
    def start_all(self):
        """
        Start all device services.
        """
        print("\n" + "=" * 60)
        print("STARTING ALL DEVICE SERVICES")
        print("=" * 60)
        
        # Start local API
        self.start_local_api()
        
        # Start heartbeat
        self.start_heartbeat()
        
        # Start sensor loop
        self.start_sensor_loop()
        
        print("=" * 60)
        print("✓ ALL SERVICES STARTED")
        print("=" * 60)
        print("\nDevice is now running!")
        print(f"- Local API: http://localhost:5000")
        print(f"- Device ID: {self.device_identity['deviceId']}")
        print(f"- Registered: {self.device_identity['registered']}")
        print(f"- VPS URL: {self.vps_url}")
        print("\nPress Ctrl+C to stop")
        print("=" * 60 + "\n")
    
    def stop_all(self):
        """
        Stop all device services.
        """
        print("\nStopping all services...")
        
        # Stop sensor loop
        self.running = False
        
        # Stop heartbeat
        self.heartbeat.stop()
        
        print("✓ All services stopped")
    
    def get_status(self):
        """
        Get status of all device services.
        
        Returns:
            dict: Complete device status
        """
        return {
            "device_id": self.device_identity['deviceId'],
            "registered": self.device_identity['registered'],
            "device_name": self.device_identity.get('deviceName'),
            "vps_url": self.vps_url,
            "sensors": self.sensors.get_status(),
            "sender": self.sender.get_status(),
            "heartbeat": self.heartbeat.get_status(),
            "sensor_loop_running": self.running
        }


def main():
    """
    Main entry point for device system.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="BAYYTI Device System")
    parser.add_argument("--vps-url", default=None, help=f"VPS server URL (default: auto-detect)")
    parser.add_argument("--sensor-interval", type=int, default=60, help="Sensor reading interval (seconds)")
    parser.add_argument("--heartbeat-interval", type=int, default=300, help="Heartbeat interval (seconds)")
    parser.add_argument("--env", choices=["local", "cloud"], default="cloud", help="Environment: local or cloud")
    
    args = parser.parse_args()
    
    # Set environment
    config.DeviceConfig.ENVIRONMENT = args.env
    
    # Create orchestrator
    orchestrator = DeviceOrchestrator(
        vps_url=args.vps_url,
        sensor_interval=args.sensor_interval,
        heartbeat_interval=args.heartbeat_interval
    )
    
    # Start all services
    orchestrator.start_all()
    
    try:
        # Keep running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\nShutdown requested...")
        orchestrator.stop_all()
        print("Goodbye!")


if __name__ == "__main__":
    main()
