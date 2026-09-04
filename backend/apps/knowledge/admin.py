from django.contrib import admin
from .models import Tag, FileTag


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_at"]


@admin.register(FileTag)
class FileTagAdmin(admin.ModelAdmin):
    list_display = ["id", "file", "tag"]