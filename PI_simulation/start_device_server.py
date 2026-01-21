#!/usr/bin/env python3
"""
Start Device Server - Simplified launcher for device registration and management
"""

import subprocess
import sys
import os
import webbrowser
import time
import requests
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import flask_cors
        print("✅ Dependencies verified")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Installing required packages...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Dependencies installed")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            return False

def start_device_server():
    """Start the device server"""
    print("🚀 Starting OneCore Device Server...")
    
    # Check dependencies first
    if not check_dependencies():
        return False
    
    try:
        # Start device server
        process = subprocess.Popen([
            sys.executable, "device_server.py"
        ], cwd=os.path.dirname(os.path.abspath(__file__)))
        
        # Wait a moment for server to start
        time.sleep(2)
        
        # Check if server is running
        try:
            response = requests.get("http://localhost:5000/status", timeout=5)
            if response.status_code == 200:
                print("✅ Device server started successfully")
                print("🌐 Server running at: http://localhost:5000")
                
                # Open registration page
                registration_file = Path(__file__).parent / "device_registration.html"
                if registration_file.exists():
                    print("📝 Opening device registration page...")
                    webbrowser.open(f"file://{registration_file.absolute()}")
                
                return True
            else:
                print("⚠️ Server started but not responding correctly")
                return False
                
        except requests.exceptions.RequestException:
            print("⚠️ Server may still be starting...")
            return True
            
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False

def main():
    """Main function"""
    print("=" * 50)
    print("OneCore Device Server Launcher")
    print("=" * 50)
    
    if start_device_server():
        print("\n📋 Next Steps:")
        print("1. Complete device registration in the opened browser window")
        print("2. Once registered, you can start data simulation")
        print("3. Use 'python pi_data_simulator.py' to begin sending data")
        print("\n🛑 Press Ctrl+C to stop the server")
        
        try:
            # Keep the script running
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Shutting down...")
    else:
        print("❌ Failed to start device server")
        sys.exit(1)

if __name__ == "__main__":
    main()
