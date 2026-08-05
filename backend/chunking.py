import tiktoken
from pdf_extraction import ExtractedPage

# Tokenizer
_encoding = tiktoken.get_encoding("cl100k_base")


class TextChunk:
    def __init__(
        self,
        content: str,
        page_number: int,
        chunk_index: int,
    ):
        self.content = content
        self.page_number = page_number
        self.chunk_index = chunk_index

    def __repr__(self):
        preview = self.content[:60].replace("\n", " ")
        return (
            f"TextChunk(index={self.chunk_index}, "
            f"page={self.page_number}, "
            f"text='{preview}...')"
        )


def count_tokens(text: str) -> int:
    """
    Count the number of tokens in a text string.
    """
    return len(_encoding.encode(text))


def chunk_pages(
    pages: list[ExtractedPage],
    chunk_size_tokens: int = 500,
    overlap_tokens: int = 50,
) -> list[TextChunk]:

    all_tokens = []
    token_page_map = []

    # Convert all pages into one token stream
    for page in pages:
        page_tokens = _encoding.encode(page.text)

        all_tokens.extend(page_tokens)
        token_page_map.extend(
            [page.page_number] * len(page_tokens)
        )

    if not all_tokens:
        return []

    chunks = []

    step = chunk_size_tokens - overlap_tokens

    chunk_index = 0
    start = 0

    while start < len(all_tokens):

        end = min(
            start + chunk_size_tokens,
            len(all_tokens)
        )

        window_tokens = all_tokens[start:end]

        window_text = _encoding.decode(window_tokens)

        window_pages = token_page_map[start:end]

        page_number = max(
            set(window_pages),
            key=window_pages.count
        )

        chunks.append(
            TextChunk(
                content=window_text,
                page_number=page_number,
                chunk_index=chunk_index,
            )
        )

        chunk_index += 1
        start += step

    return chunks