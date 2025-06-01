"""
API routes for interacting with the board game rulebook chat orchestrator.
"""
import logging
import os
import json

from flask import (
    Blueprint,
    request,
    jsonify,
    send_from_directory,
    current_app,
    Response,
    stream_with_context,
)

from app.config.paths import RULEBOOKS_PATH
from app.utils.auth import get_user_id_from_auth_header
from app.utils.decorators import check_daily_token_limit, validate_auth_token, validate_json_body

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

orchestrator_bp = Blueprint("orchestrator", __name__)


@orchestrator_bp.route("/known-board-games", methods=["GET"])
@validate_auth_token
def get_known_board_games():
    return jsonify(current_app.orchestrator.known_board_games), 200


@orchestrator_bp.route("/message-history", methods=["POST"])
@validate_json_body(board_game=str)
@validate_auth_token
def get_message_history():
    data = request.get_json()

    board_game = data["board_game"]
    if board_game not in current_app.orchestrator.known_board_games:
        return jsonify({"error": "Unrecognised board game"}), 400

    user_id = get_user_id_from_auth_header()

    message_history = current_app.orchestrator.get_message_history(
        user_id,
        board_game
    )

    return jsonify(message_history), 200


@orchestrator_bp.route("/pdfs/<path:filepath>")
@validate_auth_token
def serve_pdf(filepath: str):
    logger.info("Attempting to serve PDF at: %s", filepath)
    directory = os.path.join(RULEBOOKS_PATH, os.path.dirname(filepath))
    filename = os.path.basename(filepath)

    return send_from_directory(
        directory,
        filename,
        mimetype="application/pdf",
        as_attachment=False,
    )


@orchestrator_bp.route("/determine-board-game", methods=["POST"])
@validate_json_body(question=str)
@check_daily_token_limit
@validate_auth_token
def determine_board_game():
    data = request.get_json()

    question = data["question"]
    if not question.strip():
        return jsonify({"error": "Question must be a non-empty string"}), 400

    user_id = get_user_id_from_auth_header()

    board_game = current_app.orchestrator.determine_board_game(user_id, question)

    return jsonify(board_game), 200


@orchestrator_bp.route("/ask-question", methods=["POST"])
@validate_json_body(question=str, board_game=str)
@check_daily_token_limit
@validate_auth_token
def ask_question():
    data = request.get_json()

    question = data["question"]
    if not question.strip():
        return jsonify({"error": "Question must be a non-empty string"}), 400

    board_game = data["board_game"]
    if board_game not in current_app.orchestrator.known_board_games:
        return jsonify({"error": "Unrecognised board game"}), 400

    user_id = get_user_id_from_auth_header()
    logger.info("Received question from user %s for %s", user_id, board_game)

    def generate():
        response = current_app.orchestrator.ask_question(
            user_id,
            board_game,
            question
        )
        for chunk in response:
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


@orchestrator_bp.route("/delete-messages-from-index", methods=["POST"])
@validate_json_body(board_game=str, index=int)
@validate_auth_token
def delete_messages_from_index():
    data = request.get_json()

    index = data["index"]
    if index < 0:
        return jsonify({"error": "Index must be non-negative"}), 400

    board_game = data["board_game"]
    if board_game not in current_app.orchestrator.known_board_games:
        return jsonify({"error": "Unrecognised board game"}), 400

    user_id = get_user_id_from_auth_header()

    current_app.orchestrator.delete_messages_from_index(
        user_id,
        board_game,
        index
    )

    return jsonify({"success": True}), 200


@orchestrator_bp.route("/clear-message-history", methods=["POST"])
@validate_json_body(board_game=str)
@validate_auth_token
def clear_message_history():
    data = request.get_json()

    board_game = data["board_game"]
    if board_game not in current_app.orchestrator.known_board_games:
        return jsonify({"error": "Unrecognised board game"}), 400

    user_id = get_user_id_from_auth_header()

    current_app.orchestrator.clear_message_history(
        user_id,
        board_game
    )
    return jsonify({"success": True}), 200


@orchestrator_bp.errorhandler(404)
def resource_not_found(e):
    return jsonify({"error": "Resource not found: " + str(e)}), 404


@orchestrator_bp.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed: " + str(e)}), 405


@orchestrator_bp.errorhandler(500)
def internal_server_error(e):
    return jsonify({"error": "Internal server error: " + str(e)}), 500


@orchestrator_bp.errorhandler(Exception)
def unexpected_error(e):
    logger.error("An unexpected error occurred: %s", str(e))
    return jsonify({"error": "An unexpected error occurred: " + str(e)}), 500
