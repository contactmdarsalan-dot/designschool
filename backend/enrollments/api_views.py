from rest_framework import permissions, viewsets

from .models import Enrollment, PaymentMethod
from .serializers import EnrollmentSerializer, PaymentMethodSerializer


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = Enrollment.objects.select_related("course", "payment_method").order_by(
            "-created_at"
        )
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(email__iexact=self.request.user.email)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = PaymentMethod.objects.all()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(is_active=True)
