from django.contrib.auth.models import User
from django.db import transaction, IntegrityError
from rest_framework import serializers

class RegisterSerializer(serializers.Serializer):
    # ニックネームは任意、メールも任意（ログインIDとして保存。空ならダミーを自動採番）
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        pwd = attrs.get("password", "")
        if len(pwd) < 6:
            raise serializers.ValidationError({"password": "パスワードは6文字以上にしてください。"})
        return attrs

    def _make_unique_username(self, base: str) -> str:
        base = (base or "user").strip() or "user"
        candidate = base[:30]
        if not User.objects.filter(username=candidate).exists():
            return candidate
        i = 1
        while True:
            candidate = f"{base[:25]}-{i}"
            if not User.objects.filter(username=candidate).exists():
                return candidate
            i += 1

    @transaction.atomic
    def create(self, validated_data):
        raw_username = validated_data.get("username", "") or ""
        email = validated_data.get("email", "") or ""
        password = validated_data["password"]

        # usernameが空なら email のローカル部 → さらに空なら自動採番
        base_name = raw_username.strip() or (email.split("@")[0] if "@" in email else "")
        username = self._make_unique_username(base_name or "user")

        # emailが空でもOK（DjangoのUserは空文字可）
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
        except IntegrityError as e:
            raise serializers.ValidationError({"detail": "そのユーザーは既に存在します。"}) from e

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
