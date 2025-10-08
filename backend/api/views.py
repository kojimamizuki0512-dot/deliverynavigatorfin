from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction
from django.db.models import Sum
from django.utils import timezone
from datetime import date
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from .dummy_data import (
    make_daily_route,
    make_daily_summary,
    make_heatmap_points,
    make_weekly_forecast,
)
from .models import Record

# ---- ヘルス/ルート ----
class RootOk(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response("ok")

class Healthz(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({"status": "ok", "service": "deliverynavigatorfin"})

# ---- Auth ----
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            with transaction.atomic():
                user = ser.save()
        except IntegrityError:
            return Response(
                {"detail": "登録できませんでした（ユーザー名の重複など）。"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        ser = LoginSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(
            username=ser.validated_data["username"],
            password=ser.validated_data["password"],
        )
        if not user:
            return Response({"detail": "ユーザー名またはパスワードが違います。"}, status=400)
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)})

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email})

# ---- ダミーAPI ----
class DailyRouteView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(make_daily_route())

class DailySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        goal = int(request.GET.get("goal", 12000))
        return Response(make_daily_summary(goal))

class HeatmapDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(make_heatmap_points())

class WeeklyForecastView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(make_weekly_forecast())

# ---- 月間合計API（修正版）----
class MonthlyTotalView(APIView):
    """
    GET /api/monthly-total/?year=YYYY&month=MM
    - 認証必須
    - 指定がなければサーバ側の現在の年月で集計
    - 応答例: {"year": 2025, "month": 10, "total": 12345, "count": 7}
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 年月の解釈（未指定なら現在）
        today = timezone.now().date()  # naive/aware の違いに依存しない
        try:
            year = int(request.GET.get("year", today.year))
            month = int(request.GET.get("month", today.month))
            if month < 1 or month > 12:
                raise ValueError
        except ValueError:
            return Response({"detail": "year/month の指定が不正です。"}, status=status.HTTP_400_BAD_REQUEST)

        # 月初と翌月初（[start, end) で絞る）
        start = date(year, month, 1)
        end = date(year + (month // 12), ((month % 12) + 1), 1)

        qs = Record.objects.filter(
            owner=request.user,
            created_at__gte=start,
            created_at__lt=end,
        )
        agg = qs.aggregate(total=Sum("value"))
        total = int(agg["total"] or 0)
        count = qs.count()

        return Response({
            "year": year,
            "month": month,
            "total": total,
            "count": count,
        })
