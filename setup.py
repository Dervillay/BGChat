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
chars_per_chunk = None


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


def download_embedding_model():
    global model

    if not os.path.isdir(EMBEDDING_MODEL_PATH):
        os.mkdir(EMBEDDING_MODEL_PATH)

    print_bold("Downloading embedding model...")
    if os.listdir(EMBEDDING_MODEL_PATH):
        print("Detected an existing embedding model")
    else:
        model = SentenceTransformer(EMBEDDING_MODEL_TO_USE)
        model.save(EMBEDDING_MODEL_PATH)
    print()


def initialise_embedding_model():
    global model
    global chars_per_chunk

    print_bold("Initialising embedding model...")
    model = SentenceTransformer(EMBEDDING_MODEL_PATH)

    # Assuming each token is ~4 characters long, we aim to make chunks
    # ~95% of the model's max input size. 95% is chosen to account for 
    # variance in the average token length, ensuring chunks are never
    # bigger than the model's context window
    chars_per_chunk = int(0.95 * 4 * model.tokenizer.model_max_length)
    print()


def initialise_database():
    global db
    global query

    print_bold("Initialising local database to store rulebook text and embeddings...")
    if os.path.isdir(DATABASE_PATH):
        print("Detected an existing database")

    # Creates a database if one doesn't already exist, or loads it if it does
    db = TinyDB(DATABASE_PATH)
    query = Query()
    print()


def extract_and_chunk_rulebook_text():
    global db
    global model
    global chars_per_chunk
    rulebooks = os.listdir(RULEBOOKS_PATH)

    print_bold("Extracting and chunking text from rulebooks...")
    for rulebook in rulebooks:
        if rulebook not in db.tables():
            table = db.table(rulebook)
            reader = PdfReader(f"{RULEBOOKS_PATH}/{rulebook}")

            print(f'Processing "{rulebook}"...')
            with tqdm(
                total=len(reader.pages),
                desc="Extracting text",
                unit=" pages"
            ) as progress_bar:
                for page_num, page in enumerate(reader.pages, start=1):
                    text = page.extract_text()
                    table.insert({"page_num": page_num, "text": text, "num_chars": len(text)})
                    progress_bar.update(1)

            with tqdm(
                total=len(reader.pages),
                desc="Chunking text",
                unit=" pages"
            ) as progress_bar:
                full_rulebook_text = "".join([page["text"] for page in table])
                num_chars_in_page = {page["page_num"]: page["num_chars"] for page in table}

                idx = 0
                curr_page_num = 0
                start_of_next_page = 0

                while idx < len(full_rulebook_text):
                    curr_page_num += 1
                    start_of_next_page += num_chars_in_page[curr_page_num]

                    curr_chunk_num = 0
                    curr_page_chunks = {}

                    while idx < start_of_next_page:
                        curr_page_chunks[curr_chunk_num] = full_rulebook_text[idx : idx + chars_per_chunk]
                        idx += chars_per_chunk // 2
                        curr_chunk_num += 1
                    table.update({"chunks": curr_page_chunks}, query["page_num"] == curr_page_num)

                    # When we finish chunking a page, set idx to the start of the next page,
                    # since the final chunk almost always overflows, causing idx to be well into the next page
                    idx = start_of_next_page
                    progress_bar.update(1)
        else:
            print(f'"{rulebook}" has already been processed')
        print()
    print()


def encode_rulebook_text():
    global db
    global model

    print_bold("Encoding text from rulebooks...")
    for rulebook in db.tables():
        if "embedding" not in rulebook:
            pages = db.table(rulebook)
            pages_sorted = sorted(pages.all(), key=lambda k: k["page_num"])

            print(f'Encoding text for "{rulebook}"')
            # e5-large-v2 is trained to encode queries and passages for semantic search,
            # which requires prepending "query" or "passage" to the text we want to encode
            text_to_encode = [f'passage: {page["text"]}' for page in pages_sorted]
            embeddings = model.encode(
                text_to_encode,
                normalize_embeddings=True,
                show_progress_bar=True
            )
            for i, embedding in enumerate(embeddings, start=1):
                pages.update({"embedding": embedding.tolist()}, query.page_num == i)
        else:
            print(f'"{rulebook}" has already been embedded')
    print()


if __name__ == "__main__":
    download_rulebooks()
    download_embedding_model()
    initialise_embedding_model()
    initialise_database()
    extract_and_chunk_rulebook_text()
    encode_rulebook_text()
