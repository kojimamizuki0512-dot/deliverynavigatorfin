import random
import secrets
from datetime import datetime

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError, transaction

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer, RecordSerializer
from .models import Record


# ---- health / root ---------------------------------------------------------
class RootOk(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response("ok")


class Healthz(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok", "service": "deliverynavigatorfin"})


# ---- auth ------------------------------------------------------------------
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
                {"detail": "登録できませんでした（ユーザー名重複など）。"},
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
            {"access": str(refresh.access_token), "refresh": str(refresh)}, status=200
        )


class GuestLoginView(APIView):
    """
    端末ごと（または任意のdevice_id）でゲストユーザーを作成してJWTを返す。
    これにより登録不要＆ユーザーごとの画面を即時実現。
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        device_id = (request.data or {}).get("device_id")
        seed = (device_id or secrets.token_hex(4)).replace("-", "")[:8]
        username = f"guest_{seed}"
        user, created = User.objects.get_or_create(username=username, defaults={"email": ""})
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "created": created,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email})


# ---- records ---------------------------------------------------------------
class RecordListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Record.objects.filter(user=request.user)[:100]
        return Response(RecordSerializer(qs, many=True).data)

    def post(self, request):
        ser = RecordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        rec = ser.save(user=request.user)
        return Response(RecordSerializer(rec).data, status=201)


# ---- dummy data (ユーザーIDをシードに個別化) ----------------------------------
def _rng_for_user(user):
    rng = random.Random()
    rng.seed(user.id * 9173 + datetime.utcnow().timetuple().tm_yday)
    return rng


class DailyRouteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        rng = _rng_for_user(request.user)
        base = [
            {"time": "18:00", "title": "Stay in Dogenzaka cluster"},
            {"time": "18:30", "title": "Reposition to Ebisu"},
            {"time": "19:00", "title": "Peak around station"},
            {"time": "19:30", "title": "Wait near hotspot"},
            {"time": "20:00", "title": "Shift to East Gate"},
            {"time": "20:30", "title": "Peak around station"},
        ]
        # 少し並び替えして個別化
        rng.shuffle(base)
        return Response({"cards": base})


class DailySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        rng = _rng_for_user(request.user)
        goal = int(request.GET.get("goal", 12000))
        earned = int(goal * rng.uniform(0.4, 0.95))
        hours = round(rng.uniform(2.5, 6.0), 1)
        return Response({"goal": goal, "earned": earned, "hours": hours})


class HeatmapDataView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        rng = _rng_for_user(request.user)
        pts = []
        for _ in range(120):
            pts.append(
                {
                    "lat": 35.65 + rng.random() * 0.2,
                    "lng": 139.65 + rng.random() * 0.2,
                    "w": rng.randint(1, 5),
                }
            )
        return Response({"points": pts})


class WeeklyForecastView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        rng = _rng_for_user(request.user)
        days = []
        for i in range(7):
            days.append({"day": i, "earned": int(8000 + rng.random() * 6000)})
        return Response({"forecast": days})
