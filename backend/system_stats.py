import psutil

def get_system_stats():
    """
    Fetch real-time CPU and RAM statistics from the system.
    Returns a dictionary with CPU and memory usage data.
    """
    cpu_percent = psutil.cpu_percent(interval=1)
    
    memory = psutil.virtual_memory()
    mem_total = round(memory.total / (1024**3), 2)   # GB
    mem_used = round(memory.used / (1024**3), 2)
    mem_percent = memory.percent

    # Get CPU frequency if available
    try:
        cpu_freq = psutil.cpu_freq()
        cpu_freq_current = round(cpu_freq.current, 0) if cpu_freq else 0
    except:
        cpu_freq_current = 0

    # Get CPU count
    cpu_count = psutil.cpu_count()

    return {
        "cpu_percent": cpu_percent,
        "cpu_freq": cpu_freq_current,
        "cpu_cores": cpu_count,
        "mem_total": mem_total,
        "mem_used": mem_used,
        "mem_percent": mem_percent
    }
