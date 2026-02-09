import random
from datetime import datetime

try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    GPIO_AVAILABLE = False

class EnergyManager:
    def __init__(self):
        self.gpio_available = GPIO_AVAILABLE
        self.battery_voltage = 12.5
        self.solar_current = 0.0
        
        print(f"Energy Manager initialized (GPIO: {self.gpio_available})")
    
    def read_battery_voltage(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading battery voltage: {e}")
                return self._simulate_battery_voltage()
        else:
            return self._simulate_battery_voltage()
    
    def read_solar_current(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading solar current: {e}")
                return self._simulate_solar_current()
        else:
            return self._simulate_solar_current()
    
    def _simulate_battery_voltage(self):
        hour = datetime.now().hour
        
        if 8 <= hour <= 17:
            base = 12.8
            variation = random.uniform(-0.2, 0.3)
        else:
            base = 12.3
            variation = random.uniform(-0.3, 0.1)
        
        self.battery_voltage = round(base + variation, 2)
        return self.battery_voltage
    
    def _simulate_solar_current(self):
        hour = datetime.now().hour
        
        if 6 <= hour <= 18:
            peak_hour = 12
            distance_from_peak = abs(hour - peak_hour)
            base_current = max(0, 3.0 - (distance_from_peak * 0.4))
            variation = random.uniform(-0.2, 0.2)
            self.solar_current = round(max(0, base_current + variation), 2)
        else:
            self.solar_current = 0.0
        
        return self.solar_current
    
    def get_battery_percentage(self):
        voltage = self.read_battery_voltage()
        
        min_voltage = 11.0
        max_voltage = 13.0
        
        percentage = ((voltage - min_voltage) / (max_voltage - min_voltage)) * 100
        return round(max(0, min(100, percentage)), 1)
    
    def get_solar_status(self):
        current = self.read_solar_current()
        
        if current > 1.5:
            return "charging"
        elif current > 0.5:
            return "low_charge"
        else:
            return "not_charging"
    
    def is_battery_sufficient(self, min_voltage=11.5):
        voltage = self.read_battery_voltage()
        return voltage >= min_voltage
    
    def get_status(self):
        voltage = self.read_battery_voltage()
        current = self.read_solar_current()
        percentage = self.get_battery_percentage()
        status = self.get_solar_status()
        
        return {
            'battery_voltage': voltage,
            'battery_percentage': percentage,
            'solar_current': current,
            'solar_status': status,
            'battery_sufficient': self.is_battery_sufficient(),
            'timestamp': datetime.now().isoformat()
        }

if __name__ == '__main__':
    import json
    manager = EnergyManager()
    status = manager.get_status()
    print(json.dumps(status, indent=2))
