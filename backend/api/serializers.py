from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Record

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)

    def create(self, validated_data):
        username = validated_data.get("username") or ""
        email = validated_data.get("email") or ""
        password = validated_data["password"]

        # ログインIDとして email を使いたいケースに対応（emailが無い場合はデフォ名発行）
        if not username:
            if email:
                username = email.split("@")[0]
            else:
                base = "user"
                i = 1
                while User.objects.filter(username=f"{base}{i}").exists():
                    i += 1
                username = f"{base}{i}"

        # username が被っていたらユニークにする
        original = username
        i = 1
        while User.objects.filter(username=username).exists():
            username = f"{original}{i}"
            i += 1

        user = User.objects.create_user(username=username, email=email, password=password)
        return user


class LoginSerializer(serializers.Serializer):
    login = serializers.CharField()  # username または email
    password = serializers.CharField(write_only=True)


class RecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Record
        fields = ["id", "amount", "duration_min", "memo", "created_at"]
