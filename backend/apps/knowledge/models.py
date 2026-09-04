"""
Placeholder for Phase 8 'Advanced Features':
knowledge timeline, tags (PRD section 15 Tags/File Tags tables), memory map.
"""
from django.db import models
from apps.files.models import UploadedFile


class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class FileTag(models.Model):
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE, related_name="tags")
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("file", "tag")
