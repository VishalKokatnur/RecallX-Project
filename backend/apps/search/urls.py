from django.urls import path
from .views import SemanticSearchView, SearchHistoryView, AssistantView

urlpatterns = [
    path("", SemanticSearchView.as_view(), name="semantic-search"),
    path("history/", SearchHistoryView.as_view(), name="search-history"),
    path("assistant/", AssistantView.as_view(), name="assistant"),
]