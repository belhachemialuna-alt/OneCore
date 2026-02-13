"""
Enhanced Hardware Fingerprinting Module
Generates truly unique device IDs based on multiple hardware characteristics.
Designed specifically to differentiate between PC and Raspberry Pi devices.
"""

import uuid
import hashlib
import platform
import os
import subprocess
import json
from datetime import datetime

def get_enhanced_hardware_fingerprint():
    """
    Generate enhanced hardware fingerprint using multiple sources.
    This ensures each physical device gets a unique identifier.
    
    Returns:
        str: SHA256 hash of combined hardware identifiers
    """
    identifiers = []
    system = platform.system()
    
    print(f"🔍 Generating hardware fingerprint for {system} system...")
    
    # 1. MAC Address (Primary network interface)
    try:
        mac = uuid.getnode()
        identifiers.append(f"MAC:{mac}")
        print(f"   ✓ MAC Address: {mac}")
    except Exception as e:
        print(f"   ⚠ MAC Address failed: {e}")
    
    # 2. System Information
    try:
        system_info = platform.system()
        machine = platform.machine()
        processor = platform.processor()
        node = platform.node()
        
        identifiers.extend([
            f"SYSTEM:{system_info}",
            f"MACHINE:{machine}",
            f"PROCESSOR:{processor}",
            f"NODE:{node}"
        ])
        print(f"   ✓ System: {system_info}, Machine: {machine}")
        print(f"   ✓ Processor: {processor}")
        print(f"   ✓ Node: {node}")
    except Exception as e:
        print(f"   ⚠ System info failed: {e}")
    
    # 3. Raspberry Pi Specific Hardware
    if system == 'Linux':
        # CPU Serial Number (Raspberry Pi specific)
        try:
            with open('/proc/cpuinfo', 'r') as f:
                cpuinfo = f.read()
                for line in cpuinfo.split('\n'):
                    if line.startswith('Serial'):
                        serial = line.split(':')[1].strip()
                        if serial and serial != '0000000000000000':
                            identifiers.append(f"PI_SERIAL:{serial}")
                            print(f"   ✓ Raspberry Pi Serial: {serial}")
                            break
        except Exception as e:
            print(f"   ⚠ Pi Serial failed: {e}")
        
        # Hardware Revision (Raspberry Pi)
        try:
            with open('/proc/cpuinfo', 'r') as f:
                for line in f:
                    if line.startswith('Revision'):
                        revision = line.split(':')[1].strip()
                        identifiers.append(f"PI_REVISION:{revision}")
                        print(f"   ✓ Pi Revision: {revision}")
                        break
        except Exception as e:
            print(f"   ⚠ Pi Revision failed: {e}")
        
        # Device Tree Model (Raspberry Pi)
        try:
            with open('/proc/device-tree/model', 'r') as f:
                model = f.read().strip().replace('\x00', '')
                identifiers.append(f"PI_MODEL:{model}")
                print(f"   ✓ Pi Model: {model}")
        except Exception as e:
            print(f"   ⚠ Pi Model failed: {e}")
        
        # Linux Machine ID
        try:
            with open('/etc/machine-id', 'r') as f:
                machine_id = f.read().strip()
                identifiers.append(f"MACHINE_ID:{machine_id}")
                print(f"   ✓ Linux Machine ID: {machine_id[:16]}...")
        except Exception as e:
            print(f"   ⚠ Machine ID failed: {e}")
        
        # DMI System UUID (if available)
        try:
            with open('/sys/class/dmi/id/product_uuid', 'r') as f:
                dmi_uuid = f.read().strip()
                identifiers.append(f"DMI_UUID:{dmi_uuid}")
                print(f"   ✓ DMI UUID: {dmi_uuid}")
        except Exception as e:
            print(f"   ⚠ DMI UUID failed: {e}")
    
    # 4. Windows Specific Hardware
    elif system == 'Windows':
        try:
            import winreg
            # Windows Product ID
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion")
            product_id, _ = winreg.QueryValueEx(key, "ProductId")
            identifiers.append(f"WIN_PRODUCT:{product_id}")
            print(f"   ✓ Windows Product ID: {product_id}")
            winreg.CloseKey(key)
            
            # Machine GUID
            try:
                key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                    r"SOFTWARE\Microsoft\Cryptography")
                machine_guid, _ = winreg.QueryValueEx(key, "MachineGuid")
                identifiers.append(f"WIN_GUID:{machine_guid}")
                print(f"   ✓ Windows Machine GUID: {machine_guid}")
                winreg.CloseKey(key)
            except:
                pass
                
        except Exception as e:
            print(f"   ⚠ Windows hardware failed: {e}")
    
    # 5. Additional Hardware Detection
    try:
        # CPU count and architecture
        cpu_count = os.cpu_count()
        identifiers.append(f"CPU_COUNT:{cpu_count}")
        print(f"   ✓ CPU Count: {cpu_count}")
    except Exception as e:
        print(f"   ⚠ CPU count failed: {e}")
    
    # 6. Network Interface Details (for additional uniqueness)
    try:
        if system == 'Linux':
            # Get all network interfaces
            result = subprocess.run(['ip', 'link', 'show'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                # Extract MAC addresses from all interfaces
                for line in result.stdout.split('\n'):
                    if 'link/ether' in line:
                        mac_addr = line.split('link/ether')[1].split()[0]
                        identifiers.append(f"NET_MAC:{mac_addr}")
                        print(f"   ✓ Network MAC: {mac_addr}")
        elif system == 'Windows':
            # Windows network adapter query
            result = subprocess.run(['wmic', 'path', 'win32_networkadapter', 'get', 'macaddress'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    line = line.strip()
                    if ':' in line and len(line) == 17:  # MAC format XX:XX:XX:XX:XX:XX
                        identifiers.append(f"WIN_NET_MAC:{line}")
                        print(f"   ✓ Windows Network MAC: {line}")
    except Exception as e:
        print(f"   ⚠ Network interface detection failed: {e}")
    
    # 7. Storage Device Serial Numbers
    try:
        if system == 'Linux':
            # Get storage device info
            result = subprocess.run(['lsblk', '-o', 'NAME,SERIAL', '-n'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if line.strip() and ' ' in line:
                        parts = line.strip().split()
                        if len(parts) >= 2 and parts[1] != '':
                            identifiers.append(f"STORAGE_SERIAL:{parts[1]}")
                            print(f"   ✓ Storage Serial: {parts[1]}")
    except Exception as e:
        print(f"   ⚠ Storage detection failed: {e}")
    
    # Ensure we have enough identifiers
    if len(identifiers) < 3:
        print(f"   ⚠ Warning: Only {len(identifiers)} identifiers found")
        # Add fallback identifiers
        identifiers.append(f"FALLBACK_TIME:{int(datetime.utcnow().timestamp())}")
        identifiers.append(f"FALLBACK_PID:{os.getpid()}")
    
    print(f"   📊 Total identifiers collected: {len(identifiers)}")
    
    # Combine all identifiers with separator
    combined = '|'.join(sorted(identifiers))  # Sort for consistency
    
    # Generate SHA256 hash
    device_id = hashlib.sha256(combined.encode('utf-8')).hexdigest()
    
    print(f"   🔑 Generated Device ID: {device_id[:32]}...")
    
    return device_id

def generate_irr_format_device_id():
    """
    Generate device ID in IRR-ALG-XXXXXX format using enhanced fingerprinting.
    
    Returns:
        str: Device ID in IRR-ALG-XXXXXX format
    """
    hardware_id = get_enhanced_hardware_fingerprint()
    
    # Generate 6-character identifier from hardware hash
    hash_digest = hashlib.sha256(hardware_id.encode()).hexdigest()
    unique_id = hash_digest[:6].upper()
    
    irr_id = f"IRR-ALG-{unique_id}"
    print(f"   🏷️  IRR Format ID: {irr_id}")
    
    return irr_id

def verify_hardware_uniqueness():
    """
    Verify that hardware fingerprinting generates consistent results.
    Run this multiple times to ensure consistency on same hardware.
    
    Returns:
        dict: Verification results
    """
    print("🧪 Testing hardware fingerprint consistency...")
    
    ids = []
    for i in range(5):
        device_id = get_enhanced_hardware_fingerprint()
        ids.append(device_id)
        print(f"   Run {i+1}: {device_id[:16]}...")
    
    # Check consistency
    unique_ids = set(ids)
    consistent = len(unique_ids) == 1
    
    result = {
        'consistent': consistent,
        'unique_count': len(unique_ids),
        'device_id': ids[0] if consistent else None,
        'all_ids': ids
    }
    
    if consistent:
        print("   ✅ PASS: All IDs identical (consistent)")
    else:
        print("   ❌ FAIL: IDs differ (inconsistent)")
        for i, uid in enumerate(unique_ids):
            print(f"      Variant {i+1}: {uid[:32]}...")
    
    return result

def save_hardware_report(filename="hardware_report.json"):
    """
    Save detailed hardware report for debugging.
    
    Args:
        filename (str): Output filename
    """
    print(f"📋 Generating hardware report: {filename}")
    
    # Generate fingerprint and collect details
    device_id = get_enhanced_hardware_fingerprint()
    irr_id = generate_irr_format_device_id()
    
    report = {
        'timestamp': datetime.utcnow().isoformat(),
        'system': platform.system(),
        'machine': platform.machine(),
        'processor': platform.processor(),
        'node': platform.node(),
        'python_version': platform.python_version(),
        'device_id_full': device_id,
        'device_id_irr': irr_id,
        'consistency_test': verify_hardware_uniqueness()
    }
    
    # Save report
    try:
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"   ✅ Report saved: {filename}")
    except Exception as e:
        print(f"   ❌ Failed to save report: {e}")
    
    return report

if __name__ == "__main__":
    print("=" * 70)
    print("ENHANCED HARDWARE FINGERPRINTING TEST")
    print("=" * 70)
    print()
    
    # Generate and display device ID
    device_id = get_enhanced_hardware_fingerprint()
    irr_id = generate_irr_format_device_id()
    
    print()
    print("=" * 70)
    print("RESULTS")
    print("=" * 70)
    print(f"Full Device ID: {device_id}")
    print(f"IRR Format ID:  {irr_id}")
    print()
    
    # Test consistency
    verify_hardware_uniqueness()
    
    # Save detailed report
    save_hardware_report()
    
    print()
    print("=" * 70)
    print("DEPLOYMENT INSTRUCTIONS")
    print("=" * 70)
    print("1. Run this script on your Windows PC")
    print("2. Note the Device ID generated")
    print("3. Copy this script to your Raspberry Pi")
    print("4. Run this script on your Raspberry Pi")
    print("5. Compare Device IDs - they MUST be different")
    print()
    print("If Device IDs are different, the fix is working!")
    print("=" * 70)
