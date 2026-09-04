from rest_framework import generics, permissions
from .models import UploadedFile
from .serializers import UploadedFileSerializer
from .services import validate_file, detect_file_type
from apps.processing.tasks import process_file

class FileListUploadView(generics.ListCreateAPIView):
    """FR-03: GET/POST /api/files/"""
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        uploaded = self.request.FILES["file"]
        ext = validate_file(uploaded)
        file_type = detect_file_type(ext)
        instance = serializer.save(
            user=self.request.user,
            file_name=uploaded.name,
            file_type=file_type,
            file_size=uploaded.size,
        )
        process_file.delay(instance.id)

class FileDetailView(generics.RetrieveDestroyAPIView):
    """FR-16: GET/DELETE /api/files/{id}/"""
    serializer_class = UploadedFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user)
