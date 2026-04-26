from rest_framework import permissions, viewsets
from .models import ClassRecording
from .serializers import ClassRecordingSerializer
from enrollments.models import Enrollment

class ClassRecordingViewSet(viewsets.ModelViewSet):
    serializer_class = ClassRecordingSerializer

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        queryset = ClassRecording.objects.select_related('course', 'uploaded_by').order_by('-uploaded_at')

        if self.request.user.is_staff:
            if course_id:
                return queryset.filter(course_id=course_id)
            return queryset

        verified_course_ids = Enrollment.objects.filter(
            email__iexact=self.request.user.email,
            status='verified'
        ).values_list('course_id', flat=True)

        queryset = queryset.filter(course_id__in=verified_course_ids)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
