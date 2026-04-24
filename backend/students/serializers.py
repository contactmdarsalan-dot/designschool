from rest_framework import serializers
from .models import StudentProfile

class StudentProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    is_phone_verified = serializers.BooleanField(source='user.is_phone_verified', read_only=True)

    class Meta:
        model = StudentProfile
        fields = ('id', 'student_id', 'full_name', 'email', 'date_of_birth', 'phone_number', 'is_phone_verified', 'joined_on')
        read_only_fields = ('student_id', 'joined_on')
