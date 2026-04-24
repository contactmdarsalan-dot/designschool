from rest_framework import serializers
from .models import Assignment, StudentAssignment

class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Assignment
        fields = ('id', 'course', 'course_title', 'title', 'description', 'due_date')

class StudentAssignmentSerializer(serializers.ModelSerializer):
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)

    class Meta:
        model = StudentAssignment
        fields = ('id', 'assignment', 'assignment_title', 'student', 'student_name', 'submission_link', 'status', 'marks_obtained', 'submitted_at')
        read_only_fields = ('submitted_at',)
