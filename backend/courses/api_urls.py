from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    CategoryViewSet,
    CourseProgressView,
    CourseRecommendationView,
    CourseReviewViewSet,
    CourseViewSet,
    GamificationSummaryView,
    LearningPathListView,
    LearningPathStartView,
    LessonCompleteView,
    LessonStartView,
    QuizAttemptSubmitView,
    ResumeLearningView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'reviews', CourseReviewViewSet)

urlpatterns = [
    path('recommendations/', CourseRecommendationView.as_view(), name='course_recommendations'),
    path('resume/', ResumeLearningView.as_view(), name='resume_learning'),
    path('gamification/summary/', GamificationSummaryView.as_view(), name='gamification_summary'),
    path('learning-paths/', LearningPathListView.as_view(), name='learning_path_list'),
    path('learning-paths/<slug:path_slug>/start/', LearningPathStartView.as_view(), name='learning_path_start'),
    path('progress/<str:course_identifier>/', CourseProgressView.as_view(), name='course_progress'),
    path('lessons/<int:lesson_id>/start/', LessonStartView.as_view(), name='lesson_start'),
    path('lessons/<int:lesson_id>/complete/', LessonCompleteView.as_view(), name='lesson_complete'),
    path('quizzes/<int:quiz_id>/attempts/', QuizAttemptSubmitView.as_view(), name='quiz_attempt_submit'),
    path('', include(router.urls)),
]
