# backend/deliverynavigatorfin/urls.py
from django.contrib import admin
from django.urls import path, include
from api.views import RootOk, Healthz

urlpatterns = [
    # ヘルスチェックと疎通確認
    path("", RootOk.as_view(), name="root-ok"),          # GET / -> "ok"
    path("healthz/", Healthz.as_view(), name="healthz"), # GET /healthz/ -> {"status":"ok",...}

    # API 一式（/api/...）
    path("api/", include("api.urls")),

    # 任意：管理画面（不要なら消してOK）
    path("admin/", admin.site.urls),
]
