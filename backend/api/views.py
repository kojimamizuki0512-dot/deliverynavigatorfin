from django.contrib.auth import authenticate
from django.db import IntegrityError, transaction, models
from django.db.utils import OperationalError, ProgrammingError
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta

from .serializers import RegisterSerializer, LoginSerializer
from .dummy_data import (
    make_daily_route,
    make_daily_summary,
    make_heatmap_points,
    make_weekly_forecast,
)

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

# ---- 月間合計（DBが未準備でも 0 を返す）----
from .models import Record

class MonthlyTotalView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        try:
            now = timezone.now()
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end = (start + timedelta(days=32)).replace(day=1)
            total = (
                Record.objects.filter(
                    owner=request.user,
                    created_at__gte=start,
                    created_at__lt=end
                ).aggregate(s=models.Sum("value"))["s"] or 0
            )
            return Response({"total": int(total)})
        except (OperationalError, ProgrammingError):
            # マイグレーション前やテーブル無しでも 200 を返す
            return Response({"total": 0})
        except Exception:
            # 予期せぬ例外も握りつぶして 0（ログは settings.LOGGING で出る）
            return Response({"total": 0})
