from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import EnrollmentViewSet

router = DefaultRouter()
router.register(r'', EnrollmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
