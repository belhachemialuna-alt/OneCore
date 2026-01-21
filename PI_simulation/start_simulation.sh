#!/bin/bash

echo "========================================"
echo "PI Data Simulator - Linux/Mac Launcher"
echo "========================================"
echo

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.7+ and try again"
    exit 1
fi

# Install requirements if needed
echo "Installing/updating requirements..."
pip3 install -r requirements.txt

echo
echo "Starting PI Data Simulator..."
echo
echo "Available options:"
echo "1. Localhost only (Cloud: localhost:3000, PI: localhost:5000)"
echo "2. With remote PI (Cloud: localhost:3000, PI: 192.168.137.193:5000)"
echo "3. Single test reading"
echo "4. Custom configuration"
echo

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "Starting localhost simulation..."
        python3 pi_data_simulator.py --cloud http://localhost:3000 --pi-server http://localhost:5000 --interval 30
        ;;
    2)
        echo "Starting simulation with remote PI..."
        python3 pi_data_simulator.py --cloud http://localhost:3000 --pi-ip 192.168.137.193 --interval 30
        ;;
    3)
        echo "Sending single test reading..."
        python3 pi_data_simulator.py --single
        read -p "Press Enter to continue..."
        ;;
    4)
        echo "Enter custom parameters:"
        read -p "Cloud endpoint (default: http://localhost:3000): " cloud_url
        read -p "PI IP address (default: localhost): " pi_ip
        read -p "Interval in seconds (default: 30): " interval
        
        cloud_url=${cloud_url:-http://localhost:3000}
        pi_ip=${pi_ip:-localhost}
        interval=${interval:-30}
        
        if [ "$pi_ip" = "localhost" ]; then
            python3 pi_data_simulator.py --cloud "$cloud_url" --pi-server http://localhost:5000 --interval "$interval"
        else
            python3 pi_data_simulator.py --cloud "$cloud_url" --pi-ip "$pi_ip" --interval "$interval"
        fi
        ;;
    *)
        echo "Invalid choice. Starting default localhost simulation..."
        python3 pi_data_simulator.py --cloud http://localhost:3000 --pi-server http://localhost:5000 --interval 30
        ;;
esac

echo
echo "Simulation ended."
