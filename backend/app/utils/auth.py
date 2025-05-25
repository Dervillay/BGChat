import json
from os import environ as env
from functools import wraps

import jwt
import requests
from dotenv import find_dotenv, load_dotenv
from flask import request, jsonify

from app.config.constants import DEFAULT_TIMEOUT_SECONDS

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

AUTH0_DOMAIN = env.get("AUTH0_DOMAIN")
AUTH0_AUDIENCE = env.get("AUTH0_AUDIENCE")
ALGORITHM = env.get("ALGORITHM")

def get_token_from_auth_header():
    """
    Extracts the JWT token from the Authorization header.
    Raises an AuthError if the header is missing or invalid.
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

def validate_jwt(token):
    """
    Validates the JWT token against the Auth0 JWKS.
    Raises an AuthError if the token is invalid.
    """
    # TODO: Implement caching of JWKS with expiry of one hour
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    jwks_response = requests.get(jwks_url, timeout=DEFAULT_TIMEOUT_SECONDS)
    jwks_response.raise_for_status()
    jwks = jwks_response.json()

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
            algorithms=[ALGORITHM],
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
    except Exception as e:
        return jsonify({"error": f"Invalid token: {str(e)}"}), 401

def get_user_id_from_auth_header() -> str:
    """
    Extract the user's ID from the token in the request's Authorization header.

    Note: This function does not validate the token, so should only be used
    in routes protected by the `@requires_auth` decorator.
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

def requires_auth(f):
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
