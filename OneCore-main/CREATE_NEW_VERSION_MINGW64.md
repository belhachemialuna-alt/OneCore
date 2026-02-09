# 🚀 Create New Version - Step-by-Step Guide (MINGW64)

## Complete Command-Line Workflow for Creating a New GitHub Release

This guide shows you **exactly** how to create a new version using **only commands** in MINGW64 (Git Bash).

---

## 📋 Prerequisites

- ✅ Git repository initialized
- ✅ Remote repository configured: `belhachemialuna-alt/OneCore`
- ✅ You're on the `main` branch
- ✅ All changes are ready to commit

---

## 🔄 Complete Workflow: Create Version 1.0.1

### Step 1: Check Current Status

```bash
# Check current version
cat version.txt

# Check git status
git status

# Check current branch
git branch
```

**Expected:** Should show `1.0.0` in version.txt and you should be on `main` branch.

---

### Step 2: Make Your Code Changes (if any)

```bash
# Edit files as needed
# ... make your changes ...

# Stage all changes
git add .

# Commit changes
git commit -m "New feature: [describe your changes]"
```

---

### Step 3: Update Version Number

```bash
# Update version.txt to new version (e.g., 1.0.1)
echo "1.0.1" > version.txt

# Verify the change
cat version.txt

# Stage version file
git add version.txt

# Commit version bump
git commit -m "Bump version to 1.0.1"
```

**Important:** 
- Version format: `MAJOR.MINOR.PATCH` (e.g., `1.0.1`)
- No 'v' prefix in `version.txt`
- GitHub release tag will have 'v' prefix (`v1.0.1`)

---

### Step 4: Push to GitHub

```bash
# Push all commits to GitHub
git push origin main
```

**Verify:**
```bash
# Check remote status
git status

# View recent commits
git log --oneline -5
```

---

### Step 5: Create Git Tag

```bash
# Create annotated tag (recommended)
git tag -a v1.0.1 -m "Release v1.0.1 - [Your description]"

# OR create lightweight tag
git tag v1.0.1

# Verify tag created
git tag -l

# Push tag to GitHub
git push origin v1.0.1
```

**Tag Format:**
- Must match `version.txt` with 'v' prefix
- `version.txt`: `1.0.1` → Tag: `v1.0.1`
- Use semantic versioning

---

### Step 6: Create GitHub Release (Command Line)

#### Option A: Using GitHub CLI (gh) - Recommended

```bash
# Install GitHub CLI if not installed
# Windows: choco install gh
# Or download from: https://cli.github.com/

# Authenticate (first time only)
gh auth login

# Create release from tag
gh release create v1.0.1 \
  --title "v1.0.1 - [Your Release Title]" \
  --notes "## What's New

- Feature 1
- Feature 2
- Bug fixes

## Installation
Updates will be available automatically via the update icon." \
  --latest
```

#### Option B: Using Git Only (Manual GitHub Web Interface)

If you don't have GitHub CLI:

1. **Push tag first:**
   ```bash
   git push origin v1.0.1
   ```

2. **Then go to GitHub website:**
   - Visit: https://github.com/belhachemialuna-alt/OneCore/releases
   - Click "Draft a new release"
   - Select tag: `v1.0.1`
   - Fill in title and description
   - Click "Publish release"

---

### Step 7: Verify Release Created

```bash
# Test GitHub API directly
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest

# Or using GitHub CLI
gh release view v1.0.1
```

**Expected JSON Response:**
```json
{
  "tag_name": "v1.0.1",
  "name": "v1.0.1 - [Your Title]",
  "published_at": "2026-01-12T...",
  ...
}
```

---

## 🎯 Quick Reference: Complete Command Sequence

Here's the **complete sequence** in one block (copy-paste ready):

```bash
# 1. Check current state
cat version.txt
git status

# 2. Update version
echo "1.0.1" > version.txt
git add version.txt
git commit -m "Bump version to 1.0.1"

# 3. Push to GitHub
git push origin main

# 4. Create and push tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# 5. Create release (if using GitHub CLI)
gh release create v1.0.1 \
  --title "v1.0.1 - Your Release Title" \
  --notes "Release notes here" \
  --latest

# 6. Verify
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest
```

---

## 📝 Version Numbering Guide

### Semantic Versioning

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Examples

| Change Type | Old Version | New Version | Tag |
|------------|-------------|-------------|-----|
| Bug fix | 1.0.0 | 1.0.1 | v1.0.1 |
| New feature | 1.0.0 | 1.1.0 | v1.1.0 |
| Breaking change | 1.0.0 | 2.0.0 | v2.0.0 |
| Multiple fixes | 1.0.5 | 1.0.6 | v1.0.6 |

---

## 🔍 Verification Checklist

After creating a release, verify:

- [ ] `version.txt` updated to new version
- [ ] Version change committed
- [ ] Changes pushed to `main` branch
- [ ] Git tag created (`v1.0.1`)
- [ ] Tag pushed to GitHub
- [ ] GitHub release published
- [ ] API returns new release: `curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest`
- [ ] Update indicator appears in web app (after 3 seconds)

---

## 🚨 Important Notes

1. **Version Matching:**
   - `version.txt`: `1.0.1` (no 'v')
   - GitHub Tag: `v1.0.1` (with 'v')
   - **Must match** for update detection to work

2. **Tag Before Release:**
   - Create tag first, then create release
   - Or use GitHub CLI to create both at once

3. **Release Must Be Published:**
   - Draft releases are **not detected**
   - Must click "Publish release" on GitHub

4. **Always Test:**
   - Test update detection after creating release
   - Verify version numbers match

---

## 🛠️ Troubleshooting

### Tag Already Exists?

```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin --delete v1.0.1

# Recreate tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

### Release Not Detected?

```bash
# Check if release exists
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest

# Check version.txt
cat version.txt

# Verify tag exists
git tag -l
```

### Version Mismatch?

```bash
# Check version.txt
cat version.txt

# Check latest GitHub release tag
curl -s https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest | grep tag_name

# They must match (with/without 'v' prefix)
```

---

## 📚 Related Commands

```bash
# View all tags
git tag -l

# View tag details
git show v1.0.1

# Delete tag (if needed)
git tag -d v1.0.1
git push origin --delete v1.0.1

# View release info via API
curl https://api.github.com/repos/belhachemialuna-alt/OneCore/releases/latest

# Test update system
cd backend
python updater.py check
```

---

## 🎉 Success Indicators

Your new version is successfully created when:

- ✅ `version.txt` shows new version
- ✅ Git tag exists and is pushed
- ✅ GitHub release is published
- ✅ API returns new release as latest
- ✅ Update indicator appears in web app
- ✅ Update installation works

---

**Last Updated**: January 12, 2026  
**Repository**: belhachemialuna-alt/OneCore  
**Current Version**: 1.0.0
