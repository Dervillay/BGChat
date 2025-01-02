from app.board_brain import BoardBrain
from config.board_brain_config import OPENAI_MODEL_TO_USE


def main():
    board_brain = BoardBrain(
        rulebooks_path="../resources/rulebooks",
        embedding_model_path="../resources/embedding_model",
        embedding_database_path="./app/database.json",
    )

    while True:
        question = input(">")

        if board_brain.selected_board_game == None:
            board_brain.determine_board_game(question)
        
        response = board_brain.ask_question(question)

        print(f"\n\nSelected board game: {board_brain.selected_board_game}")
        print(f"Response: {response}")


if __name__ == "__main__":
    main()
