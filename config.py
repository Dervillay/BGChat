RULEBOOKS_PATH = "./rulebooks"
DATABASE_PATH = "./database.json"
EMBEDDING_MODEL_PATH = "./embedding_model"
BOLD_START = "\033[1m"
BOLD_END = "\033[0m"
DOWNLOAD_BLOCK_SIZE = 1024
EMBEDDING_MODEL_TO_USE = "intfloat/e5-large-v2"
OPENAI_MODEL_TO_USE = "gpt-4o-mini"

UNKNOWN = "UNKNOWN"
NO_BOARD_GAME_SPECIFIED = "NO BOARD GAME SPECIFIED"

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
    },
    {
        "name": "Root",
        "rulebooks": [
            {
                "name": "Law of Root",
                "download_url": "https://cdn.shopify.com/s/files/1/0106/0162/7706/files/Root_Base_Law_of_Root_Sep_5_2024.pdf?v=1729175648",
            },
            {
                "name": "Learning to Play",
                "download_url": "https://cdn.shopify.com/s/files/1/0106/0162/7706/files/Root_Base_Learn_to_Play_web_Oct_15_2020.pdf?v=1603389572",
            }
        ]
    }
]
BOARD_GAMES_STRING_LIST = "\n".join([f"- {board_game['name']}" for board_game in BOARD_GAMES])

DETERMINE_BOARD_GAME_PROMPT_TEMPLATE = f"""
You will be given a list of board games and a question, where you must determine which board game in the list the question is about.
You must answer with the name of the board game exactly as it appears in the list.
If the question is asking about a board game that is not in the list, respond with "{UNKNOWN}".
Only if you're absolutely certain that the question does NOT specify a board game, respond with "{NO_BOARD_GAME_SPECIFIED}".

The list is:
{BOARD_GAMES_STRING_LIST}

The question is:
<QUESTION>
"""
