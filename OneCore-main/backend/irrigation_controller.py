import time
from datetime import datetime

try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    GPIO_AVAILABLE = False

class IrrigationController:
    def __init__(self):
        self.gpio_available = GPIO_AVAILABLE
        self.active_zones = {}
        self.valve_pins = {
            1: 17,
            2: 27,
            3: 22,
            4: 23,
            5: 24,
            6: 25,
            7: 5,
            8: 6
        }
        
        if self.gpio_available:
            self.setup_gpio()
        
        print(f"Irrigation Controller initialized (GPIO: {self.gpio_available})")
    
    def setup_gpio(self):
        try:
            GPIO.setmode(GPIO.BCM)
            for pin in self.valve_pins.values():
                GPIO.setup(pin, GPIO.OUT)
                GPIO.output(pin, GPIO.LOW)
            print("GPIO initialized for irrigation valves")
        except Exception as e:
            print(f"GPIO setup failed: {e}")
            self.gpio_available = False
    
    def start_irrigation(self, zone_id, duration, trigger='manual'):
        if zone_id in self.active_zones:
            return {
                'success': False,
                'message': f'Zone {zone_id} already irrigating'
            }
        
        try:
            if self.gpio_available and zone_id in self.valve_pins:
                GPIO.output(self.valve_pins[zone_id], GPIO.HIGH)
            
            self.active_zones[zone_id] = {
                'start_time': datetime.now(),
                'duration': duration,
                'trigger': trigger
            }
            
            print(f"Zone {zone_id} irrigation started ({trigger}) - {duration}s")
            
            return {
                'success': True,
                'message': f'Zone {zone_id} irrigation started',
                'zone_id': zone_id,
                'duration': duration
            }
        except Exception as e:
            print(f"Error starting irrigation: {e}")
            return {
                'success': False,
                'message': str(e)
            }
    
    def stop_irrigation(self, zone_id):
        if zone_id not in self.active_zones:
            return {
                'success': False,
                'message': f'Zone {zone_id} not irrigating'
            }
        
        try:
            if self.gpio_available and zone_id in self.valve_pins:
                GPIO.output(self.valve_pins[zone_id], GPIO.LOW)
            
            zone_info = self.active_zones[zone_id]
            elapsed = (datetime.now() - zone_info['start_time']).total_seconds()
            
            del self.active_zones[zone_id]
            
            print(f"Zone {zone_id} irrigation stopped - {elapsed:.0f}s elapsed")
            
            return {
                'success': True,
                'message': f'Zone {zone_id} irrigation stopped',
                'zone_id': zone_id,
                'elapsed_time': elapsed
            }
        except Exception as e:
            print(f"Error stopping irrigation: {e}")
            return {
                'success': False,
                'message': str(e)
            }
    
    def stop_all_zones(self):
        results = []
        for zone_id in list(self.active_zones.keys()):
            result = self.stop_irrigation(zone_id)
            results.append(result)
        return results
    
    def get_status(self):
        active_zones_info = {}
        for zone_id, info in self.active_zones.items():
            elapsed = (datetime.now() - info['start_time']).total_seconds()
            remaining = max(0, info['duration'] - elapsed)
            
            active_zones_info[zone_id] = {
                'elapsed': round(elapsed, 0),
                'remaining': round(remaining, 0),
                'trigger': info['trigger']
            }
        
        return {
            'active_zones': active_zones_info,
            'total_active': len(self.active_zones),
            'timestamp': datetime.now().isoformat()
        }
    
    def cleanup(self):
        self.stop_all_zones()
        if self.gpio_available:
            GPIO.cleanup()

if __name__ == '__main__':
    import json
    controller = IrrigationController()
    
    controller.start_irrigation(1, 300, 'test')
    time.sleep(2)
    status = controller.get_status()
    print(json.dumps(status, indent=2))
    
    controller.stop_irrigation(1)
