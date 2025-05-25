import logging
import os
import time
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from pymongo.results import UpdateResult
from urllib.parse import quote_plus

from app.types import Message

load_dotenv()

logger = logging.getLogger(__name__)

class MongoDBClient:
    """
    Singleton client for MongoDB database operations.
    Handles connection management and data persistence.
    """
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.client = None
            self.db = None
            self._connect()
            self._initialized = True
    
    def _get_mongodb_uri(self) -> str:
        """Get the MongoDB connection URI with proper encoding."""
        username = quote_plus(os.getenv('MONGODB_USERNAME'))
        password = quote_plus(os.getenv('MONGODB_PASSWORD'))
        host = os.getenv('MONGODB_HOST')
        
        return (
            f"mongodb+srv://{username}:{password}@{host}/"
            f"?retryWrites=true&w=majority"
        )

    def _connect(self) -> None:
        """Establish connection to MongoDB with retry logic."""
        max_retries = 3
        retry_count = 0
        while retry_count < max_retries:
            try:
                self.client = MongoClient(self._get_mongodb_uri())
                self.client.admin.command("ping")
                self.db = self.client[os.getenv("MONGODB_DB_NAME")]
                logger.info("Successfully connected to MongoDB database")
                return
            
            except (ConnectionFailure, ServerSelectionTimeoutError) as e:
                retry_count += 1
                if retry_count == max_retries:
                    logger.error(
                        "Failed to connect to MongoDB after %d attempts: %s", max_retries, str(e)
                    )
                    raise

                logger.warning(
                    "Failed to connect to MongoDB, attempt %d/%d", retry_count, max_retries
                )

                time.sleep(2 ** retry_count)

    def _ensure_connection(self) -> None:
        """Ensure MongoDB connection is active, reconnect if necessary."""
        try:
            self.client.admin.command("ping")

        except (ConnectionFailure, ServerSelectionTimeoutError):
            logger.warning("MongoDB connection lost, attempting to reconnect...")
            self._connect()

    def _get_current_datetime_utc(self) -> datetime:
        """Get the current UTC time."""
        return datetime.now(timezone.utc)

    def _raise_on_no_user_id_match(self, result: UpdateResult) -> None:
        """Raise an error if an update did not find any documents for the given user_id."""
        if result.matched_count == 0:
            error_message = f"No document found for user_id: {result.user_id}"
            logger.error(error_message)
            raise ValueError(error_message)

    def append_messages(
            self,
            user_id: str,
            board_game: str,
            messages: list[Message]
        ) -> None:
        """Store a message in the conversation history."""
        self._ensure_connection()
        try:
            request_datetime_utc = self._get_current_datetime_utc()
            self.db.user_data.update_one(
                {"user_id": user_id},
                {
                    "$setOnInsert": {
                        "user_id": user_id,
                        "token_usage": {},
                        "created_at": request_datetime_utc,
                    },
                    "$set": {
                        "last_active": request_datetime_utc
                    },
                    "$push": {
                        f"messages.{board_game}": {
                            "$each": messages
                        }
                    }
                },
                upsert=True
            )

        except Exception as e:
            logger.error("Error storing messages: %s", str(e))
            raise

    # TODO: Handle updating token usage
    # TODO: Add pagination
    def get_message_history(
            self,
            user_id: str,
            board_game: str
        ) -> list[Message]:
        """Get message history for a given user and board game."""
        self._ensure_connection()
        try:
            result = self.db.user_data.find_one(
                {"user_id": user_id},
                {f"messages.{board_game}": 1, "_id": 0}
            )

            if result is None:
                return []

            return result.get("messages", {}).get(board_game, [])

        except Exception as e:
            logger.error("Error retrieving message history: %s", str(e))
            raise

    def clear_message_history(
            self,
            user_id: str,
            board_game: str
        ) -> None:
        """Clear the message history for a given user and board game."""
        self._ensure_connection()
        try:
            result = self.db.user_data.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        f"messages.{board_game}": [],
                        "last_active": self._get_current_datetime_utc()
                    }
                }
            )
            self._raise_on_no_user_id_match(result)
        except Exception as e:
            logger.error("Error clearing message history: %s", str(e))
            raise

    def delete_messages_from_index(
            self,
            user_id: str,
            board_game: str,
            index: int
        ) -> None:
        """
        Delete all messages with index greater than or equal to the specified index (0-based)
        for a given user and board game.
        """
        self._ensure_connection()
        try:
            result = self.db.user_data.update_one(
                {"user_id": user_id},
                {
                    "$push": {
                        f"messages.{board_game}": {
                            "$each": [],
                            "$slice": index
                        },
                    },
                    "$set": {
                        "last_active": self._get_current_datetime_utc()
                    }
                }
            )
            self._raise_on_no_user_id_match(result)

        except Exception as e:
            logger.error("Error deleting messages: %s", str(e))
            raise

    def __del__(self):
        """Cleanup MongoDB connection on object deletion."""
        if self.client:
            self.client.close()
