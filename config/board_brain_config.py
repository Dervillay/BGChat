# All paths are relative to the project's root
RULEBOOKS_PATH = "./resources/rulebooks"
EMBEDDING_MODEL_PATH = "./resources/embedding_model"
DATABASE_PATH = "./backend/app/database.json"

OPENAI_MODEL_TO_USE = "gpt-4o-mini"
EMBEDDING_MODEL_TO_USE = "intfloat/e5-large-v2"

BOARD_GAMES = [
    {
        "name": "Gloomhaven: Jaws of the Lion",
        "rulebooks": [
            {
                "name": "Glossary",
                "download_url": "https://comparajogos-forum.s3.dualstack.sa-east-1.amazonaws.com/uploads/original/2X/e/e6fb769d1c8b7730e40cbe95d93c641ed83638c0.pdf"
            },
            {
                "name": "Learn to Play Guide",
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

CITATION_REGEX_PATTERN = r"{[^{}]*(?:{[^{}]*})*[^{}]*}"
UNKNOWN_VALUE = "UNKNOWN"

UNKNOWN_BOARD_GAME_RESPONSE = """
I'm unable to determine which board game your question refers to.
Please select one manually from the dropdown or try asking me another question.
"""

SYSTEM_PROMPT = f"""
You are an intellectually honest assistant that helps users understand the rules for different board games.

You will be given several Python dictionaries representing extracts from rulebooks for a given board game and a question about the rules of this board game.

You must answer this question using only the information contained in the 'text' field of the provided dictionaries, ensuring your responses are as clear and concise as possible.
Only consider the text if it is relevant to the question asked.
Always cite the relevant rulebook text. You must do so using the following format: 
{{"rulebook_name": <rulebook_name>, "page_num": <page_num>}}
If you directly quote rulebook text in your response, you must cite its source immediately after the quote.

If the rulebook text is not sufficient for you to confidently answer the question: tell the user that you couldn't find this information in any of the rulebooks.
If you aren't certain of the answer but think you have a reasonable interpretation of the rules: give your interpretation, but step through your reasoning and make it clear that
this is only an interpretation.
"""

DETERMINE_BOARD_GAME_PROMPT_TEMPLATE = f"""
You will be given a list of board games and a question, where you must determine which board game in the list the question is about.
You must answer with the name of the board game exactly as it appears in the list.
If the question is about a board game that isn't in the list, or the question isn't related to board games at all, respond with "{UNKNOWN_VALUE}".

The list is:
{BOARD_GAMES_STRING_LIST}

The question is:
<QUESTION>
"""

EXPLAIN_RULES_PROMPT_TEMPLATE = f"""
The board game is:
<SELECTED_BOARD_GAME>

The rulebook texts are:
<RULEBOOK_EXTRACTS>

The question is:
<QUESTION>
"""
