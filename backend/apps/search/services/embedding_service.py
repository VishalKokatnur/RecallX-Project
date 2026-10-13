"""
FR-09: Text chunk -> vector embedding, computed locally with ONNX Runtime (fastembed).

No hosted inference API and no PyTorch. Text embeddings use all-MiniLM-L6-v2.
Visual (CLIP) embeddings are optional: set ENABLE_CLIP=1 to turn them on
(they need more memory than a small free instance may have).
Model files are cached in backend/.model_cache (override with EMBED_CACHE_DIR).
"""
import os
import threading

CACHE_DIR = os.environ.get(
    "EMBED_CACHE_DIR",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".model_cache")),
)

TEXT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CLIP_TEXT_MODEL = "Qdrant/clip-ViT-B-32-text"
CLIP_IMAGE_MODEL = "Qdrant/clip-ViT-B-32-vision"
CLIP_ENABLED = os.environ.get("ENABLE_CLIP", "").lower() in ("1", "true", "yes")

_lock = threading.Lock()
_models = {}


def _get(key, loader):
    model = _models.get(key)
    if model is None:
        with _lock:
            model = _models.get(key)
            if model is None:
                model = loader()
                _models[key] = model
    return model


def _require_clip():
    if not CLIP_ENABLED:
        raise RuntimeError("Visual (CLIP) embeddings are disabled. Set ENABLE_CLIP=1 to enable them.")


def _text_model():
    def load():
        from fastembed import TextEmbedding
        return TextEmbedding(model_name=TEXT_MODEL, cache_dir=CACHE_DIR)
    return _get("text", load)


def _clip_text_model():
    _require_clip()

    def load():
        from fastembed import TextEmbedding
        return TextEmbedding(model_name=CLIP_TEXT_MODEL, cache_dir=CACHE_DIR)
    return _get("clip_text", load)


def _clip_image_model():
    _require_clip()

    def load():
        from fastembed import ImageEmbedding
        return ImageEmbedding(model_name=CLIP_IMAGE_MODEL, cache_dir=CACHE_DIR)
    return _get("clip_image", load)


def embed_text(text: str) -> list[float]:
    return next(iter(_text_model().embed([text]))).tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    return [v.tolist() for v in _text_model().embed(texts)]


def embed_image(file_path: str) -> list[float]:
    """CLIP image embedding - captures visual content (colors, layout, scene)."""
    return next(iter(_clip_image_model().embed([file_path]))).tolist()


def embed_text_clip(text: str) -> list[float]:
    """CLIP text embedding - same vector space as embed_image, for visual search queries."""
    return next(iter(_clip_text_model().embed([text]))).tolist()


def warm_up():
    """Download/load models once (used at build time so requests don't pay for it)."""
    embed_text("warm up")
    if CLIP_ENABLED:
        embed_text_clip("warm up")


if __name__ == "__main__":
    warm_up()