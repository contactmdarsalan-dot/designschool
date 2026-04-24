from rest_framework import serializers
from .models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'first_name', 'last_name', 'email', 'whatsapp_number', 'course', 'course_title', 'status', 'created_at')
        read_only_fields = ('status', 'created_at')

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        course = attrs.get('course')
        if course and not course.is_published:
            raise serializers.ValidationError({'course': 'This course is not open for enrollment.'})
        if course and email and Enrollment.objects.filter(
            email__iexact=email,
            course=course,
            status__in=('pending', 'verified'),
        ).exists():
            raise serializers.ValidationError(
                {'course': 'An enrollment request for this course already exists for this email.'}
            )
        attrs['email'] = email
        return attrs
