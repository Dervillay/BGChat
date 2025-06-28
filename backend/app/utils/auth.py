import json
import time
import threading
import re

import jwt
import requests
from flask import request, current_app

from app.config.constants import DEFAULT_TIMEOUT_SECONDS


_jwks_cache = {}
_jwks_cache_lock = threading.Lock()
JWKS_CACHE_DURATION = 3600

# User ID validation pattern - Auth0 user IDs are typically in format: auth0|1234567890abcdef
USER_ID_PATTERN = re.compile(r'^[a-zA-Z0-9_\-|]+$')
MAX_USER_ID_LENGTH = 128


class AuthenticationError(Exception):
    """Raised when authentication fails."""
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


def _validate_user_id(user_id: str) -> None:
    """
    Validate user ID format and length.
    Raises ValueError if validation fails.
    """
    if not user_id:
        raise ValueError("User ID cannot be empty")

    if len(user_id) > MAX_USER_ID_LENGTH:
        raise ValueError(f"User ID too long (max {MAX_USER_ID_LENGTH} characters)")

    if not USER_ID_PATTERN.match(user_id):
        raise ValueError("Invalid user ID format")


def _get_cached_jwks(auth0_domain: str) -> dict | None:
    """
    Get JWKS from cache if it's still valid, otherwise return None.
    Thread-safe implementation.
    """
    with _jwks_cache_lock:
        if auth0_domain in _jwks_cache:
            cached_data = _jwks_cache[auth0_domain]
            if time.time() - cached_data['timestamp'] < JWKS_CACHE_DURATION:
                return cached_data['jwks']
            else:
                del _jwks_cache[auth0_domain]
    return None


def _set_cached_jwks(auth0_domain: str, jwks: dict):
    """
    Store JWKS in cache with current timestamp.
    Thread-safe implementation.
    """
    with _jwks_cache_lock:
        _jwks_cache[auth0_domain] = {
            'jwks': jwks,
            'timestamp': time.time()
        }


def get_user_id_from_auth_header() -> str:
    """
    Extract the user's ID from the token in the request's Authorization header.
    Does not validate the token, so must only be used after validate_jwt has been called.
    Raises AuthenticationError if validation fails.
    """
    try:
        token = get_token_from_auth_header()
        unverified_claims = jwt.decode(
            token,
            options={"verify_signature": False}
        )

        if "sub" not in unverified_claims:
            raise AuthenticationError("Token does not contain a user ID")

        user_id = unverified_claims["sub"]

        try:
            _validate_user_id(user_id)
        except ValueError as e:
            raise AuthenticationError(f"Invalid user ID: {str(e)}")

        return user_id

    except AuthenticationError:
        raise
    except Exception as e:
        raise AuthenticationError(f"Error extracting user ID: {str(e)}")


def get_token_from_auth_header() -> str:
    """
    Extracts the JWT token from the Authorization header.
    Raises AuthenticationError if the header is missing or invalid.
    """
    auth_header = request.headers.get("Authorization", None)

    if not auth_header:
        raise AuthenticationError("Authorization header expected but not found")

    parts = auth_header.split()

    if parts[0].lower() != "bearer":
        raise AuthenticationError("Authorization header must start with 'Bearer'")
    if len(parts) == 1:
        raise AuthenticationError("Token not found")
    if len(parts) > 2:
        raise AuthenticationError("Authorization header must be Bearer token")

    return parts[1]


def validate_jwt(token: str) -> None:
    """
    Validates the JWT token against the Auth0 JWKS.
    Raises AuthenticationError if the token is invalid.
    """
    auth0_domain = current_app.config.get('AUTH0_DOMAIN')
    auth0_audience = current_app.config.get('AUTH0_AUDIENCE')
    algorithm = current_app.config.get('ALGORITHM', 'RS256')

    if not auth0_domain or not auth0_audience:
        raise Exception("Auth0 configuration is not properly set up")

    jwks = _get_cached_jwks(auth0_domain)

    if jwks is None:
        jwks_url = f"https://{auth0_domain}/.well-known/jwks.json"
        jwks_response = requests.get(jwks_url, timeout=DEFAULT_TIMEOUT_SECONDS)
        jwks_response.raise_for_status()
        jwks = jwks_response.json()

        _set_cached_jwks(auth0_domain, jwks)

    unverified_header = jwt.get_unverified_header(token)
    if "kid" not in unverified_header:
        raise AuthenticationError("Invalid header: No KID")

    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"]
            }
            break

    if not rsa_key:
        raise AuthenticationError("Unable to find appropriate key")

    try:
        jwt.decode(
            token,
            jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(rsa_key)),
            algorithms=[algorithm],
            audience=auth0_audience,
            issuer=f"https://{auth0_domain}/"
        )
    except Exception as e:
        raise AuthenticationError(f"Invalid token: {str(e)}")
