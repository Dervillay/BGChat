import os
import requests
from tqdm import tqdm
from config import RULEBOOK_DOWNLOAD_PATH, BOARD_GAMES

def download_rulebooks():
    if not os.path.exists(RULEBOOK_DOWNLOAD_PATH):
        os.mkdir(RULEBOOK_DOWNLOAD_PATH)

    for board_game in BOARD_GAMES:
        for rulebook in board_game["rulebooks"]:
            filename = f'{board_game["name"]} - {rulebook["name"]}'
            filepath = f'{RULEBOOK_DOWNLOAD_PATH}/{filename}.pdf'

            if not os.path.exists(filepath):
                try:
                    response = requests.get(rulebook["download_url"], stream=True)
                    response.raise_for_status()

                    response_size = int(response.headers.get("content-length", 0))
                    block_size = 1024

                    with tqdm(
                        total=response_size,
                        unit="B",
                        unit_scale=True,
                        desc=f'Downloading "{filename}"'
                    ) as progress_bar:
                        with open(filepath, "wb") as file:
                            for chunk in response.iter_content(block_size):
                                progress_bar.update(len(chunk))
                                file.write(chunk)

                except requests.exceptions.HTTPError as error:
                    print(f'Unable to download rulebook "{rulebook["name"]}" for "{board_game["name"]}": {error}')


if __name__ == "__main__":
    download_rulebooks()