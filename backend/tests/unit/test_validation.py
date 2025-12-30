"""
Unit tests for request validation decorators.
"""
import pytest
from app.utils.decorators import (
    MAX_BOARD_GAME_LENGTH,
    MAX_CONTENT_LENGTH,
    MAX_EMAIL_LENGTH,
    MAX_QUESTION_LENGTH,
    _sanitize_string,
    _validate_board_game,
    _validate_question,
    _validate_email,
    _validate_content,
)
from app.config.constants import (
    ERROR_BOARD_GAME_NAME_CANNOT_BE_EMPTY,
    ERROR_BOARD_GAME_NAME_TOO_LONG,
    ERROR_QUESTION_CANNOT_BE_EMPTY,
    ERROR_QUESTION_TOO_LONG,
    ERROR_EMAIL_FORMAT_IS_INVALID,
    ERROR_CONTENT_CANNOT_BE_EMPTY,
    ERROR_CONTENT_TOO_LONG,
    ERROR_TOO_LONG,
)


class TestSanitizeString:
    """Test string sanitization logic."""

    def test_removes_null_bytes(self):
        """Test that null bytes are removed."""
        result = _sanitize_string("test\x00string")
        assert result == "teststring"

    def test_removes_control_characters(self):
        """Test that control characters are removed."""
        result = _sanitize_string("test\x01\x02string")
        assert result == "teststring"

    def test_strips_whitespace(self):
        """Test that leading/trailing whitespace is removed."""
        result = _sanitize_string("  test string  ")
        assert result == "test string"

    def test_preserves_normal_text(self):
        """Test that normal text is unchanged."""
        text = "This is a normal string!"
        result = _sanitize_string(text)
        assert result == text


class TestValidateBoardGame:
    """Test board game name validation."""

    def test_valid_board_game_name(self):
        """Test validation passes for valid names."""
        result = _validate_board_game("Brass: Birmingham")
        assert result == "Brass: Birmingham"

    def test_empty_board_game_name(self):
        """Test validation fails for empty names."""
        with pytest.raises(ValueError, match=ERROR_BOARD_GAME_NAME_CANNOT_BE_EMPTY):
            _validate_board_game("")

    def test_board_game_name_too_long(self):
        """Test validation fails for overly long names."""
        long_name = "a" * (MAX_BOARD_GAME_LENGTH + 1)
        with pytest.raises(ValueError, match=ERROR_BOARD_GAME_NAME_TOO_LONG):
            _validate_board_game(long_name)

    def test_sanitizes_board_game_name(self):
        """Test that board game names are sanitized."""
        result = _validate_board_game("  Brass: Birmingham\x00  ")
        assert result == "Brass: Birmingham"


class TestValidateQuestion:
    """Test question validation."""

    def test_valid_question(self):
        """Test validation passes for valid questions."""
        question = "How do I build an ironworks?"
        result = _validate_question(question)
        assert result == question

    def test_empty_question(self):
        """Test validation fails for empty questions."""
        with pytest.raises(ValueError, match=ERROR_QUESTION_CANNOT_BE_EMPTY):
            _validate_question("")

    def test_question_too_long(self):
        """Test validation fails for overly long questions."""
        long_question = "a" * (MAX_QUESTION_LENGTH + 1)
        with pytest.raises(ValueError, match=ERROR_QUESTION_TOO_LONG):
            _validate_question(long_question)

    def test_sanitizes_question(self):
        """Test that questions are sanitized."""
        result = _validate_question("  How do I build an ironworks?\x00  ")
        assert result == "How do I build an ironworks?"


class TestValidateEmail:
    """Test email validation."""

    def test_valid_email(self):
        """Test validation passes for valid emails."""
        email = "test@example.com"
        result = _validate_email(email)
        assert result == email

    def test_none_email(self):
        """Test validation returns None for None input."""
        result = _validate_email(None)
        assert result is None

    def test_email_too_long(self):
        """Test validation fails for overly long emails."""
        long_email = "a" * (MAX_EMAIL_LENGTH + 1)
        with pytest.raises(ValueError, match=ERROR_TOO_LONG):
            _validate_email(long_email)

    def test_invalid_email_format(self):
        """Test validation fails for invalid email formats."""
        invalid_emails = [
            "notanemail",
            "@example.com",
            "test@",
            "test@@example.com",
        ]
        for email in invalid_emails:
            with pytest.raises(ValueError, match=ERROR_EMAIL_FORMAT_IS_INVALID):
                _validate_email(email)

    def test_sanitizes_email(self):
        """Test that emails are sanitized."""
        result = _validate_email("  test@example.com  ")
        assert result == "test@example.com"


class TestValidateContent:
    """Test content validation."""

    def test_valid_content(self):
        """Test validation passes for valid content."""
        content = "This is feedback content"
        result = _validate_content(content)
        assert result == content

    def test_empty_content(self):
        """Test validation fails for empty content."""
        with pytest.raises(ValueError, match=ERROR_CONTENT_CANNOT_BE_EMPTY):
            _validate_content("")

    def test_content_too_long(self):
        """Test validation fails for overly long content."""
        long_content = "a" * (MAX_CONTENT_LENGTH + 1)
        with pytest.raises(ValueError, match=ERROR_CONTENT_TOO_LONG):
            _validate_content(long_content)
