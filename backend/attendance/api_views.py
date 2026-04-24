from rest_framework import viewsets, permissions
from .models import AttendanceSession, StudentAttendance
from .serializers import AttendanceSessionSerializer, StudentAttendanceSerializer

class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return StudentAttendance.objects.all()
        return StudentAttendance.objects.filter(student=self.request.user)
