from django.urls import path

from .api_public_views import PublicBlogDetailView, PublicBlogListView

urlpatterns = [
    path("", PublicBlogListView.as_view(), name="public_blog_list"),
    path("<slug:slug>/", PublicBlogDetailView.as_view(), name="public_blog_detail"),
]
