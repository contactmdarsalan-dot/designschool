from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import MentorProfileViewSet

router = DefaultRouter()
router.register(r'', MentorProfileViewSet, basename='mentor-profile')

urlpatterns = [
    path('', include(router.urls)),
]
