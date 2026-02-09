"""
Device ID Migration Script
Regenerates device ID based on hardware for all existing installations.
Run this script on each device to ensure unique hardware-based IDs.
"""

import os
import sys
import json
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from device_identity import generate_device_id, get_device_identity

def migrate_device_identity():
    """Migrate device identity to hardware-based ID"""
    print("=" * 70)
    print("DEVICE ID MIGRATION SCRIPT")
    print("=" * 70)
    print()
    
    # Get current hardware-based ID
    current_hardware_id = generate_device_id()
    print(f"✓ Current hardware ID: {current_hardware_id[:32]}...")
    print()
    
    # Check existing identity files
    identity_files = [
        os.path.join(os.path.dirname(__file__), "device_identity.json"),
        os.path.join(os.path.dirname(__file__), "device", "device_identity.json"),
        os.path.join(os.path.dirname(__file__), "device_activation.json")
    ]
    
    print("Checking existing identity files:")
    print("-" * 70)
    
    for file_path in identity_files:
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                old_id = data.get('deviceId')
                print(f"\n📄 File: {os.path.basename(file_path)}")
                print(f"   Old ID: {old_id[:32] if old_id else 'None'}...")
                
                if old_id != current_hardware_id:
                    print(f"   ⚠️  ID mismatch - updating to hardware-based ID")
                    
                    # Update device ID
                    data['deviceId'] = current_hardware_id
                    data['updatedAt'] = datetime.utcnow().isoformat()
                    data['migrated'] = True
                    data['migration_date'] = datetime.utcnow().isoformat()
                    data['old_device_id'] = old_id
                    
                    # Save updated file
                    with open(file_path, 'w') as f:
                        json.dump(data, f, indent=2)
                    
                    print(f"   ✅ Updated successfully")
                else:
                    print(f"   ✓ Already using hardware-based ID")
                    
            except Exception as e:
                print(f"   ❌ Error: {e}")
        else:
            print(f"\n📄 File: {os.path.basename(file_path)}")
            print(f"   ℹ️  File does not exist")
    
    print()
    print("=" * 70)
    print("MIGRATION COMPLETE")
    print("=" * 70)
    print()
    
    # Verify by loading identity
    print("Verifying migration:")
    identity = get_device_identity()
    print(f"✓ Device ID: {identity['deviceId'][:32]}...")
    print(f"✓ Registered: {identity.get('registered', False)}")
    print(f"✓ Has API Key: {identity.get('apiKey') is not None}")
    print()
    
    print("=" * 70)
    print("IMPORTANT NOTES")
    print("=" * 70)
    print()
    print("1. Your device now has a unique hardware-based ID")
    print("2. This ID will be different on each physical device")
    print("3. If you had linked this device to cloud, you may need to re-link")
    print("4. The old device ID is preserved in 'old_device_id' field")
    print()
    print("To link device to cloud:")
    print("  1. Go to: https://cloud.ielivate.com/link-device")
    print(f"  2. Enter Device ID: {identity['deviceId']}")
    print("  3. Follow the linking process")
    print()

if __name__ == "__main__":
    migrate_device_identity()
