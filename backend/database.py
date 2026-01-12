import sqlite3
import os
from datetime import datetime
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), 'irrigation.db')

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_database():
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sensor_readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                soil_moisture REAL,
                temperature REAL,
                humidity REAL,
                flow_rate REAL,
                pressure REAL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                battery_level REAL,
                solar_status TEXT,
                leak_detected BOOLEAN,
                valve_status TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS irrigation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                action TEXT,
                duration INTEGER,
                water_used REAL,
                trigger_type TEXT,
                notes TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                enabled BOOLEAN DEFAULT 1,
                start_time TEXT,
                duration INTEGER,
                days_of_week TEXT,
                soil_threshold REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS api_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE,
                name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_used DATETIME,
                enabled BOOLEAN DEFAULT 1
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                alert_type TEXT,
                severity TEXT,
                message TEXT,
                resolved BOOLEAN DEFAULT 0
            )
        ''')
        
        conn.commit()
        print("Database initialized successfully")

def save_sensor_reading(soil_moisture, temperature, humidity, flow_rate, pressure):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO sensor_readings (soil_moisture, temperature, humidity, flow_rate, pressure)
            VALUES (?, ?, ?, ?, ?)
        ''', (soil_moisture, temperature, humidity, flow_rate, pressure))
        conn.commit()

def save_system_status(battery_level, solar_status, leak_detected, valve_status):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO system_status (battery_level, solar_status, leak_detected, valve_status)
            VALUES (?, ?, ?, ?)
        ''', (battery_level, solar_status, leak_detected, valve_status))
        conn.commit()

def log_irrigation_event(action, duration=0, water_used=0, trigger_type='manual', notes=''):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO irrigation_logs (action, duration, water_used, trigger_type, notes)
            VALUES (?, ?, ?, ?, ?)
        ''', (action, duration, water_used, trigger_type, notes))
        conn.commit()

def get_recent_sensor_data(limit=100):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM sensor_readings 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]

def get_recent_logs(limit=50):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM irrigation_logs 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (limit,))
        return [dict(row) for row in cursor.fetchall()]

def get_active_schedules():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM schedules 
            WHERE enabled = 1
            ORDER BY start_time
        ''')
        return [dict(row) for row in cursor.fetchall()]

def create_alert(alert_type, severity, message):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO alerts (alert_type, severity, message)
            VALUES (?, ?, ?)
        ''', (alert_type, severity, message))
        conn.commit()

def get_unresolved_alerts():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM alerts 
            WHERE resolved = 0
            ORDER BY timestamp DESC
        ''')
        return [dict(row) for row in cursor.fetchall()]

if __name__ == '__main__':
    init_database()
