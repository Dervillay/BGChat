"""
API routes for interacting with the board game rulebook chat orchestrator.
"""
import logging
import os
import json
import sys

from flask import (
    Blueprint,
    request,
    current_app,
    Response,
    stream_with_context,
    send_from_directory,
)

from app.config.paths import RULEBOOKS_PATH
from app.utils.decorators import check_daily_token_limit, validate_auth_token, validate_json_body
from app.utils.responses import success_response, validation_error, not_found_error, internal_error

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

orchestrator_bp = Blueprint("orchestrator", __name__)


@orchestrator_bp.route("/known-board-games", methods=["GET"])
@validate_auth_token
def get_known_board_games():
    try:
        board_games = current_app.orchestrator.get_known_board_games()
        return success_response(data=board_games)
    except Exception as e:
        logger.error("Error getting board games: %s", str(e))
        return internal_error("Failed to retrieve board games")


@orchestrator_bp.route("/message-history", methods=["POST"])
@validate_json_body(board_game=str)
@validate_auth_token
def get_message_history():
    try:
        data = request.get_json()
        board_game = data["board_game"]

        if board_game not in current_app.orchestrator.get_known_board_games():
            return validation_error("Unrecognised board game")

        message_history = current_app.orchestrator.get_message_history(request.user_id, board_game)

        return success_response(data=message_history)
    except Exception as e:
        logger.error("Error getting message history: %s", str(e))
        return internal_error("Failed to retrieve message history")


@orchestrator_bp.route("/pdfs/<path:filepath>")
@validate_auth_token
def serve_pdf(filepath: str):
    logger.info("=== PDF REQUEST START ===")
    logger.info("Requested filepath: %s", filepath)
    logger.info("RULEBOOKS_PATH: %s", RULEBOOKS_PATH)
    logger.info("Current working directory: %s", os.getcwd())
    logger.info("Python executable: %s", sys.executable)
    logger.info("Python version: %s", sys.version)

    try:
        # Security: Prevent path traversal attacks with comprehensive validation
        normalized_filepath = os.path.normpath(filepath)
        logger.info("Normalized filepath: %s", normalized_filepath)

        # Security check: ensure the normalized path doesn't contain path traversal attempts
        if '..' in normalized_filepath or normalized_filepath.startswith('/') or normalized_filepath.startswith('\\'):
            logger.warning("Path traversal attempt detected: %s", filepath)
            return validation_error("Invalid file path")

        # Ensure the path is within the rulebooks directory using realpath
        full_path = os.path.join(RULEBOOKS_PATH, normalized_filepath)
        real_path = os.path.realpath(full_path)
        rulebooks_real_path = os.path.realpath(RULEBOOKS_PATH)

        logger.info("Full path: %s", full_path)
        logger.info("Real path: %s", real_path)
        logger.info("Rulebooks real path: %s", rulebooks_real_path)
        logger.info("Full path exists: %s", os.path.exists(full_path))
        logger.info("Real path exists: %s", os.path.exists(real_path))

        # Security check: ensure the real path is still within RULEBOOKS_PATH
        if not real_path.startswith(rulebooks_real_path):
            logger.warning("Path traversal attempt detected (realpath): %s -> %s", filepath, real_path)
            return validation_error("Invalid file path")

        # Check if file exists and is a PDF
        if not os.path.exists(real_path):
            logger.warning("File not found: %s", real_path)
            # Log directory contents to help debug
            parent_dir = os.path.dirname(real_path)
            logger.info("Parent directory: %s", parent_dir)
            if os.path.exists(parent_dir):
                logger.info("Parent directory contents:")
                for item in os.listdir(parent_dir):
                    logger.info("  %s", item)
            else:
                logger.warning("Parent directory does not exist: %s", parent_dir)
            return not_found_error("File not found")

        if not real_path.lower().endswith('.pdf'):
            logger.warning("Invalid file type requested: %s", real_path)
            return validation_error("Invalid file type")

        # Use the real path for serving the file
        directory = os.path.dirname(real_path)
        filename = os.path.basename(real_path)

        logger.info("Serving from directory: %s", directory)
        logger.info("Serving filename: %s", filename)
        logger.info("File size: %s bytes", os.path.getsize(real_path))

        response = send_from_directory(
            directory,
            filename,
            mimetype="application/pdf",
            as_attachment=False,
        )
        
        logger.info("=== PDF REQUEST SUCCESS ===")
        return response
        
    except Exception as e:
        logger.error("=== PDF REQUEST ERROR ===")
        logger.error("Error serving PDF: %s", str(e))
        logger.error("Exception type: %s", type(e).__name__)
        import traceback
        logger.error("Full traceback: %s", traceback.format_exc())
        return internal_error("Error serving file")


@orchestrator_bp.route("/determine-board-game", methods=["POST"])
@validate_json_body(question=str)
@check_daily_token_limit
@validate_auth_token
def determine_board_game():
    try:
        data = request.get_json()
        question = data["question"]
        board_game = current_app.orchestrator.determine_board_game(request.user_id, question)

        return success_response(data=board_game)
    except Exception as e:
        logger.error("Error determining board game: %s", str(e))
        return internal_error("Failed to determine board game")


@orchestrator_bp.route("/ask-question", methods=["POST"])
@validate_json_body(question=str, board_game=str)
@check_daily_token_limit
@validate_auth_token
def ask_question():
    try:
        data = request.get_json()
        question = data["question"]
        board_game = data["board_game"]

        if board_game not in current_app.orchestrator.get_known_board_games():
            return validation_error("Unrecognised board game")

        logger.info("Received question from user %s for %s", request.user_id, board_game)

        def generate():
            try:
                response = current_app.orchestrator.ask_question(request.user_id, board_game, question)
                for chunk in response:
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                logger.error("Error in streaming response: %s", str(e))
                yield f"data: {json.dumps({'error': 'An error occurred while processing your question'})}\n\n"

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
    except Exception as e:
        logger.error("Error asking question: %s", str(e))
        return internal_error("Failed to process question")


@orchestrator_bp.route("/delete-messages-from-index", methods=["POST"])
@validate_json_body(board_game=str, index=int)
@validate_auth_token
def delete_messages_from_index():
    try:
        data = request.get_json()
        board_game = data["board_game"]
        index = data["index"]

        if board_game not in current_app.orchestrator.get_known_board_games():
            return validation_error("Unrecognised board game")
        
        if index < 0:
            return validation_error("Index must be non-negative")

        current_app.orchestrator.delete_messages_from_index(request.user_id, board_game, index)

        return success_response()
    except Exception as e:
        logger.error("Error deleting messages: %s", str(e))
        return internal_error("Failed to delete messages")


@orchestrator_bp.route("/clear-message-history", methods=["POST"])
@validate_json_body(board_game=str)
@validate_auth_token
def clear_message_history():
    try:
        data = request.get_json()
        board_game = data["board_game"]

        if board_game not in current_app.orchestrator.get_known_board_games():
            return validation_error("Unrecognised board game")

        current_app.orchestrator.clear_message_history(request.user_id, board_game)

        return success_response()
    except Exception as e:
        logger.error("Error clearing message history: %s", str(e))
        return internal_error("Failed to clear message history")


@orchestrator_bp.route("/debug/filesystem", methods=["GET"])
def debug_filesystem():
    """Debug endpoint to inspect the file system structure on Railway."""
    logger.info("=== FILESYSTEM DEBUG REQUEST ===")
    
    debug_info = {
        "current_working_directory": os.getcwd(),
        "python_executable": sys.executable,
        "python_version": sys.version,
        "rulebooks_path": RULEBOOKS_PATH,
        "rulebooks_path_exists": os.path.exists(RULEBOOKS_PATH),
        "current_directory_contents": [],
        "rulebooks_contents": [],
        "resources_directory_exists": os.path.exists("resources"),
        "app_directory_exists": os.path.exists("app"),
        "config_directory_exists": os.path.exists("app/config"),
    }
    
    # List current directory contents
    try:
        debug_info["current_directory_contents"] = os.listdir(".")
    except Exception as e:
        debug_info["current_directory_contents_error"] = str(e)
    
    # List rulebooks directory contents if it exists
    if os.path.exists(RULEBOOKS_PATH):
        try:
            for item in os.listdir(RULEBOOKS_PATH):
                item_path = os.path.join(RULEBOOKS_PATH, item)
                if os.path.isdir(item_path):
                    pdfs = [f for f in os.listdir(item_path) if f.endswith('.pdf')]
                    debug_info["rulebooks_contents"].append({
                        "directory": item,
                        "pdfs": pdfs
                    })
                elif item.endswith('.pdf'):
                    debug_info["rulebooks_contents"].append({
                        "file": item
                    })
        except Exception as e:
            debug_info["rulebooks_contents_error"] = str(e)
    
    # Check if resources directory exists and list its contents
    if os.path.exists("resources"):
        try:
            debug_info["resources_contents"] = os.listdir("resources")
            if os.path.exists("resources/rulebooks"):
                debug_info["resources_rulebooks_contents"] = os.listdir("resources/rulebooks")
        except Exception as e:
            debug_info["resources_contents_error"] = str(e)
    
    logger.info("Debug info: %s", debug_info)
    return success_response(data=debug_info)


# Global error handlers
@orchestrator_bp.errorhandler(404)
def resource_not_found(e):
    return not_found_error("Resource not found")


@orchestrator_bp.errorhandler(405)
def method_not_allowed(e):
    return validation_error("Method not allowed", status_code=405)


@orchestrator_bp.errorhandler(500)
def internal_server_error(e):
    logger.error("Internal server error: %s", str(e))
    return internal_error("Internal server error")


@orchestrator_bp.errorhandler(Exception)
def unexpected_error(e):
    logger.error("An unexpected error occurred: %s", str(e))
    return internal_error("An unexpected error occurred")
