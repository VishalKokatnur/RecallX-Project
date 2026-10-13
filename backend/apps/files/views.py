import io
import logging

from django.http import FileResponse, Http404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from google.auth.exceptions import RefreshError
from googleapiclient.errors import HttpError

from .models import UploadedFile
from .serializers import UploadedFileSerializer
from .services import validate_file, detect_file_type
from apps.processing.tasks import process_file
from apps.drive.services import download_file_from_drive

logger = logging.getLogger(__name__)


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
                return Response(
                    {
                        "detail": "Google Drive is not connected. Connect it from your Profile page.",
                        "code": "drive_not_connected",
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            try:
                file_bytes = download_file_from_drive(token_obj, instance.drive_file_id)
            except RefreshError:
                return Response(
                    {
                        "detail": "Your Google Drive connection has expired. Please reconnect it from your Profile page.",
                        "code": "drive_reauth_required",
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            except HttpError as e:
                code = e.resp.status
                if code == 404:
                    raise Http404("File is no longer available on Google Drive.")
                if code == 401:
                    return Response(
                        {
                            "detail": "Your Google Drive connection has expired. Please reconnect it from your Profile page.",
                            "code": "drive_reauth_required",
                        },
                        status=status.HTTP_409_CONFLICT,
                    )
                logger.exception("Google Drive error while downloading file %s", instance.pk)
                return Response(
                    {"detail": "Google Drive returned an error. Please try again."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
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