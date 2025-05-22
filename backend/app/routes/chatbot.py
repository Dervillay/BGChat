"""
API routes for interacting with the chatbot.
"""
import logging
import os
import json

from flask import Blueprint, request, jsonify, send_from_directory, current_app, Response, stream_with_context
from app.config.paths import RULEBOOKS_PATH
from app.utils.auth import AuthError, requires_auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.route("/known-board-games", methods=["GET"])
@requires_auth
def get_known_board_games():
    return jsonify(current_app.chatbot.known_board_games), 200


@chatbot_bp.route("/selected-board-game", methods=["GET"])
@requires_auth
def get_selected_board_game():
    logger.info("Getting selected board game")
    return jsonify(current_app.chatbot.selected_board_game), 200


@chatbot_bp.route("/set-selected-board-game", methods=["POST"])
@requires_auth
def set_selected_board_game():
    data = request.get_json()
    if not data or "selected_board_game" not in data:
        return jsonify({"error": "Missing 'selected_board_game' in request"}), 400
    
    logger.info("Setting selected board game to: %s", data["selected_board_game"])
    current_app.chatbot.set_selected_board_game(data["selected_board_game"])
    return jsonify({"success": True}), 200


@chatbot_bp.route("/chat-history", methods=["GET"])
@requires_auth
def get_chat_history():
    currently_selected_board_game = current_app.chatbot.selected_board_game
    return jsonify(current_app.chatbot.get_user_facing_message_history(currently_selected_board_game)), 200


@chatbot_bp.route("/pdfs/<path:filepath>")
@requires_auth
def serve_pdf(filepath):
    logger.info("Attempting to serve PDF at: %s", filepath)
    directory = os.path.join(RULEBOOKS_PATH, os.path.dirname(filepath))
    filename = os.path.basename(filepath)
    
    return send_from_directory(
        directory,
        filename,
        mimetype="application/pdf",
        as_attachment=False,
    )


@chatbot_bp.route("/ask-question", methods=["POST"])
@requires_auth
def ask_question():
    """
    Stream a response to a question about board game rules.
    
    Request body:
    - question: A question about board game rules
    
    Returns a stream of text chunks.
    """
    if not request.is_json:
        return jsonify({
            "error": "Content-Type must be application/json"
        }), 415

    data = request.get_json()
    if not data or "question" not in data:
        return jsonify({
            "error": "Request missing field 'question'"
        }), 400
        
    question = data["question"]
    if not isinstance(question, str) or not question.strip():
        return jsonify({
            "error": "Question must be a non-empty string"
        }), 400
        
    logger.info("Received streaming question: %s", question)
    
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


@chatbot_bp.route("/delete-messages-from-index", methods=["POST"])
@requires_auth
def delete_messages_from_index():
    data = request.get_json()
    if not data or "index" not in data:
        return jsonify({"error": "Missing 'index' in request"}), 400
    
    index = data["index"]
    current_app.chatbot.delete_messages_from_index(index)

    return jsonify({"success": True}), 200


@chatbot_bp.errorhandler(AuthError)
def handle_auth_error(e):
    return jsonify({"error": e.error}), e.status_code


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
