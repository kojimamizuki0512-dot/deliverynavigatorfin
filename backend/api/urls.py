from django.urls import path
from .views import (
    RootOk, Healthz,
    RegisterView, LoginView, MeView,
    DailyRouteView, DailySummaryView, HeatmapDataView, WeeklyForecastView,
    RecordListCreateView,
)

urlpatterns = [
    path("", RootOk.as_view(), name="root"),
    path("healthz/", Healthz.as_view(), name="healthz"),

    # auth
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("me/", MeView.as_view()),

    # app data
    path("daily-route/", DailyRouteView.as_view()),
    path("daily-summary/", DailySummaryView.as_view()),
    path("heatmap-data/", HeatmapDataView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),

    # records
    path("records/", RecordListCreateView.as_view()),
]
