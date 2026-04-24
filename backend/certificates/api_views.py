from rest_framework import viewsets, permissions
from .models import Certificate, StudentCertificate
from .serializers import CertificateSerializer, StudentCertificateSerializer

class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.filter(is_published=True)
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class StudentCertificateViewSet(viewsets.ModelViewSet):
    queryset = StudentCertificate.objects.all()
    serializer_class = StudentCertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return StudentCertificate.objects.all()
        return StudentCertificate.objects.filter(student=self.request.user)
