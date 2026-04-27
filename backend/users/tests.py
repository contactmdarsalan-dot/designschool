from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegisterApiTests(APITestCase):
    def test_register_creates_student_role_only(self):
        response = self.client.post(
            reverse("api_register"),
            {
                "email": "student@example.com",
                "password": "SecurePass123",
                "first_name": "Asha",
                "last_name": "Sharma",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="student@example.com")
        self.assertEqual(user.role, "student")
        self.assertTrue(hasattr(user, "student_profile"))

    def test_register_ignores_attempted_role_escalation(self):
        response = self.client.post(
            reverse("api_register"),
            {
                "email": "admin-hack@example.com",
                "password": "SecurePass123",
                "first_name": "Bad",
                "last_name": "Actor",
                "role": "admin",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="admin-hack@example.com")
        self.assertEqual(user.role, "student")


class OtpApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="otp-user@example.com",
            email="otp-user@example.com",
            password="SecurePass123",
            role="student",
        )

    @override_settings(
        DEBUG=True,
        EMAIL_HOST_USER="noreply@example.com",
        EMAIL_HOST_PASSWORD="secret",
        DEFAULT_FROM_EMAIL="noreply@example.com",
    )
    @patch("users.api_views.send_mail")
    def test_generate_otp_returns_debug_code_and_email_fallback_status(self, mocked_send_mail):
        mocked_send_mail.return_value = 1

        response = self.client.post(
            reverse("api_generate_otp"),
            {
                "email": self.user.email,
                "phone_number": "+9779800000000",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("debug_otp", response.data)
        self.assertEqual(len(response.data["debug_otp"]), 6)
        self.assertEqual(response.data["delivery"]["sms_sent"], False)
        self.assertEqual(response.data["delivery"]["email_sent"], True)
        self.assertEqual(response.data["delivery"]["debug_fallback_available"], True)

        self.user.refresh_from_db()
        self.assertEqual(self.user.phone_number, "+9779800000000")
        self.assertFalse(self.user.is_phone_verified)

    @override_settings(
        DEBUG=True,
        EMAIL_HOST_USER="noreply@example.com",
        EMAIL_HOST_PASSWORD="secret",
        DEFAULT_FROM_EMAIL="noreply@example.com",
    )
    @patch.dict(
        "os.environ",
        {
            "TWILIO_ACCOUNT_SID": "AC123",
            "TWILIO_AUTH_TOKEN": "secret",
            "TWILIO_WHATSAPP_FROM": "whatsapp:+14155238886",
        },
        clear=False,
    )
    @patch("users.api_views.send_mail")
    @patch("users.api_views.requests.post")
    def test_generate_otp_sends_whatsapp_when_twilio_is_configured(
        self, mocked_post, mocked_send_mail
    ):
        mocked_send_mail.return_value = 1
        mocked_response = Mock()
        mocked_response.ok = True
        mocked_response.json.return_value = {"sid": "SM123"}
        mocked_post.return_value = mocked_response

        response = self.client.post(
            reverse("api_generate_otp"),
            {
                "email": self.user.email,
                "phone_number": "+9779800000000",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["delivery"]["whatsapp_sent"], True)
        self.assertEqual(response.data["delivery"]["whatsapp_configured"], True)
        self.assertEqual(response.data["delivery"]["message_sid"], "SM123")
        self.assertEqual(response.data["delivery"]["whatsapp_error"], "")
        self.assertEqual(response.data["message"], "OTP sent to your WhatsApp successfully.")

        mocked_post.assert_called_once()
        request_data = mocked_post.call_args.kwargs["data"]
        self.assertEqual(request_data["From"], "whatsapp:+14155238886")
        self.assertEqual(request_data["To"], "whatsapp:+9779800000000")
        self.assertIn("Body", request_data)


class AdminUserApiTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="admin@example.com",
            email="admin@example.com",
            password="SecurePass123",
            role="admin",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_admin_can_create_user_without_serializer_collision(self):
        response = self.client.post(
            "/api/v1/admin/users/",
            {
                "email": "new-student@example.com",
                "first_name": "New",
                "last_name": "Student",
                "role": "student",
                "phone_number": "+9779800001111",
                "is_phone_verified": True,
                "is_active": True,
                "is_staff": False,
                "password": "SecurePass123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = User.objects.get(email="new-student@example.com")
        self.assertEqual(created_user.username, "new-student@example.com")
        self.assertEqual(created_user.first_name, "New")
        self.assertEqual(created_user.role, "student")
