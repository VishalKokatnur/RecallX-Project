from django.urls import path
from .views import MemoryMapView

urlpatterns = [
    path("memory-map/", MemoryMapView.as_view(), name="memory-map"),
]