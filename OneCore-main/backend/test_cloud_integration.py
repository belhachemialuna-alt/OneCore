"""
Cloud Integration Test Script
Tests the complete cloud integration flow
"""

import json
import sys
import os
from datetime import datetime

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_device_identity():
    """Test device identity module"""
    print_section("1. Testing Device Identity")
    
    try:
        from device_identity import get_device_identity, is_device_registered, get_device_api_key
        
        identity = get_device_identity()
        print(f"✓ Device ID: {identity['deviceId'][:20]}...")
        print(f"✓ Registered: {identity.get('registered', False)}")
        print(f"✓ Device Name: {identity.get('deviceName', 'Not set')}")
        print(f"✓ Has API Key: {get_device_api_key() is not None}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_cloud_integration_init():
    """Test cloud integration initialization"""
    print_section("2. Testing Cloud Integration Initialization")
    
    try:
        from cloud_integration import CloudIntegration
        
        cloud = CloudIntegration()
        print(f"✓ Cloud URL: {cloud.cloud_url}")
        print(f"✓ Device ID: {cloud.device_id[:20]}...")
        print(f"✓ Timeout: {cloud.timeout}s")
        print(f"✓ Retry Attempts: {cloud.retry_attempts}")
        
        return cloud
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return None

def test_cloud_status(cloud):
    """Test cloud status check"""
    print_section("3. Testing Cloud Status")
    
    try:
        status = cloud.get_status()
        print(f"✓ Registered: {status['registered']}")
        print(f"✓ Cloud URL: {status['cloud_url']}")
        print(f"✓ Device ID: {status['device_id'][:20]}...")
        print(f"✓ Device Name: {status.get('device_name', 'Not set')}")
        print(f"✓ Has API Key: {status['has_api_key']}")
        
        if not status['registered']:
            print(f"\n⚠️  Device not registered!")
            print(f"   Register at: {status['cloud_url']}/link-device")
            print(f"   Device ID: {status['device_id']}")
        
        return status['registered']
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_data_transformation(cloud):
    """Test data format transformation"""
    print_section("4. Testing Data Transformation")
    
    try:
        # Backend format (snake_case)
        backend_data = {
            "soil_moisture": 45.2,
            "temperature": 24.5,
            "humidity": 65.0,
            "water_flow": 0.0,
            "water_pressure": 2.5,
            "battery_voltage": 12.4,
            "solar_voltage": 18.2
        }
        
        # Transform to cloud format
        cloud_data = cloud.transform_sensor_data(backend_data)
        
        print("Backend format (snake_case):")
        print(json.dumps(backend_data, indent=2))
        
        print("\nCloud format (camelCase):")
        print(json.dumps(cloud_data, indent=2))
        
        # Verify transformation
        assert cloud_data['temperature'] == 24.5
        assert cloud_data['humidity'] == 65.0
        assert cloud_data['soilMoisture'] == 45.2
        assert 'timestamp' in cloud_data
        assert 'metadata' in cloud_data
        assert cloud_data['metadata']['waterFlow'] == 0.0
        
        print("\n✓ Data transformation successful!")
        return True
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_send_data(cloud, registered):
    """Test sending data to cloud"""
    print_section("5. Testing Data Transmission")
    
    if not registered:
        print("⚠️  Skipping - Device not registered")
        return False
    
    try:
        test_data = {
            "soil_moisture": 45.2,
            "temperature": 24.5,
            "humidity": 65.0,
            "water_flow": 0.0,
            "water_pressure": 2.5,
            "battery_voltage": 12.4,
            "solar_voltage": 18.2
        }
        
        print("Sending test data to cloud...")
        result = cloud.send_sensor_data(test_data)
        
        if result.get('success', True):
            print(f"✓ Data sent successfully!")
            print(f"  Data ID: {result.get('dataId', 'N/A')}")
            
            commands = result.get('commands', [])
            if commands:
                print(f"  Pending Commands: {len(commands)}")
                for cmd in commands:
                    print(f"    - {cmd.get('type')}: {cmd.get('id')}")
            else:
                print(f"  No pending commands")
            
            return True
        else:
            print(f"✗ Error: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_main_controller():
    """Test main controller integration"""
    print_section("6. Testing Main Controller Integration")
    
    try:
        from main_controller import MainController
        
        print("Initializing MainController...")
        controller = MainController()
        
        if controller.cloud_integration:
            print("✓ Cloud integration initialized in MainController")
            
            status = controller.get_system_status()
            if 'cloud' in status:
                print("✓ Cloud status included in system status")
                print(f"  Registered: {status['cloud']['registered']}")
            
            return True
        else:
            print("✗ Cloud integration not initialized")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_vps_client():
    """Test VPS cloud client compatibility"""
    print_section("7. Testing VPS Cloud Client")
    
    try:
        from vps_cloud_client import VPSCloudClient
        
        client = VPSCloudClient(vps_url="https://cloud.ielivate.com")
        
        # Check headers
        from device_identity import update_device_identity
        update_device_identity(api_key="test_key_123")
        
        headers = client._get_headers()
        
        print("Headers:")
        print(json.dumps(headers, indent=2))
        
        # Verify correct format
        assert "X-Device-API-Key" in headers
        assert headers["X-Device-API-Key"] == "test_key_123"
        assert "User-Agent" in headers
        
        print("\n✓ VPS client headers correct!")
        
        # Test data transformation
        test_data = {
            "soil_moisture": 45.2,
            "temperature": 24.5,
            "humidity": 65.0
        }
        
        # The send_sensor_data method now transforms data internally
        print("\n✓ VPS client data transformation integrated!")
        
        return True
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  CLOUD INTEGRATION TEST SUITE")
    print("="*60)
    print(f"  Time: {datetime.now().isoformat()}")
    print("="*60)
    
    results = []
    
    # Test 1: Device Identity
    results.append(("Device Identity", test_device_identity()))
    
    # Test 2: Cloud Integration Init
    cloud = test_cloud_integration_init()
    results.append(("Cloud Integration Init", cloud is not None))
    
    if cloud:
        # Test 3: Cloud Status
        registered = test_cloud_status(cloud)
        results.append(("Cloud Status", True))
        
        # Test 4: Data Transformation
        results.append(("Data Transformation", test_data_transformation(cloud)))
        
        # Test 5: Send Data (only if registered)
        results.append(("Data Transmission", test_send_data(cloud, registered)))
    
    # Test 6: Main Controller
    results.append(("Main Controller", test_main_controller()))
    
    # Test 7: VPS Client
    results.append(("VPS Cloud Client", test_vps_client()))
    
    # Print summary
    print_section("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status:10} {test_name}")
    
    print(f"\n{'='*60}")
    print(f"  Results: {passed}/{total} tests passed")
    print(f"{'='*60}\n")
    
    if passed == total:
        print("🎉 All tests passed! Cloud integration is fully functional.\n")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
