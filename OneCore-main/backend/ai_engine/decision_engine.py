from datetime import datetime
import json

class DecisionEngine:
    def __init__(self, crops_data, soil_types_data, irrigation_rules):
        self.crops_data = crops_data
        self.soil_types_data = soil_types_data
        self.irrigation_rules = irrigation_rules
        
        print("AI Decision Engine initialized")
    
    def make_decision(self, sensors, energy, crop, soil, zone_config):
        """
        Main decision-making function using rule-based AI
        Returns: decision dict with should_irrigate, reason, recommended_duration
        """
        
        # Safety checks first (cannot be overridden)
        safety_result = self._check_safety_rules(sensors, energy)
        if not safety_result['safe']:
            return {
                'should_irrigate': False,
                'reason': safety_result['reason'],
                'recommended_duration': 0,
                'blocked_by': 'safety_rules',
                'priority': 'critical'
            }
        
        # Check soil moisture against crop requirements
        soil_moisture = sensors['soil_moisture']
        temp = sensors['temperature']
        humidity = sensors['humidity']
        
        # Get optimal moisture range for crop
        optimal_min = crop['optimal_moisture_min']
        optimal_max = crop['optimal_moisture_max']
        
        # Base decision on soil moisture
        if soil_moisture < optimal_min:
            should_irrigate = True
            reason = f"Soil moisture ({soil_moisture}%) below optimal ({optimal_min}%)"
            base_duration = self._calculate_base_duration(
                soil_moisture, optimal_min, optimal_max, soil
            )
        elif soil_moisture > optimal_max:
            should_irrigate = False
            reason = f"Soil moisture ({soil_moisture}%) above optimal ({optimal_max}%)"
            base_duration = 0
        else:
            should_irrigate = False
            reason = f"Soil moisture ({soil_moisture}%) in optimal range ({optimal_min}-{optimal_max}%)"
            base_duration = 0
        
        # Apply temperature adjustments
        if should_irrigate:
            duration = self._apply_temperature_adjustment(
                base_duration, temp, crop
            )
            
            # Apply humidity adjustments
            duration = self._apply_humidity_adjustment(
                duration, humidity
            )
            
            # Apply soil type adjustments
            duration = self._apply_soil_adjustment(
                duration, soil
            )
            
            # Apply time-of-day adjustments
            duration = self._apply_time_adjustment(duration)
        else:
            duration = 0
        
        return {
            'should_irrigate': should_irrigate,
            'reason': reason,
            'recommended_duration': int(duration),
            'confidence': 0.85,
            'source': 'local_ai',
            'crop': crop['name'],
            'soil_type': soil['name'],
            'current_moisture': soil_moisture,
            'optimal_range': f"{optimal_min}-{optimal_max}%",
            'timestamp': datetime.now().isoformat()
        }
    
    def _check_safety_rules(self, sensors, energy):
        """Check all safety rules - these cannot be overridden"""
        
        # Battery check
        if energy['battery_voltage'] < 11.5:
            return {
                'safe': False,
                'reason': f"Battery too low ({energy['battery_voltage']}V < 11.5V)"
            }
        
        if energy['battery_voltage'] < 10.5:
            return {
                'safe': False,
                'reason': f"CRITICAL: Battery critically low ({energy['battery_voltage']}V)"
            }
        
        # Temperature check
        temp = sensors['temperature']
        if temp > 50:
            return {
                'safe': False,
                'reason': f"Temperature too high ({temp}°C > 50°C)"
            }
        
        if temp < 0:
            return {
                'safe': False,
                'reason': f"Temperature too low ({temp}°C < 0°C) - freezing risk"
            }
        
        # Soil moisture check (prevent overwatering)
        if sensors['soil_moisture'] > 90:
            return {
                'safe': False,
                'reason': f"Soil already saturated ({sensors['soil_moisture']}%)"
            }
        
        return {'safe': True}
    
    def _calculate_base_duration(self, current_moisture, optimal_min, optimal_max, soil):
        """Calculate base irrigation duration based on moisture deficit"""
        
        moisture_deficit = optimal_min - current_moisture
        
        # Base duration: 10 seconds per 1% moisture deficit
        base_duration = moisture_deficit * 10
        
        # Adjust for soil type
        soil_factor = soil.get('irrigation_frequency_factor', 1.0)
        duration = base_duration * soil_factor
        
        # Ensure within reasonable limits
        duration = max(60, min(1800, duration))
        
        return duration
    
    def _apply_temperature_adjustment(self, duration, temp, crop):
        """Adjust duration based on temperature"""
        
        ideal_min = crop.get('ideal_temp_min', 15)
        ideal_max = crop.get('ideal_temp_max', 30)
        
        if temp > ideal_max:
            # Hot weather - increase irrigation
            excess = temp - ideal_max
            factor = 1.0 + (excess * 0.02)  # 2% increase per degree
            duration *= min(factor, 1.5)  # Max 50% increase
        elif temp < ideal_min:
            # Cold weather - decrease irrigation
            deficit = ideal_min - temp
            factor = 1.0 - (deficit * 0.02)  # 2% decrease per degree
            duration *= max(factor, 0.7)  # Max 30% decrease
        
        return duration
    
    def _apply_humidity_adjustment(self, duration, humidity):
        """Adjust duration based on humidity"""
        
        if humidity > 80:
            # High humidity - reduce irrigation
            duration *= 0.9
        elif humidity < 40:
            # Low humidity - increase irrigation
            duration *= 1.1
        
        return duration
    
    def _apply_soil_adjustment(self, duration, soil):
        """Adjust duration based on soil water retention"""
        
        water_retention = soil.get('water_retention', 'medium')
        
        if water_retention == 'low':
            # Sandy soil - shorter but more frequent
            duration *= 0.8
        elif water_retention == 'high':
            # Clay soil - longer but less frequent
            duration *= 1.2
        
        return duration
    
    def _apply_time_adjustment(self, duration):
        """Adjust based on time of day"""
        
        hour = datetime.now().hour
        
        # Avoid midday irrigation (11 AM - 3 PM)
        if 11 <= hour <= 15:
            duration = 0  # Block irrigation during peak sun
        
        # Optimal morning time (6 AM - 9 AM)
        elif 6 <= hour <= 9:
            duration *= 1.0  # No adjustment
        
        # Evening irrigation (5 PM - 8 PM)
        elif 17 <= hour <= 20:
            duration *= 0.9  # Slight reduction
        
        # Night irrigation (not recommended)
        elif hour >= 21 or hour <= 5:
            duration *= 0.7  # Significant reduction
        
        return duration

if __name__ == '__main__':
    import os
    import sys
    
    # Add parent directory to path
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    
    from sensor_reader import SensorReader
    from energy_manager import EnergyManager
    
    # Load test data
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    
    with open(os.path.join(data_dir, 'crops.json'), 'r') as f:
        crops_data = json.load(f)
    
    with open(os.path.join(data_dir, 'soil_types.json'), 'r') as f:
        soil_types_data = json.load(f)
    
    with open(os.path.join(data_dir, 'irrigation_rules.json'), 'r') as f:
        irrigation_rules = json.load(f)
    
    # Initialize
    engine = DecisionEngine(crops_data, soil_types_data, irrigation_rules)
    sensor_reader = SensorReader()
    energy_manager = EnergyManager()
    
    # Test decision
    sensors = sensor_reader.read_all_sensors()
    energy = energy_manager.get_status()
    crop = crops_data['crops'][0]  # Tomato
    soil = soil_types_data['soil_types'][2]  # Loam
    
    decision = engine.make_decision(sensors, energy, crop, soil, {})
    
    print(json.dumps(decision, indent=2))
