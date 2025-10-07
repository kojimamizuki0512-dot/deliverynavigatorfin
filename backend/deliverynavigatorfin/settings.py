from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# --- 基本 ---
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-insecure-key")
DEBUG = os.getenv("DJANGO_DEBUG", "false").lower() in ("1", "true", "yes")
ALLOWED_HOSTS = ["*"]  # Railway はワイルドカードでOK（envの ALLOWED_HOSTS は不要）

# --- アプリ ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # できるだけ上に
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
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

# --- DB（SQLite をデフォルト。DATABASE_URL があれば上書き）---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

db_url = os.getenv("DATABASE_URL")
if db_url:
    # conn_max_ageでコネクション再利用。sslmodeはpostgresの時だけ付くように後段で制御
    db_cfg = dj_database_url.parse(db_url, conn_max_age=600)
    DATABASES["default"] = db_cfg

    engine = db_cfg.get("ENGINE", "")
    # Postgres の時だけ SSL を強制
    if engine.endswith("postgresql") or engine.endswith("postgresql_psycopg2"):
        DATABASES["default"].setdefault("OPTIONS", {})
        DATABASES["default"]["OPTIONS"]["sslmode"] = "require"
    else:
        # SQLite/MySQL 等では sslmode を絶対に持たせない
        if "OPTIONS" in DATABASES["default"]:
            DATABASES["default"]["OPTIONS"].pop("sslmode", None)

# --- パスワード／i18n ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True

# --- 静的ファイル ---
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"  # ← W042警告の解消

# --- REST Framework / JWT ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# --- CORS / CSRF ---
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")  # 例: https://rare-caring-production-xxxx.up.railway.app
CORS_ALLOW_CREDENTIALS = True

if FRONTEND_ORIGIN:
    CORS_ALLOWED_ORIGINS = [FRONTEND_ORIGIN]
    CSRF_TRUSTED_ORIGINS = [FRONTEND_ORIGIN]
else:
    # 一時的に許可を広める（本番で固定できるなら FRONTEND_ORIGIN を使ってください）
    CORS_ALLOWED_ORIGINS = []
    if DEBUG:
        CORS_ALLOW_ALL_ORIGINS = True
