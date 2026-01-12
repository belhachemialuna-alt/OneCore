# ⚡ Quick Installation Guide

## 🚀 **Automated Installation (Recommended)**

Run this single command from your project root:

```bash
cd ~/OneCore
chmod +x INSTALL_AND_START.sh
./INSTALL_AND_START.sh
```

This script will:
- ✅ Install all dependencies
- ✅ Create virtual environment
- ✅ Set up systemd service
- ✅ Enable auto-start on boot
- ✅ Start the service

---

## 📋 **Manual Installation (Step-by-Step)**

### **1. Install Dependencies**

```bash
# Navigate to project root (requirements.txt is here!)
cd ~/OneCore

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### **2. Test Installation**

```bash
cd backend
source ../venv/bin/activate
python3 api_server.py
```

Press `Ctrl+C` to stop.

### **3. Set Up Auto-Start**

```bash
# Copy service file
sudo cp scripts/bayyti.service /etc/systemd/system/

# Edit path if needed (if project is not at ~/OneCore)
sudo nano /etc/systemd/system/bayyti.service

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable bayyti.service
sudo systemctl start bayyti.service

# Check status
sudo systemctl status bayyti.service
```

---

## 🎯 **Common Issues & Fixes**

### **Error: requirements.txt not found**

**Problem:** You're in the wrong directory.

**Solution:**
```bash
cd ~/OneCore  # Go to project root
pwd  # Verify: should show /home/pi/OneCore
pip install -r requirements.txt
```

### **Error: Service fails to start**

**Check logs:**
```bash
sudo journalctl -u bayyti.service -n 50
```

**Common fixes:**
- Verify paths in service file match your installation
- Make sure virtual environment exists: `ls -la ~/OneCore/venv/bin/python3`
- Reinstall dependencies: `pip install -r requirements.txt`

### **Service starts but dashboard not accessible**

```bash
# Check if service is running
sudo systemctl status bayyti.service

# Check if port 5000 is in use
sudo netstat -tulpn | grep 5000

# Find your Pi's IP
hostname -I
```

---

## 📞 **Useful Commands**

```bash
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

## 📖 **Full Documentation**

For detailed instructions, see: **`RASPBERRY_PI_INSTALLATION_GUIDE.md`**

---

**Dashboard URL:** `http://YOUR_PI_IP:5000`
