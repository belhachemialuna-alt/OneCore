# Smart Agriculture Analytics Dashboard

## Overview

The Analytics Dashboard provides advanced visualization and insights for your BAYYTI Smart Irrigation System, matching the professional agricultural dashboard design.

## Features

### 📊 Dashboard Components

#### 1. **Key Metrics Cards**
- **Fields Needing Irrigation**: Zones with soil moisture below threshold
- **Area of Doubt**: Zones with uncertain or missing sensor data  
- **Manual Override Events**: Count of manual irrigation interventions
- **Inactive Zones**: Zones without recent activity

#### 2. **Weather Widget** (Left Sidebar)
- Real-time temperature display
- Current date and time
- Weather condition (Cloudy/Rain based on humidity)
- Rain probability percentage
- Visual weather icon

#### 3. **Suspected Farmland Statistics** (Line Chart)
- AI irrigation recommendations over time
- 7-day trend analysis
- Shows irrigation decision patterns

#### 4. **Area of Doubt** (Donut Chart)
- Visual representation of irrigated vs non-irrigated area
- County farmland area statistics
- Interactive tooltips

#### 5. **Weather Trends** (Multi-line Chart)
- Last 20 days of weather data
- Temperature, rainfall, and humidity trends
- Three distinct trend lines with different styles

#### 6. **Farmland Utilization** (Bar Chart)
- Daily utilization percentage
- 30-day visual pattern
- Color-coded bars (green shades)

## Data Sources

### Metrics Mapping

| Dashboard Metric | Data Source | Calculation |
|-----------------|-------------|-------------|
| Fields Needing Irrigation | `sensor_readings` | Zones with `soil_moisture < 30%` |
| Area of Doubt | `sensor_readings` | Zones with data older than 24 hours |
| Manual Override Events | `irrigation_logs` | Count where `trigger_type = 'manual'` |
| Inactive Zones | `sensor_readings` | Zones with no data in 7 days |
| Weather Data | `sensor_reader` | Real-time sensor readings |
| Historical Trends | `sensor_readings` | Grouped by time window |

## API Endpoints

### Analytics Summary
```http
GET /api/analytics/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fields_needing_irrigation": 170,
    "uncertain_fields": 880,
    "inactive_zones": 255,
    "total_area": 244648,
    "irrigated_area": 144648
  }
}
```

### Update Check
```http
GET /api/system/update/check
```

**Response:**
```json
{
  "success": true,
  "update_available": true,
  "current_version": "1.0.0",
  "latest_version": "1.1.0",
  "release_date": "2026-01-12T00:00:00Z",
  "release_notes": "New features...",
  "download_url": "https://github.com/..."
}
```

### Install Update
```http
POST /api/system/update/install
Authorization: X-API-Key: your_api_key
```

**Body:**
```json
{
  "download_url": "https://github.com/..."
}
```

## File Structure

```
frontend/
├── analytics.html           # Main analytics dashboard page
├── css/
│   └── analytics.css       # Analytics-specific styling
└── js/
    └── analytics.js        # Charts and data logic

backend/
└── api_server.py           # Added analytics & update endpoints

scripts/
├── bayyti.service          # Systemd service for API
├── bayyti-sensors.service  # Systemd service for sensors
├── bayyti-ai.service       # Systemd service for AI
├── install_services.sh     # Auto-installer script
└── update_system.py        # GitHub update script
```

## Accessing the Dashboard

### Local Development
```
http://localhost:5000/analytics.html
```

### Raspberry Pi (Local Network)
```
http://raspberrypi.local:5000/analytics.html
http://192.168.1.XXX:5000/analytics.html
```

### From Main Dashboard
Click the "Analytics" button in the header

## Customization

### Changing Update Repository

Edit `frontend/js/analytics.js`:
```javascript
const GITHUB_API = 'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/releases/latest';
```

Also set environment variable on Raspberry Pi:
```bash
export GITHUB_REPO="your-username/your-repo"
```

### Adjusting Metrics

Edit `backend/api_server.py` in the `/api/analytics/summary` endpoint to customize calculations.

### Styling

Modify `frontend/css/analytics.css`:
- Colors: `:root` CSS variables
- Layout: Grid configurations
- Charts: Chart.js options in `analytics.js`

## Auto-Update System

### How It Works

1. **Update Icon**: Displays in header of both dashboards
2. **Auto-Check**: Checks for updates 3 seconds after page load
3. **Visual Indicator**: Red dot appears if update available
4. **User Action**: Click update icon to view release notes
5. **Installation**: Confirm to download and install
6. **Backup**: Automatic backup created before update
7. **Apply**: Extract and overwrite files
8. **Restart**: Services automatically restarted
9. **Complete**: System updated with new version

### GitHub Release Setup

1. **Create Release on GitHub**:
   - Tag: `v1.1.0` (increment from current)
   - Title: Version 1.1.0
   - Description: Release notes (markdown supported)
   - Assets: Upload release archive

2. **System Auto-Detects**:
   - Dashboard checks GitHub API
   - Compares version numbers
   - Shows notification if newer available

3. **User Installs**:
   - One-click installation
   - Progress feedback
   - Automatic system restart

### Manual Update

```bash
cd scripts
python3 update_system.py
```

### Rollback

If update fails, restore from backup:

```bash
cd backups
ls -lt  # Find latest
unzip backup_20260112_143022.zip -d ../
sudo systemctl restart bayyti.service
```

## Chart Configuration

### Chart.js Integration

All charts use Chart.js for consistent rendering:

```javascript
// Example: Customize line chart
farmlandStatsChart = new Chart(ctx, {
    type: 'line',
    data: { /* ... */ },
    options: {
        responsive: true,
        plugins: { /* ... */ },
        scales: { /* ... */ }
    }
});
```

### Real-Time Updates

Dashboard refreshes data every 30 seconds:

```javascript
setInterval(loadDashboardData, 30000);
```

Adjust interval in `analytics.js` as needed.

## Responsive Design

- **Desktop**: Full layout with sidebar
- **Tablet**: Stacked layout
- **Mobile**: Single column, collapsible sections

Media queries in `analytics.css` handle responsiveness.

## Production Deployment

### 1. Install Services (Auto-start on boot)

```bash
cd scripts
sudo bash install_services.sh
```

### 2. Enable HTTPS (Recommended for remote access)

```bash
# Install nginx
sudo apt install nginx

# Configure reverse proxy with SSL
# See INSTALLATION.md for details
```

### 3. Set Update Repository

```bash
echo 'GITHUB_REPO="your-username/your-repo"' | sudo tee -a /etc/environment
```

### 4. Test Update System

```bash
cd scripts
python3 update_system.py
```

## Troubleshooting

### Charts Not Loading

**Issue**: Blank chart areas
**Solution**: 
```bash
# Check console for errors
# Verify API endpoint responses
curl http://localhost:5000/api/analytics/summary
```

### Update Check Fails

**Issue**: "Unable to check for updates"
**Solution**:
```bash
# Verify GITHUB_REPO environment variable
echo $GITHUB_REPO

# Test API directly
curl https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/releases/latest
```

### Data Not Displaying

**Issue**: Zeros or "N/A" in metrics
**Solution**:
```bash
# Check database has data
sqlite3 backend/irrigation.db "SELECT COUNT(*) FROM sensor_readings;"

# Verify API server running
curl http://localhost:5000/api/status
```

## Best Practices

✅ **Regular Updates**: Check for updates weekly  
✅ **Monitor Logs**: `sudo journalctl -u bayyti.service -f`  
✅ **Test Updates**: Test on development Pi first  
✅ **Backup Data**: Database backed up automatically  
✅ **Version Control**: Tag releases properly (v1.0.0, v1.1.0)  
✅ **Release Notes**: Provide detailed changelog  
✅ **API Keys**: Use strong keys in production  

## Performance

- Charts render client-side (no server load)
- Data fetched every 30 seconds (configurable)
- API responses cached appropriately
- Minimal bandwidth usage
- Optimized for Raspberry Pi hardware

## Security

- Update system requires API key
- HTTPS recommended for remote access
- Environment variables for sensitive data
- Backup system prevents data loss
- Service runs as non-root user

## Support

For issues or questions:
- Check API logs: `sudo journalctl -u bayyti.service -f`
- Update logs: `cat update.log`
- GitHub issues: Report bugs in your repository

---

**Version**: 1.0.0  
**Last Updated**: January 12, 2026  
**Built with**: Chart.js, Flask, SQLite, Systemd
