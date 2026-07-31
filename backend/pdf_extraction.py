import fitz  # PyMuPDF


class ExtractedPage:
    """Represents the extracted text from a single page of a PDF."""

    def __init__(self, page_number: int, text: str):
        self.page_number = page_number
        self.text = text

    def __repr__(self):
        preview = self.text[:60].replace("\n", " ")
        return f"ExtractedPage(page={self.page_number}, text='{preview}...')"


def extract_text_from_pdf(file_path: str) -> list[ExtractedPage]:
    """
    Opens a PDF and extracts text page by page.
    Returns a list of ExtractedPage objects.
    """

    pages: list[ExtractedPage] = []

    with fitz.open(file_path) as pdf:
        for page_index in range(len(pdf)):
            page = pdf[page_index]

            text = page.get_text()

            pages.append(
                ExtractedPage(
                    page_number=page_index + 1,
                    text=text
                )
            )

    return pages


def looks_like_scanned_page(
    page_text: str,
    min_chars: int = 20
) -> bool:
    """
    Checks whether a page has very little extracted text.
    This can indicate a scanned/image PDF.
    """

    return len(page_text.strip()) < min_chars


def get_extraction_summary(
    pages: list[ExtractedPage]
) -> dict:
    """
    Returns extraction information:
    - total pages
    - pages that may be scanned
    - total extracted characters
    """

    total_pages = len(pages)

    scanned_like = [
        page.page_number
        for page in pages
        if looks_like_scanned_page(page.text)
    ]

    total_chars = sum(
        len(page.text)
        for page in pages
    )

    return {
        "total_pages": total_pages,
        "pages_possibly_scanned": scanned_like,
        "total_characters_extracted": total_chars,
    }