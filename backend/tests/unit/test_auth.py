"""
Unit tests for authentication utilities.
"""
import pytest
from unittest.mock import Mock, patch
import jwt

from app.utils.auth import (
    JWKS_CACHE_DURATION,
    MAX_USER_ID_LENGTH,
    AuthenticationError,
    _validate_user_id,
    _get_cached_jwks,
    _set_cached_jwks,
    get_token_from_auth_header,
    get_user_id_from_auth_header,
    validate_jwt,
    _jwks_cache,
)
from app.config.constants import (
    ERROR_USER_ID_CANNOT_BE_EMPTY,
    ERROR_USER_ID_TOO_LONG,
    ERROR_INVALID_USER_ID_FORMAT,
    ERROR_AUTHORIZATION_HEADER_EXPECTED_BUT_NOT_FOUND,
    ERROR_AUTHORIZATION_HEADER_MUST_START_WITH_BEARER,
    ERROR_TOKEN_NOT_FOUND,
    ERROR_AUTHORIZATION_HEADER_MUST_BE_BEARER_TOKEN,
    ERROR_TOKEN_DOES_NOT_CONTAIN_USER_ID,
    ERROR_INVALID_USER_ID,
    ERROR_INVALID_HEADER_NO_KID,
    ERROR_UNABLE_TO_FIND_APPROPRIATE_KEY,
    ERROR_INVALID_TOKEN,
    ERROR_AUTH0_CONFIGURATION_NOT_PROPERLY_SET_UP,
)


class TestUserIdValidation:
    """Test user ID validation logic."""

    def test_valid_user_id(self):
        """Test validation passes for valid user IDs."""
        valid_ids = [
            "auth0|1234567890",
            "google-oauth2|123456",
            "user123",
            "test-user_123",
        ]
        for user_id in valid_ids:
            _validate_user_id(user_id)

    def test_empty_user_id(self):
        """Test validation fails for empty user ID."""
        with pytest.raises(ValueError, match=ERROR_USER_ID_CANNOT_BE_EMPTY):
            _validate_user_id("")

    def test_user_id_too_long(self):
        """Test validation fails for overly long user ID."""
        long_id = "a" * (MAX_USER_ID_LENGTH + 1)
        with pytest.raises(ValueError, match=ERROR_USER_ID_TOO_LONG):
            _validate_user_id(long_id)

    def test_invalid_user_id_format(self):
        """Test validation fails for invalid characters."""
        with pytest.raises(ValueError, match=ERROR_INVALID_USER_ID_FORMAT):
            _validate_user_id("user@domain.com")


class TestJWKSCache:
    """Test JWKS caching functionality."""

    def setup_method(self):
        """Clear cache before each test."""
        _jwks_cache.clear()

    def test_cache_miss(self):
        """Test cache returns None when empty."""
        result = _get_cached_jwks("test.auth0.com")
        assert result is None

    def test_cache_hit(self):
        """Test cache returns stored value."""
        domain = "test.auth0.com"
        jwks = {"keys": [{"kid": "test"}]}
        _set_cached_jwks(domain, jwks)

        result = _get_cached_jwks(domain)
        assert result == jwks

    @patch('time.time')
    def test_cache_expiration(self, mock_time):
        """Test cache expires after timeout."""
        jwks = {"keys": [{"kid": "test"}]}

        # Set cache at time 0
        mock_time.return_value = 0
        _set_cached_jwks("test.auth0.com", jwks)

        # Check before expiration
        mock_time.return_value = JWKS_CACHE_DURATION - 1
        assert _get_cached_jwks("test.auth0.com") == jwks

        # Check after expiration
        mock_time.return_value = JWKS_CACHE_DURATION + 1
        assert _get_cached_jwks("test.auth0.com") is None


class TestGetTokenFromAuthHeader:
    """Test token extraction from Authorization header."""

    def test_missing_auth_header(self, app):
        """Test error when Authorization header is missing."""
        with app.test_request_context():
            with pytest.raises(AuthenticationError, match=ERROR_AUTHORIZATION_HEADER_EXPECTED_BUT_NOT_FOUND):
                get_token_from_auth_header()

    def test_invalid_bearer_format(self, app):
        """Test error when header doesn't start with Bearer."""
        with app.test_request_context(headers={'Authorization': 'Basic xyz'}):
            with pytest.raises(AuthenticationError, match=ERROR_AUTHORIZATION_HEADER_MUST_START_WITH_BEARER):
                get_token_from_auth_header()

    def test_missing_token(self, app):
        """Test error when token is missing after Bearer."""
        with app.test_request_context(headers={'Authorization': 'Bearer'}):
            with pytest.raises(AuthenticationError, match=ERROR_TOKEN_NOT_FOUND):
                get_token_from_auth_header()

    def test_too_many_parts(self, app):
        """Test error when header has too many parts."""
        with app.test_request_context(headers={'Authorization': 'Bearer token extra'}):
            with pytest.raises(AuthenticationError, match=ERROR_AUTHORIZATION_HEADER_MUST_BE_BEARER_TOKEN):
                get_token_from_auth_header()

    def test_valid_token_extraction(self, app):
        """Test successful token extraction."""
        token = "test-token-value"
        with app.test_request_context(headers={'Authorization': f'Bearer {token}'}):
            result = get_token_from_auth_header()
            assert result == token


class TestGetUserIdFromAuthHeader:
    """Test user ID extraction from JWT token."""

    def test_valid_user_id_extraction(self, app, valid_jwt_token):
        """Test successful user ID extraction from valid token."""
        with app.test_request_context(headers={'Authorization': f'Bearer {valid_jwt_token}'}):
            user_id = get_user_id_from_auth_header()
            assert user_id == "test-user-123"

    def test_missing_sub_claim(self, app):
        """Test error when token doesn't contain sub claim."""
        token_without_sub = jwt.encode({'aud': 'test'}, app.config["SECRET_KEY"], algorithm=app.config["ALGORITHM"])
        with app.test_request_context(headers={'Authorization': f'Bearer {token_without_sub}'}):
            with pytest.raises(AuthenticationError, match=ERROR_TOKEN_DOES_NOT_CONTAIN_USER_ID):
                get_user_id_from_auth_header()

    def test_invalid_user_id_in_token(self, app):
        """Test error when token contains invalid user ID."""
        payload = {'sub': 'invalid@user!'}
        invalid_token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm=app.config["ALGORITHM"])
        with app.test_request_context(headers={'Authorization': f'Bearer {invalid_token}'}):
            with pytest.raises(AuthenticationError, match=ERROR_INVALID_USER_ID):
                get_user_id_from_auth_header()


class TestValidateJWT:
    """Test JWT validation against Auth0 JWKS."""

    @staticmethod
    def _setup_mock_jwks_response(mock_get, mock_jwks_response):
        """Helper method to set up mock JWKS response."""
        mock_response = Mock()
        mock_response.json.return_value = mock_jwks_response
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        return mock_response

    @patch('requests.get')
    def test_validate_jwt_success(self, mock_get, app, mock_jwks_response):
        """Test successful JWT validation."""
        self._setup_mock_jwks_response(mock_get, mock_jwks_response)

        with patch('jwt.get_unverified_header') as mock_header:
            mock_header.return_value = {'kid': 'test-key-id'}
            with patch('jwt.decode') as mock_decode:
                mock_decode.return_value = {'sub': 'test-user'}

                with app.app_context():
                    validate_jwt("test-token")

    def test_validate_jwt_missing_config(self, app):
        """Test error when Auth0 config is missing."""
        with app.app_context():
            # Temporarily clear Auth0 config for this test
            original_domain = app.config.get('AUTH0_DOMAIN')
            original_audience = app.config.get('AUTH0_AUDIENCE')
            app.config['AUTH0_DOMAIN'] = None
            app.config['AUTH0_AUDIENCE'] = None
            try:
                with pytest.raises(Exception, match=ERROR_AUTH0_CONFIGURATION_NOT_PROPERLY_SET_UP):
                    validate_jwt("test-token")
            finally:
                # Restore Auth0 config for other tests
                app.config['AUTH0_DOMAIN'] = original_domain
                app.config['AUTH0_AUDIENCE'] = original_audience

    @patch('requests.get')
    def test_validate_jwt_no_kid(self, mock_get, app, mock_jwks_response):
        """Test error when token header doesn't contain kid."""
        self._setup_mock_jwks_response(mock_get, mock_jwks_response)

        with patch('jwt.get_unverified_header') as mock_header:
            mock_header.return_value = {}

            with app.app_context():
                with pytest.raises(AuthenticationError, match=ERROR_INVALID_HEADER_NO_KID):
                    validate_jwt("test-token")

    @patch('requests.get')
    def test_validate_jwt_key_not_found(self, mock_get, app, mock_jwks_response):
        """Test error when JWKS doesn't contain matching key."""
        self._setup_mock_jwks_response(mock_get, mock_jwks_response)

        with patch('jwt.get_unverified_header') as mock_header:
            mock_header.return_value = {'kid': 'non-existent-key'}

            with app.app_context():
                with pytest.raises(AuthenticationError, match=ERROR_UNABLE_TO_FIND_APPROPRIATE_KEY):
                    validate_jwt("test-token")

    @patch('requests.get')
    def test_validate_jwt_uses_cache(self, mock_get, app, mock_jwks_response):
        """Test that JWKS cache is used on subsequent calls."""
        _jwks_cache.clear()
        self._setup_mock_jwks_response(mock_get, mock_jwks_response)

        with patch('jwt.decode'):
            with patch('jwt.get_unverified_header') as mock_header:
                mock_header.return_value = {'kid': 'test-key-id'}

                with app.app_context():
                    # First call - should fetch JWKS
                    validate_jwt("test-token")
                    assert mock_get.call_count == 1

                    # Second call - should use cache
                    validate_jwt("test-token")
                    assert mock_get.call_count == 1

    @patch('requests.get')
    def test_validate_jwt_expired_token(self, mock_get, app, mock_jwks_response):
        """Test error when token is expired."""
        self._setup_mock_jwks_response(mock_get, mock_jwks_response)

        with patch('jwt.decode') as mock_decode:
            mock_decode.side_effect = jwt.ExpiredSignatureError("Token expired")

            with patch('jwt.get_unverified_header') as mock_header:
                mock_header.return_value = {'kid': 'test-key-id'}

                with app.app_context():
                    with pytest.raises(AuthenticationError, match=ERROR_INVALID_TOKEN):
                        validate_jwt("test-token")
