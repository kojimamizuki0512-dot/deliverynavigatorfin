from datetime import datetime, date
import hashlib, random

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer

# --- SimpleJWT ---
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# ===== 認証系 =====

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    ログイン時の username に email が来てもOKにする。
    """
    def validate(self, attrs):
        username = attrs.get(self.username_field)
        if username and "@" in username:
            try:
                user = User.objects.get(email__iexact=username)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass
        return super().validate(attrs)

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer

class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"id": user.id, "username": user.username, "email": user.email, "first_name": user.first_name},
            status=status.HTTP_201_CREATED,
        )

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email, "first_name": u.first_name})

# ===== ヘルスチェック =====
class Healthz(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({"status": "ok", "service": "deliverynavigatorfin"})

# ====== ユーザー固有のダミー生成 ======
def _rng_for_user(user, label: str) -> random.Random:
    # ユーザーID + きょうの日付 + ラベルから安定シード
    seed_src = f"{user.id}|{date.today().isoformat()}|{label}"
    seed = int(hashlib.sha256(seed_src.encode()).hexdigest(), 16) % (2**32)
    return random.Random(seed)

def _money_for_user(user, base: int, spread: int, label: str) -> int:
    rng = _rng_for_user(user, label)
    return max(0, base + rng.randint(-spread, spread))

# ====== 既存ダミーAPI（認証必須 & ユーザー固有） ======
class DailyRoute(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        rng = _rng_for_user(user, "route")
        # ベース構成は固定、位置や文言に微妙な差を出す
        timeline = [
            {"time": "18:00", "icon": "pin",   "text": "Stay in Dogenzaka cluster"},
            {"time": "18:30", "icon": "move",  "text": "Reposition to Ebisu"},
            {"time": "19:00", "icon": "bolt",  "text": "Peak around station"},
            {"time": "19:30", "icon": "lock",  "text": "Wait near hotspot"},
            {"time": "20:00", "icon": "pin",   "text": "Shift to East Gate"},
            {"time": "20:30", "icon": "bolt",  "text": "Peak around station"},
        ]
        # ランダムに一言添える（ユーザーごと日ごとで安定）
        pep = rng.choice(["Go!", "Nice pace", "Hold position", "Boost soon", "Green surge"])
        predicted = _money_for_user(user, base=13800, spread=1200, label="predicted")

        data = {
            "recommended_area": rng.choice(["Shibuya", "Ebisu", "Meguro", "Daikanyama"]),
            "predicted_daily_income": predicted,
            "pep_talk": pep,
            "timeline": timeline,
        }
        return Response(data)

class DailySummary(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        goal = int(request.query_params.get("goal", "12000"))
        total = _money_for_user(user, base=9868, spread=1500, label="total")
        hours = 4.2 + _rng_for_user(user, "hours").random() * 0.6
        avg = int(total / max(hours, 0.1))
        rate = min(100, int(total / max(goal, 1) * 100))
        return Response({
            "total_sales": total,
            "orders": 12 + _rng_for_user(user, "orders").randint(-3, 5),
            "avg_hourly": avg,
            "work_hours": round(hours, 1),
            "goal_rate": rate,
        })

class HeatmapData(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        rng = _rng_for_user(user, "heat")
        # ダミーポイント（ユーザーで強度が少し変わる）
        points = []
        base_lat, base_lng = 35.6581, 139.7017
        for i in range(12):
            points.append({
                "lat": base_lat + rng.uniform(-0.02, 0.02),
                "lng": base_lng + rng.uniform(-0.02, 0.02),
                "intensity": round(0.5 + rng.random()*0.5, 2),
                "restaurants": rng.sample(
                    ["Sushi A", "Ramen B", "Curry C", "Cafe D", "Burger E", "Taco F"], k=3
                ),
            })
        return Response({"points": points})

class WeeklyForecast(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        rng = _rng_for_user(user, "weekly")
        wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        return Response({
            "items": [
                {"day": d, "weather": rng.choice(["sunny", "cloudy", "rainy"]), "demand": rng.randint(1, 5)}
                for d in wd
            ]
        })
