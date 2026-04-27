from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied

from .models import AttendanceSession, StudentAttendance
from .serializers import AttendanceSessionSerializer, StudentAttendanceSerializer


class AttendanceSessionViewSet(viewsets.ModelViewSet):
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer

    def get_queryset(self):
        queryset = AttendanceSession.objects.select_related("course").order_by(
            "-date", "start_time"
        )
        if self.request.user.is_staff:
            return queryset
        if getattr(self.request.user, "role", "") == "mentor":
            return queryset.filter(course__mentor=self.request.user)
        return queryset.filter(
            course__enrollments__email__iexact=self.request.user.email,
            course__enrollments__status="verified",
        ).distinct()

    def get_permissions(self):
        if self.action in ("list", "retrieve", "create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        if self.request.user.is_staff or course.mentor_id == self.request.user.id:
            serializer.save()
            return
        raise PermissionDenied("You can only create attendance sessions for your own courses.")

    def perform_update(self, serializer):
        course = serializer.validated_data.get("course", serializer.instance.course)
        if self.request.user.is_staff or course.mentor_id == self.request.user.id:
            serializer.save()
            return
        raise PermissionDenied("You can only update attendance sessions for your own courses.")

    def perform_destroy(self, instance):
        if self.request.user.is_staff or instance.course.mentor_id == self.request.user.id:
            instance.delete()
            return
        raise PermissionDenied("You can only delete attendance sessions for your own courses.")


class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer

    def get_queryset(self):
        queryset = StudentAttendance.objects.select_related("student", "session", "session__course")
        if self.request.user.is_staff:
            return queryset
        if getattr(self.request.user, "role", "") == "mentor":
            return queryset.filter(session__course__mentor=self.request.user)
        return queryset.filter(student=self.request.user)

    def get_permissions(self):
        if self.action in ("list", "retrieve", "create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        session = serializer.validated_data["session"]
        if self.request.user.is_staff or session.course.mentor_id == self.request.user.id:
            serializer.save()
            return
        raise PermissionDenied("You can only mark attendance for your own courses.")

    def perform_update(self, serializer):
        session = serializer.validated_data.get("session", serializer.instance.session)
        if self.request.user.is_staff or session.course.mentor_id == self.request.user.id:
            serializer.save()
            return
        raise PermissionDenied("You can only update attendance for your own courses.")

    def perform_destroy(self, instance):
        if self.request.user.is_staff or instance.session.course.mentor_id == self.request.user.id:
            instance.delete()
            return
        raise PermissionDenied("You can only delete attendance for your own courses.")
