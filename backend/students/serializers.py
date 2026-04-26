from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import StudentProfile

User = get_user_model()

class StudentProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='student'), required=False)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    is_phone_verified = serializers.BooleanField(source='user.is_phone_verified', read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if not request or not request.user.is_staff:
            self.fields['user'].read_only = True

    class Meta:
        model = StudentProfile
        fields = ('id', 'user', 'student_id', 'full_name', 'email', 'date_of_birth', 'phone_number', 'is_phone_verified', 'joined_on')
        read_only_fields = ('student_id', 'joined_on')


class StudentWorkspaceProfileSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    email = serializers.EmailField(read_only=True)
    student_id = serializers.CharField(read_only=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=20)
    is_phone_verified = serializers.BooleanField(read_only=True)
    joined_on = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        user = instance.user
        return {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'student_id': instance.student_id,
            'date_of_birth': instance.date_of_birth,
            'phone_number': user.phone_number or instance.phone_number,
            'is_phone_verified': user.is_phone_verified,
            'joined_on': instance.joined_on,
        }

    def update(self, instance, validated_data):
        user = instance.user
        user_updates = []

        for field in ('first_name', 'last_name'):
            if field in validated_data:
                setattr(user, field, validated_data[field].strip())
                user_updates.append(field)

        if 'phone_number' in validated_data:
            phone_number = validated_data['phone_number'].strip()
            instance.phone_number = phone_number

            if phone_number != (user.phone_number or ''):
                user.phone_number = phone_number
                user.is_phone_verified = False
                user_updates.extend(['phone_number', 'is_phone_verified'])

        if 'date_of_birth' in validated_data:
            instance.date_of_birth = validated_data['date_of_birth']

        if user_updates:
            user.save(update_fields=list(dict.fromkeys(user_updates)))

        instance.save()
        return instance
