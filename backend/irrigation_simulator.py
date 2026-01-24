"""
Irrigation System Simulator
Allows the irrigation system to work without physical hardware
Simulates valve operations, water flow, and sensor readings
"""

import time
import random
from datetime import datetime
from database import get_db

class IrrigationSimulator:
    """Simulates irrigation hardware for testing without physical devices"""
    
    def __init__(self):
        self.valves = {}  # valve_id: {'state': 'open/closed', 'start_time': timestamp}
        self.simulation_mode = True
        self.water_flow_rate = 15  # Liters per minute
        
    def open_valve(self, zone_id=1):
        """Simulate opening a valve"""
        try:
            valve_key = f"zone_{zone_id}"
            self.valves[valve_key] = {
                'state': 'open',
                'start_time': time.time(),
                'zone_id': zone_id
            }
            
            print(f"✓ [SIMULATION] Valve opened for Zone {zone_id}")
            
            # Log to database
            with get_db() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO irrigation_logs 
                    (timestamp, zone_id, duration, water_used, trigger_type, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    datetime.now().isoformat(),
                    zone_id,
                    0,  # Duration will be updated when closed
                    0,  # Water used will be calculated when closed
                    'manual',
                    'active'
                ))
                conn.commit()
                log_id = cursor.lastrowid
                
            self.valves[valve_key]['log_id'] = log_id
            
            return {
                'success': True,
                'message': f'Valve opened for Zone {zone_id} (Simulation Mode)',
                'zone_id': zone_id,
                'simulation': True
            }
            
        except Exception as e:
            print(f"✗ [SIMULATION] Error opening valve: {e}")
            return {
                'success': False,
                'error': str(e),
                'simulation': True
            }
    
    def close_valve(self, zone_id=1):
        """Simulate closing a valve"""
        try:
            valve_key = f"zone_{zone_id}"
            
            if valve_key not in self.valves or self.valves[valve_key]['state'] != 'open':
                return {
                    'success': False,
                    'error': 'Valve is not open',
                    'simulation': True
                }
            
            # Calculate duration and water used
            start_time = self.valves[valve_key]['start_time']
            duration = int(time.time() - start_time)
            water_used = (duration / 60) * self.water_flow_rate
            
            # Update database log
            log_id = self.valves[valve_key].get('log_id')
            if log_id:
                with get_db() as conn:
                    cursor = conn.cursor()
                    cursor.execute('''
                        UPDATE irrigation_logs
                        SET duration = ?, water_used = ?, status = ?
                        WHERE id = ?
                    ''', (duration, water_used, 'completed', log_id))
                    conn.commit()
            
            # Close valve
            self.valves[valve_key]['state'] = 'closed'
            
            print(f"✓ [SIMULATION] Valve closed for Zone {zone_id}")
            print(f"  Duration: {duration}s, Water used: {water_used:.1f}L")
            
            return {
                'success': True,
                'message': f'Valve closed for Zone {zone_id} (Simulation Mode)',
                'zone_id': zone_id,
                'duration': duration,
                'water_used': water_used,
                'simulation': True
            }
            
        except Exception as e:
            print(f"✗ [SIMULATION] Error closing valve: {e}")
            return {
                'success': False,
                'error': str(e),
                'simulation': True
            }
    
    def get_valve_status(self, zone_id=1):
        """Get simulated valve status"""
        valve_key = f"zone_{zone_id}"
        
        if valve_key in self.valves:
            valve = self.valves[valve_key]
            is_open = valve['state'] == 'open'
            
            if is_open:
                elapsed = int(time.time() - valve['start_time'])
                return {
                    'zone_id': zone_id,
                    'state': 'open',
                    'elapsed_seconds': elapsed,
                    'simulation': True
                }
        
        return {
            'zone_id': zone_id,
            'state': 'closed',
            'simulation': True
        }
    
    def simulate_sensor_reading(self, sensor_type='soil_moisture'):
        """Generate simulated sensor readings"""
        if sensor_type == 'soil_moisture':
            # Simulate soil moisture between 20-80%
            return round(random.uniform(20, 80), 1)
        elif sensor_type == 'temperature':
            # Simulate temperature between 15-35°C
            return round(random.uniform(15, 35), 1)
        elif sensor_type == 'humidity':
            # Simulate humidity between 30-90%
            return round(random.uniform(30, 90), 1)
        elif sensor_type == 'water_pressure':
            # Simulate water pressure between 1.5-3.5 bar
            return round(random.uniform(1.5, 3.5), 2)
        elif sensor_type == 'flow_rate':
            # Simulate flow rate between 10-20 L/min
            return round(random.uniform(10, 20), 1)
        else:
            return 0
    
    def start_scheduled_irrigation(self, schedule_id, zone_id, duration_minutes):
        """Start irrigation from a schedule"""
        try:
            print(f"✓ [SIMULATION] Starting scheduled irrigation")
            print(f"  Schedule ID: {schedule_id}, Zone: {zone_id}, Duration: {duration_minutes} min")
            
            # Open valve
            result = self.open_valve(zone_id)
            
            if result['success']:
                # Update log with schedule info
                log_id = self.valves[f"zone_{zone_id}"].get('log_id')
                if log_id:
                    with get_db() as conn:
                        cursor = conn.cursor()
                        cursor.execute('''
                            UPDATE irrigation_logs
                            SET trigger_type = ?, schedule_id = ?
                            WHERE id = ?
                        ''', ('scheduled', schedule_id, log_id))
                        conn.commit()
            
            return result
            
        except Exception as e:
            print(f"✗ [SIMULATION] Error starting scheduled irrigation: {e}")
            return {
                'success': False,
                'error': str(e),
                'simulation': True
            }
    
    def emergency_stop_all(self):
        """Emergency stop - close all valves"""
        try:
            print("⚠️  [SIMULATION] EMERGENCY STOP - Closing all valves")
            
            results = []
            for valve_key in list(self.valves.keys()):
                if self.valves[valve_key]['state'] == 'open':
                    zone_id = self.valves[valve_key]['zone_id']
                    result = self.close_valve(zone_id)
                    results.append(result)
            
            return {
                'success': True,
                'message': 'All valves closed (Simulation Mode)',
                'valves_closed': len(results),
                'simulation': True
            }
            
        except Exception as e:
            print(f"✗ [SIMULATION] Error in emergency stop: {e}")
            return {
                'success': False,
                'error': str(e),
                'simulation': True
            }

# Global simulator instance
irrigation_simulator = IrrigationSimulator()

if __name__ == "__main__":
    print("=" * 60)
    print("IRRIGATION SIMULATOR TEST")
    print("=" * 60)
    
    # Test valve operations
    print("\n1. Opening valve for Zone 1...")
    result = irrigation_simulator.open_valve(1)
    print(f"   Result: {result}")
    
    print("\n2. Waiting 5 seconds...")
    time.sleep(5)
    
    print("\n3. Checking valve status...")
    status = irrigation_simulator.get_valve_status(1)
    print(f"   Status: {status}")
    
    print("\n4. Closing valve...")
    result = irrigation_simulator.close_valve(1)
    print(f"   Result: {result}")
    
    print("\n5. Testing sensor readings...")
    print(f"   Soil Moisture: {irrigation_simulator.simulate_sensor_reading('soil_moisture')}%")
    print(f"   Temperature: {irrigation_simulator.simulate_sensor_reading('temperature')}°C")
    print(f"   Humidity: {irrigation_simulator.simulate_sensor_reading('humidity')}%")
    
    print("\n" + "=" * 60)
    print("SIMULATION TEST COMPLETE")
    print("=" * 60)
