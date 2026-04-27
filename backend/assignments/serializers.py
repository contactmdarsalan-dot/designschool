from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Assignment, StudentAssignment

User = get_user_model()


class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Assignment
        fields = ("id", "course", "course_title", "title", "description", "due_date")
        read_only_fields = ("id",)


class StudentAssignmentSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="student"), required=False
    )
    assignment_title = serializers.CharField(source="assignment.title", read_only=True)
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and getattr(request.user, "role", "") == "mentor" and not request.user.is_staff:
            self.fields["assignment"].read_only = True
            self.fields["student"].read_only = True
            self.fields["submission_link"].read_only = True
        elif not request or not request.user.is_staff:
            self.fields["student"].read_only = True
            self.fields["status"].read_only = True
            self.fields["marks_obtained"].read_only = True

    class Meta:
        model = StudentAssignment
        fields = (
            "id",
            "assignment",
            "assignment_title",
            "student",
            "student_name",
            "submission_link",
            "status",
            "marks_obtained",
            "submitted_at",
        )
        read_only_fields = ("id", "student_name", "submitted_at")
