# BAYYTI Smart Irrigation System 🌱

A comprehensive IoT-based smart irrigation system with AI decision-making, real-time monitoring, and automated scheduling.

## 🎯 Features

### ✅ Core Functionality
- **Real-time Sensor Monitoring**: Soil moisture, temperature, humidity, water flow, and pressure
- **Automated Valve Control**: Manual and scheduled irrigation with safety features
- **Hybrid AI Decision Engine**: Local + Cloud AI with Pi as final authority
- **Local Safety Rules**: Battery, moisture, temperature protection (cannot be overridden)
- **Cloud AI Integration**: Optional ML-based recommendations (advisory only)
- **Live Dashboard**: Beautiful, responsive web interface with real-time updates
- **Scheduler**: Create and manage irrigation schedules
- **Leak Detection**: Automatic safety shutdown on leak detection
- **Solar Power Monitoring**: Battery and solar charging status
- **Data Logging**: Complete irrigation history and analytics
- **REST API**: Full-featured API for integration and remote control
- **Authentication**: API key-based security
- **Weather Integration**: OpenWeather API support for smart decisions

### 📊 Dashboard Features
- Real-time sensor widgets (Soil, Water, Temperature, Battery)
- Live charts with Chart.js (Moisture history, Temperature/Humidity trends)
- Valve control with safety features
- AI irrigation recommendations
- Alert system for critical events
- Irrigation logs and statistics
- Schedule management
- Mobile-friendly responsive design

## 🏗️ Architecture

```
Smart Irrigation System
│
├── Backend (Python on Raspberry Pi)
│   ├── sensor_service.py      → Reads sensors every 60s
│   ├── irrigation_service.py  → Controls valves with SAFETY RULES
│   ├── safety_rules.py        → Local safety engine (Pi authority)
│   ├── ai_decision_service.py → Hybrid AI (cloud + local)
│   ├── cloud_ai_client.py     → Cloud AI integration + local fallback
│   ├── api_server.py          → Flask REST API
│   ├── database.py            → SQLite database management
│   ├── auth.py                → API authentication
│   └── config.py              → System configuration
│
├── Frontend (HTML/CSS/JS)
│   ├── index.html             → Main dashboard
│   ├── css/style.css          → Modern UI styling
│   └── js/app.js              → Real-time updates & charts
│
├── Database (SQLite)
│   └── irrigation.db          → Sensor data, logs, schedules
│
└── Cloud AI (Optional)
    └── cloud_ai_mock_server.py → Mock cloud AI for testing
```

## 🛡️ Safety-First Architecture

**CRITICAL PRINCIPLE: Raspberry Pi Has Final Authority**

```
❌ Cloud AI does NOT directly control valves
✅ Cloud AI provides RECOMMENDATIONS only
✅ Raspberry Pi VALIDATES and DECIDES
```

### Decision Flow

```
Sensors → Pi Local Safety Check → Cloud AI (optional) → Pi Validates → Pi Decides → Action
          ↑ CANNOT BE BYPASSED                           ↑ FINAL AUTHORITY
```

### Local Safety Rules (Always Active)

```python
# These rules run on Pi and CANNOT be overridden by cloud AI

if battery_voltage < 11.5:
    block_irrigation("Battery too low")

if soil_moisture > 40:
    skip_irrigation("Soil already wet")

if temperature > 50 or temperature < 0:
    block_irrigation("Extreme temperature")

if leak_detected:
    emergency_shutdown("CRITICAL: Leak detected")

if consecutive_irrigations >= 5:
    block_irrigation("Too many consecutive irrigations")

if daily_water_usage >= 100L:
    block_irrigation("Daily limit reached")
```

### Why This Matters

✅ **No damage** - System protected even if cloud AI fails  
✅ **Works offline** - Local rules always active  
✅ **Fast reaction** - Millisecond response time  
✅ **Reliable** - No internet dependency for safety  
✅ **Auditable** - All decisions logged with reasoning

## 📋 Requirements

### Hardware
- Raspberry Pi (3/4/Zero W)
- Soil moisture sensor
- DHT22 (Temperature/Humidity)
- Water flow sensor
- 12V solenoid valve
- 12V relay module
- ADS1115 ADC (for analog sensors)
- Solar panel + Battery (optional)
- Leak detection sensor (optional)

### Software
- Python 3.7+
- Raspberry Pi OS
- GPIO access

## 🚀 Installation

### 1. Clone/Download the Project
```bash
cd /home/pi
git clone <your-repo-url> smart-irrigation
cd smart-irrigation
```

### 2. Install Python Dependencies
```bash
pip3 install -r requirements.txt
```

### 3. Initialize Database
```bash
cd backend
python3 database.py
```

### 4. Configure System
Edit `backend/config.py` to match your hardware setup:
```python
ENABLE_GPIO = True  # Set to False for testing without hardware
VALVE_GPIO_PIN = 17
SOIL_MOISTURE_THRESHOLD = 30
```

## 🎮 Running the System

### Option 1: Run API Server Only (Testing)
```bash
cd backend
python3 api_server.py
```
Access dashboard at: `http://localhost:5000`

### Option 2: Run Complete System (Production)

**Terminal 1 - Sensor Service:**
```bash
cd backend
python3 sensor_service.py
```

**Terminal 2 - AI Decision Service:**
```bash
cd backend
python3 ai_decision_service.py
```

**Terminal 3 - API Server:**
```bash
cd backend
python3 api_server.py
```

### Option 3: Run as Background Services (Recommended)

Create systemd services for auto-start on boot:

**1. Create service files:**

`/etc/systemd/system/irrigation-api.service`:
```ini
[Unit]
Description=BAYYTI Irrigation API Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/smart-irrigation/backend
ExecStart=/usr/bin/python3 /home/pi/smart-irrigation/backend/api_server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/irrigation-sensors.service`:
```ini
[Unit]
Description=BAYYTI Irrigation Sensor Service
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/smart-irrigation/backend
ExecStart=/usr/bin/python3 /home/pi/smart-irrigation/backend/sensor_service.py
Restart=always

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/irrigation-ai.service`:
```ini
[Unit]
Description=BAYYTI Irrigation AI Service
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/smart-irrigation/backend
ExecStart=/usr/bin/python3 /home/pi/smart-irrigation/backend/ai_decision_service.py
Restart=always

[Install]
WantedBy=multi-user.target
```

**2. Enable and start services:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable irrigation-api
sudo systemctl enable irrigation-sensors
sudo systemctl enable irrigation-ai

sudo systemctl start irrigation-api
sudo systemctl start irrigation-sensors
sudo systemctl start irrigation-ai
```

**3. Check status:**
```bash
sudo systemctl status irrigation-api
sudo systemctl status irrigation-sensors
sudo systemctl status irrigation-ai
```

**4. View logs:**
```bash
sudo journalctl -u irrigation-api -f
sudo journalctl -u irrigation-sensors -f
sudo journalctl -u irrigation-ai -f
```

## 🌐 API Endpoints

### Status & Monitoring
- `GET /api/status` - System status (battery, solar, leak, valve)
- `GET /api/sensors` - Current sensor readings
- `GET /api/sensors/history?limit=100` - Historical sensor data
- `GET /api/valve/status` - Valve status and irrigation info

### Valve Control
- `POST /api/valve/on` - Start irrigation (optional: `{"duration": 300}`)
- `POST /api/valve/off` - Stop irrigation
- `POST /api/emergency-stop` - Emergency shutdown

### Scheduling
- `GET /api/schedules` - List all schedules
- `POST /api/schedules` - Create new schedule
- `DELETE /api/schedules/{id}` - Delete schedule
- `POST /api/schedules/{id}/toggle` - Enable/disable schedule

### Logs & Analytics
- `GET /api/logs?limit=50` - Irrigation history
- `GET /api/stats/summary` - Daily statistics

### AI & Alerts
- `GET /api/ai/recommendation` - Get AI irrigation recommendation
- `POST /api/ai/auto-mode` - Toggle auto-irrigation mode
- `POST /api/ai/cloud/enable` - Enable cloud AI integration
- `POST /api/ai/cloud/disable` - Disable cloud AI (local only)
- `GET /api/ai/cloud/status` - Check cloud AI connection status
- `GET /api/alerts` - Get unresolved alerts
- `POST /api/alerts/{id}/resolve` - Resolve alert

### Safety & Rules
- `GET /api/safety/status` - Get safety engine status
- `GET /api/safety/rules` - View all local safety rules (Pi authority)

### Authentication
- `GET /api/auth/keys` - List API keys (requires auth)
- `POST /api/auth/keys` - Generate new API key (requires auth)
- `DELETE /api/auth/keys/{id}` - Revoke API key (requires auth)

**Default API Key:** `bayyti_demo_key_12345`

## 🤖 Cloud AI Integration (Optional)

### Testing with Mock Cloud AI Server

**1. Start the mock cloud AI server:**
```bash
# Terminal 1 - Mock Cloud AI Server
cd backend
python cloud_ai_mock_server.py
# Runs on http://localhost:8000
```

**2. Enable cloud AI in your system:**
```bash
# Via API
curl -X POST http://localhost:5000/api/ai/cloud/enable \
  -H "Content-Type: application/json" \
  -d '{"cloud_url": "http://localhost:8000"}'

# Or via dashboard Settings page
```

**3. Test AI recommendation:**
```bash
curl http://localhost:5000/api/ai/recommendation
```

**Response shows hybrid AI decision:**
```json
{
  "should_irrigate": true,
  "reason": "Soil dry, hot weather expected",
  "ai_source": "cloud_ai",
  "ai_confidence": 0.87,
  "pi_has_authority": true,
  "safety_validated": true
}
```

### Cloud AI Architecture

```
Raspberry Pi → Cloud AI Server → Recommendation → Pi Validates → Pi Decides
     ↑                                                   ↑
  Sensors                                         FINAL AUTHORITY
```

**Key Points:**
- Cloud AI is **ADVISORY ONLY**
- Pi validates all cloud recommendations
- Local safety rules **CANNOT** be overridden
- System works offline (falls back to local AI)
- All decisions logged with full traceability

### Production Cloud AI Setup

For production, deploy your own cloud AI server:

```bash
# Example: DigitalOcean Droplet ($6/month)
# 1. Create Ubuntu 22.04 droplet
# 2. Install dependencies
sudo apt update
sudo apt install python3-pip
pip3 install fastapi uvicorn xgboost scikit-learn

# 3. Deploy your AI model
# 4. Configure Pi to use your cloud URL
curl -X POST http://your-pi-ip:5000/api/ai/cloud/enable \
  -H "Content-Type: application/json" \
  -d '{"cloud_url": "https://your-cloud-ai.com"}'
```

**See `AI_ARCHITECTURE.md` for complete cloud AI documentation.**

## 🔧 Configuration

### Environment Variables
```bash
export ENABLE_GPIO=true
export WEATHER_API_KEY=your_key_here
```

### Config File (`backend/config.py`)
```python
DEVICE_NAME = "BAYYTI-B1"
SENSOR_READ_INTERVAL = 60  # seconds
SOIL_MOISTURE_THRESHOLD = 30  # percentage
MAX_IRRIGATION_DURATION = 1800  # seconds
AUTO_IRRIGATION_ENABLED = True
LEAK_DETECTION_ENABLED = True
```

## 📱 Accessing the Dashboard

### Local Network
```
http://raspberrypi.local:5000
http://192.168.1.XXX:5000
```

### Remote Access (Port Forwarding)
1. Configure router port forwarding: External 8080 → Internal 5000
2. Access via: `http://your-public-ip:8080`
3. **Security**: Enable HTTPS and strong API keys for production

## 🔐 Security

### API Authentication
All sensitive endpoints require API key in header:
```bash
curl -H "X-API-Key: bayyti_demo_key_12345" http://localhost:5000/api/auth/keys
```

### Generate New API Key
```bash
curl -X POST -H "X-API-Key: bayyti_demo_key_12345" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Device"}' \
  http://localhost:5000/api/auth/keys
```

## 🎨 Customization

### Brand Colors (CSS Variables)
Edit `frontend/css/style.css`:
```css
:root {
    --primary-red: #E10600;
    --dark-red: #B00500;
    --black: #0A0A0A;
}
```

### Sensor Thresholds
Edit `backend/config.py`:
```python
SOIL_MOISTURE_THRESHOLD = 30  # Trigger irrigation below this
```

## 🐛 Troubleshooting

### Issue: GPIO Permission Denied
```bash
sudo usermod -a -G gpio pi
sudo reboot
```

### Issue: Database Locked
```bash
cd backend
rm irrigation.db
python3 database.py
```

### Issue: Sensors Not Reading
```bash
# Enable I2C
sudo raspi-config
# Interface Options → I2C → Enable

# Test I2C devices
i2cdetect -y 1
```

### Issue: Dashboard Not Loading
```bash
# Check if Flask is running
sudo netstat -tulpn | grep 5000

# Check firewall
sudo ufw allow 5000
```

## 🔄 System Status & Upgrades

### ✅ Completed Features
1. ✅ GPIO real valve control (12V relay)
2. ✅ Live charts (Chart.js)
3. ✅ Scheduler page
4. ✅ Authentication (API key)
5. ✅ Local AI rule engine (Phase 1)
6. ✅ **Local safety rules engine** (Pi authority)
7. ✅ **Cloud AI integration** (hybrid mode)
8. ✅ **AI validation system** (Pi validates cloud AI)
9. ✅ **Weather API support** (OpenWeather ready)
10. ✅ **Safety-first architecture** (offline capable)

### 🚀 Future Enhancements
11. ⏳ Machine Learning models (XGBoost - Phase 2)
12. ⏳ Neural networks (LSTM forecasting - Phase 3)
13. ⏳ OTA update system
14. ⏳ Mobile app (React Native)
15. ⏳ Cloud sync (AWS IoT / Firebase)
16. ⏳ Multi-zone support
17. ⏳ Email/SMS notifications
18. ⏳ Advanced water analytics
19. ⏳ HTTPS/SSL support
20. ⏳ Voice control (Alexa/Google Home)

## 📊 Database Schema

### Tables
- `sensor_readings` - Timestamped sensor data
- `system_status` - Battery, solar, leak status
- `irrigation_logs` - Complete irrigation history
- `schedules` - Automated irrigation schedules
- `api_keys` - Authentication keys
- `alerts` - System alerts and warnings

## 🤝 Contributing

This is a production-ready smart irrigation system. Feel free to:
- Add new sensors
- Improve AI algorithms
- Enhance UI/UX
- Add integrations

## 📄 License

Copyright © 2024 BAYYTI Smart Irrigation System

## 📚 Documentation

- **`README.md`** - Main documentation (this file)
- **`AI_ARCHITECTURE.md`** - Complete AI & safety architecture
- **`backend/safety_rules.py`** - Local safety rules implementation
- **`backend/cloud_ai_client.py`** - Cloud AI integration
- **`backend/ai_decision_service.py`** - Hybrid AI decision engine

## 🆘 Support

For issues or questions:
- Check logs: `sudo journalctl -u irrigation-api -f`
- Review sensor readings in dashboard
- Check database: `sqlite3 backend/irrigation.db`
- View safety status: `curl http://localhost:5000/api/safety/status`
- Check AI status: `curl http://localhost:5000/api/ai/cloud/status`

## 🎯 Quick Start Summary

```bash
# 1. Install dependencies
pip3 install -r requirements.txt

# 2. Initialize database
cd backend && python3 database.py

# 3. Run the system
python3 api_server.py

# 4. Open dashboard
# http://localhost:5000
```

**Default Credentials:**
- API Key: `bayyti_demo_key_12345`

---

**Built with ❤️ for Smart Agriculture**

🌱 BAYYTI - Making Irrigation Intelligent
