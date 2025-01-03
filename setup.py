import os
import requests
from tqdm import tqdm
from tinydb import TinyDB, where
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from config.board_brain_config import (
    RULEBOOKS_PATH,
    EMBEDDING_MODEL_PATH,
    DATABASE_PATH,
    BOARD_GAMES,
    EMBEDDING_MODEL_TO_USE,
)

DOWNLOAD_BLOCK_SIZE = 1024

db = None
model = None
chars_per_chunk = None


def print_bold(text):
    print(f"\033[1m{text}\033[0m")


def download_rulebooks():
    os.makedirs(RULEBOOKS_PATH, exist_ok=True)

    print_bold("Downloading rulebooks for board games...")
    for board_game in BOARD_GAMES:
        print_bold(f'\n{board_game["name"]}')
        board_game_rulebooks_path = f'{RULEBOOKS_PATH}/{board_game["name"]}'
        os.makedirs(board_game_rulebooks_path, exist_ok=True)

        for rulebook in board_game["rulebooks"]:
            rulebook_path = f'{board_game_rulebooks_path}/{rulebook["name"]}.pdf'

            if not os.path.exists(rulebook_path):
                try:
                    response = requests.get(rulebook["download_url"], stream=True)
                    response.raise_for_status()
                    response_size = int(response.headers.get("content-length", 0))

                    with tqdm(
                        total=response_size,
                        unit="B",
                        unit_scale=True,
                        desc=rulebook["name"],
                    ) as progress_bar:
                        with open(rulebook_path, "wb") as file:
                            for chunk in response.iter_content(DOWNLOAD_BLOCK_SIZE):
                                file.write(chunk)
                                progress_bar.update(len(chunk))
                except requests.exceptions.HTTPError as error:
                    print(f'Failed to download "{rulebook["name"]}" for "{board_game["name"]}": {error}')
            else:
                print(f'"{rulebook_path}" already exists')
    print()


def download_embedding_model():
    global model

    os.makedirs(EMBEDDING_MODEL_PATH, exist_ok=True)

    print_bold("Downloading embedding model...")
    if os.listdir(EMBEDDING_MODEL_PATH):
        print("Detected an existing embedding model, will use that")
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
    print("Done\n")


def initialise_database():
    global db
    global query

    print_bold("Initialising local database to store rulebook text and embeddings...")
    if os.path.isdir(DATABASE_PATH):
        print("Detected an existing database. Loading...")

    # Creates a database if one doesn't already exist, or loads it if it does
    db = TinyDB(DATABASE_PATH)
    print("Done\n")


def process_and_store_rulebook_text():
    global db
    global model
    global chars_per_chunk

    rulebook_pages_table = db.table("rulebook_pages")

    print_bold("Processing and storing text from rulebooks...")
    for board_game in BOARD_GAMES:

        for rulebook in board_game["rulebooks"]:
            reader = PdfReader(f'{RULEBOOKS_PATH}/{board_game["name"]}/{rulebook["name"]}.pdf')
            page_count = len(reader.pages)
            
            current_board_game_and_rulebook_rows = (
                (where("board_game_name") == board_game["name"])
                & (where("rulebook_name") == rulebook["name"])
            )
            existing_pages_in_table = rulebook_pages_table.search(current_board_game_and_rulebook_rows)

            print_bold(f'\n{board_game["name"]} - {rulebook["name"]}')
            if len(existing_pages_in_table) != page_count:
                # Remove existing entries if they don't match the number of pages in the PDF 
                # (i.e. they've been parsed incorrectly or come from an old rulebook)
                rulebook_pages_table.remove(current_board_game_and_rulebook_rows)

                with tqdm(
                    total=len(reader.pages),
                    desc="Extracting text",
                    unit="page"
                ) as progress_bar:
                    for page_num, page in enumerate(reader.pages, start=1):
                        rulebook_pages_table.insert(
                            {
                                "board_game_name": board_game["name"],
                                "rulebook_name": rulebook["name"],
                                "page_num": page_num,
                                "text": page.extract_text(),
                            }
                        )
                        progress_bar.update(1)

                with tqdm(
                    total=len(reader.pages),
                    desc="Chunking text",
                    unit="page"
                ) as progress_bar:
                    rulebook_pages = sorted(
                        rulebook_pages_table.search(current_board_game_and_rulebook_rows),
                         key=lambda x: x["page_num"]
                    )
                    full_rulebook_text = "".join([page["text"] for page in rulebook_pages])
                    num_chars_in_page = {page["page_num"]: len(page["text"]) for page in rulebook_pages}

                    idx = 0
                    curr_page_num = 1
                    start_of_next_page = 0

                    while idx < len(full_rulebook_text):
                        start_of_next_page += num_chars_in_page[curr_page_num]
                        curr_chunk_id = 0
                        curr_page_chunks = {}

                        while idx < start_of_next_page:
                            curr_page_chunks[curr_chunk_id] = {
                                "text": full_rulebook_text[idx : idx + chars_per_chunk]
                            }
                            idx += chars_per_chunk // 2
                            curr_chunk_id += 1

                        rulebook_pages_table.update(
                            {"chunks": curr_page_chunks},
                            current_board_game_and_rulebook_rows
                            & (where("page_num") == curr_page_num)
                        )

                        # When we finish chunking a page, set idx to the start of the next page,
                        # since the final chunk of a page almost always overflows, causing idx to be well into the next one
                        idx = start_of_next_page
                        curr_page_num += 1
                        progress_bar.update(1)

                with tqdm(
                    total=len(reader.pages),
                    desc="Embedding chunked text",
                    unit="page"
                ) as progress_bar:
                    rulebook_pages = sorted(
                        rulebook_pages_table.search(current_board_game_and_rulebook_rows),
                         key=lambda x: x["page_num"]
                    )
                    for page in rulebook_pages:
                        chunks = page["chunks"]
                        sorted_chunk_ids = sorted(chunks.keys())
                        
                        # e5-large-v2 is trained to encode queries and passages for semantic search,
                        # which requires prepending "query" or "passage" to the text we want to encode
                        text_to_encode = [f'passage: {chunks[chunk_id]["text"]}' for chunk_id in sorted_chunk_ids]
                        chunk_embeddings = model.encode(text_to_encode, normalize_embeddings=True)

                        for idx, chunk_id in enumerate(sorted_chunk_ids):
                            chunks[chunk_id]["embedding"] = chunk_embeddings[idx].tolist()

                        rulebook_pages_table.update(
                            {"chunks": chunks},
                            current_board_game_and_rulebook_rows
                            & (where("page_num") == page["page_num"])
                        )
                        progress_bar.update(1)
            else:
                print("This rulebook has already been processed")
    print()


if __name__ == "__main__":
    download_rulebooks()
    download_embedding_model()
    initialise_embedding_model()
    initialise_database()
    process_and_store_rulebook_text()
