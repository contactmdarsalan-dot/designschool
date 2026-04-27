from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import AttendanceSessionViewSet, StudentAttendanceViewSet

router = DefaultRouter()
router.register(r"sessions", AttendanceSessionViewSet, basename="attendance-session")
router.register(r"records", StudentAttendanceViewSet, basename="student-attendance")

urlpatterns = [
    path("", include(router.urls)),
]
