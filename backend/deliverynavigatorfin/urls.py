from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

def health(_req):
    return JsonResponse({"status": "ok", "service": "deliverynavigatorfin"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("healthz/", health),
]
