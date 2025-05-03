from flask import Flask
from flask_cors import CORS
from app.routes.chatbot import chatbot_bp
from app.chatbot import Chatbot
import os

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)
    
    app.secret_key = os.urandom(24)  # TODO: Change this to a secure secret key in production
    app.config['SESSION_COOKIE_SECURE'] = True  # Only send cookies over HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent JavaScript access to cookies
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # CSRF protection
    
    app.chatbot = Chatbot()
    app.register_blueprint(chatbot_bp)

    return app