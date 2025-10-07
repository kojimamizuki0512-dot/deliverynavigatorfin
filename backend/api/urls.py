from django.urls import path
from .views import (
    Healthz,
    DailyRoute, DailySummary, HeatmapData, WeeklyForecast,
    RegisterView, LoginView, RefreshView, MeView,
)

urlpatterns = [
    path("healthz/", Healthz.as_view()),

    # 認証
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/",    LoginView.as_view()),
    path("auth/refresh/",  RefreshView.as_view()),
    path("auth/me/",       MeView.as_view()),

    # データAPI
    path("daily-route/", DailyRoute.as_view()),
    path("daily-summary/", DailySummary.as_view()),
    path("heatmap-data/", HeatmapData.as_view()),
    path("weekly-forecast/", WeeklyForecast.as_view()),
]
