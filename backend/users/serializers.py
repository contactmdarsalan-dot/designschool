from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


def ensure_role_profile(user):
    from mentors.models import MentorProfile
    from students.models import StudentProfile

    if user.role == 'student':
        StudentProfile.objects.get_or_create(user=user)
    elif user.role == 'mentor':
        MentorProfile.objects.get_or_create(user=user)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'phone_number',
            'is_phone_verified',
        )
        read_only_fields = ('id', 'username', 'email', 'role', 'is_phone_verified')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role='student',
        )


class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False, min_length=8)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'phone_number',
            'is_phone_verified',
            'is_active',
            'is_staff',
            'password',
        )
        read_only_fields = ('id', 'username', 'full_name')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def validate_email(self, value):
        email = value.strip().lower()
        queryset = User.objects.filter(email__iexact=email)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.pop('email').strip().lower()
        
        # In our model, username is the primary identifier but we map it from email
        # We ensure no 'username' or 'email' exists in validated_data before passing to create_user
        validated_data.pop('username', None)
        
        if not password:
            raise serializers.ValidationError({'password': 'Password is required when creating a user.'})

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            **validated_data
        )

        if user.role == 'admin':
            user.is_staff = True
            user.save(update_fields=['is_staff'])

        ensure_role_profile(user)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.get('email')

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if email:
            instance.username = email
        if instance.role == 'admin':
            instance.is_staff = True
        elif 'is_staff' not in validated_data:
            instance.is_staff = False

        if password:
            instance.set_password(password)

        instance.save()
        ensure_role_profile(instance)
        return instance


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    email = serializers.EmailField(write_only=True)

    default_error_messages = {
        'no_active_account': 'Invalid email or password.',
    }

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        try:
            matched_user = User.objects.get(email__iexact=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({'detail': self.error_messages['no_active_account']}) from exc

        user = authenticate(
            request=self.context.get('request'),
            username=matched_user.username,
            password=password,
        )

        if user is None or not user.is_active:
            raise serializers.ValidationError({'detail': self.error_messages['no_active_account']})

        refresh = self.get_token(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }
