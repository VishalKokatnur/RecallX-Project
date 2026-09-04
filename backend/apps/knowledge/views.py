"""
Phase 8: Memory Map - shows files clustered by shared tags,
giving a visual overview of the user's personal knowledge.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Tag, FileTag


class MemoryMapView(APIView):
    """GET /api/knowledge/memory-map/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_file_tags = FileTag.objects.filter(file__user=request.user).select_related("file", "tag")

        clusters = {}
        for ft in user_file_tags:
            tag_name = ft.tag.name
            if tag_name not in clusters:
                clusters[tag_name] = {"tag": tag_name, "files": []}
            clusters[tag_name]["files"].append({
                "id": ft.file.id,
                "file_name": ft.file.file_name,
                "file_type": ft.file.file_type,
            })

        result = sorted(clusters.values(), key=lambda c: len(c["files"]), reverse=True)

        return Response({"clusters": result})