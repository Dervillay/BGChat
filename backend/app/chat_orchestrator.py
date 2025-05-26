import openai
import json
import ast
import regex as re
from sentence_transformers import SentenceTransformer
from urllib.parse import quote

from app.config.paths import EMBEDDING_MODEL_PATH
from app.config.models import OPENAI_MODEL_TO_USE
from app.config.board_games import BOARD_GAMES
from app.config.prompts import (
    SYSTEM_PROMPT,
    DETERMINE_BOARD_GAME_PROMPT_TEMPLATE,
    EXPLAIN_RULES_PROMPT_TEMPLATE,
    UNKNOWN_VALUE,
    CITATION_REGEX_PATTERN,
    USER_QUESTION_STRING,
    THE_BOARD_GAME_IS_STRING,
    THE_RULEBOOK_PAGES_ARE_STRING,
)
from app.mongodb_client import MongoDBClient
from app.types import Message

class ChatOrchestrator:
    def __init__(
        self,
        embedding_model_path: str = EMBEDDING_MODEL_PATH
    ):
        self.known_board_games: list[str] = [board_game["name"] for board_game in BOARD_GAMES]
        self._embedding_model = SentenceTransformer(embedding_model_path)
        self._openai_client = openai.OpenAI()
        self._mongodb_client = MongoDBClient()


    def _embed_question(
        self,
        question: str,
    ):
        embedding = self._embedding_model.encode(
            f"query: {question}",
            normalize_embeddings=True,
            show_progress_bar=False
        )
        return embedding.tolist()


    def _call_openai_model(
        self,
        messages: list[Message],
        stream: bool,
    ):
        try:
            response = self._openai_client.chat.completions.create(
                model=OPENAI_MODEL_TO_USE,
                messages=messages,
                stream=stream
            )
            if stream:
                return response
            return response.choices[0].message.content
        
        except openai.error.AuthenticationError as e:
            raise ValueError(f"Authentication failed: {e}") from e

        except openai.error.InvalidRequestError as e:
            raise ValueError(f"Invalid request: {e}") from e

        except openai.error.RateLimitError as e:
            raise ValueError(f"Rate limit exceeded: {e}") from e

        except openai.error.OpenAIError as e:
            raise ValueError(f"An error occurred: {e}") from e

        except Exception as e:
            raise ValueError(f"An unexpected error occurred: {e}") from e


    def _get_similar_rulebook_pages(
        self,
        board_game: str,
        question: str,
    ):
        embedding = self._embed_question(question)
        results = self._mongodb_client.get_similar_rulebook_pages(
            board_game,
            embedding,
            limit=5
        )

        return results


    def _construct_rulebook_link(
        self,
        board_game: str,
        citation: dict,
    ):
        rulebook_name = citation.get("rulebook_name")
        page_num = citation.get("page_num")

        if not rulebook_name or not page_num:
            raise ValueError(f"Malformed citation detected:\n{json.dumps(citation)}")

        return f"{quote(f'{board_game}/{rulebook_name}.pdf')}#page={page_num}"


    def _parse_citations(
        self,
        board_game: str,
        text: str
    ):
        def add_link_to_citation(match):
            citation_str = match.group(0)
            citation_dict = ast.literal_eval(citation_str)

            display_text = f"{citation_dict['rulebook_name']}, Page {citation_dict['page_num']}"
            link = self._construct_rulebook_link(board_game, citation_dict)

            return f"[{display_text}]({link})"

        return re.sub(
            CITATION_REGEX_PATTERN,
            add_link_to_citation,
            text,
        )


    def _convert_to_user_facing_message(
        self,
        message: Message,
    ):
        content = message["content"]
        if message["role"] == "user":

            if content.startswith(SYSTEM_PROMPT):
                content = content[len(SYSTEM_PROMPT):]

            if (
                THE_BOARD_GAME_IS_STRING in content and
                THE_RULEBOOK_PAGES_ARE_STRING in content and
                USER_QUESTION_STRING in content
            ):
                content = content.split(USER_QUESTION_STRING)[1].strip()

            return {"content": content, "role": "user"}

        if message["role"] == "assistant":
            return {"content": content, "role": "assistant"}

        raise ValueError(f"Invalid role value '{message['role']}', expected 'user' or 'assistant'")


    def get_message_history(
        self,
        user_id: str,
        board_game: str,
    ):
        message_history = self._mongodb_client.get_message_history(user_id, board_game)

        return [
            self._convert_to_user_facing_message(message)
            for message in message_history
        ]


    def delete_messages_from_index(
        self,
        user_id: str,
        board_game: str,
        index: int,
    ):
        if index < 0:
            raise ValueError(f"Index must be non-negative, but got {index}")

        self._mongodb_client.delete_messages_from_index(user_id, board_game, index)


    def clear_message_history(
        self,
        user_id: str,
        board_game: str,
    ):
        self._mongodb_client.clear_message_history(user_id, board_game)


    def determine_board_game(
        self,
        question: str
    ):
        message = {
            "content": DETERMINE_BOARD_GAME_PROMPT_TEMPLATE.replace("<QUESTION>", question),
            "role": "user",
        }
        response = self._call_openai_model([message], stream=False)

        if response in self.known_board_games or response == UNKNOWN_VALUE:
            return response

        raise ValueError(
            f"Received an unexpected response when attempting to determine board game: {response}"
        )


    def ask_question(
        self,
        user_id: str,
        board_game: str,
        question: str,
    ):
        # Get N most relevant pages of rulebooks for the selected board game
        # and construct a prompt with these pages in them
        rulebook_pages = self._get_similar_rulebook_pages(board_game, question)

        rulebook_pages_as_string = "\n".join(
            json.dumps(page)
            for page in rulebook_pages
        )

        prompt = (
            EXPLAIN_RULES_PROMPT_TEMPLATE
            .replace("<BOARD_GAME>", board_game)
            .replace("<RULEBOOK_PAGES>", rulebook_pages_as_string)
            .replace("<QUESTION>", question)
        )

        # Prepend the system prompt if this is the first message
        message_history = self._mongodb_client.get_message_history(user_id, board_game)
        if len(message_history) == 0:
            prompt = SYSTEM_PROMPT + prompt

        user_message = {
            "content": prompt,
            "role": "user"
        }
        stream = self._call_openai_model(
            message_history + [user_message],
            stream=True
        )
        full_response = ""
        citation_buffer = ""
        in_citation = False

        # Buffer chunks when we hit a citation, then parse the citation and yield the parsed text
        for chunk in stream:
            content = chunk.choices[0].delta.content

            if content is not None:
                if CITATION_REGEX_PATTERN[0] in content:
                    in_citation = True
                    citation_buffer += content
                    continue

                elif CITATION_REGEX_PATTERN[-1] in content:
                    in_citation = False
                    citation_buffer += content
                    parsed = self._parse_citations(board_game, citation_buffer)
                    citation_buffer = ""
                    full_response += parsed
                    yield parsed

                elif in_citation:
                    citation_buffer += content
                    continue

                else:
                    full_response += content
                    yield content


        assistant_message = {
            "content": full_response,
            "role": "assistant"
        }

        self._mongodb_client.append_messages(
            user_id,
            board_game,
            [user_message, assistant_message]
        )
