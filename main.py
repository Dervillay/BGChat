import openai
from config import (
    DETERMINE_BOARD_GAME_PROMPT_TEMPLATE,
    EMBEDDING_MODEL_PATH,
    DATABASE_PATH,
    OPENAI_MODEL_TO_USE,
)
from typing import List
from sentence_transformers import SentenceTransformer
from tinydb import TinyDB, Query


class BoardBrain:
    def __init__(
        self,
        open_ai_model_to_use: str
    ):
        self.open_ai_model_to_use = open_ai_model_to_use
        self.client = openai.OpenAI()
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
    
    def __call_model(
        self,
        messages: List[dict],
        return_all_metadata: bool = False,
    ):
        try:
            response = self.client.chat.completions.create(
                model=self.open_ai_model_to_use,
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

    def determine_board_game(self, question: str):
        messages = self.__construct_messages(
            DETERMINE_BOARD_GAME_PROMPT_TEMPLATE.replace("<QUESTION>", question)
        )
        return self.__call_model(messages)


def main():
    board_brain = BoardBrain(OPENAI_MODEL_TO_USE)
    question = input(">")
    response = board_brain.determine_board_game(question)
    print(response)

    # model = SentenceTransformer(EMBEDDING_MODEL_PATH)
    # question = input(">")
    # question_embedding = model.encode([f"query: {question}"], normalize_embeddings=True)

    # db = TinyDB(DATABASE_PATH)
    # query = Query()

    # test_rulebook = "Gloomhaven: Jaws of the Lion - Glossary.pdf"
    # pages = db.table(test_rulebook)
    # TODO: Test embedding scores are high for relevant passages

    # TODO:
    # Load embedding model from local storage
    # Embed question
    # Iterate through all rulebook page embeddings to find highest match with question
    # Ask LLM if question can be answered using page contents
    # If yes, provide summarised explanation, rulebook name, page number, and link to preview that page of the rulebook
    # If no, return response that it doesn't appear to be answered by the rules, and provide link to google results to see if it's discussed on a forum


if __name__ == "__main__":
    main()
