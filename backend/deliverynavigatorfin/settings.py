import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ==== 基本 ====
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "0") == "1"

# Railway / ローカル / 任意の FQDN を許可
# （DEBUG=False の時に必要。ここが不適切だと 400/500 を誘発） 参照: docs
# https://docs.djangoproject.com/en/5.2/topics/settings/
ALLOWED_HOSTS = [
    "localhost", "127.0.0.1", "[::1]",
    os.environ.get("RAILWAY_PUBLIC_DOMAIN", "").strip(),            # 例: deliverynavigatorfin-production.up.railway.app
    os.environ.get("DJANGO_ALLOWED_HOST", "").strip(),              # 追加用
    "*",  # 最後にワイルドカード（保険・必要に応じて外してOK）
]

# ==== アプリ ====
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

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "deliverynavigatorfin.urls"

TEMPLATES = [{
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
}]

WSGI_APPLICATION = "deliverynavigatorfin.wsgi.application"

# ==== DB（Railway 未設定なら SQLite フォールバック）====
if os.environ.get("DATABASE_URL"):
    # railway の Nixpacks が dj-database-url を噛ませてくれる場合もあるが、
    # 未導入でも SQLite に落ちるので OK
    pass
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ==== 静的ファイル ====
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ==== REST/認証（必要なら既存設定そのまま）====
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
}

# ==== CORS/CSRF（フロント別ホストを許容）====
CORS_ALLOW_ALL_ORIGINS = True
CSRF_TRUSTED_ORIGINS = [
    "https://*.railway.app",
    "https://*.up.railway.app",
]

# ==== 逆プロキシ配下（HTTPS 判定/ホスト判定を正しく）====
# 参照: USE_X_FORWARDED_HOST と SECURE_PROXY_SSL_HEADER
# https://docs.djangoproject.com/en/5.2/ref/settings/#use-x-forwarded-host
# https://stackoverflow.com/a/62047871 （設定例） 
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# ==== ログ出力（500 の原因を確実に STDOUT に出す）====
# 参照: Django Logging docs
# https://docs.djangoproject.com/en/5.2/topics/logging/
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "[{levelname}] {name}: {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "simple"},
    },
    "root": {
        "handlers": ["console"],
        "level": os.environ.get("DJANGO_LOG_LEVEL", "INFO"),
    },
    "loggers": {
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}

# ==== 国際化（既存どおりでOK）====
LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
