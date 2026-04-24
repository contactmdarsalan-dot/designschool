from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import StudentDashboardView, StudentProfileViewSet

router = DefaultRouter()
router.register(r'', StudentProfileViewSet, basename='student-profile')

urlpatterns = [
    path('dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('', include(router.urls)),
]
