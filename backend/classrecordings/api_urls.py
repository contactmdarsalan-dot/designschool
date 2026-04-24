from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import ClassRecordingViewSet

router = DefaultRouter()
router.register(r'', ClassRecordingViewSet, basename='classrecordings')

urlpatterns = [
    path('', include(router.urls)),
]
