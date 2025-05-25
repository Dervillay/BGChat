from functools import wraps
from typing import Callable, Type

from flask import jsonify, request

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
                    "error": f"Field type validation failed: {', '.join(type_errors)}"
                }), 400

            return f(*args, **kwargs)

        return decorated_function

    return decorator
