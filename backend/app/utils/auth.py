from functools import wraps
from flask import request
from dotenv import load_dotenv
import jwt
import json
import os
import requests

load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("API_AUDIENCE")
ALGORITHM = os.getenv("ALGORITHM")

class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

def get_token_from_auth_header():
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        raise AuthError(
            {
                "code": "authorization_header_missing",
                "description": "Authorization header is expected"
            },
            401
        )

    parts = auth_header.split()

    if parts[0].lower() != "bearer":
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must start with Bearer"
            },
            401
        )
    elif len(parts) == 1:
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Token not found"
            },
            401
        )
    elif len(parts) > 2:
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must be Bearer token"
            },
            401
        )

    return parts[1]

def validate_jwt(token):
    # TODO: Implement caching of JWKS with expiry of one hour
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    jwks_response = requests.get(jwks_url)
    jwks = jwks_response.json()
    
    unverified_header = jwt.get_unverified_header(token)
    if "kid" not in unverified_header:
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Invalid header: No KID"
            },
            401
        )
    
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
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Unable to find appropriate key"
            },
            401
        )
    
    try:
        payload = jwt.decode(
            token,
            jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(rsa_key)),
            algorithms=[ALGORITHM],
            audience=API_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )
        payload.verify()
        
    except jwt.ExpiredSignatureError:
        raise AuthError(
            {
                "code": "token_expired",
                "description": "Token expired"
            },
            401
        )
    except jwt.JWTClaimsError:
        raise AuthError(
            {
                "code": "invalid_claims",
                "description": "Invalid claims: check audience and issuer"
            },
            401
        )
    except Exception as e:
        raise AuthError(
            {
                "code": "invalid_token",
                "description": f"Invalid token: {str(e)}"
            },
            401
        )

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