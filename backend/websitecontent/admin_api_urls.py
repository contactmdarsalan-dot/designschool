from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .admin_api_views import CallbackRequestViewSet, FreeResourceViewSet, SiteSettingViewSet

router = DefaultRouter()
router.register(r"settings", SiteSettingViewSet, basename="site-setting")
router.register(r"resources", FreeResourceViewSet, basename="free-resource")
router.register(r"callback-requests", CallbackRequestViewSet, basename="callback-request")

urlpatterns = [
    path("", include(router.urls)),
]
