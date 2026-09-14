"""
Celery background task: extract text -> clean -> chunk -> embed -> store.
Runs synchronously in dev (CELERY_TASK_ALWAYS_EAGER=True), for real in prod.
"""
from django.utils import timezone
from celery import shared_task

import mimetypes
from .services.pdf_service import extract_text_from_pdf
from .services.docx_service import extract_text_from_docx
from .services.pptx_service import extract_text_from_pptx
from .services.text_cleaner import clean_text
from .services.chunk_service import chunk_text
from apps.search.services.embedding_service import embed_image
from apps.drive.models import GoogleDriveToken
from apps.drive.services import upload_file_to_drive
@shared_task
def process_file(file_id: int):
    from apps.files.models import UploadedFile
    from apps.search.models import Document, DocumentChunk
    from apps.search.services.embedding_service import embed_batch
    from apps.search.models import ImageEmbedding
    instance = UploadedFile.objects.get(id=file_id)
    instance.processing_status = "processing"
    instance.save(update_fields=["processing_status"])

    try:
        path = instance.file.path

        if instance.file_type == "pdf":
            raw_text = extract_text_from_pdf(path)
        elif instance.file_type == "docx":
            raw_text = extract_text_from_docx(path)
        elif instance.file_type == "pptx":
            raw_text = extract_text_from_pptx(path)
        elif instance.file_type == "txt":
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                raw_text = f.read()
        elif instance.file_type == "image":
            from .services.ocr_service import extract_text_from_image
            raw_text = extract_text_from_image(path)
        elif instance.file_type == "audio":
            from .services.audio_service import extract_text_from_audio
            raw_text = extract_text_from_audio(path)
        else:
            raw_text = ""

        cleaned = clean_text(raw_text)
        instance.extracted_text = cleaned
        instance.processing_status = "completed"
        instance.save(update_fields=["extracted_text", "processing_status"])

        # Phase 5: chunk + embed + store
        document, _ = Document.objects.update_or_create(
            file=instance,
            defaults={
                "extracted_text": cleaned,
                "status": "completed",
                "processed_at": timezone.now(),
            },
        )
        document.chunks.all().delete()  # clear old chunks if reprocessing

        chunks = chunk_text(cleaned) if cleaned else []
        if chunks:
            vectors = embed_batch(chunks)
            for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
                dc = DocumentChunk(document=document, chunk_text=chunk, chunk_index=i)
                dc.set_embedding(vector)
                dc.save()

    
        # Phase 8: auto-generate tags from the extracted text
        from apps.knowledge.services import apply_tags_to_file
        apply_tags_to_file(instance, cleaned)

        
        # Visual search: generate CLIP image embedding for images only
        if instance.file_type == "image":
            visual_vector = embed_image(path)
            img_emb, _ = ImageEmbedding.objects.update_or_create(file=instance, defaults={})
            img_emb.set_embedding(visual_vector)
            img_emb.save()
            
        # Google Drive backup (best-effort - a Drive failure should never break the main upload)
        try:
            drive_token = GoogleDriveToken.objects.get(user=instance.user)
            with open(path, "rb") as fh:
                file_bytes = fh.read()
            mime_type, _ = mimetypes.guess_type(instance.file.name)
            mime_type = mime_type or "application/octet-stream"
            drive_id, drive_link = upload_file_to_drive(
                drive_token, instance.file_name, file_bytes, mime_type
            )
            instance.drive_file_id = drive_id
            instance.drive_view_link = drive_link
            instance.save(update_fields=["drive_file_id", "drive_view_link"])
        except GoogleDriveToken.DoesNotExist:
            pass  # user hasn't connected Drive - skip silently
        except Exception:
            pass  # Drive backup is best-effort - don't fail the whole upload over it
    
    except Exception as e:
        instance.extracted_text = f"[extraction failed: {e}]"
        instance.processing_status = "failed"
        instance.save(update_fields=["extracted_text", "processing_status"])
