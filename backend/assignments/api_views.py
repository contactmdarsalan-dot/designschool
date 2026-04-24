from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from .models import Assignment, StudentAssignment
from .serializers import AssignmentSerializer, StudentAssignmentSerializer
from enrollments.models import Enrollment

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        queryset = Assignment.objects.select_related('course').order_by('due_date')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(
            course__enrollments__email__iexact=self.request.user.email,
            course__enrollments__status='verified',
        ).distinct()

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

class StudentAssignmentViewSet(viewsets.ModelViewSet):
    queryset = StudentAssignment.objects.all()
    serializer_class = StudentAssignmentSerializer

    def get_queryset(self):
        queryset = StudentAssignment.objects.select_related('assignment', 'assignment__course', 'student')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(student=self.request.user)

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'create'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        assignment = serializer.validated_data['assignment']
        is_enrolled = Enrollment.objects.filter(
            email__iexact=self.request.user.email,
            course=assignment.course,
            status='verified',
        ).exists()
        if not self.request.user.is_staff and not is_enrolled:
            raise PermissionDenied('You can only submit assignments for your verified courses.')
        serializer.save(student=self.request.user, status='submitted', submitted_at=timezone.now())
