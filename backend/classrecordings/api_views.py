from enrollments.models import Enrollment
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import ClassRecording
from .serializers import ClassRecordingSerializer


class ClassRecordingViewSet(viewsets.ModelViewSet):
    serializer_class = ClassRecordingSerializer

    def get_queryset(self):
        course_id = self.request.query_params.get("course_id")
        queryset = ClassRecording.objects.select_related("course", "uploaded_by").order_by(
            "-uploaded_at"
        )

        if self.request.user.is_staff:
            if course_id:
                return queryset.filter(course_id=course_id)
            return queryset

        if getattr(self.request.user, "role", "") == "mentor":
            queryset = queryset.filter(course__mentor=self.request.user)
            if course_id:
                queryset = queryset.filter(course_id=course_id)
            return queryset

        verified_course_ids = Enrollment.objects.filter(
            email__iexact=self.request.user.email, status="verified"
        ).values_list("course_id", flat=True)

        queryset = queryset.filter(course_id__in=verified_course_ids)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def get_permissions(self):
        if self.action in ("list", "retrieve", "create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        if not self.request.user.is_staff and course.mentor_id != self.request.user.id:
            raise PermissionDenied("You can only add recordings to your own courses.")
        serializer.save(uploaded_by=self.request.user)

    def perform_update(self, serializer):
        course = serializer.validated_data.get("course", serializer.instance.course)
        if not self.request.user.is_staff and course.mentor_id != self.request.user.id:
            raise PermissionDenied("You can only update recordings for your own courses.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_staff and instance.course.mentor_id != self.request.user.id:
            raise PermissionDenied("You can only delete recordings for your own courses.")
        instance.delete()
