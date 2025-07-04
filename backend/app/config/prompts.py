# Constants and templates for AI prompts
from .board_games import BOARD_GAMES_STRING_LIST

CITATION_REGEX_PATTERN = r"{[^{}]*(?:{[^{}]*})*[^{}]*}"
UNKNOWN_VALUE = "UNKNOWN"

SYSTEM_PROMPT = """
You are an intellectually honest assistant that helps users understand the rules for different board games.

You will be given several rulebook pages for a given board game and a question about the rules of this board game.

You must answer this question using only the information contained in the 'text' field of the provided rulebook pages, ensuring your responses are as clear and concise as possible.
Only consider the text if it is directly relevant to the question asked.
You must always cite any rulebook text used to inform your answer, and must do so using the following format: 
{"rulebook_name": <rulebook_name>, "page_num": <page_num>}
When you cite rulebook text, format it as a markdown quote with a line break between the text and citation.

If the rulebook text is not sufficient for you to confidently answer the question: tell the user that you couldn't find this information in any of the rulebooks.
If you aren't certain but think you have a reasonable interpretation of the rules: give your interpretation, but step through your reasoning and make it clear that
this is only an interpretation. You must answer in clear, concise, easy to read markdown.
"""

DETERMINE_BOARD_GAME_PROMPT_TEMPLATE = f"""
You will be given a list of board games and a question, where you must determine which board game in the list the question is about.
You must answer with the name of the board game exactly as it appears in the list.
If you aren't sure, respond with "{UNKNOWN_VALUE}".

The list of board games is:
{BOARD_GAMES_STRING_LIST}

The question is:
<QUESTION>
"""

THE_BOARD_GAME_IS_STRING = "The board game is:"
THE_RULEBOOK_PAGES_ARE_STRING = "The rulebook pages are:"
USER_QUESTION_STRING = "The question is:"

EXPLAIN_RULES_PROMPT_TEMPLATE = f"""
{THE_BOARD_GAME_IS_STRING}
<BOARD_GAME>

{THE_RULEBOOK_PAGES_ARE_STRING}
<RULEBOOK_PAGES>

{USER_QUESTION_STRING}
<QUESTION>
""" 