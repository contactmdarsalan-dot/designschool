from urllib.parse import parse_qs, urlparse

from courses.models import Course  # import from your existing course app
from django.conf import settings
from django.db import models


class ClassRecording(models.Model):
    VIDEO_PROVIDER_CHOICES = [
        ("youtube", "YouTube"),
        ("external", "External Link"),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="recordings")
    title = models.CharField(max_length=255)
    video_url = models.URLField(
        help_text="Paste YouTube unlisted/public, Vimeo, Drive, or external video link"
    )
    video_provider = models.CharField(
        max_length=20, choices=VIDEO_PROVIDER_CHOICES, default="external"
    )
    youtube_video_id = models.CharField(
        max_length=32,
        blank=True,
        help_text="Auto-filled for YouTube links, including unlisted videos",
    )
    is_unlisted = models.BooleanField(
        default=True,
        help_text="Mark private catalog videos that should only be visible to enrolled students",
    )
    duration_seconds = models.PositiveIntegerField(
        blank=True, null=True, help_text="Optional duration used by the custom player UI"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_classrecordings",
    )

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @staticmethod
    def extract_youtube_video_id(video_url):
        parsed = urlparse(video_url or "")
        hostname = parsed.hostname or ""
        path_parts = [part for part in parsed.path.split("/") if part]

        if hostname.endswith("youtu.be") and path_parts:
            return path_parts[0]

        if "youtube.com" not in hostname:
            return ""

        query_video_id = parse_qs(parsed.query).get("v", [""])[0]
        if query_video_id:
            return query_video_id

        if path_parts:
            if path_parts[0] in {"embed", "shorts", "live"} and len(path_parts) > 1:
                return path_parts[1]
            if path_parts[0] == "watch":
                return query_video_id

        return ""

    @property
    def embed_url(self):
        if self.video_provider == "youtube" and self.youtube_video_id:
            return f"https://www.youtube.com/embed/{self.youtube_video_id}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&controls=0"
        return self.video_url

    @property
    def thumbnail_url(self):
        if self.video_provider == "youtube" and self.youtube_video_id:
            return f"https://img.youtube.com/vi/{self.youtube_video_id}/hqdefault.jpg"
        return ""

    def save(self, *args, **kwargs):
        youtube_video_id = self.extract_youtube_video_id(self.video_url)
        self.youtube_video_id = youtube_video_id
        self.video_provider = "youtube" if youtube_video_id else "external"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Class Recording"
        verbose_name_plural = "Class Recordings"
