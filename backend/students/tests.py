from datetime import timedelta
from decimal import Decimal

from assignments.models import Assignment
from attendance.models import AttendanceSession, StudentAttendance
from certificates.models import Certificate, StudentCertificate
from classrecordings.models import ClassRecording
from courses.models import Course
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from django.utils import timezone
from enrollments.models import Enrollment, PaymentMethod
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class StudentDashboardApiTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="SecurePass123",
            first_name="Asha",
            last_name="Sharma",
            role="student",
            is_phone_verified=True,
        )
        self.mentor = User.objects.create_user(
            username="mentor@example.com",
            email="mentor@example.com",
            password="SecurePass123",
            first_name="Mentor",
            last_name="One",
            role="mentor",
        )

        today = timezone.localdate()
        self.course = Course.objects.create(
            mentor=self.mentor,
            title="Product Design Cohort",
            short_description="A live design cohort",
            description="Deep practical cohort",
            actual_price=Decimal("1200.00"),
            discounted_price=Decimal("999.00"),
            is_discount_active=True,
            start_date=today,
            live_days="Mon, Wed, Fri",
            live_time="7 PM - 9 PM",
            total_hours=32,
            total_seats=40,
            enrolled_students=1,
            is_live=True,
            is_published=True,
        )
        self.pending_course = Course.objects.create(
            mentor=self.mentor,
            title="Advanced Systems",
            short_description="Pending access course",
            description="Pending enrollment course",
            actual_price=Decimal("1800.00"),
            discounted_price=Decimal("1500.00"),
            is_discount_active=True,
            start_date=today + timedelta(days=7),
            live_days="Sat",
            live_time="10 AM - 1 PM",
            total_hours=20,
            total_seats=30,
            enrolled_students=0,
            is_live=True,
            is_published=True,
        )

        Enrollment.objects.create(
            first_name="Asha",
            last_name="Sharma",
            email=self.student.email,
            whatsapp_number="+9779800000000",
            course=self.course,
            status="verified",
        )
        Enrollment.objects.create(
            first_name="Asha",
            last_name="Sharma",
            email=self.student.email,
            whatsapp_number="+9779800000000",
            course=self.pending_course,
            status="pending",
        )

        self.assignment = Assignment.objects.create(
            course=self.course,
            title="Landing Page Redesign",
            description="Design a conversion-focused landing page.",
            due_date=timezone.now() + timedelta(days=2),
        )
        self.session = AttendanceSession.objects.create(
            course=self.course,
            title="Weekly Studio Critique",
            date=today + timedelta(days=1),
        )
        StudentAttendance.objects.create(
            session=self.session,
            student=self.student,
            status="present",
        )
        ClassRecording.objects.create(
            course=self.course,
            title="Cohort Session 01",
            video_url="https://example.com/recording-1",
            uploaded_by=self.mentor,
        )
        certificate = Certificate.objects.create(
            course=self.course,
            title="Design Cohort Completion",
            description="Issued on completion",
            is_published=True,
        )
        StudentCertificate.objects.create(
            certificate=certificate,
            student=self.student,
            status="issued",
            download_link="https://example.com/certificate.pdf",
        )

    def test_dashboard_returns_student_learning_data(self):
        self.client.force_authenticate(self.student)

        response = self.client.get(reverse("student_dashboard"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data["data"]
        self.assertEqual(payload["overview"]["active_courses"], 1)
        self.assertEqual(payload["overview"]["pending_enrollments"], 1)
        self.assertEqual(payload["overview"]["upcoming_assignments"], 1)
        self.assertEqual(payload["overview"]["certificates_earned"], 1)
        self.assertEqual(len(payload["courses"]), 1)
        self.assertEqual(payload["courses"][0]["title"], "Product Design Cohort")
        self.assertEqual(payload["spotlight"]["next_assignment"]["title"], "Landing Page Redesign")
        self.assertEqual(payload["spotlight"]["next_session"]["title"], "Weekly Studio Critique")
        self.assertEqual(len(payload["recent_recordings"]), 1)
        self.assertEqual(len(payload["certificates"]), 1)

    def test_assignments_endpoint_returns_assignment_summary(self):
        self.client.force_authenticate(self.student)

        response = self.client.get(reverse("student_assignments"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data["data"]
        self.assertEqual(payload["summary"]["total"], 1)
        self.assertEqual(payload["summary"]["pending"], 1)
        self.assertEqual(payload["assignments"][0]["title"], "Landing Page Redesign")
        self.assertEqual(payload["assignments"][0]["course_slug"], self.course.slug)

    def test_profile_endpoint_updates_student_workspace_profile(self):
        self.client.force_authenticate(self.student)

        response = self.client.patch(
            reverse("student_workspace_profile"),
            {
                "first_name": "Aarav",
                "last_name": "Sharma",
                "phone_number": "+9779811111111",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.first_name, "Aarav")
        self.assertEqual(self.student.phone_number, "+9779811111111")
        self.assertFalse(self.student.is_phone_verified)

    def test_join_course_endpoint_returns_available_and_existing_statuses(self):
        self.client.force_authenticate(self.student)

        response = self.client.get(reverse("student_join_course"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.data["data"]
        self.assertEqual(payload["summary"]["active_courses"], 1)
        self.assertEqual(payload["summary"]["pending_requests"], 1)
        self.assertEqual(payload["profile"]["email"], self.student.email)

        status_by_slug = {item["slug"]: item["enrollment_status"] for item in payload["courses"]}
        self.assertEqual(status_by_slug[self.course.slug], "verified")
        self.assertEqual(status_by_slug[self.pending_course.slug], "pending")

    def test_join_course_endpoint_creates_pending_enrollment(self):
        self.client.force_authenticate(self.student)
        image_bytes = (
            b"\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00"
            b"\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00"
            b"\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02"
            b"\x44\x01\x00\x3b"
        )

        new_course = Course.objects.create(
            mentor=self.mentor,
            title="Visual Systems",
            short_description="Systems thinking for designers",
            description="A published course ready for enrollment",
            actual_price=Decimal("1400.00"),
            discounted_price=Decimal("1100.00"),
            is_discount_active=True,
            start_date=timezone.localdate() + timedelta(days=14),
            live_days="Tue, Thu",
            live_time="6 PM - 8 PM",
            total_hours=24,
            total_seats=35,
            enrolled_students=0,
            is_live=True,
            is_published=True,
        )
        payment_method = PaymentMethod.objects.create(
            name="eSewa",
            account_label="Design School",
            qr_code=SimpleUploadedFile("qr.gif", image_bytes, content_type="image/gif"),
        )

        response = self.client.post(
            reverse("student_join_course"),
            {
                "course": str(new_course.id),
                "whatsapp_number": "+9779822222222",
                "payment_method": payment_method.id,
                "payment_screenshot": SimpleUploadedFile(
                    "paid.gif", image_bytes, content_type="image/gif"
                ),
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.student.refresh_from_db()
        self.assertEqual(self.student.phone_number, "+9779822222222")
        self.assertFalse(self.student.is_phone_verified)
        self.assertTrue(
            Enrollment.objects.filter(
                email__iexact=self.student.email,
                course=new_course,
                payment_method=payment_method,
                status="pending",
            ).exists()
        )
