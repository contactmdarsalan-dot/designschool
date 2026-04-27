import uuid

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Badge,
    Category,
    Course,
    CourseModule,
    CourseProgress,
    CourseReview,
    DailyStreak,
    LearningEvent,
    LearningPath,
    LearningPathCourse,
    Lesson,
    LessonContentBlock,
    LessonProgress,
    Option,
    Question,
    Quiz,
    QuizAttempt,
    Skill,
    UserBadge,
    UserLearningPathProgress,
    UserSkillProgress,
    XPTransaction,
)
from .public_serializers import PublicCourseListSerializer
from .serializers import (
    BadgeAdminSerializer,
    CategorySerializer,
    CourseModuleAdminSerializer,
    CourseProgressAdminSerializer,
    CourseReviewSerializer,
    CourseSerializer,
    DailyStreakAdminSerializer,
    LearningEventAdminSerializer,
    LearningPathAdminSerializer,
    LearningPathCourseAdminSerializer,
    LessonAdminSerializer,
    LessonContentBlockAdminSerializer,
    LessonProgressAdminSerializer,
    OptionAdminSerializer,
    QuestionAdminSerializer,
    QuizAdminSerializer,
    QuizAttemptAdminSerializer,
    SkillAdminSerializer,
    UserBadgeAdminSerializer,
    UserLearningPathProgressAdminSerializer,
    UserSkillProgressAdminSerializer,
    XPTransactionAdminSerializer,
)
from .services.enrollment_service import user_has_verified_enrollment
from .services.gamification_service import get_gamification_summary
from .services.learning_path_service import (
    get_learning_path_queryset,
    serialize_path_progress,
    start_learning_path,
)
from .services.progress_service import (
    mark_lesson_completed,
    mark_lesson_started,
    recompute_course_progress,
)
from .services.quiz_service import submit_quiz_attempt
from .services.recommendation_service import get_recommended_courses_for_user
from .services.resume_service import get_resume_learning


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = "slug"

    def get_queryset(self):
        queryset = Course.objects.select_related("category", "mentor").prefetch_related(
            "learning_points",
            "requirements",
            "target_audience",
            "detail_facts",
            "skill_outcomes",
            "topics",
            "audience_items",
            "skills",
            "tags",
            "faqs",
            "modules__points",
            "modules__lessons__content_blocks",
            "modules__lessons__quiz__questions__options",
            "comparison_points",
            "technology_categories__items",
            "builder_items",
            "certificate_points",
            "mentor_spotlights",
            "reviews",
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(is_published=True)

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class CourseReviewViewSet(viewsets.ModelViewSet):
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = CourseReview.objects.select_related("course", "student").order_by("-created_at")
        course_id = self.request.query_params.get("course")
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        if not self.request.user.is_staff and not user_has_verified_enrollment(
            self.request.user, course
        ):
            raise PermissionDenied("Only verified students can review this course.")
        serializer.save(student=self.request.user)

    def perform_update(self, serializer):
        if (
            not self.request.user.is_staff
            and serializer.instance.student_id != self.request.user.id
        ):
            raise PermissionDenied("You can only update your own review.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_staff and instance.student_id != self.request.user.id:
            raise PermissionDenied("You can only delete your own review.")
        instance.delete()


class AdminOnlyModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]


class CourseModuleViewSet(AdminOnlyModelViewSet):
    serializer_class = CourseModuleAdminSerializer
    queryset = CourseModule.objects.select_related("course").order_by(
        "course__title", "sort_order", "id"
    )


class LessonViewSet(AdminOnlyModelViewSet):
    serializer_class = LessonAdminSerializer
    queryset = Lesson.objects.select_related("module", "module__course").order_by(
        "module__course__title",
        "module__sort_order",
        "sort_order",
        "id",
    )


class LessonContentBlockViewSet(AdminOnlyModelViewSet):
    serializer_class = LessonContentBlockAdminSerializer
    queryset = LessonContentBlock.objects.select_related("lesson", "lesson__module").order_by(
        "lesson__module__course__title",
        "lesson__module__sort_order",
        "lesson__sort_order",
        "sort_order",
        "id",
    )


class QuizViewSet(AdminOnlyModelViewSet):
    serializer_class = QuizAdminSerializer
    queryset = Quiz.objects.select_related(
        "lesson", "lesson__module", "lesson__module__course"
    ).order_by(
        "lesson__module__course__title",
        "lesson__module__sort_order",
        "lesson__sort_order",
        "id",
    )


class QuestionViewSet(AdminOnlyModelViewSet):
    serializer_class = QuestionAdminSerializer
    queryset = Question.objects.select_related("quiz").order_by("quiz__title", "sort_order", "id")


class OptionViewSet(AdminOnlyModelViewSet):
    serializer_class = OptionAdminSerializer
    queryset = Option.objects.select_related("question", "question__quiz").order_by(
        "question__quiz__title",
        "question__sort_order",
        "sort_order",
        "id",
    )


class QuizAttemptViewSet(AdminOnlyModelViewSet):
    serializer_class = QuizAttemptAdminSerializer
    queryset = QuizAttempt.objects.select_related("user", "quiz").order_by("-started_at")


class LessonProgressViewSet(AdminOnlyModelViewSet):
    serializer_class = LessonProgressAdminSerializer
    queryset = LessonProgress.objects.select_related(
        "user", "lesson", "lesson__module", "lesson__module__course"
    ).order_by(
        "-last_seen_at",
    )


class CourseProgressViewSet(AdminOnlyModelViewSet):
    serializer_class = CourseProgressAdminSerializer
    queryset = CourseProgress.objects.select_related("user", "course").order_by("-updated_at")


class XPTransactionViewSet(AdminOnlyModelViewSet):
    serializer_class = XPTransactionAdminSerializer
    queryset = XPTransaction.objects.select_related("user", "course", "lesson").order_by(
        "-created_at"
    )


class BadgeViewSet(AdminOnlyModelViewSet):
    serializer_class = BadgeAdminSerializer
    queryset = Badge.objects.all().order_by("xp_threshold", "name")


class UserBadgeViewSet(AdminOnlyModelViewSet):
    serializer_class = UserBadgeAdminSerializer
    queryset = UserBadge.objects.select_related("user", "badge").order_by("-awarded_at")


class DailyStreakViewSet(AdminOnlyModelViewSet):
    serializer_class = DailyStreakAdminSerializer
    queryset = DailyStreak.objects.select_related("user").order_by("-updated_at")


class SkillViewSet(AdminOnlyModelViewSet):
    serializer_class = SkillAdminSerializer
    queryset = Skill.objects.prefetch_related("courses").order_by("name")


class UserSkillProgressViewSet(AdminOnlyModelViewSet):
    serializer_class = UserSkillProgressAdminSerializer
    queryset = UserSkillProgress.objects.select_related("user", "skill").order_by("-updated_at")


class LearningPathViewSet(AdminOnlyModelViewSet):
    serializer_class = LearningPathAdminSerializer
    queryset = LearningPath.objects.all().order_by("-created_at")


class LearningPathCourseViewSet(AdminOnlyModelViewSet):
    serializer_class = LearningPathCourseAdminSerializer
    queryset = LearningPathCourse.objects.select_related("learning_path", "course").order_by(
        "learning_path__title",
        "sort_order",
        "id",
    )


class UserLearningPathProgressViewSet(AdminOnlyModelViewSet):
    serializer_class = UserLearningPathProgressAdminSerializer
    queryset = UserLearningPathProgress.objects.select_related("user", "learning_path").order_by(
        "-updated_at"
    )


class LearningEventViewSet(AdminOnlyModelViewSet):
    serializer_class = LearningEventAdminSerializer
    queryset = LearningEvent.objects.select_related("user", "course", "lesson").order_by(
        "-created_at"
    )


def serialize_course_progress(user, course):
    course_progress = recompute_course_progress(user, course)
    lesson_rows = LessonProgress.objects.filter(
        user=user,
        lesson__module__course=course,
    ).select_related("lesson")

    return {
        "course": {
            "id": str(course.id),
            "slug": course.slug,
            "title": course.title,
        },
        "progress": {
            "completedLessons": course_progress.completed_lessons,
            "totalLessons": course_progress.total_lessons,
            "progressPercent": course_progress.progress_percent,
            "xpEarned": course_progress.xp_earned,
            "completedAt": course_progress.completed_at,
        },
        "lessons": [
            {
                "id": row.lesson_id,
                "status": row.status,
                "progressPercent": row.progress_percent,
                "startedAt": row.started_at,
                "completedAt": row.completed_at,
            }
            for row in lesson_rows
        ],
    }


class CourseProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_identifier):
        query = Q(slug=course_identifier)
        try:
            uuid.UUID(str(course_identifier))
            query |= Q(id=course_identifier)
        except ValueError:
            pass

        course = get_object_or_404(Course.objects.filter(query), is_published=True)
        return Response({"data": serialize_course_progress(request.user, course)})


class CourseRecommendationView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            limit = min(12, max(1, int(request.query_params.get("limit", 6))))
        except (TypeError, ValueError):
            limit = 6

        courses = get_recommended_courses_for_user(request.user, limit=limit)
        serializer = PublicCourseListSerializer(courses, many=True, context={"request": request})
        return Response({"data": {"courses": serializer.data}})


class ResumeLearningView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"data": {"resumeLearning": get_resume_learning(request.user)}})


class GamificationSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"data": get_gamification_summary(request.user)})


class LearningPathListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        paths = get_learning_path_queryset()
        data = []
        for learning_path in paths:
            path_courses = [item.course for item in learning_path.path_courses.all()]
            serializer = PublicCourseListSerializer(
                path_courses, many=True, context={"request": request}
            )
            data.append(
                {
                    "id": learning_path.id,
                    "title": learning_path.title,
                    "slug": learning_path.slug,
                    "description": learning_path.description,
                    "courseCount": len(path_courses),
                    "progress": serialize_path_progress(request.user, learning_path),
                    "courses": serializer.data,
                }
            )
        return Response({"data": {"paths": data}})


class LearningPathStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, path_slug):
        learning_path = get_object_or_404(
            LearningPath.objects.prefetch_related("path_courses__course"),
            slug=path_slug,
            is_published=True,
        )
        start_learning_path(request.user, learning_path)
        return Response(
            {
                "data": {
                    "path": {
                        "id": learning_path.id,
                        "slug": learning_path.slug,
                        "title": learning_path.title,
                        "progress": serialize_path_progress(request.user, learning_path),
                    }
                }
            },
            status=status.HTTP_200_OK,
        )


class LessonStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related("module__course"),
            id=lesson_id,
            is_published=True,
        )
        mark_lesson_started(request.user, lesson)
        return Response({"data": serialize_course_progress(request.user, lesson.module.course)})


class LessonCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related("module__course"),
            id=lesson_id,
            is_published=True,
        )
        mark_lesson_completed(request.user, lesson)
        return Response(
            {"data": serialize_course_progress(request.user, lesson.module.course)},
            status=status.HTTP_200_OK,
        )


class QuizAttemptSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        quiz = get_object_or_404(
            Quiz.objects.select_related("lesson__module__course").prefetch_related(
                "questions__options"
            ),
            id=quiz_id,
            is_published=True,
            lesson__is_published=True,
        )
        result = submit_quiz_attempt(request.user, quiz, request.data.get("answers", {}))
        attempt = result["attempt"]

        return Response(
            {
                "data": {
                    "attempt": {
                        "id": attempt.id,
                        "score": attempt.score,
                        "passed": attempt.passed,
                        "xpAwarded": attempt.xp_awarded,
                        "correctCount": result["correct_count"],
                        "totalQuestions": result["total_questions"],
                        "alreadyPassed": result["already_passed"],
                    },
                    "progress": serialize_course_progress(request.user, result["course"]),
                }
            },
            status=status.HTTP_201_CREATED,
        )
