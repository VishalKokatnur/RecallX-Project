"""
AI-generated tags: simple keyword-frequency extraction from a file's extracted text.
No extra ML model needed - reuses text already produced in Phase 4.
"""
import re
from collections import Counter

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
    "been", "being", "in", "on", "at", "to", "for", "of", "with", "by",
    "from", "as", "this", "that", "these", "those", "it", "its", "i", "you",
    "he", "she", "we", "they", "not", "no", "yes", "do", "does", "did",
    "have", "has", "had", "will", "would", "can", "could", "should", "may",
    "might", "must", "shall", "if", "then", "else", "so", "than", "too",
    "very", "just", "about", "into", "over", "after", "before", "up",
    "down", "out", "off", "again", "further", "once", "here", "there",
    "when", "where", "why", "how", "all", "any", "both", "each", "few",
    "more", "most", "other", "some", "such", "only", "own", "same", "our",
    "your", "their", "my", "me", "him", "her", "them", "us",
}

MIN_WORD_LEN = 4
MAX_TAGS = 5


def generate_tags(text: str) -> list[str]:
    """Returns up to MAX_TAGS lowercase keyword tags from the given text."""
    if not text:
        return []

    words = re.findall(r"[a-zA-Z][a-zA-Z0-9\-]{2,}", text.lower())
    words = [w for w in words if len(w) >= MIN_WORD_LEN and w not in STOPWORDS]

    if not words:
        return []

    counts = Counter(words)
    top = [word for word, _ in counts.most_common(MAX_TAGS)]
    return top


def apply_tags_to_file(uploaded_file, text: str):
    """Generates tags from text and links them to the given UploadedFile."""
    from .models import Tag, FileTag

    tag_names = generate_tags(text)

    FileTag.objects.filter(file=uploaded_file).delete()  # clear old tags if reprocessing

    for name in tag_names:
        tag, _ = Tag.objects.get_or_create(name=name)
        FileTag.objects.get_or_create(file=uploaded_file, tag=tag)

    return tag_names