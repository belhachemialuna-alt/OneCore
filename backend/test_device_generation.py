#!/usr/bin/env python3
"""
Test Device ID Generation
This script tests both device identity modules to ensure they work correctly.
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

def test_device_identity_main():
    """Test the main device_identity.py module"""
    print("=" * 60)
    print("Testing device_identity.py (main module)")
    print("=" * 60)
    
    try:
        from device_identity import generate_device_id, get_device_identity
        
        # Test device ID generation
        device_id = generate_device_id()
        print(f"✅ Device ID generated: {device_id[:32]}...")
        print(f"   Full length: {len(device_id)} characters")
        
        # Test identity loading
        identity = get_device_identity()
        print(f"✅ Identity loaded:")
        print(f"   Device ID: {identity['deviceId'][:32]}...")
        print(f"   Registered: {identity.get('registered', False)}")
        print(f"   Created: {identity.get('createdAt', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in device_identity.py: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_device_identity_module():
    """Test the device/identity.py module"""
    print("\n" + "=" * 60)
    print("Testing device/identity.py (module)")
    print("=" * 60)
    
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'device'))
        from device import identity as device_identity
        
        # Test device ID generation
        device_id = device_identity.generate_device_id()
        print(f"✅ Device ID generated: {device_id[:32]}...")
        print(f"   Full length: {len(device_id)} characters")
        
        # Test identity loading
        identity = device_identity.load_identity()
        print(f"✅ Identity loaded:")
        print(f"   Device ID: {identity['deviceId'][:32]}...")
        print(f"   Registered: {identity.get('registered', False)}")
        print(f"   Created: {identity.get('createdAt', 'N/A')}")
        
        # Test individual functions
        is_reg = device_identity.is_registered()
        dev_id = device_identity.get_device_id()
        api_key = device_identity.get_api_key()
        
        print(f"✅ Function tests:")
        print(f"   is_registered(): {is_reg}")
        print(f"   get_device_id(): {dev_id[:32] if dev_id else 'None'}...")
        print(f"   get_api_key(): {'Set' if api_key else 'None'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in device/identity.py: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_hardware_identifiers():
    """Test hardware identifier collection"""
    print("\n" + "=" * 60)
    print("Testing Hardware Identifiers")
    print("=" * 60)
    
    import uuid
    import platform
    
    print(f"MAC Address: {uuid.getnode()}")
    print(f"System: {platform.system()}")
    print(f"Machine: {platform.machine()}")
    print(f"Node: {platform.node()}")
    
    # Test Raspberry Pi serial
    try:
        with open('/proc/cpuinfo', 'r') as f:
            for line in f:
                if line.startswith('Serial'):
                    serial = line.split(':')[1].strip()
                    print(f"Pi Serial: {serial}")
                    break
    except:
        print("Pi Serial: Not available (not on Raspberry Pi)")
    
    # Test machine ID
    try:
        with open('/etc/machine-id', 'r') as f:
            machine_id = f.read().strip()
            print(f"Machine ID: {machine_id}")
    except:
        print("Machine ID: Not available")
    
    # Test Windows Product ID
    if platform.system() == 'Windows':
        try:
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion")
            product_id, _ = winreg.QueryValueEx(key, "ProductId")
            print(f"Windows Product ID: {product_id}")
            winreg.CloseKey(key)
        except:
            print("Windows Product ID: Not available")

def main():
    """Run all tests"""
    print("Device ID Generation Test Suite")
    print("Testing on Raspberry Pi hardware...")
    
    # Test hardware identifiers first
    test_hardware_identifiers()
    
    # Test both modules
    result1 = test_device_identity_main()
    result2 = test_device_identity_module()
    
    print("\n" + "=" * 60)
    print("TEST RESULTS")
    print("=" * 60)
    print(f"device_identity.py: {'✅ PASS' if result1 else '❌ FAIL'}")
    print(f"device/identity.py: {'✅ PASS' if result2 else '❌ FAIL'}")
    
    if result1 and result2:
        print("\n🎉 All tests passed! Device ID generation is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        
    print("\nTo fix 'not available' issues on Raspberry Pi:")
    print("1. Make sure you're running on actual Raspberry Pi hardware")
    print("2. Check file permissions for /proc/cpuinfo and /etc/machine-id")
    print("3. Ensure the device identity files can be created in the backend directory")

if __name__ == "__main__":
    main()
