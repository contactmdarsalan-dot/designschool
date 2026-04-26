from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Certificate, StudentCertificate

User = get_user_model()

class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Certificate
        fields = ('id', 'course', 'course_title', 'title', 'description', 'template_file', 'issue_date', 'is_published')
        read_only_fields = ('id', 'issue_date')

class StudentCertificateSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='student'), required=False)
    certificate_title = serializers.CharField(source='certificate.title', read_only=True)
    course_title = serializers.CharField(source='certificate.course.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if not request or not request.user.is_staff:
            self.fields['student'].read_only = True

    class Meta:
        model = StudentCertificate
        fields = ('id', 'certificate', 'certificate_title', 'course_title', 'student', 'student_name', 'issued_on', 'unique_id', 'download_link', 'status')
        read_only_fields = ('id', 'student_name', 'unique_id', 'issued_on')
