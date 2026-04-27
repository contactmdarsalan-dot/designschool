from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import InstructorWorkspaceView, MentorProfileViewSet

router = DefaultRouter()
router.register(r"", MentorProfileViewSet, basename="mentor-profile")

urlpatterns = [
    path("workspace/", InstructorWorkspaceView.as_view(), name="instructor_workspace"),
    path("", include(router.urls)),
]
