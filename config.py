RULEBOOKS_PATH = "./rulebooks"
DATABASE_PATH = "./database.json"
EMBEDDING_MODEL_PATH = "./embedding_model"
BOLD_START = "\033[1m"
BOLD_END = "\033[0m"
DOWNLOAD_BLOCK_SIZE = 1024
EMBEDDING_MODEL_TO_USE = "intfloat/e5-large-v2"
NORMALIZE_EMBEDDINGS = True
OPENAI_MODEL_TO_USE = "gpt-4o-mini"

UNKNOWN = "UNKNOWN"

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

UNKNOWN_BOARD_GAME_RESPONSE = """
I'm unable to determine which board game your question refers to.
Please select one manually from the dropdown or try asking me another question.
"""

DETERMINE_BOARD_GAME_PROMPT_TEMPLATE = f"""
You will be given a list of board games and a question, where you must determine which board game in the list the question is about.
You must answer with the name of the board game exactly as it appears in the list.
If the question is about a board game that isn't in the list, or the question isn't related to board games at all, respond with "{UNKNOWN}".

The list is:
{BOARD_GAMES_STRING_LIST}

The question is:
<QUESTION>
"""

EXPLAIN_RULES_PROMPT_TEMPLATE = f"""
You are an intellectually honest assistant that helps users understand the rules for different board games.
You will be given several JSON objects containing text extracts from rulebooks for a board game. You will also be given a question about the rules of this board game.
You must answer this question using only the information contained in the 'text' field of these JSON objects.
Only consider an extract's text value if it is directly relevant to the question asked.
You may quote relevant rulebook text in your response, but must cite its source using the following format: {{"rulebook_name":<rulebook_name>, "page_num":<page_num>}}.

If the rulebook extracts are not sufficient for you to confidently answer the question: tell the user that you couldn't find this information in any of the rulebooks.
If you aren't certain of the answer but think you have a reasonable interpretation of the rules: give your interpretation, but step through your reasoning and make it clear that
this is only an interpretation.

The board game is:
<SELECTED_BOARD_GAME>

The rulebook extracts are:
<RULEBOOK_EXTRACTS>

The question is:
<QUESTION>
"""
