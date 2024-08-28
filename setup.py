import os
import requests
from tqdm import tqdm
from tinydb import TinyDB, Query
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
query = None
model = None


def download_embedding_model():
    global model

    if not os.path.isdir(EMBEDDING_MODEL_PATH):
        os.mkdir(EMBEDDING_MODEL_PATH)

    print_bold(f'Downloading embedding model...')
    if os.listdir(EMBEDDING_MODEL_PATH):
        print("Detected an existing embedding model. Loading from local storage")
        model = SentenceTransformer(EMBEDDING_MODEL_PATH, trust_remote_code=True)
    else:
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


def initialise_db():
    global db
    global query
    db = TinyDB(DATABASE_PATH)
    query = Query()


def extract_text_from_rulebooks():
    global db
    rulebooks = os.listdir(RULEBOOKS_PATH)

    print_bold("Extracting text from rulebooks...")
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
                    table.insert({"page_num": page_num, "text": text})
                    progress_bar.update(1)
        else:
            print(f'"{rulebook}" has already been processed')
    print()


def encode_text_from_rulebooks():
    global db
    global model

    print_bold("Encoding text from rulebooks...")
    for rulebook in db.tables():
        if "embedding" not in rulebook:
            pages = db.table(rulebook)
            pages_sorted = sorted(pages.all(), key=lambda k: k["page_num"])

            print(f'Encoding text for "{rulebook}"')
            text_to_encode = [page["text"] for page in pages_sorted]
            embeddings = model.encode(text_to_encode, show_progress_bar=True)
            for i, embedding in enumerate(embeddings, start=1):
                pages.update({"embedding": embedding}, query.page_num == i)
        else:
            print(f'"{rulebook}" has already been embedded')
    print()


if __name__ == "__main__":
    download_embedding_model()
    download_rulebooks()
    initialise_db()
    extract_text_from_rulebooks()
    encode_text_from_rulebooks()
