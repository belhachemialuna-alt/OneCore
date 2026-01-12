#!/bin/bash
# Install BAYYTI Systemd Services
# Run with: sudo bash install_services.sh

echo "========================================="
echo "   BAYYTI Service Installation Script"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root: sudo bash install_services.sh"
    exit 1
fi

# Get the actual user (not root)
if [ -n "$SUDO_USER" ]; then
    ACTUAL_USER=$SUDO_USER
else
    ACTUAL_USER=$(whoami)
fi

echo "Installing services for user: $ACTUAL_USER"
echo ""

# Get project directory
PROJECT_DIR=$(pwd | sed 's|/scripts||')
echo "Project directory: $PROJECT_DIR"
echo ""

# Update service files with correct paths
sed -i "s|/home/pi/smart-irrigation|$PROJECT_DIR|g" bayyti.service
sed -i "s|User=pi|User=$ACTUAL_USER|g" bayyti.service
sed -i "s|Group=pi|Group=$ACTUAL_USER|g" bayyti.service

sed -i "s|/home/pi/smart-irrigation|$PROJECT_DIR|g" bayyti-sensors.service
sed -i "s|User=pi|User=$ACTUAL_USER|g" bayyti-sensors.service
sed -i "s|Group=pi|Group=$ACTUAL_USER|g" bayyti-sensors.service

sed -i "s|/home/pi/smart-irrigation|$PROJECT_DIR|g" bayyti-ai.service
sed -i "s|User=pi|User=$ACTUAL_USER|g" bayyti-ai.service
sed -i "s|Group=pi|Group=$ACTUAL_USER|g" bayyti-ai.service

# Copy service files
echo "📦 Copying service files..."
cp bayyti.service /etc/systemd/system/
cp bayyti-sensors.service /etc/systemd/system/
cp bayyti-ai.service /etc/systemd/system/

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Enable services
echo "✅ Enabling services..."
systemctl enable bayyti.service
systemctl enable bayyti-sensors.service
systemctl enable bayyti-ai.service

# Start services
echo "🚀 Starting services..."
systemctl start bayyti.service
sleep 2
systemctl start bayyti-sensors.service
systemctl start bayyti-ai.service

echo ""
echo "========================================="
echo "✅ Installation Complete!"
echo "========================================="
echo ""
echo "Service Status:"
systemctl status bayyti.service --no-pager -l
echo ""
systemctl status bayyti-sensors.service --no-pager -l
echo ""
systemctl status bayyti-ai.service --no-pager -l
echo ""
echo "Useful Commands:"
echo "  • Check status:  sudo systemctl status bayyti.service"
echo "  • View logs:     sudo journalctl -u bayyti.service -f"
echo "  • Restart:       sudo systemctl restart bayyti.service"
echo "  • Stop:          sudo systemctl stop bayyti.service"
echo "  • Disable:       sudo systemctl disable bayyti.service"
echo ""
echo "Dashboard: http://$(hostname -I | awk '{print $1}'):5000"
echo "Analytics: http://$(hostname -I | awk '{print $1}'):5000/analytics.html"
echo ""
