"""
FR-03/04/05/06: File storage + metadata.
Matches PRD section 15 'Files Table'.
"""
from django.conf import settings
from django.db import models


def user_upload_path(instance, filename):
    return f"uploads/{instance.user_id}/{filename}"


class UploadedFile(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]
    FILE_TYPE_CHOICES = [
        ("image", "Image"),
        ("pdf", "PDF"),
        ("docx", "DOCX"),
        ("txt", "TXT"),
        ("audio", "Audio"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to=user_upload_path)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES)
    file_size = models.PositiveIntegerField(help_text="Size in bytes")
    processing_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    extracted_text = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.file_name
