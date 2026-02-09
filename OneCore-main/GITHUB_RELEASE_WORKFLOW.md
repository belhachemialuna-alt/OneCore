# 🚀 GitHub Release Workflow Guide

## Quick Reference: Creating Updates

This guide shows you exactly how to create GitHub releases that your update system will detect.

---

## 📋 Prerequisites

- ✅ GitHub repository: `belhachemialuna-alt/OneCore`
- ✅ Code changes committed and pushed
- ✅ Version number updated in `version.txt`

---

## 🔄 Complete Update Workflow

### Step 1: Make Your Changes

```bash
# 1. Make code changes
# Edit files as needed...

# 2. Stage changes
git add .

# 3. Commit
git commit -m "Add new feature: [description]"
```

### Step 2: Update Version Number

```bash
# Update version.txt to new version
echo "1.0.1" > version.txt

# Commit version change
git add version.txt
git commit -m "Bump version to 1.0.1"
```

**Version Format:**
- Use semantic versioning: `MAJOR.MINOR.PATCH`
- Examples: `1.0.0`, `1.0.1`, `1.1.0`, `2.0.0`
- No 'v' prefix in `version.txt` (GitHub release tag will have 'v')

### Step 3: Push to GitHub

```bash
# Push all changes
git push origin main
```

### Step 4: Create GitHub Release

#### 4.1 Navigate to Releases Page

1. Go to: https://github.com/belhachemialuna-alt/OneCore
2. Click **"Releases"** (right sidebar)
3. Click **"Draft a new release"** or **"Create a new release"**

#### 4.2 Fill Release Information

**Tag Version:**
- Click **"Choose a tag"** dropdown
- Type: `v1.0.1` (must match `version.txt` with 'v' prefix)
- If tag doesn't exist, select **"Create new tag: v1.0.1 on publish"**

**Release Title:**
```
v1.0.1 - Feature Name or Description
```

**Release Description:**
```markdown
## 🎉 What's New

### ✨ Features
- New feature 1
- New feature 2

### 🐛 Bug Fixes
- Fixed issue with...
- Resolved problem in...

### 🔧 Improvements
- Performance improvements
- UI enhancements

## 📦 Installation

Updates will be automatically detected by the system. Click the update icon (🔄) in the dashboard to install.

## 📝 Notes

- No manual intervention required
- System will restart automatically after update
- All configurations are preserved
```

#### 4.3 Publish Release

1. Review all information
2. Click **"Publish release"** button
3. GitHub will create the release and generate a zip file automatically

---

## ✅ Verify Release Created

### Method 1: Check GitHub Website
- Visit: https://github.com/belhachemialuna-alt/OneCore/releases
- Your new release should appear at the top

### Method 2: Test API Directly
```bash
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest
```

**Expected Response:**
```json
{
  "tag_name": "v1.0.1",
  "name": "v1.0.1 - Feature Name",
  "body": "## What's New\n...",
  "published_at": "2026-01-12T...",
  "zipball_url": "https://api.github.com/repos/.../zipball/v1.0.1",
  ...
}
```

### Method 3: Test Your App
1. Open: `http://localhost:5000/index.html`
2. Wait 3 seconds
3. **Red indicator dot** should appear on update icon
4. Click update icon to see release details

---

## 🎯 Version Numbering Guide

### Semantic Versioning

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, incompatible API changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

### Examples

| Change Type | Old Version | New Version | GitHub Tag |
|------------|-------------|-------------|------------|
| Bug fix | 1.0.0 | 1.0.1 | v1.0.1 |
| New feature | 1.0.0 | 1.1.0 | v1.1.0 |
| Breaking change | 1.0.0 | 2.0.0 | v2.0.0 |
| Multiple bug fixes | 1.0.5 | 1.0.6 | v1.0.6 |

---

## 📝 Release Notes Template

Copy and customize this template for your releases:

```markdown
## 🎉 Release v1.0.1

### ✨ New Features
- [Feature description]
- [Feature description]

### 🐛 Bug Fixes
- Fixed [issue description]
- Resolved [problem description]

### 🔧 Improvements
- Improved [component/feature]
- Enhanced [functionality]

### 📦 Technical Changes
- Updated dependencies
- Code refactoring
- Performance optimizations

### ⚠️ Breaking Changes
- [If any, describe here]

### 📚 Documentation
- Updated [documentation]
- Added [guides]

---

## 🚀 Installation

This update will be automatically detected by your system. Simply:
1. Wait for the red indicator on the update icon
2. Click the update icon (🔄)
3. Review release notes
4. Click "Install Update"
5. System will update and restart automatically

---

**Release Date:** [Date]  
**Version:** v1.0.1  
**Compatible With:** All previous versions
```

---

## 🔍 Troubleshooting Releases

### Issue: Release Not Detected

**Check 1: Tag Format**
- ✅ GitHub tag: `v1.0.1` (with 'v')
- ✅ version.txt: `1.0.1` (without 'v')
- ❌ Mismatch will cause detection failure

**Check 2: Release Published**
- Release must be **published**, not draft
- Check: https://github.com/belhachemialuna-alt/OneCore/releases

**Check 3: API Response**
```bash
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest
```
- Should return JSON with your latest release
- Check `tag_name` matches your version

**Check 4: Version Comparison**
- System compares: `latest_version != current_version`
- If versions match, no update will be detected
- Ensure new release has higher version number

### Issue: Wrong Release Detected

**Solution:**
- Only the **latest** release is checked
- If you have multiple releases, the most recent one is used
- Delete or unpublish old releases if needed

### Issue: Release Notes Not Showing

**Check:**
- Release description/body is filled in GitHub
- API returns `body` field with content
- Frontend modal displays `release_notes` from API

---

## 🎯 Best Practices

1. **Always update `version.txt`** before creating release
2. **Use semantic versioning** consistently
3. **Write clear release notes** for users
4. **Test release detection** before announcing
5. **Keep releases public** (not draft)
6. **Tag format must match**: GitHub `v1.0.1` = version.txt `1.0.1`
7. **One release per version** (don't republish same version)

---

## 📊 Release Checklist

Before publishing a release, verify:

- [ ] Code changes committed and pushed
- [ ] `version.txt` updated to new version
- [ ] Version change committed and pushed
- [ ] Release notes written and reviewed
- [ ] GitHub tag matches version (with 'v' prefix)
- [ ] Release title is descriptive
- [ ] Release description is complete
- [ ] Release is set to "Published" (not draft)
- [ ] Tested API endpoint returns correct release
- [ ] Update indicator appears in app
- [ ] Update installation works correctly

---

## 🚀 Quick Commands

```bash
# Update version
echo "1.0.1" > version.txt
git add version.txt
git commit -m "Bump version to 1.0.1"
git push origin main

# Then create release on GitHub website
# Tag: v1.0.1
# Title: v1.0.1 - [Description]
```

---

## 📚 Related Files

- **Version File**: `version.txt`
- **Updater Module**: `backend/updater.py`
- **API Endpoint**: `backend/api_server.py` (line 473)
- **Frontend**: `frontend/js/dashboard.js` (line 517)
- **Verification Guide**: `UPDATE_SYSTEM_VERIFICATION_GUIDE.md`

---

**Last Updated**: January 12, 2026  
**Repository**: belhachemialuna-alt/OneCore
