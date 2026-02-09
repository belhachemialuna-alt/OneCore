import json
import os
from datetime import datetime
from sensor_reader import SensorReader
from energy_manager import EnergyManager
from irrigation_controller import IrrigationController
from ai_engine.decision_engine import DecisionEngine
from database import init_database, save_sensor_reading, log_irrigation_event
from cloud_integration import CloudIntegration

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
        
        # Initialize cloud integration
        try:
            self.cloud_integration = CloudIntegration()
            cloud_status = self.cloud_integration.get_status()
            print(f"Cloud Integration: {'✓ Registered' if cloud_status['registered'] else '⚠ Not Registered'}")
            if not cloud_status['registered']:
                print(f"  Register at: https://cloud.ielivate.com/link-device")
                print(f"  Device ID: {cloud_status['device_id']}")
        except Exception as e:
            print(f"Cloud Integration: ⚠ Error - {str(e)}")
            self.cloud_integration = None
        
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
        
        status = {
            'device_name': self.system_config.get('device_name', 'BAYYTI-B1'),
            'setup_completed': self.system_config.get('setup_completed', False),
            'timestamp': datetime.now().isoformat(),
            'sensors': sensors,
            'energy': energy,
            'irrigation': irrigation,
            'zones': self.system_config.get('zones', [])
        }
        
        # Add cloud status if available
        if self.cloud_integration:
            status['cloud'] = self.cloud_integration.get_status()
        
        return status
    
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
    
    def execute_irrigation(self, zone_id, duration=None, trigger='ai_decision'):
        decision = self.make_irrigation_decision(zone_id)
        
        if not decision.get('should_irrigate', False) and trigger != 'cloud_command':
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
            trigger=trigger
        )
        
        if result['success']:
            log_irrigation_event(
                action='irrigation_started',
                duration=duration,
                trigger_type=trigger,
                notes=f"Zone {zone_id}: {decision.get('reason', '')}"
            )
        
        return result
    
    def run_monitoring_cycle(self):
        sensors = self.sensor_reader.read_all_sensors()
        
        # Save to local database
        save_sensor_reading(
            sensors['soil_moisture'],
            sensors['temperature'],
            sensors['humidity'],
            sensors['flow_rate'],
            sensors['pressure']
        )
        
        # Sync with cloud and execute cloud commands
        cloud_result = None
        if self.cloud_integration and self.cloud_integration.check_registration():
            try:
                cloud_result = self.cloud_integration.sync_with_cloud(
                    sensor_data=sensors,
                    irrigation_controller=self.irrigation_controller
                )
                if cloud_result.get('commands_executed', 0) > 0:
                    print(f"✓ Executed {cloud_result['commands_executed']} cloud command(s)")
            except Exception as e:
                print(f"Cloud sync error: {str(e)}")
                cloud_result = {"success": False, "error": str(e)}
        
        # Run local AI decisions for auto mode zones
        for zone in self.system_config.get('zones', []):
            if zone.get('auto_mode', False):
                decision = self.make_irrigation_decision(zone['id'])
                
                if decision.get('should_irrigate', False):
                    self.execute_irrigation(zone['id'])
        
        result = {
            'success': True,
            'sensors': sensors,
            'timestamp': datetime.now().isoformat()
        }
        
        if cloud_result:
            result['cloud_sync'] = cloud_result
        
        return result

    def register_with_cloud(self, device_name=None):
        """
        Register device with cloud platform.
        
        Args:
            device_name: Optional custom device name
            
        Returns:
            Registration result
        """
        if not self.cloud_integration:
            return {
                "success": False,
                "error": "Cloud integration not available"
            }
        
        return self.cloud_integration.register_device(device_name)

if __name__ == '__main__':
    controller = MainController()
    status = controller.get_system_status()
    print(json.dumps(status, indent=2))
