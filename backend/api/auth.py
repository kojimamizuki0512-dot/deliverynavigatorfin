from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication

class DeviceIdAuthentication(BaseAuthentication):
    """
    Authorization ヘッダーが無く、X-Device-Id ヘッダーがある場合に
    端末IDベースで User を get_or_create して認証済みとして扱う。
    """
    header_name = "X-Device-Id"

    def authenticate(self, request):
        device_id = request.headers.get(self.header_name)
        if not device_id:
            return None  # 他の認証（JWT 等）に委ねる

        User = get_user_model()
        # 端末IDから安定的なユーザー名を作る（先頭32文字まで）
        username = f"dev_{device_id[:32]}"

        user, created = User.objects.get_or_create(
            username=username,
            defaults={"email": ""},
        )
        if created or user.has_usable_password():
            # パスワードは使わない運用にする
            user.set_unusable_password()
            user.save(update_fields=["password"])

        # 認証成功（token は不要なので None）
        return (user, None)
