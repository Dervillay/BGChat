from flask import Blueprint, request, jsonify, current_app
from app.board_brain import BoardBrain
from functools import wraps
import logging


board_brain_bp = Blueprint('board_brain', __name__)
board_brain = BoardBrain()

logger = logging.getLogger(__name__)

def validate_question(f):
    """
    Decorator to validate incoming message requests.
    Ensures requests have required JSON format and message field.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type must be application/json'
            }), 415
        
        data = request.get_json()
        if not data or 'question' not in data:
            return jsonify({
                'error': 'Request must include a question field'
            }), 400
            
        if not isinstance(data['question'], str) or not data['question'].strip():
            return jsonify({
                'error': 'Question must be a non-empty string'
            }), 400
            
        return f(*args, **kwargs)
    return decorated_function

@board_brain_bp.route('/determine-board-game', methods=['POST'])
@validate_question
def determine_board_game():
    """
    Endpoint to determine which board game the user is asking about.
    
    Expected request format:
    {
        "question": "Can you help me with Monopoly rules?"
    }
    
    Returns:
    {
        "success": true/false,
        "response": "Monopoly"/"Sorry, I was unable to determine..."
    }
    """
    try:
        data = request.get_json()
        question = data['question'].strip()
        
        logger.info(f"Determining board game for question: {question}")
        
        response = board_brain.determine_board_game(question)
        success = response in board_brain.known_board_games
        
        return jsonify({
            'success': success,
            'response': response
        })
        
    except Exception as e:
        logger.error(f"Error in determine_board_game: {str(e)}")
        return jsonify({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500

@board_brain_bp.route('/known-board-games', methods=['GET'])
def get_known_board_games():
    """
    Endpoint to get list of known board games
    
    Returns:
    {
        "response": ["Monopoly", "Catan", ...]
    }
    """
    try:
        logger.info(f"Getting known board games")
        return jsonify({
            'response': board_brain.known_board_games
        })
        
    except Exception as e:
        logger.error(f"Error in determine_board_game: {str(e)}")
        return jsonify({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500

@board_brain_bp.route('/selected-board-game', methods=['GET'])
def get_selected_board_game():
    """
    Endpoint to get currently selected board game
    """
    return jsonify({
        'response': board_brain.selected_board_game
    })

@board_brain_bp.route('/set-selected-board-game', methods=['POST'])
def set_selected_board_game():
    """
    Endpoint to set selected board game

    Expected request format:
    {
        "selected_board_game": "board game name"
    }
    
    Returns:
    {
        "success": True/False
    }
    """
    try:
        data = request.get_json()
        logger.info(f'Setting selected board game to: {data["selected_board_game"]}')
        board_brain.set_selected_board_game(data["selected_board_game"])
        return jsonify({
            'success': True
        })
        
    except Exception as e:
        logger.error(f"Error in set selected board game: {str(e)}")
        return jsonify({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500

@board_brain_bp.route('/chat-history', methods=['GET'])
def get_chat_history():
    """
    Endpoint to get chat history for the currently selected board game

    Returns:
    {
        "response": [
            {"role": "user", "content": "How many houses can I put on Park Place?"},
            {"role": "assistant", "content": "You can put 4 houses on Park Place."}
        ]
    }
    """
    try:
        return jsonify({
            'response': board_brain.get_message_history(board_brain.selected_board_game)
        })
    except Exception as e:
        logger.error(f"Error getting chat history for {board_brain.selected_board_game}: {str(e)}")
        return jsonify({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500

@board_brain_bp.route('/ask-question', methods=['POST'])
@validate_question
def ask():
    """
    Endpoint to ask questions about board games.
    
    Expected request format:
    {
        "question": "How many houses can I put on Park Place?"
    }
    
    Returns:
    {
        "response": "answer to the question"
    }
    """
    try:
        data = request.get_json()
        question = data['question'].strip()
        
        logger.info(f"Received question: {question}")
        
        # TODO: Refactor this logic into the BoardBrain class
        if board_brain.selected_board_game is None:
            response = board_brain.determine_board_game(question)
            
            if response not in board_brain.known_board_games:
                return jsonify({
                    'response': response,
                })
        
        response = board_brain.ask_question(question)

        return jsonify({
            'response': response
        })
        
    except Exception as e:
        logger.error(f"Error in ask endpoint: {str(e)}")

        return jsonify({
            'error': 'An unexpected error occurred',
            'details': str(e)
        }), 500

@board_brain_bp.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

@board_brain_bp.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed'}), 405

@board_brain_bp.errorhandler(500)
def internal_server_error(e):
    return jsonify({'error': 'Internal server error'}), 500