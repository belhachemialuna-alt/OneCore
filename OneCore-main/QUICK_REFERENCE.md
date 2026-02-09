# 🚀 BAYYTI-B1 Quick Reference Card

## ⚡ Quick Start (5 Minutes)

### 1. Test Update System
```bash
# Run test suite
python test_update_system.py

# All tests should pass ✓
```

### 2. Start Server
```bash
cd backend
python api_server.py
```

### 3. Open Browser
```
http://localhost:5000          ← Dashboard
http://localhost:5000/analytics.html  ← Analytics
```

### 4. Create First Release
```bash
git add .
git commit -m "Update system ready"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

Then: https://github.com/belhachemialuna-alt/OneCore/releases → **Publish**

### 5. See Red Indicator
- Refresh browser
- Wait 3 seconds
- Red dot appears! 🔴
- Click → See release notes → Install

---

## 🔧 Useful Commands

### Check Version
```bash
cat version.txt
# Output: 1.0.0
```

### Check for Updates (CLI)
```bash
cd backend
python updater.py check
```

### Install Update (CLI)
```bash
python updater.py update
```

### Test API Endpoint
```bash
curl http://localhost:5000/api/system/update/check
```

---

## 📍 Important URLs

| Purpose | URL |
|---------|-----|
| Dashboard | http://localhost:5000 |
| Analytics | http://localhost:5000/analytics.html |
| Update Check | http://localhost:5000/api/system/update/check |
| GitHub Repo | https://github.com/belhachemialuna-alt/OneCore |
| GitHub Releases | https://github.com/belhachemialuna-alt/OneCore/releases |
| GitHub API | https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest |

---

## 🎯 Key Features

### Header (Both Pages)
- Full-height icon buttons (48px)
- Update button with red indicator
- Reboot system button (red)
- Mobile menu (red sidebar)

### Footer (Both Pages)
- Black/grey gradient background
- Red top border
- White text on dark

### Analytics Page
- Interactive zone map (drag, zoom)
- Red-themed charts
- Zone selection sidebar
- Real-time data

### Update System
- Auto-check on page load
- Red dot indicator
- One-click install
- Protected files backup

---

## 🐛 Troubleshooting

### Red Indicator Not Showing?
```bash
# 1. Check if release exists
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest

# 2. Check backend response
curl http://localhost:5000/api/system/update/check

# 3. Check browser console (F12)
```

### Server Won't Start?
```bash
# Check port 5000 is free
# Windows:
netstat -ano | findstr :5000

# Linux/Mac:
lsof -i :5000

# Kill if needed and restart
```

### Update Installation Fails?
```bash
# Check permissions
# Windows: Run as Administrator
# Linux: sudo chown -R pi:pi /path/to/OneCore
```

---

## 📊 File Locations

```
OneCore v1.0.0/
├── version.txt              ← Current version
├── backend/
│   ├── updater.py          ← Update engine
│   └── api_server.py       ← Backend server
├── frontend/
│   ├── index.html          ← Main dashboard
│   ├── analytics.html      ← Analytics page
│   ├── css/               ← Styles
│   └── js/                ← Scripts
└── test_update_system.py   ← Test script
```

---

## 🎨 Color Codes

```css
Primary Red:    #FF0000
Black:          #000000
Dark Grey:      #1a1a1a
Medium Grey:    #2d2d2d
Light Grey:     #F5F5F5
Success Green:  #4caf50
Warning Yellow: #FFC107
```

---

## 📝 Version Format

```
v1.0.0  ← Major.Minor.Patch

Major (1.x.x): Breaking changes
Minor (x.1.x): New features
Patch (x.x.1): Bug fixes
```

---

## 🔐 Protected Files (Never Overwritten)

- `version.txt`
- `system_config.json`
- `irrigation_system.db`
- `.env`
- `*.log`
- `data/` folder
- `logs/` folder

---

## ⚙️ API Endpoints

```http
GET  /api/status                    ← System status
GET  /api/sensors                   ← Sensor data
GET  /api/system/update/check       ← Check updates
POST /api/system/update/install     ← Install update
POST /api/system/reboot             ← Reboot system
```

---

## 📱 Browser Shortcuts

```
F12           ← Open DevTools
Ctrl+Shift+R  ← Hard refresh
Ctrl+R        ← Refresh
```

---

## 🎯 Release Checklist

- [ ] Code tested locally
- [ ] Version bumped in commit
- [ ] Tag created and pushed
- [ ] GitHub release published
- [ ] Release notes written
- [ ] Update tested on live system

---

## 💡 Pro Tips

1. **Test locally first** - Always!
2. **Use semantic versioning** - v1.0.0 format
3. **Write clear release notes** - Users see these
4. **Backup before major updates** - Just in case
5. **Check GitHub API limits** - 60 requests/hour

---

## 🆘 Need Help?

1. Check `UPDATE_SYSTEM_README.md` for details
2. Run `python test_update_system.py` to diagnose
3. Check GitHub Issues
4. Review browser console (F12)
5. Check backend logs

---

## 🎉 Success Indicators

✅ Server starts without errors  
✅ Browser shows dashboard  
✅ Red indicator appears (if update exists)  
✅ Update modal displays release notes  
✅ Zone map is interactive  
✅ Charts are red-themed  
✅ Footer is dark grey  
✅ Mobile menu is red  

---

**Last Updated:** January 12, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
