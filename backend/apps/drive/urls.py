from django.urls import path
from .views import DriveConnectView, DriveCallbackView, DriveStatusView

urlpatterns = [
    path("connect/", DriveConnectView.as_view(), name="drive-connect"),
    path("callback/", DriveCallbackView.as_view(), name="drive-callback"),
    path("status/", DriveStatusView.as_view(), name="drive-status"),
]