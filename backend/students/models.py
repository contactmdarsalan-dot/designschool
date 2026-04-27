import uuid

from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_profile"
    )
    student_id = models.CharField(max_length=20, unique=True, default="", editable=False)
    date_of_birth = models.DateField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    joined_on = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.student_id:
            self.student_id = f"STD-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"


class StudentNotification(models.Model):
    CATEGORY_CHOICES = [
        ("enrollment", "Enrollment"),
        ("assignment", "Assignment"),
        ("grade", "Grade"),
        ("recording", "Recording"),
        ("attendance", "Attendance"),
        ("certificate", "Certificate"),
        ("system", "System"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="student_notifications"
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="system")
    title = models.CharField(max_length=180)
    message = models.TextField(max_length=1200)
    action_url = models.CharField(max_length=300, blank=True)
    event_key = models.CharField(max_length=160, unique=True)
    is_read = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.user.email} - {self.title}"
