from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import AdminDashboardView, AdminUserViewSet

router = DefaultRouter()
router.register(r"users", AdminUserViewSet, basename="admin-user")

urlpatterns = [
    path("dashboard/", AdminDashboardView.as_view(), name="admin_dashboard"),
    path("", include(router.urls)),
]
