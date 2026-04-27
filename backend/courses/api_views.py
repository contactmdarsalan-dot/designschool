from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from .models import Category, Course, CourseReview
from .serializers import CategorySerializer, CourseSerializer, CourseReviewSerializer
from .services.enrollment_service import user_has_verified_enrollment

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
