from django.shortcuts import redirect
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from . import services
from .models import GoogleDriveToken


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

        auth_url = services.build_auth_url(state=str(user.id))
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
            return redirect("http://localhost:5173/profile?drive=error")

        try:
            user = User.objects.get(id=int(state))
            creds = services.exchange_code_for_tokens(code)

            GoogleDriveToken.objects.update_or_create(
                user=user,
                defaults={
                    "access_token": creds.token,
                    "refresh_token": creds.refresh_token,
                    "token_expiry": creds.expiry,
                },
            )
        except Exception:
            return redirect("http://localhost:5173/profile?drive=error")

        return redirect("http://localhost:5173/profile?drive=connected")


class DriveStatusView(APIView):
    """GET /api/drive/status/ - tells the frontend whether the user has connected Drive."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        connected = GoogleDriveToken.objects.filter(user=request.user).exists()
        return Response({"connected": connected})