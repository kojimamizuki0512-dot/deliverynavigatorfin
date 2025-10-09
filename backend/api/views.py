 from django.contrib.auth import authenticate
 from django.db import IntegrityError, transaction
 from rest_framework import permissions, status
 from rest_framework.response import Response
 from rest_framework.views import APIView
 from rest_framework_simplejwt.tokens import RefreshToken
 from .serializers import RegisterSerializer, LoginSerializer
 from .dummy_data import (
     make_daily_route, make_daily_summary, make_heatmap_points, make_weekly_forecast,
 )
+from django.contrib.auth.models import User
+from .models import Record  # 実績

 # ---- ヘルス/ルート ---- (省略)

+# ---- 共通：端末ID→ゲストユーザー解決 ----
+def get_guest_user(request):
+    """X-Device-Id から “ゲストユーザー” を取得/自動作成（パスワード不可のユーザー）。"""
+    did = request.headers.get("X-Device-Id") or "anon"
+    uname = ("guest_" + did).replace(":", "").replace("-", "")[:150]
+    user, created = User.objects.get_or_create(username=uname, defaults={"email": ""})
+    if created:
+        user.set_unusable_password()
+        user.save()
+    return user
+
 # ---- Auth（今は使わないが残してOK） ---- (省略)

-# ---- ダミーAPI ----
+# ---- ダミーAPI（匿名OK）----
 class DailyRouteView(APIView):
-    permission_classes = [permissions.IsAuthenticated]
+    permission_classes = [permissions.AllowAny]
     def get(self, request):
         return Response(make_daily_route())

 class DailySummaryView(APIView):
-    permission_classes = [permissions.IsAuthenticated]
+    permission_classes = [permissions.AllowAny]
     def get(self, request):
         goal = int(request.GET.get("goal", 12000))
         return Response(make_daily_summary(goal))

 class HeatmapDataView(APIView):
-    permission_classes = [permissions.IsAuthenticated]
+    permission_classes = [permissions.AllowAny]
     def get(self, request):
         return Response(make_heatmap_points())

 class WeeklyForecastView(APIView):
-    permission_classes = [permissions.IsAuthenticated]
+    permission_classes = [permissions.AllowAny]
     def get(self, request):
         return Response(make_weekly_forecast())
+
+# ---- 実績API（匿名OK：ゲストに紐付け）----
+class RecordsView(APIView):
+    permission_classes = [permissions.AllowAny]
+    def get(self, request):
+        u = get_guest_user(request)
+        qs = Record.objects.filter(owner=u).order_by("-created_at")
+        data = [
+            {"id": r.id, "title": r.title, "value": r.value, "created_at": r.created_at}
+            for r in qs
+        ]
+        return Response(data)
+    def post(self, request):
+        u = get_guest_user(request)
+        payload = request.data or {}
+        r = Record.objects.create(
+            owner=u,
+            title=str(payload.get("title") or "record"),
+            value=int(payload.get("value") or 0),
+        )
+        return Response(
+            {"id": r.id, "title": r.title, "value": r.value, "created_at": r.created_at},
+            status=status.HTTP_201_CREATED,
+        )
+
+class MonthlyTotalView(APIView):
+    permission_classes = [permissions.AllowAny]
+    def get(self, request):
+        u = get_guest_user(request)
+        total = Record.objects.filter(owner=u).aggregate_sum = sum(
+            Record.objects.filter(owner=u).values_list("value", flat=True)
+        )
+        return Response({"total": total})
