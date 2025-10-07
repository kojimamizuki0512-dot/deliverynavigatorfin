from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    # メールは任意。空でもOK
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    # パスワードは緩め（6文字以上）に
    password = serializers.CharField(min_length=6, write_only=True)

    def create(self, validated_data):
        email = (validated_data.get("email") or "").strip()
        password = validated_data["password"]

        # ユーザー名は自動採番。メールがあれば@前、なければ userxxxx
        base = email.split("@")[0] if email else f"user{get_random_string(6)}"
        username = base
        i = 1
        while User.objects.filter(username=username).exists():
            username = f"{base}{i}"
            i += 1

        user = User.objects.create_user(
            username=username,
            email=email or "",
            password=password,
        )
        return user


class LoginSerializer(serializers.Serializer):
    # メール or ユーザー名、どちらでもOK
    identifier = serializers.CharField()
    password = serializers.CharField()
