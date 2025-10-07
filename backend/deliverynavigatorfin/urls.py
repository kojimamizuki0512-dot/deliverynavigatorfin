from django.contrib import admin
from django.urls import path, include

from api.views import Healthz  # 互換用

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("healthz/", Healthz.as_view()),  # 追加（将来の設定ミス防止）
]
