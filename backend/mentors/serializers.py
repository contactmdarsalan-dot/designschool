from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import MentorProfile

User = get_user_model()


class MentorProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="mentor"), required=False
    )
    full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if not request or not request.user.is_staff:
            self.fields["user"].read_only = True

    class Meta:
        model = MentorProfile
        fields = (
            "id",
            "user",
            "mentor_id",
            "full_name",
            "email",
            "photo",
            "expertise",
            "bio",
            "website",
            "experience",
            "current_company",
            "joined_on",
        )
        read_only_fields = ("mentor_id", "joined_on")
