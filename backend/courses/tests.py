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
    DailyStreak,
    Lesson,
    LessonContentBlock,
    LessonProgress,
    Option,
    Question,
    Quiz,
    QuizAttempt,
    CourseProgress,
    XPTransaction,
    Requirement,
    WhatYouWillLearn,
)
from .services.progress_service import mark_lesson_completed


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

    def test_public_course_list_filters_by_query_and_category(self):
        design_category = Category.objects.create(name='Design')
        design_course = self.create_course(title='UX Research Sprint', category=design_category)
        self.create_course(title='Backend APIs')

        response = self.client.get(
            reverse('public_courses_list'),
            {'q': 'research', 'category': design_category.slug},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()['data']['courses']
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]['title'], design_course.title)
        self.assertEqual(payload[0]['category']['slug'], design_category.slug)

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

    def test_public_course_detail_includes_lesson_level_curriculum(self):
        course = self.create_course(title='Interaction Design')
        module = CourseModule.objects.create(course=course, title='Foundations', sort_order=0)
        lesson = Lesson.objects.create(
            module=module,
            title='Visual Hierarchy',
            summary='Learn how to guide attention.',
            lesson_type='interactive',
            estimated_minutes=12,
            xp_reward=20,
            sort_order=0,
        )
        LessonContentBlock.objects.create(
            lesson=lesson,
            block_type='task',
            title='Audit a screen',
            body='Find the primary action and explain why it works.',
        )

        response = self.client.get(reverse('public_courses_detail', args=[course.slug]))

        self.assertEqual(response.status_code, 200)
        module_payload = response.json()['data']['course']['curriculum'][0]
        self.assertEqual(module_payload['lessons'][0]['title'], 'Visual Hierarchy')
        self.assertEqual(module_payload['lessons'][0]['type'], 'interactive')
        self.assertEqual(module_payload['lessons'][0]['xpReward'], 20)
        self.assertEqual(module_payload['lessons'][0]['blocks'][0]['type'], 'task')

    def test_mark_lesson_completed_awards_xp_and_updates_course_progress(self):
        student = User.objects.create_user(
            username='student1',
            email='student@example.com',
            password='Testpass123!',
            role='student',
        )
        course = self.create_course(title='Gamified UX')
        module = CourseModule.objects.create(course=course, title='Core', sort_order=0)
        lesson = Lesson.objects.create(module=module, title='Complete Me', xp_reward=30)

        course_progress = mark_lesson_completed(student, lesson)

        self.assertEqual(course_progress.progress_percent, 100)
        self.assertEqual(course_progress.completed_lessons, 1)
        self.assertEqual(course_progress.total_lessons, 1)
        self.assertTrue(LessonProgress.objects.filter(user=student, lesson=lesson, status='completed').exists())
        self.assertTrue(CourseProgress.objects.filter(user=student, course=course, xp_earned=30).exists())
        self.assertTrue(
            XPTransaction.objects.filter(
                user=student,
                course=course,
                lesson=lesson,
                amount=30,
                source='lesson_completed',
            ).exists()
        )

    def test_lesson_complete_api_persists_progress_and_xp(self):
        student = User.objects.create_user(
            username='student2',
            email='student2@example.com',
            password='Testpass123!',
            role='student',
        )
        course = self.create_course(title='Progress API UX')
        module = CourseModule.objects.create(course=course, title='Core', sort_order=0)
        lesson = Lesson.objects.create(module=module, title='API Complete Me', xp_reward=40)
        self.client.force_authenticate(student)

        response = self.client.post(reverse('lesson_complete', args=[lesson.id]))

        self.assertEqual(response.status_code, 200)
        payload = response.json()['data']
        self.assertEqual(payload['progress']['progressPercent'], 100)
        self.assertEqual(payload['progress']['xpEarned'], 40)
        self.assertEqual(payload['lessons'][0]['id'], lesson.id)
        self.assertEqual(payload['lessons'][0]['status'], 'completed')
        self.assertTrue(
            XPTransaction.objects.filter(
                user=student,
                lesson=lesson,
                amount=40,
                source='lesson_completed',
            ).exists()
        )

    def test_quiz_attempt_api_grades_answers_and_awards_xp_once(self):
        student = User.objects.create_user(
            username='quizstudent',
            email='quizstudent@example.com',
            password='Testpass123!',
            role='student',
        )
        course = self.create_course(title='Quiz Driven UX')
        module = CourseModule.objects.create(course=course, title='Core', sort_order=0)
        lesson = Lesson.objects.create(module=module, title='Quiz Lesson', xp_reward=15)
        quiz = Quiz.objects.create(lesson=lesson, title='Hierarchy Check', passing_score=70, xp_reward=25)
        question = Question.objects.create(quiz=quiz, prompt='What creates stronger hierarchy?')
        correct_option = Option.objects.create(question=question, text='Clear contrast', is_correct=True)
        Option.objects.create(question=question, text='Random spacing', is_correct=False)
        self.client.force_authenticate(student)

        response = self.client.post(
            reverse('quiz_attempt_submit', args=[quiz.id]),
            {'answers': {str(question.id): [correct_option.id]}},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()['data']
        self.assertTrue(payload['attempt']['passed'])
        self.assertEqual(payload['attempt']['score'], 100)
        self.assertEqual(payload['attempt']['xpAwarded'], 25)
        self.assertEqual(payload['progress']['progress']['progressPercent'], 100)
        self.assertTrue(QuizAttempt.objects.filter(user=student, quiz=quiz, passed=True, score=100).exists())
        self.assertTrue(LessonProgress.objects.filter(user=student, lesson=lesson, status='completed').exists())
        self.assertTrue(DailyStreak.objects.filter(user=student, current_count=1).exists())
        self.assertTrue(
            XPTransaction.objects.filter(
                user=student,
                lesson=lesson,
                amount=25,
                source='quiz_passed',
            ).exists()
        )

        second_response = self.client.post(
            reverse('quiz_attempt_submit', args=[quiz.id]),
            {'answers': {str(question.id): [correct_option.id]}},
            format='json',
        )

        self.assertEqual(second_response.status_code, 201)
        self.assertEqual(second_response.json()['data']['attempt']['xpAwarded'], 0)
        self.assertEqual(XPTransaction.objects.filter(user=student, lesson=lesson, source='quiz_passed').count(), 1)

    def test_quiz_attempt_api_records_failed_attempt_without_xp(self):
        student = User.objects.create_user(
            username='quizfail',
            email='quizfail@example.com',
            password='Testpass123!',
            role='student',
        )
        course = self.create_course(title='Quiz Failure UX')
        module = CourseModule.objects.create(course=course, title='Core', sort_order=0)
        lesson = Lesson.objects.create(module=module, title='Quiz Lesson', xp_reward=15)
        quiz = Quiz.objects.create(lesson=lesson, title='Hierarchy Check', passing_score=70, xp_reward=25)
        question = Question.objects.create(quiz=quiz, prompt='What creates stronger hierarchy?')
        Option.objects.create(question=question, text='Clear contrast', is_correct=True)
        wrong_option = Option.objects.create(question=question, text='Random spacing', is_correct=False)
        self.client.force_authenticate(student)

        response = self.client.post(
            reverse('quiz_attempt_submit', args=[quiz.id]),
            {'answers': {str(question.id): [wrong_option.id]}},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()['data']
        self.assertFalse(payload['attempt']['passed'])
        self.assertEqual(payload['attempt']['score'], 0)
        self.assertEqual(payload['attempt']['xpAwarded'], 0)
        self.assertFalse(XPTransaction.objects.filter(user=student, lesson=lesson, source='quiz_passed').exists())

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
