from django.urls import path
from .views import (
    RegisterView, LoginView, MeView,
    DailyRouteView, DailySummaryView, HeatmapDataView, WeeklyForecastView
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/",    LoginView.as_view()),
    path("auth/me/",       MeView.as_view()),
    path("daily-route/",   DailyRouteView.as_view()),
    path("daily-summary/", DailySummaryView.as_view()),
    path("heatmap-data/",  HeatmapDataView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),
]
