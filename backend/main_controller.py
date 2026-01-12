import json
import os
from datetime import datetime
from sensor_reader import SensorReader
from energy_manager import EnergyManager
from irrigation_controller import IrrigationController
from ai_engine.decision_engine import DecisionEngine
from database import init_database, save_sensor_reading, log_irrigation_event

class MainController:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        
        self.system_config = self.load_system_config()
        self.crops_data = self.load_json('crops.json')
        self.soil_types_data = self.load_json('soil_types.json')
        self.irrigation_rules = self.load_json('irrigation_rules.json')
        self.system_limits = self.load_json('system_limits.json')
        
        self.sensor_reader = SensorReader()
        self.energy_manager = EnergyManager()
        self.irrigation_controller = IrrigationController()
        self.decision_engine = DecisionEngine(
            self.crops_data,
            self.soil_types_data,
            self.irrigation_rules
        )
        
        init_database()
        
        print("BAYYTI-B1 Main Controller initialized")
        print(f"System: {self.system_config.get('device_name', 'BAYYTI-B1')}")
        print(f"Setup completed: {self.system_config.get('setup_completed', False)}")
    
    def load_json(self, filename):
        filepath = os.path.join(self.data_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: {filename} not found")
            return {}
    
    def load_system_config(self):
        config_file = os.path.join(self.data_dir, 'system_config.json')
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            'device_name': 'BAYYTI-B1',
            'setup_completed': False,
            'zones': []
        }
    
    def save_system_config(self, config):
        config_file = os.path.join(self.data_dir, 'system_config.json')
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        self.system_config = config
    
    def get_system_status(self):
        sensors = self.sensor_reader.read_all_sensors()
        energy = self.energy_manager.get_status()
        irrigation = self.irrigation_controller.get_status()
        
        return {
            'device_name': self.system_config.get('device_name', 'BAYYTI-B1'),
            'setup_completed': self.system_config.get('setup_completed', False),
            'timestamp': datetime.now().isoformat(),
            'sensors': sensors,
            'energy': energy,
            'irrigation': irrigation,
            'zones': self.system_config.get('zones', [])
        }
    
    def get_crop_by_id(self, crop_id):
        for crop in self.crops_data.get('crops', []):
            if crop['id'] == crop_id:
                return crop
        return None
    
    def get_soil_by_id(self, soil_id):
        for soil in self.soil_types_data.get('soil_types', []):
            if soil['id'] == soil_id:
                return soil
        return None
    
    def get_zone_config(self, zone_id):
        for zone in self.system_config.get('zones', []):
            if zone['id'] == zone_id:
                return zone
        return None
    
    def make_irrigation_decision(self, zone_id=1):
        zone_config = self.get_zone_config(zone_id)
        if not zone_config:
            return {
                'success': False,
                'message': 'Zone not configured'
            }
        
        sensors = self.sensor_reader.read_all_sensors()
        energy = self.energy_manager.get_status()
        crop = self.get_crop_by_id(zone_config['crop_id'])
        soil = self.get_soil_by_id(zone_config['soil_id'])
        
        decision = self.decision_engine.make_decision(
            sensors=sensors,
            energy=energy,
            crop=crop,
            soil=soil,
            zone_config=zone_config
        )
        
        return decision
    
    def execute_irrigation(self, zone_id, duration=None):
        decision = self.make_irrigation_decision(zone_id)
        
        if not decision.get('should_irrigate', False):
            return {
                'success': False,
                'message': decision.get('reason', 'Irrigation not recommended'),
                'decision': decision
            }
        
        if duration is None:
            duration = decision.get('recommended_duration', 300)
        
        result = self.irrigation_controller.start_irrigation(
            zone_id=zone_id,
            duration=duration,
            trigger='ai_decision'
        )
        
        if result['success']:
            log_irrigation_event(
                action='irrigation_started',
                duration=duration,
                trigger_type='ai_decision',
                notes=f"Zone {zone_id}: {decision.get('reason', '')}"
            )
        
        return result
    
    def run_monitoring_cycle(self):
        sensors = self.sensor_reader.read_all_sensors()
        
        save_sensor_reading(
            sensors['soil_moisture'],
            sensors['temperature'],
            sensors['humidity'],
            sensors['flow_rate'],
            sensors['pressure']
        )
        
        for zone in self.system_config.get('zones', []):
            if zone.get('auto_mode', False):
                decision = self.make_irrigation_decision(zone['id'])
                
                if decision.get('should_irrigate', False):
                    self.execute_irrigation(zone['id'])
        
        return {
            'success': True,
            'sensors': sensors,
            'timestamp': datetime.now().isoformat()
        }

if __name__ == '__main__':
    controller = MainController()
    status = controller.get_system_status()
    print(json.dumps(status, indent=2))
