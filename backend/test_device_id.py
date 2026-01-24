"""
Test script to verify device ID generation is hardware-based and unique
Run this on different devices to confirm they generate different IDs
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from secure_api_key_manager import secure_api_manager
from device_identity import generate_device_id as generate_device_id_v1
from device.identity import generate_device_id as generate_device_id_v2

print("=" * 70)
print("DEVICE ID GENERATION TEST")
print("=" * 70)
print()

# Test 1: secure_api_key_manager (IRR-ALG-XXXXXX format)
print("1. Testing secure_api_key_manager.generate_device_id():")
device_id_1 = secure_api_manager.generate_device_id()
print(f"   Device ID: {device_id_1}")
print()

# Test 2: device_identity.py
print("2. Testing device_identity.generate_device_id():")
device_id_2 = generate_device_id_v1()
print(f"   Device ID: {device_id_2}")
print()

# Test 3: device/identity.py
print("3. Testing device/identity.generate_device_id():")
device_id_3 = generate_device_id_v2()
print(f"   Device ID: {device_id_3}")
print()

# Test 4: Hardware info used
print("4. Hardware Information Used:")
import uuid
import platform

print(f"   MAC Address: {uuid.getnode()}")
print(f"   System: {platform.system()}")
print(f"   Machine: {platform.machine()}")
print(f"   Node: {platform.node()}")

# Check for Raspberry Pi CPU Serial
try:
    with open('/proc/cpuinfo', 'r') as f:
        for line in f:
            if line.startswith('Serial'):
                serial = line.split(':')[1].strip()
                print(f"   Raspberry Pi Serial: {serial}")
                break
except:
    print(f"   Raspberry Pi Serial: Not available (not on Raspberry Pi)")

# Check for Linux machine-id
try:
    with open('/etc/machine-id', 'r') as f:
        machine_id = f.read().strip()
        print(f"   Linux Machine ID: {machine_id[:16]}...")
except:
    print(f"   Linux Machine ID: Not available")

# Check for Windows Product ID
if platform.system() == 'Windows':
    try:
        import winreg
        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion")
        product_id, _ = winreg.QueryValueEx(key, "ProductId")
        print(f"   Windows Product ID: {product_id}")
        winreg.CloseKey(key)
    except:
        print(f"   Windows Product ID: Not available")

print()
print("=" * 70)
print("CONSISTENCY TEST")
print("=" * 70)
print()

# Test 5: Verify consistency (same device should generate same ID)
print("5. Testing ID consistency (running 5 times):")
ids = []
for i in range(5):
    test_id = secure_api_manager.generate_device_id()
    ids.append(test_id)
    print(f"   Run {i+1}: {test_id}")

if len(set(ids)) == 1:
    print(f"   ✅ PASS: All IDs are identical (consistent)")
else:
    print(f"   ❌ FAIL: IDs are different (inconsistent)")

print()
print("=" * 70)
print("INSTRUCTIONS")
print("=" * 70)
print()
print("To verify the fix works:")
print("1. Run this script on your Windows computer")
print("2. Note the Device ID generated")
print("3. Run this script on your Raspberry Pi")
print("4. Compare the Device IDs - they should be DIFFERENT")
print()
print("If the IDs are different, the fix is working correctly!")
print("=" * 70)
