from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegisterApiTests(APITestCase):
    def test_register_creates_student_role_only(self):
        response = self.client.post(
            reverse('api_register'),
            {
                'email': 'student@example.com',
                'password': 'SecurePass123',
                'first_name': 'Asha',
                'last_name': 'Sharma',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='student@example.com')
        self.assertEqual(user.role, 'student')
        self.assertTrue(hasattr(user, 'student_profile'))

    def test_register_ignores_attempted_role_escalation(self):
        response = self.client.post(
            reverse('api_register'),
            {
                'email': 'admin-hack@example.com',
                'password': 'SecurePass123',
                'first_name': 'Bad',
                'last_name': 'Actor',
                'role': 'admin',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='admin-hack@example.com')
        self.assertEqual(user.role, 'student')
