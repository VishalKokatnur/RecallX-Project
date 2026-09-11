from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/files/", include("apps.files.urls")),
    path("api/search/", include("apps.search.urls")),
    path("api/knowledge/", include("apps.knowledge.urls")),
    path("api/drive/", include("apps.drive.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)