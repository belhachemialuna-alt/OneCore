"""
Cloud AI Integration Client
Connects to cloud AI service for intelligent irrigation recommendations.
IMPORTANT: Cloud AI is ADVISORY ONLY - Raspberry Pi has final authority.
"""

import requests
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from config import WEATHER_API_KEY, LOCATION_LAT, LOCATION_LON

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CloudAIClient:
    """
    Client for cloud AI service integration.
    Sends sensor data, receives recommendations.
    Pi validates and decides whether to follow recommendations.
    """
    
    def __init__(self, cloud_api_url: str = None):
        self.cloud_api_url = cloud_api_url or "http://localhost:8000"
        self.timeout = 5
        self.enabled = False
        self.fallback_to_local = True
        
        logger.info(f"Cloud AI Client initialized - URL: {self.cloud_api_url}")
    
    def get_irrigation_recommendation(self, sensor_data: Dict, system_status: Dict, 
                                     crop_type: str = "tomato", location: str = "algeria") -> Optional[Dict]:
        """
        Request irrigation recommendation from cloud AI.
        Returns None if cloud is unavailable (fallback to local rules).
        """
        
        if not self.enabled:
            logger.info("Cloud AI disabled - using local rules only")
            return None
        
        try:
            payload = self._prepare_payload(sensor_data, system_status, crop_type, location)
            
            logger.info(f"Requesting AI recommendation from cloud: {self.cloud_api_url}")
            
            response = requests.post(
                f"{self.cloud_api_url}/api/ai/recommend",
                json=payload,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                recommendation = response.json()
                logger.info(f"Cloud AI recommendation received: {recommendation.get('action')}")
                return recommendation
            else:
                logger.warning(f"Cloud AI returned error: {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning("Cloud AI request timeout - falling back to local rules")
            return None
        except requests.exceptions.ConnectionError:
            logger.warning("Cloud AI unavailable - falling back to local rules")
            return None
        except Exception as e:
            logger.error(f"Cloud AI error: {e} - falling back to local rules")
            return None
    
    def _prepare_payload(self, sensor_data: Dict, system_status: Dict, 
                        crop_type: str, location: str) -> Dict:
        """Prepare data payload for cloud AI"""
        return {
            "soil_moisture": sensor_data.get('soil_moisture', 0),
            "temperature": sensor_data.get('temperature', 0),
            "humidity": sensor_data.get('humidity', 0),
            "pressure": sensor_data.get('pressure', 0),
            "flow_rate": sensor_data.get('flow_rate', 0),
            "battery": system_status.get('battery_level', 0),
            "solar_status": system_status.get('solar_status', 'unknown'),
            "crop_type": crop_type,
            "location": location,
            "timestamp": datetime.now().isoformat()
        }
    
    def enable_cloud_ai(self, api_url: str = None):
        """Enable cloud AI integration"""
        if api_url:
            self.cloud_api_url = api_url
        self.enabled = True
        logger.info(f"Cloud AI enabled: {self.cloud_api_url}")
    
    def disable_cloud_ai(self):
        """Disable cloud AI - use local rules only"""
        self.enabled = False
        logger.info("Cloud AI disabled - local rules only")
    
    def test_connection(self) -> bool:
        """Test connection to cloud AI service"""
        try:
            response = requests.get(f"{self.cloud_api_url}/health", timeout=3)
            return response.status_code == 200
        except:
            return False


class WeatherAPIClient:
    """
    Weather API integration for enhanced irrigation decisions.
    Fetches weather forecast to optimize irrigation timing.
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or WEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
        self.enabled = bool(self.api_key)
        
        if self.enabled:
            logger.info("Weather API client initialized")
        else:
            logger.info("Weather API disabled - no API key provided")
    
    def get_weather_forecast(self, lat: float = LOCATION_LAT, 
                            lon: float = LOCATION_LON) -> Optional[Dict]:
        """
        Get weather forecast for location.
        Returns forecast data or None if unavailable.
        """
        
        if not self.enabled:
            return None
        
        try:
            url = f"{self.base_url}/forecast"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                forecast = self._parse_forecast(data)
                logger.info(f"Weather forecast retrieved: {forecast.get('summary')}")
                return forecast
            else:
                logger.warning(f"Weather API error: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Weather API error: {e}")
            return None
    
    def _parse_forecast(self, data: Dict) -> Dict:
        """Parse weather API response"""
        if not data.get('list'):
            return {}
        
        next_12h = data['list'][:4]
        
        temps = [item['main']['temp'] for item in next_12h]
        rain_probability = max([item.get('pop', 0) for item in next_12h])
        will_rain = rain_probability > 0.3
        
        return {
            'avg_temp': sum(temps) / len(temps),
            'max_temp': max(temps),
            'min_temp': min(temps),
            'rain_probability': rain_probability,
            'will_rain': will_rain,
            'summary': f"{'Rain expected' if will_rain else 'No rain'}, Temp: {sum(temps)/len(temps):.1f}°C",
            'timestamp': datetime.now().isoformat()
        }
    
    def should_skip_irrigation_due_to_rain(self) -> bool:
        """Check if irrigation should be skipped due to expected rain"""
        forecast = self.get_weather_forecast()
        
        if forecast and forecast.get('will_rain'):
            logger.info(f"Rain expected ({forecast['rain_probability']*100:.0f}%) - may skip irrigation")
            return True
        
        return False


class LocalAIEngine:
    """
    Local AI decision engine (Phase 1 - Rule-based).
    Runs entirely on Raspberry Pi - no cloud dependency.
    This is the fallback when cloud AI is unavailable.
    """
    
    def __init__(self):
        self.rules = self._initialize_rules()
        logger.info("Local AI Engine initialized - Rule-based decisions")
    
    def _initialize_rules(self) -> Dict:
        """Initialize decision rules"""
        return {
            'very_dry': {'threshold': 20, 'duration': 600, 'priority': 'high'},
            'dry': {'threshold': 30, 'duration': 300, 'priority': 'medium'},
            'moderate': {'threshold': 40, 'duration': 180, 'priority': 'low'},
            'wet': {'threshold': 100, 'duration': 0, 'priority': 'none'}
        }
    
    def get_recommendation(self, sensor_data: Dict, weather_forecast: Dict = None) -> Dict:
        """
        Generate irrigation recommendation using local rules.
        This is fast, reliable, and works offline.
        """
        
        moisture = sensor_data.get('soil_moisture', 50)
        temp = sensor_data.get('temperature', 25)
        
        if weather_forecast and weather_forecast.get('will_rain'):
            return {
                'action': 'SKIP',
                'duration': 0,
                'confidence': 0.9,
                'reason': 'Rain expected in next 12 hours',
                'source': 'local_ai'
            }
        
        if moisture < 20:
            category = 'very_dry'
        elif moisture < 30:
            category = 'dry'
        elif moisture < 40:
            category = 'moderate'
        else:
            category = 'wet'
        
        rule = self.rules[category]
        
        duration = rule['duration']
        if temp > 30:
            duration = int(duration * 1.2)
        elif temp < 15:
            duration = int(duration * 0.8)
        
        action = 'IRRIGATE' if duration > 0 else 'SKIP'
        
        return {
            'action': action,
            'duration': duration,
            'confidence': 0.85,
            'reason': f"Soil {category} ({moisture}%), Temp {temp}°C",
            'source': 'local_ai',
            'rule_applied': category
        }


class HybridAIDecisionMaker:
    """
    Hybrid AI system that combines cloud AI with local rules.
    Architecture: Cloud AI recommends → Pi validates → Pi decides
    """
    
    def __init__(self, cloud_url: str = None, weather_api_key: str = None):
        self.cloud_client = CloudAIClient(cloud_url)
        self.weather_client = WeatherAPIClient(weather_api_key)
        self.local_ai = LocalAIEngine()
        
        self.prefer_cloud = False
        self.cloud_timeout_fallback = True
        
        logger.info("Hybrid AI Decision Maker initialized")
    
    def get_irrigation_decision(self, sensor_data: Dict, system_status: Dict,
                               crop_type: str = "tomato", location: str = "algeria") -> Dict:
        """
        Get irrigation decision using hybrid approach:
        1. Try cloud AI (if enabled)
        2. Validate cloud recommendation
        3. Fallback to local AI if needed
        4. Return final decision
        """
        
        weather_forecast = self.weather_client.get_weather_forecast()
        
        cloud_recommendation = None
        if self.cloud_client.enabled:
            cloud_recommendation = self.cloud_client.get_irrigation_recommendation(
                sensor_data, system_status, crop_type, location
            )
        
        if cloud_recommendation:
            logger.info("Using cloud AI recommendation")
            cloud_recommendation['weather_forecast'] = weather_forecast
            return cloud_recommendation
        else:
            logger.info("Using local AI recommendation")
            local_recommendation = self.local_ai.get_recommendation(sensor_data, weather_forecast)
            local_recommendation['weather_forecast'] = weather_forecast
            return local_recommendation
    
    def enable_cloud_mode(self, api_url: str):
        """Enable cloud AI mode"""
        self.cloud_client.enable_cloud_ai(api_url)
        self.prefer_cloud = True
        logger.info("Cloud AI mode enabled")
    
    def enable_local_only_mode(self):
        """Disable cloud AI - local only"""
        self.cloud_client.disable_cloud_ai()
        self.prefer_cloud = False
        logger.info("Local-only AI mode enabled")


if __name__ == '__main__':
    print("Testing Cloud AI Client...")
    
    test_sensor_data = {
        'soil_moisture': 28,
        'temperature': 30,
        'humidity': 65,
        'pressure': 2.5,
        'flow_rate': 0
    }
    
    test_system_status = {
        'battery_level': 78,
        'solar_status': 'charging',
        'leak_detected': False,
        'valve_state': 'OFF'
    }
    
    print("\n1. Testing Local AI Engine...")
    local_ai = LocalAIEngine()
    recommendation = local_ai.get_recommendation(test_sensor_data)
    print(f"Local AI: {recommendation}")
    
    print("\n2. Testing Hybrid AI Decision Maker...")
    hybrid = HybridAIDecisionMaker()
    decision = hybrid.get_irrigation_decision(test_sensor_data, test_system_status)
    print(f"Hybrid Decision: {decision}")
    
    print("\n3. Testing Cloud AI Client (will fail without server)...")
    cloud = CloudAIClient("http://localhost:8000")
    cloud_rec = cloud.get_irrigation_recommendation(test_sensor_data, test_system_status)
    print(f"Cloud AI: {cloud_rec}")
