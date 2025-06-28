import os

from flask import Flask
from flask_cors import CORS

from app.chat_orchestrator import ChatOrchestrator
from app.routes.orchestrator import orchestrator_bp
from config import config


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
    )

    app.config.from_object(loaded_config)
    app.orchestrator = ChatOrchestrator(config=loaded_config)
    app.register_blueprint(orchestrator_bp)

    return app
