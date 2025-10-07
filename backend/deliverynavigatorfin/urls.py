from django.contrib import admin
from django.urls import path, include
from api.views import RootOk, Healthz

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("", RootOk.as_view()),
    path("healthz/", Healthz.as_view()),
]
