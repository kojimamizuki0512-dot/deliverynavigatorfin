from django.urls import path
from .views import (
    RootOk, Healthz,
    RegisterView, LoginView, GuestLoginView, MeView,
    RecordListCreateView,
    DailyRouteView, DailySummaryView, HeatmapDataView, WeeklyForecastView,
)

urlpatterns = [
    path("", RootOk.as_view()),
    path("healthz/", Healthz.as_view()),

    # auth
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/guest/", GuestLoginView.as_view()),  # ← 追加

    path("me/", MeView.as_view()),

    # records
    path("records/", RecordListCreateView.as_view()),

    # demo/dummy apis
    path("daily-route/", DailyRouteView.as_view()),
    path("daily-summary/", DailySummaryView.as_view()),
    path("heatmap-data/", HeatmapDataView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),
]
