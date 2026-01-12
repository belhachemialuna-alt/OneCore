#!/bin/bash

# BAYYTI-B1 Installation and Auto-Start Setup Script
# This script automates the installation and systemd service setup

set -e  # Exit on error

echo "========================================="
echo "  BAYYTI-B1 Installation Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR"
VENV_DIR="$PROJECT_DIR/venv"

echo -e "${GREEN}Step 1: Checking prerequisites...${NC}"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Installing...${NC}"
    sudo apt update
    sudo apt install -y python3 python3-pip python3-venv
else
    echo -e "${GREEN}✓ Python 3 found${NC}"
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}pip3 is not installed. Installing...${NC}"
    sudo apt install -y python3-pip
else
    echo -e "${GREEN}✓ pip3 found${NC}"
fi

echo ""
echo -e "${GREEN}Step 2: Creating virtual environment...${NC}"

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

echo ""
echo -e "${GREEN}Step 3: Activating virtual environment and installing dependencies...${NC}"

# Activate virtual environment
source "$VENV_DIR/bin/activate"

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo "Installing Python dependencies from requirements.txt..."
if [ -f "$PROJECT_DIR/requirements.txt" ]; then
    pip install -r "$PROJECT_DIR/requirements.txt"
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}ERROR: requirements.txt not found in $PROJECT_DIR${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 4: Initializing database...${NC}"

# Initialize database
cd "$PROJECT_DIR/backend"
if [ -f "database.py" ]; then
    python3 database.py
    echo -e "${GREEN}✓ Database initialized${NC}"
else
    echo -e "${YELLOW}Warning: database.py not found, skipping database initialization${NC}"
fi

cd "$PROJECT_DIR"

echo ""
echo -e "${GREEN}Step 5: Creating systemd service...${NC}"

# Get current user
CURRENT_USER=$(whoami)
CURRENT_GROUP=$(id -gn)

# Create service file
SERVICE_FILE="/etc/systemd/system/bayyti.service"

echo "Creating systemd service file..."

sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=BAYYTI Smart Irrigation System - API Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=$CURRENT_USER
Group=$CURRENT_GROUP
WorkingDirectory=$PROJECT_DIR/backend
Environment="PYTHONUNBUFFERED=1"
Environment="ENABLE_GPIO=true"
Environment="PATH=$VENV_DIR/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=$VENV_DIR/bin/python3 $PROJECT_DIR/backend/api_server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Restart conditions
StartLimitIntervalSec=60
StartLimitBurst=3

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ Service file created at $SERVICE_FILE${NC}"

echo ""
echo -e "${GREEN}Step 6: Enabling and starting service...${NC}"

# Reload systemd
sudo systemctl daemon-reload
echo -e "${GREEN}✓ Systemd daemon reloaded${NC}"

# Enable service
sudo systemctl enable bayyti.service
echo -e "${GREEN}✓ Service enabled for auto-start${NC}"

# Start service
sudo systemctl start bayyti.service
echo -e "${GREEN}✓ Service started${NC}"

echo ""
echo -e "${GREEN}Step 7: Checking service status...${NC}"

sleep 2

# Check status
if sudo systemctl is-active --quiet bayyti.service; then
    echo -e "${GREEN}✓ Service is running${NC}"
else
    echo -e "${RED}✗ Service failed to start${NC}"
    echo "Checking logs..."
    sudo journalctl -u bayyti.service -n 20 --no-pager
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}Installation Complete!${NC}"
echo "========================================="
echo ""
echo "Service Status:"
sudo systemctl status bayyti.service --no-pager -l | head -n 10
echo ""
echo "Useful commands:"
echo "  View logs:        sudo journalctl -u bayyti.service -f"
echo "  Restart service:  sudo systemctl restart bayyti.service"
echo "  Stop service:     sudo systemctl stop bayyti.service"
echo "  Check status:     sudo systemctl status bayyti.service"
echo ""
echo "Dashboard should be available at:"
echo "  http://localhost:5000"
echo "  http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo -e "${GREEN}The service will automatically start on boot!${NC}"
echo ""
