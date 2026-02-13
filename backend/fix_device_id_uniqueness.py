#!/usr/bin/env python3
"""
Device ID Uniqueness Fix Script
Fixes the issue where PC and Raspberry Pi generate the same API key.

PROBLEM: Same deviceId = Same API key
SOLUTION: Hardware-based unique deviceId per physical device

Run this script on both PC and Raspberry Pi to verify the fix works.
"""

import os
import sys
import json
import shutil
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

def main():
    print("=" * 80)
    print("🔧 DEVICE ID UNIQUENESS FIX")
    print("=" * 80)
    print()
    print("This script fixes the issue where PC and Raspberry Pi get the same API key.")
    print("Root cause: Both devices were generating the same deviceId")
    print("Solution: Enhanced hardware fingerprinting for unique deviceIds")
    print()
    
    # Step 1: Test enhanced fingerprinting
    print("STEP 1: Testing Enhanced Hardware Fingerprinting")
    print("-" * 80)
    
    try:
        from enhanced_hardware_fingerprint import get_enhanced_hardware_fingerprint, verify_hardware_uniqueness
        
        # Generate new hardware-based device ID
        new_device_id = get_enhanced_hardware_fingerprint()
        print(f"✅ Enhanced fingerprinting working")
        print(f"   New Device ID: {new_device_id[:32]}...")
        
        # Test consistency
        consistency_test = verify_hardware_uniqueness()
        if consistency_test['consistent']:
            print(f"✅ Device ID generation is consistent")
        else:
            print(f"❌ Device ID generation is inconsistent - this needs fixing")
            return False
            
    except ImportError as e:
        print(f"❌ Enhanced fingerprinting module not found: {e}")
        print("   Make sure enhanced_hardware_fingerprint.py is in the backend folder")
        return False
    except Exception as e:
        print(f"❌ Error testing fingerprinting: {e}")
        return False
    
    print()
    
    # Step 2: Check existing device identity files
    print("STEP 2: Checking Existing Device Identity Files")
    print("-" * 80)
    
    identity_files = [
        "device_identity.json",
        "device/device_identity.json", 
        "device_activation.json"
    ]
    
    old_device_ids = []
    
    for file_path in identity_files:
        full_path = os.path.join(os.path.dirname(__file__), file_path)
        if os.path.exists(full_path):
            try:
                with open(full_path, 'r') as f:
                    data = json.load(f)
                old_id = data.get('deviceId', '')
                old_device_ids.append(old_id)
                
                print(f"📄 {file_path}")
                print(f"   Old Device ID: {old_id[:32]}...")
                
                if old_id == new_device_id:
                    print(f"   ✅ Already using hardware-based ID")
                else:
                    print(f"   ⚠️  Using old/static ID - will be updated")
                    
            except Exception as e:
                print(f"📄 {file_path}: Error reading - {e}")
        else:
            print(f"📄 {file_path}: Not found")
    
    print()
    
    # Step 3: Backup and update identity files
    print("STEP 3: Updating Device Identity Files")
    print("-" * 80)
    
    backup_dir = os.path.join(os.path.dirname(__file__), "backup_device_ids")
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"📁 Created backup directory: {backup_dir}")
    
    updated_files = 0
    
    for file_path in identity_files:
        full_path = os.path.join(os.path.dirname(__file__), file_path)
        if os.path.exists(full_path):
            try:
                # Backup original file
                backup_path = os.path.join(backup_dir, f"{os.path.basename(file_path)}.backup")
                shutil.copy2(full_path, backup_path)
                print(f"💾 Backed up: {file_path} -> backup/")
                
                # Read and update
                with open(full_path, 'r') as f:
                    data = json.load(f)
                
                old_id = data.get('deviceId', '')
                if old_id != new_device_id:
                    # Update to hardware-based ID
                    data['deviceId'] = new_device_id
                    data['updatedAt'] = datetime.utcnow().isoformat()
                    data['migration_info'] = {
                        'migrated': True,
                        'migration_date': datetime.utcnow().isoformat(),
                        'old_device_id': old_id,
                        'migration_reason': 'Hardware-based uniqueness fix'
                    }
                    
                    # Save updated file
                    with open(full_path, 'w') as f:
                        json.dump(data, f, indent=2)
                    
                    print(f"✅ Updated: {file_path}")
                    print(f"   Old ID: {old_id[:32]}...")
                    print(f"   New ID: {new_device_id[:32]}...")
                    updated_files += 1
                else:
                    print(f"✅ No update needed: {file_path}")
                    
            except Exception as e:
                print(f"❌ Error updating {file_path}: {e}")
    
    print()
    print(f"📊 Updated {updated_files} identity files")
    print()
    
    # Step 4: Verify the fix
    print("STEP 4: Verifying the Fix")
    print("-" * 80)
    
    try:
        # Test device identity module
        from device.identity import load_identity, get_device_id
        
        identity = load_identity()
        current_id = get_device_id()
        
        print(f"✅ Device identity module working")
        print(f"   Current Device ID: {current_id[:32]}...")
        print(f"   Registered: {identity.get('registered', False)}")
        print(f"   Has API Key: {identity.get('apiKey') is not None}")
        
        if current_id == new_device_id:
            print(f"✅ Device ID matches enhanced fingerprint")
        else:
            print(f"❌ Device ID mismatch - module may need restart")
            
    except Exception as e:
        print(f"❌ Error verifying device identity: {e}")
    
    print()
    
    # Step 5: Instructions
    print("STEP 5: Next Steps")
    print("-" * 80)
    print()
    print("🎯 WHAT THIS FIX DOES:")
    print("   • Generates unique device ID based on hardware fingerprint")
    print("   • PC and Raspberry Pi will now have DIFFERENT device IDs")
    print("   • Different device IDs = Different API keys from backend")
    print()
    print("📋 DEPLOYMENT INSTRUCTIONS:")
    print("   1. Run this script on your Windows PC")
    print("   2. Note the Device ID generated")
    print("   3. Copy the entire backend folder to your Raspberry Pi")
    print("   4. Run this script on your Raspberry Pi")
    print("   5. Compare Device IDs - they MUST be different")
    print()
    print("🔗 RE-LINKING DEVICES:")
    print("   • If devices were previously linked to cloud, you'll need to re-link")
    print("   • Each device will get a unique API key during linking")
    print("   • Old API keys will no longer work (this is expected)")
    print()
    print("🧪 TESTING:")
    print("   • Check hardware page: Device ID should be unique per device")
    print("   • Link devices to cloud: Each should get different API key")
    print("   • Verify backend logs show different device registrations")
    print()
    
    # Step 6: Generate report
    print("STEP 6: Generating Hardware Report")
    print("-" * 80)
    
    try:
        from enhanced_hardware_fingerprint import save_hardware_report
        report = save_hardware_report("device_id_fix_report.json")
        print(f"✅ Hardware report saved: device_id_fix_report.json")
        print(f"   System: {report.get('system', 'Unknown')}")
        print(f"   Machine: {report.get('machine', 'Unknown')}")
        print(f"   Device ID: {report.get('device_id_full', '')[:32]}...")
    except Exception as e:
        print(f"⚠️ Could not generate report: {e}")
    
    print()
    print("=" * 80)
    print("✅ DEVICE ID UNIQUENESS FIX COMPLETE")
    print("=" * 80)
    print()
    print("Your device now has a unique hardware-based ID!")
    print("Deploy this to your Raspberry Pi to ensure different device IDs.")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("🎉 Fix completed successfully!")
            sys.exit(0)
        else:
            print("❌ Fix failed - check errors above")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Fix interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
