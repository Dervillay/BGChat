import os
import requests
from tqdm import tqdm
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

from app.config.paths import RULEBOOKS_PATH, EMBEDDING_MODEL_PATH
from app.config.models import EMBEDDING_MODEL_TO_USE
from app.config.board_games import BOARD_GAMES
from app.config.constants import DEFAULT_TIMEOUT_SECONDS
from app.mongodb_client import MongoDBClient

DOWNLOAD_BLOCK_SIZE = 1024


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
                    response = requests.get(
                        rulebook["download_url"],
                        stream=True,
                        timeout=DEFAULT_TIMEOUT_SECONDS
                    )
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
                    print(
                        f'Failed to download "{rulebook["name"]}" for "{board_game["name"]}": {error}'
                    )
            else:
                print(f'"{rulebook_path}" already exists')
    print()


def download_embedding_model():
    os.makedirs(EMBEDDING_MODEL_PATH, exist_ok=True)

    print_bold("Downloading embedding model...")
    if os.listdir(EMBEDDING_MODEL_PATH):
        print("Detected an existing embedding model, will use that")
    else:
        temp_model = SentenceTransformer(EMBEDDING_MODEL_TO_USE)
        temp_model.save(EMBEDDING_MODEL_PATH)
    print()


def initialise_embedding_model():
    print_bold("Initialising embedding model...")
    model = SentenceTransformer(EMBEDDING_MODEL_PATH)
    print("Done\n")
    return model


def process_and_store_rulebook_text(
    mongodb_client: MongoDBClient,
    model: SentenceTransformer
):
    print_bold("Processing and storing text from rulebooks...")
    for board_game in BOARD_GAMES:

        existing_rulebooks = mongodb_client.get_rulebooks(board_game["name"])

        for rulebook in board_game["rulebooks"]:
            reader = PdfReader(f'{RULEBOOKS_PATH}/{board_game["name"]}/{rulebook["name"]}.pdf')
            page_count = len(reader.pages)

            existing_rulebook_pages = existing_rulebooks.get(rulebook["name"], [])

            print_bold(f'\n{board_game["name"]} - {rulebook["name"]}')
            if len(existing_rulebook_pages) != page_count:
                # Remove existing entries if they don't match the number of pages in the PDF
                # (i.e. they've been parsed incorrectly or come from an old rulebook)
                mongodb_client.delete_rulebook(board_game["name"], rulebook["name"])

                with tqdm(
                    total=page_count,
                    desc="Extracting and embedding pages",
                    unit="page"
                ) as progress_bar:
                    pages_to_store = []
                    for page_num, page in enumerate(reader.pages, start=1):

                        text = page.extract_text()

                        # e5-large-v2 is trained to encode queries and passages for semantic search,
                        # which requires prepending "query" or "passage" to the text we want to encode
                        embedding = model.encode(
                            f"passage: {text}",
                            normalize_embeddings=True,
                            show_progress_bar=False
                        )

                        pages_to_store.append({
                            "page_num": page_num,
                            "text": text,
                            "embedding": embedding.tolist()
                        })

                        progress_bar.update(1)

                mongodb_client.store_rulebook(board_game["name"], rulebook["name"], pages_to_store)

            else:
                print("This rulebook already exists in the database")
    print()


if __name__ == "__main__":
    download_rulebooks()
    download_embedding_model()

    mongodb_client = MongoDBClient()
    embedding_model = initialise_embedding_model()

    process_and_store_rulebook_text(mongodb_client, embedding_model)
