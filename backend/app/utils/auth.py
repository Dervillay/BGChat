import json
import time
import threading

import jwt
import requests
from flask import request, jsonify, current_app

from app.config.constants import DEFAULT_TIMEOUT_SECONDS


_jwks_cache = {}
_jwks_cache_lock = threading.Lock()
JWKS_CACHE_DURATION = 3600


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

    Note: This function does not validate the token, so should only be used
    in routes already protected by the `@validate_auth_token` decorator.
    """
    try:
        token = get_token_from_auth_header()
        unverified_claims = jwt.decode(
            token,
            options={"verify_signature": False}
        )

        if "sub" not in unverified_claims:
            return jsonify({"error": "Token does not contain a user ID"}), 401

        return unverified_claims["sub"]

    except Exception as e:
        return jsonify({"error": f"Error extracting user ID: {str(e)}"}), 401


def get_token_from_auth_header() -> str:
    """
    Extracts the JWT token from the Authorization header.
    Returns an appropriate error response if the header is missing or invalid.
    """
    auth_header = request.headers.get("Authorization", None)

    if not auth_header:
        return jsonify({"error": "Authorization header expected but not found"}), 401

    parts = auth_header.split()

    if parts[0].lower() != "bearer":
        return jsonify({"error": "Authorization header must start with 'Bearer'"}), 401
    if len(parts) == 1:
        return jsonify({"error": "Token not found"}), 401
    if len(parts) > 2:
        return jsonify({"error": "Authorization header must be Bearer token"}), 401

    return parts[1]


def validate_jwt(token: str) -> None:
    """
    Validates the JWT token against the Auth0 JWKS.
    Returns an appropriate error response if the token is invalid.
    """
    auth0_domain = current_app.config.get('AUTH0_DOMAIN')
    auth0_audience = current_app.config.get('AUTH0_AUDIENCE')
    algorithm = current_app.config.get('ALGORITHM', 'RS256')

    if not auth0_domain or not auth0_audience:
        return jsonify({"error": "Auth0 configuration is not properly set up"}), 500

    jwks = _get_cached_jwks(auth0_domain)

    if jwks is None:
        jwks_url = f"https://{auth0_domain}/.well-known/jwks.json"
        jwks_response = requests.get(jwks_url, timeout=DEFAULT_TIMEOUT_SECONDS)
        jwks_response.raise_for_status()
        jwks = jwks_response.json()

        _set_cached_jwks(auth0_domain, jwks)

    unverified_header = jwt.get_unverified_header(token)
    if "kid" not in unverified_header:
        return jsonify({"error": "Invalid header: No KID"}), 401

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
        return jsonify({"error": "Unable to find appropriate key"}), 401

    try:
        jwt.decode(
            token,
            jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(rsa_key)),
            algorithms=[algorithm],
            audience=auth0_audience,
            issuer=f"https://{auth0_domain}/"
        )
    except Exception as e:
        return jsonify({"error": f"Invalid token: {str(e)}"}), 401
