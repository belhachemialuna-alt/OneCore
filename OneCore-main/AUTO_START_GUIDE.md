# 🚀 Auto-Start Guide - BAYYTI-B1

Simple commands to make your Python scripts start automatically on Raspberry Pi boot.

---

## 📋 **Quick Setup (3 Commands)**

```bash
# 1. Create service file
sudo nano /etc/systemd/system/bayyti.service

# 2. Enable and start
sudo systemctl daemon-reload
sudo systemctl enable bayyti.service
sudo systemctl start bayyti.service
```

---

## 📝 **Step 1: Create Service File**

Copy and paste this into the service file:

```bash
sudo nano /etc/systemd/system/bayyti.service
```

**Paste this content:**

```ini
[Unit]
Description=BAYYTI Smart Irrigation System
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/OneCore/backend
Environment="PATH=/home/pi/OneCore/venv/bin:/usr/bin"
ExecStart=/home/pi/OneCore/venv/bin/python3 /home/pi/OneCore/backend/api_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Save:** Press `Ctrl+O`, then `Enter`, then `Ctrl+X`

---

## ⚙️ **Step 2: Enable Auto-Start**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable on boot
sudo systemctl enable bayyti.service

# Start now
sudo systemctl start bayyti.service
```

---

## ✅ **Step 3: Verify**

```bash
# Check status
sudo systemctl status bayyti.service

# Should show: Active: active (running)
```

---

## 🛠️ **Useful Commands**

```bash
# Start service
sudo systemctl start bayyti.service

# Stop service
sudo systemctl stop bayyti.service

# Restart service
sudo systemctl restart bayyti.service

# View logs
sudo journalctl -u bayyti.service -f

# Disable auto-start
sudo systemctl disable bayyti.service
```

---

## 🔧 **Adjust Paths**

If your project is NOT at `/home/pi/OneCore/`, edit the service file:

```bash
sudo nano /etc/systemd/system/bayyti.service
```

Change these lines:
- `WorkingDirectory=/home/pi/OneCore/backend` → Your backend path
- `ExecStart=/home/pi/OneCore/venv/bin/python3` → Your venv python path
- `ExecStart=.../api_server.py` → Your api_server.py path

Then reload:
```bash
sudo systemctl daemon-reload
sudo systemctl restart bayyti.service
```

---

## ✅ **Done!**

Your app will now start automatically every time the Raspberry Pi boots.

**Dashboard:** `http://YOUR_PI_IP:5000`

---

**Need help?** Check logs: `sudo journalctl -u bayyti.service -n 50`
