from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Record  # ← 追加

class RegisterSerializer(serializers.ModelSerializer):
    # メールは任意
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

# ---- ここから追加（実績レコード用）----
class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = ("id", "title", "value", "created_at")
        read_only_fields = ("id", "created_at")

    # owner はトークンのユーザーを自動で紐づける
    def create(self, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return Record.objects.create(owner=user, **validated_data)
