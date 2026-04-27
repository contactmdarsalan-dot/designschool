from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    CategoryViewSet,
    CourseProgressView,
    CourseReviewViewSet,
    CourseViewSet,
    LessonCompleteView,
    LessonStartView,
    QuizAttemptSubmitView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'reviews', CourseReviewViewSet)

urlpatterns = [
    path('progress/<str:course_identifier>/', CourseProgressView.as_view(), name='course_progress'),
    path('lessons/<int:lesson_id>/start/', LessonStartView.as_view(), name='lesson_start'),
    path('lessons/<int:lesson_id>/complete/', LessonCompleteView.as_view(), name='lesson_complete'),
    path('quizzes/<int:quiz_id>/attempts/', QuizAttemptSubmitView.as_view(), name='quiz_attempt_submit'),
    path('', include(router.urls)),
]
