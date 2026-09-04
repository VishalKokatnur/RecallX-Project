"""
FR-09: Text chunk -> vector embedding via Sentence Transformers.
Also includes CLIP-based image/visual embeddings for image search.
"""
from sentence_transformers import SentenceTransformer
from PIL import Image

_model = None
_clip_model = None


def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _get_clip_model():
    global _clip_model
    if _clip_model is None:
        _clip_model = SentenceTransformer("clip-ViT-B-32")
    return _clip_model


def embed_text(text: str) -> list[float]:
    model = _get_model()
    return model.encode(text).tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    model = _get_model()
    return model.encode(texts).tolist()


def embed_image(file_path: str) -> list[float]:
    """CLIP image embedding - captures visual content (colors, layout, scene)."""
    clip_model = _get_clip_model()
    image = Image.open(file_path).convert("RGB")
    return clip_model.encode(image).tolist()


def embed_text_clip(text: str) -> list[float]:
    """CLIP text embedding - same vector space as embed_image, for visual search queries."""
    clip_model = _get_clip_model()
    return clip_model.encode(text).tolist()