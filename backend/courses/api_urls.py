from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import CategoryViewSet, CourseViewSet, CourseReviewViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'reviews', CourseReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
