"""
System Monitor - CPU and RAM monitoring for Raspberry Pi
"""
import platform

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("psutil not available. System monitoring will use simulation mode.")


class SystemMonitor:
    """Monitor CPU and RAM usage on Raspberry Pi"""
    
    def __init__(self):
        self.psutil_available = PSUTIL_AVAILABLE
        print(f"System Monitor initialized (psutil: {self.psutil_available})")
    
    def get_cpu_usage(self):
        """Get current CPU usage percentage"""
        if self.psutil_available:
            try:
                # Get CPU usage over 1 second interval
                cpu_percent = psutil.cpu_percent(interval=0.1)
                return round(cpu_percent, 1)
            except Exception as e:
                print(f"Error reading CPU usage: {e}")
                return self._simulate_cpu_usage()
        else:
            return self._simulate_cpu_usage()
    
    def get_cpu_count(self):
        """Get number of CPU cores"""
        if self.psutil_available:
            try:
                return psutil.cpu_count(logical=True)
            except:
                return 1
        else:
            return 1
    
    def get_cpu_frequency(self):
        """Get CPU frequency in MHz"""
        if self.psutil_available:
            try:
                freq = psutil.cpu_freq()
                if freq:
                    return round(freq.current, 0)
            except:
                pass
        return 0
    
    def get_ram_usage(self):
        """Get RAM usage statistics"""
        if self.psutil_available:
            try:
                ram = psutil.virtual_memory()
                return {
                    'total': round(ram.total / (1024**3), 2),  # GB
                    'used': round(ram.used / (1024**3), 2),    # GB
                    'available': round(ram.available / (1024**3), 2),  # GB
                    'percent': round(ram.percent, 1)
                }
            except Exception as e:
                print(f"Error reading RAM usage: {e}")
                return self._simulate_ram_usage()
        else:
            return self._simulate_ram_usage()
    
    def get_system_info(self):
        """Get system information"""
        return {
            'platform': platform.system(),
            'platform_release': platform.release(),
            'platform_version': platform.version(),
            'architecture': platform.machine(),
            'processor': platform.processor()
        }
    
    def get_status(self):
        """Get complete system monitoring status"""
        cpu_usage = self.get_cpu_usage()
        ram_usage = self.get_ram_usage()
        cpu_count = self.get_cpu_count()
        cpu_freq = self.get_cpu_frequency()
        system_info = self.get_system_info()
        
        return {
            'cpu': {
                'usage_percent': cpu_usage,
                'cores': cpu_count,
                'frequency_mhz': cpu_freq,
                'status': 'normal' if cpu_usage < 80 else 'high' if cpu_usage < 95 else 'critical'
            },
            'ram': {
                'total_gb': ram_usage['total'],
                'used_gb': ram_usage['used'],
                'available_gb': ram_usage['available'],
                'usage_percent': ram_usage['percent'],
                'status': 'normal' if ram_usage['percent'] < 80 else 'high' if ram_usage['percent'] < 95 else 'critical'
            },
            'system': system_info
        }
    
    def _simulate_cpu_usage(self):
        """Simulate CPU usage when psutil is not available"""
        import random
        # Simulate realistic CPU usage (20-60% for idle system)
        return round(random.uniform(20, 60), 1)
    
    def _simulate_ram_usage(self):
        """Simulate RAM usage when psutil is not available"""
        import random
        # Simulate 512MB total RAM (Raspberry Pi Zero W typical)
        total = 0.5
        used = round(random.uniform(0.2, 0.4), 2)
        available = round(total - used, 2)
        percent = round((used / total) * 100, 1)
        
        return {
            'total': total,
            'used': used,
            'available': available,
            'percent': percent
        }
