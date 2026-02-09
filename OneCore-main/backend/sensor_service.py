import time
import random
from datetime import datetime
from database import save_sensor_reading, create_alert
from config import SENSOR_READ_INTERVAL, ENABLE_GPIO, SOIL_MOISTURE_THRESHOLD

try:
    if ENABLE_GPIO:
        import RPi.GPIO as GPIO
        import board
        import adafruit_ads1x15.ads1115 as ADS
        from adafruit_ads1x15.analog_in import AnalogIn
        GPIO_AVAILABLE = True
    else:
        GPIO_AVAILABLE = False
except ImportError:
    GPIO_AVAILABLE = False
    print("GPIO libraries not available. Running in simulation mode.")

class SensorService:
    def __init__(self):
        self.gpio_available = GPIO_AVAILABLE
        self.running = False
        
        if self.gpio_available:
            self.setup_gpio()
    
    def setup_gpio(self):
        try:
            i2c = board.I2C()
            self.ads = ADS.ADS1115(i2c)
            self.soil_channel = AnalogIn(self.ads, ADS.P0)
            self.temp_channel = AnalogIn(self.ads, ADS.P1)
            print("GPIO sensors initialized")
        except Exception as e:
            print(f"GPIO setup failed: {e}")
            self.gpio_available = False
    
    def read_soil_moisture(self):
        if self.gpio_available:
            try:
                voltage = self.soil_channel.voltage
                moisture = (voltage / 3.3) * 100
                return round(moisture, 2)
            except Exception as e:
                print(f"Error reading soil moisture: {e}")
                return self._simulate_soil_moisture()
        else:
            return self._simulate_soil_moisture()
    
    def read_temperature(self):
        if self.gpio_available:
            try:
                voltage = self.temp_channel.voltage
                temp = (voltage - 0.5) * 100
                return round(temp, 2)
            except Exception as e:
                print(f"Error reading temperature: {e}")
                return self._simulate_temperature()
        else:
            return self._simulate_temperature()
    
    def read_humidity(self):
        if self.gpio_available:
            try:
                import adafruit_dht
                dht_device = adafruit_dht.DHT22(board.D4)
                humidity = dht_device.humidity
                return round(humidity, 2)
            except Exception as e:
                print(f"Error reading humidity: {e}")
                return self._simulate_humidity()
        else:
            return self._simulate_humidity()
    
    def read_flow_rate(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading flow rate: {e}")
                return self._simulate_flow_rate()
        else:
            return self._simulate_flow_rate()
    
    def read_pressure(self):
        if self.gpio_available:
            try:
                pass
            except Exception as e:
                print(f"Error reading pressure: {e}")
                return self._simulate_pressure()
        else:
            return self._simulate_pressure()
    
    def _simulate_soil_moisture(self):
        base = 35
        variation = random.uniform(-5, 5)
        return round(base + variation, 2)
    
    def _simulate_temperature(self):
        base = 25
        variation = random.uniform(-3, 3)
        return round(base + variation, 2)
    
    def _simulate_humidity(self):
        base = 60
        variation = random.uniform(-10, 10)
        return round(base + variation, 2)
    
    def _simulate_flow_rate(self):
        return round(random.uniform(0, 2.5), 2)
    
    def _simulate_pressure(self):
        base = 2.5
        variation = random.uniform(-0.3, 0.3)
        return round(base + variation, 2)
    
    def read_all_sensors(self):
        soil_moisture = self.read_soil_moisture()
        temperature = self.read_temperature()
        humidity = self.read_humidity()
        flow_rate = self.read_flow_rate()
        pressure = self.read_pressure()
        
        if soil_moisture < SOIL_MOISTURE_THRESHOLD:
            create_alert('low_moisture', 'warning', 
                        f'Soil moisture low: {soil_moisture}%')
        
        return {
            'soil_moisture': soil_moisture,
            'temperature': temperature,
            'humidity': humidity,
            'flow_rate': flow_rate,
            'pressure': pressure,
            'timestamp': datetime.now().isoformat()
        }
    
    def start_monitoring(self):
        self.running = True
        print("Sensor monitoring started...")
        
        while self.running:
            try:
                data = self.read_all_sensors()
                save_sensor_reading(
                    data['soil_moisture'],
                    data['temperature'],
                    data['humidity'],
                    data['flow_rate'],
                    data['pressure']
                )
                print(f"Sensors read: Soil={data['soil_moisture']}%, Temp={data['temperature']}°C")
                time.sleep(SENSOR_READ_INTERVAL)
            except KeyboardInterrupt:
                print("\nSensor monitoring stopped")
                self.running = False
                break
            except Exception as e:
                print(f"Error in sensor monitoring: {e}")
                time.sleep(SENSOR_READ_INTERVAL)
    
    def stop_monitoring(self):
        self.running = False

if __name__ == '__main__':
    from database import init_database
    init_database()
    
    service = SensorService()
    service.start_monitoring()
