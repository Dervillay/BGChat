from typing import Optional, Any, Dict
from flask import jsonify, Response


class APIException(Exception):
    """Base exception for API errors."""
    
    def __init__(self, message: str, status_code: int = 500, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}
    
    def to_response(self) -> Response:
        """Convert exception to Flask response."""
        response_data = {"error": self.message}
        if self.details:
            response_data.update(self.details)
        return jsonify(response_data), self.status_code


class AuthenticationError(APIException):
    """Raised when authentication fails."""
    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 401, details)


class AuthorizationError(APIException):
    """Raised when authorization fails."""
    def __init__(self, message: str = "Authorization failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 403, details)


class ValidationError(APIException):
    """Raised when input validation fails."""
    def __init__(self, message: str = "Validation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 400, details)


class ResourceNotFoundError(APIException):
    """Raised when a requested resource is not found."""
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 404, details)


class RateLimitError(APIException):
    """Raised when rate limits are exceeded."""
    def __init__(self, message: str = "Rate limit exceeded", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 429, details)


class TokenLimitError(APIException):
    """Raised when daily token limits are exceeded."""
    def __init__(self, message: str = "Daily token limit exceeded", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, 403, details) 