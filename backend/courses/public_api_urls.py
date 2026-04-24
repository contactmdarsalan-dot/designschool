from django.urls import path
from .public_api_views import PublicCourseListView, PublicCourseDetailView


urlpatterns = [
    path('', PublicCourseListView.as_view(), name='public_courses_list'),
    path('<str:course_identifier>/', PublicCourseDetailView.as_view(), name='public_courses_detail'),
]
