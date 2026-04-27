from django.urls import path

from .api_views import (
    PublicCallbackRequestCreateView,
    PublicFreeResourceDetailView,
    PublicFreeResourceListView,
    PublicSiteSettingView,
)

urlpatterns = [
    path("site-config/", PublicSiteSettingView.as_view(), name="public_site_config"),
    path("resources/", PublicFreeResourceListView.as_view(), name="public_resource_list"),
    path(
        "resources/<slug:slug>/",
        PublicFreeResourceDetailView.as_view(),
        name="public_resource_detail",
    ),
    path(
        "callback-requests/",
        PublicCallbackRequestCreateView.as_view(),
        name="public_callback_request_create",
    ),
]
