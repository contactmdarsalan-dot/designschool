from rest_framework import serializers
from .models import Certificate, StudentCertificate

class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Certificate
        fields = ('id', 'course', 'course_title', 'title', 'description', 'template_file', 'issue_date', 'is_published')

class StudentCertificateSerializer(serializers.ModelSerializer):
    certificate_title = serializers.CharField(source='certificate.title', read_only=True)
    course_title = serializers.CharField(source='certificate.course.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)

    class Meta:
        model = StudentCertificate
        fields = ('id', 'certificate', 'certificate_title', 'course_title', 'student', 'student_name', 'issued_on', 'unique_id', 'download_link', 'status')
        read_only_fields = ('unique_id', 'issued_on')
