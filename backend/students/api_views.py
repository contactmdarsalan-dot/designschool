from collections import defaultdict
from datetime import time

from assignments.models import Assignment, StudentAssignment
from attendance.models import AttendanceSession, StudentAttendance
from certificates.models import StudentCertificate
from classrecordings.models import ClassRecording
from courses.models import Course, CourseReview
from django.db import transaction
from django.utils import timezone
from enrollments.models import Enrollment, PaymentMethod
from enrollments.serializers import EnrollmentSerializer
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import StudentNotification, StudentProfile
from .notifications import is_email_configured
from .serializers import StudentProfileSerializer, StudentWorkspaceProfileSerializer


def ensure_student_user(user):
    if getattr(user, "role", "") != "student":
        raise PermissionDenied("Only student accounts can access this workspace.")


def get_student_profile(user):
    profile, _ = StudentProfile.objects.get_or_create(user=user)
    return profile


def build_media_url(request, file_field):
    if not file_field:
        return ""

    try:
        url = file_field.url
    except ValueError:
        return ""

    return request.build_absolute_uri(url)


def build_external_url(request, value):
    if not value:
        return ""

    value = str(value)
    if value.startswith("http://") or value.startswith("https://"):
        return value

    return request.build_absolute_uri(value)


def build_schedule_label(course):
    parts = [part.strip() for part in (course.live_days, course.live_time) if part]
    return " / ".join(parts) if parts else "Schedule to be announced"


def enrollment_status_label(value):
    labels = {
        "available": "Available",
        "pending": "Pending",
        "verified": "Enrolled",
    }
    return labels.get(value, str(value).replace("_", " ").title())


def build_course_pricing(course):
    sale_price = (
        course.discounted_price
        if course.is_discount_active and course.discounted_price
        else course.actual_price
    )
    return {
        "price": float(course.actual_price or 0),
        "sale_price": float(sale_price or 0),
        "discount_percentage": course.discount_percentage(),
    }


def build_join_course_payload(request):
    user = request.user
    ensure_student_user(user)
    profile = get_student_profile(user)

    enrollment_rows = list(
        Enrollment.objects.filter(email__iexact=user.email)
        .select_related("course")
        .order_by("-created_at")
    )

    enrollment_map = {}
    for enrollment in enrollment_rows:
        current = enrollment_map.get(enrollment.course_id)
        if current == "verified":
            continue
        if current == "pending" and enrollment.status != "verified":
            continue
        enrollment_map[enrollment.course_id] = enrollment.status

    courses = list(
        Course.objects.filter(is_published=True)
        .select_related("mentor", "category")
        .order_by("-is_featured", "featured_order", "start_date", "title")
    )
    payment_methods = list(
        PaymentMethod.objects.filter(is_active=True).order_by("sort_order", "name")
    )

    course_cards = []
    available_count = 0
    pending_count = 0
    enrolled_count = 0

    for course in courses:
        status = enrollment_map.get(course.id, "available")
        if status == "available":
            available_count += 1
        elif status == "pending":
            pending_count += 1
        elif status == "verified":
            enrolled_count += 1

        course_cards.append(
            {
                "id": str(course.id),
                "slug": course.slug,
                "title": course.title,
                "short_description": course.short_description,
                "category": course.category.name if course.category else "General",
                "mentor_name": course.mentor.get_full_name() or course.mentor.username,
                "start_date": course.start_date,
                "duration_weeks": course.duration_weeks,
                "total_hours": course.total_hours,
                "schedule_label": build_schedule_label(course),
                "language": course.get_language_display(),
                "level": course.get_level_display(),
                "thumbnail": build_media_url(request, course.thumbnail),
                "is_featured": course.is_featured,
                "pricing": build_course_pricing(course),
                "enrollment_status": status,
                "enrollment_status_label": enrollment_status_label(status),
            }
        )

    return {
        "profile": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "whatsapp_number": user.phone_number or profile.phone_number or "",
            "is_phone_verified": user.is_phone_verified,
        },
        "summary": {
            "available_courses": available_count,
            "pending_requests": pending_count,
            "active_courses": enrolled_count,
        },
        "courses": course_cards,
        "payment_methods": [
            {
                "id": item.id,
                "name": item.name,
                "account_label": item.account_label,
                "qr_code_url": build_media_url(request, item.qr_code),
            }
            for item in payment_methods
        ],
    }


def attendance_status_label(status_value):
    labels = {
        "present": "Present",
        "late": "Late",
        "absent": "Absent",
        "excused": "Excused",
        "unmarked": "Unmarked",
    }
    return labels.get(status_value, status_value.replace("_", " ").title())


def assignment_status_payload(assignment, submission, now):
    if submission and submission.status == "graded":
        return "graded", "Graded"
    if submission and submission.status == "submitted":
        return "submitted", "Submitted"
    if assignment.due_date < now:
        return "overdue", "Overdue"
    return "pending", "Pending"


def build_recording_payload(recording):
    uploaded_by = ""
    if recording.uploaded_by:
        uploaded_by = recording.uploaded_by.get_full_name() or recording.uploaded_by.username

    return {
        "id": recording.id,
        "title": recording.title,
        "course_id": str(recording.course_id),
        "course_title": recording.course.title,
        "course_slug": recording.course.slug,
        "uploaded_at": recording.uploaded_at,
        "video_url": recording.video_url,
        "video_provider": recording.video_provider,
        "youtube_video_id": recording.youtube_video_id,
        "embed_url": recording.embed_url,
        "thumbnail_url": recording.thumbnail_url,
        "is_unlisted": recording.is_unlisted,
        "duration_seconds": recording.duration_seconds,
        "uploaded_by": uploaded_by,
    }


def build_notification_payload(notification):
    return {
        "id": notification.id,
        "category": notification.category,
        "title": notification.title,
        "message": notification.message,
        "action_url": notification.action_url,
        "is_read": notification.is_read,
        "email_sent": notification.email_sent,
        "created_at": notification.created_at,
    }


def build_student_workspace_payload(request):
    user = request.user
    ensure_student_user(user)

    today = timezone.localdate()
    now = timezone.now()
    profile = get_student_profile(user)

    active_enrollment_rows = list(
        Enrollment.objects.filter(email__iexact=user.email, status="verified")
        .select_related("course", "course__mentor", "course__category")
        .order_by("-created_at")
    )
    pending_enrollment_rows = list(
        Enrollment.objects.filter(email__iexact=user.email, status="pending")
        .select_related("course", "course__mentor", "course__category")
        .order_by("-created_at")
    )

    active_enrollments = []
    seen_course_ids = set()
    for enrollment in active_enrollment_rows:
        if enrollment.course_id in seen_course_ids:
            continue
        active_enrollments.append(enrollment)
        seen_course_ids.add(enrollment.course_id)

    course_ids = [enrollment.course_id for enrollment in active_enrollments]
    assignments = list(
        Assignment.objects.select_related("course")
        .filter(course_id__in=course_ids)
        .order_by("due_date", "title")
    )
    assignment_ids = [assignment.id for assignment in assignments]
    submissions = {
        submission.assignment_id: submission
        for submission in StudentAssignment.objects.select_related("assignment").filter(
            student=user, assignment_id__in=assignment_ids
        )
    }
    sessions = list(
        AttendanceSession.objects.select_related("course")
        .filter(course_id__in=course_ids)
        .order_by("-date", "start_time", "title")
    )
    attendance_records = list(
        StudentAttendance.objects.select_related("session", "session__course").filter(
            student=user, session__course_id__in=course_ids
        )
    )
    recordings = list(
        ClassRecording.objects.select_related("course", "uploaded_by")
        .filter(course_id__in=course_ids)
        .order_by("-uploaded_at")
    )
    certificates = list(
        StudentCertificate.objects.select_related("certificate", "certificate__course")
        .filter(student=user)
        .order_by("-issued_on")
    )
    notification_queryset = StudentNotification.objects.filter(user=user)
    notification_total = notification_queryset.count()
    notification_unread = notification_queryset.filter(is_read=False).count()
    recent_notifications = list(notification_queryset[:8])
    reviewed_course_ids = set(
        CourseReview.objects.filter(student=user, course_id__in=course_ids).values_list(
            "course_id", flat=True
        )
    )

    assignments_by_course = defaultdict(list)
    for assignment in assignments:
        assignments_by_course[assignment.course_id].append(assignment)

    sessions_by_course = defaultdict(list)
    for session in sessions:
        sessions_by_course[session.course_id].append(session)

    attendance_by_course = defaultdict(list)
    attendance_map = {}
    for attendance in attendance_records:
        attendance_by_course[attendance.session.course_id].append(attendance)
        attendance_map[attendance.session_id] = attendance

    recordings_by_course = defaultdict(list)
    for recording in recordings:
        recordings_by_course[recording.course_id].append(recording)

    certificates_by_course = defaultdict(list)
    for certificate in certificates:
        certificates_by_course[certificate.certificate.course_id].append(certificate)

    course_cards = []
    assignment_rows = []
    upcoming_assignments = []
    upcoming_sessions = []
    recent_recordings = []
    attendance_rows = []
    attendance_courses = []

    attendance_totals = {
        "present": 0,
        "late": 0,
        "absent": 0,
        "excused": 0,
        "tracked": 0,
        "total": len(sessions),
    }
    assignment_totals = {
        "total": 0,
        "pending": 0,
        "submitted": 0,
        "graded": 0,
        "overdue": 0,
    }

    for assignment in assignments:
        submission = submissions.get(assignment.id)
        status_key, status_label = assignment_status_payload(assignment, submission, now)
        row = {
            "id": assignment.id,
            "title": assignment.title,
            "description": assignment.description,
            "due_at": assignment.due_date,
            "course_id": str(assignment.course_id),
            "course_title": assignment.course.title,
            "course_slug": assignment.course.slug,
            "status": status_key,
            "status_label": status_label,
            "submission_link": submission.submission_link if submission else "",
            "submitted_at": submission.submitted_at if submission else None,
            "marks_obtained": submission.marks_obtained if submission else None,
        }
        assignment_rows.append(row)
        assignment_totals["total"] += 1
        assignment_totals[status_key] += 1

        if status_key in {"pending", "overdue"}:
            upcoming_assignments.append(row)

    assignment_rows.sort(key=lambda item: item["due_at"])
    upcoming_assignments.sort(key=lambda item: item["due_at"])

    for session in sessions:
        attendance = attendance_map.get(session.id)
        status_key = attendance.status if attendance else "unmarked"
        if attendance:
            attendance_totals["tracked"] += 1
            attendance_totals[status_key] += 1

        attendance_rows.append(
            {
                "id": session.id,
                "title": session.title or session.course.title,
                "course_id": str(session.course_id),
                "course_title": session.course.title,
                "course_slug": session.course.slug,
                "date": session.date,
                "start_time": session.start_time,
                "end_time": session.end_time,
                "description": session.description or "",
                "status": status_key,
                "status_label": attendance_status_label(status_key),
                "marked_at": attendance.marked_at if attendance else None,
            }
        )

        if session.date >= today:
            upcoming_sessions.append(
                {
                    "id": session.id,
                    "title": session.title or session.course.title,
                    "course_title": session.course.title,
                    "course_slug": session.course.slug,
                    "date": session.date,
                    "start_time": session.start_time,
                    "end_time": session.end_time,
                }
            )

    upcoming_sessions.sort(key=lambda item: (item["date"], item["start_time"] or time.min))

    for recording in recordings:
        recent_recordings.append(build_recording_payload(recording))

    certificate_rows = [
        {
            "id": certificate.id,
            "title": certificate.certificate.title,
            "course_id": str(certificate.certificate.course_id),
            "course_title": certificate.certificate.course.title,
            "course_slug": certificate.certificate.course.slug,
            "status": certificate.status,
            "status_label": certificate.get_status_display(),
            "issued_on": certificate.issued_on,
            "download_link": build_external_url(request, certificate.download_link),
            "unique_id": certificate.unique_id,
        }
        for certificate in certificates
    ]

    for enrollment in active_enrollments:
        course = enrollment.course
        course_assignments = assignments_by_course[course.id]
        course_sessions = sessions_by_course[course.id]
        course_attendances = attendance_by_course[course.id]
        course_recordings = recordings_by_course[course.id]
        course_certificates = certificates_by_course[course.id]

        present_count = sum(1 for item in course_attendances if item.status == "present")
        tracked_count = len(course_attendances)
        attendance_rate = round((present_count / tracked_count) * 100) if tracked_count else None

        next_session = None
        for session in sorted(
            course_sessions, key=lambda item: (item.date, item.start_time or time.min)
        ):
            if session.date >= today:
                next_session = {
                    "id": session.id,
                    "title": session.title or course.title,
                    "date": session.date,
                    "start_time": session.start_time,
                    "end_time": session.end_time,
                    "course_title": course.title,
                    "course_slug": course.slug,
                }
                break

        next_assignment = None
        pending_assignment_count = 0
        submitted_assignment_count = 0
        graded_assignment_count = 0

        for assignment in course_assignments:
            submission = submissions.get(assignment.id)
            status_key, status_label = assignment_status_payload(assignment, submission, now)
            if status_key == "submitted":
                submitted_assignment_count += 1
            elif status_key == "graded":
                graded_assignment_count += 1
            elif status_key in {"pending", "overdue"}:
                pending_assignment_count += 1
                if next_assignment is None:
                    next_assignment = {
                        "id": assignment.id,
                        "title": assignment.title,
                        "due_at": assignment.due_date,
                        "course_title": course.title,
                        "course_slug": course.slug,
                        "status_label": status_label,
                    }

        latest_recording = None
        if course_recordings:
            latest = course_recordings[0]
            latest_recording = build_recording_payload(latest)

        course_cards.append(
            {
                "id": str(course.id),
                "slug": course.slug,
                "title": course.title,
                "thumbnail": build_media_url(request, course.thumbnail),
                "short_description": course.short_description,
                "category": course.category.name if course.category else "General",
                "language": course.get_language_display(),
                "level": course.get_level_display(),
                "mentor_name": course.mentor.get_full_name() or course.mentor.username,
                "start_date": course.start_date,
                "duration_weeks": course.duration_weeks,
                "total_hours": course.total_hours,
                "schedule_label": build_schedule_label(course),
                "attendance_rate": attendance_rate,
                "attendance_summary": {
                    "present": present_count,
                    "tracked": tracked_count,
                },
                "assignment_summary": {
                    "total": len(course_assignments),
                    "pending": pending_assignment_count,
                    "submitted": submitted_assignment_count,
                    "graded": graded_assignment_count,
                },
                "next_session": next_session,
                "next_assignment": next_assignment,
                "latest_recording": latest_recording,
                "certificate_count": len(course_certificates),
                "has_reviewed": course.id in reviewed_course_ids,
                "enrolled_at": enrollment.created_at,
            }
        )

        attendance_courses.append(
            {
                "course_id": str(course.id),
                "course_title": course.title,
                "course_slug": course.slug,
                "mentor_name": course.mentor.get_full_name() or course.mentor.username,
                "tracked_sessions": tracked_count,
                "present_sessions": present_count,
                "attendance_rate": attendance_rate,
                "next_session": next_session,
            }
        )

    course_cards.sort(key=lambda item: item["enrolled_at"], reverse=True)
    attendance_courses.sort(key=lambda item: item["course_title"])

    overall_attendance_rate = (
        round((attendance_totals["present"] / attendance_totals["tracked"]) * 100)
        if attendance_totals["tracked"]
        else None
    )

    pending_enrollments = [
        {
            "id": enrollment.id,
            "course_title": enrollment.course.title,
            "course_slug": enrollment.course.slug,
            "status": enrollment.status,
            "status_label": enrollment.get_status_display(),
            "requested_at": enrollment.created_at,
        }
        for enrollment in pending_enrollment_rows
    ]

    return {
        "student": {
            "name": user.get_full_name() or user.username,
            "email": user.email,
            "student_id": profile.student_id,
            "phone_number": user.phone_number or profile.phone_number,
            "is_phone_verified": user.is_phone_verified,
            "joined_on": profile.joined_on,
            "date_of_birth": profile.date_of_birth,
        },
        "overview": {
            "active_courses": len(course_cards),
            "pending_enrollments": len(pending_enrollments),
            "upcoming_assignments": len(upcoming_assignments),
            "certificates_earned": sum(
                1 for item in certificate_rows if item["status"] == "issued"
            ),
            "attendance_rate": overall_attendance_rate,
            "total_recordings": len(recent_recordings),
        },
        "spotlight": {
            "next_session": upcoming_sessions[0] if upcoming_sessions else None,
            "next_assignment": upcoming_assignments[0] if upcoming_assignments else None,
            "latest_recording": recent_recordings[0] if recent_recordings else None,
        },
        "courses": course_cards,
        "assignments": {
            "summary": assignment_totals,
            "items": assignment_rows,
        },
        "recordings": {
            "summary": {
                "total": len(recent_recordings),
                "course_count": len({item["course_id"] for item in recent_recordings}),
            },
            "items": recent_recordings,
        },
        "attendance": {
            "summary": {
                **attendance_totals,
                "attendance_rate": overall_attendance_rate,
            },
            "courses": attendance_courses,
            "sessions": attendance_rows,
        },
        "certificates": {
            "summary": {
                "total": len(certificate_rows),
                "issued": sum(1 for item in certificate_rows if item["status"] == "issued"),
                "pending": sum(1 for item in certificate_rows if item["status"] == "pending"),
                "downloadable": sum(1 for item in certificate_rows if item["download_link"]),
            },
            "items": certificate_rows,
        },
        "notifications": {
            "summary": {
                "total": notification_total,
                "unread": notification_unread,
                "email_enabled": is_email_configured(),
            },
            "items": [
                build_notification_payload(notification) for notification in recent_notifications
            ],
        },
        "upcoming_assignments": upcoming_assignments[:8],
        "recent_recordings": recent_recordings[:8],
        "pending_enrollments": pending_enrollments[:8],
    }


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer

    def get_queryset(self):
        queryset = StudentProfile.objects.select_related("user")
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)

    def get_permissions(self):
        if self.action in ("list", "retrieve", "update", "partial_update"):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_update(self, serializer):
        if not self.request.user.is_staff and serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied("You can only update your own profile.")
        serializer.save()


class StudentOverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        workspace = build_student_workspace_payload(request)
        return Response(
            {
                "data": {
                    "student": workspace["student"],
                    "overview": workspace["overview"],
                    "spotlight": workspace["spotlight"],
                    "courses": workspace["courses"][:3],
                    "upcoming_assignments": workspace["upcoming_assignments"],
                    "recent_recordings": workspace["recent_recordings"],
                    "certificates": workspace["certificates"]["items"][:4],
                    "pending_enrollments": workspace["pending_enrollments"],
                }
            }
        )


class StudentDashboardView(StudentOverviewView):
    pass


class StudentCoursesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        workspace = build_student_workspace_payload(request)
        return Response(
            {
                "data": {
                    "overview": {
                        "active_courses": workspace["overview"]["active_courses"],
                        "pending_enrollments": workspace["overview"]["pending_enrollments"],
                        "attendance_rate": workspace["overview"]["attendance_rate"],
                    },
                    "courses": workspace["courses"],
                    "pending_enrollments": workspace["pending_enrollments"],
                }
            }
        )


class StudentAssignmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        workspace = build_student_workspace_payload(request)
        return Response(
            {
                "data": {
                    "summary": workspace["assignments"]["summary"],
                    "assignments": workspace["assignments"]["items"],
                }
            }
        )


class StudentRecordingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        workspace = build_student_workspace_payload(request)
        return Response(
            {
                "data": {
                    "summary": workspace["recordings"]["summary"],
                    "recordings": workspace["recordings"]["items"],
                }
            }
        )


class StudentAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        workspace = build_student_workspace_payload(request)
        return Response(
            {
                "data": {
                    "summary": workspace["attendance"]["summary"],
                    "courses": workspace["attendance"]["courses"],
                    "sessions": workspace["attendance"]["sessions"],
                }
            }
        )


class StudentCertificatesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        workspace = build_student_workspace_payload(request)
        return Response(
            {
                "data": {
                    "summary": workspace["certificates"]["summary"],
                    "certificates": workspace["certificates"]["items"],
                }
            }
        )


class StudentNotificationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self, request):
        ensure_student_user(request.user)
        queryset = StudentNotification.objects.filter(user=request.user)
        if request.query_params.get("unread") in {"1", "true", "True"}:
            queryset = queryset.filter(is_read=False)
        return queryset

    def build_response(self, request):
        queryset = self.get_queryset(request)
        all_queryset = StudentNotification.objects.filter(user=request.user)
        return Response(
            {
                "data": {
                    "summary": {
                        "total": all_queryset.count(),
                        "unread": all_queryset.filter(is_read=False).count(),
                        "email_enabled": is_email_configured(),
                    },
                    "notifications": [
                        build_notification_payload(notification) for notification in queryset[:50]
                    ],
                }
            }
        )

    def get(self, request):
        return self.build_response(request)

    def patch(self, request):
        ensure_student_user(request.user)
        notification_id = request.data.get("notification_id")

        if request.data.get("mark_all_read"):
            StudentNotification.objects.filter(user=request.user, is_read=False).update(
                is_read=True
            )
        elif notification_id:
            StudentNotification.objects.filter(user=request.user, id=notification_id).update(
                is_read=True
            )
        else:
            raise ValidationError({"detail": "Provide notification_id or mark_all_read."})

        return self.build_response(request)


class StudentWorkspaceProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_student_user(request.user)
        profile = get_student_profile(request.user)
        serializer = StudentWorkspaceProfileSerializer(profile)
        return Response({"data": serializer.data})

    @transaction.atomic
    def patch(self, request):
        ensure_student_user(request.user)
        profile = get_student_profile(request.user)
        serializer = StudentWorkspaceProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"data": serializer.data, "message": "Profile updated successfully."})


class StudentJoinCourseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"data": build_join_course_payload(request)})

    @transaction.atomic
    def post(self, request):
        user = request.user
        ensure_student_user(user)
        profile = get_student_profile(user)

        first_name = str(request.data.get("first_name", user.first_name or "")).strip()
        last_name = str(request.data.get("last_name", user.last_name or "")).strip()
        whatsapp_number = str(request.data.get("whatsapp_number", "")).strip()
        payment_method = request.data.get("payment_method")
        payment_screenshot = request.FILES.get("payment_screenshot")

        if not first_name or not last_name:
            raise ValidationError(
                {"profile": "Complete your first and last name before requesting enrollment."}
            )
        if not whatsapp_number:
            raise ValidationError(
                {"whatsapp_number": "WhatsApp number is required to request enrollment."}
            )
        if not payment_method:
            raise ValidationError({"payment_method": "Choose a payment method."})
        if not payment_screenshot:
            raise ValidationError({"payment_screenshot": "Upload your payment screenshot."})

        serializer = EnrollmentSerializer(
            data={
                "first_name": first_name,
                "last_name": last_name,
                "email": user.email,
                "whatsapp_number": whatsapp_number,
                "course": request.data.get("course"),
                "payment_method": payment_method,
                "payment_screenshot": payment_screenshot,
            },
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        enrollment = serializer.save()

        user_updates = []
        if whatsapp_number != (user.phone_number or ""):
            user.phone_number = whatsapp_number
            user.is_phone_verified = False
            user_updates.extend(["phone_number", "is_phone_verified"])
        if user_updates:
            user.save(update_fields=user_updates)

        if whatsapp_number != (profile.phone_number or ""):
            profile.phone_number = whatsapp_number
            profile.save(update_fields=["phone_number"])

        return Response(
            {
                "data": {
                    "id": enrollment.id,
                    "course_id": str(enrollment.course_id),
                    "status": enrollment.status,
                    "status_label": enrollment.get_status_display(),
                },
                "message": "Enrollment request submitted successfully.",
            },
            status=status.HTTP_201_CREATED,
        )
