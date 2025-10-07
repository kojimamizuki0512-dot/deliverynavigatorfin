from django.urls import path

from .views import (
    RootOk, Healthz,
    RegisterView, LoginView, MeView,
    GuestInitView, GuestProfileView, RecordsView,
    DailyRouteView, DailySummaryView, HeatmapDataView, WeeklyForecastView,
)

urlpatterns = [
    path("", RootOk.as_view()),
    path("healthz/", Healthz.as_view()),

    # Auth（任意）
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/me/", MeView.as_view()),

    # Guest
    path("guest/init/", GuestInitView.as_view()),
    path("guest/profile/", GuestProfileView.as_view()),
    path("records/", RecordsView.as_view()),

    # Dummy data
    path("daily-route/", DailyRouteView.as_view()),
    path("daily-summary/", DailySummaryView.as_view()),
    path("heatmap-data/", HeatmapDataView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),
]
