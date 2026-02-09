"""
BAYYTI-B1 System Updater
Manages automatic updates from GitHub Releases
"""
import requests
import zipfile
import io
import os
import shutil
import logging
from packaging import version

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

REPO = "belhachemialuna-alt/OneCore"
API_URL = f"https://api.github.com/repos/{REPO}/releases/latest"
APP_DIR = os.path.abspath(os.path.dirname(__file__) + "/..")
VERSION_FILE = os.path.join(APP_DIR, "version.txt")

# Protected files/folders that should NOT be overwritten during update
PROTECTED_FILES = [
    "version.txt",
    "system_config.json",
    "irrigation_system.db",
    ".env",
    "*.log"
]

PROTECTED_DIRS = [
    "data",
    "logs",
    "__pycache__",
    ".git"
]


def get_local_version():
    """
    Get current installed version.
    If version.txt is missing, empty, or unreadable,
    force update by returning 0.0.0
    """
    if not os.path.exists(VERSION_FILE):
        logger.warning("version.txt missing → forcing update")
        return "0.0.0"

    try:
        with open(VERSION_FILE, "r") as f:
            content = f.read().strip()
            if not content:
                logger.warning("version.txt empty → forcing update")
                return "0.0.0"
            return content
    except Exception as e:
        logger.error(f"Error reading version file: {e}")
        return "0.0.0"


def set_local_version(version):
    """Save new version to file"""
    try:
        with open(VERSION_FILE, "w") as f:
            f.write(version)
        logger.info(f"Version updated to {version}")
    except Exception as e:
        logger.error(f"Error writing version file: {e}")


def check_for_update():
    """Check GitHub for latest release"""
    try:
        headers = {
            'User-Agent': 'BAYYTI-B1-Updater',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        r = requests.get(API_URL, headers=headers, timeout=10)
        r.raise_for_status()
        data = r.json()

        latest_version = data["tag_name"].lstrip("v")
        zip_url = data["zipball_url"]
        release_notes = data.get("body", "No release notes provided")
        release_date = data.get("published_at", "")

        logger.info(f"Latest version available: {latest_version}")
        
        return {
            "latest_version": latest_version,
            "zip_url": zip_url,
            "release_notes": release_notes,
            "release_date": release_date,
            "current_version": get_local_version()
        }
    except requests.RequestException as e:
        logger.error(f"Error checking for updates: {e}")
        raise Exception(f"Failed to check for updates: {str(e)}")


def is_update_available():
    """Check if an update is available"""
    try:
        info = check_for_update()
        return compare_versions(
            info["latest_version"],
            info["current_version"]
        ) > 0
    except Exception as e:
        logger.error(f"Error checking update availability: {e}")
        return False


def compare_versions(v1, v2):
    """
    Compare two semantic versions.
    Returns:
        1  if v1 > v2
       -1  if v1 < v2
        0  if equal or invalid
    """
    try:
        return (
            version.parse(v1) > version.parse(v2)
        ) - (
            version.parse(v1) < version.parse(v2)
        )
    except Exception as e:
        logger.error(f"Version comparison failed: {e}")
        return 0


def should_skip_file(file_path):
    """Check if file should be protected from update"""
    filename = os.path.basename(file_path)
    
    # Check protected files
    for protected in PROTECTED_FILES:
        if '*' in protected:
            pattern = protected.replace('*', '')
            if filename.endswith(pattern):
                return True
        elif filename == protected:
            return True
    
    # Check protected directories
    for protected_dir in PROTECTED_DIRS:
        if protected_dir in file_path:
            return True
    
    return False


def backup_current_version():
    """Create a backup of current version before updating"""
    try:
        backup_dir = os.path.join(APP_DIR, "backup_before_update")
        if os.path.exists(backup_dir):
            shutil.rmtree(backup_dir)
        
        # Backup critical files only
        os.makedirs(backup_dir, exist_ok=True)
        
        for protected_file in PROTECTED_FILES:
            if '*' not in protected_file:
                src = os.path.join(APP_DIR, protected_file)
                if os.path.exists(src):
                    dst = os.path.join(backup_dir, protected_file)
                    shutil.copy2(src, dst)
                    logger.info(f"Backed up: {protected_file}")
        
        logger.info("Backup completed successfully")
        return True
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        return False


def update_app(zip_url=None):
    """Download and apply update from GitHub"""
    try:
        local_version = get_local_version()
        
        # Get update info if zip_url not provided
        if not zip_url:
            info = check_for_update()
            latest_version = info["latest_version"]
            zip_url = info["zip_url"]
        else:
            info = check_for_update()
            latest_version = info["latest_version"]

        # Check if update needed
        if local_version == latest_version:
            logger.info("Already up to date")
            return {"success": True, "message": "Already up to date", "version": local_version}

        logger.info(f"Starting update: {local_version} → {latest_version}")

        # Backup current version
        if not backup_current_version():
            return {"success": False, "error": "Backup failed"}

        # Download update
        logger.info(f"Downloading update from {zip_url}")
        headers = {
            'User-Agent': 'BAYYTI-B1-Updater',
            'Accept': 'application/vnd.github.v3+json'
        }
        zip_resp = requests.get(zip_url, headers=headers, timeout=30)
        zip_resp.raise_for_status()
        
        zip_file = zipfile.ZipFile(io.BytesIO(zip_resp.content))

        # Extract to temp directory
        temp_dir = os.path.join(APP_DIR, "temp_update")
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

        zip_file.extractall(temp_dir)
        logger.info("Update package extracted")

        # Find the extracted folder (GitHub adds a random suffix)
        extracted_root = os.path.join(temp_dir, os.listdir(temp_dir)[0])

        # Copy files, skipping protected ones
        updated_files = []
        skipped_files = []
        
        for root, dirs, files in os.walk(extracted_root):
            # Skip protected directories
            dirs[:] = [d for d in dirs if not should_skip_file(os.path.join(root, d))]
            
            for file in files:
                src_file = os.path.join(root, file)
                rel_path = os.path.relpath(src_file, extracted_root)
                dst_file = os.path.join(APP_DIR, rel_path)
                
                # Skip protected files
                if should_skip_file(rel_path):
                    skipped_files.append(rel_path)
                    logger.info(f"Skipped protected file: {rel_path}")
                    continue
                
                # Create directory if needed
                os.makedirs(os.path.dirname(dst_file), exist_ok=True)
                
                # Copy file
                shutil.copy2(src_file, dst_file)
                updated_files.append(rel_path)
                logger.info(f"Updated: {rel_path}")

        # Cleanup temp directory
        shutil.rmtree(temp_dir)
        logger.info("Temp files cleaned up")

        # Update version file
        set_local_version(latest_version)

        logger.info(f"✅ Update completed successfully: {latest_version}")
        logger.info(f"Updated {len(updated_files)} files, skipped {len(skipped_files)} protected files")

        return {
            "success": True,
            "message": "Update successful",
            "version": latest_version,
            "updated_files": len(updated_files),
            "skipped_files": len(skipped_files)
        }

    except requests.RequestException as e:
        logger.error(f"Network error during update: {e}")
        return {"success": False, "error": f"Network error: {str(e)}"}
    except Exception as e:
        logger.error(f"Update failed: {e}")
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    # CLI usage
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "check":
            info = check_for_update()
            print(f"Current version: {info['current_version']}")
            print(f"Latest version: {info['latest_version']}")
            print(f"Update available: {is_update_available()}")
        
        elif command == "update":
            result = update_app()
            if result["success"]:
                print(f"✅ {result['message']}")
            else:
                print(f"❌ Update failed: {result['error']}")
        
        else:
            print("Usage: python updater.py [check|update]")
    else:
        print("Usage: python updater.py [check|update]")
