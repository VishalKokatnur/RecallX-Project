from django.http import FileResponse, Http404
from rest_framework import generics, permissions
from rest_framework.views import APIView
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


class FileDownloadView(APIView):
    """
    GET /api/files/{id}/download/ - serves the actual file content directly
    through Django, rather than relying on the /media/ static route. Avoids
    any ambiguity around static-file serving configuration in production.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            instance = UploadedFile.objects.get(pk=pk, user=request.user)
        except UploadedFile.DoesNotExist:
            raise Http404
        if not instance.file or not instance.file.storage.exists(instance.file.name):
            raise Http404("File is no longer available on the server.")
        return FileResponse(
            instance.file.open("rb"),
            as_attachment=False,
            filename=instance.file_name,
        )