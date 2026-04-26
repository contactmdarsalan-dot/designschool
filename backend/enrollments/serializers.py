from rest_framework import serializers
from .models import Enrollment, PaymentMethod


class PaymentMethodSerializer(serializers.ModelSerializer):
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = PaymentMethod
        fields = ('id', 'name', 'account_label', 'qr_code', 'qr_code_url', 'is_active', 'sort_order', 'created_at')
        read_only_fields = ('created_at', 'qr_code_url')

    def get_qr_code_url(self, obj):
        if not obj.qr_code:
            return ''
        request = self.context.get('request')
        url = obj.qr_code.url
        return request.build_absolute_uri(url) if request else url

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    payment_screenshot_url = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if not request or not request.user.is_staff:
            self.fields['status'].read_only = True

    class Meta:
        model = Enrollment
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'whatsapp_number',
            'course',
            'course_title',
            'payment_method',
            'payment_method_name',
            'payment_screenshot',
            'payment_screenshot_url',
            'status',
            'created_at',
        )
        read_only_fields = ('created_at',)

    def get_payment_screenshot_url(self, obj):
        if not obj.payment_screenshot:
            return ''
        request = self.context.get('request')
        url = obj.payment_screenshot.url
        return request.build_absolute_uri(url) if request else url

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        course = attrs.get('course')
        payment_method = attrs.get('payment_method')
        if course and not course.is_published:
            raise serializers.ValidationError({'course': 'This course is not open for enrollment.'})
        if payment_method and not payment_method.is_active:
            raise serializers.ValidationError({'payment_method': 'Choose an active payment method.'})
        if course and email and Enrollment.objects.filter(
            email__iexact=email,
            course=course,
            status__in=('pending', 'verified'),
        ).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError(
                {'course': 'An enrollment request for this course already exists for this email.'}
            )
        attrs['email'] = email
        return attrs
