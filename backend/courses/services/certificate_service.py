from courses.models import CourseProgress


def user_is_certificate_eligible(user, course):
    if not course.certificate_available:
        return False

    return CourseProgress.objects.filter(
        user=user,
        course=course,
        progress_percent=100,
    ).exists()
