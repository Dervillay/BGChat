import openai
import json
import ast
import os
import numpy as np
import regex as re
from typing import List
from urllib.parse import quote
from sentence_transformers import SentenceTransformer
from tinydb import TinyDB, where
from config import (
    DETERMINE_BOARD_GAME_PROMPT_TEMPLATE,
    EXPLAIN_RULES_PROMPT_TEMPLATE,
    EMBEDDING_MODEL_PATH,
    DATABASE_PATH,
    OPENAI_MODEL_TO_USE,
    NORMALIZE_EMBEDDINGS,
    BOARD_GAMES,
    UNKNOWN,
    UNKNOWN_BOARD_GAME_RESPONSE,
    RULEBOOKS_PATH,
    DICTIONARY_REGEX_PATTERN,
)

# TODO: Refactor this into its own module
class BoardBrain:
    def __init__(
        self,
        open_ai_model_to_use: str,
        embedding_model_path: str,
        embedding_database_path: str,    
        normalize_embeddings: bool,
    ):
        self.selected_board_game = None
        self.known_board_games = [board_game["name"] for board_game in BOARD_GAMES]
        self.__openai_model_to_use = open_ai_model_to_use
        self.__normalize_embeddings = normalize_embeddings
        self.__embedding_db = TinyDB(embedding_database_path)
        self.__rulebook_pages = self.__embedding_db.table("rulebook_pages")
        self.__embedding_model = SentenceTransformer(embedding_model_path)
        self.__openai_client = openai.OpenAI()
        self.messages = []

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
            normalize_embeddings=self.__normalize_embeddings,
        )
        return embedding.tolist()
    
    def __call_openai_model(
        self,
        messages: List[dict],
        return_all_metadata: bool = False,
    ):
        try:
            response = self.__openai_client.chat.completions.create(
                model=self.__openai_model_to_use,
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

    def __construct_rulebook_link(
        self,
        citation: dict,
    ):
        rulebook_name = citation.get("rulebook_name")
        page_num = citation.get("page_num")

        if not rulebook_name or not page_num:
            print(f"WARN: Malformed citation detected:\n{json.dumps(citation)}")
            return

        path = os.path.abspath(f"{RULEBOOKS_PATH}/{self.selected_board_game}/{rulebook_name}.pdf")
        encoded_path = quote(path)

        return f"file:///{encoded_path}#page={page_num}"

    def __parse_citations(self, text: str):    
        def replace_citation_dict_with_link(match):
            dict_str = match.group(0)
            dict_obj = ast.literal_eval(dict_str)
            return self.__construct_rulebook_link(dict_obj)

        return re.sub(
            DICTIONARY_REGEX_PATTERN,
            replace_citation_dict_with_link,
            text
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
        elif response == UNKNOWN:
            return UNKNOWN_BOARD_GAME_RESPONSE
        else:
            raise ValueError(f"Received an unexpected response when attempting to determine board game: {response}")

        return self.selected_board_game
    
    def get_relevant_rulebook_extracts(
        self,
        board_game_name: str,
        question: str,
        n: int = 5,
    ):
        question_embedding = self.__embed_question(question)
        pages = self.__rulebook_pages.search(
            where("board_game_name") == board_game_name
        )

        results = []
        for page in pages:
            for chunk_id, chunk in page["chunks"].items():
                cosine_similarity = np.dot(
                    np.array(question_embedding),
                    np.array(chunk["embedding"]),
                )
                results.append(
                    {
                        "rulebook_name": page["rulebook_name"],
                        "page_num": page["page_num"],
                        "chunk_id": chunk_id,
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
    
    def explain_rules(
        self,
        question: str,
        rulebook_extracts: List
    ):
        rulebook_extracts_as_string = "\n".join([json.dumps(extract) for extract in rulebook_extracts])
        messages = self.__construct_messages(
            EXPLAIN_RULES_PROMPT_TEMPLATE
            .replace("<BOARD_GAME>", self.selected_board_game)
            .replace("<RULEBOOK_EXTRACTS>", rulebook_extracts_as_string)
            .replace("<QUESTION>", question)
        )
        response = self.__call_openai_model(messages)
        return self.__parse_citations(response)


def main():
    board_brain = BoardBrain(
        OPENAI_MODEL_TO_USE,
        EMBEDDING_MODEL_PATH,
        DATABASE_PATH,
        NORMALIZE_EMBEDDINGS,
    )

    question = input(">")
    selected_board_game = board_brain.determine_board_game(question)
    rulebook_extracts = board_brain.get_relevant_rulebook_extracts(selected_board_game, question)
    response = board_brain.explain_rules(question, rulebook_extracts)
    print(f"\n\nSelected board game: {selected_board_game}")
    print(f"Response: {response}")


if __name__ == "__main__":
    main()
