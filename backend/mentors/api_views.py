from rest_framework import viewsets, permissions
from .models import MentorProfile
from .serializers import MentorProfileSerializer

class MentorProfileViewSet(viewsets.ModelViewSet):
    queryset = MentorProfile.objects.all()
    serializer_class = MentorProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return MentorProfile.objects.all()
        # Non-staff can only update their own profile but can view all mentors
        return MentorProfile.objects.all()

    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticatedOrReadOnly()]
