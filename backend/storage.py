import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing from backend/.env")

if not SUPABASE_SERVICE_KEY:
    raise RuntimeError("SUPABASE_SERVICE_KEY is missing from backend/.env")


supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
)


BUCKET_NAME = "documents"


def upload_file_to_storage(
    file_path_in_bucket: str,
    file_bytes: bytes
) -> None:

    supabase.storage.from_(BUCKET_NAME).upload(
        file_path_in_bucket,
        file_bytes,
        file_options={
            "content-type": "application/pdf"
        },
    )


def download_file_from_storage(
    file_path_in_bucket: str
) -> bytes:

    return supabase.storage.from_(
        BUCKET_NAME
    ).download(file_path_in_bucket)


def delete_file_from_storage(
    file_path_in_bucket: str
) -> None:

    supabase.storage.from_(
        BUCKET_NAME
    ).remove([file_path_in_bucket])