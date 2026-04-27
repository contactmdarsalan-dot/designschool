from assignments.models import Assignment, StudentAssignment
from attendance.models import AttendanceSession, StudentAttendance
from certificates.models import StudentCertificate
from classrecordings.models import ClassRecording
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from enrollments.models import Enrollment

from .notifications import notify_student

User = get_user_model()


def student_for_email(email):
    if not email:
        return None
    return User.objects.filter(role="student", email__iexact=email).first()


def verified_students_for_course(course):
    emails = Enrollment.objects.filter(course=course, status="verified").values_list(
        "email", flat=True
    )
    return User.objects.filter(role="student", email__in=list(emails))


@receiver(pre_save, sender=Enrollment)
def remember_enrollment_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        return
    instance._previous_status = (
        sender.objects.filter(pk=instance.pk).values_list("status", flat=True).first()
    )


@receiver(post_save, sender=Enrollment)
def notify_enrollment_status(sender, instance, created, **kwargs):
    student = student_for_email(instance.email)
    if not student:
        return

    if created:
        notify_student(
            student,
            category="enrollment",
            title="Enrollment request received",
            message=f"Your request for {instance.course.title} is now in review.",
            action_url="/dashboard/join-course",
            event_key=f"enrollment-created-{instance.pk}",
        )
        return

    if (
        getattr(instance, "_previous_status", None) != instance.status
        and instance.status == "verified"
    ):
        notify_student(
            student,
            category="enrollment",
            title="Course access approved",
            message=f"You are now enrolled in {instance.course.title}.",
            action_url="/dashboard/courses",
            event_key=f"enrollment-verified-{instance.pk}",
        )


@receiver(post_save, sender=Assignment)
def notify_assignment_created(sender, instance, created, **kwargs):
    if not created:
        return
    for student in verified_students_for_course(instance.course):
        notify_student(
            student,
            category="assignment",
            title="New assignment posted",
            message=f"{instance.title} is available in {instance.course.title}.",
            action_url="/dashboard/assignments",
            event_key=f"assignment-{instance.pk}-student-{student.pk}",
        )


@receiver(pre_save, sender=StudentAssignment)
def remember_submission_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        instance._previous_marks = None
        return
    previous = (
        sender.objects.filter(pk=instance.pk).values("status", "marks_obtained").first() or {}
    )
    instance._previous_status = previous.get("status")
    instance._previous_marks = previous.get("marks_obtained")


@receiver(post_save, sender=StudentAssignment)
def notify_assignment_grade(sender, instance, created, **kwargs):
    if instance.status != "graded":
        return
    if (
        not created
        and getattr(instance, "_previous_status", None) == "graded"
        and getattr(instance, "_previous_marks", None) == instance.marks_obtained
    ):
        return
    notify_student(
        instance.student,
        category="grade",
        title="Assignment graded",
        message=f"{instance.assignment.title} has been graded. Marks: {instance.marks_obtained if instance.marks_obtained is not None else 'Not set'}.",
        action_url="/dashboard/assignments",
        event_key=f"assignment-graded-{instance.pk}-{instance.status}-{instance.marks_obtained}",
    )


@receiver(post_save, sender=ClassRecording)
def notify_recording_created(sender, instance, created, **kwargs):
    if not created:
        return
    for student in verified_students_for_course(instance.course):
        notify_student(
            student,
            category="recording",
            title="New class recording",
            message=f"{instance.title} is available for {instance.course.title}.",
            action_url="/dashboard/recordings",
            event_key=f"recording-{instance.pk}-student-{student.pk}",
        )


@receiver(post_save, sender=AttendanceSession)
def notify_attendance_session_created(sender, instance, created, **kwargs):
    if not created:
        return
    for student in verified_students_for_course(instance.course):
        notify_student(
            student,
            category="attendance",
            title="New class session scheduled",
            message=f"{instance.title or instance.course.title} is scheduled on {instance.date}.",
            action_url="/dashboard/attendance",
            event_key=f"attendance-session-{instance.pk}-student-{student.pk}",
        )


@receiver(post_save, sender=StudentAttendance)
def notify_attendance_marked(sender, instance, created, **kwargs):
    notify_student(
        instance.student,
        category="attendance",
        title="Attendance updated",
        message=f"Your attendance for {instance.session.title or instance.session.course.title} is marked {instance.get_status_display()}.",
        action_url="/dashboard/attendance",
        event_key=f"attendance-record-{instance.pk}-{instance.status}",
    )


@receiver(post_save, sender=StudentCertificate)
def notify_certificate_issued(sender, instance, created, **kwargs):
    if instance.status != "issued":
        return
    notify_student(
        instance.student,
        category="certificate",
        title="Certificate issued",
        message=f"Your certificate for {instance.certificate.course.title} is ready.",
        action_url="/dashboard/certificates",
        event_key=f"certificate-issued-{instance.pk}-{instance.status}",
        send_email=False,
    )
