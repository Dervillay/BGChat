from typing import Any, Dict, Optional
from flask import jsonify, Response


def success_response(data: Any = None, status_code: int = 200) -> Response:
    """Create a standardized success response."""
    return jsonify(data), status_code


def error_response(message: str, status_code: int = 400, details: Optional[Dict[str, Any]] = None) -> Response:
    """Create a standardized error response."""
    response_data = {"error": message}
    if details:
        response_data.update(details)
    return jsonify(response_data), status_code


def validation_error(message: str, field_errors: Optional[Dict[str, str]] = None) -> Response:
    """Create a validation error response."""
    details = {"field_errors": field_errors} if field_errors else None
    return error_response(message, 400, details)


def authentication_error(message: str = "Authentication failed") -> Response:
    """Create an authentication error response."""
    return error_response(message, 401)


def authorization_error(message: str = "Authorization failed") -> Response:
    """Create an authorization error response."""
    return error_response(message, 403)


def not_found_error(message: str = "Resource not found") -> Response:
    """Create a not found error response."""
    return error_response(message, 404)


def rate_limit_error(message: str = "Rate limit exceeded") -> Response:
    """Create a rate limit error response."""
    return error_response(message, 429)


def internal_error(message: str = "Internal server error") -> Response:
    """Create an internal server error response."""
    return error_response(message, 500)
