from django.urls import path

from .public_api_views import PublicCourseDetailView, PublicCourseListView

urlpatterns = [
    path("", PublicCourseListView.as_view(), name="public_courses_list"),
    path(
        "<str:course_identifier>/", PublicCourseDetailView.as_view(), name="public_courses_detail"
    ),
]
