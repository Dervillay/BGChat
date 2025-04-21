from flask import Blueprint, request, jsonify, session
import bcrypt
from functools import wraps
import json
import os

auth_bp = Blueprint('auth', __name__)

# TODO: Replace with database in production
def load_users():
    file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'resources', 'users.json')
    with open(file_path, 'r') as f:
        return json.load(f)

users = load_users()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
        
    user = users.get(username)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401
        
    session['user_id'] = username
    return jsonify({"message": "Logged in successfully"})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"})

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({"authenticated": True, "username": session['user_id']})
    return jsonify({"authenticated": False}), 401 