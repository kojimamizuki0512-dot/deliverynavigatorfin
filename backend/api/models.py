from django.db import models
from django.contrib.auth.models import User

class Record(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="records")
    title = models.CharField(max_length=120)
    value = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
