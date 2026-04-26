from rest_framework import permissions, viewsets

from .models import CallbackRequest, FreeResource, SiteSetting
from .serializers import CallbackRequestSerializer, FreeResourceDetailSerializer, SiteSettingSerializer


class SiteSettingViewSet(viewsets.ModelViewSet):
    queryset = SiteSetting.objects.all().order_by('-updated_at')
    serializer_class = SiteSettingSerializer
    permission_classes = [permissions.IsAdminUser]


class FreeResourceViewSet(viewsets.ModelViewSet):
    queryset = (
        FreeResource.objects.all()
        .prefetch_related('outcomes', 'modules', 'workflow_steps', 'includes')
        .order_by('sort_order', 'title')
    )
    serializer_class = FreeResourceDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'slug'


class CallbackRequestViewSet(viewsets.ModelViewSet):
    queryset = CallbackRequest.objects.all().order_by('-created_at')
    serializer_class = CallbackRequestSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = CallbackRequest.objects.all().order_by('-created_at')
        status = (self.request.query_params.get('status') or '').strip()
        if status:
            queryset = queryset.filter(status=status)
        return queryset
