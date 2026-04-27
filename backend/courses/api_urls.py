from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import (
    BadgeViewSet,
    CategoryViewSet,
    CourseModuleViewSet,
    CourseProgressView,
    CourseProgressViewSet,
    CourseRecommendationView,
    CourseReviewViewSet,
    CourseViewSet,
    DailyStreakViewSet,
    GamificationSummaryView,
    LearningEventViewSet,
    LearningPathCourseViewSet,
    LearningPathListView,
    LearningPathStartView,
    LearningPathViewSet,
    LessonCompleteView,
    LessonContentBlockViewSet,
    LessonProgressViewSet,
    LessonStartView,
    LessonViewSet,
    OptionViewSet,
    QuestionViewSet,
    QuizAttemptSubmitView,
    QuizAttemptViewSet,
    QuizViewSet,
    ResumeLearningView,
    SkillViewSet,
    UserBadgeViewSet,
    UserLearningPathProgressViewSet,
    UserSkillProgressViewSet,
    XPTransactionViewSet,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"reviews", CourseReviewViewSet)
router.register(r"modules", CourseModuleViewSet, basename="course-module")
router.register(r"lessons", LessonViewSet, basename="lesson")
router.register(r"lesson-blocks", LessonContentBlockViewSet, basename="lesson-block")
router.register(r"quizzes", QuizViewSet, basename="quiz")
router.register(r"questions", QuestionViewSet, basename="question")
router.register(r"options", OptionViewSet, basename="option")
router.register(r"quiz-attempts", QuizAttemptViewSet, basename="quiz-attempt")
router.register(r"lesson-progress", LessonProgressViewSet, basename="lesson-progress")
router.register(r"course-progress", CourseProgressViewSet, basename="course-progress")
router.register(r"xp-transactions", XPTransactionViewSet, basename="xp-transaction")
router.register(r"badges", BadgeViewSet, basename="badge")
router.register(r"user-badges", UserBadgeViewSet, basename="user-badge")
router.register(r"daily-streaks", DailyStreakViewSet, basename="daily-streak")
router.register(r"skills", SkillViewSet, basename="skill")
router.register(r"user-skill-progress", UserSkillProgressViewSet, basename="user-skill-progress")
router.register(r"learning-path-admin", LearningPathViewSet, basename="learning-path-admin")
router.register(
    r"learning-path-courses", LearningPathCourseViewSet, basename="learning-path-course"
)
router.register(
    r"user-learning-path-progress",
    UserLearningPathProgressViewSet,
    basename="user-learning-path-progress",
)
router.register(r"learning-events", LearningEventViewSet, basename="learning-event")

urlpatterns = [
    path("recommendations/", CourseRecommendationView.as_view(), name="course_recommendations"),
    path("resume/", ResumeLearningView.as_view(), name="resume_learning"),
    path("gamification/summary/", GamificationSummaryView.as_view(), name="gamification_summary"),
    path("learning-paths/", LearningPathListView.as_view(), name="learning_path_list"),
    path(
        "learning-paths/<slug:path_slug>/start/",
        LearningPathStartView.as_view(),
        name="learning_path_start",
    ),
    path("progress/<str:course_identifier>/", CourseProgressView.as_view(), name="course_progress"),
    path("lessons/<int:lesson_id>/start/", LessonStartView.as_view(), name="lesson_start"),
    path("lessons/<int:lesson_id>/complete/", LessonCompleteView.as_view(), name="lesson_complete"),
    path(
        "quizzes/<int:quiz_id>/attempts/",
        QuizAttemptSubmitView.as_view(),
        name="quiz_attempt_submit",
    ),
    path("", include(router.urls)),
]
