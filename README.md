# RecallX — AI-Powered Forgotten Knowledge Recovery System

Search your saved files by *meaning*, not filename.
> "Find that screenshot about Python interview questions I saved around April."

## Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Django + Django REST Framework + SimpleJWT
- **Database:** PostgreSQL + pgvector
- **AI:** Sentence Transformers (`all-MiniLM-L6-v2`)
- **OCR:** PaddleOCR · **PDF:** PyMuPDF · **DOCX:** python-docx
- **Background jobs:** Celery + Redis
- **Deploy:** Docker + Nginx

## Folder structure
```
recallx/
├── backend/            Django project (apps: accounts, files, processing, search, knowledge)
├── frontend/            React + Vite app
├── docker-compose.yml    All 5 services (frontend, backend, postgres, redis, celery)
└── ROADMAP.md          Phase-by-phase micro-steps — START HERE
```

## Quickstart (local dev, no Docker)
```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in real values
# create Postgres DB `recallx_db`, then inside it: CREATE EXTENSION IF NOT EXISTS vector;
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Quickstart (Docker)
```bash
docker-compose up --build
```

## Where to go next
Open `ROADMAP.md` — it breaks the whole build into 9 phases with checkbox-level
micro-steps, starting from Phase 1 (Project Setup) through Phase 9 (Deployment).
