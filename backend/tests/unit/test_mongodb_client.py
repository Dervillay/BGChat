"""
Unit tests for MongoDB client.
"""
import pytest
from unittest.mock import Mock, MagicMock, patch
from datetime import datetime, timezone
from pymongo.errors import ConnectionFailure

from app.mongodb_client import MongoDBClient


@pytest.fixture
def mock_config():
    """Mock configuration for MongoDB client."""
    config = Mock()
    config.MONGODB_USERNAME = "test_user"
    config.MONGODB_PASSWORD = "test_password"
    config.MONGODB_HOST = "test-host.mongodb.net"
    config.MONGODB_DB_NAME = "test_db"
    return config


@pytest.fixture
def mongodb_client(mock_config, mock_mongodb):
    """Create MongoDB client with mocked connection."""
    with patch('app.mongodb_client.MongoClient') as mock_client_class:
        mock_client_class.return_value = mock_mongodb['client']
        client = MongoDBClient(config=mock_config)
        client.db = mock_mongodb['db']
        yield client


class TestMongoDBClientConnection:
    """Test MongoDB client connection logic."""

    def test_singleton_pattern(self, mock_config):
        """Test that MongoDBClient follows singleton pattern."""
        with patch('app.mongodb_client.MongoClient'):
            client1 = MongoDBClient(config=mock_config)
            client2 = MongoDBClient(config=mock_config)
            assert client1 is client2

    def test_connection_uri_format(self, mock_config):
        """Test that MongoDB URI is correctly formatted."""
        with patch('app.mongodb_client.MongoClient'):
            client = MongoDBClient(config=mock_config)
            uri = client._get_mongodb_uri()
            assert "test_user" in uri
            assert "test_password" in uri
            assert "test-host.mongodb.net" in uri

    def test_connection_retry_logic(self, mock_config):
        """Test that connection retries on failure."""
        with patch('app.mongodb_client.MongoClient') as mock_client_class:
            mock_client = MagicMock()

            # Fail twice, then succeed
            mock_client.admin.command.side_effect = [
                ConnectionFailure("Failed"),
                ConnectionFailure("Failed"),
                None,  # Success
            ]
            mock_client_class.return_value = mock_client

            with patch('time.sleep'):  # Speed up the test
                _ = MongoDBClient(config=mock_config)
                assert mock_client.admin.command.call_count == 3

    def test_connection_failure_after_retries(self, mock_config):
        """Test that connection raises error after max retries."""
        with patch('app.mongodb_client.MongoClient') as mock_client_class:
            mock_client = MagicMock()
            mock_client.admin.command.side_effect = ConnectionFailure("Failed")
            mock_client_class.return_value = mock_client

            with patch('time.sleep'):
                with pytest.raises(ConnectionFailure):
                    MongoDBClient(config=mock_config)

    def test_ensure_connection_reconnects(self, mongodb_client):
        """Test that _ensure_connection reconnects on failure."""
        mongodb_client.client.admin.command.side_effect = ConnectionFailure("Lost connection")

        with patch.object(mongodb_client, '_connect') as mock_connect:
            mongodb_client._ensure_connection()
            mock_connect.assert_called_once()


class TestMessageOperations:
    """Test message-related database operations."""

    def test_append_messages(self, mongodb_client, mock_mongodb):
        """Test appending messages to user history."""
        messages = [
            {"role": "user", "content": "Test question"},
            {"role": "assistant", "content": "Test answer"},
        ]

        mongodb_client.append_messages(
            user_id="test-user-123",
            board_game="Wingspan",
            messages=messages
        )

        # Verify update_one was called with correct parameters
        mock_mongodb['db'].user_data.update_one.assert_called_once()
        call_args = mock_mongodb['db'].user_data.update_one.call_args

        assert call_args[0][0] == {"user_id": "test-user-123"}
        assert "$push" in call_args[0][1]
        assert "messages.Wingspan" in call_args[0][1]["$push"]

    def test_get_message_history_exists(self, mongodb_client, mock_mongodb):
        """Test retrieving existing message history."""
        mock_result = {
            "messages": {
                "Wingspan": [
                    {"role": "user", "content": "Question"},
                    {"role": "assistant", "content": "Answer"},
                ]
            }
        }
        mock_mongodb['db'].user_data.find_one.return_value = mock_result

        result = mongodb_client.get_message_history(
            user_id="test-user-123",
            board_game="Wingspan"
        )

        assert len(result) == 2
        assert result[0]["role"] == "user"

    def test_get_message_history_not_exists(self, mongodb_client, mock_mongodb):
        """Test retrieving message history for non-existent user."""
        mock_mongodb['db'].user_data.find_one.return_value = None

        result = mongodb_client.get_message_history(
            user_id="nonexistent-user",
            board_game="Wingspan"
        )

        assert result == []

    def test_clear_message_history(self, mongodb_client, mock_mongodb):
        """Test clearing message history."""
        mock_result = Mock()
        mock_result.matched_count = 1
        mock_mongodb['db'].user_data.update_one.return_value = mock_result

        mongodb_client.clear_message_history(
            user_id="test-user-123",
            board_game="Wingspan"
        )

        mock_mongodb['db'].user_data.update_one.assert_called_once()
        call_args = mock_mongodb['db'].user_data.update_one.call_args
        assert "messages.Wingspan" in call_args[0][1]["$set"]
        assert call_args[0][1]["$set"]["messages.Wingspan"] == []

    def test_delete_messages_from_index(self, mongodb_client, mock_mongodb):
        """Test deleting messages from specific index."""
        mock_result = Mock()
        mock_result.matched_count = 1
        mock_mongodb['db'].user_data.update_one.return_value = mock_result

        mongodb_client.delete_messages_from_index(
            user_id="test-user-123",
            board_game="Wingspan",
            index=5
        )

        mock_mongodb['db'].user_data.update_one.assert_called_once()
        call_args = mock_mongodb['db'].user_data.update_one.call_args
        assert "$push" in call_args[0][1]
        assert "$slice" in call_args[0][1]["$push"]["messages.Wingspan"]


class TestRulebookOperations:
    """Test rulebook-related database operations."""

    def test_store_rulebook_pages(self, mongodb_client, mock_mongodb):
        """Test storing rulebook pages."""
        pages = [
            {
                "board_game": "Wingspan",
                "rulebook_name": "main_rules",
                "page_number": 1,
                "text": "How to play...",
                "embedding": [0.1] * 1536,
            }
        ]

        mongodb_client.store_rulebook_pages(pages)

        mock_mongodb['db'].rulebook_pages.insert_many.assert_called_once_with(pages)

    def test_delete_rulebook_pages(self, mongodb_client, mock_mongodb):
        """Test deleting rulebook pages."""
        mock_result = Mock()
        mock_result.deleted_count = 10
        mock_mongodb['db'].rulebook_pages.delete_many.return_value = mock_result

        mongodb_client.delete_rulebook_pages(
            board_game="Wingspan",
            rulebook="main_rules"
        )

        mock_mongodb['db'].rulebook_pages.delete_many.assert_called_once_with({
            "board_game": "Wingspan",
            "rulebook_name": "main_rules"
        })

    def test_get_rulebook_pages(self, mongodb_client, mock_mongodb):
        """Test retrieving rulebook pages."""
        mock_pages = [
            {"page_number": 1, "text": "Page 1"},
            {"page_number": 2, "text": "Page 2"},
        ]
        mock_mongodb['db'].rulebook_pages.find.return_value = mock_pages

        result = mongodb_client.get_rulebook_pages(
            board_game="Wingspan",
            rulebook="main_rules"
        )

        assert result == mock_pages

    def test_get_similar_rulebook_pages(self, mongodb_client, mock_mongodb):
        """Test vector search for similar pages."""
        mock_results = [
            {"page_number": 5, "text": "Similar content", "score": 0.95},
        ]
        mock_mongodb['db'].rulebook_pages.aggregate.return_value = mock_results

        query_embedding = [0.1] * 1536
        result = mongodb_client.get_similar_rulebook_pages(
            board_game="Wingspan",
            query_embedding=query_embedding,
            limit=5
        )

        assert result == mock_results
        mock_mongodb['db'].rulebook_pages.aggregate.assert_called_once()

    def test_get_all_board_games(self, mongodb_client, mock_mongodb):
        """Test retrieving all board game names."""
        mock_games = ["Wingspan", "Azul", "Catan"]
        mock_mongodb['db'].rulebook_pages.distinct.return_value = mock_games

        result = mongodb_client.get_all_board_games()

        assert result == sorted(mock_games)


class TestTokenUsageOperations:
    """Test token usage tracking operations."""

    def test_increment_todays_token_usage(self, mongodb_client, mock_mongodb):
        """Test incrementing token usage for today."""
        mongodb_client.increment_todays_token_usage(
            user_id="test-user-123",
            model_name="gpt-4o-mini",
            input_tokens=100,
            output_tokens=50,
            web_searches=1
        )

        mock_mongodb['db'].user_data.update_one.assert_called_once()
        call_args = mock_mongodb['db'].user_data.update_one.call_args

        assert call_args[0][0] == {"user_id": "test-user-123"}
        assert "$inc" in call_args[0][1]

    def test_get_todays_token_usage_exists(self, mongodb_client, mock_mongodb):
        """Test retrieving token usage for today."""
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        mock_result = {
            "token_usage": {
                today: {
                    "gpt-4o-mini": {
                        "input_tokens": 1000,
                        "output_tokens": 500,
                        "web_searches": 2
                    }
                }
            }
        }
        mock_mongodb['db'].user_data.find_one.return_value = mock_result

        result = mongodb_client.get_todays_token_usage(user_id="test-user-123")

        assert "gpt-4o-mini" in result
        assert result["gpt-4o-mini"]["input_tokens"] == 1000

    def test_get_todays_token_usage_not_exists(self, mongodb_client, mock_mongodb):
        """Test retrieving token usage for user with no data."""
        mock_mongodb['db'].user_data.find_one.return_value = None

        result = mongodb_client.get_todays_token_usage(user_id="nonexistent-user")

        assert result == {}


class TestUserDataOperations:
    """Test user data operations."""

    def test_get_user_theme_exists(self, mongodb_client, mock_mongodb):
        """Test retrieving existing user theme."""
        mock_result = {"theme": 1}
        mock_mongodb['db'].user_data.find_one.return_value = mock_result

        result = mongodb_client.get_user_theme(user_id="test-user-123")

        assert result == 1

    def test_get_user_theme_not_exists(self, mongodb_client, mock_mongodb):
        """Test retrieving theme for user without preference."""
        mock_mongodb['db'].user_data.find_one.return_value = None

        result = mongodb_client.get_user_theme(user_id="test-user-123")

        assert result is None

    def test_set_user_theme(self, mongodb_client, mock_mongodb):
        """Test saving user theme preference."""
        mongodb_client.set_user_theme(user_id="test-user-123", theme=1)

        mock_mongodb['db'].user_data.update_one.assert_called_once()
        call_args = mock_mongodb['db'].user_data.update_one.call_args

        assert call_args[0][1]["$set"]["theme"] == 1

    def test_store_feedback(self, mongodb_client, mock_mongodb):
        """Test storing user feedback."""
        mongodb_client.store_feedback(
            user_id="test-user-123",
            content="Great app!",
            email="test@example.com"
        )

        mock_mongodb['db'].feedback.update_one.assert_called_once()
        call_args = mock_mongodb['db'].feedback.update_one.call_args

        assert "$push" in call_args[0][1]
        assert call_args[0][1]["$set"]["email"] == "test@example.com"
