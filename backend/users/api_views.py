import os
import random

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import EmailTokenObtainPairSerializer, RegisterSerializer, UserSerializer

try:
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token
except ImportError:
    google_requests = None
    id_token = None

User = get_user_model()


class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            try:
                token.blacklist()
            except Exception:
                pass
            return Response(
                {'message': 'Logged out successfully.'},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except Exception:
            return Response(
                {'error': 'Invalid refresh token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GoogleLoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        access_token = request.data.get('access_token')

        email = None
        first_name = ''
        last_name = ''

        if token:
            if id_token is None or google_requests is None:
                return Response(
                    {'error': 'Google Sign-In is not configured on the server yet.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            try:
                audience = os.environ.get('GOOGLE_CLIENT_ID') or None
                idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), audience=audience)
                email = idinfo.get('email')
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')
            except ValueError as exc:
                return Response(
                    {'error': 'Invalid Google token', 'details': str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif access_token:
            import requests

            response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10,
            )
            if response.status_code != 200:
                return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)
            user_info = response.json()
            email = user_info.get('email')
            first_name = user_info.get('given_name', '')
            last_name = user_info.get('family_name', '')
        else:
            return Response(
                {'error': 'token or access_token is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email:
            return Response({'error': 'Email not found in Google token'}, status=status.HTTP_400_BAD_REQUEST)

        email = email.strip().lower()
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
            },
        )

        if not created:
            updated_fields = []
            if first_name and not user.first_name:
                user.first_name = first_name
                updated_fields.append('first_name')
            if last_name and not user.last_name:
                user.last_name = last_name
                updated_fields.append('last_name')
            if updated_fields:
                user.save(update_fields=updated_fields)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'is_new_user': created,
            }
        )


class GenerateOTPView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        phone_number = (request.data.get('phone_number') or '').strip()

        if not email or not phone_number:
            return Response(
                {'error': 'Email and phone number are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(''.join(char for char in phone_number if char.isdigit())) < 10:
            return Response(
                {'error': 'Please enter a valid phone number.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        otp_code = str(random.randint(100000, 999999))

        print('====================================')
        print(f'MOCK SMS TO {phone_number}: Your Eduflow OTP is {otp_code}')
        print('====================================')

        cache.set(f'otp_{email}', otp_code, timeout=300)

        user.phone_number = phone_number
        user.is_phone_verified = False
        user.save(update_fields=['phone_number', 'is_phone_verified'])

        return Response({'message': 'OTP generated and sent successfully.'})


class VerifyOTPView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        otp_code = (request.data.get('otp_code') or '').strip()

        if not email or not otp_code:
            return Response(
                {'error': 'Email and OTP code are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cached_otp = cache.get(f'otp_{email}')
        if not cached_otp:
            return Response(
                {'error': 'OTP expired or not found. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if cached_otp != otp_code:
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.is_phone_verified = True
        user.save(update_fields=['is_phone_verified'])
        cache.delete(f'otp_{email}')

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'message': 'Phone verified successfully.',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
            }
        )
