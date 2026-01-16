"""
Sensors Module
Wrapper for reading all sensor data.
Provides unified interface for sensor access.
"""

import sys
import os

# Add parent directory to path to import sensor_reader
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    from sensor_reader import SensorReader
except ImportError:
    print("Warning: sensor_reader not found, using mock data")
    SensorReader = None

class Sensors:
    """
    Unified sensor interface.
    Wraps existing SensorReader or provides mock data.
    """
    
    def __init__(self):
        """Initialize sensor reader."""
        if SensorReader:
            try:
                self.reader = SensorReader()
                self.mock_mode = False
                print("Sensors initialized: Real hardware mode")
            except Exception as e:
                print(f"Failed to initialize sensor reader: {e}")
                self.reader = None
                self.mock_mode = True
                print("Sensors initialized: Mock mode")
        else:
            self.reader = None
            self.mock_mode = True
            print("Sensors initialized: Mock mode")
    
    def read_all(self):
        """
        Read all sensor data.
        
        Returns:
            dict: All sensor readings
        """
        if self.mock_mode or not self.reader:
            return self._get_mock_data()
        
        try:
            return self.reader.read_all_sensors()
        except Exception as e:
            print(f"Error reading sensors: {e}")
            return self._get_mock_data()
    
    def read_soil_moisture(self):
        """Read soil moisture sensor."""
        data = self.read_all()
        return data.get("soil_moisture", 0)
    
    def read_temperature(self):
        """Read temperature sensor."""
        data = self.read_all()
        return data.get("temperature", 0)
    
    def read_humidity(self):
        """Read humidity sensor."""
        data = self.read_all()
        return data.get("humidity", 0)
    
    def read_water_flow(self):
        """Read water flow sensor."""
        data = self.read_all()
        return data.get("water_flow", 0)
    
    def read_water_pressure(self):
        """Read water pressure sensor."""
        data = self.read_all()
        return data.get("water_pressure", 0)
    
    def read_battery_voltage(self):
        """Read battery voltage."""
        data = self.read_all()
        return data.get("battery_voltage", 0)
    
    def read_solar_voltage(self):
        """Read solar panel voltage."""
        data = self.read_all()
        return data.get("solar_voltage", 0)
    
    def _get_mock_data(self):
        """
        Get mock sensor data for testing.
        
        Returns:
            dict: Mock sensor readings
        """
        import random
        
        return {
            "soil_moisture": round(random.uniform(30, 70), 1),
            "temperature": round(random.uniform(20, 30), 1),
            "humidity": round(random.uniform(40, 80), 1),
            "water_flow": round(random.uniform(0, 20), 1),
            "water_pressure": round(random.uniform(2, 3), 1),
            "battery_voltage": round(random.uniform(11.5, 12.8), 1),
            "solar_voltage": round(random.uniform(15, 20), 1)
        }
    
    def get_status(self):
        """
        Get sensor system status.
        
        Returns:
            dict: Sensor status information
        """
        return {
            "mode": "mock" if self.mock_mode else "hardware",
            "available": not self.mock_mode,
            "reader_initialized": self.reader is not None
        }


# Create singleton instance
_sensors = Sensors()

def read_all_sensors():
    """
    Read all sensors (convenience function).
    
    Returns:
        dict: All sensor readings
    """
    return _sensors.read_all()

def get_sensor_status():
    """
    Get sensor status (convenience function).
    
    Returns:
        dict: Sensor status
    """
    return _sensors.get_status()
