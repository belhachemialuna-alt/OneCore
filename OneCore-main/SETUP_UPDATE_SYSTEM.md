# Quick Setup Guide - Update System

## 🚀 Installation Steps

### 1. Install Dependencies
```bash
cd "d:\Bayyti.com\OneCore v1.0.0\OneCore v1.0.0"
pip install -r requirements.txt
```

All required packages (Flask, requests, etc.) are already in `requirements.txt`.

### 2. Verify Version File
```bash
# Check version.txt exists
cat version.txt
# Should show: 1.0.0
```

### 3. Test Update System (Backend)
```bash
cd backend
python updater.py check
```

Expected output:
```
Current version: 1.0.0
Latest version: 1.0.0 (or higher if releases exist)
Update available: False (or True if newer version exists)
```

### 4. Start the Server
```bash
cd backend
python api_server.py
```

Server starts on `http://localhost:5000`

### 5. Test Update System (Frontend)
1. Open browser: `http://localhost:5000`
2. Look at update button (rotate icon) in header
3. Wait 3 seconds - if update available, red indicator dot appears
4. Click update button to see release info
5. Click "Install Update" to update system

## 🎯 Quick Test - Create Your First Release

### Option A: Using GitHub Web Interface
1. Go to: https://github.com/belhachemialuna-alt/OneCore
2. Click "Releases" → "Draft a new release"
3. Create tag: `v1.0.1`
4. Title: "Version 1.0.1 - Update System Test"
5. Description:
   ```markdown
   ## What's New
   - ✅ Functional update system with GitHub Releases
   - 🔄 Auto-update indicator
   - 🎨 Matching headers on all pages
   - 🗺️ Zone map with interactive canvas
   ```
6. Click "Publish release"

### Option B: Using Git Commands
```bash
# Make sure you're in the project directory
cd "d:\Bayyti.com\OneCore v1.0.0\OneCore v1.0.0"

# Stage all changes
git add .

# Commit
git commit -m "Add functional update system with GitHub Releases"

# Create and push tag
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

Then create the release on GitHub (see Option A, steps 2-6).

### 6. Verify Update Detection
1. Refresh your browser at `http://localhost:5000`
2. Wait 3 seconds
3. Red dot should appear on update button! 🔴
4. Click button to see v1.0.1 release notes
5. Click "Install Update" to update

## 🔍 Troubleshooting

### Red Indicator Doesn't Appear
**Check 1:** Is there a newer release?
```bash
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest
```

**Check 2:** Check browser console (F12)
- Look for update check request
- Check for any errors

**Check 3:** Manual test
```bash
curl http://localhost:5000/api/system/update/check
```

Should return JSON with `update_available: true`

### Update Installation Fails
**Check:** File permissions
```bash
# Windows (run as Administrator if needed)
# Linux/Raspberry Pi:
sudo chown -R pi:pi /path/to/OneCore
chmod -R 755 /path/to/OneCore
```

### GitHub API Rate Limit
**Issue:** "API rate limit exceeded"

**Solution:** GitHub allows 60 requests/hour without auth
- Wait 1 hour
- Or add GitHub token (optional):
  ```python
  # In backend/updater.py, add to headers:
  headers = {
      'Authorization': 'token YOUR_GITHUB_TOKEN',
      'User-Agent': 'BAYYTI-B1-Updater'
  }
  ```

## 📋 Pre-Deployment Checklist

Before deploying to Raspberry Pi Zero:

- [ ] Test update check works
- [ ] Test update installation works
- [ ] Verify protected files aren't overwritten
- [ ] Test on Windows/Mac (if applicable)
- [ ] Create backup of current system
- [ ] Document current version in `version.txt`
- [ ] Test reboot functionality (if using Raspberry Pi)

## 🎨 Visual Confirmation

When everything works, you should see:

1. **Header:** Full-height icon buttons (matching on both pages)
2. **Update Button:** Rotate icon with red indicator when update available
3. **Modal:** Beautiful dark modal with release notes
4. **Footer:** Black/grey gradient with red border
5. **Mobile Menu:** Red sidebar on mobile
6. **Analytics:** Zone map with interactive canvas

## 🔗 Important URLs

- **Dashboard:** http://localhost:5000/
- **Analytics:** http://localhost:5000/analytics.html
- **API Check:** http://localhost:5000/api/system/update/check
- **GitHub Releases:** https://github.com/belhachemialuna-alt/OneCore/releases

## 💡 Tips

1. **Always test locally first** before pushing to production
2. **Use semantic versioning**: v1.0.0 → v1.0.1 (patch) → v1.1.0 (minor) → v2.0.0 (major)
3. **Write clear release notes** - users see these in the update modal
4. **Test on actual Raspberry Pi** before releasing to production units
5. **Keep backups** of working configurations

## 🚀 Ready for Production?

Once tested and working:

1. Create release v1.0.0 (production-ready)
2. Deploy to Raspberry Pi Zero
3. Configure auto-start on boot
4. Set up monitoring
5. Document for end users

Your update system is now fully functional! 🎉
