from assignments.models import Assignment, StudentAssignment
from attendance.models import AttendanceSession, StudentAttendance
from classrecordings.models import ClassRecording
from courses.models import Course
from django.contrib.auth import get_user_model
from enrollments.models import Enrollment
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MentorProfile
from .serializers import MentorProfileSerializer

User = get_user_model()


def ensure_mentor_user(user):
    if getattr(user, "role", "") != "mentor":
        raise PermissionDenied("Only instructor accounts can access this workspace.")


class MentorProfileViewSet(viewsets.ModelViewSet):
    queryset = MentorProfile.objects.all()
    serializer_class = MentorProfileSerializer

    def get_queryset(self):
        return MentorProfile.objects.all()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        if self.action in ("create", "destroy"):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        if not self.request.user.is_staff and serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied("You can only update your own mentor profile.")
        serializer.save()


class InstructorWorkspaceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_mentor_user(request.user)
        profile, _ = MentorProfile.objects.get_or_create(user=request.user)
        courses = list(
            Course.objects.filter(mentor=request.user)
            .select_related("category")
            .order_by("-is_published", "start_date", "title")
        )
        course_ids = [course.id for course in courses]

        enrollments = list(
            Enrollment.objects.filter(course_id__in=course_ids)
            .select_related("course")
            .order_by("-created_at")
        )
        verified_enrollments = [item for item in enrollments if item.status == "verified"]
        pending_enrollments = [item for item in enrollments if item.status == "pending"]
        assignments = list(
            Assignment.objects.filter(course_id__in=course_ids)
            .select_related("course")
            .order_by("due_date", "title")
        )
        submissions = list(
            StudentAssignment.objects.filter(assignment__course_id__in=course_ids)
            .select_related("assignment", "assignment__course", "student")
            .order_by("-submitted_at")
        )
        recordings = list(
            ClassRecording.objects.filter(course_id__in=course_ids)
            .select_related("course", "uploaded_by")
            .order_by("-uploaded_at")
        )
        sessions = list(
            AttendanceSession.objects.filter(course_id__in=course_ids)
            .select_related("course")
            .order_by("-date", "start_time")
        )
        attendance_count = StudentAttendance.objects.filter(
            session__course_id__in=course_ids
        ).count()
        student_users = {
            user.email.lower(): user
            for user in User.objects.filter(
                role="student", email__in=[item.email for item in verified_enrollments]
            )
        }
        attendance_records = list(
            StudentAttendance.objects.filter(session__course_id__in=course_ids)
            .select_related("session", "session__course", "student")
            .order_by("-marked_at")
        )

        learners_by_course = {}
        for enrollment in verified_enrollments:
            learners_by_course.setdefault(enrollment.course_id, 0)
            learners_by_course[enrollment.course_id] += 1

        assignment_count_by_course = {}
        for assignment in assignments:
            assignment_count_by_course.setdefault(assignment.course_id, 0)
            assignment_count_by_course[assignment.course_id] += 1

        recording_count_by_course = {}
        for recording in recordings:
            recording_count_by_course.setdefault(recording.course_id, 0)
            recording_count_by_course[recording.course_id] += 1

        return Response(
            {
                "data": {
                    "profile": {
                        "name": request.user.get_full_name() or request.user.email,
                        "email": request.user.email,
                        "mentor_id": profile.mentor_id,
                        "expertise": profile.expertise,
                        "experience": profile.experience,
                        "current_company": profile.current_company,
                        "joined_on": profile.joined_on,
                    },
                    "summary": {
                        "courses": len(courses),
                        "published_courses": sum(1 for course in courses if course.is_published),
                        "learners": len(verified_enrollments),
                        "pending_enrollments": len(pending_enrollments),
                        "assignments": len(assignments),
                        "submissions": len(submissions),
                        "recordings": len(recordings),
                        "sessions": len(sessions),
                        "attendance_marks": attendance_count,
                    },
                    "notifications": [
                        *[
                            {
                                "id": f"pending-enrollment-{enrollment.id}",
                                "type": "enrollment",
                                "title": "Enrollment pending",
                                "message": f"{enrollment.first_name} {enrollment.last_name}".strip()
                                or enrollment.email,
                                "meta": enrollment.course.title,
                                "created_at": enrollment.created_at,
                            }
                            for enrollment in pending_enrollments[:5]
                        ],
                        *[
                            {
                                "id": f"submission-{submission.id}",
                                "type": "submission",
                                "title": "Submission needs review",
                                "message": submission.assignment.title,
                                "meta": submission.student.get_full_name()
                                or submission.student.email,
                                "created_at": submission.submitted_at,
                            }
                            for submission in submissions
                            if submission.status == "submitted"
                        ][:5],
                        *[
                            {
                                "id": f"attendance-session-{session.id}",
                                "type": "attendance",
                                "title": "Attendance session",
                                "message": session.title or session.course.title,
                                "meta": session.date,
                                "created_at": session.date,
                            }
                            for session in sessions[:5]
                        ],
                    ][:12],
                    "courses": [
                        {
                            "id": str(course.id),
                            "title": course.title,
                            "slug": course.slug,
                            "category": course.category.name if course.category else "General",
                            "start_date": course.start_date,
                            "live_days": course.live_days,
                            "live_time": course.live_time,
                            "schedule_label": " / ".join(
                                part for part in [course.live_days, course.live_time] if part
                            )
                            or "TBA",
                            "is_published": course.is_published,
                            "is_live": course.is_live,
                            "level": course.get_level_display(),
                            "learners": learners_by_course.get(course.id, 0),
                            "assignments": assignment_count_by_course.get(course.id, 0),
                            "recordings": recording_count_by_course.get(course.id, 0),
                        }
                        for course in courses
                    ],
                    "learners": [
                        {
                            "id": enrollment.id,
                            "user_id": student_users.get(enrollment.email.lower()).id
                            if student_users.get(enrollment.email.lower())
                            else None,
                            "name": f"{enrollment.first_name} {enrollment.last_name}".strip()
                            or enrollment.email,
                            "email": enrollment.email,
                            "course_id": str(enrollment.course_id),
                            "course_title": enrollment.course.title,
                            "status": enrollment.status,
                            "status_label": enrollment.get_status_display(),
                            "joined_at": enrollment.created_at,
                        }
                        for enrollment in verified_enrollments[:50]
                    ],
                    "assignments": [
                        {
                            "id": assignment.id,
                            "title": assignment.title,
                            "description": assignment.description,
                            "course_id": str(assignment.course_id),
                            "course_title": assignment.course.title,
                            "due_date": assignment.due_date,
                            "submission_count": sum(
                                1 for item in submissions if item.assignment_id == assignment.id
                            ),
                        }
                        for assignment in assignments
                    ],
                    "submissions": [
                        {
                            "id": submission.id,
                            "assignment_id": submission.assignment_id,
                            "assignment_title": submission.assignment.title,
                            "course_id": str(submission.assignment.course_id),
                            "course_title": submission.assignment.course.title,
                            "student_name": submission.student.get_full_name()
                            or submission.student.email,
                            "student_email": submission.student.email,
                            "submission_link": submission.submission_link,
                            "status": submission.status,
                            "status_label": submission.get_status_display(),
                            "marks_obtained": submission.marks_obtained,
                            "submitted_at": submission.submitted_at,
                        }
                        for submission in submissions[:50]
                    ],
                    "attendance_sessions": [
                        {
                            "id": session.id,
                            "course_id": str(session.course_id),
                            "course_title": session.course.title,
                            "title": session.title or session.course.title,
                            "date": session.date,
                            "start_time": session.start_time,
                            "end_time": session.end_time,
                            "description": session.description,
                            "marked_count": sum(
                                1 for item in attendance_records if item.session_id == session.id
                            ),
                        }
                        for session in sessions
                    ],
                    "attendance_records": [
                        {
                            "id": record.id,
                            "session_id": record.session_id,
                            "course_title": record.session.course.title,
                            "student_id": record.student_id,
                            "student_name": record.student.get_full_name() or record.student.email,
                            "student_email": record.student.email,
                            "status": record.status,
                            "status_label": record.get_status_display(),
                            "marked_at": record.marked_at,
                        }
                        for record in attendance_records
                    ],
                    "recordings": [
                        {
                            "id": recording.id,
                            "title": recording.title,
                            "course_id": str(recording.course_id),
                            "course_title": recording.course.title,
                            "video_provider": recording.video_provider,
                            "is_unlisted": recording.is_unlisted,
                            "uploaded_at": recording.uploaded_at,
                        }
                        for recording in recordings
                    ],
                }
            }
        )
