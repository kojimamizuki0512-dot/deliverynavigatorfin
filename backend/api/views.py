from rest_framework.views import APIView
from rest_framework.response import Response

from .dummy_data import heatmap_points, daily_route, daily_summary, weekly_forecast

class HeatmapView(APIView):
    def get(self, _): return Response({"points": heatmap_points()}, status=200)

class DailyRouteView(APIView):
    def get(self, _): return Response(daily_route(), status=200)

class DailySummaryView(APIView):
    def get(self, request):
        q = request.query_params.get("goal", "12000")
        try: goal = int(q)
        except ValueError: goal = 12000
        return Response(daily_summary(goal), status=200)

class WeeklyForecastView(APIView):
    def get(self, _): return Response(weekly_forecast(), status=200)
