"""
FR-09/10: Document + chunk + embedding storage (PRD section 15).

DEV NOTE: Using a plain JSON text field for embeddings so this works on SQLite.
When you deploy with real Postgres + pgvector (e.g. via Neon), swap `embedding`
for pgvector's VectorField and update vector_service.py to use a real
similarity query instead of the Python-side calculation.
"""
import json
from django.db import models
from apps.files.models import UploadedFile


class Document(models.Model):
    file = models.OneToOneField(UploadedFile, on_delete=models.CASCADE, related_name="document")
    extracted_text = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default="pending")


class DocumentChunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="chunks")
    chunk_text = models.TextField()
    chunk_index = models.PositiveIntegerField()
    embedding_json = models.TextField()  # JSON-encoded list[float], 384 dims
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["chunk_index"]

    def set_embedding(self, vector: list[float]):
        self.embedding_json = json.dumps(vector)

    def get_embedding(self) -> list[float]:
        return json.loads(self.embedding_json)


class SearchHistory(models.Model):
    """Logs each search a user runs, for the dashboard's 'Recent searches' list."""
    user = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="search_history")
    query = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]



class ImageEmbedding(models.Model):
    """
    Visual (CLIP) embedding for an image file - separate from the text-based
    DocumentChunk embeddings since CLIP uses a different vector space/dimension.
    Enables queries like "dark screenshot" or "photo of a whiteboard" that OCR
    text alone can't answer.
    """
    file = models.OneToOneField(UploadedFile, on_delete=models.CASCADE, related_name="image_embedding")
    embedding_json = models.TextField()  # JSON-encoded list[float], 512 dims (CLIP ViT-B-32)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_embedding(self, vector: list[float]):
        self.embedding_json = json.dumps(vector)

    def get_embedding(self) -> list[float]:
        return json.loads(self.embedding_json)