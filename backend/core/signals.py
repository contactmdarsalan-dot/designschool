from django.db.models.signals import post_save
from django.dispatch import receiver

from mentors.models import MentorProfile
from students.models import StudentProfile
from users.models import User


@receiver(post_save, sender=User)
def create_user_profiles(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.role == 'student':
        StudentProfile.objects.get_or_create(user=instance)
    elif instance.role == 'mentor':
        MentorProfile.objects.get_or_create(user=instance)
