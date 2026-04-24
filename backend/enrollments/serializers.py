from rest_framework import serializers
from .models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'first_name', 'last_name', 'email', 'whatsapp_number', 'course', 'course_title', 'status', 'created_at')
        read_only_fields = ('status', 'created_at')
