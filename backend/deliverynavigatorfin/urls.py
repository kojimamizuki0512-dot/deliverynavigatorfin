from django.contrib import admin
from django.urls import path, include

from api.views import RootOk, Healthz  # 追加

urlpatterns = [
    path("", RootOk.as_view()),               # ルート 200
    path("healthz/", Healthz.as_view()),      # 互換ヘルス
    path("api/", include("api.urls")),        # 既存API配下（/api/healthz/ もここ）
    path("admin/", admin.site.urls),
]
