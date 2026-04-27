import uuid

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Course, CourseReview, Lesson, LessonProgress, Quiz
from .serializers import CategorySerializer, CourseSerializer, CourseReviewSerializer
from .services.enrollment_service import user_has_verified_enrollment
from .services.progress_service import mark_lesson_completed, mark_lesson_started, recompute_course_progress
from .services.quiz_service import submit_quiz_attempt

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Course.objects.select_related('category', 'mentor').prefetch_related(
            'learning_points',
            'requirements',
            'target_audience',
            'tags',
            'faqs',
            'modules__points',
            'modules__lessons__content_blocks',
            'modules__lessons__quiz__questions__options',
            'comparison_points',
            'technology_categories__items',
            'builder_items',
            'certificate_points',
            'mentor_spotlights',
            'reviews',
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(is_published=True)

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class CourseReviewViewSet(viewsets.ModelViewSet):
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = CourseReview.objects.select_related('course', 'student').order_by('-created_at')
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        if not self.request.user.is_staff and not user_has_verified_enrollment(self.request.user, course):
            raise PermissionDenied('Only verified students can review this course.')
        serializer.save(student=self.request.user)

    def perform_update(self, serializer):
        if not self.request.user.is_staff and serializer.instance.student_id != self.request.user.id:
            raise PermissionDenied('You can only update your own review.')
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_staff and instance.student_id != self.request.user.id:
            raise PermissionDenied('You can only delete your own review.')
        instance.delete()


def serialize_course_progress(user, course):
    course_progress = recompute_course_progress(user, course)
    lesson_rows = LessonProgress.objects.filter(
        user=user,
        lesson__module__course=course,
    ).select_related('lesson')

    return {
        'course': {
            'id': str(course.id),
            'slug': course.slug,
            'title': course.title,
        },
        'progress': {
            'completedLessons': course_progress.completed_lessons,
            'totalLessons': course_progress.total_lessons,
            'progressPercent': course_progress.progress_percent,
            'xpEarned': course_progress.xp_earned,
            'completedAt': course_progress.completed_at,
        },
        'lessons': [
            {
                'id': row.lesson_id,
                'status': row.status,
                'progressPercent': row.progress_percent,
                'startedAt': row.started_at,
                'completedAt': row.completed_at,
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
        return Response({'data': serialize_course_progress(request.user, course)})


class LessonStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related('module__course'),
            id=lesson_id,
            is_published=True,
        )
        mark_lesson_started(request.user, lesson)
        return Response({'data': serialize_course_progress(request.user, lesson.module.course)})


class LessonCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related('module__course'),
            id=lesson_id,
            is_published=True,
        )
        mark_lesson_completed(request.user, lesson)
        return Response({'data': serialize_course_progress(request.user, lesson.module.course)}, status=status.HTTP_200_OK)


class QuizAttemptSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        quiz = get_object_or_404(
            Quiz.objects.select_related('lesson__module__course').prefetch_related('questions__options'),
            id=quiz_id,
            is_published=True,
            lesson__is_published=True,
        )
        result = submit_quiz_attempt(request.user, quiz, request.data.get('answers', {}))
        attempt = result['attempt']

        return Response(
            {
                'data': {
                    'attempt': {
                        'id': attempt.id,
                        'score': attempt.score,
                        'passed': attempt.passed,
                        'xpAwarded': attempt.xp_awarded,
                        'correctCount': result['correct_count'],
                        'totalQuestions': result['total_questions'],
                        'alreadyPassed': result['already_passed'],
                    },
                    'progress': serialize_course_progress(request.user, result['course']),
                }
            },
            status=status.HTTP_201_CREATED,
        )
