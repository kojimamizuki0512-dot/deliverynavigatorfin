# -*- coding: utf-8 -*-
"""
API の View 定義。
今回の方針: 新規登録/ログインを“使わず”、端末ごとの匿名ユーザーでデータを分離する。
- フロントは "X-Device-Id" ヘッダを常に送る
- バックはそれを使って「ゲストユーザー」を自動発行/紐付け
- 既存のエンドポイントは AllowAny にして、ゲストに対して安全に動くよう実装
"""

import re
import datetime as dt

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
    RecordSerializer,
)
from .models import Record

from .dummy_data import (
    make_daily_route,
    make_daily_summary,
    make_heatmap_points,
    make_weekly_forecast,
)

# ---------- ユーティリティ ----------
def _parse_int_like(x) -> int:
    """"12,400" / "12400" / 12400 などを堅牢に int 化（失敗時 0）"""
    if x is None:
        return 0
    if isinstance(x, (int, float)):
        try:
            return int(round(x))
        except Exception:
            return 0
    if isinstance(x, str):
        s = re.sub(r"[^\d\-\.+]", "", x)
        if not s:
            return 0
        try:
            return int(float(s))
        except Exception:
            return 0
    return 0

def _month_start_in_local_tz() -> dt.datetime:
    """ローカルTZの当月 0:00（aware）"""
    today_local = timezone.localdate()
    start_naive = dt.datetime(today_local.year, today_local.month, 1, 0, 0, 0)
    return timezone.make_aware(start_naive, timezone=timezone.get_current_timezone())

# ---------- 端末ID -> ゲストユーザー解決 ----------
def get_guest_user(request):
    did = request.headers.get("X-Device-Id") or "anon"
    uname = ("guest_" + did).replace(":", "").replace("-", "")[:150]
    user, created = User.objects.get_or_create(username=uname, defaults={"email": ""})
    if created:
        user.set_unusable_password()
        user.save()
    return user

# ---------- ヘルス/ルート ----------
class RootOk(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response("ok")

class Healthz(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({"status": "ok", "service": "deliverynavigatorfin"})

# ---------- 認証（残置） ----------
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
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        u = get_guest_user(request)
        return Response({"id": u.id, "username": u.username, "email": u.email})

# ---------- ダミー/集計系 ----------
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

# ---------- 実績 ----------
class RecordsView(APIView):
    """
    GET  /api/records/  : 端末(=X-Device-Id)に紐づくレコード一覧
    POST /api/records/  : 新規作成（title, value, created_at 任意）
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        u = get_guest_user(request)
        qs = Record.objects.filter(owner=u).order_by("-created_at")
        data = [{"id": r.id, "title": r.title, "value": r.value, "created_at": r.created_at} for r in qs]
        return Response(data)

    def post(self, request):
        u = get_guest_user(request)
        payload = request.data or {}
        title = str(payload.get("title") or "record")

        # ★ここが重要：value が無い場合でも sales / amount / revenue から金額を取り込む
        raw_val = (
            payload.get("value", None)
            if "value" in payload
            else payload.get("sales", None)
            or payload.get("amount", None)
            or payload.get("revenue", None)
        )
        value = _parse_int_like(raw_val)

        r = Record.objects.create(owner=u, title=title, value=value)
        return Response(
            {"id": r.id, "title": r.title, "value": r.value, "created_at": r.created_at},
            status=status.HTTP_201_CREATED,
        )

class MonthlyTotalView(APIView):
    """
    GET /api/monthly-total/
    今月（ローカルTZの1日0:00〜）の value 合計を返す（端末ごと=ゲストユーザーごと）
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        u = get_guest_user(request)
        start = _month_start_in_local_tz()
        total = (
            Record.objects.filter(owner=u, created_at__gte=start)
            .aggregate(s=Sum("value"))
            .get("s")
            or 0
        )
        return Response({"total": int(total)})

# ---------- 既存ジェネリクス（未使用でも保持） ----------
class RecordListCreateView(generics.ListCreateAPIView):
    serializer_class = RecordSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Record.objects.filter(owner=get_guest_user(self.request))

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        serializer.save(owner=get_guest_user(self.request))
