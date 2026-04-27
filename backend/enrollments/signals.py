from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Enrollment


@receiver(post_save, sender=Enrollment)
def update_course_seats(sender, instance, created, **kwargs):
    """
    Increments the enrolled_students counter on the Course when an enrollment is verified.
    """
    if not created and instance.status == "verified":
        course = instance.course
        # Recalculate based on actual verified enrollments to be safe
        verified_count = Enrollment.objects.filter(course=course, status="verified").count()
        course.enrolled_students = verified_count
        course.save()
