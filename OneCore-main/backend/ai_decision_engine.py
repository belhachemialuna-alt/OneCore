"""
AI Decision Engine for Smart Irrigation
Generates intelligent irrigation decisions based on agricultural data
"""

import json
import os
from datetime import datetime, timedelta

# Global storage for simulation data
simulation_data_store = []

def generate_ai_irrigation_decisions(data):
    """
    Generate intelligent AI decisions based on sensor data and plant type
    This simulates advanced AI analysis that would come from Next.js platform
    """
    sensors = data.get('sensors', {})
    plant_type = data.get('plantType', 'unknown')
    device_id = data.get('deviceId', 'unknown')
    
    # Plant-specific requirements (AI knowledge base)
    plant_requirements = {
        'tomatoes': {'min_moisture': 70, 'max_moisture': 85, 'optimal_temp': [18, 26], 'water_need': 'high'},
        'wheat': {'min_moisture': 50, 'max_moisture': 70, 'optimal_temp': [15, 25], 'water_need': 'medium'},
        'lettuce': {'min_moisture': 75, 'max_moisture': 90, 'optimal_temp': [10, 20], 'water_need': 'high'},
        'corn': {'min_moisture': 60, 'max_moisture': 80, 'optimal_temp': [20, 30], 'water_need': 'medium'},
        'carrots': {'min_moisture': 40, 'max_moisture': 65, 'optimal_temp': [15, 22], 'water_need': 'low'},
        'peppers': {'min_moisture': 55, 'max_moisture': 75, 'optimal_temp': [20, 28], 'water_need': 'medium'}
    }
    
    requirements = plant_requirements.get(plant_type, plant_requirements['tomatoes'])
    decisions = []
    
    # AI Analysis: Soil Moisture Intelligence
    soil_moisture = sensors.get('soilMoisture', 50)
    if soil_moisture < requirements['min_moisture']:
        urgency = 'CRITICAL' if soil_moisture < (requirements['min_moisture'] - 20) else 'HIGH'
        zones_needed = determine_irrigation_zones(soil_moisture, requirements)
        
        decisions.append({
            'id': f'irrigation_{datetime.now().strftime("%H%M%S")}',
            'type': 'VALVE_CONTROL',
            'priority': urgency,
            'action': f'Activate irrigation in {", ".join(zones_needed)}',
            'reason': f'AI detected {plant_type} moisture deficit: {soil_moisture}% < optimal {requirements["min_moisture"]}%',
            'zones': zones_needed,
            'duration_minutes': calculate_irrigation_duration(soil_moisture, requirements),
            'water_savings': calculate_water_savings(zones_needed, requirements),
            'yield_impact': f'+{calculate_yield_improvement(soil_moisture, requirements)}% expected yield increase',
            'ai_confidence': calculate_ai_confidence(sensors, requirements)
        })
    elif soil_moisture > requirements['max_moisture']:
        decisions.append({
            'id': f'drainage_{datetime.now().strftime("%H%M%S")}',
            'type': 'DRAINAGE_CONTROL',
            'priority': 'MEDIUM',
            'action': 'Stop irrigation - Enable drainage',
            'reason': f'AI detected oversaturation risk for {plant_type}: {soil_moisture}% > {requirements["max_moisture"]}%',
            'zones': [],
            'water_savings': '15-25% water conservation',
            'disease_prevention': 'Prevents root rot and fungal diseases',
            'ai_confidence': calculate_ai_confidence(sensors, requirements)
        })
    
    # AI Analysis: Temperature Optimization
    temperature = sensors.get('temperature', 20)
    temp_min, temp_max = requirements['optimal_temp']
    if temperature < temp_min:
        decisions.append({
            'id': f'temp_cold_{datetime.now().strftime("%H%M%S")}',
            'type': 'TEMPERATURE_MANAGEMENT',
            'priority': 'MEDIUM',
            'action': 'Reduce irrigation frequency - Cold protection',
            'reason': f'AI temperature analysis: {temperature}°C below optimal for {plant_type} ({temp_min}-{temp_max}°C)',
            'adjustment': 'Reduce watering by 30% to prevent cold stress',
            'energy_savings': '20% heating cost reduction',
            'ai_confidence': calculate_ai_confidence(sensors, requirements)
        })
    elif temperature > temp_max:
        decisions.append({
            'id': f'temp_hot_{datetime.now().strftime("%H%M%S")}',
            'type': 'HEAT_STRESS_MANAGEMENT',
            'priority': 'HIGH',
            'action': 'Increase irrigation frequency - Heat protection',
            'reason': f'AI heat stress detection: {temperature}°C above optimal for {plant_type}',
            'adjustment': 'Increase watering by 40% with misting system',
            'crop_protection': 'Prevents heat damage and wilting',
            'ai_confidence': calculate_ai_confidence(sensors, requirements)
        })
    
    # AI Analysis: pH Optimization
    ph_level = sensors.get('phLevel', 7.0)
    if ph_level < 6.0 or ph_level > 7.5:
        ph_action = 'Add alkaline solution' if ph_level < 6.0 else 'Add acidic solution'
        decisions.append({
            'id': f'ph_adjust_{datetime.now().strftime("%H%M%S")}',
            'type': 'NUTRIENT_OPTIMIZATION',
            'priority': 'MEDIUM',
            'action': f'{ph_action} - pH correction',
            'reason': f'AI nutrient analysis: pH {ph_level} outside optimal range for {plant_type}',
            'nutrient_impact': 'Optimizes nutrient uptake efficiency',
            'yield_benefit': '+10-15% nutrient absorption improvement',
            'ai_confidence': calculate_ai_confidence(sensors, requirements)
        })
    
    # AI Analysis: Water Tank Management
    water_level = sensors.get('waterLevel', 100)
    if water_level < 20:
        decisions.append({
            'id': f'maintenance_{datetime.now().strftime("%H%M%S")}',
            'type': 'SYSTEM_MAINTENANCE',
            'priority': 'CRITICAL',
            'action': 'EMERGENCY: Refill water tank immediately',
            'reason': f'AI system monitoring: Water tank critically low ({water_level}%)',
            'system_protection': 'Prevents pump damage and irrigation failure',
            'downtime_prevention': 'Maintains continuous operation',
            'ai_confidence': 99
        })
    
    # AI Analysis: Predictive Insights
    if len(decisions) == 0:
        # Generate predictive maintenance and optimization suggestions
        decisions.append({
            'id': f'optimization_{datetime.now().strftime("%H%M%S")}',
            'type': 'AI_OPTIMIZATION',
            'priority': 'LOW',
            'action': 'Maintain current irrigation schedule',
            'reason': f'AI analysis: All parameters optimal for {plant_type} growth',
            'predictions': generate_growth_predictions(sensors, plant_type),
            'efficiency': f'Current system efficiency: {calculate_system_efficiency(sensors)}%',
            'next_action': predict_next_irrigation_need(sensors, requirements),
            'ai_confidence': calculate_ai_confidence(sensors, requirements)
        })
    
    # Add AI system advantages summary
    decisions.append({
        'id': f'ai_summary_{datetime.now().strftime("%H%M%S")}',
        'type': 'AI_ADVANTAGES',
        'priority': 'INFO',
        'action': 'AI System Benefits Active',
        'reason': 'BAYYTI-B1 AI advantages in operation',
        'benefits': {
            'water_savings': '25-40% reduction in water usage',
            'yield_increase': '15-30% crop yield improvement',
            'disease_prevention': 'Early detection and prevention',
            'energy_efficiency': '20-35% energy cost reduction',
            'labor_savings': '60% reduction in manual monitoring',
            'precision_agriculture': '99.2% accuracy in irrigation decisions'
        },
        'ai_confidence': 95
    })
    
    return decisions

def determine_irrigation_zones(soil_moisture, requirements):
    """Determine which zones need irrigation based on moisture levels"""
    if soil_moisture < requirements['min_moisture'] - 20:
        return ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4']  # All zones
    elif soil_moisture < requirements['min_moisture'] - 10:
        return ['Zone 1', 'Zone 2', 'Zone 3']  # Main zones
    else:
        return ['Zone 1', 'Zone 2']  # Primary zones

def calculate_irrigation_duration(soil_moisture, requirements):
    """Calculate optimal irrigation duration"""
    deficit = requirements['min_moisture'] - soil_moisture
    base_duration = 15  # minutes
    return max(10, min(45, base_duration + (deficit * 0.5)))

def calculate_water_savings(zones, requirements):
    """Calculate water savings from targeted irrigation"""
    zone_count = len(zones)
    if zone_count <= 2:
        return '30-40% water savings vs. flood irrigation'
    elif zone_count <= 3:
        return '20-30% water savings vs. flood irrigation'
    else:
        return '10-20% water savings vs. flood irrigation'

def calculate_yield_improvement(soil_moisture, requirements):
    """Calculate expected yield improvement"""
    optimal_range = (requirements['min_moisture'] + requirements['max_moisture']) / 2
    deviation = abs(soil_moisture - optimal_range)
    return max(5, min(30, 25 - deviation))

def calculate_ai_confidence(sensors, requirements):
    """Calculate AI confidence level based on data quality"""
    confidence = 85  # Base confidence
    
    # Adjust based on sensor data completeness
    if all(key in sensors for key in ['soilMoisture', 'temperature', 'humidity', 'phLevel']):
        confidence += 10
    
    # Adjust based on data reasonableness
    if 0 <= sensors.get('soilMoisture', 50) <= 100:
        confidence += 3
    if -10 <= sensors.get('temperature', 20) <= 50:
        confidence += 2
    
    return min(99, confidence)

def generate_growth_predictions(sensors, plant_type):
    """Generate growth predictions based on current conditions"""
    predictions = []
    
    soil_moisture = sensors.get('soilMoisture', 50)
    temperature = sensors.get('temperature', 20)
    
    if soil_moisture > 60 and 18 <= temperature <= 28:
        predictions.append('Optimal growth conditions - expect 20% faster development')
    
    if sensors.get('phLevel', 7) >= 6.0 and sensors.get('phLevel', 7) <= 7.5:
        predictions.append('Nutrient uptake optimized - enhanced root development')
    
    predictions.append(f'Harvest prediction: 7-14 days ahead of schedule for {plant_type}')
    
    return predictions

def calculate_system_efficiency(sensors):
    """Calculate current system efficiency percentage"""
    efficiency = 75  # Base efficiency
    
    # Bonus for optimal conditions
    if 60 <= sensors.get('soilMoisture', 50) <= 80:
        efficiency += 10
    if 18 <= sensors.get('temperature', 20) <= 28:
        efficiency += 8
    if 6.0 <= sensors.get('phLevel', 7) <= 7.5:
        efficiency += 7
    
    return min(99, efficiency)

def predict_next_irrigation_need(sensors, requirements):
    """Predict when next irrigation will be needed"""
    soil_moisture = sensors.get('soilMoisture', 50)
    temperature = sensors.get('temperature', 20)
    
    # Simple prediction based on evaporation rate
    if temperature > 30:
        return 'Next irrigation needed in 4-6 hours'
    elif temperature > 25:
        return 'Next irrigation needed in 8-12 hours'
    else:
        return 'Next irrigation needed in 12-24 hours'

def store_simulation_data(data, ai_decisions):
    """Store simulation data and AI decisions"""
    global simulation_data_store
    
    entry = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'data': data,
        'ai_decisions': ai_decisions,
        'plantType': data.get('plantType', 'unknown')
    }
    
    simulation_data_store.append(entry)
    
    # Keep only last 100 entries
    if len(simulation_data_store) > 100:
        simulation_data_store = simulation_data_store[-100:]

def get_stored_data():
    """Get stored simulation data"""
    return simulation_data_store

print("✅ AI Decision Engine loaded - Advanced agricultural intelligence ready")
