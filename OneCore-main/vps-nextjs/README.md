# BAYYTI VPS Cloud Server

Next.js + Parse Server backend for BAYYTI Smart Irrigation System device management.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start Parse Server
npm run parse-server

# In another terminal, start Next.js API
npm run dev
```

### Environment Configuration

Edit `.env` file:

```env
PARSE_APP_ID=your_unique_app_id
PARSE_JS_KEY=your_javascript_key
PARSE_MASTER_KEY=your_secure_master_key
PARSE_SERVER_URL=http://localhost:1337/parse
DATABASE_URI=mongodb://localhost:27017/bayyti
```

## 📡 API Endpoints

### Device Management

- `POST /api/device/register` - Register new device
- `GET /api/device/register` - List user's devices
- `POST /api/device/data` - Submit sensor data
- `POST /api/device/irrigation` - Log irrigation events
- `POST /api/device/alert` - Send device alerts
- `POST /api/device/heartbeat` - Device heartbeat
- `GET /api/device/config` - Get device configuration

## 🗄️ Parse Server Classes

### Device
- `deviceId` - Unique device identifier
- `name` - Device name
- `owner` - User pointer
- `apiKey` - Authentication key
- `status` - online/offline
- `lastSeen` - Last communication

### SensorLog
- `device` - Device pointer
- `timestamp` - Reading time
- `soilMoisture` - Soil moisture %
- `temperature` - Temperature °C
- `humidity` - Humidity %
- `waterFlow` - Flow rate L/min
- `waterPressure` - Pressure bar
- `batteryVoltage` - Battery V
- `solarVoltage` - Solar V

### IrrigationLog
- `device` - Device pointer
- `timestamp` - Event time
- `zoneId` - Zone number
- `action` - start/stop
- `duration` - Duration seconds
- `waterUsed` - Water liters
- `trigger` - manual/scheduled/ai

### Alert
- `device` - Device pointer
- `type` - Alert type
- `severity` - info/warning/critical
- `message` - Alert message
- `resolved` - Resolution status

## 🔐 Authentication

### User Authentication
Uses Parse User sessions with session tokens.

### Device Authentication
Uses API key in Authorization header:
```
Authorization: Device {apiKey}
X-Device-ID: {deviceId}
```

## 📝 Notes

**TypeScript Lint Errors:** The `.ts` API files will show lint errors until you run `npm install` to install the required dependencies (`parse`, `@types/node`). These are expected and will resolve after installation.

## 📚 Documentation

See `DEVICE_VPS_INTEGRATION.md` for complete setup and integration guide.

## 🛠️ Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Parse Server standalone
npm run parse-server
```

## 🔧 Troubleshooting

### Parse Server won't start
- Check MongoDB is running
- Verify DATABASE_URI in .env
- Check port 1337 is available

### API endpoints return 401
- Verify session token is valid
- Check Parse Server is running
- Verify PARSE_APP_ID matches

### Device can't connect
- Check VPS URL is accessible
- Verify device has valid API key
- Check firewall settings

## 📞 Support

For issues, check:
- Parse Server logs
- Next.js console output
- MongoDB connection
- Network connectivity

---

**Version:** 1.0.0  
**License:** MIT
