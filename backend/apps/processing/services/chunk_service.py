"""
FR-08: Split cleaned text into overlapping chunks.
Defaults come from settings.CHUNK_SIZE_WORDS / CHUNK_OVERLAP_WORDS.
"""
from django.conf import settings


def chunk_text(text: str, size: int = None, overlap: int = None) -> list[str]:
    size = size or settings.CHUNK_SIZE_WORDS
    overlap = overlap or settings.CHUNK_OVERLAP_WORDS
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + size
        chunks.append(" ".join(words[start:end]))
        start += size - overlap
    return chunks
