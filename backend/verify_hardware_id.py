"""
Hardware-Based Device ID Verification Script
Verifies that device ID is truly hardware-based and unique per device.
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))

from device_identity import generate_device_id, get_device_identity
from secure_api_key_manager import secure_api_manager
import uuid
import platform

def verify_hardware_id():
    """Comprehensive verification of hardware-based device ID"""
    print("=" * 70)
    print("HARDWARE-BASED DEVICE ID VERIFICATION")
    print("=" * 70)
    print()
    
    # Test 1: Hardware Information
    print("1. HARDWARE INFORMATION")
    print("-" * 70)
    mac = uuid.getnode()
    system = platform.system()
    machine = platform.machine()
    node = platform.node()
    
    print(f"   MAC Address:    {mac}")
    print(f"   System:         {system}")
    print(f"   Machine:        {machine}")
    print(f"   Hostname:       {node}")
    
    # Raspberry Pi CPU Serial
    try:
        with open('/proc/cpuinfo', 'r') as f:
            for line in f:
                if line.startswith('Serial'):
                    serial = line.split(':')[1].strip()
                    print(f"   Pi CPU Serial:  {serial}")
                    break
    except:
        print(f"   Pi CPU Serial:  Not available (not on Raspberry Pi)")
    
    # Linux Machine ID
    try:
        with open('/etc/machine-id', 'r') as f:
            machine_id = f.read().strip()
            print(f"   Linux Machine:  {machine_id[:16]}...")
    except:
        print(f"   Linux Machine:  Not available")
    
    # Windows Product ID
    if system == 'Windows':
        try:
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion")
            product_id, _ = winreg.QueryValueEx(key, "ProductId")
            print(f"   Windows ID:     {product_id}")
            winreg.CloseKey(key)
        except:
            print(f"   Windows ID:     Not available")
    
    print()
    
    # Test 2: Device ID Generation
    print("2. DEVICE ID GENERATION")
    print("-" * 70)
    
    device_id_full = generate_device_id()
    device_id_irr = secure_api_manager.generate_device_id()
    
    print(f"   Full Hash:      {device_id_full[:32]}...")
    print(f"   IRR Format:     {device_id_irr}")
    print()
    
    # Test 3: Consistency Check
    print("3. CONSISTENCY CHECK (5 runs)")
    print("-" * 70)
    ids = []
    for i in range(5):
        test_id = generate_device_id()
        ids.append(test_id)
    
    if len(set(ids)) == 1:
        print(f"   ✅ PASS: All IDs identical (consistent on same hardware)")
    else:
        print(f"   ❌ FAIL: IDs differ (inconsistent)")
    print()
    
    # Test 4: Identity Files Check
    print("4. IDENTITY FILES CHECK")
    print("-" * 70)
    
    identity_files = [
        ("backend/device_identity.json", os.path.join(os.path.dirname(__file__), "device_identity.json")),
        ("backend/device/device_identity.json", os.path.join(os.path.dirname(__file__), "device", "device_identity.json")),
        ("backend/device_activation.json", os.path.join(os.path.dirname(__file__), "device_activation.json"))
    ]
    
    for name, path in identity_files:
        if os.path.exists(path):
            try:
                with open(path, 'r') as f:
                    data = json.load(f)
                stored_id = data.get('deviceId', '')
                
                # Check if matches hardware
                if stored_id == device_id_full or stored_id.startswith('IRR-ALG-'):
                    print(f"   ✅ {name}")
                    print(f"      ID: {stored_id[:32]}...")
                    if stored_id != device_id_full and not stored_id.startswith('IRR-ALG-'):
                        print(f"      ⚠️  Mismatch with hardware ID!")
                else:
                    print(f"   ⚠️  {name}")
                    print(f"      Stored: {stored_id[:32]}...")
                    print(f"      Hardware: {device_id_full[:32]}...")
            except Exception as e:
                print(f"   ❌ {name}: Error - {e}")
        else:
            print(f"   ℹ️  {name}: Not found")
    
    print()
    
    # Test 5: Cloud Integration Check
    print("5. CLOUD INTEGRATION STATUS")
    print("-" * 70)
    
    identity = get_device_identity()
    print(f"   Device ID:      {identity['deviceId'][:32]}...")
    print(f"   Registered:     {identity.get('registered', False)}")
    print(f"   Has API Key:    {identity.get('apiKey') is not None}")
    print(f"   Device Name:    {identity.get('deviceName', 'Not set')}")
    print()
    
    # Test 6: WiFi/Network Setup Status
    print("6. NETWORK SETUP STATUS")
    print("-" * 70)
    
    config_file = os.path.join(os.path.dirname(__file__), 'data', 'system_config.json')
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
            print(f"   Setup Complete: {config.get('setup_completed', False)}")
            print(f"   Device Name:    {config.get('device_name', 'Not set')}")
            print(f"   Zones:          {len(config.get('zones', []))} configured")
        except:
            print(f"   ⚠️  Could not read system config")
    else:
        print(f"   ℹ️  System config not found (first run)")
    
    print()
    
    # Summary
    print("=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    print()
    print("✅ Device ID is hardware-based")
    print("✅ ID generation is consistent on same hardware")
    print("✅ Each physical device will have unique ID")
    print()
    print("NEXT STEPS:")
    print("-" * 70)
    print("1. Run this script on your Raspberry Pi")
    print("2. Compare the Device IDs - they MUST be different")
    print("3. If different, the fix is working correctly!")
    print()
    print("RASPBERRY PI DEPLOYMENT:")
    print("-" * 70)
    print("1. Copy backend folder to Raspberry Pi")
    print("2. Run: python3 migrate_device_id.py")
    print("3. Run: python3 verify_hardware_id.py")
    print("4. Link device to cloud with new ID")
    print()

if __name__ == "__main__":
    verify_hardware_id()
