# 🔄 Update System Verification & Usage Guide

## ✅ System Status

Your update system is **fully implemented** and ready to use! This guide will help you verify everything works correctly and show you how to manage updates.

---

## 📋 Current Configuration

- **Repository**: `belhachemialuna-alt/OneCore`
- **GitHub API**: `https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest`
- **Current Version**: `1.0.0` (stored in `version.txt`)
- **Backend Module**: `backend/updater.py`
- **API Endpoint**: `/api/system/update/check`
- **Update Indicator**: Red dot appears on update icon when update available

---

## 🧪 Step 1: Verify Current Setup

### 1.1 Check Version File
```bash
cat version.txt
# Should show: 1.0.0
```

### 1.2 Test Backend Update Check (CLI)
```bash
cd backend
python updater.py check
```

**Expected Output:**
```
Current version: 1.0.0
Latest version: 1.0.0 (or newer if release exists)
Update available: False (or True if newer release exists)
```

### 1.3 Test API Endpoint
```bash
# From your Raspberry Pi or local machine
curl http://localhost:5000/api/system/update/check
```

**Expected JSON Response:**
```json
{
  "success": true,
  "update_available": false,
  "current_version": "1.0.0",
  "latest_version": "1.0.0",
  "release_date": "...",
  "release_notes": "...",
  "download_url": "..."
}
```

### 1.4 Verify Frontend Integration
1. Open your app: `http://localhost:5000/index.html`
2. Wait 3 seconds after page load
3. Check browser console (F12) for any errors
4. The update icon (🔄) should be visible in the header
5. No red indicator should appear (since you're on latest version)

---

## 🎯 Step 2: Test Update Indicator

### 2.1 Manual Test (Simulate Update Available)

**Option A: Temporarily Modify Version File**
```bash
# Change version to something older
echo "0.9.0" > version.txt

# Restart your Flask server
# Now the system will think an update is available
```

**Option B: Create a Test GitHub Release**
1. Go to: https://github.com/belhachemialuna-alt/OneCore/releases
2. Click "Draft a new release"
3. Tag: `v1.0.1`
4. Title: `v1.0.1 - Test Release`
5. Description: `This is a test release for verification`
6. Click "Publish release"

After creating the release:
- Wait 3 seconds after page reload
- **Red indicator dot** should appear on the update icon
- Click the update icon to see release details

### 2.2 Verify Indicator Appears
- ✅ Red dot appears on update icon (top-right corner)
- ✅ Dot pulses with animation
- ✅ Visible on all pages (index, analytics, hardware, etc.)

---

## 🚀 Step 3: Create Your First Real Update

### 3.1 Prepare Your Code Changes
```bash
# Make your code changes
git add .
git commit -m "New feature: [describe your changes]"
```

### 3.2 Update Version Number
```bash
# Update version.txt to match your new release
echo "1.0.1" > version.txt
git add version.txt
git commit -m "Bump version to 1.0.1"
```

### 3.3 Push to GitHub
```bash
git push origin main
```

### 3.4 Create GitHub Release

1. **Go to Releases Page:**
   - Visit: https://github.com/belhachemialuna-alt/OneCore/releases
   - Click "Draft a new release"

2. **Fill Release Details:**
   - **Tag version**: `v1.0.1` (must match version.txt, with 'v' prefix)
   - **Release title**: `v1.0.1 - [Your Feature Name]`
   - **Description**: 
     ```markdown
     ## What's New
     - Feature 1
     - Feature 2
     - Bug fixes
     
     ## Installation
     Updates will be available automatically via the update icon.
     ```

3. **Publish Release:**
   - Click "Publish release"
   - GitHub will create a zip file automatically

### 3.5 Verify Release Created
```bash
# Test API directly
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest
```

You should see JSON with your new release information.

---

## 🔄 Step 4: Test Update Installation

### 4.1 On Your Raspberry Pi

1. **Check Current Version:**
   ```bash
   cat version.txt
   # Should show: 1.0.0
   ```

2. **Open Web Interface:**
   - Navigate to: `http://localhost:5000/index.html`
   - Wait 3 seconds
   - **Red indicator** should appear on update icon

3. **Click Update Icon:**
   - Modal opens showing:
     - Latest version available
     - Current version
     - Release date
     - Release notes

4. **Install Update:**
   - Click "Install Update" button
   - System will:
     - Download update from GitHub
     - Backup protected files
     - Extract and copy new files
     - Update version.txt
     - Show success message

5. **Verify Update:**
   ```bash
   cat version.txt
   # Should now show: 1.0.1
   ```

6. **Restart Service (if needed):**
   ```bash
   sudo systemctl restart bayyti.service
   ```

---

## 📝 Step 5: Version Management Workflow

### Standard Update Workflow

```bash
# 1. Make your changes
git add .
git commit -m "Add new feature X"

# 2. Update version
echo "1.0.2" > version.txt
git add version.txt
git commit -m "Bump version to 1.0.2"

# 3. Push to GitHub
git push origin main

# 4. Create GitHub Release
# - Go to: https://github.com/belhachemialuna-alt/OneCore/releases
# - Click "Draft a new release"
# - Tag: v1.0.2
# - Title: v1.0.2 - [Description]
# - Publish

# 5. Users will see update indicator automatically
# 6. Users click update icon → Install → Done!
```

### Version Numbering Convention

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features
- **Patch** (1.0.0 → 1.0.1): Bug fixes

---

## 🔍 Step 6: Troubleshooting

### Issue: Update Indicator Not Appearing

**Check 1: API Endpoint Working?**
```bash
curl http://localhost:5000/api/system/update/check
```

**Check 2: GitHub Release Exists?**
```bash
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest
```

**Check 3: Version Comparison**
- Ensure GitHub release tag matches version format (e.g., `v1.0.1`)
- Ensure `version.txt` matches format (e.g., `1.0.1` without 'v')
- The system compares: `latest_version != current_version`

**Check 4: Browser Console**
- Open browser DevTools (F12)
- Check Console tab for errors
- Look for: `Silent update check failed` or similar

### Issue: Update Installation Fails

**Check 1: Network Connection**
```bash
# Test GitHub API access
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest
```

**Check 2: Permissions**
```bash
# Ensure Flask app has write permissions
ls -la version.txt
ls -la backend/
```

**Check 3: Backend Logs**
```bash
# Check Flask server logs
sudo journalctl -u bayyti.service -n 50
```

**Check 4: Protected Files**
- Update system skips protected files (config, database, logs)
- Check if important files are being skipped unintentionally

### Issue: Update Doesn't Apply Changes

**Check 1: Files Updated?**
```bash
# Check file modification times
ls -la frontend/
ls -la backend/
```

**Check 2: Version Updated?**
```bash
cat version.txt
```

**Check 3: Service Restarted?**
```bash
# Restart service to load new code
sudo systemctl restart bayyti.service
```

---

## ✅ Verification Checklist

Use this checklist to verify your update system:

- [ ] `version.txt` exists and contains current version
- [ ] `backend/updater.py` is present and functional
- [ ] API endpoint `/api/system/update/check` returns valid JSON
- [ ] Update icon (🔄) appears in header on all pages
- [ ] Update indicator (red dot) appears when update available
- [ ] Clicking update icon shows modal with release info
- [ ] "Install Update" button works and installs update
- [ ] Version file updates after successful installation
- [ ] Protected files (config, database) are not overwritten
- [ ] GitHub release can be created and detected
- [ ] Auto-check runs 3 seconds after page load
- [ ] Update system works on Raspberry Pi

---

## 🎯 Quick Test Commands

```bash
# Test backend updater
cd backend && python updater.py check

# Test API endpoint
curl http://localhost:5000/api/system/update/check

# Test GitHub API directly
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest

# Check current version
cat version.txt

# Check service status
sudo systemctl status bayyti.service

# View service logs
sudo journalctl -u bayyti.service -f
```

---

## 📚 Additional Resources

- **Backend Updater**: `backend/updater.py`
- **API Server**: `backend/api_server.py` (lines 473-549)
- **Frontend JS**: `frontend/js/dashboard.js` (lines 517-611)
- **Version File**: `version.txt`
- **GitHub Releases**: https://github.com/belhachemialuna-alt/OneCore/releases

---

## 🎉 Success Indicators

Your update system is working correctly when:

1. ✅ Red indicator appears automatically when new release exists
2. ✅ Clicking update icon shows release information
3. ✅ Update installs successfully without errors
4. ✅ Version file updates after installation
5. ✅ Protected files remain untouched
6. ✅ System continues working after update

---

## 🚨 Important Notes

1. **Always test updates** on a development system first
2. **Backup important data** before major updates
3. **Version numbers** must match between `version.txt` and GitHub release tag
4. **Protected files** (config, database) are never overwritten
5. **Service restart** may be needed after some updates
6. **GitHub releases** are the source of truth for updates

---

## 📞 Need Help?

If you encounter issues:

1. Check backend logs: `sudo journalctl -u bayyti.service -n 100`
2. Check browser console for frontend errors
3. Test API endpoints directly with `curl`
4. Verify GitHub release exists and is public
5. Ensure version numbers match correctly

---

**Last Updated**: January 12, 2026  
**System Version**: 1.0.0  
**Status**: ✅ Fully Functional
