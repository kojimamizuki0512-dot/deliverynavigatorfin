from django.urls import path
from .views import (
    RegisterView, LoginView, MeView,
    DailyRouteView, DailySummaryView, HeatmapDataView, WeeklyForecastView,
    MonthlyTotalView,             # 月間合計（前手順で追加）
    RecordListCreateView,         # ★ 今回ルーティングする
)

urlpatterns = [
    # ---- 認証 ----
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/",    LoginView.as_view()),
    path("auth/me/",       MeView.as_view()),

    # ---- ダミー/集計系 ----
    path("daily-route/",     DailyRouteView.as_view()),
    path("daily-summary/",   DailySummaryView.as_view()),
    path("heatmap-data/",    HeatmapDataView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),
    path("monthly-total/",   MonthlyTotalView.as_view()),

    # ---- ★ 実績レコード（一覧/作成）----
    # GET  /api/records/  : ログインユーザーのレコード一覧
    # POST /api/records/  : レコード新規作成
    path("records/", RecordListCreateView.as_view()),
]
