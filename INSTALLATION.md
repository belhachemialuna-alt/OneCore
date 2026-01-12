# BAYYTI Installation Guide

## Prerequisites

- Raspberry Pi (3/4/Zero W) with Raspberry Pi OS
- Python 3.7+
- Internet connection
- SSH access or local terminal

## Quick Installation

### 1. Install Python Dependencies

```bash
cd "D:\Bayyti.com\OneCore v1.0.0\OneCore v1.0.0"
pip3 install -r requirements.txt
```

### 2. Initialize Database

```bash
cd backend
python3 database.py
```

### 3. Test Run (Development)

```bash
cd backend
python3 api_server.py
```

Access the dashboard at: `http://localhost:5000`
Access analytics at: `http://localhost:5000/analytics.html`

## Production Installation (Raspberry Pi)

### Auto-Start on Boot using Systemd

#### 1. Copy Project to Raspberry Pi

```bash
# On Raspberry Pi
cd /home/pi
git clone <your-repo-url> smart-irrigation
cd smart-irrigation
```

#### 2. Install Dependencies

```bash
pip3 install -r requirements.txt
```

#### 3. Install Systemd Services

```bash
cd scripts
sudo bash install_services.sh
```

This will:
- Create 3 systemd services (API, Sensors, AI)
- Enable auto-start on boot
- Start services immediately
- Configure automatic restart on failure

#### 4. Verify Services

```bash
# Check service status
sudo systemctl status bayyti.service
sudo systemctl status bayyti-sensors.service
sudo systemctl status bayyti-ai.service

# View live logs
sudo journalctl -u bayyti.service -f
```

### Service Management Commands

```bash
# Start services
sudo systemctl start bayyti.service
sudo systemctl start bayyti-sensors.service
sudo systemctl start bayyti-ai.service

# Stop services
sudo systemctl stop bayyti.service

# Restart services
sudo systemctl restart bayyti.service

# Disable auto-start
sudo systemctl disable bayyti.service

# Enable auto-start
sudo systemctl enable bayyti.service

# View logs
sudo journalctl -u bayyti.service -n 100
sudo journalctl -u bayyti.service -f  # Follow (live)
```

## GitHub Auto-Update System

### Setup

1. **Set GitHub Repository Environment Variable**

```bash
export GITHUB_REPO="your-username/your-repo"
```

Add to `/etc/environment` for persistence:

```bash
echo 'GITHUB_REPO="your-username/your-repo"' | sudo tee -a /etc/environment
```

2. **Create GitHub Releases**

- Tag your releases: `v1.0.0`, `v1.1.0`, etc.
- Upload release assets
- System will automatically detect new versions

3. **Test Update System**

```bash
cd scripts
python3 update_system.py
```

### Update Process

1. User clicks update icon in dashboard
2. System checks GitHub for latest release
3. If update available, shows release notes
4. User confirms installation
5. System creates backup
6. Downloads and applies update
7. Restarts services
8. Update complete!

### Backup Location

Backups are stored in: `backups/backup_YYYYMMDD_HHMMSS.zip`

System keeps the 5 most recent backups automatically.

### Manual Restore

If update fails:

```bash
cd backups
unzip backup_YYYYMMDD_HHMMSS.zip -d ../
cd ../
sudo systemctl restart bayyti.service
```

## Accessing the Dashboard

### Local Network

```
http://raspberrypi.local:5000
http://192.168.1.XXX:5000
```

### Remote Access (Optional)

1. **Port Forwarding**

Configure your router:
- External Port: 8080
- Internal Port: 5000
- Internal IP: Your Raspberry Pi IP

2. **Access**

```
http://your-public-ip:8080
```

**Security Warning**: Enable API authentication for remote access!

## Configuration

### Environment Variables

Edit `backend/config.py` or set environment variables:

```python
ENABLE_GPIO = True  # False for testing without hardware
DEVICE_NAME = "BAYYTI-B1"
SENSOR_READ_INTERVAL = 60  # seconds
SOIL_MOISTURE_THRESHOLD = 30  # percentage
```

### Hardware Setup

Connect sensors according to `RASPBERRY_PI_SETUP.md`

## Troubleshooting

### Services Won't Start

```bash
# Check logs
sudo journalctl -u bayyti.service -n 50

# Check permissions
ls -la /home/pi/smart-irrigation/backend

# Reinstall services
cd scripts
sudo bash install_services.sh
```

### GPIO Permission Denied

```bash
sudo usermod -a -G gpio pi
sudo reboot
```

### Database Locked

```bash
cd backend
rm irrigation.db
python3 database.py
```

### Update Failed

Restore from backup:

```bash
cd backups
ls -lt  # Find latest backup
unzip backup_YYYYMMDD_HHMMSS.zip -d ../
cd ../
sudo systemctl restart bayyti.service
```

## Features

✅ Auto-start on Raspberry Pi boot  
✅ Auto-restart on crash  
✅ GitHub auto-update system  
✅ Automatic backups before updates  
✅ Systemd service integration  
✅ Comprehensive logging  
✅ Remote access ready  
✅ Production-ready architecture

## Support

For issues, check:
- System logs: `sudo journalctl -u bayyti.service -f`
- Application logs: `cat update.log`
- Service status: `systemctl status bayyti.service`

## Default Credentials

- API Key: `bayyti_demo_key_12345`

**Change this in production!**

---

Built with ❤️ for Smart Agriculture
