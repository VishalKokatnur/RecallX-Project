from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings


class RegisterView(generics.CreateAPIView):
    """FR-01: POST /api/auth/register/"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """FR-02: POST /api/auth/login/ - returns JWT access + refresh tokens."""
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveAPIView):
    """GET /api/auth/profile/"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password", "")
        new_password = request.data.get("new_password", "")

        user = request.user
        if not user.check_password(current_password):
            return Response(
                {"current_password": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except Exception as e:
            return Response({"new_password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password changed successfully."})


class PasswordResetRequestView(APIView):
    """POST /api/auth/password-reset/ - sends a reset link to the user's email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        generic_response = Response(
            {"detail": "If an account with that email exists, a reset link has been sent."}
        )

        if not email:
            return generic_response

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Always return the same response so we never reveal which emails are registered
            return generic_response

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        send_mail(
            subject="Reset your RecallX password",
            message=(
                f"Hi {user.username},\n\n"
                f"Click the link below to reset your RecallX password:\n{reset_link}\n\n"
                "This link will expire soon and can only be used once. "
                "If you didn't request this, you can safely ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return generic_response


class PasswordResetConfirmView(APIView):
    """POST /api/auth/password-reset-confirm/ - sets a new password using the emailed token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid", "")
        token = request.data.get("token", "")
        new_password = request.data.get("new_password", "")

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user=user)
        except Exception as e:
            return Response({"new_password": list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset successfully."})