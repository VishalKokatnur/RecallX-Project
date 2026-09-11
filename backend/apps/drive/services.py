"""
Google Drive OAuth flow + file upload helpers.
Uses the narrow 'drive.file' scope - RecallX only ever sees files it uploaded itself,
never anything else already in the user's Drive.
"""
from django.conf import settings
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import io

SCOPES = ["https://www.googleapis.com/auth/drive.file"]
FOLDER_NAME = "RecallX"


def _client_config():
    return {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
        }
    }


def build_auth_url(state: str) -> str:
    """Returns the URL to send the user to, to start the Google consent flow."""
    flow = Flow.from_client_config(_client_config(), scopes=SCOPES, state=state)
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return auth_url


def exchange_code_for_tokens(code: str) -> Credentials:
    """Exchanges the authorization code Google sent back for real access/refresh tokens."""
    flow = Flow.from_client_config(_client_config(), scopes=SCOPES)
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    flow.fetch_token(code=code)
    return flow.credentials


def get_drive_service(token_obj):
    """Builds an authorized Drive API client from a saved GoogleDriveToken."""
    creds = Credentials(
        token=token_obj.access_token,
        refresh_token=token_obj.refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        scopes=SCOPES,
    )
    return build("drive", "v3", credentials=creds)


def get_or_create_recallx_folder(service, token_obj) -> str:
    """Finds (or creates) the 'RecallX' folder in the user's Drive, returns its folder ID."""
    if token_obj.drive_folder_id:
        return token_obj.drive_folder_id

    query = f"name='{FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    items = results.get("files", [])

    if items:
        folder_id = items[0]["id"]
    else:
        folder_metadata = {"name": FOLDER_NAME, "mimeType": "application/vnd.google-apps.folder"}
        folder = service.files().create(body=folder_metadata, fields="id").execute()
        folder_id = folder["id"]

    token_obj.drive_folder_id = folder_id
    token_obj.save(update_fields=["drive_folder_id"])
    return folder_id


def upload_file_to_drive(token_obj, file_name: str, file_bytes: bytes, mime_type: str):
    """Uploads a file into the user's RecallX Drive folder. Returns (file_id, web_view_link)."""
    service = get_drive_service(token_obj)
    folder_id = get_or_create_recallx_folder(service, token_obj)

    media = MediaIoBaseUpload(io.BytesIO(file_bytes), mimetype=mime_type, resumable=False)
    metadata = {"name": file_name, "parents": [folder_id]}

    uploaded = service.files().create(
        body=metadata, media_body=media, fields="id, webViewLink"
    ).execute()

    return uploaded["id"], uploaded.get("webViewLink")