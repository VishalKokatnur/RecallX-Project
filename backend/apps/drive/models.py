"""
Stores each user's Google Drive OAuth tokens after they connect their account.
"""
from django.conf import settings
from django.db import models


class GoogleDriveToken(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="drive_token")
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expiry = models.DateTimeField(null=True, blank=True)
    drive_folder_id = models.CharField(max_length=255, blank=True, null=True)
    connected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Drive token for {self.user.username}"