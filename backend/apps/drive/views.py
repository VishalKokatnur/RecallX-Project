from django.shortcuts import redirect
from django.utils import timezone
from datetime import timezone as dt_timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.cache import cache
from . import services
from .models import GoogleDriveToken

FOLDER_MIME_TYPE = "application/vnd.google-apps.folder"
DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly"


def list_folder_contents(service, folder_id):
    """Yield every direct child of a Drive folder, including shared-drive files."""
    page_token = None
    while True:
        response = service.files().list(
            q=f"'{folder_id}' in parents and trashed = false",
            fields="nextPageToken, files(id, name, mimeType)",
            pageToken=page_token,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        ).execute()
        yield from response.get("files", [])
        page_token = response.get("nextPageToken")
        if not page_token:
            return


def expand_picked_files(service, picked_files, errors, parent_path=""):
    """Expand selected folders recursively and preserve their relative paths."""
    for picked_file in picked_files:
        file_id = picked_file.get("id")
        file_name = picked_file.get("name", "untitled")
        file_path = f"{parent_path}/{file_name}" if parent_path else file_name

        if not file_id:
            errors.append(f"{file_path}: Missing Google Drive file ID")
            continue

        if picked_file.get("mimeType") == FOLDER_MIME_TYPE:
            try:
                children = list_folder_contents(service, file_id)
                yield from expand_picked_files(service, children, errors, file_path)
            except Exception as exc:
                errors.append(f"{file_path}: Could not read folder contents: {exc}")
            continue

        imported_file = dict(picked_file)
        imported_file["name"] = file_path
        yield imported_file


class DriveConnectView(APIView):
    """
    GET /api/drive/connect/?token=<jwt_access_token>
    Starts the Google OAuth flow. The JWT is passed as a query param (not a header)
    since this is a plain browser redirect, not an API call from axios.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        raw_token = request.GET.get("token")
        if not raw_token:
            return Response({"error": "Missing token"}, status=400)

        validated = JWTAuthentication().get_validated_token(raw_token)
        user = JWTAuthentication().get_user(validated)

        # 'state' carries the user's id through Google's redirect so we know who's connecting
        auth_url, code_verifier = services.build_auth_url(state=str(user.id))
        cache.set(f"drive_verifier_{user.id}", code_verifier, timeout=600)  # 10 min to complete the flow
        return redirect(auth_url)

class DriveCallbackView(APIView):
    """
    GET /api/drive/callback/
    Google redirects here after the user approves access.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.contrib.auth.models import User

        code = request.GET.get("code")
        state = request.GET.get("state")

        if not code or not state:
            return redirect(f"{settings.FRONTEND_URL}/profile?drive=error")
        try:
            user = User.objects.get(id=int(state))
            code_verifier = cache.get(f"drive_verifier_{user.id}")
            creds = services.exchange_code_for_tokens(code, code_verifier)
            expiry = creds.expiry
            if expiry and timezone.is_naive(expiry):
                expiry = timezone.make_aware(expiry, dt_timezone.utc)

            GoogleDriveToken.objects.update_or_create(
                user=user,
                defaults={
                    "access_token": creds.token,
                    "refresh_token": creds.refresh_token,
                    "token_expiry": expiry,
                },
            )
        except Exception as e:
            import traceback
            traceback.print_exc()  # TEMP: print the real error to the terminal for debugging
            return redirect(f"{settings.FRONTEND_URL}/profile?drive=error")

        return redirect(f"{settings.FRONTEND_URL}/profile?drive=connected")

class DriveStatusView(APIView):
    """GET /api/drive/status/ - tells the frontend whether the user has connected Drive."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        connected = GoogleDriveToken.objects.filter(user=request.user).exists()
        return Response({"connected": connected})



class DriveImportView(APIView):
    """
    POST /api/drive/import/
    Body: { "files": [{"id": "...", "name": "...", "mimeType": "..."}, ...] }
    Downloads files or recursively expands folders picked via Google Picker.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import os
        from django.core.files.base import ContentFile
        from apps.files.models import UploadedFile
        from apps.files.services import detect_file_type
        from apps.processing.tasks import process_file

        picked_files = request.data.get("files", [])
        picker_access_token = request.data.get("access_token")
        picker_access_token_scope = request.data.get("access_token_scope", "")
        if not picked_files:
            return Response({"error": "No files provided"}, status=400)
        if not picker_access_token:
            return Response({"error": "Missing Google Picker access token"}, status=400)

        folder_selected = any(
            item.get("mimeType") == FOLDER_MIME_TYPE for item in picked_files
        )
        if folder_selected and DRIVE_READONLY_SCOPE not in picker_access_token_scope.split():
            return Response(
                {
                    "error": (
                        "Google has not granted full Drive read access yet. "
                        "Click 'Refresh Drive permissions', approve the consent screen, "
                        "then select the folder again."
                    )
                },
                status=400,
            )

        try:
            token_obj = GoogleDriveToken.objects.get(user=request.user)
        except GoogleDriveToken.DoesNotExist:
            return Response({"error": "Google Drive is not connected"}, status=400)

        # Google Picker grants this short-lived token access to the file the user
        # selected.  A previously saved Drive token may not yet have that
        # per-file grant, so it must not be used for this download.
        service = services.get_drive_service_for_access_token(picker_access_token)
        imported = []
        errors = []

        files_to_import = list(expand_picked_files(service, picked_files, errors))
        if not files_to_import and not errors:
            errors.append("The selected folder does not contain any files.")

        for f in files_to_import:
            file_id = f.get("id")
            file_name = f.get("name", "untitled")
            try:
                ext = os.path.splitext(file_name)[1].lower()
                file_type = detect_file_type(ext)

                content = service.files().get_media(
                    fileId=file_id,
                    supportsAllDrives=True,
                ).execute()

                instance = UploadedFile.objects.create(
                    user=request.user,
                    file_name=file_name,
                    file_type=file_type,
                    file_size=len(content),
                    drive_file_id=file_id,
                    drive_view_link=f"https://drive.google.com/file/d/{file_id}/view",
                )
                instance.file.save(file_name, ContentFile(content), save=True)

                process_file.delay(instance.id)
                imported.append(file_name)
            except Exception as e:
                errors.append(f"{file_name}: {str(e)}")

        return Response({"imported": imported, "errors": errors})