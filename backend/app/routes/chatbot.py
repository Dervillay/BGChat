from flask import Blueprint, request, jsonify, send_from_directory, current_app, Response, stream_with_context
from app.config.paths import RULEBOOKS_PATH
from app.utils.auth import AuthError, requires_auth
from functools import wraps
import logging
import os
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

chatbot_bp = Blueprint("chatbot", __name__)


def validate_question(f):
    """
    Decorator to validate incoming message requests.
    Ensures requests have required JSON format and message field.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                "error": "Content-Type must be application/json"
            }), 415
        
        data = request.get_json()
        if not data or "question" not in data:
            return jsonify({
                "error": "Request must include a question field"
            }), 400
            
        if not isinstance(data["question"], str) or not data["question"].strip():
            return jsonify({
                "error": "Question must be a non-empty string"
            }), 400
            
        return f(*args, **kwargs)
    return decorated_function


@chatbot_bp.route("/known-board-games", methods=["GET"])
# @requires_auth
def get_known_board_games():
    return jsonify(current_app.chatbot.known_board_games), 200


@chatbot_bp.route("/selected-board-game", methods=["GET"])
def get_selected_board_game():
    logger.info("Getting selected board games")
    return jsonify(current_app.chatbot.selected_board_game), 200


@chatbot_bp.route("/set-selected-board-game", methods=["POST"])
def set_selected_board_game():
    data = request.get_json()
    if not data or "selected_board_game" not in data:
        return jsonify({"error": "Missing 'selected_board_game' in request"}), 400
    
    logger.info(f"Setting selected board game to: {data["selected_board_game"]}")
    current_app.chatbot.set_selected_board_game(data["selected_board_game"])
    return jsonify({"success": True}), 200


@chatbot_bp.route("/chat-history", methods=["GET"])
def get_chat_history():
    currently_selected_board_game = current_app.chatbot.selected_board_game
    return jsonify(current_app.chatbot.get_user_facing_message_history(currently_selected_board_game)), 200


@chatbot_bp.route("/pdfs/<path:filepath>")
def serve_pdf(filepath):
    logger.info(f"Attempting to serve PDF at: {filepath}")
    directory = os.path.join(RULEBOOKS_PATH, os.path.dirname(filepath))
    filename = os.path.basename(filepath)
    
    return send_from_directory(
        directory,
        filename,
        mimetype="application/pdf",
        as_attachment=False
        )


@chatbot_bp.route("/ask-question", methods=["GET"])
def ask_question():
    """
    Stream a response to a question about board game rules.
    
    Query parameters:
    - question: The question about board game rules
    
    Returns a stream of text chunks as Server-Sent Events.
    """
    question = request.args.get("question")
    if not question:
        return jsonify({"error": "Missing question parameter in request"}), 400
        
    logger.info(f"Received streaming question: {question}")
    
    def generate():
        for chunk in current_app.chatbot.ask_question(question):
            yield f"data: {json.dumps({"chunk": chunk})}\n\n"
        yield f"data: {json.dumps({"done": True})}\n\n"
    
    response = Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )
    return response


@chatbot_bp.errorhandler(AuthError)
def handle_auth_error(exception):
    response = jsonify(exception.error)
    response.status_code = exception.status_code
    return response


@chatbot_bp.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found: " + str(e)}), 404


@chatbot_bp.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed: " + str(e)}), 405


@chatbot_bp.errorhandler(500)
def internal_server_error(e):
    return jsonify({"error": "Internal server error: " + str(e)}), 500


@chatbot_bp.errorhandler(Exception)
def handle_exception(e):
    logger.error("An unexpected error occurred: %s", str(e))
    return jsonify({"error": "An unexpected error occurred: " + str(e)}), 500
