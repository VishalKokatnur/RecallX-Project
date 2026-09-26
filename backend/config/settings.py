"""
RecallX Django settings.
STEP 1 (Project Setup) starter config — matches PRD section 12 & 28.
Fill in as you complete each phase.
"""
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Explicit path — no longer depends on which folder you run manage.py from
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError(
        "SECRET_KEY not found. Make sure backend/.env exists and contains SECRET_KEY."
    )

DEBUG = os.getenv("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_celery_results",

    # Local apps
    "apps.accounts",
    "apps.files",
    "apps.processing",
    "apps.search",
    "apps.knowledge",
    "apps.drive",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

import dj_database_url

# Falls back to local SQLite if DATABASE_URL isn't set (e.g. local dev without Postgres).
# On Render, set DATABASE_URL to your Neon connection string (include ?sslmode=require).
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=os.getenv("DATABASE_URL", "").startswith("postgres"),
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

CORS_ALLOWED_ORIGINS = os.getenv(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173"
).split(",")

# Base URL of the frontend app, used for redirects after flows like Google
# OAuth (Google itself never sees this - it's where we send the user's
# browser back to once our own backend is done).
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Celery / Redis
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
CELERY_BROKER_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"
CELERY_RESULT_BACKEND = "django-db"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "static"
MEDIA_URL = "media/"
MEDIA_ROOT = os.getenv("MEDIA_ROOT", str(BASE_DIR / "media"))

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# File upload constraints (PRD section 25 — Performance Requirements)
MAX_UPLOAD_SIZE_MB = 20
ALLOWED_UPLOAD_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf", ".txt", ".docx", ".pptx", ".wav"]
# Embedding model (PRD FR-09)
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIMENSIONS = 384

# Chunking (PRD FR-08)
CHUNK_SIZE_WORDS = 400
CHUNK_OVERLAP_WORDS = 75

# DEV ONLY: run Celery tasks synchronously, no Redis/worker needed.
# Remove these two lines when you set up real Redis for production (Phase 9).
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Google Drive integration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/drive/callback/")
if GOOGLE_REDIRECT_URI.startswith("http://") and "localhost" not in GOOGLE_REDIRECT_URI:
    os.environ.pop("OAUTHLIB_INSECURE_TRANSPORT", None)
else:
    os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")  # allow http locally (not https) for dev only


# Make unhandled exceptions (500 errors) print their full traceback to the
# console/logs, instead of Django's default of silently emailing admins.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}


EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://recallx-frontend.onrender.com")