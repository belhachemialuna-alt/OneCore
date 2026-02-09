#!/usr/bin/env python3
"""
Device System Startup Script
Starts the complete device system with all modules.
"""

import sys
import os

# Add device module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'device'))

from device.main import main

if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        BAYYTI Smart Irrigation - Device System           ║
║                                                           ║
║  Raspberry Pi / Smart Box Device Manager                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    main()
