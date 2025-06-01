from functools import wraps
from typing import Callable, Type

from flask import current_app, jsonify, request

from app.utils.auth import get_token_from_auth_header, get_user_id_from_auth_header, validate_jwt


def validate_auth_token(f):
    """
    Decorator to check if the request has a valid auth token.
    Returns an appropriate error response if the token is invalid or missing.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_auth_header()
        validate_jwt(token)
        return f(*args, **kwargs)

    return decorated


def validate_json_body(**field_types: Type) -> Callable:
    """
    Decorator to check that a request contains a valid JSON body 
    with required fields of correct types.
    If validation fails, returns an appropriate error response.
    
    Args:
        **field_types: Keyword arguments mapping field names to their expected types.
                      Example: validate_json_body(name=str, age=int, scores=list)
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check content type
            if not request.is_json:
                return jsonify({"error": "Content-Type must be application/json"}), 415

            # Get and validate JSON data
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body must be a JSON object"}), 400

            # Check for missing fields
            missing_fields = [field for field in field_types if field not in data]
            if missing_fields:
                return jsonify({
                    "error": f"Request missing required fields: {', '.join(missing_fields)}"
                }), 400

            # Validate field types
            type_errors = []
            for field, expected_type in field_types.items():
                value = data[field]
                if not isinstance(value, expected_type):
                    type_errors.append(
                        f"Field '{field}' must be of type {expected_type.__name__}, "
                        f"got {type(value).__name__}"
                    )

            if type_errors:
                return jsonify({
                    "error": f"Field type validation failed:\n{'\n'.join(type_errors)}"
                }), 400

            return f(*args, **kwargs)

        return decorated_function

    return decorator


def check_daily_token_limit(f):
    """
    Decorator to check if a user has exceeded their daily token limit.
    Returns an error response if the limit has been exceeded.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_user_id_from_auth_header()
        if current_app.orchestrator.user_has_exceeded_daily_token_limit(user_id):
            return jsonify({"error": "You have run out of free messages for today. Please come back again tomorrow."}), 403

        return f(*args, **kwargs)

    return decorated
