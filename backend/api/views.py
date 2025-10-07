from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer, RecordSerializer
from .models import Record
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
        user = ser.save()
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

        login_id = ser.validated_data["login"]
        password = ser.validated_data["password"]

        # email っぽければ username を引く
        if "@" in login_id:
            try:
                u = User.objects.get(email=login_id)
                username = u.username
            except User.DoesNotExist:
                username = login_id  # そのまま試す
        else:
            username = login_id

        user = authenticate(username=username, password=password)
        if not user:
            return Response({"detail": "ユーザー名/メールまたはパスワードが違います。"}, status=400)

        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)}, status=200)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email})

# ---- ダミーAPI（表示） ----
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

# ---- 個別記録 ----
class RecordListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Record.objects.filter(user=request.user)
        return Response(RecordSerializer(qs, many=True).data)

    def post(self, request):
        ser = RecordSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=400)
        rec = Record.objects.create(user=request.user, **ser.validated_data)
        return Response(RecordSerializer(rec).data, status=201)
