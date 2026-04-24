from rest_framework import viewsets, permissions
from .models import ClassRecording
from .serializers import ClassRecordingSerializer
from enrollments.models import Enrollment

class ClassRecordingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ClassRecordingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        if not course_id:
            return ClassRecording.objects.none()
        
        is_enrolled = Enrollment.objects.filter(
            email__iexact=self.request.user.email,
            course_id=course_id,
            status='verified'
        ).exists()

        if not is_enrolled and not self.request.user.is_staff:
            return ClassRecording.objects.none()

        return ClassRecording.objects.select_related('course').filter(course_id=course_id).order_by('-uploaded_at')
