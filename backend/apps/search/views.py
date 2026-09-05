from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework import permissions, serializers
from .serializers import SearchRequestSerializer
from .services.embedding_service import embed_text, embed_text_clip
from .services.vector_service import similarity_search, visual_similarity_search
from .services.date_filter_service import parse_date_filter
from .models import SearchHistory


class SemanticSearchView(APIView):
    """FR-11/FR-12: POST /api/search/ - text search + visual (CLIP) search for images."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SearchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        query = serializer.validated_data["query"]
        file_type = serializer.validated_data.get("file_type")
        date_filter_raw = serializer.validated_data.get("date_filter")

        date_range = parse_date_filter(date_filter_raw) if date_filter_raw else None

        query_embedding = embed_text(query)
        text_results = similarity_search(query_embedding, request.user, file_type=file_type, date_range=date_range)

        payload = [
            {
                "file_id": chunk.document.file.id,
                "file_name": chunk.document.file.file_name,
                "file_type": chunk.document.file.file_type,
                "similarity_score": round(score, 4),
                "matched_text": chunk.chunk_text,
                "upload_date": chunk.document.file.created_at,
                "match_type": "text",
            }
            for chunk, score in text_results
        ]

        if not file_type or file_type == "image":
            clip_query_embedding = embed_text_clip(query)
            visual_results = visual_similarity_search(clip_query_embedding, request.user, date_range=date_range)

            existing_file_ids = {r["file_id"] for r in payload}
            for img_emb, score in visual_results:
                if img_emb.file.id in existing_file_ids:
                    continue
                if score < 0.2:
                    continue
                payload.append({
                    "file_id": img_emb.file.id,
                    "file_name": img_emb.file.file_name,
                    "file_type": img_emb.file.file_type,
                    "similarity_score": round(score, 4),
                    "matched_text": "(matched by visual appearance)",
                    "upload_date": img_emb.file.created_at,
                    "match_type": "visual",
                })

        payload.sort(key=lambda r: r["similarity_score"], reverse=True)

        SearchHistory.objects.create(user=request.user, query=query)

        return Response({"results": payload})


class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = ["id", "query", "created_at"]


class SearchHistoryView(ListAPIView):
    """GET /api/search/history/ - last 10 searches for the current user."""
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)[:10]


class AssistantView(APIView):
    """
    Version 6: AI Personal Assistant.
    Searches text content, visual (CLIP) image content, and direct filename
    matches, then synthesizes an answer from the user's own saved files.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from apps.files.models import UploadedFile

        question = request.data.get("question", "").strip()
        if not question:
            return Response({"error": "question is required"}, status=400)

        CONFIDENCE_THRESHOLD = 0.25
        seen_files = {}

        # 1) Text-based search (OCR/PDF/DOCX/TXT content)
        query_embedding = embed_text(question)
        text_results = similarity_search(query_embedding, request.user, top_k=6)
        for chunk, score in text_results:
            if score < CONFIDENCE_THRESHOLD:
                continue
            f = chunk.document.file
            if f.id not in seen_files or score > seen_files[f.id]["score"]:
                seen_files[f.id] = {
                    "file_id": f.id,
                    "file_name": f.file_name,
                    "file_type": f.file_type,
                    "score": score,
                    "snippet": chunk.chunk_text[:220],
                    "file_url": request.build_absolute_uri(f.file.url) if f.file else None,
                }

        # 2) Visual (CLIP) search - catches image queries text search would miss
        clip_query_embedding = embed_text_clip(question)
        visual_results = visual_similarity_search(clip_query_embedding, request.user, top_k=5)
        for img_emb, score in visual_results:
            if score < CONFIDENCE_THRESHOLD:
                continue
            f = img_emb.file
            if f.id not in seen_files or score > seen_files[f.id]["score"]:
                seen_files[f.id] = {
                    "file_id": f.id,
                    "file_name": f.file_name,
                    "file_type": f.file_type,
                    "score": score,
                    "snippet": "(matched by visual appearance)",
                    "file_url": request.build_absolute_uri(f.file.url) if f.file else None,
                }

        # 3) Direct filename matching - catches "do you have frontside.png" style questions
        words = [w.strip(".,?!\"'").lower() for w in question.split() if len(w.strip(".,?!\"'")) >= 4]
        if words:
            name_matches = UploadedFile.objects.filter(user=request.user)
            for word in words:
                for f in name_matches.filter(file_name__icontains=word):
                    if f.id not in seen_files:
                        seen_files[f.id] = {
                            "file_id": f.id,
                            "file_name": f.file_name,
                            "file_type": f.file_type,
                            "score": 0.5,
                            "snippet": "(matched by file name)",
                            "file_url": request.build_absolute_uri(f.file.url) if f.file else None,
                        }

        if not seen_files:
            return Response({
                "answer": "You don't have any saved files that relate to this yet. Try uploading something first, or rephrasing your question.",
                "sources": [],
            })

        sources = sorted(seen_files.values(), key=lambda s: s["score"], reverse=True)

        lines = [f"Based on {len(sources)} of your saved files, here's what you know about \"{question}\":", ""]
        for s in sources:
            lines.append(f"- In {s['file_name']} ({s['file_type']}): {s['snippet']}")

        answer = "\n".join(lines)

        return Response({"answer": answer, "sources": sources})