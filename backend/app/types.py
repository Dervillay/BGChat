from typing import TypedDict, Literal

class Message(TypedDict):
    """Type definition for a chat message."""
    role: Literal["user", "assistant"]
    content: str
