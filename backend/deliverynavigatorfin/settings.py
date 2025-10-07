from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# ── 基本 ─────────────────────────────────────────────────────
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() == "true"

# 例: "dnfin-backend.up.railway.app,localhost,127.0.0.1"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

# ── アプリ ───────────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "api",
]

# ── ミドルウェア（順序大事）───────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "deliverynavigatorfin.urls"
WSGI_APPLICATION = "deliverynavigatorfin.wsgi.application"

# ── テンプレート（adminに必須）───────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],            # 追加テンプレがあればパスを入れる
        "APP_DIRS": True,      # 各アプリ内 templates/ を自動探索
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

# ── DB（MVPはSQLite）─────────────────────────────────────────
DATABASES = {
    "default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}
}

# ── ロケール ────────────────────────────────────────────────
LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True

# ── 静的ファイル（Whitenoise）────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ── CORS/CSRF（本番はフロントURLだけ許可）────────────────────
# 例: FRONTEND_ORIGIN=https://dnfin-frontend.up.railway.app
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN")
if FRONTEND_ORIGIN:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = [FRONTEND_ORIGIN]
    CSRF_TRUSTED_ORIGINS = [FRONTEND_ORIGIN]
else:
    CORS_ALLOW_ALL_ORIGINS = True  # ローカル開発は全許可

# ── 逆プロキシ越しHTTPS（Railway向け）────────────────────────
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# ── DRF ──────────────────────────────────────────────────────
REST_FRAMEWORK = {"DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"]}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
