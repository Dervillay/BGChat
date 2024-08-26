import os
import requests
from tqdm import tqdm
from tinydb import TinyDB
from tinydb.table import Document
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from utils import print_bold
from config import (
    RULEBOOKS_PATH,
    BOARD_GAMES,
    DOWNLOAD_BLOCK_SIZE,
    DATABASE_PATH,
    EMBEDDING_MODEL_TO_USE,
    EMBEDDING_MODEL_PATH,
)


db = None
model = None


def download_embedding_model():
    if not os.path.isdir(EMBEDDING_MODEL_PATH):
        os.mkdir(EMBEDDING_MODEL_PATH)

    print_bold("Downloading embedding model...")
    if os.listdir(EMBEDDING_MODEL_PATH):
        print("Detected an existing embedding model. Doing nothing")
    else:
        global model
        model = SentenceTransformer(EMBEDDING_MODEL_TO_USE, trust_remote_code=True)
        model.save(EMBEDDING_MODEL_PATH)
    print()


def download_rulebooks():
    if not os.path.exists(RULEBOOKS_PATH):
        os.mkdir(RULEBOOKS_PATH)

    print_bold("Downloading rulebooks...")
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


def extract_and_embed_rulebook_text():
    global db
    global model
    db = TinyDB(DATABASE_PATH)
    rulebooks = os.listdir(RULEBOOKS_PATH)

    print_bold("Extracting and encoding text from rulebooks...")
    for rulebook in rulebooks:
        if rulebook not in db.tables():
            table = db.table(rulebook)
            reader = PdfReader(f"{RULEBOOKS_PATH}/{rulebook}")

            with tqdm(
                total=len(reader.pages),
                desc=f'Extracting text from "{rulebook}"',
                unit=" pages"
            ) as progress_bar:
                for page_num, page in enumerate(reader.pages, start=1):
                    text = page.extract_text()
                    table.insert(
                        Document({"text": text}, doc_id=page_num)
                    )
                    progress_bar.update(1)

            # TODO: Embed text for rulebook
        else:
            print(f'"{rulebook}" has already been processed')
    print()


if __name__ == "__main__":
    download_embedding_model()
    download_rulebooks()
    extract_and_embed_rulebook_text()
