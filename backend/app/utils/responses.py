from typing import Any, Dict, Optional
from flask import jsonify, Response, current_app


def success_response(data: Any = None, status_code: int = 200) -> Response:
    """Create a standardized success response."""
    return jsonify(data), status_code


def error_response(message: str, status_code: int = 400, details: Optional[Dict[str, Any]] = None) -> Response:
    """Create a standardized error response."""
    # Sanitize error messages in production
    if current_app.config.get('FLASK_ENV') == 'production':
        if status_code >= 500:
            message = "Internal server error"
        elif status_code == 404:
            message = "Resource not found"
        elif status_code == 401:
            message = "Authentication failed"
        elif status_code == 403:
            message = "Authorization failed"
        elif status_code == 429:
            message = "Rate limit exceeded"
        details = None

    response_data = {"error": message}
    if details:
        response_data.update(details)
    return jsonify(response_data), status_code


def validation_error(message: str = "Validation failed") -> Response:
    """Create a validation error response."""
    return error_response(message, 400)


def authentication_error(message: str = "Authentication failed") -> Response:
    """Create an authentication error response."""
    return error_response(message, 401)


def authorization_error(message: str = "Authorization failed") -> Response:
    """Create an authorization error response."""
    return error_response(message, 403)


def not_found_error(message: str = "Resource not found") -> Response:
    """Create a not found error response."""
    return error_response(message, 404)


def internal_error(message: str = "Internal server error") -> Response:
    """Create an internal server error response."""
    return error_response(message, 500)
