from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    GuestProfileSerializer,
    RecordSerializer,
)
from .models import GuestProfile, Record
from .dummy_data import (
    make_daily_route,
    make_daily_summary,
    make_heatmap_points,
    make_weekly_forecast,
)


# ===== 共通: ヘッダーからゲストIDを取ってくる =====
def _get_guest_id(request):
    return (
        request.headers.get("X-Guest-Id")
        or request.GET.get("guest_id")
        or request.data.get("guest_id")
    )


def _get_or_create_guest(request):
    gid = _get_guest_id(request)
    if not gid:
        return None, Response({"detail": "X-Guest-Id が必要です。"}, status=400)
    guest, _created = GuestProfile.objects.get_or_create(guest_id=gid)
    return guest, None


# ===== ヘルス/ルート =====
class RootOk(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response("ok")


class Healthz(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "deliverynavigatorfin"})


# ===== 既存のAuth（任意利用） =====
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
                {"detail": "登録できませんでした（ユーザー名またはメールの重複）。"},
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
        return Response(
            {"access": str(refresh.access_token), "refresh": str(refresh)},
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email})


# ===== ゲスト・プロファイル =====
class GuestInitView(APIView):
    """
    ゲストIDで初期化（nicknameを入れれば保存）。
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        guest, err = _get_or_create_guest(request)
        if err:
            return err
        nickname = request.data.get("nickname", "")
        if nickname:
            guest.nickname = nickname[:50]
            guest.save(update_fields=["nickname", "updated_at"])
        return Response(GuestProfileSerializer(guest).data, status=200)


class GuestProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        guest, err = _get_or_create_guest(request)
        if err:
            return err
        return Response(GuestProfileSerializer(guest).data)

    def post(self, request):
        guest, err = _get_or_create_guest(request)
        if err:
            return err
        nickname = request.data.get("nickname", "")
        guest.nickname = nickname[:50]
        guest.save(update_fields=["nickname", "updated_at"])
        return Response(GuestProfileSerializer(guest).data)


# ===== 個別記録 =====
class RecordsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        guest, err = _get_or_create_guest(request)
        if err:
            return err
        qs = Record.objects.filter(guest=guest).order_by("-date", "-id")[:200]
        return Response(RecordSerializer(qs, many=True).data)

    def post(self, request):
        guest, err = _get_or_create_guest(request)
        if err:
            return err
        payload = request.data.copy()
        ser = RecordSerializer(data=payload)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        rec = Record.objects.create(guest=guest, **ser.validated_data)
        return Response(RecordSerializer(rec).data, status=201)


# ===== ダミーAPI（ゲストIDがあればパーソナライズ） =====
class DailyRouteView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # ここではまだゲスト固有分岐は不要。将来seedに使うならguest_idでseed固定など。
        return Response(make_daily_route())


class DailySummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        goal = int(request.GET.get("goal", 12000))
        base = make_daily_summary(goal)

        guest_id = _get_guest_id(request)
        if not guest_id:
            return Response(base)

        try:
            guest = GuestProfile.objects.get(guest_id=guest_id)
        except GuestProfile.DoesNotExist:
            return Response(base)

        today = timezone.localdate()
        qs = Record.objects.filter(guest=guest, date=today)
        if qs.exists():
            total = sum(r.amount for r in qs)
            count = qs.count()
            base["total_sales"] = total
            base["orders"] = count
            # 時給/稼働時間は簡易推定（将来は稼働時間を記録で補正）
            hours = max(1.0, base.get("worked_hours", 4.0))
            base["avg_wage"] = int(total / hours)

        return Response(base)


class HeatmapDataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(make_heatmap_points())


class WeeklyForecastView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(make_weekly_forecast())
