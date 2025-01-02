import openai
import json
import ast
import os
import sys
import numpy as np
import regex as re
from typing import List
from urllib.parse import quote
from sentence_transformers import SentenceTransformer
from tinydb import TinyDB, where

# Adjust relative path to be able to import config
sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            '../../'
        )
    )
)

from config.board_brain_config import (
    OPENAI_MODEL_TO_USE,
    BOARD_GAMES,
    SYSTEM_PROMPT,
    DETERMINE_BOARD_GAME_PROMPT_TEMPLATE,
    EXPLAIN_RULES_PROMPT_TEMPLATE,
    UNKNOWN_VALUE,
    UNKNOWN_BOARD_GAME_RESPONSE,
    CITATION_REGEX_PATTERN,
)


class BoardBrain:
    def __init__(
        self,
        rulebooks_path: str,
        embedding_model_path: str,
        embedding_database_path: str,    
    ):
        self.selected_board_game: str = None
        self.known_board_games: List[str] = [board_game["name"] for board_game in BOARD_GAMES]
        self.message_history = {board_game["name"]: [] for board_game in BOARD_GAMES}
        self.__rulebooks_path = rulebooks_path
        self.__embedding_db = TinyDB(embedding_database_path)
        self.__rulebook_pages = self.__embedding_db.table("rulebook_pages")
        self.__embedding_model = SentenceTransformer(embedding_model_path)
        self.__openai_client = openai.OpenAI()


    def __construct_messages(
        self,
        question: str,
        prev_messages: List[dict] = []
    ):
        message = {
            "role": "user",
            "content": question,
        }
        return prev_messages + [message]


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
        messages: List[dict],
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


    def __parse_citations(self, text: str):
        def replace_citation_with_link(match):
            citation_str = match.group(0)
            citation_dict = ast.literal_eval(citation_str)
            return self.__construct_rulebook_link(citation_dict)

        return re.sub(
            CITATION_REGEX_PATTERN,
            replace_citation_with_link,
            text,
        )


    def set_selected_board_game(self, selected_board_game):
        self.selected_board_game = selected_board_game


    def determine_board_game(
        self,
        question: str
    ):
        messages = self.__construct_messages(
            DETERMINE_BOARD_GAME_PROMPT_TEMPLATE.replace("<QUESTION>", question)
        )
        response = self.__call_openai_model(messages)

        if response in self.known_board_games:
            self.set_selected_board_game(response)
        elif response == UNKNOWN_VALUE:
            return UNKNOWN_BOARD_GAME_RESPONSE
        else:
            raise ValueError(f"Received an unexpected response when attempting to determine board game: {response}")

        return self.selected_board_game


    def ask_question(
        self,
        question: str,
    ):
        # Get N most relevant chunks of rulebook text for the selected board game
        rulebook_extracts = self.__get_relevant_rulebook_extracts(question)
        rulebook_extracts_as_string = "\n".join([json.dumps(extract) for extract in rulebook_extracts])

        prompt = (
            EXPLAIN_RULES_PROMPT_TEMPLATE
            .replace("<SELECTED_BOARD_GAME>", self.selected_board_game)
            .replace("<RULEBOOK_EXTRACTS>", rulebook_extracts_as_string)
            .replace("<QUESTION>", question)
        )

        # If this is the first question about this board game, include the system prompt
        # otherwise, pass previous messages to the model so it retains context
        previous_messages_for_selected_board_game = self.message_history[self.selected_board_game]
        if len(previous_messages_for_selected_board_game) == 0:
            messages = self.__construct_messages(SYSTEM_PROMPT + prompt)
        else:
            messages = self.__construct_messages(prompt, previous_messages_for_selected_board_game)

        response_with_metadata = self.__call_openai_model(messages, return_all_metadata=True)

        # Parse the response and store it in message history
        response_message = response_with_metadata.choices[0].message
        response_message.content = self.__parse_citations(response_message.content)
        self.message_history[self.selected_board_game].append(response_message)

        return response_message.content
