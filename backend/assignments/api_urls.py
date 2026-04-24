from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import AssignmentViewSet, StudentAssignmentViewSet

router = DefaultRouter()
router.register(r'list', AssignmentViewSet)
router.register(r'submissions', StudentAssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
