#!/usr/bin/env python3
"""
BAYYTI-B1 Update System Test Script
Tests all update system functionality
"""

import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import requests
from updater import (
    get_local_version,
    check_for_update,
    is_update_available,
    compare_versions
)

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.YELLOW}ℹ {text}{Colors.END}")

def test_version_file():
    """Test 1: Check version.txt exists and is readable"""
    print_header("TEST 1: Version File")
    
    try:
        version = get_local_version()
        print_success(f"Version file found: {version}")
        
        if version == "1.0.0":
            print_success("Version is correct (1.0.0)")
        else:
            print_info(f"Version is {version} (expected 1.0.0)")
        
        return True
    except Exception as e:
        print_error(f"Failed to read version: {e}")
        return False

def test_github_api():
    """Test 2: Check GitHub API connectivity"""
    print_header("TEST 2: GitHub API Connectivity")
    
    try:
        info = check_for_update()
        
        print_success("Connected to GitHub API")
        print_info(f"Repository: belhachemialuna-alt/OneCore")
        print_info(f"Current Version: {info['current_version']}")
        print_info(f"Latest Version: {info['latest_version']}")
        print_info(f"Release Date: {info['release_date']}")
        
        if info['release_notes']:
            notes_preview = info['release_notes'][:100] + "..." if len(info['release_notes']) > 100 else info['release_notes']
            print_info(f"Release Notes: {notes_preview}")
        
        return True
    except Exception as e:
        print_error(f"GitHub API error: {e}")
        print_info("This is normal if no releases exist yet")
        return False

def test_update_detection():
    """Test 3: Check update detection logic"""
    print_header("TEST 3: Update Detection")
    
    try:
        available = is_update_available()
        
        if available:
            print_success("Update available!")
            print_info("Red indicator should appear on frontend")
        else:
            print_info("No update available (system up to date)")
        
        return True
    except Exception as e:
        print_error(f"Update detection failed: {e}")
        return False

def test_version_comparison():
    """Test 4: Version comparison logic"""
    print_header("TEST 4: Version Comparison")
    
    tests = [
        ("1.0.0", "1.0.1", -1, "1.0.0 < 1.0.1"),
        ("1.0.1", "1.0.0", 1, "1.0.1 > 1.0.0"),
        ("1.0.0", "1.0.0", 0, "1.0.0 = 1.0.0"),
        ("1.1.0", "1.0.9", 1, "1.1.0 > 1.0.9"),
        ("2.0.0", "1.9.9", 1, "2.0.0 > 1.9.9"),
    ]
    
    all_passed = True
    for v1, v2, expected, desc in tests:
        result = compare_versions(v1, v2)
        if result == expected:
            print_success(f"{desc} ✓")
        else:
            print_error(f"{desc} ✗ (got {result}, expected {expected})")
            all_passed = False
    
    return all_passed

def test_backend_api():
    """Test 5: Backend API endpoints"""
    print_header("TEST 5: Backend API Endpoints")
    
    base_url = "http://localhost:5000"
    
    print_info("Testing /api/system/update/check endpoint...")
    
    try:
        response = requests.get(f"{base_url}/api/system/update/check", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Backend API responding")
            print_info(f"Response: {data}")
            
            if data.get('success'):
                print_success("API returns valid data")
                
                if data.get('update_available'):
                    print_success("Update available flag detected")
                else:
                    print_info("No update available")
                
                return True
            else:
                print_error(f"API error: {data.get('error', 'Unknown')}")
                return False
        else:
            print_error(f"HTTP {response.status_code}")
            return False
            
    except requests.ConnectionError:
        print_error("Cannot connect to backend")
        print_info("Make sure server is running: python backend/api_server.py")
        return False
    except Exception as e:
        print_error(f"API test failed: {e}")
        return False

def test_frontend_files():
    """Test 6: Frontend files exist"""
    print_header("TEST 6: Frontend Files")
    
    files = [
        "frontend/index.html",
        "frontend/analytics.html",
        "frontend/css/dashboard.css",
        "frontend/css/analytics.css",
        "frontend/js/dashboard.js",
        "frontend/js/analytics.js",
    ]
    
    all_exist = True
    for file in files:
        if os.path.exists(file):
            print_success(f"{file}")
        else:
            print_error(f"{file} not found")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests"""
    print_header("BAYYTI-B1 UPDATE SYSTEM TEST SUITE")
    
    results = {
        "Version File": test_version_file(),
        "GitHub API": test_github_api(),
        "Update Detection": test_update_detection(),
        "Version Comparison": test_version_comparison(),
        "Backend API": test_backend_api(),
        "Frontend Files": test_frontend_files(),
    }
    
    # Summary
    print_header("TEST RESULTS SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{Colors.GREEN}PASS{Colors.END}" if result else f"{Colors.RED}FAIL{Colors.END}"
        print(f"{test_name:.<40} {status}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED! System is ready.{Colors.END}")
        print(f"\n{Colors.BLUE}Next Steps:{Colors.END}")
        print("1. Create GitHub release (v1.0.1)")
        print("2. Open http://localhost:5000 in browser")
        print("3. Wait 3 seconds for update indicator")
        print("4. Click update button to test")
    else:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠ Some tests failed. Check above for details.{Colors.END}")
        
        if not results["Backend API"]:
            print(f"\n{Colors.BLUE}To start backend:{Colors.END}")
            print("cd backend")
            print("python api_server.py")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
