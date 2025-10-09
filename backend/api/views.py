# -*- coding: utf-8 -*-
"""
API の View 定義。
今回の方針: 新規登録/ログインを“使わず”、端末ごとの匿名ユーザーでデータを分離する。
- フロントは "X-Device-Id" ヘッダを常に送る
- バックはそれを使って「ゲストユーザー」を自動発行/紐付け
- 既存のエンドポイントは AllowAny にして、ゲストに対して安全に動くよう実装
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.db.models import Sum

from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    RecordSerializer,  # 既存: モデル直列化（未使用でも残す）
)
from .models import Record

from .dummy_data import (
    make_daily_route,
    make_daily_summary,
    make_heatmap_points,
    make_weekly_forecast,
)

# ---- 共通: 端末ID -> ゲストユーザー解決 ----
def get_guest_user(request):
    """
    X-Device-Id から “ゲストユーザー” を取得/自動作成。
    パスワードは不可（ログイン不可なユーザーとして運用）。
    """
    did = request.headers.get("X-Device-Id") or "anon"
    uname = ("guest_" + did).replace(":", "").replace("-", "")[:150]
    user, created = User.objects.get_or_create(username=uname, defaults={"email": ""})
    if created:
        user.set_unusable_password()
        user.save()
    return user

# ---- ヘルス/ルート ----
class RootOk(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response("ok")

class Healthz(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({"status": "ok", "service": "deliverynavigatorfin"})

# ---- 認証（残置。現在は使わない想定）----
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
    permission_classes = [permissions.AllowAny]  # 現状ログイン不要
    def get(self, request):
        u = get_guest_user(request)
        return Response({"id": u.id, "username": u.username, "email": u.email})

# ---- ダミー/集計系（匿名OK）----
class DailyRouteView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response(make_daily_route())

class DailySummaryView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        goal = int(request.GET.get("goal", 12000))
        return Response(make_daily_summary(goal))

class HeatmapDataView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response(make_heatmap_points())

class WeeklyForecastView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response(make_weekly_forecast())

# ---- 実績: ゲストユーザーに紐付け（匿名OK）----
class RecordsView(APIView):
    """
    GET  /api/records/  : 端末(=X-Device-Id)に紐づくレコード一覧
    POST /api/records/  : 新規作成（title, value, created_at 任意）
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        u = get_guest_user(request)
        qs = Record.objects.filter(owner=u).order_by("-created_at")
        data = [
            {"id": r.id, "title": r.title, "value": r.value, "created_at": r.created_at}
            for r in qs
        ]
        return Response(data)

    def post(self, request):
        u = get_guest_user(request)
        payload = request.data or {}
        title = str(payload.get("title") or "record")
        value = int(payload.get("value") or 0)
        # created_at はモデルの auto_now_add に任せる（明示したいなら parse して代入も可）
        r = Record.objects.create(owner=u, title=title, value=value)
        return Response(
            {"id": r.id, "title": r.title, "value": r.value, "created_at": r.created_at},
            status=status.HTTP_201_CREATED,
        )

class MonthlyTotalView(APIView):
    """
    GET /api/monthly-total/
    今月（1日0:00〜）の value 合計を返す（端末ごと=ゲストユーザーごと）
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        u = get_guest_user(request)
        start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        total = (
            Record.objects.filter(owner=u, created_at__gte=start)
            .aggregate(s=Sum("value"))
            .get("s")
            or 0
        )
        return Response({"total": int(total)})

# ---- 参考: 既存の DRF ジェネリクスは保持（未使用でもOK）----
class RecordListCreateView(generics.ListCreateAPIView):
    serializer_class = RecordSerializer
    permission_classes = [permissions.AllowAny]  # 現状匿名OK

    def get_queryset(self):
        # ゲストユーザーのものだけに絞る
        return Record.objects.filter(owner=get_guest_user(self.request))

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        serializer.save(owner=get_guest_user(self.request))
