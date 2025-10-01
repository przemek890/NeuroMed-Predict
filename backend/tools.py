
import datetime
from functools import wraps
from typing import Generator
import jwt
import json
from flask import jsonify, request, current_app
from pymongo import collection
from flask_session import Session
import os

def generate_jwt(session_id: str) -> str:
    payload = {
        'session_id': session_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    } 
    secret_key = current_app.config.get('SECRET_KEY')
    if not secret_key:
        raise ValueError("SECRET_KEY not found in environment variables")
        
    return jwt.encode(payload, secret_key, algorithm='HS256')

def verify_jwt(token: str) -> str | None:
    """
    Verify and decode a JWT token.
    
    Args:
        token (str): The JWT token to verify, should include 'Bearer ' prefix
        
    Returns:
        str | None: The session ID if token is valid, None otherwise
    """
    
    secret_key = current_app.config.get('SECRET_KEY')
    
    if not secret_key:
        raise ValueError("SECRET_KEY not found in environment variables")
    
    try:
        if not token or not token.startswith('Bearer '):
            return None
            
        stripped_token = token.split('Bearer ')[1].strip()
        decoded = jwt.decode(stripped_token, secret_key, algorithms=['HS256'])
        return decoded.get('session_id')
        
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def require_valid_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        session_id = verify_jwt(token)
        
        if not session_id:
            return jsonify({
                "error": "Authentication failed",
                "message": "Invalid or expired token"
            }), 401
            
        return f(session_id, *args, **kwargs)
    return decorated