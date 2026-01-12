# BAYYTI-B1 Update System 🔄

## Overview
Automatic update system using GitHub Releases for seamless OTA (Over-The-Air) updates on Raspberry Pi Zero.

## GitHub Repository
- **Repo:** `belhachemialuna-alt/OneCore`
- **API Endpoint:** `https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest`

## How It Works

### 1. Version Management
- Current version stored in `version.txt` (root directory)
- GitHub releases use semantic versioning (v1.0.0, v1.1.0, etc.)
- Automatic version comparison on startup

### 2. Update Check
- Backend checks GitHub Releases API every page load (silent)
- Red indicator dot appears on update button when new version available
- User can manually click update button to check

### 3. Update Process
1. User clicks update button
2. System downloads latest release from GitHub
3. Backup created of protected files
4. New files extracted and copied (excluding config/data)
5. Version updated in `version.txt`
6. System ready (restart if needed)

### 4. Protected Files (NOT Overwritten)
- `version.txt`
- `system_config.json`
- `irrigation_system.db`
- `.env`
- `*.log`
- `data/` folder
- `logs/` folder

## How to Release Updates

### Step 1: Commit Your Changes
```bash
git add .
git commit -m "Add new feature: zone map with interactive canvas"
```

### Step 2: Create Version Tag
```bash
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

### Step 3: Create GitHub Release
1. Go to: https://github.com/belhachemialuna-alt/OneCore/releases
2. Click "Draft a new release"
3. Select your tag (v1.1.0)
4. Add release title: "Version 1.1.0 - Zone Map Feature"
5. Add release notes (markdown supported):
   ```markdown
   ## What's New
   - ✨ Interactive zone map with pan and zoom
   - 🎨 Red theme for all analytics charts
   - 🔧 Full-height icon navigation
   - 🔄 Improved update system with indicator
   
   ## Bug Fixes
   - Fixed mobile menu styling
   - Improved footer contrast
   
   ## Installation
   - Pull latest release
   - System will auto-detect and notify
   ```
6. Click "Publish release"

### Step 4: Users Get Notified
- Red indicator appears on update button automatically
- Users click button → see release notes → install with one click
- System updates and ready!

## API Endpoints

### Check for Updates
```http
GET /api/system/update/check

Response:
{
  "success": true,
  "update_available": true,
  "current_version": "1.0.0",
  "latest_version": "1.1.0",
  "release_date": "2024-01-12T10:30:00Z",
  "release_notes": "## What's New\n- New features...",
  "download_url": "https://api.github.com/repos/.../zipball/v1.1.0"
}
```

### Install Update
```http
POST /api/system/update/install
Content-Type: application/json

{
  "download_url": "https://api.github.com/repos/.../zipball/v1.1.0"
}

Response:
{
  "success": true,
  "message": "Update installation started. System will restart automatically."
}
```

### Reboot System
```http
POST /api/system/reboot

Response:
{
  "success": true,
  "message": "System will reboot in 1 minute"
}
```

## Manual Update (CLI)

### Check for Updates
```bash
cd backend
python updater.py check
```

Output:
```
Current version: 1.0.0
Latest version: 1.1.0
Update available: True
```

### Install Update
```bash
python updater.py update
```

Output:
```
Starting update: 1.0.0 → 1.1.0
Downloading update from https://...
Update package extracted
Updated: frontend/index.html
Updated: backend/api_server.py
Skipped protected file: system_config.json
Skipped protected file: irrigation_system.db
✅ Update completed successfully: 1.1.0
Updated 47 files, skipped 3 protected files
```

## Frontend Integration

### Update Indicator (Auto-Check)
```javascript
// Checks on page load (silent)
setTimeout(async () => {
    const response = await fetch('/api/system/update/check');
    const data = await response.json();
    
    if (data.success && data.update_available) {
        // Show red indicator dot
        document.getElementById('updateIndicator').classList.add('active');
    }
}, 3000);
```

### Update Button Click
```javascript
async function checkForUpdates() {
    const response = await fetch('/api/system/update/check');
    const data = await response.json();
    
    if (data.update_available) {
        // Show modal with release notes
        showUpdateModal(data);
    } else {
        alert('You are up to date!');
    }
}
```

## Best Practices

✅ **DO:**
- Always test updates locally before releasing
- Use semantic versioning (v1.0.0, v1.1.0, v2.0.0)
- Write clear release notes
- Backup before major updates
- Test on Raspberry Pi Zero before production

❌ **DON'T:**
- Don't overwrite user config files
- Don't skip version numbers
- Don't push untested code to releases
- Don't update without backup
- Don't force updates without user consent

## Troubleshooting

### Update Check Fails
- **Cause:** No internet connection or GitHub API rate limit
- **Solution:** Check internet, wait for rate limit reset (60 requests/hour)

### Update Installation Fails
- **Cause:** Insufficient disk space or file permissions
- **Solution:** 
  ```bash
  # Check disk space
  df -h
  
  # Fix permissions
  sudo chown -R pi:pi /path/to/OneCore
  ```

### Version Not Updating
- **Cause:** `version.txt` is read-only
- **Solution:**
  ```bash
  chmod 644 version.txt
  ```

### Protected Files Overwritten
- **Cause:** File not in PROTECTED_FILES list
- **Solution:** Add to `backend/updater.py`:
  ```python
  PROTECTED_FILES = [
      "version.txt",
      "your_file.json",  # Add here
      ...
  ]
  ```

## Security Notes

- GitHub API uses HTTPS (secure)
- No API key required for public repos
- Rate limit: 60 requests/hour (unauthenticated)
- Updates verified by comparing version numbers
- Backup created before every update

## Future Enhancements

- 🔐 Add signature verification for updates
- 📊 Update history and rollback feature
- 🔔 Push notifications for critical updates
- ⏰ Scheduled automatic updates (opt-in)
- 📦 Delta updates (only changed files)

## Support

For issues or questions:
1. Check GitHub Issues: https://github.com/belhachemialuna-alt/OneCore/issues
2. Review release notes for breaking changes
3. Test updates in development environment first

---

**Current Version:** 1.0.0  
**Last Updated:** 2024-01-12  
**Maintainer:** BAYYTI Team
