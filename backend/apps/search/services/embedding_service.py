"""
FR-09: Text chunk -> vector embedding via Hugging Face's free hosted Inference API.
Also includes CLIP-based image/visual embeddings for image search.

Uses the Hugging Face Inference API instead of loading models locally, so the
web process stays lightweight (no PyTorch/transformers/scipy/sklearn in memory).
Requires the HF_API_TOKEN environment variable (a free "read" token from
https://huggingface.co/settings/tokens).
"""
import os
import time

import requests

HF_API_TOKEN = os.environ.get("HF_API_TOKEN", "")
HF_API_URL = "https://router.huggingface.co/hf-inference/models/{model}/pipeline/feature-extraction"
TEXT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CLIP_MODEL = "sentence-transformers/clip-ViT-B-32"


def _headers(content_type: str | None = None) -> dict:
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def _post_with_retry(url: str, **kwargs):
    """
    The free Inference API can return 503 with 'estimated_time' while a model
    is cold-starting (it spins down when unused). Retry a few times so the
    first request after a period of inactivity doesn't just fail outright.
    Kept short (max ~45s) since some views make two of these calls back to
    back and need to stay well under gunicorn's request timeout.
    """
    last_response = None
    last_error = None
    for _ in range(3):
        try:
            response = requests.post(url, timeout=20, **kwargs)
        except requests.exceptions.RequestException as exc:
            last_error = exc
            time.sleep(5)
            continue
        if response.status_code != 503:
            return response
        last_response = response
        wait_seconds = min(response.json().get("estimated_time", 5), 15)
        time.sleep(wait_seconds)
    if last_response is not None:
        return last_response
    raise last_error or RuntimeError("Hugging Face Inference API request failed with no response")


def _mean_pool(output) -> list[float]:
    """
    The feature-extraction endpoint for sentence-transformers models returns
    a nested list (per-token vectors) for some models, or a single flat
    vector for others depending on the model's pipeline config. Normalize
    to a single flat vector either way.
    """
    if isinstance(output, list) and output and isinstance(output[0], list):
        if isinstance(output[0][0], list):
            output = output[0]
        n = len(output)
        dim = len(output[0])
        return [sum(row[i] for row in output) / n for i in range(dim)]
    return output


def embed_text(text: str) -> list[float]:
    url = HF_API_URL.format(model=TEXT_MODEL)
    response = _post_with_retry(
        url, headers=_headers("application/json"), json={"inputs": text}
    )
    response.raise_for_status()
    return _mean_pool(response.json())


def embed_batch(texts: list[str]) -> list[list[float]]:
    url = HF_API_URL.format(model=TEXT_MODEL)
    response = _post_with_retry(
        url, headers=_headers("application/json"), json={"inputs": texts}
    )
    response.raise_for_status()
    data = response.json()
    return [_mean_pool(item) for item in data]


def embed_image(file_path: str) -> list[float]:
    """CLIP image embedding - captures visual content (colors, layout, scene)."""
    url = HF_API_URL.format(model=CLIP_MODEL)
    with open(file_path, "rb") as f:
        image_bytes = f.read()
    response = _post_with_retry(url, headers=_headers(), data=image_bytes)
    response.raise_for_status()
    return _mean_pool(response.json())


def embed_text_clip(text: str) -> list[float]:
    """CLIP text embedding - same vector space as embed_image, for visual search queries."""
    url = HF_API_URL.format(model=CLIP_MODEL)
    response = _post_with_retry(
        url, headers=_headers("application/json"), json={"inputs": text}
    )
    response.raise_for_status()
    return _mean_pool(response.json())