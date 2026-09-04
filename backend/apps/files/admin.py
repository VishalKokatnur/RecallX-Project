from django.contrib import admin
from .models import UploadedFile
@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ["id", "file_name", "file_type", "processing_status", "user"]
    readonly_fields = ["extracted_text"]