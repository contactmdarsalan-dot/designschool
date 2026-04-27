from enrollments.models import Enrollment


def user_has_verified_enrollment(user, course):
    if not user or not user.is_authenticated or not user.email:
        return False

    return Enrollment.objects.filter(
        email__iexact=user.email,
        course=course,
        status="verified",
    ).exists()
