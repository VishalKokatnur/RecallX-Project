from django.urls import path
from .views import FileListUploadView, FileDetailView, FileDownloadView

urlpatterns = [
    path("", FileListUploadView.as_view(), name="file-list-upload"),
    path("<int:pk>/", FileDetailView.as_view(), name="file-detail"),
    path("<int:pk>/download/", FileDownloadView.as_view(), name="file-download"),
]