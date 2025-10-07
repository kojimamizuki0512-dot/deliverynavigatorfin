from django.urls import path
from .views import (
    Healthz,
    RegisterView,
    LoginView,
    MeView,
    DailyRouteView,
    DailySummaryView,
    HeatmapDataView,
    WeeklyForecastView,
)

urlpatterns = [
    path("healthz/", Healthz.as_view()),
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("me/", MeView.as_view()),
    path("daily-route/", DailyRouteView.as_view()),
    path("daily-summary/", DailySummaryView.as_view()),
    path("heatmap-data/", HeatmapDataView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),
]
