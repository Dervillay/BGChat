import openai
import json
import numpy as np
from typing import List
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
        self.__openai_model_to_use = open_ai_model_to_use
        self.__normalize_embeddings = normalize_embeddings
        self.__embedding_db = TinyDB(embedding_database_path)
        self.__rulebook_pages = self.__embedding_db.table("rulebook_pages")
        self.__embedding_model = SentenceTransformer(embedding_model_path)
        self.__openai_client = openai.OpenAI()
        self.selected_board_game = None
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

    def set_selected_board_game(self, selected_board_game):
        self.selected_board_game = selected_board_game

    def determine_board_game(
        self,
        question: str
    ):
        messages = self.__construct_messages(
            DETERMINE_BOARD_GAME_PROMPT_TEMPLATE.replace("<QUESTION>", question)
        )
        board_game = self.__call_openai_model(messages)

        if board_game in BOARD_GAMES:
            self.set_selected_board_game(board_game)
        elif board_game == UNKNOWN:
            return UNKNOWN_BOARD_GAME_RESPONSE

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
            .replace("<RULEBOOK_TEXTS>", rulebook_extracts_as_string)
            .replace("<QUESTION>", question)
        )
        return self.__call_openai_model(messages)


def main():
    board_brain = BoardBrain(
        OPENAI_MODEL_TO_USE,
        EMBEDDING_MODEL_PATH,
        DATABASE_PATH,
        NORMALIZE_EMBEDDINGS,
    )

    question = input(">")
    # TODO: Handle failing to determine board games
    selected_board_game = board_brain.determine_board_game(question)
    rulebook_extracts = board_brain.get_relevant_rulebook_extracts(selected_board_game, question)
    response = board_brain.explain_rules(question, rulebook_extracts)
    print(f"Selected board game: {selected_board_game}")
    print(f"Response: {response}")

    # TODO:
    # Load embedding model from local storage
    # Embed question
    # Iterate through all rulebook page embeddings to find highest match with question
    # Ask LLM if question can be answered using page contents
    # If yes, provide summarised explanation, rulebook name, page number, and link to preview that page of the rulebook
    # If no, return response that it doesn't appear to be answered by the rules, and provide link to google results to see if it's discussed on a forum


if __name__ == "__main__":
    main()
