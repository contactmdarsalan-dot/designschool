from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Enrollment
from .serializers import EnrollmentSerializer

class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Enrollment.objects.all()
        # For students, only show their own enrollments based on email
        return Enrollment.objects.filter(email=self.request.user.email)
