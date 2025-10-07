from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.utils.encoding import force_str
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


# ---- ルート / ヘルス ----
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
    """
    メール任意 + パスワード (>=6)。ユーザー名は自動作成。
    例外は全部 400 で内容を返すので 500 にならないようにする。
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                user = ser.save()
        except IntegrityError as e:
            return Response(
                {"detail": f"重複のため登録できません: {force_str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"detail": f"登録に失敗しました: {force_str(e)}"},
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
    """
    identifier は メール or ユーザー名 どちらでも可
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = LoginSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        identifier = ser.validated_data["identifier"].strip()
        password = ser.validated_data["password"]

        # メールで来たっぽければユーザー名に解決
        username = identifier
        if "@" in identifier:
            try:
                username = User.objects.get(email__iexact=identifier).username
            except User.DoesNotExist:
                pass

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"detail": "ID またはパスワードが違います。"}, status=400)

        refresh = RefreshToken.for_user(user)
        return Response(
            {"access": str(refresh.access_token), "refresh": str(refresh)}, status=200
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email})


# ---- 本番用(認証必須) ダミーAPI ----
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


# ---- 未ログインでも使えるデモ用エンドポイント（読み取りのみ） ----
class PublicDailyRouteView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(make_daily_route())


class PublicDailySummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        goal = int(request.GET.get("goal", 12000))
        return Response(make_daily_summary(goal))


class PublicHeatmapDataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(make_heatmap_points())
