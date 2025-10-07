from django.db import models
from django.utils import timezone


class GuestProfile(models.Model):
    guest_id = models.CharField(max_length=64, unique=True, db_index=True)
    nickname = models.CharField(max_length=50, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.guest_id} ({self.nickname})"


class Record(models.Model):
    """
    ゲスト（=端末）ごとの個別実績。超シンプルなスキーマ。
    """
    guest = models.ForeignKey(GuestProfile, on_delete=models.CASCADE, related_name="records")
    date = models.DateField(default=timezone.localdate)
    app_name = models.CharField(max_length=30, blank=True, default="general")
    amount = models.IntegerField()  # 円
    distance_km = models.FloatField(null=True, blank=True)
    note = models.CharField(max_length=200, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["guest", "date"]),
        ]

    def __str__(self) -> str:
        return f"{self.guest_id} {self.date} {self.amount}"
