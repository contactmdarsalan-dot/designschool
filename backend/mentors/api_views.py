from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from .models import MentorProfile
from .serializers import MentorProfileSerializer

class MentorProfileViewSet(viewsets.ModelViewSet):
    queryset = MentorProfile.objects.all()
    serializer_class = MentorProfileSerializer

    def get_queryset(self):
        return MentorProfile.objects.all()

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        if self.action in ('create', 'destroy'):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        if not self.request.user.is_staff and serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied('You can only update your own mentor profile.')
        serializer.save()
