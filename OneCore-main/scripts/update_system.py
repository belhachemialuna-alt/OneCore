#!/usr/bin/env python3
"""
BAYYTI Raspberry Pi GitHub Auto-Update System
Downloads and applies updates from GitHub releases
"""

import os
import sys
import json
import requests
import zipfile
import shutil
import subprocess
import time
from datetime import datetime

# Configuration
GITHUB_REPO = os.environ.get('GITHUB_REPO', 'YOUR_USERNAME/YOUR_REPO')
PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP_DIR = os.path.join(PROJECT_DIR, 'backups')
VERSION_FILE = os.path.join(PROJECT_DIR, 'VERSION')
LOG_FILE = os.path.join(PROJECT_DIR, 'update.log')

def log(message):
    """Log message to file and console"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_msg = f"[{timestamp}] {message}"
    print(log_msg)
    
    with open(LOG_FILE, 'a') as f:
        f.write(log_msg + '\n')

def get_current_version():
    """Read current version from VERSION file"""
    try:
        if os.path.exists(VERSION_FILE):
            with open(VERSION_FILE, 'r') as f:
                return f.read().strip()
        return '1.0.0'
    except Exception as e:
        log(f"Error reading version: {e}")
        return '1.0.0'

def save_version(version):
    """Save version to VERSION file"""
    try:
        with open(VERSION_FILE, 'w') as f:
            f.write(version)
        log(f"Version updated to: {version}")
    except Exception as e:
        log(f"Error saving version: {e}")

def check_for_updates():
    """Check GitHub for latest release"""
    try:
        log("Checking for updates...")
        api_url = f'https://api.github.com/repos/{GITHUB_REPO}/releases/latest'
        
        response = requests.get(api_url, timeout=30)
        
        if response.status_code == 200:
            release_data = response.json()
            latest_version = release_data['tag_name'].replace('v', '')
            current_version = get_current_version()
            
            log(f"Current version: {current_version}")
            log(f"Latest version: {latest_version}")
            
            if latest_version != current_version:
                log("Update available!")
                return {
                    'available': True,
                    'version': latest_version,
                    'download_url': release_data['zipball_url'],
                    'notes': release_data['body']
                }
            else:
                log("Already up to date")
                return {'available': False}
        else:
            log(f"Failed to check updates: HTTP {response.status_code}")
            return {'available': False, 'error': 'Failed to fetch release'}
            
    except Exception as e:
        log(f"Error checking updates: {e}")
        return {'available': False, 'error': str(e)}

def create_backup():
    """Create backup of current installation"""
    try:
        log("Creating backup...")
        
        # Create backup directory
        os.makedirs(BACKUP_DIR, exist_ok=True)
        
        # Backup name with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"backup_{timestamp}.zip"
        backup_path = os.path.join(BACKUP_DIR, backup_name)
        
        # Files/folders to backup
        items_to_backup = ['backend', 'frontend', 'scripts', 'VERSION']
        
        # Create zip
        with zipfile.ZipFile(backup_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for item in items_to_backup:
                item_path = os.path.join(PROJECT_DIR, item)
                if os.path.exists(item_path):
                    if os.path.isfile(item_path):
                        zipf.write(item_path, item)
                    else:
                        for root, dirs, files in os.walk(item_path):
                            for file in files:
                                file_path = os.path.join(root, file)
                                arcname = os.path.relpath(file_path, PROJECT_DIR)
                                zipf.write(file_path, arcname)
        
        log(f"Backup created: {backup_name}")
        
        # Keep only last 5 backups
        cleanup_old_backups()
        
        return backup_path
        
    except Exception as e:
        log(f"Backup failed: {e}")
        return None

def cleanup_old_backups():
    """Keep only the 5 most recent backups"""
    try:
        backups = [f for f in os.listdir(BACKUP_DIR) if f.startswith('backup_') and f.endswith('.zip')]
        backups.sort(reverse=True)
        
        # Remove old backups
        for backup in backups[5:]:
            os.remove(os.path.join(BACKUP_DIR, backup))
            log(f"Removed old backup: {backup}")
            
    except Exception as e:
        log(f"Error cleaning backups: {e}")

def download_release(download_url):
    """Download release from GitHub"""
    try:
        log(f"Downloading release from: {download_url}")
        
        temp_dir = os.path.join(PROJECT_DIR, 'temp_update')
        os.makedirs(temp_dir, exist_ok=True)
        
        zip_path = os.path.join(temp_dir, 'release.zip')
        
        # Download with progress
        response = requests.get(download_url, stream=True, timeout=120)
        total_size = int(response.headers.get('content-length', 0))
        
        with open(zip_path, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        progress = (downloaded / total_size) * 100
                        print(f"\rDownloading: {progress:.1f}%", end='')
        
        print()  # New line after progress
        log("Download complete")
        
        return zip_path
        
    except Exception as e:
        log(f"Download failed: {e}")
        return None

def extract_and_apply(zip_path, version):
    """Extract and apply the update"""
    try:
        log("Extracting update...")
        
        temp_dir = os.path.dirname(zip_path)
        extract_dir = os.path.join(temp_dir, 'extracted')
        
        # Extract
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # Find the root folder (GitHub adds repo name)
        extracted_items = os.listdir(extract_dir)
        if len(extracted_items) == 1 and os.path.isdir(os.path.join(extract_dir, extracted_items[0])):
            source_dir = os.path.join(extract_dir, extracted_items[0])
        else:
            source_dir = extract_dir
        
        log("Applying update...")
        
        # Copy files (overwrite existing)
        items_to_update = ['backend', 'frontend', 'scripts']
        
        for item in items_to_update:
            src = os.path.join(source_dir, item)
            dst = os.path.join(PROJECT_DIR, item)
            
            if os.path.exists(src):
                if os.path.isfile(src):
                    shutil.copy2(src, dst)
                    log(f"Updated: {item}")
                else:
                    # Remove old and copy new
                    if os.path.exists(dst):
                        shutil.rmtree(dst)
                    shutil.copytree(src, dst)
                    log(f"Updated directory: {item}")
        
        # Update version
        save_version(version)
        
        # Cleanup temp files
        shutil.rmtree(temp_dir)
        log("Update applied successfully")
        
        return True
        
    except Exception as e:
        log(f"Failed to apply update: {e}")
        return False

def restart_services():
    """Restart BAYYTI services"""
    try:
        log("Restarting services...")
        
        services = ['bayyti.service', 'bayyti-sensors.service', 'bayyti-ai.service']
        
        for service in services:
            try:
                subprocess.run(['sudo', 'systemctl', 'restart', service], 
                             check=True, timeout=30)
                log(f"Restarted: {service}")
            except:
                log(f"Warning: Could not restart {service}")
        
        log("Services restarted")
        return True
        
    except Exception as e:
        log(f"Error restarting services: {e}")
        return False

def main():
    """Main update process"""
    log("=" * 50)
    log("BAYYTI Auto-Update System")
    log("=" * 50)
    
    # Check for updates
    update_info = check_for_updates()
    
    if not update_info.get('available'):
        log("No updates available")
        return 0
    
    version = update_info['version']
    download_url = update_info['download_url']
    
    log(f"New version available: {version}")
    
    # Create backup
    backup_path = create_backup()
    if not backup_path:
        log("❌ Backup failed - aborting update")
        return 1
    
    # Download release
    zip_path = download_release(download_url)
    if not zip_path:
        log("❌ Download failed - aborting update")
        return 1
    
    # Apply update
    if not extract_and_apply(zip_path, version):
        log("❌ Update failed - restore from backup if needed")
        log(f"Backup location: {backup_path}")
        return 1
    
    # Restart services
    restart_services()
    
    log("=" * 50)
    log(f"✅ Update complete! Version: {version}")
    log("=" * 50)
    
    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
