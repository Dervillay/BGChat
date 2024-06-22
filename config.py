RULEBOOKS_PATH = "./rulebooks"
DATABASE_PATH = "./database.json"
BOLD_START = "\033[1m"
BOLD_END = "\033[0m"

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
    "If you think a board game is mentioned, but it is not on the list, respond with: 'I'm afraid I don't know the rules for <board_game>' where <board_game> is the name of the board game.\n"
    "If you're certain the question does NOT specify a board game, respond with: 'So I can give you the most accurate answer, which board game is this question about?'.\n"
    "The list is:\n"
    "<BOARD_GAME_LIST>\n"
    "The question is:\n"
    "<QUESTION>"
).replace("<BOARD_GAME_LIST>", "\n".join([f'- {board_game["name"]}' for board_game in BOARD_GAMES]))
