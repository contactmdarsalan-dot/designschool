from rest_framework import permissions, viewsets
from .models import AttendanceSession, StudentAttendance
from .serializers import AttendanceSessionSerializer, StudentAttendanceSerializer

class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer

    def get_queryset(self):
        queryset = AttendanceSession.objects.select_related('course').order_by('-date', 'start_time')
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

class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer

    def get_queryset(self):
        queryset = StudentAttendance.objects.select_related('student', 'session', 'session__course')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(student=self.request.user)

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
