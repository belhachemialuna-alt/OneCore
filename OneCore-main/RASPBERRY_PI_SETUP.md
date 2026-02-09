# BAYYTI Smart Irrigation System - Raspberry Pi Setup Guide

## Hardware Components

The system is designed to work with the following Raspberry Pi hardware:

### Required Components:
- **Raspberry Pi 3/4/Zero W** (with WiFi capability)
- **Soil Moisture Sensor** (analog) - Connected via ADS1115 ADC
- **DHT22 Sensor** - Temperature & Humidity (GPIO)
- **Water Flow Sensor** - Digital pulse (GPIO Pin 22)
- **12V Solenoid Valve** - Controlled via Relay Module
- **12V Relay Module** - GPIO Pin 27 (RELAY) and Pin 17 (VALVE)
- **ADS1115 ADC** - I2C interface for analog sensors
- **Leak Detection Sensor** - GPIO Pin 23 (optional)
- **Solar Panel + Battery** - For power monitoring (ADC Pin 0 & 1)

### GPIO Pin Configuration:
```
Valve Control:     GPIO 17
Relay Module:      GPIO 27
Flow Sensor:       GPIO 22
Leak Sensor:       GPIO 23
Zone Valves:       GPIO 17, 27, 22, 23, 24, 25, 5, 6 (8 zones)

I2C Devices:
- ADS1115 ADC:     I2C Address (default)
- Analog Pins:     P0 (Soil), P1 (Temp), P0 (Battery), P1 (Solar)
```

## Installation Steps

### 1. Install Raspberry Pi OS
```bash
# Download Raspberry Pi OS Lite or Desktop
# Flash to SD card using Raspberry Pi Imager
```

### 2. Enable I2C and GPIO
```bash
sudo raspi-config
# Navigate to: Interface Options → I2C → Enable
# Navigate to: Interface Options → GPIO → Enable
# Reboot after enabling
sudo reboot
```

### 3. Install System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and pip
sudo apt install python3 python3-pip python3-venv -y

# Install system packages for GPIO
sudo apt install python3-dev python3-rpi.gpio i2c-tools -y

# Install git if needed
sudo apt install git -y
```

### 4. Clone/Download Project
```bash
cd /home/pi
# Clone or copy project files to:
mkdir -p ~/smart-irrigation
cd ~/smart-irrigation
# Copy all project files here
```

### 5. Install Python Dependencies
```bash
cd ~/smart-irrigation
pip3 install --user -r requirements.txt

# If permission issues, use:
pip3 install -r requirements.txt
```

### 6. Configure GPIO Access
```bash
# Add user to gpio group
sudo usermod -a -G gpio pi
sudo usermod -a -G i2c pi

# Verify I2C devices are detected
i2cdetect -y 1
```

### 7. Set Environment Variables
```bash
# Enable GPIO for production
export ENABLE_GPIO=true

# Optional: Set Weather API key
export WEATHER_API_KEY=your_api_key_here

# Add to ~/.bashrc for persistence:
echo 'export ENABLE_GPIO=true' >> ~/.bashrc
echo 'export WEATHER_API_KEY=your_api_key_here' >> ~/.bashrc
source ~/.bashrc
```

### 8. Initialize Database
```bash
cd ~/smart-irrigation/backend
python3 database.py
```

### 9. Test Hardware
```bash
# Test GPIO access
python3 -c "import RPi.GPIO as GPIO; print('GPIO OK')"

# Test I2C
sudo i2cdetect -y 1
```

### 10. Start the System

#### Option A: Manual Start (Testing)
```bash
cd ~/smart-irrigation/backend
ENABLE_GPIO=true python3 api_server.py
```

#### Option B: Background Service (Production)
```bash
# Use the provided start.sh script
cd ~/smart-irrigation
chmod +x start.sh
./start.sh
```

#### Option C: Systemd Service (Auto-start on boot)
See systemd service setup below.

## Systemd Service Setup (Auto-start on Boot)

### Create Service File
```bash
sudo nano /etc/systemd/system/irrigation-api.service
```

### Service File Content:
```ini
[Unit]
Description=BAYYTI Smart Irrigation API Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/smart-irrigation/backend
Environment="ENABLE_GPIO=true"
Environment="WEATHER_API_KEY=your_key_here"
ExecStart=/usr/bin/python3 /home/pi/smart-irrigation/backend/api_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable and Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable irrigation-api
sudo systemctl start irrigation-api

# Check status
sudo systemctl status irrigation-api

# View logs
sudo journalctl -u irrigation-api -f
```

## Hardware Connection Diagram

```
Raspberry Pi GPIO Layout:

GPIO 17 → Relay → 12V Solenoid Valve
GPIO 27 → Relay Module Control
GPIO 22 → Water Flow Sensor (Digital)
GPIO 23 → Leak Detection Sensor

I2C Bus:
├── ADS1115 ADC
│   ├── P0 → Soil Moisture Sensor (Analog)
│   ├── P1 → Temperature Sensor (Analog)
│   ├── P0 → Battery Voltage Monitor
│   └── P1 → Solar Voltage Monitor

GPIO Pins for 8 Zones:
Zone 1: GPIO 17
Zone 2: GPIO 27
Zone 3: GPIO 22
Zone 4: GPIO 23
Zone 5: GPIO 24
Zone 6: GPIO 25
Zone 7: GPIO 5
Zone 8: GPIO 6
```

## Testing

### Test API Server
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/status
```

### Test GPIO (if enabled)
```bash
python3 -c "
import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT)
GPIO.output(17, GPIO.HIGH)
print('GPIO 17 ON')
import time
time.sleep(1)
GPIO.output(17, GPIO.LOW)
print('GPIO 17 OFF')
GPIO.cleanup()
"
```

### Access Dashboard
```
http://raspberrypi.local:5000
http://<pi-ip-address>:5000
```

## Troubleshooting

### Issue: GPIO Permission Denied
```bash
sudo usermod -a -G gpio pi
sudo reboot
```

### Issue: I2C Not Detected
```bash
sudo raspi-config
# Enable I2C interface
sudo reboot
sudo i2cdetect -y 1
```

### Issue: Port 5000 Already in Use
```bash
sudo netstat -tulpn | grep 5000
sudo kill <process-id>
```

### Issue: Database Locked
```bash
cd ~/smart-irrigation/backend
rm irrigation.db
python3 database.py
```

## Security Notes

1. **Change Default API Key**: Update `DEFAULT_API_KEY` in `config.py`
2. **Enable Firewall**: 
   ```bash
   sudo ufw allow 5000
   sudo ufw enable
   ```
3. **Use HTTPS in Production**: Consider using nginx reverse proxy with SSL
4. **Strong WiFi Password**: Secure your network access

## Network Configuration

The system supports:
- **WiFi Connection**: Connect to existing network
- **Hotspot Mode**: Create access point for direct access

Configure network via setup wizard at: `http://raspberrypi.local:5000/setup.html`
