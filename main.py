from openai import OpenAI
from config import DETERMINE_BOARD_GAME_PROMPT_TEMPLATE


def determine_board_game(client, question):
    completion = client.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=DETERMINE_BOARD_GAME_PROMPT_TEMPLATE.replace("<QUESTION>", question)
    )
    return completion.choices[0].text


def main():
    client = OpenAI()
    question = input(">")
    board_game = determine_board_game(client, question)
    print(board_game)


if __name__ == "__main__":
    main()
