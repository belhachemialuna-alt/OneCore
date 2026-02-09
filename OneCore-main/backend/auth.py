import secrets
import hashlib
from datetime import datetime
from functools import wraps
from flask import request, jsonify
from database import get_db
from config import API_KEY_HEADER, DEFAULT_API_KEY

def generate_api_key():
    return secrets.token_urlsafe(32)

def hash_api_key(key):
    return hashlib.sha256(key.encode()).hexdigest()

def create_api_key(name):
    key = generate_api_key()
    key_hash = hash_api_key(key)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO api_keys (key, name)
            VALUES (?, ?)
        ''', (key_hash, name))
        conn.commit()
    
    return key

def verify_api_key(key):
    if key == DEFAULT_API_KEY:
        return True
    
    key_hash = hash_api_key(key)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM api_keys 
            WHERE key = ? AND enabled = 1
        ''', (key_hash,))
        result = cursor.fetchone()
        
        if result:
            cursor.execute('''
                UPDATE api_keys 
                SET last_used = CURRENT_TIMESTAMP 
                WHERE key = ?
            ''', (key_hash,))
            conn.commit()
            return True
    
    return False

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get(API_KEY_HEADER)
        
        if not api_key:
            api_key = request.args.get('api_key')
        
        if not api_key:
            return jsonify({
                'success': False,
                'error': 'API key required',
                'message': f'Provide API key in {API_KEY_HEADER} header or api_key parameter'
            }), 401
        
        if not verify_api_key(api_key):
            return jsonify({
                'success': False,
                'error': 'Invalid API key'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def get_all_api_keys():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, name, created_at, last_used, enabled 
            FROM api_keys
            ORDER BY created_at DESC
        ''')
        return [dict(row) for row in cursor.fetchall()]

def revoke_api_key(key_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE api_keys 
            SET enabled = 0 
            WHERE id = ?
        ''', (key_id,))
        conn.commit()

if __name__ == '__main__':
    from database import init_database
    init_database()
    
    new_key = create_api_key("Test Key")
    print(f"Generated API Key: {new_key}")
    print(f"Verification: {verify_api_key(new_key)}")
