"""
FR-10/11/12: Similarity search with optional file-type and date filtering.
Also includes CLIP-based visual similarity search for images.
DEV NOTE: Pure-Python cosine similarity over JSON-stored embeddings (SQLite-friendly).
When deployed with pgvector (e.g. Neon), replace with a real SQL-side vector query.
"""
import math
from ..models import DocumentChunk, ImageEmbedding


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def similarity_search(query_embedding, user, file_type=None, date_range=None, top_k: int = 10):
    """Text-based search over DocumentChunk (OCR/PDF/DOCX/TXT content)."""
    qs = DocumentChunk.objects.filter(document__file__user=user)

    if file_type:
        qs = qs.filter(document__file__file_type=file_type)

    if date_range:
        start, end = date_range
        qs = qs.filter(document__file__created_at__gte=start, document__file__created_at__lte=end)

    scored = []
    for chunk in qs.select_related("document__file"):
        score = _cosine_similarity(query_embedding, chunk.get_embedding())
        scored.append((chunk, score))

    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:top_k]


def visual_similarity_search(clip_query_embedding, user, date_range=None, top_k: int = 5):
    """
    Visual search over ImageEmbedding (CLIP) - matches by appearance/content
    of the image itself, not OCR text. Only applies to image files.
    """
    qs = ImageEmbedding.objects.filter(file__user=user)

    if date_range:
        start, end = date_range
        qs = qs.filter(file__created_at__gte=start, file__created_at__lte=end)

    scored = []
    for img_emb in qs.select_related("file"):
        score = _cosine_similarity(clip_query_embedding, img_emb.get_embedding())
        scored.append((img_emb, score))

    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:top_k]