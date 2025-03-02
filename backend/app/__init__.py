from flask import Flask
from flask_cors import CORS
from app.routes.board_brain import board_brain_bp
from app.board_brain import BoardBrain
def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.board_brain = BoardBrain()
    app.register_blueprint(board_brain_bp)

    return app