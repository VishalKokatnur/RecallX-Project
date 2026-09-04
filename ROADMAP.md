# RecallX — Build Roadmap & Micro-Steps

Build in this order. Don't skip ahead — each phase should run end-to-end before the next.

---

## PHASE 1 — Project Setup
- [ ] Create a GitHub repo, push this skeleton
- [ ] `cd backend && python -m venv venv && source venv/bin/activate`
- [ ] `pip install -r requirements.txt`
- [ ] Install PostgreSQL locally, create `recallx_db`
- [ ] Run `CREATE EXTENSION IF NOT EXISTS vector;` in that database
- [ ] Copy `backend/.env.example` → `backend/.env`, fill in real values
- [ ] `python manage.py migrate` (confirm Django boots clean)
- [ ] `python manage.py runserver` → confirm `http://localhost:8000/admin` loads
- [ ] `cd frontend && npm install`
- [ ] Copy `frontend/.env.example` → `frontend/.env`
- [ ] `npm run dev` → confirm `http://localhost:5173` loads
- [ ] Confirm frontend can hit backend (test a dummy `/api/` call via the Vite proxy)

**Deliverable:** empty React app + empty Django API both running and talking to each other.

---

## PHASE 2 — Authentication
- [ ] `python manage.py migrate` for `accounts` app
- [ ] Test `POST /api/auth/register/` in Postman/curl
- [ ] Test `POST /api/auth/login/` → confirm JWT access+refresh returned
- [ ] Test `GET /api/auth/profile/` with `Authorization: Bearer <token>`
- [ ] Build `Register.jsx` form → wire to `authService.register`
- [ ] Build `Login.jsx` form → wire to `authService.login`, store tokens
- [ ] Add route protection (redirect to `/login` if `user` is null in `AuthContext`)
- [ ] Add logout button that clears tokens

**Deliverable:** a user can register, log in, log out, and see a protected profile page.

---

## PHASE 3 — File Management
- [ ] `python manage.py makemigrations files && python manage.py migrate`
- [ ] Test file upload via `POST /api/files/` (multipart) with curl/Postman
- [ ] Confirm file lands in `backend/media/uploads/<user_id>/`
- [ ] Test `GET /api/files/` returns only the logged-in user's files
- [ ] Test `DELETE /api/files/{id}/` removes file + DB row
- [ ] Build `UploadArea.jsx` — drag & drop + browse, show upload progress
- [ ] Build `Files.jsx` — list files, show status badge, delete button
- [ ] Build `FileCard.jsx` — used inside Files.jsx list

**Deliverable:** logged-in user can upload, list, and delete their own files only.

---

## PHASE 4 — Text Extraction
- [ ] Implement `ocr_service.extract_text_from_image` (PaddleOCR)
- [ ] Implement `pdf_service.extract_text_from_pdf` (PyMuPDF)
- [ ] Implement `docx_service.extract_text_from_docx` (python-docx)
- [ ] Add plain `.txt` read-through in `processing/tasks.py`
- [ ] Wire `apps/processing/tasks.py:process_file` to call the right extractor by `file_type`
- [ ] Install & start Redis locally
- [ ] Run `celery -A config worker -l info` from `backend/`
- [ ] Uncomment `process_file.delay(instance.id)` in `files/views.py`
- [ ] Upload a test image/PDF/DOCX and confirm extracted text is captured (log it for now)

**Deliverable:** every uploaded file automatically produces extracted text in the background.

---

## PHASE 5 — AI Embeddings
- [ ] `python manage.py makemigrations search && python manage.py migrate`
- [ ] Implement `embedding_service.embed_text` / `embed_batch` (Sentence Transformers)
- [ ] In `processing/tasks.py`: clean → chunk → embed → save `Document` + `DocumentChunk` rows
- [ ] Confirm `all-MiniLM-L6-v2` downloads and loads correctly (first run is slow — cache it)
- [ ] Re-upload a test file and confirm `DocumentChunk` rows appear with populated `embedding`

**Deliverable:** uploaded file content is fully vectorized and stored in Postgres.

---

## PHASE 6 — Semantic Search
- [ ] Implement real logic in `vector_service.similarity_search` (pgvector cosine distance)
- [ ] Wire `SemanticSearchView` to call `embed_text` → `similarity_search` → `rank_results`
- [ ] Test `POST /api/search/` with a natural-language query, confirm ranked JSON back
- [ ] Build `SearchBar.jsx`
- [ ] Build `Search.jsx` — input, results list, relevance %, "open file" link
- [ ] Build `Dashboard.jsx` — quick search bar + file/chunk counters

**Deliverable:** users type plain English and get ranked, relevant files back.

---

## PHASE 7 — Advanced Search
- [ ] Add file-type filter to `SemanticSearchView` (filter queryset by `file_type`)
- [ ] Add date-filter parsing ("last week", "April", "4 months ago" → date range)
- [ ] Surface both filters in `Search.jsx` UI
- [ ] (Optional) Add basic tag support using the `knowledge` app models

**Deliverable:** search results can be narrowed by type and time.

---

## PHASE 8 — Advanced Features (post-MVP)
- [ ] Knowledge timeline view (`Timeline.jsx` + `knowledge` app)
- [ ] AI-generated tags
- [ ] Visual/image-description search
- [ ] Voice search / audio transcription
- [ ] "What do I know about X" AI assistant summarizer

---

## PHASE 9 — Docker & Deployment
- [ ] `docker-compose up --build` locally, confirm all 5 services boot
- [ ] Point frontend `VITE_API_BASE_URL` at the containerized backend
- [ ] Set `DEBUG=False`, real `SECRET_KEY`, real `ALLOWED_HOSTS` in production `.env`
- [ ] Add Nginx reverse proxy config (serves React build + proxies `/api` to Django)
- [ ] Deploy to Render/AWS, switch file storage to S3

---

## MVP Definition (stop here before adding extras)
Auth (register/login/logout) + Upload (image/pdf/txt/docx) + Extraction (OCR/PDF/DOCX)
+ Embeddings + Vector search + Results (name, type, score, matched text, open file).
