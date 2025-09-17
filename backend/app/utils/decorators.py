from functools import wraps
from typing import Callable, Type
import re

from flask import current_app, request

from app.utils.auth import get_token_from_auth_header, get_user_id_from_auth_header, validate_jwt, AuthenticationError
from app.utils.responses import validation_error, authentication_error, authorization_error


# Input validation patterns
BOARD_GAME_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-_&%$*#:]+$')
QUESTION_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-_.,!?()&%$*#]+$')
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
MAX_QUESTION_LENGTH = 1000
MAX_BOARD_GAME_LENGTH = 100
MAX_EMAIL_LENGTH = 100
MAX_CONTENT_LENGTH = 1000


def _sanitize_string(value: str) -> str:
    """
    Sanitize string input by removing potentially dangerous characters.
    """
    # Remove null bytes and control characters
    sanitized = ''.join(char for char in value if ord(char) >= 32)
    sanitized = sanitized.strip()

    return sanitized


def _validate_board_game(value: str) -> str:
    """
    Validate board game name format and length.
    Raises ValueError if validation fails.
    """
    sanitized = _sanitize_string(value)

    if not sanitized:
        raise ValueError("Board game name cannot be empty")

    if len(sanitized) > MAX_BOARD_GAME_LENGTH:
        raise ValueError(f"Board game name too long (max {MAX_BOARD_GAME_LENGTH} characters)")

    if not BOARD_GAME_PATTERN.match(sanitized):
        raise ValueError("Board game name contains invalid characters")

    return sanitized


def _validate_question(value: str) -> str:
    """
    Validate question format and length.
    Raises ValueError if validation fails.
    """
    sanitized = _sanitize_string(value)

    if not sanitized:
        raise ValueError("Question cannot be empty")

    if len(sanitized) > MAX_QUESTION_LENGTH:
        raise ValueError(f"Question too long (max {MAX_QUESTION_LENGTH} characters)")

    if not QUESTION_PATTERN.match(sanitized):
        raise ValueError("Question contains invalid characters")

    return sanitized


def _validate_email(value: str | None) -> str | None:
    """
    Validate email format.
    Raises ValueError if validation fails.
    """
    if not value:
        return None

    sanitized = _sanitize_string(value)

    if len(sanitized) > MAX_EMAIL_LENGTH:
        return None

    if not EMAIL_PATTERN.match(sanitized):
        raise ValueError("Email format is invalid")

    return sanitized


def validate_auth_token(f):
    """
    Decorator to check if the request has a valid auth token.
    Raises AuthenticationError if the token is invalid or missing.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = get_token_from_auth_header()
            validate_jwt(token)
            request.user_id = get_user_id_from_auth_header()
            return f(*args, **kwargs)
        except AuthenticationError as e:
            return authentication_error(e.message)
        except Exception as e:
            return authentication_error(f"Authentication error: {str(e)}")

    return decorated


def validate_json_body(**field_types: Type) -> Callable:
    """
    Decorator to check that a request contains a valid JSON body 
    with required fields of correct types.
    Raises ValidationError if validation fails.
    
    Args:
        **field_types: Keyword arguments mapping field names to their expected types.
                      Example: validate_json_body(name=str, age=int, scores=list)
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check content type
            if not request.is_json:
                return validation_error("Content-Type must be application/json")

            # Get and validate JSON data
            data = request.get_json()
            if not data:
                return validation_error("Request body must be a JSON object")

            # Check for missing fields
            missing_fields = [field for field in field_types if field not in data]
            if missing_fields:
                return validation_error(
                    f"Request missing required fields: {', '.join(missing_fields)}"
                )

            # Validate field types and sanitize strings
            type_errors = {}
            for field, expected_type in field_types.items():
                value = data[field]
                if not isinstance(value, expected_type):
                    type_errors[field] = f"Must be of type {expected_type.__name__}, got {type(value).__name__}"
                elif type(value) == str:
                    try:
                        if field == 'board_game':
                            data[field] = _validate_board_game(value)
                        elif field == 'question':
                            data[field] = _validate_question(value)
                        elif field == 'email':
                            data[field] = _validate_email(value)
                        else:
                            sanitized = _sanitize_string(value)
                            if len(sanitized) > MAX_CONTENT_LENGTH:
                                raise ValueError(f"Content too long (max {MAX_CONTENT_LENGTH} characters)")
                            data[field] = sanitized
            
                    except ValueError as e:
                        type_errors[field] = str(e)

            if type_errors:
                return validation_error(", ".join(type_errors.values()))

            return f(*args, **kwargs)

        return decorated_function

    return decorator


def check_daily_token_limit(f):
    """
    Decorator to check if a user has exceeded their daily token limit.
    Raises AuthorizationError if the limit has been exceeded.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            user_id = get_user_id_from_auth_header()
            if current_app.orchestrator.user_has_exceeded_daily_token_limit(user_id):
                return authorization_error("You have run out of free messages for today. Please come back again tomorrow.")
            return f(*args, **kwargs)
        except AuthenticationError as e:
            return authorization_error(e.message)
        except Exception as e:
            return authorization_error(f"Authentication error: {str(e)}")

    return decorated
