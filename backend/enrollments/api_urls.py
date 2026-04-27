from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import EnrollmentViewSet, PaymentMethodViewSet

router = DefaultRouter()
router.register(r"payment-methods", PaymentMethodViewSet, basename="payment-method")
router.register(r"", EnrollmentViewSet, basename="enrollment")

urlpatterns = [
    path("", include(router.urls)),
]
