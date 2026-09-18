from rest_framework import serializers
from .models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = [
            "id", "file", "file_name", "file_type",
            "file_size", "processing_status", "created_at", "updated_at", "tags",
            "drive_view_link", "download_url",
        ]
        read_only_fields = [
            "file_name", "file_type", "file_size",
            "processing_status", "created_at", "updated_at",
        ]

    def get_tags(self, obj):
        from apps.knowledge.models import FileTag
        return list(FileTag.objects.filter(file=obj).values_list("tag__name", flat=True))

    def get_download_url(self, obj):
        request = self.context.get("request")
        url = f"/api/files/{obj.id}/download/"
        return request.build_absolute_uri(url) if request else url