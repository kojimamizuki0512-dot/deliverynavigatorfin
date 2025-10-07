from django.db import models
from django.contrib.auth.models import User

class Record(models.Model):
    """ユーザーごとの任意記録（収益やメモ等）"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="records")
    amount = models.IntegerField(default=0)         # 収益
    duration_min = models.IntegerField(default=0)   # 稼働時間(分)
    memo = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
