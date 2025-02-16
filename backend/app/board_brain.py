import openai
import json
import ast
import os
import sys
import numpy as np
import regex as re
from urllib.parse import quote
from sentence_transformers import SentenceTransformer
from tinydb import TinyDB, where

# Add project root to sys.path to allow importing config
project_root_abs_path = os.path.abspath(os.path.join(__file__, "../../../"))
sys.path.append(project_root_abs_path)

from config.board_brain_config import (
    RULEBOOKS_PATH,
    EMBEDDING_MODEL_PATH,
    DATABASE_PATH,
    OPENAI_MODEL_TO_USE,
    BOARD_GAMES,
    SYSTEM_PROMPT,
    DETERMINE_BOARD_GAME_PROMPT_TEMPLATE,
    EXPLAIN_RULES_PROMPT_TEMPLATE,
    UNKNOWN_VALUE,
    UNKNOWN_BOARD_GAME_RESPONSE,
    CITATION_REGEX_PATTERN,
    USER_QUESTION_STRING,
    THE_BOARD_GAME_IS_STRING,
    THE_RULEBOOK_TEXTS_ARE_STRING,
)


class BoardBrain:
    def __init__(
        self,
        rulebooks_path: str = os.path.join(project_root_abs_path, RULEBOOKS_PATH),
        embedding_model_path: str = os.path.join(project_root_abs_path, EMBEDDING_MODEL_PATH),
        embedding_database_path: str = os.path.join(project_root_abs_path, DATABASE_PATH),
    ):
        self.selected_board_game: str = None
        self.known_board_games: list[str] = [board_game["name"] for board_game in BOARD_GAMES]
        self.__messages = {board_game["name"]: [] for board_game in BOARD_GAMES}
        self.__rulebooks_path = rulebooks_path
        self.__embedding_db = TinyDB(embedding_database_path)
        self.__rulebook_pages = self.__embedding_db.table("rulebook_pages")
        self.__embedding_model = SentenceTransformer(embedding_model_path)
        self.__openai_client = openai.OpenAI()


    def __embed_question(
        self,
        question: str,
    ):
        embedding = self.__embedding_model.encode(
            f"query: {question}",
            normalize_embeddings=True,
        )
        return embedding.tolist()


    def __call_openai_model(
        self,
        messages: list[dict],
        return_all_metadata: bool = False,
    ):
        try:
            response = self.__openai_client.chat.completions.create(
                model=OPENAI_MODEL_TO_USE,
                messages=messages
            )
            if return_all_metadata:
                return response
            return response.choices[0].message.content
        
        except openai.error.AuthenticationError as e:
            print(f"Authentication failed: {e}")

        except openai.error.InvalidRequestError as e:
            print(f"Invalid request: {e}")

        except openai.error.RateLimitError as e:
            print(f"Rate limit exceeded: {e}")

        except openai.error.OpenAIError as e:
            print(f"An error occurred: {e}")

        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    
    def __determine_board_game(
        self,
        question: str
    ):
        message = {
            "content": DETERMINE_BOARD_GAME_PROMPT_TEMPLATE.replace("<QUESTION>", question),
            "role": "user",
        }
        response = self.__call_openai_model([message])

        if response in self.known_board_games:
            return response
        elif response == UNKNOWN_VALUE:
            return UNKNOWN_BOARD_GAME_RESPONSE
        else:
            raise ValueError(f"Received an unexpected response when attempting to determine board game: {response}")


    def __get_relevant_rulebook_extracts(
        self,
        question: str,
        n: int = 5,
    ):
        question_embedding = self.__embed_question(question)
        pages = self.__rulebook_pages.search(
            where("board_game_name") == self.selected_board_game
        )

        results = []
        for page in pages:
            for chunk in page["chunks"].values():
                cosine_similarity = np.dot(
                    np.array(question_embedding),
                    np.array(chunk["embedding"]),
                )
                results.append(
                    {
                        "rulebook_name": page["rulebook_name"],
                        "page_num": page["page_num"],
                        "text": chunk["text"],
                        "similarity": cosine_similarity,
                    }
                )
        results = sorted(
            results,
            key=lambda x: x["similarity"],
            reverse=True,
        )

        return results[:n]


    def __construct_rulebook_link(
        self,
        citation: dict,
    ):
        rulebook_name = citation.get("rulebook_name")
        page_num = citation.get("page_num")

        if not rulebook_name or not page_num:
            print(f"WARN: Malformed citation detected:\n{json.dumps(citation)}")
            return

        path = os.path.abspath(f"{self.__rulebooks_path}/{self.selected_board_game}/{rulebook_name}.pdf")
        encoded_path = quote(path)

        return f"file:///{encoded_path}#page={page_num}"


    def __parse_citations(
            self,
            text: str
        ):
        def replace_citation_with_link(match):
            citation_str = match.group(0)
            citation_dict = ast.literal_eval(citation_str)
            return self.__construct_rulebook_link(citation_dict)

        return re.sub(
            CITATION_REGEX_PATTERN,
            replace_citation_with_link,
            text,
        )


    def __convert_to_user_facing_message(
            self,
            message: dict,
        ):
        content = message["content"]
        if message["role"] == "user":

            if content.startswith(SYSTEM_PROMPT):
                content = content[len(SYSTEM_PROMPT):]

            if (
                THE_BOARD_GAME_IS_STRING in content and
                THE_RULEBOOK_TEXTS_ARE_STRING in content and
                USER_QUESTION_STRING in content
            ):
                content = content.split(USER_QUESTION_STRING)[1].strip()

            return {"content": content, "role": "user"}

        elif message["role"] == "assistant":
            return {"content": self.__parse_citations(content), "role": "assistant"}


    def set_selected_board_game(
            self,
            selected_board_game
        ):
        self.selected_board_game = selected_board_game


    def get_user_facing_message_history(
            self,
            board_game_name: str
        ):
        if board_game_name not in self.known_board_games:
            return []

        return [
            self.__convert_to_user_facing_message(message)
            for message in self.__messages[board_game_name]
        ]


    def ask_question(
        self,
        question: str,
    ):
        # If the user hasn't selected a board game manually, determine which board game the question is about.
        # Return the response if we can't determine one
        if self.selected_board_game is None:
            maybe_board_game = self.__determine_board_game(question)
            if maybe_board_game not in self.known_board_games:
                return maybe_board_game

        # Get N most relevant chunks of rulebook text for the selected board game and construct a prompt
        # with these extracts in them
        rulebook_extracts = self.__get_relevant_rulebook_extracts(question)
        rulebook_extracts_as_string = "\n".join([json.dumps(extract) for extract in rulebook_extracts])
        prompt = (
            EXPLAIN_RULES_PROMPT_TEMPLATE
            .replace("<SELECTED_BOARD_GAME>", self.selected_board_game)
            .replace("<RULEBOOK_EXTRACTS>", rulebook_extracts_as_string)
            .replace("<QUESTION>", question)
        )

        # Prepend the system prompt if this is the first question about this board game
        if len(self.__messages[self.selected_board_game]) == 0:
            prompt = SYSTEM_PROMPT + prompt

        self.__messages[self.selected_board_game].append({"content": prompt, "role": "user"})

        response_with_metadata = self.__call_openai_model(
            self.__messages[self.selected_board_game],
            return_all_metadata=True
        )

        self.__messages[self.selected_board_game].append(
            {
                "content": response_with_metadata.choices[0].message.content,
                "role": "assistant",
            }
        )

        return self.__convert_to_user_facing_message(
            self.__messages[self.selected_board_game][-1]
        )["content"]
