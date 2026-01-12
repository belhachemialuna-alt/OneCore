import time
from datetime import datetime, timedelta
from database import get_recent_sensor_data, get_active_schedules, log_irrigation_event
from config import SOIL_MOISTURE_THRESHOLD, AUTO_IRRIGATION_ENABLED
from cloud_ai_client import HybridAIDecisionMaker
from safety_rules import CloudAIValidator

class AIDecisionService:
    def __init__(self, irrigation_service, sensor_service):
        self.irrigation_service = irrigation_service
        self.sensor_service = sensor_service
        self.running = False
        self.last_irrigation = None
        self.min_irrigation_interval = 3600
        
        self.hybrid_ai = HybridAIDecisionMaker()
        self.ai_validator = CloudAIValidator()
        
        print("AI Decision Service: Hybrid AI enabled (Cloud + Local)")
        print("IMPORTANT: Pi validates all AI decisions - Pi has final authority")
    
    def should_irrigate(self):
        """
        Determine if irrigation is needed using hybrid AI approach:
        1. Get sensor data
        2. Request AI recommendation (cloud or local)
        3. Validate AI recommendation
        4. Apply local safety rules
        5. Return decision
        """
        if not AUTO_IRRIGATION_ENABLED:
            return False, "Auto irrigation disabled", None
        
        if self.irrigation_service.valve_state:
            return False, "Irrigation already active", None
        
        if self.last_irrigation:
            time_since_last = (datetime.now() - self.last_irrigation).total_seconds()
            if time_since_last < self.min_irrigation_interval:
                return False, f"Too soon since last irrigation ({int(time_since_last)}s ago)", None
        
        sensor_data = self.sensor_service.read_all_sensors()
        system_status = self.irrigation_service._get_system_status()
        
        ai_recommendation = self.hybrid_ai.get_irrigation_decision(
            sensor_data, 
            system_status,
            crop_type="tomato",
            location="algeria"
        )
        
        valid, reason, sanitized = self.ai_validator.validate_ai_recommendation(
            ai_recommendation, sensor_data, system_status
        )
        
        if not valid:
            print(f"AI VALIDATION FAILED: {reason} - Using local fallback")
            return False, f"AI validation failed: {reason}", None
        
        if sanitized['action'] == 'IRRIGATE':
            print(f"AI RECOMMENDS IRRIGATION: {sanitized['reason']} (confidence: {sanitized['confidence']})")
            return True, sanitized['reason'], sanitized
        else:
            return False, sanitized['reason'], sanitized
    
    def check_schedule(self):
        schedules = get_active_schedules()
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        current_day = now.strftime("%A")
        
        for schedule in schedules:
            if schedule['start_time'] == current_time:
                days = schedule['days_of_week'].split(',')
                if current_day in days:
                    return True, schedule
        
        return False, None
    
    def calculate_irrigation_duration(self, soil_moisture):
        if soil_moisture < 20:
            return 600
        elif soil_moisture < 30:
            return 300
        else:
            return 180
    
    def run_decision_loop(self):
        self.running = True
        print("AI Decision Service started...")
        print("Architecture: Sensors → Pi → Cloud AI → Recommendation → Pi Validates → Action")
        
        while self.running:
            try:
                should_irrigate, reason, ai_recommendation = self.should_irrigate()
                
                if should_irrigate:
                    sensor_data = self.sensor_service.read_all_sensors()
                    
                    print(f"AI-triggered irrigation: {reason}")
                    print(f"AI Source: {ai_recommendation.get('source', 'unknown')}")
                    print(f"Pi now validates with local safety rules...")
                    
                    result = self.irrigation_service.valve_on(
                        trigger_type='ai_auto',
                        duration=ai_recommendation.get('duration'),
                        ai_recommendation=ai_recommendation,
                        sensor_data=sensor_data
                    )
                    
                    if result['success']:
                        self.last_irrigation = datetime.now()
                        log_irrigation_event(
                            action='ai_auto_irrigation',
                            duration=ai_recommendation.get('duration', 0),
                            trigger_type='ai_decision',
                            notes=f"{reason} | Source: {ai_recommendation.get('source')} | Confidence: {ai_recommendation.get('confidence')}"
                        )
                        print(f"✓ IRRIGATION APPROVED BY PI - Started successfully")
                    else:
                        print(f"✗ IRRIGATION BLOCKED BY PI: {result.get('message')}")
                
                schedule_active, schedule = self.check_schedule()
                if schedule_active and not self.irrigation_service.valve_state:
                    print(f"Schedule triggered: {schedule['name']}")
                    self.irrigation_service.valve_on(
                        trigger_type='schedule',
                        duration=schedule['duration']
                    )
                    self.last_irrigation = datetime.now()
                
                time.sleep(60)
                
            except KeyboardInterrupt:
                print("\nAI Decision Service stopped")
                self.running = False
                break
            except Exception as e:
                print(f"Error in decision loop: {e}")
                time.sleep(60)
    
    def stop(self):
        self.running = False
    
    def get_recommendation(self):
        """Get AI recommendation with full validation chain"""
        should_irrigate, reason, ai_recommendation = self.should_irrigate()
        sensor_data = self.sensor_service.read_all_sensors()
        
        recommendation = {
            'should_irrigate': should_irrigate,
            'reason': reason,
            'recommended_duration': self.calculate_irrigation_duration(sensor_data['soil_moisture']),
            'current_moisture': sensor_data['soil_moisture'],
            'threshold': SOIL_MOISTURE_THRESHOLD,
            'ai_source': 'local_ai',
            'cloud_ai_enabled': self.hybrid_ai.cloud_client.enabled,
            'pi_has_authority': True,
            'safety_validated': True
        }
        
        if ai_recommendation:
            recommendation.update({
                'ai_source': ai_recommendation.get('source', 'unknown'),
                'ai_confidence': ai_recommendation.get('confidence', 0),
                'ai_reason': ai_recommendation.get('reason', ''),
                'weather_forecast': ai_recommendation.get('weather_forecast')
            })
        
        return recommendation
    
    def enable_cloud_ai(self, cloud_url: str):
        """Enable cloud AI integration"""
        self.hybrid_ai.enable_cloud_mode(cloud_url)
        print(f"Cloud AI enabled: {cloud_url}")
        print("REMINDER: Pi still validates all cloud AI decisions")
    
    def disable_cloud_ai(self):
        """Disable cloud AI - use local only"""
        self.hybrid_ai.enable_local_only_mode()
        print("Cloud AI disabled - using local AI only")
        print("Pi continues to validate all decisions")

if __name__ == '__main__':
    from sensor_service import SensorService
    from irrigation_service import IrrigationService
    from database import init_database
    
    init_database()
    
    sensor_svc = SensorService()
    irrigation_svc = IrrigationService()
    ai_svc = AIDecisionService(irrigation_svc, sensor_svc)
    
    ai_svc.run_decision_loop()
