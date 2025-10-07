from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    MeView,
    DailyRouteView,
    DailySummaryView,
    HeatmapDataView,
    WeeklyForecastView,
    PublicDailyRouteView,
    PublicDailySummaryView,
    PublicHeatmapDataView,
)

urlpatterns = [
    # 認証
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/me/", MeView.as_view()),

    # 業務API（要ログイン）
    path("daily-route/", DailyRouteView.as_view()),
    path("daily-summary/", DailySummaryView.as_view()),
    path("heatmap-data/", HeatmapDataView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),

    # デモAPI（未ログインOK）
    path("public/daily-route/", PublicDailyRouteView.as_view()),
    path("public/daily-summary/", PublicDailySummaryView.as_view()),
    path("public/heatmap-data/", PublicHeatmapDataView.as_view()),
]
