import os

from flask import Flask
from flask_cors import CORS

from app.chat_orchestrator import ChatOrchestrator
from app.routes.orchestrator import orchestrator_bp
from config import config


def create_app(config_name=None):
    app = Flask(__name__)
    CORS(
        app,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
    )

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app_config = config[config_name]()
    app.config.from_object(app_config)

    app.register_blueprint(orchestrator_bp)
    app.orchestrator = ChatOrchestrator(config=app_config)

    return app
