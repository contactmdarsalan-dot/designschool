from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    StudentAssignmentsView,
    StudentAttendanceView,
    StudentCertificatesView,
    StudentCoursesView,
    StudentDashboardView,
    StudentJoinCourseView,
    StudentOverviewView,
    StudentProfileViewSet,
    StudentRecordingsView,
    StudentWorkspaceProfileView,
)

router = DefaultRouter()
router.register(r'', StudentProfileViewSet, basename='student-profile')

urlpatterns = [
    path('overview/', StudentOverviewView.as_view(), name='student_overview'),
    path('dashboard/', StudentDashboardView.as_view(), name='student_dashboard'),
    path('courses/', StudentCoursesView.as_view(), name='student_courses'),
    path('assignments/', StudentAssignmentsView.as_view(), name='student_assignments'),
    path('recordings/', StudentRecordingsView.as_view(), name='student_recordings'),
    path('attendance/', StudentAttendanceView.as_view(), name='student_attendance'),
    path('certificates/', StudentCertificatesView.as_view(), name='student_certificates'),
    path('profile/', StudentWorkspaceProfileView.as_view(), name='student_workspace_profile'),
    path('join-course/', StudentJoinCourseView.as_view(), name='student_join_course'),
    path('', include(router.urls)),
]
