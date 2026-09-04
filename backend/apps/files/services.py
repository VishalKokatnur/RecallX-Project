"""
FR-04: File validation (type/size/extension) — PRD section 25.
"""
import os
from django.conf import settings


def validate_file(uploaded_file):
    ext = os.path.splitext(uploaded_file.name)[1].lower()
    if ext not in settings.ALLOWED_UPLOAD_EXTENSIONS:
        raise ValueError(f"Unsupported file extension: {ext}")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if uploaded_file.size > max_bytes:
        raise ValueError(f"File exceeds max size of {settings.MAX_UPLOAD_SIZE_MB}MB")

    return ext


def detect_file_type(ext: str) -> str:
    if ext in [".jpg", ".jpeg", ".png"]:
        return "image"
    if ext == ".pdf":
        return "pdf"
    if ext == ".docx":
        return "docx"
    if ext == ".txt":
        return "txt"
    if ext == ".wav":
        return "audio"
    raise ValueError("Unknown file type")