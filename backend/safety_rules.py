"""
Local Safety Rules Engine - CRITICAL COMPONENT
This module ensures the Raspberry Pi maintains final authority over all irrigation decisions.
NO cloud AI can override these safety rules.
"""

import logging
from datetime import datetime
from database import create_alert, log_irrigation_event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SafetyRulesEngine:
    """
    Local safety rules that ALWAYS run before any irrigation action.
    These rules protect the system and ensure safe operation even if cloud AI fails.
    """
    
    def __init__(self):
        self.min_battery_voltage = 11.5
        self.critical_battery_voltage = 10.5
        self.max_soil_moisture = 40
        self.min_soil_moisture = 10
        self.max_temperature = 50
        self.min_temperature = 0
        self.max_consecutive_irrigations = 5
        self.min_irrigation_interval = 1800
        self.max_daily_water_usage = 100
        
        self.last_irrigation_time = None
        self.consecutive_irrigations = 0
        self.daily_water_usage = 0
        self.last_reset_date = datetime.now().date()
        
        logger.info("Safety Rules Engine initialized - Pi has final authority")
    
    def validate_irrigation_request(self, sensor_data, system_status, ai_recommendation=None):
        """
        CRITICAL: Validates any irrigation request against local safety rules.
        Returns: (allowed: bool, reason: str, modified_duration: int)
        
        This function MUST be called before ANY irrigation action.
        Cloud AI recommendations are advisory only - Pi decides.
        """
        
        self._reset_daily_counters()
        
        checks = [
            self._check_battery_level(system_status),
            self._check_soil_moisture(sensor_data),
            self._check_temperature(sensor_data),
            self._check_leak_detection(system_status),
            self._check_irrigation_interval(),
            self._check_consecutive_irrigations(),
            self._check_daily_water_limit(),
            self._check_system_health(system_status)
        ]
        
        for allowed, reason in checks:
            if not allowed:
                logger.warning(f"SAFETY BLOCK: {reason}")
                create_alert('safety_block', 'warning', f'Irrigation blocked: {reason}')
                return False, reason, 0
        
        duration = self._calculate_safe_duration(sensor_data, ai_recommendation)
        
        logger.info(f"SAFETY CHECK PASSED - Irrigation allowed for {duration}s")
        return True, "All safety checks passed", duration
    
    def _check_battery_level(self, system_status):
        """CRITICAL: Prevent irrigation if battery is too low"""
        battery = system_status.get('battery_level', 0)
        
        if battery < self.critical_battery_voltage:
            return False, f"CRITICAL: Battery too low ({battery}V < {self.critical_battery_voltage}V)"
        
        if battery < self.min_battery_voltage:
            return False, f"Battery low ({battery}V < {self.min_battery_voltage}V)"
        
        return True, "Battery level OK"
    
    def _check_soil_moisture(self, sensor_data):
        """Skip irrigation if soil is already wet enough"""
        moisture = sensor_data.get('soil_moisture', 0)
        
        if moisture > self.max_soil_moisture:
            return False, f"Soil already wet ({moisture}% > {self.max_soil_moisture}%)"
        
        if moisture < self.min_soil_moisture:
            logger.warning(f"Soil extremely dry ({moisture}%), allowing irrigation")
        
        return True, "Soil moisture in acceptable range"
    
    def _check_temperature(self, sensor_data):
        """Prevent irrigation in extreme temperatures"""
        temp = sensor_data.get('temperature', 25)
        
        if temp > self.max_temperature:
            return False, f"Temperature too high ({temp}°C > {self.max_temperature}°C)"
        
        if temp < self.min_temperature:
            return False, f"Temperature too low ({temp}°C < {self.min_temperature}°C) - Risk of freezing"
        
        return True, "Temperature in safe range"
    
    def _check_leak_detection(self, system_status):
        """CRITICAL: Never irrigate if leak detected"""
        leak_detected = system_status.get('leak_detected', False)
        
        if leak_detected:
            return False, "CRITICAL: Leak detected - irrigation disabled for safety"
        
        return True, "No leak detected"
    
    def _check_irrigation_interval(self):
        """Prevent too frequent irrigation"""
        if self.last_irrigation_time is None:
            return True, "First irrigation"
        
        time_since_last = (datetime.now() - self.last_irrigation_time).total_seconds()
        
        if time_since_last < self.min_irrigation_interval:
            remaining = int(self.min_irrigation_interval - time_since_last)
            return False, f"Too soon since last irrigation (wait {remaining}s more)"
        
        return True, "Sufficient time since last irrigation"
    
    def _check_consecutive_irrigations(self):
        """Prevent system abuse - limit consecutive irrigations"""
        if self.consecutive_irrigations >= self.max_consecutive_irrigations:
            return False, f"Too many consecutive irrigations ({self.consecutive_irrigations})"
        
        return True, "Consecutive irrigation count OK"
    
    def _check_daily_water_limit(self):
        """Prevent excessive daily water usage"""
        if self.daily_water_usage >= self.max_daily_water_usage:
            return False, f"Daily water limit reached ({self.daily_water_usage}L / {self.max_daily_water_usage}L)"
        
        return True, "Daily water usage within limits"
    
    def _check_system_health(self, system_status):
        """Check overall system health"""
        valve_state = system_status.get('valve_state', 'OFF')
        
        if valve_state == 'ON':
            return False, "Valve already open - cannot start new irrigation"
        
        return True, "System health OK"
    
    def _calculate_safe_duration(self, sensor_data, ai_recommendation):
        """
        Calculate safe irrigation duration.
        Takes AI recommendation into account but applies local limits.
        """
        
        if ai_recommendation and 'duration' in ai_recommendation:
            ai_duration = ai_recommendation['duration']
        else:
            moisture = sensor_data.get('soil_moisture', 30)
            if moisture < 20:
                ai_duration = 600
            elif moisture < 30:
                ai_duration = 300
            else:
                ai_duration = 180
        
        max_duration = 1800
        min_duration = 60
        
        safe_duration = max(min_duration, min(ai_duration, max_duration))
        
        remaining_water_budget = self.max_daily_water_usage - self.daily_water_usage
        water_rate = 0.05
        max_duration_by_budget = int(remaining_water_budget / water_rate)
        
        final_duration = min(safe_duration, max_duration_by_budget)
        
        if final_duration != ai_duration:
            logger.info(f"Duration adjusted: AI={ai_duration}s, Safe={final_duration}s")
        
        return final_duration
    
    def record_irrigation_start(self):
        """Record that irrigation has started"""
        self.last_irrigation_time = datetime.now()
        self.consecutive_irrigations += 1
        logger.info(f"Irrigation started - Consecutive count: {self.consecutive_irrigations}")
    
    def record_irrigation_complete(self, water_used):
        """Record irrigation completion and water usage"""
        self.daily_water_usage += water_used
        logger.info(f"Irrigation complete - Daily usage: {self.daily_water_usage:.2f}L")
    
    def reset_consecutive_count(self):
        """Reset consecutive irrigation counter (call after successful wait period)"""
        self.consecutive_irrigations = 0
        logger.info("Consecutive irrigation counter reset")
    
    def _reset_daily_counters(self):
        """Reset daily counters at midnight"""
        today = datetime.now().date()
        if today > self.last_reset_date:
            self.daily_water_usage = 0
            self.consecutive_irrigations = 0
            self.last_reset_date = today
            logger.info("Daily counters reset")
    
    def get_safety_status(self):
        """Get current safety status for monitoring"""
        return {
            'battery_min': self.min_battery_voltage,
            'last_irrigation': self.last_irrigation_time.isoformat() if self.last_irrigation_time else None,
            'consecutive_irrigations': self.consecutive_irrigations,
            'daily_water_usage': round(self.daily_water_usage, 2),
            'max_daily_water': self.max_daily_water_usage,
            'safety_enabled': True,
            'pi_has_authority': True
        }
    
    def emergency_override_disable(self):
        """
        Emergency function to completely disable irrigation.
        Can only be re-enabled manually.
        """
        logger.critical("EMERGENCY OVERRIDE: All irrigation disabled")
        create_alert('emergency_override', 'critical', 'Emergency override activated - irrigation disabled')
        return True

class CloudAIValidator:
    """
    Validates cloud AI recommendations before execution.
    Pi maintains final authority - cloud AI is advisory only.
    """
    
    def __init__(self):
        self.min_confidence = 0.6
        self.max_confidence = 1.0
        self.trusted_actions = ['IRRIGATE', 'SKIP', 'WAIT']
        
        logger.info("Cloud AI Validator initialized - Pi validates all AI decisions")
    
    def validate_ai_recommendation(self, ai_response, sensor_data, system_status):
        """
        Validate cloud AI recommendation.
        Returns: (valid: bool, reason: str, sanitized_recommendation: dict)
        """
        
        if not ai_response:
            return False, "No AI response received", None
        
        checks = [
            self._check_response_structure(ai_response),
            self._check_confidence_level(ai_response),
            self._check_action_validity(ai_response),
            self._check_duration_sanity(ai_response),
            self._check_consistency_with_sensors(ai_response, sensor_data)
        ]
        
        for valid, reason in checks:
            if not valid:
                logger.warning(f"AI VALIDATION FAILED: {reason}")
                return False, reason, None
        
        sanitized = self._sanitize_recommendation(ai_response)
        logger.info(f"AI recommendation validated: {sanitized['action']} for {sanitized['duration']}s")
        
        return True, "AI recommendation valid", sanitized
    
    def _check_response_structure(self, ai_response):
        """Ensure AI response has required fields"""
        required_fields = ['action', 'confidence']
        
        for field in required_fields:
            if field not in ai_response:
                return False, f"Missing required field: {field}"
        
        return True, "Response structure valid"
    
    def _check_confidence_level(self, ai_response):
        """Validate AI confidence level"""
        confidence = ai_response.get('confidence', 0)
        
        if confidence < self.min_confidence:
            return False, f"AI confidence too low ({confidence} < {self.min_confidence})"
        
        if confidence > self.max_confidence:
            return False, f"AI confidence invalid ({confidence} > {self.max_confidence})"
        
        return True, "Confidence level acceptable"
    
    def _check_action_validity(self, ai_response):
        """Validate recommended action"""
        action = ai_response.get('action', '').upper()
        
        if action not in self.trusted_actions:
            return False, f"Unknown action: {action}"
        
        return True, "Action is valid"
    
    def _check_duration_sanity(self, ai_response):
        """Validate irrigation duration"""
        if ai_response.get('action') != 'IRRIGATE':
            return True, "No duration check needed"
        
        duration = ai_response.get('duration', 0)
        
        if duration < 0:
            return False, "Negative duration not allowed"
        
        if duration > 3600:
            return False, f"Duration too long ({duration}s > 3600s)"
        
        return True, "Duration is reasonable"
    
    def _check_consistency_with_sensors(self, ai_response, sensor_data):
        """Check if AI recommendation makes sense given sensor data"""
        action = ai_response.get('action', '').upper()
        moisture = sensor_data.get('soil_moisture', 50)
        
        if action == 'IRRIGATE' and moisture > 60:
            return False, f"AI wants to irrigate but soil is wet ({moisture}%)"
        
        if action == 'SKIP' and moisture < 15:
            logger.warning(f"AI wants to skip but soil is very dry ({moisture}%)")
        
        return True, "AI recommendation consistent with sensors"
    
    def _sanitize_recommendation(self, ai_response):
        """Sanitize and normalize AI recommendation"""
        return {
            'action': ai_response.get('action', 'SKIP').upper(),
            'duration': int(ai_response.get('duration', 300)),
            'confidence': float(ai_response.get('confidence', 0)),
            'reason': ai_response.get('reason', 'No reason provided'),
            'source': 'cloud_ai',
            'validated_by': 'pi_local',
            'timestamp': datetime.now().isoformat()
        }

if __name__ == '__main__':
    safety = SafetyRulesEngine()
    
    test_sensor_data = {
        'soil_moisture': 25,
        'temperature': 28,
        'humidity': 60,
        'flow_rate': 0,
        'pressure': 2.5
    }
    
    test_system_status = {
        'battery_level': 12.5,
        'solar_status': 'charging',
        'leak_detected': False,
        'valve_state': 'OFF'
    }
    
    test_ai_recommendation = {
        'action': 'IRRIGATE',
        'duration': 450,
        'confidence': 0.85,
        'reason': 'Soil dry, hot weather expected'
    }
    
    print("Testing Safety Rules Engine...")
    allowed, reason, duration = safety.validate_irrigation_request(
        test_sensor_data, 
        test_system_status, 
        test_ai_recommendation
    )
    
    print(f"Result: {allowed}")
    print(f"Reason: {reason}")
    print(f"Duration: {duration}s")
    print(f"Status: {safety.get_safety_status()}")
    
    print("\nTesting Cloud AI Validator...")
    validator = CloudAIValidator()
    valid, reason, sanitized = validator.validate_ai_recommendation(
        test_ai_recommendation,
        test_sensor_data,
        test_system_status
    )
    
    print(f"Valid: {valid}")
    print(f"Reason: {reason}")
    print(f"Sanitized: {sanitized}")
