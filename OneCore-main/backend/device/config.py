"""
Device Configuration
Network and API configuration for device communication.

NETWORK SETUP:
- Raspberry Pi IP: 192.168.137.193 (runs on port 5000)
- PC/Router IP: 192.168.1.6 (Next.js on port 3000)
- Cloud Domain: cloud.ielivate.com (production)
"""

import os

class DeviceConfig:
    """Device configuration for local and cloud environments."""
    
    # Network Configuration
    RASPBERRY_PI_IP = "192.168.137.193"
    PC_IP = "192.168.1.6"
    CLOUD_DOMAIN = "cloud.ielivate.com"
    
    # Port Configuration
    DEVICE_PORT = 5000  # Raspberry Pi local API
    NEXTJS_PORT = 3000  # Next.js API server
    
    # Environment Detection
    ENVIRONMENT = os.getenv("DEVICE_ENV", "local")  # local or cloud
    
    @classmethod
    def get_vps_url(cls):
        """
        Get VPS URL based on environment.
        
        Returns:
            str: VPS URL for API calls
        """
        if cls.ENVIRONMENT == "cloud":
            # Production: Use cloud domain with HTTPS
            return f"https://{cls.CLOUD_DOMAIN}"
        else:
            # Local testing: Use PC IP
            return f"http://{cls.PC_IP}:{cls.NEXTJS_PORT}"
    
    @classmethod
    def get_device_url(cls):
        """
        Get device local API URL.
        
        Returns:
            str: Device API URL
        """
        return f"http://{cls.RASPBERRY_PI_IP}:{cls.DEVICE_PORT}"
    
    @classmethod
    def get_config_summary(cls):
        """
        Get configuration summary.
        
        Returns:
            dict: Configuration details
        """
        return {
            "environment": cls.ENVIRONMENT,
            "raspberry_pi_ip": cls.RASPBERRY_PI_IP,
            "pc_ip": cls.PC_IP,
            "cloud_domain": cls.CLOUD_DOMAIN,
            "device_port": cls.DEVICE_PORT,
            "nextjs_port": cls.NEXTJS_PORT,
            "vps_url": cls.get_vps_url(),
            "device_url": cls.get_device_url()
        }


# Configuration presets
LOCAL_CONFIG = {
    "vps_url": f"http://192.168.1.6:3000",
    "device_url": f"http://192.168.137.193:5000",
    "environment": "local"
}

CLOUD_CONFIG = {
    "vps_url": "https://cloud.ielivate.com",
    "device_url": f"http://192.168.137.193:5000",
    "environment": "cloud"
}

def get_config(environment="local"):
    """
    Get configuration for specific environment.
    
    Args:
        environment (str): 'local' or 'cloud'
    
    Returns:
        dict: Configuration
    """
    if environment == "cloud":
        return CLOUD_CONFIG
    return LOCAL_CONFIG

def print_network_info():
    """Print network configuration information."""
    print("\n" + "=" * 60)
    print("NETWORK CONFIGURATION")
    print("=" * 60)
    print(f"Raspberry Pi IP:  {DeviceConfig.RASPBERRY_PI_IP}")
    print(f"Device Port:      {DeviceConfig.DEVICE_PORT}")
    print(f"Device URL:       {DeviceConfig.get_device_url()}")
    print("-" * 60)
    print(f"PC/Router IP:     {DeviceConfig.PC_IP}")
    print(f"Next.js Port:     {DeviceConfig.NEXTJS_PORT}")
    print(f"Cloud Domain:     {DeviceConfig.CLOUD_DOMAIN}")
    print("-" * 60)
    print(f"Environment:      {DeviceConfig.ENVIRONMENT}")
    print(f"VPS URL:          {DeviceConfig.get_vps_url()}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    print_network_info()
