import os
from pathlib import Path
from datetime import timedelta

import dj_database_url  # pip install dj-database-url

BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------------------------
# 基本
# ------------------------------------------------------------------------------
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-CHANGE-ME")
DEBUG = os.environ.get("DJANGO_DEBUG", "False").lower() in ("1", "true", "yes")

# Railway のサービスドメインやカスタムドメイン、ローカルを許可
ALLOWED_HOSTS = list(
    filter(
        None,
        [
            "localhost",
            "127.0.0.1",
            os.environ.get("RAILWAY_PUBLIC_DOMAIN"),   # Railway が注入することがある
            os.environ.get("RENDER_EXTERNAL_HOSTNAME"),  # 互換で残しておく
            os.environ.get("BACKEND_HOST"),             # 任意
            # 明示設定が無くてもワイルドに許可（必要なら外して個別指定）
            os.environ.get("ALLOWED_HOSTS"),            # カンマ区切り想定
        ],
    )
)
# カンマ区切りの ALLOWED_HOSTS が入ってきた場合の展開
if any("," in h for h in ALLOWED_HOSTS if h):
    expanded = []
    for h in ALLOWED_HOSTS:
        if h and "," in h:
            expanded.extend([x.strip() for x in h.split(",") if x.strip()])
        elif h:
            expanded.append(h)
    ALLOWED_HOSTS = expanded or ["*"]
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["*"]  # 最小構成として許可（必要なら絞ってください）

# ------------------------------------------------------------------------------
# アプリ
# ------------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # 3rd party
    "rest_framework",
    "corsheaders",
    # 自作
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "deliverynavigatorfin.urls"

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

WSGI_APPLICATION = "deliverynavigatorfin.wsgi.application"

# ------------------------------------------------------------------------------
# データベース：DATABASE_URL があれば使用、無ければ SQLite
#   例: postgres://USER:PASSWORD@HOST:PORT/DBNAME
# ------------------------------------------------------------------------------
DEFAULT_DB_URL = f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
DATABASES = {
    "default": dj_database_url.config(
        default=DEFAULT_DB_URL, conn_max_age=600, ssl_require=os.environ.get("DB_SSL", "1") == "1"
    )
}

# ------------------------------------------------------------------------------
# パスワードバリデータ（必要に応じて緩める/外す）
# ------------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# ------------------------------------------------------------------------------
# i18n/timezone
# ------------------------------------------------------------------------------
LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------------------------
# 静的ファイル
# ------------------------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ------------------------------------------------------------------------------
# REST / JWT
# ------------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=12),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=14),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ------------------------------------------------------------------------------
# CORS/CSRF
# ------------------------------------------------------------------------------
# フロントの本番URL（例: https://rare-caring-production-xxxx.up.railway.app）
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "").rstrip("/")

CORS_ALLOWED_ORIGINS = [FRONTEND_ORIGIN] if FRONTEND_ORIGIN else []
CORS_ALLOW_CREDENTIALS = True

# CSRF 許可（必要に応じて）
CSRF_TRUSTED_ORIGINS = []
if FRONTEND_ORIGIN.startswith("http"):
    # 例: https://rare-caring-production-xxxx.up.railway.app
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_ORIGIN)

# HTTP → HTTPS リダイレクト（Railway はプロキシ越し）
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
