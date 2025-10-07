from django.urls import path
from .views import HeatmapView, DailyRouteView, DailySummaryView, WeeklyForecastView

urlpatterns = [
    path("heatmap-data/", HeatmapView.as_view()),
    path("daily-route/", DailyRouteView.as_view()),
    path("daily-summary/", DailySummaryView.as_view()),
    path("weekly-forecast/", WeeklyForecastView.as_view()),
]
