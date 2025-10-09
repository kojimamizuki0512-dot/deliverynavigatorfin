from django.urls import path
from .views import (
    RegisterView, LoginView, MeView,
    DailyRouteView, DailySummaryView, HeatmapDataView, WeeklyForecastView,
    RecordsView, MonthlyTotalView,
    RecordListCreateView,  # 既存（未使用でもOK）
)

urlpatterns = [
    # 認証（残置）
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/",    LoginView.as_view()),
    path("auth/me/",       MeView.as_view()),

    # ダミー/集計
    path("daily-route/",     DailyRouteView.as_view()),
    path("daily-summary/",   DailySummaryView.as_view()),
    path("heatmap-data/",    HeatmapDataView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),

    # 実績（匿名OK：ゲスト紐付け）
    path("records/",        RecordsView.as_view()),
    path("monthly-total/",  MonthlyTotalView.as_view()),

    # 参考: 旧のジェネリクス版
    # path("records/", RecordListCreateView.as_view()),
]
