from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import AttendanceSession, StudentAttendance

User = get_user_model()

class AttendanceSessionSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = AttendanceSession
        fields = ('id', 'course', 'course_title', 'title', 'date', 'start_time', 'end_time', 'description')
        read_only_fields = ('id',)

class StudentAttendanceSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='student'))
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    session_title = serializers.CharField(source='session.title', read_only=True)

    class Meta:
        model = StudentAttendance
        fields = ('id', 'session', 'session_title', 'student', 'student_name', 'status', 'marked_at')
        read_only_fields = ('id', 'student_name', 'marked_at')
