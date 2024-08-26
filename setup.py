import os
import requests
from tqdm import tqdm
from tinydb import TinyDB
from pypdf import PdfReader
from config import (
    RULEBOOKS_PATH,
    BOARD_GAMES,
    DOWNLOAD_BLOCK_SIZE,
    DATABASE_PATH,
    BOLD_START,
    BOLD_END
)

def download_rulebooks():
    if not os.path.exists(RULEBOOKS_PATH):
        os.mkdir(RULEBOOKS_PATH)

    print(f"{BOLD_START}Downloading rulebooks...{BOLD_END}")
    for board_game in BOARD_GAMES:
        for rulebook in board_game["rulebooks"]:
            filename = f'{board_game["name"]} - {rulebook["name"]}.pdf'
            filepath = f'{RULEBOOKS_PATH}/{filename}'

            if not os.path.exists(filepath):
                try:
                    response = requests.get(rulebook["download_url"], stream=True)
                    response.raise_for_status()

                    response_size = int(response.headers.get("content-length", 0))

                    with tqdm(
                        total=response_size,
                        unit="B",
                        unit_scale=True,
                        desc=f'Downloading "{filename}"'
                    ) as progress_bar:
                        with open(filepath, "wb") as file:
                            for chunk in response.iter_content(DOWNLOAD_BLOCK_SIZE):
                                file.write(chunk)
                                progress_bar.update(len(chunk))

                except requests.exceptions.HTTPError as error:
                    print(f'Failed to download rulebook "{rulebook["name"]}" for "{board_game["name"]}": {error}')
            else:
                print(f'"{filename}" already exists')
    print()


def extract_and_store_rulebook_text():
    db = TinyDB(DATABASE_PATH)
    rulebooks = os.listdir(RULEBOOKS_PATH)

    print(f"{BOLD_START}Extracting text from rulebooks...{BOLD_END}")
    for rulebook in rulebooks:
        if rulebook not in db.tables():
            table = db.table(rulebook)
            reader = PdfReader(f"{RULEBOOKS_PATH}/{rulebook}")

            with tqdm(
                total=len(reader.pages),
                desc=f'Processing "{rulebook}"',
                unit=" pages"
            ) as progress_bar:
                for page_num, page in enumerate(reader.pages, start=1):
                    text = page.extract_text()
                    table.insert({"page_num": page_num, "text": text})
                    progress_bar.update(1)
        else:
            print(f'"{rulebook}" has already been processed')
    print()


if __name__ == "__main__":
    download_rulebooks()
    extract_and_store_rulebook_text()
