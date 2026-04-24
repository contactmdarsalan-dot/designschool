from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .api_views import GenerateOTPView, GoogleLoginView, LoginView, LogoutView, ProfileView, RegisterView, VerifyOTPView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='api_register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('google-login/', GoogleLoginView.as_view(), name='api_google_login'),
    path('generate-otp/', GenerateOTPView.as_view(), name='api_generate_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='api_verify_otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
    path('profile/', ProfileView.as_view(), name='api_profile'),
]
