from rest_framework import serializers
from .models import MentorProfile

class MentorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = MentorProfile
        fields = ('id', 'mentor_id', 'full_name', 'email', 'photo', 'expertise', 'bio', 'website', 'experience', 'current_company', 'joined_on')
        read_only_fields = ('mentor_id', 'joined_on')
