"""
Terminal API for Raspberry Pi debugging
Provides real-time terminal access for testing and debugging
"""
import subprocess
import os
import sys
from flask import Blueprint, request, jsonify, Response
import time
import threading
import queue

terminal_bp = Blueprint('terminal', __name__)

# Store active terminal sessions
active_sessions = {}
session_counter = 0

@terminal_bp.route('/terminal/execute', methods=['POST'])
def execute_command():
    """Execute a single command and return output"""
    try:
        data = request.get_json()
        command = data.get('command', '')
        
        if not command:
            return jsonify({'success': False, 'error': 'No command provided'}), 400
        
        # Security check - prevent dangerous commands
        dangerous_commands = ['rm -rf', 'mkfs', 'dd if=', ':(){:|:&};:', 'fork bomb']
        if any(dangerous in command.lower() for dangerous in dangerous_commands):
            return jsonify({'success': False, 'error': 'Command blocked for security reasons'}), 403
        
        # Execute command
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            
            return jsonify({
                'success': True,
                'output': result.stdout,
                'error': result.stderr,
                'return_code': result.returncode
            })
        except subprocess.TimeoutExpired:
            return jsonify({'success': False, 'error': 'Command timeout (30s limit)'}), 408
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@terminal_bp.route('/terminal/system-info', methods=['GET'])
def get_system_info():
    """Get system information for debugging"""
    try:
        info = {
            'platform': sys.platform,
            'python_version': sys.version,
            'cwd': os.getcwd(),
            'user': os.getenv('USER', 'unknown'),
            'home': os.getenv('HOME', 'unknown')
        }
        
        # Try to get Raspberry Pi specific info
        try:
            with open('/proc/cpuinfo', 'r') as f:
                cpuinfo = f.read()
                if 'Raspberry Pi' in cpuinfo:
                    info['is_raspberry_pi'] = True
                    # Extract model
                    for line in cpuinfo.split('\n'):
                        if 'Model' in line:
                            info['model'] = line.split(':')[1].strip()
                            break
        except:
            info['is_raspberry_pi'] = False
        
        # Get GPIO status if available
        try:
            import RPi.GPIO as GPIO
            info['gpio_available'] = True
            info['gpio_mode'] = 'BCM' if GPIO.getmode() == GPIO.BCM else 'BOARD'
        except:
            info['gpio_available'] = False
        
        return jsonify({'success': True, 'info': info})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@terminal_bp.route('/terminal/test-gpio', methods=['POST'])
def test_gpio():
    """Test GPIO functionality"""
    try:
        data = request.get_json()
        pin = data.get('pin', 17)
        
        try:
            import RPi.GPIO as GPIO
            
            # Setup
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(pin, GPIO.OUT)
            
            # Test blink
            GPIO.output(pin, GPIO.HIGH)
            time.sleep(0.5)
            GPIO.output(pin, GPIO.LOW)
            
            GPIO.cleanup()
            
            return jsonify({
                'success': True,
                'message': f'GPIO pin {pin} tested successfully (blinked)',
                'pin': pin
            })
        except ImportError:
            return jsonify({
                'success': False,
                'error': 'RPi.GPIO not available - not running on Raspberry Pi?'
            }), 400
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@terminal_bp.route('/terminal/logs', methods=['GET'])
def get_logs():
    """Get recent system logs"""
    try:
        log_type = request.args.get('type', 'system')
        lines = int(request.args.get('lines', 50))
        
        log_files = {
            'system': '/var/log/syslog',
            'irrigation': 'logs/irrigation.log',
            'api': 'logs/api.log'
        }
        
        log_file = log_files.get(log_type, log_files['system'])
        
        try:
            # Use tail command to get last N lines
            result = subprocess.run(
                ['tail', '-n', str(lines), log_file],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            return jsonify({
                'success': True,
                'logs': result.stdout,
                'log_type': log_type,
                'lines': lines
            })
        except FileNotFoundError:
            return jsonify({
                'success': False,
                'error': f'Log file not found: {log_file}'
            }), 404
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@terminal_bp.route('/terminal/quick-tests', methods=['GET'])
def quick_tests():
    """Run quick diagnostic tests"""
    try:
        tests = {}
        
        # Test 1: Python version
        tests['python'] = {
            'version': sys.version,
            'status': 'ok'
        }
        
        # Test 2: Disk space
        try:
            result = subprocess.run(['df', '-h', '/'], capture_output=True, text=True, timeout=5)
            tests['disk_space'] = {
                'output': result.stdout,
                'status': 'ok'
            }
        except:
            tests['disk_space'] = {'status': 'failed'}
        
        # Test 3: Memory
        try:
            result = subprocess.run(['free', '-h'], capture_output=True, text=True, timeout=5)
            tests['memory'] = {
                'output': result.stdout,
                'status': 'ok'
            }
        except:
            tests['memory'] = {'status': 'failed'}
        
        # Test 4: Network
        try:
            result = subprocess.run(['ip', 'addr', 'show'], capture_output=True, text=True, timeout=5)
            tests['network'] = {
                'output': result.stdout,
                'status': 'ok'
            }
        except:
            tests['network'] = {'status': 'failed'}
        
        # Test 5: GPIO (if Raspberry Pi)
        try:
            import RPi.GPIO as GPIO
            tests['gpio'] = {
                'available': True,
                'status': 'ok'
            }
        except:
            tests['gpio'] = {
                'available': False,
                'status': 'not_available'
            }
        
        return jsonify({
            'success': True,
            'tests': tests,
            'timestamp': time.time()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
