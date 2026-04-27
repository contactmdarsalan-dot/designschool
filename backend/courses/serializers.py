import json

from django.db import transaction
from rest_framework import serializers

from .models import (
    Badge,
    Category,
    Course,
    CourseBuilderItem,
    CourseCertificatePoint,
    CourseComparisonPoint,
    CourseFAQ,
    CourseMentorSpotlight,
    CourseModule,
    CourseModulePoint,
    CourseProgress,
    CourseReview,
    CourseTag,
    CourseTechnologyCategory,
    CourseTechnologyItem,
    DailyStreak,
    LearningEvent,
    LearningPath,
    LearningPathCourse,
    Lesson,
    LessonContentBlock,
    LessonProgress,
    Option,
    Question,
    Quiz,
    QuizAttempt,
    Requirement,
    Skill,
    UserBadge,
    UserLearningPathProgress,
    UserSkillProgress,
    WhatYouWillLearn,
    WhoIsFor,
    XPTransaction,
)


class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    icon_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id',
            'name',
            'slug',
            'short_description',
            'image',
            'image_url',
            'icon',
            'icon_url',
            'badge',
            'icon_name',
            'show_on_home',
            'sort_order',
        )
        read_only_fields = ('id', 'slug')

    def get_image_url(self, obj):
        return self.build_file_url(obj.image)

    def get_icon_url(self, obj):
        return self.build_file_url(obj.icon)

    def build_file_url(self, file_field):
        if not file_field:
            return ''
        try:
            url = file_field.url
        except ValueError:
            return ''
        request = self.context.get('request')
        return request.build_absolute_uri(url) if request else url


class WhatYouWillLearnSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatYouWillLearn
        fields = ('id', 'text')


class RequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirement
        fields = ('id', 'text')


class WhoIsForSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhoIsFor
        fields = ('id', 'text')


class CourseTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTag
        fields = ('id', 'text', 'sort_order')


class CourseFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseFAQ
        fields = ('id', 'question', 'answer', 'sort_order')


class CourseModulePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModulePoint
        fields = ('id', 'text', 'sort_order')


class LessonContentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonContentBlock
        fields = ('id', 'block_type', 'title', 'body', 'media_url', 'metadata', 'sort_order')


class LessonSerializer(serializers.ModelSerializer):
    content_blocks = LessonContentBlockSerializer(many=True, required=False)

    class Meta:
        model = Lesson
        fields = (
            'id',
            'title',
            'slug',
            'summary',
            'lesson_type',
            'estimated_minutes',
            'xp_reward',
            'is_preview',
            'is_published',
            'sort_order',
            'content_blocks',
        )
        read_only_fields = ('id', 'slug')


class CourseModuleSerializer(serializers.ModelSerializer):
    points = CourseModulePointSerializer(many=True, required=False)
    lessons = LessonSerializer(many=True, required=False)

    class Meta:
        model = CourseModule
        fields = ('id', 'title', 'description', 'sort_order', 'points', 'lessons')


class CourseComparisonPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseComparisonPoint
        fields = ('id', 'side', 'text', 'sort_order')


class CourseTechnologyItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTechnologyItem
        fields = ('id', 'name', 'icon_url', 'sort_order')


class CourseTechnologyCategorySerializer(serializers.ModelSerializer):
    items = CourseTechnologyItemSerializer(many=True, required=False)

    class Meta:
        model = CourseTechnologyCategory
        fields = ('id', 'name', 'sort_order', 'items')


class CourseBuilderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseBuilderItem
        fields = ('id', 'title', 'icon_name', 'sort_order')


class CourseCertificatePointSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCertificatePoint
        fields = ('id', 'text', 'sort_order')


class CourseMentorSpotlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseMentorSpotlight
        fields = ('id', 'name', 'role', 'photo_url', 'sort_order')


class CourseReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)

    class Meta:
        model = CourseReview
        fields = ('id', 'course', 'student', 'student_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'student', 'student_name', 'created_at')


class CourseModuleAdminSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = CourseModule
        fields = ('id', 'course', 'course_title', 'title', 'description', 'sort_order')


class LessonAdminSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    course_title = serializers.CharField(source='module.course.title', read_only=True)

    class Meta:
        model = Lesson
        fields = (
            'id',
            'module',
            'module_title',
            'course_title',
            'title',
            'slug',
            'summary',
            'lesson_type',
            'estimated_minutes',
            'xp_reward',
            'is_preview',
            'is_published',
            'sort_order',
        )
        read_only_fields = ('id', 'slug', 'module_title', 'course_title')


class LessonContentBlockAdminSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    module_title = serializers.CharField(source='lesson.module.title', read_only=True)

    class Meta:
        model = LessonContentBlock
        fields = (
            'id',
            'lesson',
            'lesson_title',
            'module_title',
            'block_type',
            'title',
            'body',
            'media_url',
            'sort_order',
        )


class QuizAdminSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='lesson.module.course.title', read_only=True)

    class Meta:
        model = Quiz
        fields = (
            'id',
            'lesson',
            'lesson_title',
            'course_title',
            'title',
            'passing_score',
            'xp_reward',
            'max_attempts',
            'is_published',
        )


class QuestionAdminSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'quiz', 'quiz_title', 'prompt', 'question_type', 'explanation', 'sort_order')


class OptionAdminSerializer(serializers.ModelSerializer):
    question_prompt = serializers.CharField(source='question.prompt', read_only=True)

    class Meta:
        model = Option
        fields = ('id', 'question', 'question_prompt', 'text', 'is_correct', 'sort_order')


class QuizAttemptAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = (
            'id',
            'user',
            'user_email',
            'quiz',
            'quiz_title',
            'score',
            'passed',
            'xp_awarded',
            'started_at',
            'completed_at',
        )


class LessonProgressAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='lesson.module.course.title', read_only=True)

    class Meta:
        model = LessonProgress
        fields = (
            'id',
            'user',
            'user_email',
            'lesson',
            'lesson_title',
            'course_title',
            'status',
            'progress_percent',
            'started_at',
            'completed_at',
            'last_seen_at',
        )
        read_only_fields = ('last_seen_at',)


class CourseProgressAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = CourseProgress
        fields = (
            'id',
            'user',
            'user_email',
            'course',
            'course_title',
            'completed_lessons',
            'total_lessons',
            'progress_percent',
            'xp_earned',
            'started_at',
            'completed_at',
            'updated_at',
        )
        read_only_fields = ('updated_at',)


class XPTransactionAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = XPTransaction
        fields = (
            'id',
            'user',
            'user_email',
            'course',
            'course_title',
            'lesson',
            'lesson_title',
            'amount',
            'source',
            'description',
            'created_at',
        )
        read_only_fields = ('created_at',)


class BadgeAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ('id', 'name', 'slug', 'description', 'icon_name', 'xp_threshold', 'is_active')
        read_only_fields = ('id', 'slug')


class UserBadgeAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    badge_name = serializers.CharField(source='badge.name', read_only=True)

    class Meta:
        model = UserBadge
        fields = ('id', 'user', 'user_email', 'badge', 'badge_name', 'awarded_at')
        read_only_fields = ('awarded_at',)


class DailyStreakAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = DailyStreak
        fields = ('id', 'user', 'user_email', 'current_count', 'longest_count', 'last_activity_date', 'updated_at')
        read_only_fields = ('updated_at',)


class SkillAdminSerializer(serializers.ModelSerializer):
    course_titles = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = ('id', 'name', 'slug', 'description', 'courses', 'course_titles')
        read_only_fields = ('id', 'slug', 'course_titles')

    def get_course_titles(self, obj):
        return ', '.join(obj.courses.values_list('title', flat=True))


class UserSkillProgressAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = UserSkillProgress
        fields = ('id', 'user', 'user_email', 'skill', 'skill_name', 'level', 'xp', 'updated_at')
        read_only_fields = ('updated_at',)


class LearningPathAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningPath
        fields = ('id', 'title', 'slug', 'description', 'is_published', 'created_at')
        read_only_fields = ('id', 'slug', 'created_at')


class LearningPathCourseAdminSerializer(serializers.ModelSerializer):
    path_title = serializers.CharField(source='learning_path.title', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = LearningPathCourse
        fields = ('id', 'learning_path', 'path_title', 'course', 'course_title', 'sort_order', 'required')


class UserLearningPathProgressAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    path_title = serializers.CharField(source='learning_path.title', read_only=True)

    class Meta:
        model = UserLearningPathProgress
        fields = (
            'id',
            'user',
            'user_email',
            'learning_path',
            'path_title',
            'completed_courses',
            'total_courses',
            'progress_percent',
            'started_at',
            'completed_at',
            'updated_at',
        )
        read_only_fields = ('updated_at',)


class LearningEventAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = LearningEvent
        fields = (
            'id',
            'user',
            'user_email',
            'course',
            'course_title',
            'lesson',
            'lesson_title',
            'event_type',
            'created_at',
        )
        read_only_fields = ('created_at',)


class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    mentor_name = serializers.CharField(source='mentor.get_full_name', read_only=True)
    mentor_photo = serializers.ImageField(source='mentor.mentor_profile.photo', read_only=True)
    learning_points = WhatYouWillLearnSerializer(many=True, required=False)
    requirements = RequirementSerializer(many=True, required=False)
    target_audience = WhoIsForSerializer(many=True, required=False)
    tags = CourseTagSerializer(many=True, required=False)
    faqs = CourseFAQSerializer(many=True, required=False)
    modules = CourseModuleSerializer(many=True, required=False)
    comparison_points = CourseComparisonPointSerializer(many=True, required=False)
    technology_categories = CourseTechnologyCategorySerializer(many=True, required=False)
    builder_items = CourseBuilderItemSerializer(many=True, required=False)
    certificate_points = CourseCertificatePointSerializer(many=True, required=False)
    mentor_spotlights = CourseMentorSpotlightSerializer(many=True, required=False)
    reviews = CourseReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'

    nested_json_fields = (
        'learning_points',
        'requirements',
        'target_audience',
        'tags',
        'faqs',
        'modules',
        'comparison_points',
        'technology_categories',
        'builder_items',
        'certificate_points',
        'mentor_spotlights',
    )

    def to_internal_value(self, data):
        mutable = data.copy() if hasattr(data, 'copy') else dict(data)
        for field in self.nested_json_fields:
            raw_value = mutable.get(field, serializers.empty)
            if raw_value is serializers.empty or raw_value in (None, ''):
                continue
            if isinstance(raw_value, str):
                try:
                    mutable[field] = json.loads(raw_value)
                except json.JSONDecodeError as exc:
                    raise serializers.ValidationError({field: 'Invalid JSON payload.'}) from exc
        return super().to_internal_value(mutable)

    def _replace_text_items(self, course, relation_name, model, items):
        getattr(course, relation_name).all().delete()
        for item in items or []:
            model.objects.create(course=course, **item)

    def _replace_sorted_items(self, course, relation_name, model, items):
        getattr(course, relation_name).all().delete()
        for index, item in enumerate(items or []):
            payload = dict(item)
            payload['sort_order'] = payload.get('sort_order', index)
            model.objects.create(course=course, **payload)

    def _replace_modules(self, course, modules):
        course.modules.all().delete()
        for module_index, module in enumerate(modules or []):
            points = module.pop('points', [])
            lessons = module.pop('lessons', [])
            module_obj = CourseModule.objects.create(
                course=course,
                title=module['title'],
                description=module.get('description', ''),
                sort_order=module.get('sort_order', module_index),
            )
            for point_index, point in enumerate(points):
                CourseModulePoint.objects.create(
                    module=module_obj,
                    text=point['text'],
                    sort_order=point.get('sort_order', point_index),
                )
            for lesson_index, lesson in enumerate(lessons):
                content_blocks = lesson.pop('content_blocks', [])
                lesson_obj = Lesson.objects.create(
                    module=module_obj,
                    title=lesson['title'],
                    summary=lesson.get('summary', ''),
                    lesson_type=lesson.get('lesson_type', 'article'),
                    estimated_minutes=lesson.get('estimated_minutes', 8),
                    xp_reward=lesson.get('xp_reward', 10),
                    is_preview=lesson.get('is_preview', False),
                    is_published=lesson.get('is_published', True),
                    sort_order=lesson.get('sort_order', lesson_index),
                )
                for block_index, block in enumerate(content_blocks):
                    LessonContentBlock.objects.create(
                        lesson=lesson_obj,
                        block_type=block.get('block_type', 'text'),
                        title=block.get('title', ''),
                        body=block.get('body', ''),
                        media_url=block.get('media_url', ''),
                        metadata=block.get('metadata', {}),
                        sort_order=block.get('sort_order', block_index),
                    )

    def _replace_technology_categories(self, course, categories):
        course.technology_categories.all().delete()
        for category_index, category in enumerate(categories or []):
            items = category.pop('items', [])
            category_obj = CourseTechnologyCategory.objects.create(
                course=course,
                name=category['name'],
                sort_order=category.get('sort_order', category_index),
            )
            for item_index, item in enumerate(items):
                CourseTechnologyItem.objects.create(
                    category=category_obj,
                    name=item['name'],
                    icon_url=item.get('icon_url', ''),
                    sort_order=item.get('sort_order', item_index),
                )

    def _replace_nested_content(self, course, nested_data):
        if nested_data.get('learning_points') is not None:
            self._replace_text_items(course, 'learning_points', WhatYouWillLearn, nested_data['learning_points'])
        if nested_data.get('requirements') is not None:
            self._replace_text_items(course, 'requirements', Requirement, nested_data['requirements'])
        if nested_data.get('target_audience') is not None:
            self._replace_text_items(course, 'target_audience', WhoIsFor, nested_data['target_audience'])
        if nested_data.get('tags') is not None:
            self._replace_sorted_items(course, 'tags', CourseTag, nested_data['tags'])
        if nested_data.get('faqs') is not None:
            self._replace_sorted_items(course, 'faqs', CourseFAQ, nested_data['faqs'])
        if nested_data.get('modules') is not None:
            self._replace_modules(course, nested_data['modules'])
        if nested_data.get('comparison_points') is not None:
            self._replace_sorted_items(course, 'comparison_points', CourseComparisonPoint, nested_data['comparison_points'])
        if nested_data.get('technology_categories') is not None:
            self._replace_technology_categories(course, nested_data['technology_categories'])
        if nested_data.get('builder_items') is not None:
            self._replace_sorted_items(course, 'builder_items', CourseBuilderItem, nested_data['builder_items'])
        if nested_data.get('certificate_points') is not None:
            self._replace_sorted_items(course, 'certificate_points', CourseCertificatePoint, nested_data['certificate_points'])
        if nested_data.get('mentor_spotlights') is not None:
            self._replace_sorted_items(course, 'mentor_spotlights', CourseMentorSpotlight, nested_data['mentor_spotlights'])

    @transaction.atomic
    def create(self, validated_data):
        nested_data = {
            field: validated_data.pop(field, [])
            for field in self.nested_json_fields
        }
        course = Course.objects.create(**validated_data)
        self._replace_nested_content(course, nested_data)
        return course

    @transaction.atomic
    def update(self, instance, validated_data):
        nested_data = {
            field: validated_data.pop(field, None)
            for field in self.nested_json_fields
        }

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        if any(value is not None for value in nested_data.values()):
            self._replace_nested_content(instance, nested_data)

        return instance
