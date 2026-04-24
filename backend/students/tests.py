from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from assignments.models import Assignment
from attendance.models import AttendanceSession, StudentAttendance
from certificates.models import Certificate, StudentCertificate
from classrecordings.models import ClassRecording
from courses.models import Course
from enrollments.models import Enrollment

User = get_user_model()


class StudentDashboardApiTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username='student@example.com',
            email='student@example.com',
            password='SecurePass123',
            first_name='Asha',
            last_name='Sharma',
            role='student',
            is_phone_verified=True,
        )
        self.mentor = User.objects.create_user(
            username='mentor@example.com',
            email='mentor@example.com',
            password='SecurePass123',
            first_name='Mentor',
            last_name='One',
            role='mentor',
        )

        today = timezone.localdate()
        self.course = Course.objects.create(
            mentor=self.mentor,
            title='Product Design Cohort',
            short_description='A live design cohort',
            description='Deep practical cohort',
            actual_price=Decimal('1200.00'),
            discounted_price=Decimal('999.00'),
            is_discount_active=True,
            start_date=today,
            live_days='Mon, Wed, Fri',
            live_time='7 PM - 9 PM',
            total_hours=32,
            total_seats=40,
            enrolled_students=1,
            is_live=True,
            is_published=True,
        )
        self.pending_course = Course.objects.create(
            mentor=self.mentor,
            title='Advanced Systems',
            short_description='Pending access course',
            description='Pending enrollment course',
            actual_price=Decimal('1800.00'),
            discounted_price=Decimal('1500.00'),
            is_discount_active=True,
            start_date=today + timedelta(days=7),
            live_days='Sat',
            live_time='10 AM - 1 PM',
            total_hours=20,
            total_seats=30,
            enrolled_students=0,
            is_live=True,
            is_published=True,
        )

        Enrollment.objects.create(
            first_name='Asha',
            last_name='Sharma',
            email=self.student.email,
            whatsapp_number='+9779800000000',
            course=self.course,
            status='verified',
        )
        Enrollment.objects.create(
            first_name='Asha',
            last_name='Sharma',
            email=self.student.email,
            whatsapp_number='+9779800000000',
            course=self.pending_course,
            status='pending',
        )

        self.assignment = Assignment.objects.create(
            course=self.course,
            title='Landing Page Redesign',
            description='Design a conversion-focused landing page.',
            due_date=timezone.now() + timedelta(days=2),
        )
        self.session = AttendanceSession.objects.create(
            course=self.course,
            title='Weekly Studio Critique',
            date=today + timedelta(days=1),
        )
        StudentAttendance.objects.create(
            session=self.session,
            student=self.student,
            status='present',
        )
        ClassRecording.objects.create(
            course=self.course,
            title='Cohort Session 01',
            video_url='https://example.com/recording-1',
            uploaded_by=self.mentor,
        )
        certificate = Certificate.objects.create(
            course=self.course,
            title='Design Cohort Completion',
            description='Issued on completion',
            is_published=True,
        )
        StudentCertificate.objects.create(
            certificate=certificate,
            student=self.student,
            status='issued',
            download_link='https://example.com/certificate.pdf',
        )

    def test_dashboard_returns_student_learning_data(self):
        self.client.force_authenticate(self.student)

        response = self.client.get(reverse('student_dashboard'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data['data']
        self.assertEqual(payload['overview']['active_courses'], 1)
        self.assertEqual(payload['overview']['pending_enrollments'], 1)
        self.assertEqual(payload['overview']['upcoming_assignments'], 1)
        self.assertEqual(payload['overview']['certificates_earned'], 1)
        self.assertEqual(len(payload['courses']), 1)
        self.assertEqual(payload['courses'][0]['title'], 'Product Design Cohort')
        self.assertEqual(payload['spotlight']['next_assignment']['title'], 'Landing Page Redesign')
        self.assertEqual(payload['spotlight']['next_session']['title'], 'Weekly Studio Critique')
        self.assertEqual(len(payload['recent_recordings']), 1)
        self.assertEqual(len(payload['certificates']), 1)
