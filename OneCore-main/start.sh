#!/bin/bash

# BAYYTI Smart Irrigation System - Raspberry Pi Launcher
# This script sets up the environment and starts the system

echo "========================================="
echo "  BAYYTI Smart Irrigation System v1.0"
echo "========================================="
echo ""

# Set GPIO enabled for Raspberry Pi
export ENABLE_GPIO=true

cd backend

echo "Initializing database..."
python3 database.py

echo ""
echo "Starting API Server..."
echo "Dashboard will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 api_server.py

echo "========================================="
echo "  BAYYTI Smart Irrigation System v1.0"
echo "========================================="
echo ""

cd "$(dirname "$0")/backend"

echo "Initializing database..."
python3 database.py

echo ""
echo "Starting API Server..."
echo "Dashboard will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 api_server.py
