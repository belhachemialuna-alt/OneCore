# 🚀 BAYYTI-B1 Raspberry Pi Installation & Auto-Start Guide

Complete step-by-step guide to install dependencies and set up automatic startup on boot.

---

## 📋 **Prerequisites**

- Raspberry Pi (3/4/Zero W) with Raspberry Pi OS installed
- Internet connection
- SSH access (or direct terminal access)

---

## 🔧 **Step 1: Clone Repository (If Not Already Done)**

```bash
# Navigate to home directory
cd ~

# Clone the repository
git clone https://github.com/belhachemialuna-alt/OneCore.git

# Navigate into the project
cd OneCore
```

**Note:** The project will be located at `~/OneCore/`

---

## 📦 **Step 2: Install System Dependencies**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Python and pip (if not already installed)
sudo apt install python3 python3-pip python3-venv -y

# Install system packages for GPIO and I2C
sudo apt install python3-dev python3-rpi.gpio i2c-tools -y

# Install git (if not already installed)
sudo apt install git -y
```

---

## 🐍 **Step 3: Create Virtual Environment (Recommended)**

```bash
# Navigate to project root (IMPORTANT: requirements.txt is here!)
cd ~/OneCore

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Your prompt should now show (venv)
```

**Note:** Always activate the virtual environment before installing packages:
```bash
source venv/bin/activate
```

---

## 📥 **Step 4: Install Python Dependencies**

**⚠️ IMPORTANT:** `requirements.txt` is in the **root directory** (`~/OneCore/`), NOT in the `backend/` folder!

```bash
# Make sure you're in the project root directory
cd ~/OneCore

# Verify requirements.txt exists here
ls -la requirements.txt

# Activate virtual environment (if not already activated)
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

**Expected Output:**
```
Collecting Flask==3.0.0
Collecting flask-cors==4.0.0
Collecting RPi.GPIO==0.7.1
Collecting adafruit-circuitpython-ads1x15==2.2.21
Collecting adafruit-circuitpython-dht==4.0.3
Collecting requests==2.31.0
Collecting psutil==5.9.8
...
Successfully installed Flask-3.0.0 flask-cors-4.0.0 ...
```

**If you get an error:**
```bash
# Error: Could not open requirements file
# Solution: Make sure you're in ~/OneCore/ directory, not ~/OneCore/backend/
cd ~/OneCore
pwd  # Should show: /home/pi/OneCore
pip install -r requirements.txt
```

---

## ✅ **Step 5: Test Installation**

```bash
# Navigate to backend directory
cd ~/OneCore/backend

# Activate virtual environment
source ../venv/bin/activate

# Test the server (press Ctrl+C to stop)
python3 api_server.py
```

**Expected Output:**
```
BAYYTI-B1 Main Controller initialized
System: BAYYTI-B1
Setup completed: False
 * Running on http://127.0.0.1:5000
```

**Access Dashboard:**
- Open browser: `http://localhost:5000` or `http://YOUR_PI_IP:5000`

**If it works, press `Ctrl+C` to stop the server.**

---

## 🔄 **Step 6: Set Up Auto-Start on Boot**

We'll use **systemd** to automatically start the application when the Raspberry Pi boots.

### **6.1: Create Systemd Service File**

```bash
# Create service file
sudo nano /etc/systemd/system/bayyti.service
```

### **6.2: Copy This Content (Adjust Paths if Needed)**

**If your project is at `~/OneCore/`:**

```ini
[Unit]
Description=BAYYTI Smart Irrigation System - API Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=pi
Group=pi
WorkingDirectory=/home/pi/OneCore/backend
Environment="PYTHONUNBUFFERED=1"
Environment="ENABLE_GPIO=true"
Environment="PATH=/home/pi/OneCore/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/pi/OneCore/venv/bin/python3 /home/pi/OneCore/backend/api_server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Restart conditions
StartLimitIntervalSec=60
StartLimitBurst=3

[Install]
WantedBy=multi-user.target
```

**If your project is at `~/smart-irrigation/`:**

```ini
[Unit]
Description=BAYYTI Smart Irrigation System - API Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=pi
Group=pi
WorkingDirectory=/home/pi/smart-irrigation/backend
Environment="PYTHONUNBUFFERED=1"
Environment="ENABLE_GPIO=true"
Environment="PATH=/home/pi/smart-irrigation/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/pi/smart-irrigation/venv/bin/python3 /home/pi/smart-irrigation/backend/api_server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Restart conditions
StartLimitIntervalSec=60
StartLimitBurst=3

[Install]
WantedBy=multi-user.target
```

**To save in nano:**
- Press `Ctrl+O` (save)
- Press `Enter` (confirm filename)
- Press `Ctrl+X` (exit)

---

### **6.3: Reload Systemd and Enable Service**

```bash
# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable bayyti.service

# Start the service now (without rebooting)
sudo systemctl start bayyti.service

# Check service status
sudo systemctl status bayyti.service
```

**Expected Output:**
```
● bayyti.service - BAYYTI Smart Irrigation System - API Server
     Loaded: loaded (/etc/systemd/system/bayyti.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

---

## 🎯 **Step 7: Verify Auto-Start**

### **7.1: Check Service Status**

```bash
# Check if service is running
sudo systemctl status bayyti.service

# View recent logs
sudo journalctl -u bayyti.service -n 50

# Follow logs in real-time
sudo journalctl -u bayyti.service -f
```

### **7.2: Test Auto-Start (Optional)**

```bash
# Reboot the Raspberry Pi
sudo reboot

# After reboot, SSH back in and check:
sudo systemctl status bayyti.service

# Should show: Active: active (running)
```

### **7.3: Access Dashboard**

After boot, the dashboard should be available at:
- `http://localhost:5000` (on the Pi)
- `http://YOUR_PI_IP:5000` (from other devices)

**Find your Pi's IP:**
```bash
hostname -I
```

---

## 🛠️ **Step 8: Service Management Commands**

### **Start/Stop/Restart Service**

```bash
# Start service
sudo systemctl start bayyti.service

# Stop service
sudo systemctl stop bayyti.service

# Restart service
sudo systemctl restart bayyti.service

# Reload service (if you changed the service file)
sudo systemctl daemon-reload
sudo systemctl restart bayyti.service
```

### **Enable/Disable Auto-Start**

```bash
# Enable auto-start on boot
sudo systemctl enable bayyti.service

# Disable auto-start on boot
sudo systemctl disable bayyti.service
```

### **View Logs**

```bash
# View all logs
sudo journalctl -u bayyti.service

# View last 100 lines
sudo journalctl -u bayyti.service -n 100

# Follow logs in real-time
sudo journalctl -u bayyti.service -f

# View logs since boot
sudo journalctl -u bayyti.service -b
```

---

## 🔍 **Troubleshooting**

### **Problem: Service fails to start**

**Check logs:**
```bash
sudo journalctl -u bayyti.service -n 50
```

**Common issues:**

1. **Wrong path in service file:**
   ```bash
   # Verify your project path
   ls -la /home/pi/OneCore/backend/api_server.py
   
   # Update service file if path is wrong
   sudo nano /etc/systemd/system/bayyti.service
   ```

2. **Virtual environment not found:**
   ```bash
   # Verify venv exists
   ls -la /home/pi/OneCore/venv/bin/python3
   
   # If not, recreate it:
   cd ~/OneCore
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Dependencies not installed:**
   ```bash
   cd ~/OneCore
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Permission issues:**
   ```bash
   # Make sure service file has correct user
   # Should be: User=pi (or your username)
   sudo nano /etc/systemd/system/bayyti.service
   ```

### **Problem: Service starts but crashes**

**Check for errors:**
```bash
sudo journalctl -u bayyti.service -f
```

**Common causes:**
- Database not initialized
- GPIO permissions (if using real hardware)
- Port 5000 already in use

**Fix database:**
```bash
cd ~/OneCore/backend
source ../venv/bin/activate
python3 database.py
```

**Check port:**
```bash
sudo netstat -tulpn | grep 5000
# If something is using it, kill it or change port in api_server.py
```

### **Problem: Can't access dashboard after boot**

1. **Check if service is running:**
   ```bash
   sudo systemctl status bayyti.service
   ```

2. **Check firewall (if enabled):**
   ```bash
   sudo ufw allow 5000
   ```

3. **Check IP address:**
   ```bash
   hostname -I
   ```

4. **Test locally:**
   ```bash
   curl http://localhost:5000
   ```

---

## 📝 **Quick Reference Commands**

```bash
# Navigate to project
cd ~/OneCore

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Test server manually
cd backend
python3 api_server.py

# Service management
sudo systemctl start bayyti.service
sudo systemctl stop bayyti.service
sudo systemctl restart bayyti.service
sudo systemctl status bayyti.service

# View logs
sudo journalctl -u bayyti.service -f

# Enable/disable auto-start
sudo systemctl enable bayyti.service
sudo systemctl disable bayyti.service
```

---

## ✅ **Installation Checklist**

- [ ] Repository cloned to `~/OneCore/`
- [ ] System dependencies installed (`python3`, `pip`, `GPIO`)
- [ ] Virtual environment created and activated
- [ ] Python dependencies installed from `requirements.txt`
- [ ] Server tested manually (works when run)
- [ ] Systemd service file created at `/etc/systemd/system/bayyti.service`
- [ ] Service enabled for auto-start
- [ ] Service started and running
- [ ] Dashboard accessible at `http://YOUR_PI_IP:5000`
- [ ] Auto-start verified after reboot

---

## 🎉 **Success!**

Your BAYYTI-B1 Smart Irrigation System is now:
- ✅ Installed with all dependencies
- ✅ Configured to start automatically on boot
- ✅ Running as a system service
- ✅ Accessible via web dashboard

**Dashboard URL:** `http://YOUR_PI_IP:5000`

---

## 📞 **Need Help?**

**Check logs:**
```bash
sudo journalctl -u bayyti.service -n 100
```

**Restart service:**
```bash
sudo systemctl restart bayyti.service
```

**View service status:**
```bash
sudo systemctl status bayyti.service
```

---

**Last Updated:** January 13, 2026  
**Version:** 1.0.0  
**Compatible with:** Raspberry Pi OS (Debian-based)
