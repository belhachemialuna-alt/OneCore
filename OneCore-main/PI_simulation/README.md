# PI Data Simulator

A comprehensive simulation system for generating and sending realistic sensor data to both the cloud dashboard and local PI server.

## Features

- **Realistic Data Generation**: Simulates temperature, humidity, soil moisture, pH, light, pressure, and wind speed
- **Time-Based Variations**: Day/night cycles and seasonal changes
- **Dual Endpoint Support**: Sends data to both cloud dashboard (localhost:3000) and PI server (localhost:5000 or 192.168.137.193:5000)
- **Flexible Configuration**: Command-line options and JSON configuration
- **Cross-Platform**: Works on Windows, Linux, and macOS

## Quick Start

### First Time Setup (Device Registration)

**Windows:**
```bash
# Run the interactive launcher
start_simulation.bat
# Select option 1: Register New Device
```

**Linux/macOS:**
```bash
# Make script executable and run
chmod +x start_simulation.sh
./start_simulation.sh
# Select option 1: Register New Device
```

**Manual Setup:**
```bash
# 1. Start device server
python device_server.py

# 2. Open registration interface
# Open device_registration.html in your browser

# 3. Complete registration process
# - Log in to OneCore dashboard (http://localhost:3000)
# - Enter device name and session token
# - Click "Register Device"
```

### Manual Python Execution

#### Basic Usage
```bash
# Install requirements
pip install -r requirements.txt

# Check device registration status
python pi_data_simulator.py --check-registration

# Single test reading (requires registration)
python pi_data_simulator.py --single

# Continuous simulation (localhost only)
python pi_data_simulator.py --cloud http://localhost:3000 --pi-server http://localhost:5000

# With remote PI
python pi_data_simulator.py --cloud http://localhost:3000 --pi-ip 192.168.137.193
```

#### Advanced Options
```bash
# Custom configuration
python pi_data_simulator.py \
  --cloud http://localhost:3000 \
  --pi-ip 192.168.137.193 \
  --device-id my_pi_device \
  --api-key my_api_key \
  --interval 60
```

## Configuration

### Command Line Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--cloud` | `http://localhost:3000` | Cloud dashboard endpoint |
| `--pi-server` | `http://localhost:5000` | PI server endpoint |
| `--pi-ip` | None | PI IP address (overrides pi-server) |
| `--device-id` | Auto-generated | Device identifier (hardware-based) |
| `--api-key` | From config | API key for authentication (loaded from device_config.json) |
| `--interval` | `30` | Data sending interval (seconds) |
| `--single` | False | Send single reading and exit |
| `--check-registration` | False | Check device registration status and exit |

### Configuration File

Edit `config.json` to customize:

```json
{
  "simulation": {
    "device_id": "sim_pi_001",
    "api_key": "sim_device_key_12345"
  },
  "endpoints": {
    "cloud_dashboard": "http://localhost:3000",
    "pi_server_local": "http://localhost:5000",
    "pi_server_remote": "http://192.168.137.193:5000"
  },
  "sensor_settings": {
    "interval_seconds": 30,
    "baselines": {
      "temperature": 25.0,
      "humidity": 60.0,
      "soilMoisture": 45.0
    }
  }
}
```

## Sensor Data Format

The simulator generates data in this format:

```json
{
  "temperature": 25.3,
  "humidity": 62.1,
  "soilMoisture": 43.8,
  "ph": 7.2,
  "light": 850,
  "pressure": 1015.2,
  "windSpeed": 4.7,
  "timestamp": "2026-01-20T20:30:00.123456",
  "deviceId": "sim_pi_001",
  "location": "Simulation Lab",
  "metadata": {
    "source": "pi_simulator",
    "version": "1.0.0",
    "simulation_mode": true
  }
}
```

## Integration

### Cloud Dashboard (NextJS)
- Endpoint: `POST /api/devices/data`
- Header: `X-Device-API-Key: your_api_key`
- Returns AI decision and arbitration results

### PI Server (Flask)
- Endpoint: `POST /api/sensor-data`
- Header: `X-API-Key: your_api_key`
- Returns local processing status

## Realistic Simulation Features

1. **Time-Based Variations**
   - Temperature varies with day/night cycle
   - Light levels change dramatically between day/night
   - Humidity has inverse relationship with temperature

2. **Natural Constraints**
   - Humidity and soil moisture: 0-100%
   - pH levels: 4.0-10.0
   - Temperature: -20°C to 60°C
   - Light: Always positive values

3. **Weather Patterns**
   - Random variations within realistic ranges
   - Correlated sensor relationships
   - Seasonal adjustments

## Troubleshooting

### Common Issues

1. **Device Not Registered**
   - Run `python pi_data_simulator.py --check-registration` to verify status
   - Use `device_registration.html` to register device
   - Ensure you're logged in to the OneCore dashboard

2. **Connection Refused**
   - Ensure cloud dashboard is running on port 3000
   - Ensure PI server is running on port 5000
   - Check firewall settings

3. **Authentication Errors**
   - Device may not be properly registered
   - Check device_config.json exists and contains valid API key
   - Re-register device if needed

4. **Data Not Appearing**
   - Verify device registration status first
   - Check server logs for errors
   - Verify endpoint URLs are correct
   - Test with `--single` flag first

### Logs

The simulator provides detailed logging:
- ✅ Successful operations
- ❌ Errors requiring attention
- ⚠️ Warnings for non-critical issues
- 📊 Data generation info
- 📡 Network communication status

## Development

### Adding New Sensors

1. Add to `baselines` and `variations` dictionaries
2. Implement sensor-specific logic in `generate_sensor_data()`
3. Add constraints in the constraint section
4. Update configuration files

### Custom Endpoints

Modify the simulator to work with different endpoints by updating the URL construction in `send_to_cloud()` and `send_to_pi_server()` methods.

## License

Part of the OneCore Smart Irrigation System v1.0.0
