from django.utils import timezone
from enrollments.models import Enrollment
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Assignment, StudentAssignment
from .serializers import AssignmentSerializer, StudentAssignmentSerializer


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def get_queryset(self):
        queryset = Assignment.objects.select_related("course").order_by("due_date")
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
        raise PermissionDenied("You can only create assignments for your own courses.")

    def perform_update(self, serializer):
        course = serializer.validated_data.get("course", serializer.instance.course)
        if self.request.user.is_staff or course.mentor_id == self.request.user.id:
            serializer.save()
            return
        raise PermissionDenied("You can only update assignments for your own courses.")

    def perform_destroy(self, instance):
        if self.request.user.is_staff or instance.course.mentor_id == self.request.user.id:
            instance.delete()
            return
        raise PermissionDenied("You can only delete assignments for your own courses.")


class StudentAssignmentViewSet(viewsets.ModelViewSet):
    queryset = StudentAssignment.objects.all()
    serializer_class = StudentAssignmentSerializer

    def get_queryset(self):
        queryset = StudentAssignment.objects.select_related(
            "assignment", "assignment__course", "student"
        )
        if self.request.user.is_staff:
            return queryset
        if getattr(self.request.user, "role", "") == "mentor":
            return queryset.filter(assignment__course__mentor=self.request.user)
        return queryset.filter(student=self.request.user)

    def get_permissions(self):
        if self.action in ("list", "retrieve", "create", "update", "partial_update"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def create(self, request, *args, **kwargs):
        if request.user.is_staff:
            return super().create(request, *args, **kwargs)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.validated_data["assignment"]

        is_enrolled = Enrollment.objects.filter(
            email__iexact=request.user.email,
            course=assignment.course,
            status="verified",
        ).exists()
        if not is_enrolled:
            raise PermissionDenied("You can only submit assignments for your verified courses.")

        existing_submission = StudentAssignment.objects.filter(
            assignment=assignment,
            student=request.user,
        ).first()

        if existing_submission and existing_submission.status == "graded":
            raise PermissionDenied("Graded submissions cannot be changed.")

        submission, created = StudentAssignment.objects.update_or_create(
            assignment=assignment,
            student=request.user,
            defaults={
                "submission_link": serializer.validated_data.get("submission_link"),
                "status": "submitted",
                "submitted_at": timezone.now(),
            },
        )
        response_serializer = self.get_serializer(submission)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def perform_create(self, serializer):
        assignment = serializer.validated_data["assignment"]
        if self.request.user.is_staff:
            serializer.save()
            return

        is_enrolled = Enrollment.objects.filter(
            email__iexact=self.request.user.email,
            course=assignment.course,
            status="verified",
        ).exists()
        if not self.request.user.is_staff and not is_enrolled:
            raise PermissionDenied("You can only submit assignments for your verified courses.")
        serializer.save(student=self.request.user, status="submitted", submitted_at=timezone.now())

    def perform_update(self, serializer):
        if self.request.user.is_staff:
            serializer.save()
            return

        if (
            getattr(self.request.user, "role", "") == "mentor"
            and serializer.instance.assignment.course.mentor_id == self.request.user.id
        ):
            serializer.save()
            return

        raise PermissionDenied("You can only grade submissions for your own courses.")
