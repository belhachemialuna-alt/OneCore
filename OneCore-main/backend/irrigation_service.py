import time
from datetime import datetime
from database import log_irrigation_event, save_system_status, create_alert
from config import (ENABLE_GPIO, VALVE_GPIO_PIN, RELAY_GPIO_PIN, 
                    LEAK_DETECTION_ENABLED, MAX_IRRIGATION_DURATION)
from safety_rules import SafetyRulesEngine

try:
    if ENABLE_GPIO:
        import RPi.GPIO as GPIO
        GPIO_AVAILABLE = True
    else:
        GPIO_AVAILABLE = False
except ImportError:
    GPIO_AVAILABLE = False
    print("GPIO library not available. Running in simulation mode.")

class IrrigationService:
    def __init__(self):
        self.gpio_available = GPIO_AVAILABLE
        self.valve_state = False
        self.leak_detected = False
        self.irrigation_start_time = None
        self.total_water_used = 0
        self.battery_level = 12.5
        
        self.safety_engine = SafetyRulesEngine()
        print("SAFETY: Local safety rules engine active - Pi has final authority")
        
        if self.gpio_available:
            self.setup_gpio()
    
    def setup_gpio(self):
        try:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(VALVE_GPIO_PIN, GPIO.OUT)
            GPIO.setup(RELAY_GPIO_PIN, GPIO.OUT)
            GPIO.output(VALVE_GPIO_PIN, GPIO.LOW)
            GPIO.output(RELAY_GPIO_PIN, GPIO.LOW)
            print("GPIO for irrigation initialized")
        except Exception as e:
            print(f"GPIO setup failed: {e}")
            self.gpio_available = False
    
    def check_leak(self):
        if not LEAK_DETECTION_ENABLED:
            return False
        
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error checking leak: {e}")
                return False
        
        return self.leak_detected
    
    def valve_on(self, trigger_type='manual', duration=None, ai_recommendation=None, sensor_data=None):
        sensor_data = sensor_data or {}
        system_status = self._get_system_status()
        
        allowed, reason, safe_duration = self.safety_engine.validate_irrigation_request(
            sensor_data, system_status, ai_recommendation
        )
        
        if not allowed:
            print(f"SAFETY BLOCK: {reason}")
            return {
                'success': False,
                'message': f'Safety check failed: {reason}',
                'blocked_by': 'local_safety_rules'
            }
        
        if duration is None:
            duration = safe_duration
        else:
            duration = min(duration, safe_duration)
        
        if self.valve_state:
            return {
                'success': False,
                'message': 'Valve already open'
            }
        
        try:
            if self.gpio_available:
                GPIO.output(VALVE_GPIO_PIN, GPIO.HIGH)
                GPIO.output(RELAY_GPIO_PIN, GPIO.HIGH)
            
            self.valve_state = True
            self.irrigation_start_time = datetime.now()
            
            self.safety_engine.record_irrigation_start()
            
            ai_info = ''
            if ai_recommendation:
                ai_info = f" | AI: {ai_recommendation.get('source', 'unknown')}"
            
            log_irrigation_event(
                action='valve_opened',
                trigger_type=trigger_type,
                notes=f'Duration: {duration}s | Safety validated{ai_info}'
            )
            
            print(f"SAFETY APPROVED: Valve OPENED ({trigger_type}) for {duration}s")
            
            if duration:
                time.sleep(min(duration, MAX_IRRIGATION_DURATION))
                return self.valve_off(auto_stop=True)
            
            return {
                'success': True,
                'message': 'Valve opened successfully',
                'valve_state': 'ON'
            }
        except Exception as e:
            print(f"Error opening valve: {e}")
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }
    
    def valve_off(self, auto_stop=False):
        if not self.valve_state:
            return {
                'success': False,
                'message': 'Valve already closed'
            }
        
        try:
            if self.gpio_available:
                GPIO.output(VALVE_GPIO_PIN, GPIO.LOW)
                GPIO.output(RELAY_GPIO_PIN, GPIO.LOW)
            
            self.valve_state = False
            
            duration = 0
            if self.irrigation_start_time:
                duration = int((datetime.now() - self.irrigation_start_time).total_seconds())
            
            water_used = duration * 0.05
            self.total_water_used += water_used
            
            self.safety_engine.record_irrigation_complete(water_used)
            
            log_irrigation_event(
                action='valve_closed',
                duration=duration,
                water_used=water_used,
                trigger_type='auto' if auto_stop else 'manual',
                notes=f'Total water: {water_used:.2f}L | Daily: {self.safety_engine.daily_water_usage:.2f}L'
            )
            
            print(f"Valve CLOSED (duration: {duration}s, water: {water_used:.2f}L)")
            
            return {
                'success': True,
                'message': 'Valve closed successfully',
                'valve_state': 'OFF',
                'duration': duration,
                'water_used': water_used
            }
        except Exception as e:
            print(f"Error closing valve: {e}")
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }
    
    def emergency_stop(self):
        print("EMERGENCY STOP ACTIVATED!")
        create_alert('emergency_stop', 'critical', 'Emergency stop triggered')
        return self.valve_off()
    
    def _get_system_status(self):
        """Get current system status for safety checks"""
        return {
            'battery_level': self.battery_level,
            'solar_status': 'charging' if self.battery_level < 95 else 'full',
            'leak_detected': self.leak_detected,
            'valve_state': 'ON' if self.valve_state else 'OFF'
        }
    
    def get_status(self):
        status = {
            'valve_state': 'ON' if self.valve_state else 'OFF',
            'leak_detected': self.leak_detected,
            'total_water_used': round(self.total_water_used, 2),
            'irrigation_active': self.valve_state,
            'start_time': self.irrigation_start_time.isoformat() if self.irrigation_start_time else None,
            'safety_status': self.safety_engine.get_safety_status(),
            'pi_authority': True
        }
        return status
    
    def cleanup(self):
        if self.gpio_available:
            self.valve_off()
            GPIO.cleanup()

if __name__ == '__main__':
    service = IrrigationService()
    
    print("Testing irrigation service...")
    print(service.valve_on(trigger_type='test', duration=5))
    time.sleep(1)
    print(service.get_status())
