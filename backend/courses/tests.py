from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from mentors.models import MentorProfile

from .models import (
    Category,
    Course,
    CourseModule,
    CourseModulePoint,
    CourseTag,
    CourseTechnologyCategory,
    CourseTechnologyItem,
    Requirement,
    WhatYouWillLearn,
)


User = get_user_model()


class PublicCourseApiTests(APITestCase):
    def setUp(self):
        self.mentor = User.objects.create_user(
            username='mentor1',
            email='mentor@example.com',
            password='Testpass123!',
            role='mentor',
            first_name='Design',
            last_name='Mentor',
        )
        self.category = Category.objects.create(name='Development')

    def create_course(self, **overrides):
        defaults = {
            'mentor': self.mentor,
            'category': self.category,
            'title': 'Course Title',
            'short_description': 'Short summary',
            'description': 'Longer description',
            'actual_price': Decimal('5000.00'),
            'discounted_price': Decimal('3500.00'),
            'is_discount_active': True,
            'start_date': '2026-05-01',
            'live_days': 'Sun, Tue, Thu',
            'live_time': '7-9 PM',
            'total_hours': 48,
            'language': 'en',
            'level': 'beginner',
            'is_live': True,
            'is_published': True,
            'duration_weeks': 8,
        }
        defaults.update(overrides)
        return Course.objects.create(**defaults)

    def test_public_course_list_includes_featured_course_data(self):
        regular = self.create_course(title='Regular Track')
        featured = self.create_course(
            title='Featured Track',
            is_featured=True,
            featured_order=1,
            featured_theme='dark',
            featured_layout='media-right',
            featured_eyebrow='Flagship Cohort',
            support_value='Live',
            support_label='Review Sessions',
        )
        CourseTag.objects.create(course=featured, text='React', sort_order=0)

        response = self.client.get(reverse('public_courses_list'))

        self.assertEqual(response.status_code, 200)
        payload = response.json()['data']['courses']
        self.assertEqual(payload[0]['title'], featured.title)
        self.assertTrue(payload[0]['isFeatured'])
        self.assertEqual(payload[0]['featuredCard']['theme'], 'dark')
        self.assertEqual(payload[0]['featuredCard']['layout'], 'media-right')
        self.assertEqual(payload[0]['featuredCard']['eyebrow'], 'Flagship Cohort')
        self.assertEqual(payload[0]['tags'], ['React'])
        self.assertEqual(payload[1]['title'], regular.title)

    def test_public_course_detail_keeps_requirements_separate_from_curriculum(self):
        course = self.create_course(title='Structured Course')
        Requirement.objects.create(course=course, text='Laptop')
        Requirement.objects.create(course=course, text='Internet')
        WhatYouWillLearn.objects.create(course=course, text='Build responsive interfaces')
        WhatYouWillLearn.objects.create(course=course, text='Ship production-ready workflows')

        response = self.client.get(reverse('public_courses_detail', args=[course.slug]))

        self.assertEqual(response.status_code, 200)
        payload = response.json()['data']['course']
        self.assertEqual(payload['requirements'], ['Laptop', 'Internet'])
        self.assertEqual(payload['curriculum'][0]['title'], 'Core Learning Outcomes')
        self.assertEqual(
            payload['curriculum'][0]['content'],
            ['Build responsive interfaces', 'Ship production-ready workflows'],
        )
        self.assertNotIn('Laptop', payload['curriculum'][0]['content'])

    def test_public_course_detail_returns_real_module_and_technology_data(self):
        course = self.create_course(title='MERN Stack Development')
        module = CourseModule.objects.create(
            course=course,
            title='Module 1',
            description='Foundations',
            sort_order=0,
        )
        CourseModulePoint.objects.create(module=module, text='Intro to React', sort_order=0)
        CourseModulePoint.objects.create(module=module, text='Routing basics', sort_order=1)
        category = CourseTechnologyCategory.objects.create(course=course, name='Frontend', sort_order=0)
        CourseTechnologyItem.objects.create(category=category, name='React', sort_order=0)
        CourseTechnologyItem.objects.create(category=category, name='JavaScript', sort_order=1)

        response = self.client.get(reverse('public_courses_detail', args=[course.slug]))

        self.assertEqual(response.status_code, 200)
        payload = response.json()['data']['course']
        self.assertEqual(payload['curriculum'][0]['title'], 'Module 1')
        self.assertEqual(payload['curriculum'][0]['content'], ['Intro to React', 'Routing basics'])
        self.assertEqual(payload['technologySections'][0]['name'], 'Frontend')
        self.assertEqual(
            [item['name'] for item in payload['technologySections'][0]['items']],
            ['React', 'JavaScript'],
        )

    def test_public_course_detail_includes_platform_mentors_with_associated_mentor(self):
        course = self.create_course(title='UI UX Design')

        MentorProfile.objects.update_or_create(
            user=self.mentor,
            defaults={
                'expertise': 'Lead UI/UX Mentor',
                'current_company': 'Eduflow Studio',
                'experience': 7,
            },
        )

        another_mentor = User.objects.create_user(
            username='mentor2',
            email='mentor2@example.com',
            password='Testpass123!',
            role='mentor',
            first_name='Product',
            last_name='Coach',
        )
        MentorProfile.objects.update_or_create(
            user=another_mentor,
            defaults={
                'expertise': 'Product Design Coach',
                'current_company': 'PixelCraft',
                'experience': 5,
            },
        )

        response = self.client.get(reverse('public_courses_detail', args=[course.slug]))

        self.assertEqual(response.status_code, 200)
        payload = response.json()['data']['course']
        self.assertEqual(len(payload['platformMentors']), 2)
        associated_mentor = next((mentor for mentor in payload['platformMentors'] if mentor['associated']), None)
        self.assertIsNotNone(associated_mentor)
        self.assertEqual(associated_mentor['id'], str(self.mentor.id))
        self.assertEqual(associated_mentor['role'], 'Lead UI/UX Mentor')
