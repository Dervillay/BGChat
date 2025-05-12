import json
from os import environ as env
from functools import wraps

import jwt
import requests
from dotenv import find_dotenv, load_dotenv
from flask import request
from app.config.constants import DEFAULT_TIMEOUT_SECONDS

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

AUTH0_DOMAIN = env.get("AUTH0_DOMAIN")
AUTH0_AUDIENCE = env.get("AUTH0_AUDIENCE")
ALGORITHM = env.get("ALGORITHM")

class AuthError(Exception):
    """
    Custom exception class for auth errors.
    """
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

def get_token_from_auth_header():
    """
    Extracts the JWT token from the Authorization header.
    Raises an AuthError if the header is missing or invalid.
    """
    auth_header = request.headers.get("Authorization", None)

    if not auth_header:
        raise AuthError("Authorization header expected but not found", 401)

    parts = auth_header.split()

    if parts[0].lower() != "bearer":
        raise AuthError("Authorization header must start with 'Bearer'", 401)
    if len(parts) == 1:
        raise AuthError("Token not found", 401)
    if len(parts) > 2:
        raise AuthError("Authorization header must be Bearer token", 401)

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
        raise AuthError("Invalid header: No KID", 401)
   
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
        raise AuthError("Unable to find appropriate key", 401)
   
    try:
        jwt.decode(
            token,
            jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(rsa_key)),
            algorithms=[ALGORITHM],
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
    except Exception as e:
        raise AuthError(f"Invalid token: {str(e)}", 401) from e

def requires_auth(f):
    """
    Decorator to check if the request has a valid auth token.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_auth_header()
        validate_jwt(token)
        return f(*args, **kwargs)
    
    return decorated