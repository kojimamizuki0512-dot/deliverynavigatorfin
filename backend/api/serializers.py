from django.contrib.auth.models import User
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    # email を必須にして username にも流用
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name")
        extra_kwargs = {"username": {"required": False}}

    def create(self, validated_data):
        email = validated_data["email"].lower()
        username = validated_data.get("username") or email
        password = validated_data["password"]
        first_name = validated_data.get("first_name", "")
        user = User.objects.create_user(
            username=username, email=email, password=password, first_name=first_name
        )
        return user
