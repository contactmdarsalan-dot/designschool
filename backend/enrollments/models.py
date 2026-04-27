from django.db import models
from core.validators import validate_image_upload


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    whatsapp_number = models.CharField(max_length=20)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='enrollments')
    payment_method = models.ForeignKey(
        'PaymentMethod',
        on_delete=models.SET_NULL,
        related_name='enrollments',
        blank=True,
        null=True,
    )
    payment_screenshot = models.ImageField(
        upload_to='enrollments/payment_screenshots/',
        validators=[validate_image_upload],
        blank=True,
        null=True,
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.course.title}"


# ✅ Proxy models for separate admin tables
class PendingEnrollment(Enrollment):
    class Meta:
        proxy = True
        verbose_name = "Enrollment Request (Pending)"
        verbose_name_plural = "Enrollment Requests (Pending)"


class VerifiedEnrollment(Enrollment):
    class Meta:
        proxy = True
        verbose_name = "Verified Enrollment"
        verbose_name_plural = "Verified Enrollments"


class PaymentMethod(models.Model):
    name = models.CharField(max_length=120)
    qr_code = models.ImageField(upload_to='enrollments/payment_qr_codes/', validators=[validate_image_upload])
    account_label = models.CharField(max_length=160, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('sort_order', 'name')

    def __str__(self):
        return self.name
