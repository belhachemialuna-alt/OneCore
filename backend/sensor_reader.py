import random
import json
import os
from datetime import datetime

try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    GPIO_AVAILABLE = False

class SensorReader:
    def __init__(self):
        self.gpio_available = GPIO_AVAILABLE
        self.calibration = self.load_calibration()
        
        if self.gpio_available:
            self.setup_gpio()
        
        print(f"Sensor Reader initialized (GPIO: {self.gpio_available})")
    
    def load_calibration(self):
        data_dir = os.path.join(os.path.dirname(__file__), 'data')
        calib_file = os.path.join(data_dir, 'sensor_calibration.json')
        
        try:
            with open(calib_file, 'r') as f:
                data = json.load(f)
                return data.get('sensor_calibration', {})
        except FileNotFoundError:
            return {}
    
    def setup_gpio(self):
        try:
            GPIO.setmode(GPIO.BCM)
            print("GPIO initialized for sensors")
        except Exception as e:
            print(f"GPIO setup failed: {e}")
            self.gpio_available = False
    
    def read_soil_moisture(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading soil moisture: {e}")
                return self._simulate_soil_moisture()
        else:
            return self._simulate_soil_moisture()
    
    def read_temperature(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading temperature: {e}")
                return self._simulate_temperature()
        else:
            return self._simulate_temperature()
    
    def read_humidity(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading humidity: {e}")
                return self._simulate_humidity()
        else:
            return self._simulate_humidity()
    
    def read_flow_rate(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading flow rate: {e}")
                return 0.0
        else:
            return 0.0
    
    def read_pressure(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading pressure: {e}")
                return self._simulate_pressure()
        else:
            return self._simulate_pressure()
    
    def _simulate_soil_moisture(self):
        base = 35
        variation = random.uniform(-8, 8)
        return round(max(10, min(90, base + variation)), 1)
    
    def _simulate_temperature(self):
        hour = datetime.now().hour
        if 6 <= hour <= 12:
            base = 20 + (hour - 6) * 1.5
        elif 12 < hour <= 18:
            base = 29 - (hour - 12) * 1.0
        else:
            base = 18
        
        variation = random.uniform(-2, 2)
        return round(base + variation, 1)
    
    def _simulate_humidity(self):
        temp = self._simulate_temperature()
        base_humidity = 80 - (temp - 15) * 1.5
        variation = random.uniform(-5, 5)
        return round(max(30, min(90, base_humidity + variation)), 1)
    
    def _simulate_pressure(self):
        base = 2.5
        variation = random.uniform(-0.2, 0.2)
        return round(base + variation, 2)
    
    def read_all_sensors(self):
        return {
            'soil_moisture': self.read_soil_moisture(),
            'temperature': self.read_temperature(),
            'humidity': self.read_humidity(),
            'flow_rate': self.read_flow_rate(),
            'pressure': self.read_pressure(),
            'timestamp': datetime.now().isoformat()
        }
    
    def cleanup(self):
        if self.gpio_available:
            GPIO.cleanup()

if __name__ == '__main__':
    reader = SensorReader()
    sensors = reader.read_all_sensors()
    print(json.dumps(sensors, indent=2))
