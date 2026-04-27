from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import CallbackRequest, FreeResource, SiteSetting
from .serializers import (
    CallbackRequestSerializer,
    FreeResourceDetailSerializer,
    FreeResourceListSerializer,
    SiteSettingSerializer,
)


class PublicSiteSettingView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = SiteSettingSerializer

    def get(self, request):
        config = SiteSetting.objects.order_by("-updated_at").first()
        if not config:
            return Response(
                {
                    "data": {
                        "site": {
                            "site_name": "Design School",
                            "support_email": "",
                            "support_phone": "",
                            "support_whatsapp": "",
                            "address": "",
                            "office_hours": "",
                            "footer_tagline": "",
                            "updated_at": None,
                        }
                    }
                }
            )
        serializer = self.get_serializer(config)
        return Response({"data": {"site": serializer.data}})


class PublicFreeResourceListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = FreeResourceListSerializer

    def get_queryset(self):
        queryset = FreeResource.objects.filter(is_published=True).order_by("sort_order", "title")
        q = self.request.query_params.get("q", "").strip()
        if q:
            queryset = queryset.filter(title__icontains=q)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"data": {"resources": serializer.data}})


class PublicFreeResourceDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = FreeResourceDetailSerializer
    lookup_field = "slug"
    queryset = FreeResource.objects.filter(is_published=True)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"data": {"resource": serializer.data}})


class PublicCallbackRequestCreateView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CallbackRequestSerializer
    queryset = CallbackRequest.objects.all()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(
            {
                "message": "Callback request submitted successfully.",
                "data": {"callback": response.data},
            },
            status=response.status_code,
        )
