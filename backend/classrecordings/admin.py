from django.contrib import admin

from .models import ClassRecording


@admin.register(ClassRecording)
class ClassRecordingAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "course",
        "video_provider",
        "is_unlisted",
        "uploaded_at",
        "uploaded_by",
    )
    list_filter = ("course", "video_provider", "is_unlisted", "uploaded_at")
    search_fields = ("title", "course__title", "video_url", "youtube_video_id")
    readonly_fields = ("video_provider", "youtube_video_id")
    ordering = ("-uploaded_at",)

    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
