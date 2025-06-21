import os

from flask import Flask
from flask_cors import CORS

from app.chat_orchestrator import ChatOrchestrator
from app.routes.orchestrator import orchestrator_bp
from config import config


def create_app(config_name=None):
    app = Flask(__name__)

    # Load configuration
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app.config.from_object(config[config_name]())

    CORS(
        app,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
    )

    # Register blueprints
    app.register_blueprint(orchestrator_bp)

    # Initialize orchestrator
    app.orchestrator = ChatOrchestrator()

    return app
