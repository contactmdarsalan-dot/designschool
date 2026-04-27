from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import AssignmentViewSet, StudentAssignmentViewSet

router = DefaultRouter()
router.register(r"list", AssignmentViewSet, basename="assignment")
router.register(r"submissions", StudentAssignmentViewSet, basename="student-assignment")

urlpatterns = [
    path("", include(router.urls)),
]
