from typing import TypedDict, Literal

class Message(TypedDict):
    """Type definition for a chat message."""
    role: Literal["user", "assistant"]
    content: str

class RulebookPage(TypedDict):
    """Type definition for a rulebook page."""
    rulebook_name: str
    page_num: int
    text: str
