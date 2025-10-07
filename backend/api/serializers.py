from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import GuestProfile, Record


# ===== 既存のログイン/登録 =====
class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True, default="")
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def validate_password(self, value):
        # 8文字以上の軽いチェック（厳密でなくてOKに）
        if len(value) < 8:
            raise serializers.ValidationError("パスワードは8文字以上にしてください。")
        # Djangoのバリデータ（ゆるくしたいならコメントアウト可）
        try:
            validate_password(value)
        except Exception:
            # 厳しすぎる場合は素通ししたいので無視
            pass
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


# ===== ゲスト用 =====
class GuestProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = GuestProfile
        fields = ("guest_id", "nickname", "created_at", "updated_at")


class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = ("id", "date", "app_name", "amount", "distance_km", "note", "created_at")
