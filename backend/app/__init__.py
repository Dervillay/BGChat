import os

from flask import Flask
from flask_cors import CORS

from app.chat_orchestrator import ChatOrchestrator
from app.routes.orchestrator import orchestrator_bp
from config import config


def add_security_headers(response):
    """Add security headers to all responses."""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://*.auth0.com https://api.openai.com;"
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    return response


def create_app():
    app = Flask(__name__)

    flask_env = os.environ.get('FLASK_ENV')
    loaded_config = config[flask_env]()

    allowed_origins = []
    if loaded_config.FRONTEND_URL:
        allowed_origins.append(loaded_config.FRONTEND_URL)
    if flask_env == 'development':
        allowed_origins.append('http://localhost:3000')
        allowed_origins.append('http://127.0.0.1:3000')

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST"],
    )

    app.config.from_object(loaded_config)
    app.orchestrator = ChatOrchestrator(config=loaded_config)
    app.register_blueprint(orchestrator_bp)
    app.after_request(add_security_headers)

    return app
