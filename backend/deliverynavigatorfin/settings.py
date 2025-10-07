from pathlib import Path
import os

# --- 基本 ---
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in ("1", "true", "yes")

# ホスト
_raw_hosts = os.environ.get("ALLOWED_HOSTS", "")
if _raw_hosts:
    ALLOWED_HOSTS = [h.strip() for h in _raw_hosts.split(",") if h.strip()]
else:
    ALLOWED_HOSTS = ["*"] if DEBUG else []

# --- アプリ ---
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
    "corsheaders.middleware.CorsMiddleware",  # CORSは一番上寄り
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

# --- DB: DATABASE_URL があれば優先。なければ SQLite ---
def _sqlite_conf(name: str):
    return {"ENGINE": "django.db.backends.sqlite3", "NAME": str(BASE_DIR / name)}

DATABASE_URL = os.environ.get("DATABASE_URL", "")
DATABASES = {"default": _sqlite_conf("db.sqlite3")}

if DATABASE_URL:
    use_sqlite = DATABASE_URL.startswith("sqlite:")
    if use_sqlite:
        # 例: sqlite:///db.sqlite3
        path = DATABASE_URL.split("///")[-1] or "db.sqlite3"
        DATABASES["default"] = _sqlite_conf(path)
    else:
        # 可能なら dj_database_url を利用、無ければ静かに SQLite にフォールバック
        try:
            import dj_database_url  # type: ignore
            DATABASES["default"] = dj_database_url.config(
                default=DATABASE_URL, conn_max_age=600
            )
        except Exception:
            # フォールバック（ログ不要／500は出さない）
            DATABASES["default"] = _sqlite_conf("db.sqlite3")

# --- パスワード・認証 ---
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    # 既定は認証必須。AllowAny を付けたビューは公開される。
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# --- i18n ---
LANGUAGE_CODE = "ja"
TIME_ZONE = "Asia/Tokyo"
USE_I18N = True
USE_TZ = True

# --- 静的 ---
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- CORS / CSRF ---
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN")
if FRONTEND_ORIGIN:
    CORS_ALLOWED_ORIGINS = [FRONTEND_ORIGIN]
    # Railway は https。スキーム込みで。
    CSRF_TRUSTED_ORIGINS = [FRONTEND_ORIGIN]
else:
    CORS_ALLOW_ALL_ORIGINS = DEBUG
