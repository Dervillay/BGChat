RULEBOOKS_PATH = "./rulebooks"
DATABASE_PATH = "./database.json"
EMBEDDING_MODEL_PATH = "./embedding_model"
BOLD_START = "\033[1m"
BOLD_END = "\033[0m"
DOWNLOAD_BLOCK_SIZE = 1024
EMBEDDING_MODEL_TO_USE = "intfloat/e5-large-v2"

UNKNOWN = "Unknown"
NO_BOARD_GAME_SPECIFIED = "No Board Game Specified"

BOARD_GAMES = [
    {
        "name": "Gloomhaven: Jaws of the Lion",
        "rulebooks": [
            {
                "name": "Learn to Play Guide",
                "download_url": "https://comparajogos-forum.s3.dualstack.sa-east-1.amazonaws.com/uploads/original/2X/e/e6fb769d1c8b7730e40cbe95d93c641ed83638c0.pdf"
            },
            {
                "name": "Glossary",
                "download_url": "https://cdn.1j1ju.com/medias/c1/6f/d7-gloomhaven-jaws-of-the-lion-rulebook.pdf",
            },
        ]
    }
]

DETERMINE_BOARD_GAME_PROMPT_TEMPLATE = (
    "You will be given a question and must determine which board game the question refers to from a list.\n"
    "You must answer with the name of the board game exactly as it appears in the list.\n"
    f"If the question is asking for the rules of any game that is not in the list, respond with: '{UNKNOWN}'\n"
    "For example, if the question is 'In <board game>, who goes first?', if <board game> is not in the list, then respond with '{UNKNOWN_RESPONSE}'."
    f"Only if you're absolutely certain that the question does NOT specify a board game, respond with: '{NO_BOARD_GAME_SPECIFIED}'.\n"
    "The list is:\n"
    "<BOARD_GAME_LIST>\n"
    "The question is:\n"
    "<QUESTION>"
).replace(
    "<BOARD_GAME_LIST>",
    "\n".join([f'- {board_game["name"]}' for board_game in BOARD_GAMES])
)
