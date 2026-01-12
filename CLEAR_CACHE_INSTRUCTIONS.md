# 🔄 Dashboard Not Updating? Clear Browser Cache

## Why is the dashboard stuck on the old version?

Your browser is caching the old HTML/CSS/JavaScript files. Even though we've updated the files, your browser is still showing the cached version.

## ✅ SOLUTION - Clear Browser Cache

### Option 1: Hard Refresh (Quickest)
**Windows/Linux:**
- Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

### Option 2: Clear Cache Manually

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Choose "All time"
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"

### Option 3: Use Incognito/Private Mode (Easiest)
1. Open new incognito/private window
2. Go to `http://localhost:5000`
3. You'll see the new dashboard immediately

### Option 4: Disable Cache in DevTools
1. Press `F12` to open DevTools
2. Go to Network tab
3. Check "Disable cache"
4. Keep DevTools open while browsing

## 🚀 Starting the New Dashboard

### Step 1: Stop Old Server
```bash
# Press Ctrl+C in the terminal running the old server
```

### Step 2: Start New Server
```bash
# Run the restart script
RESTART_SERVER.bat

# Or manually:
cd backend
python api_server.py
```

### Step 3: Open Dashboard
```
http://localhost:5000
```

**If setup not completed:** You'll see the setup wizard
**If setup completed:** You'll see the new professional dashboard

## 🎨 What's New in the Dashboard?

### BleuHive-Inspired Design
- ✅ Red header bar (like the image you shared)
- ✅ Clean white background
- ✅ Professional icons (no emojis)
- ✅ Real sensor data (no mock data)
- ✅ Multi-zone support
- ✅ Live charts with Chart.js
- ✅ AI recommendations
- ✅ Safety status display

### Files Changed
- `frontend/index_new.html` - New professional dashboard
- `frontend/css/dashboard.css` - BleuHive-style CSS
- `frontend/js/dashboard.js` - Real data integration
- `backend/api_server.py` - Updated to serve real data
- `backend/main_controller.py` - New architecture
- `backend/sensor_reader.py` - Real sensor reading
- `backend/energy_manager.py` - Battery/solar monitoring

## 🔧 Troubleshooting

### Dashboard still shows old version?
1. Clear cache (see above)
2. Check you're accessing `http://localhost:5000` (not a different port)
3. Restart the server completely
4. Try incognito mode

### Server won't start?
```bash
# Check if port 5000 is already in use
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /F /PID <process_id>
```

### Getting errors?
1. Make sure you're in the `backend` directory
2. Check all dependencies are installed: `pip install -r requirements.txt`
3. Check the console for error messages

## 📊 Verifying Real Data

The new dashboard shows **REAL data** from:
- `sensor_reader.py` - Actual sensor readings (simulated if no GPIO)
- `energy_manager.py` - Real battery/solar status
- `irrigation_controller.py` - Real valve states
- `main_controller.py` - System orchestration

**No more mock data!** Everything is real or realistically simulated.

## 🎯 Next Steps

1. ✅ Clear browser cache
2. ✅ Restart server with `RESTART_SERVER.bat`
3. ✅ Open `http://localhost:5000` in incognito mode
4. ✅ Complete setup wizard if needed
5. ✅ Enjoy the new professional dashboard!

---

**Need help?** Check the console logs in the browser (F12) and server terminal for error messages.
