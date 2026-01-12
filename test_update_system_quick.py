#!/usr/bin/env python3
"""
Quick test script for update system verification
Run this to verify your update system is working correctly
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_version_file():
    """Test version.txt exists and is readable"""
    print("=" * 60)
    print("TEST 1: Version File")
    print("=" * 60)
    
    version_file = "version.txt"
    if os.path.exists(version_file):
        with open(version_file, 'r') as f:
            version = f.read().strip()
        print(f"✅ Version file exists: {version_file}")
        print(f"✅ Current version: {version}")
        return version
    else:
        print(f"❌ Version file not found: {version_file}")
        return None

def test_updater_module():
    """Test updater.py module can be imported"""
    print("\n" + "=" * 60)
    print("TEST 2: Updater Module")
    print("=" * 60)
    
    try:
        from updater import (
            get_local_version,
            check_for_update,
            is_update_available,
            compare_versions
        )
        print("✅ Updater module imported successfully")
        
        # Test get_local_version
        local_version = get_local_version()
        print(f"✅ Local version retrieved: {local_version}")
        
        return True
    except ImportError as e:
        print(f"❌ Failed to import updater module: {e}")
        return False
    except Exception as e:
        print(f"❌ Error testing updater module: {e}")
        return False

def test_github_api():
    """Test GitHub API connection"""
    print("\n" + "=" * 60)
    print("TEST 3: GitHub API Connection")
    print("=" * 60)
    
    try:
        from updater import check_for_update
        
        print("Checking GitHub for latest release...")
        info = check_for_update()
        
        print(f"✅ GitHub API connection successful")
        print(f"   Current version: {info['current_version']}")
        print(f"   Latest version: {info['latest_version']}")
        print(f"   Release date: {info['release_date']}")
        print(f"   Download URL: {info['zip_url'][:60]}...")
        
        # Check if update available
        from updater import is_update_available
        update_avail = is_update_available()
        
        if update_avail:
            print(f"🔄 Update available: {info['current_version']} → {info['latest_version']}")
        else:
            print(f"✅ System is up to date")
        
        return True
    except Exception as e:
        print(f"❌ GitHub API test failed: {e}")
        print(f"   Check your internet connection and GitHub repository access")
        return False

def test_version_comparison():
    """Test version comparison logic"""
    print("\n" + "=" * 60)
    print("TEST 4: Version Comparison")
    print("=" * 60)
    
    try:
        from updater import compare_versions
        
        test_cases = [
            ("1.0.0", "1.0.1", -1),  # Older
            ("1.0.1", "1.0.0", 1),   # Newer
            ("1.0.0", "1.0.0", 0),   # Equal
            ("1.0.0", "1.1.0", -1),  # Minor update
            ("1.0.0", "2.0.0", -1),  # Major update
        ]
        
        all_passed = True
        for v1, v2, expected in test_cases:
            result = compare_versions(v1, v2)
            status = "✅" if result == expected else "❌"
            print(f"{status} compare_versions('{v1}', '{v2}') = {result} (expected {expected})")
            if result != expected:
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"❌ Version comparison test failed: {e}")
        return False

def test_api_endpoint_simulation():
    """Simulate API endpoint response"""
    print("\n" + "=" * 60)
    print("TEST 5: API Endpoint Simulation")
    print("=" * 60)
    
    try:
        from updater import check_for_update, is_update_available
        
        info = check_for_update()
        update_avail = is_update_available()
        
        response = {
            "success": True,
            "update_available": update_avail,
            "current_version": info["current_version"],
            "latest_version": info["latest_version"],
            "release_date": info["release_date"],
            "release_notes": info["release_notes"][:100] + "..." if len(info["release_notes"]) > 100 else info["release_notes"],
            "download_url": info["zip_url"]
        }
        
        print("✅ API response structure:")
        print(f"   success: {response['success']}")
        print(f"   update_available: {response['update_available']}")
        print(f"   current_version: {response['current_version']}")
        print(f"   latest_version: {response['latest_version']}")
        print(f"   release_date: {response['release_date']}")
        print(f"   release_notes: {response['release_notes'][:60]}...")
        
        return True
    except Exception as e:
        print(f"❌ API simulation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("UPDATE SYSTEM VERIFICATION TEST")
    print("=" * 60)
    print("\nRunning tests...\n")
    
    results = []
    
    # Run tests
    results.append(("Version File", test_version_file() is not None))
    results.append(("Updater Module", test_updater_module()))
    results.append(("GitHub API", test_github_api()))
    results.append(("Version Comparison", test_version_comparison()))
    results.append(("API Simulation", test_api_endpoint_simulation()))
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your update system is ready to use.")
        print("\nNext steps:")
        print("1. Create a GitHub release (see GITHUB_RELEASE_WORKFLOW.md)")
        print("2. Test update indicator in web interface")
        print("3. Verify update installation works")
    else:
        print("\n⚠️  Some tests failed. Please review the errors above.")
        print("\nTroubleshooting:")
        print("1. Check version.txt exists and contains a version number")
        print("2. Verify backend/updater.py is present and importable")
        print("3. Check internet connection for GitHub API access")
        print("4. Review UPDATE_SYSTEM_VERIFICATION_GUIDE.md for details")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
