from flask import Flask
from flask_cors import CORS
from app.routes.board_brain import board_brain_bp
from app.board_brain import BoardBrain
import os

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    
    app.secret_key = os.urandom(24)  # TODO: Change this to a secure secret key in production
    app.config['SESSION_COOKIE_SECURE'] = True  # Only send cookies over HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access to cookies
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
    
    app.board_brain = BoardBrain()
    app.register_blueprint(board_brain_bp)

    return app