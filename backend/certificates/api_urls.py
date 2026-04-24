from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import CertificateViewSet, StudentCertificateViewSet

router = DefaultRouter()
router.register(r'templates', CertificateViewSet)
router.register(r'issued', StudentCertificateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
