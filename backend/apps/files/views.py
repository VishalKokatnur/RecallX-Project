from django.http import FileResponse, Http404
from rest_framework import generics, permissions
from rest_framework.views import APIView
from .models import UploadedFile
from .serializers import UploadedFileSerializer
from .services import validate_file, detect_file_type
from apps.processing.tasks import process_file
from googleapiclient.errors import HttpError
from apps.drive.services import download_file_from_drive
import io


class FileDownloadView(APIView):
    """
    GET /api/files/{id}/download/ - serves the actual file content directly
    through Django. Handles both locally-stored files and Google Drive imports.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            instance = UploadedFile.objects.get(pk=pk, user=request.user)
        except UploadedFile.DoesNotExist:
            raise Http404

        # Drive-imported file: fetch bytes live from Google Drive
        if instance.drive_file_id:
            token_obj = getattr(request.user, "drive_token", None)
            if not token_obj:
                raise Http404("Google Drive is not connected for this account.")
            try:
                file_bytes = download_file_from_drive(token_obj, instance.drive_file_id)
            except HttpError as e:
                if e.resp.status == 404:
                    raise Http404("File is no longer available on Google Drive.")
                raise
            return FileResponse(
                io.BytesIO(file_bytes),
                as_attachment=False,
                filename=instance.file_name,
            )

        # Locally-stored file
        if not instance.file or not instance.file.storage.exists(instance.file.name):
            raise Http404("File is no longer available on the server.")
        return FileResponse(
            instance.file.open("rb"),
            as_attachment=False,
            filename=instance.file_name,
        )

    
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