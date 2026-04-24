from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import CertificateViewSet, StudentCertificateViewSet

router = DefaultRouter()
router.register(r'templates', CertificateViewSet, basename='certificate-template')
router.register(r'issued', StudentCertificateViewSet, basename='student-certificate')

urlpatterns = [
    path('', include(router.urls)),
]
