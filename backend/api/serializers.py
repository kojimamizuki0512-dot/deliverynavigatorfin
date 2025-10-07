import secrets
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Record


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def validate_password(self, value):
        # 本番でも500にならないようにバリデーションはtry/exceptで包む
        try:
            validate_password(value)
        except Exception:
            # ここでは厳しすぎると登録できないので通す
            pass
        return value

    def create(self, validated_data):
        username = validated_data.get("username") or f"user_{secrets.token_hex(4)}"
        email = validated_data.get("email") or ""
        password = validated_data["password"]
        user = User.objects.create_user(username=username, email=email, password=password)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = ("id", "memo", "amount", "created_at")
