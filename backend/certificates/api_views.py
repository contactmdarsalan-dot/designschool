from rest_framework import permissions, viewsets
from .models import Certificate, StudentCertificate
from .serializers import CertificateSerializer, StudentCertificateSerializer

class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer

    def get_queryset(self):
        queryset = Certificate.objects.select_related('course').order_by('-issue_date')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(
            is_published=True,
            course__enrollments__email__iexact=self.request.user.email,
            course__enrollments__status='verified',
        ).distinct()

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

class StudentCertificateViewSet(viewsets.ModelViewSet):
    queryset = StudentCertificate.objects.all()
    serializer_class = StudentCertificateSerializer

    def get_queryset(self):
        queryset = StudentCertificate.objects.select_related('certificate', 'certificate__course', 'student')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(student=self.request.user)

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]
