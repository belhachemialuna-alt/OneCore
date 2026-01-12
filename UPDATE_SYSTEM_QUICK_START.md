# 🚀 Update System - Quick Start Guide

## ✅ Your Update System is Ready!

Your update system is **fully implemented** and working. This quick guide will help you verify and use it.

---

## 🎯 3-Minute Verification

### Step 1: Test Backend (30 seconds)
```bash
cd backend
python updater.py check
```

**Expected:** Shows current version and latest version from GitHub

### Step 2: Test API (30 seconds)
```bash
curl http://localhost:5000/api/system/update/check
```

**Expected:** Returns JSON with update status

### Step 3: Check Web Interface (2 minutes)
1. Open: `http://localhost:5000/index.html`
2. Wait 3 seconds
3. Look for update icon (🔄) in header
4. If update available, red dot appears

---

## 📝 Creating Your First Update

### 1. Update Version
```bash
echo "1.0.1" > version.txt
git add version.txt
git commit -m "Bump version to 1.0.1"
git push origin main
```

### 2. Create GitHub Release
1. Go to: https://github.com/belhachemialuna-alt/OneCore/releases
2. Click "Draft a new release"
3. Tag: `v1.0.1` (must match version.txt with 'v')
4. Title: `v1.0.1 - Your Update Description`
5. Description: Write what's new
6. Click "Publish release"

### 3. Verify Update Detected
- Open your app
- Wait 3 seconds
- **Red indicator** appears on update icon
- Click icon to see release details
- Click "Install Update" to update

---

## 🔍 Quick Troubleshooting

### Update Indicator Not Appearing?
```bash
# Check if release exists
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest

# Check version file
cat version.txt

# Check API endpoint
curl http://localhost:5000/api/system/update/check
```

### Update Installation Fails?
- Check internet connection
- Verify GitHub release is published (not draft)
- Check Flask server logs: `sudo journalctl -u bayyti.service -n 50`

---

## 📚 Full Documentation

- **Complete Guide**: `UPDATE_SYSTEM_VERIFICATION_GUIDE.md`
- **Release Workflow**: `GITHUB_RELEASE_WORKFLOW.md`
- **Test Script**: `python test_update_system_quick.py`

---

## ✅ Verification Checklist

- [ ] `version.txt` exists
- [ ] `backend/updater.py` present
- [ ] API endpoint `/api/system/update/check` works
- [ ] Update icon visible in header
- [ ] Red indicator appears when update available
- [ ] Update installation works

---

## 🎉 You're All Set!

Your update system is ready. Just:
1. Make code changes
2. Update `version.txt`
3. Create GitHub release
4. Users see update automatically!

---

**Current Version**: 1.0.0  
**Status**: ✅ Fully Functional
