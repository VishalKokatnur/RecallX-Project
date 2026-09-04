from rest_framework import serializers
from .models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = [
            "id", "file", "file_name", "file_type",
            "file_size", "processing_status", "created_at", "updated_at", "tags",
        ]
        read_only_fields = [
            "file_name", "file_type", "file_size",
            "processing_status", "created_at", "updated_at",
        ]

    def get_tags(self, obj):
        from apps.knowledge.models import FileTag
        return list(FileTag.objects.filter(file=obj).values_list("tag__name", flat=True))