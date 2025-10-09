# -*- coding: utf-8 -*-
"""
このファイルは API(HTTP) の入口となる「View」を集めたものです。
ポイント:
- APIView: 1本ずつ好きに書ける自由さ（細かい制御向き）
- generics.*: CRUDの定型をほぼ自動でやってくれる便利クラス（安心・簡単）

今回のゴール:
- 既存の認証APIやダミーAPIはそのまま
- 新しく「実績レコード」を保存・取得するための View を追加
  - GET /api/records/  : ログインユーザーのレコード一覧
  - POST /api/records/ : ログインユーザーとしてレコード新規作成
  （※このURL紐づけは次の手順で urls.py に1行追加します）
"""

from django.contrib.auth import authenticate
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
    RecordSerializer,  # 追加: 実績レコード用のシリアライザ
)
from .models import Record  # 追加: 実績レコードのモデル

from .dummy_data import (
    make_daily_route,
    make_daily_summary,
    make_heatmap_points,
    make_weekly_forecast,
)

# ---- ヘルス/ルート ----
class RootOk(APIView):
    """
    サービスが起動しているかの簡単な確認用。
    ブラウザで / を開くと "ok" が返ります。
    """
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response("ok")


class Healthz(APIView):
    """
    /healthz/ にアクセスしたときにサービス名とOKを返すだけ。
    ※運用のヘルスチェッカなどが叩く想定
    """
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response({"status": "ok", "service": "deliverynavigatorfin"})


# ---- Auth（ユーザー登録・ログイン・自分の情報）----
class RegisterView(APIView):
    """
    POST /api/auth/register/
      { "username": "...", "password": "...", "email": "任意" }
    成功するとアクセストークン＆リフレッシュトークンを返します。
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if not ser.is_valid():
            # バリデーション NG のときは 400 を返す（どこがダメかメッセージ付き）
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # DB書き込みは念のため atomic（途中失敗でロールバック）
            with transaction.atomic():
                user = ser.save()
        except IntegrityError:
            return Response(
                {"detail": "登録できませんでした（ユーザー名の重複など）。"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # JWT の発行（SimpleJWT）。アクセストークン/リフレッシュトークンを返す
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
    POST /api/auth/login/
      { "username": "...", "password": "..." }
    成功するとアクセストークン＆リフレッシュトークンを返します。
    """
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
    """
    GET /api/auth/me/
    ログイン中の自分の情報を返す。
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email})


# ---- ダミーAPI（UIの試作に使う）----
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


# ---- 参考：月間合計（サマリ）----
class MonthlyTotalView(APIView):
    """
    GET /api/monthly-total/
    今月（1日 0:00 〜 現在）の Record.value 合計を返します。
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 今月の開始日時（例: 2025-10-01T00:00:00）
        start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        total = (
            Record.objects.filter(owner=request.user, created_at__gte=start)
            .aggregate(s=Sum("value"))
            .get("s")
            or 0
        )
        return Response({"total": int(total)})


# ---- ★今回追加：実績レコードの一覧/登録 ----
class RecordListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/records/   : ログインユーザーのレコード一覧を返す
    POST /api/records/   : 新しいレコードを作る

    ListCreateAPIView は「一覧」と「作成」をまとめてくれる DRF の便利クラス。
    - serializer_class で入出力の型(項目)を定義（= RecordSerializer）
    - permission_classes で「ログイン必須」を指定
    - get_queryset で「自分のデータだけ」に絞る
    - perform_create では、serializer.save() の呼び出しだけでOK
      （RecordSerializer.create() 内で request.user を owner に入れる仕組み）
    """
    serializer_class = RecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 自分のレコードだけ。models.py 側の Meta.ordering により新しい順で返る
        return Record.objects.filter(owner=self.request.user)

    def get_serializer_context(self):
        """
        シリアライザに request を渡しておくと、
        RecordSerializer.create() 側で request.user を取り出せる。
        """
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        """
        POST 時に呼ばれるフック。ここでは特別な処理は不要。
        serializer.save() が呼ばれると、RecordSerializer.create() が実行される。
        """
        serializer.save()
