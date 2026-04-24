from collections import defaultdict
from datetime import time

from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from assignments.models import Assignment, StudentAssignment
from attendance.models import AttendanceSession, StudentAttendance
from certificates.models import StudentCertificate
from classrecordings.models import ClassRecording
from courses.models import CourseReview
from enrollments.models import Enrollment
from .models import StudentProfile
from .serializers import StudentProfileSerializer


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer

    def get_queryset(self):
        queryset = StudentProfile.objects.select_related('user')
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(user=self.request.user)

    def get_permissions(self):
        if self.action in ('list', 'retrieve', 'update', 'partial_update'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_update(self, serializer):
        if not self.request.user.is_staff and serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied('You can only update your own profile.')
        serializer.save()


class StudentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        now = timezone.now()

        profile = getattr(user, 'student_profile', None)
        active_enrollment_rows = (
            Enrollment.objects.filter(email__iexact=user.email, status='verified')
            .select_related('course', 'course__mentor')
            .order_by('-created_at')
        )
        pending_enrollment_rows = (
            Enrollment.objects.filter(email__iexact=user.email, status='pending')
            .select_related('course', 'course__mentor')
            .order_by('-created_at')
        )

        active_enrollments = []
        seen_course_ids = set()
        for enrollment in active_enrollment_rows:
            if enrollment.course_id in seen_course_ids:
                continue
            active_enrollments.append(enrollment)
            seen_course_ids.add(enrollment.course_id)

        course_ids = [enrollment.course_id for enrollment in active_enrollments]
        assignment_ids = list(
            Assignment.objects.filter(course_id__in=course_ids).values_list('id', flat=True)
        )

        assignments = list(
            Assignment.objects.select_related('course')
            .filter(id__in=assignment_ids)
            .order_by('due_date', 'title')
        )
        submissions = {
            submission.assignment_id: submission
            for submission in StudentAssignment.objects.select_related('assignment')
            .filter(student=user, assignment_id__in=assignment_ids)
        }
        sessions = list(
            AttendanceSession.objects.select_related('course')
            .filter(course_id__in=course_ids)
            .order_by('date', 'start_time')
        )
        attendance_records = list(
            StudentAttendance.objects.select_related('session', 'session__course')
            .filter(student=user, session__course_id__in=course_ids)
        )
        recordings = list(
            ClassRecording.objects.select_related('course')
            .filter(course_id__in=course_ids)
            .order_by('-uploaded_at')
        )
        certificates = list(
            StudentCertificate.objects.select_related('certificate', 'certificate__course')
            .filter(student=user)
            .order_by('-issued_on')
        )
        reviewed_course_ids = set(
            CourseReview.objects.filter(student=user, course_id__in=course_ids).values_list('course_id', flat=True)
        )

        assignments_by_course = defaultdict(list)
        for assignment in assignments:
            assignments_by_course[assignment.course_id].append(assignment)

        sessions_by_course = defaultdict(list)
        for session in sessions:
            sessions_by_course[session.course_id].append(session)

        attendance_by_course = defaultdict(list)
        for attendance in attendance_records:
            attendance_by_course[attendance.session.course_id].append(attendance)

        recordings_by_course = defaultdict(list)
        for recording in recordings:
            recordings_by_course[recording.course_id].append(recording)

        certificates_by_course = defaultdict(list)
        for certificate in certificates:
            certificates_by_course[certificate.certificate.course_id].append(certificate)

        course_cards = []
        upcoming_assignments = []
        upcoming_sessions = []
        recent_recordings = []
        attendance_present_count = 0
        attendance_total_count = 0

        for enrollment in active_enrollments:
            course = enrollment.course
            course_assignments = assignments_by_course[course.id]
            course_sessions = sessions_by_course[course.id]
            course_attendance = attendance_by_course[course.id]
            course_recordings = recordings_by_course[course.id]
            course_certificates = certificates_by_course[course.id]

            course_submission_count = 0
            pending_assignment_count = 0
            next_assignment_payload = None

            for assignment in course_assignments:
                submission = submissions.get(assignment.id)
                if submission and submission.status in {'submitted', 'graded'}:
                    course_submission_count += 1
                elif assignment.due_date >= now:
                    pending_assignment_count += 1
                    if next_assignment_payload is None:
                        next_assignment_payload = {
                            'id': assignment.id,
                            'title': assignment.title,
                            'due_at': assignment.due_date,
                            'course_title': course.title,
                            'course_slug': course.slug,
                        }
                        upcoming_assignments.append(next_assignment_payload)

            next_session_payload = None
            for session in course_sessions:
                if session.date >= today:
                    next_session_payload = {
                        'id': session.id,
                        'title': session.title or course.title,
                        'date': session.date,
                        'start_time': session.start_time,
                        'end_time': session.end_time,
                        'course_title': course.title,
                        'course_slug': course.slug,
                    }
                    upcoming_sessions.append(next_session_payload)
                    break

            present_count = sum(1 for item in course_attendance if item.status == 'present')
            attendance_count = len(course_attendance)
            attendance_present_count += present_count
            attendance_total_count += attendance_count
            attendance_rate = round((present_count / attendance_count) * 100) if attendance_count else None

            latest_recording = None
            if course_recordings:
                latest = course_recordings[0]
                latest_recording = {
                    'id': latest.id,
                    'title': latest.title,
                    'uploaded_at': latest.uploaded_at,
                    'course_title': course.title,
                    'course_slug': course.slug,
                    'video_url': latest.video_url,
                }
                recent_recordings.append(latest_recording)

            thumbnail_url = ''
            if course.thumbnail:
                thumbnail_url = request.build_absolute_uri(course.thumbnail.url)

            course_cards.append(
                {
                    'id': str(course.id),
                    'slug': course.slug,
                    'title': course.title,
                    'mentor_name': course.mentor.get_full_name() or course.mentor.username,
                    'thumbnail': thumbnail_url,
                    'language': course.get_language_display(),
                    'level': course.get_level_display(),
                    'start_date': course.start_date,
                    'live_days': course.live_days,
                    'live_time': course.live_time,
                    'schedule_label': f'{course.live_days} • {course.live_time}',
                    'attendance_rate': attendance_rate,
                    'attendance_summary': {
                        'present': present_count,
                        'tracked': attendance_count,
                    },
                    'assignment_summary': {
                        'total': len(course_assignments),
                        'submitted': course_submission_count,
                        'pending': pending_assignment_count,
                    },
                    'next_session': next_session_payload,
                    'next_assignment': next_assignment_payload,
                    'latest_recording': latest_recording,
                    'certificate_count': len(course_certificates),
                    'has_reviewed': course.id in reviewed_course_ids,
                    'enrolled_at': enrollment.created_at,
                }
            )

        overall_attendance_rate = (
            round((attendance_present_count / attendance_total_count) * 100)
            if attendance_total_count
            else None
        )

        upcoming_assignments.sort(key=lambda item: item['due_at'])
        upcoming_sessions.sort(key=lambda item: (item['date'], item['start_time'] or time.min))
        recent_recordings = sorted(
            recent_recordings,
            key=lambda item: item['uploaded_at'],
            reverse=True,
        )[:6]

        return Response(
            {
                'data': {
                    'student': {
                        'name': user.get_full_name() or user.username,
                        'email': user.email,
                        'student_id': profile.student_id if profile else '',
                        'phone_number': user.phone_number or (profile.phone_number if profile else ''),
                        'is_phone_verified': user.is_phone_verified,
                        'joined_on': profile.joined_on if profile else user.date_joined,
                    },
                    'overview': {
                        'active_courses': len(active_enrollments),
                        'pending_enrollments': pending_enrollment_rows.count(),
                        'upcoming_assignments': len(upcoming_assignments),
                        'certificates_earned': sum(1 for item in certificates if item.status == 'issued'),
                        'attendance_rate': overall_attendance_rate,
                    },
                    'spotlight': {
                        'next_session': upcoming_sessions[0] if upcoming_sessions else None,
                        'next_assignment': upcoming_assignments[0] if upcoming_assignments else None,
                        'latest_recording': recent_recordings[0] if recent_recordings else None,
                    },
                    'courses': course_cards,
                    'upcoming_assignments': upcoming_assignments[:8],
                    'recent_recordings': recent_recordings,
                    'certificates': [
                        {
                            'id': item.id,
                            'title': item.certificate.title,
                            'course_title': item.certificate.course.title,
                            'status': item.status,
                            'issued_on': item.issued_on,
                            'download_link': item.download_link,
                            'unique_id': item.unique_id,
                        }
                        for item in certificates[:8]
                    ],
                    'pending_enrollments': [
                        {
                            'id': item.id,
                            'course_title': item.course.title,
                            'course_slug': item.course.slug,
                            'status': item.status,
                            'requested_at': item.created_at,
                        }
                        for item in pending_enrollment_rows[:6]
                    ],
                }
            }
        )
