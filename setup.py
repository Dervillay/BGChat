import os
import requests
from tqdm import tqdm
from tinydb import TinyDB, Query
from pypdf import PdfReader
from config import RULEBOOKS_PATH, BOARD_GAMES, DATABASE_PATH

def download_rulebooks():
    if not os.path.exists(RULEBOOKS_PATH):
        os.mkdir(RULEBOOKS_PATH)

    print("DOWNLOADING RULEBOOKS...")
    for board_game in BOARD_GAMES:
        for rulebook in board_game["rulebooks"]:
            filename = f'{board_game["name"]} - {rulebook["name"]}'
            filepath = f'{RULEBOOKS_PATH}/{filename}.pdf'

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
            else:
                print(f'"{filename}" already exists')
    print()


def extract_and_store_rulebook_text():
    db = TinyDB(DATABASE_PATH)
    rulebooks = os.listdir(RULEBOOKS_PATH)

    print("EXTRACTING TEXT FROM RULEBOOKS...")
    for rulebook in rulebooks:
        if rulebook not in db.tables():
            table = db.table(rulebook)
            reader = PdfReader(f"{RULEBOOKS_PATH}/{rulebook}")

            for page_no, page in enumerate(reader.pages, start=1):
                text = page.extract_text()
                table.insert({"page": page_no, "text": text})
        else:
            print(f'"{rulebook}" has already been processed')
    print()


if __name__ == "__main__":
    download_rulebooks()
    extract_and_store_rulebook_text()