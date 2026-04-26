from rest_framework import serializers
from .models import ClassRecording

class ClassRecordingSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_slug = serializers.CharField(source='course.slug', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    embed_url = serializers.CharField(read_only=True)
    thumbnail_url = serializers.CharField(read_only=True)

    class Meta:
        model = ClassRecording
        fields = [
            'id',
            'course',
            'course_title',
            'course_slug',
            'title',
            'video_url',
            'video_provider',
            'youtube_video_id',
            'embed_url',
            'thumbnail_url',
            'is_unlisted',
            'duration_seconds',
            'uploaded_at',
            'uploaded_by',
            'uploaded_by_name',
        ]
        read_only_fields = [
            'id',
            'video_provider',
            'youtube_video_id',
            'embed_url',
            'thumbnail_url',
            'uploaded_at',
            'uploaded_by',
            'uploaded_by_name',
        ]
