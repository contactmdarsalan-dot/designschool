from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import BlogCategoryViewSet, BlogPostViewSet, CommentViewSet

router = DefaultRouter()
router.register(r'categories', BlogCategoryViewSet, basename='blog-category')
router.register(r'posts', BlogPostViewSet, basename='blog-post')
router.register(r'comments', CommentViewSet, basename='blog-comment')

urlpatterns = [
    path('', include(router.urls)),
]
