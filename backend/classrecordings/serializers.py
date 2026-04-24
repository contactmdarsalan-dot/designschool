from rest_framework import serializers
from .models import ClassRecording

class ClassRecordingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassRecording
        fields = ['id', 'title', 'video_url', 'uploaded_at']
