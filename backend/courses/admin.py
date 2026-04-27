from django.contrib import admin

from .models import (
    Category,
    Course,
    CourseAudienceItem,
    CourseBuilderItem,
    CourseCertificatePoint,
    CourseComparisonPoint,
    CourseDetailFact,
    CourseFAQ,
    CourseMentorSpotlight,
    CourseModule,
    CourseModulePoint,
    CourseReview,
    CourseSkillOutcome,
    CourseTag,
    CourseTechnologyCategory,
    CourseTechnologyItem,
    CourseTopic,
    DailyStreak,
    LearningEvent,
    LearningPath,
    LearningPathCourse,
    Lesson,
    LessonContentBlock,
    LessonProgress,
    CourseProgress,
    Quiz,
    Question,
    Option,
    QuizAttempt,
    Requirement,
    Badge,
    Skill,
    UserBadge,
    UserLearningPathProgress,
    UserSkillProgress,
    XPTransaction,
    WhatYouWillLearn,
    WhoIsFor,
)


class WhatYouWillLearnInline(admin.TabularInline):
    model = WhatYouWillLearn
    extra = 1


class RequirementInline(admin.TabularInline):
    model = Requirement
    extra = 1


class WhoIsForInline(admin.TabularInline):
    model = WhoIsFor
    extra = 1


class CourseDetailFactInline(admin.TabularInline):
    model = CourseDetailFact
    extra = 1


class CourseSkillOutcomeInline(admin.StackedInline):
    model = CourseSkillOutcome
    extra = 1


class CourseTopicInline(admin.TabularInline):
    model = CourseTopic
    extra = 1


class CourseAudienceItemInline(admin.StackedInline):
    model = CourseAudienceItem
    extra = 1


class CourseTagInline(admin.TabularInline):
    model = CourseTag
    extra = 1


class CourseFAQInline(admin.TabularInline):
    model = CourseFAQ
    extra = 1


class CourseComparisonPointInline(admin.TabularInline):
    model = CourseComparisonPoint
    extra = 1


class CourseBuilderItemInline(admin.TabularInline):
    model = CourseBuilderItem
    extra = 1


class CourseCertificatePointInline(admin.TabularInline):
    model = CourseCertificatePoint
    extra = 1


class CourseMentorSpotlightInline(admin.TabularInline):
    model = CourseMentorSpotlight
    extra = 1


class CourseModuleInline(admin.StackedInline):
    model = CourseModule
    extra = 1


class CourseModulePointInline(admin.TabularInline):
    model = CourseModulePoint
    extra = 1


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1


class LessonContentBlockInline(admin.StackedInline):
    model = LessonContentBlock
    extra = 1


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1


class OptionInline(admin.TabularInline):
    model = Option
    extra = 2


class LearningPathCourseInline(admin.TabularInline):
    model = LearningPathCourse
    extra = 1


class CourseTechnologyItemInline(admin.TabularInline):
    model = CourseTechnologyItem
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'mentor',
        'category',
        'level',
        'language',
        'actual_price',
        'discounted_price',
        'is_discount_active',
        'is_featured',
        'featured_order',
        'is_live',
        'is_published',
        'start_date',
    )
    search_fields = ('title', 'slug', 'mentor__username', 'mentor__email', 'category__name')
    list_filter = (
        'level',
        'language',
        'is_live',
        'is_discount_active',
        'is_featured',
        'featured_theme',
        'featured_layout',
        'is_published',
    )
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('featured_order', '-created_at')

    fieldsets = (
        (
            'Basic Information',
            {
                'fields': (
                    'title',
                    'slug',
                    'mentor',
                    'category',
                    'short_description',
                    'description',
                    'thumbnail',
                    'display_video',
                    'syllabus_url',
                )
            },
        ),
        (
            'Pricing',
            {
                'fields': (
                    'actual_price',
                    'discounted_price',
                    'is_discount_active',
                )
            },
        ),
        (
            'Schedule & Duration',
            {
                'fields': (
                    'start_date',
                    'duration_weeks',
                    'live_days',
                    'live_time',
                    'total_hours',
                    'language',
                    'level',
                    'certificate_available',
                    'detail_badge_text',
                )
            },
        ),
        (
            'Featured Card',
            {
                'fields': (
                    'is_featured',
                    'featured_order',
                    'featured_eyebrow',
                    'featured_theme',
                    'featured_layout',
                    'support_value',
                    'support_label',
                )
            },
        ),
        (
            'Enrollment',
            {
                'fields': (
                    'total_seats',
                    'enrolled_students',
                    'is_live',
                )
            },
        ),
        (
            'Status & Ratings',
            {
                'fields': (
                    'is_published',
                    'rating_avg',
                    'rating_count',
                )
            },
        ),
        (
            'Timestamps',
            {
                'fields': (
                    'created_at',
                    'updated_at',
                )
            },
        ),
    )

    inlines = [
        WhatYouWillLearnInline,
        RequirementInline,
        WhoIsForInline,
        CourseDetailFactInline,
        CourseSkillOutcomeInline,
        CourseTopicInline,
        CourseAudienceItemInline,
        CourseTagInline,
        CourseFAQInline,
        CourseComparisonPointInline,
        CourseBuilderItemInline,
        CourseCertificatePointInline,
        CourseMentorSpotlightInline,
        CourseModuleInline,
    ]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name',)}
    list_display = ('name', 'slug', 'show_on_home', 'sort_order')
    list_filter = ('show_on_home',)
    search_fields = ('name', 'short_description')
    fieldsets = (
        ('Basic', {'fields': ('name', 'slug', 'short_description')}),
        ('Homepage Impact Card', {'fields': ('image', 'icon', 'badge', 'icon_name', 'show_on_home', 'sort_order')}),
    )


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = ('course', 'student', 'rating', 'created_at')
    search_fields = ('course__title', 'student__username')
    list_filter = ('rating', 'created_at')


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'sort_order')
    list_filter = ('course',)
    search_fields = ('title', 'course__title')
    inlines = [CourseModulePointInline, LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'lesson_type', 'xp_reward', 'is_preview', 'is_published', 'sort_order')
    list_filter = ('lesson_type', 'is_preview', 'is_published', 'module__course')
    search_fields = ('title', 'summary', 'module__title', 'module__course__title')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [LessonContentBlockInline]


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'lesson', 'passing_score', 'xp_reward', 'max_attempts', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('title', 'lesson__title')
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('prompt', 'quiz', 'question_type', 'sort_order')
    list_filter = ('question_type', 'quiz')
    search_fields = ('prompt', 'quiz__title')
    inlines = [OptionInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'passed', 'xp_awarded', 'completed_at')
    list_filter = ('passed', 'quiz')
    search_fields = ('user__username', 'user__email', 'quiz__title')


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'status', 'progress_percent', 'completed_at')
    list_filter = ('status', 'lesson__module__course')
    search_fields = ('user__username', 'user__email', 'lesson__title')


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress_percent', 'xp_earned', 'completed_lessons', 'total_lessons')
    list_filter = ('course',)
    search_fields = ('user__username', 'user__email', 'course__title')


@admin.register(XPTransaction)
class XPTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'source', 'course', 'lesson', 'created_at')
    list_filter = ('source', 'course')
    search_fields = ('user__username', 'user__email', 'description')


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'xp_threshold', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'awarded_at')
    search_fields = ('user__username', 'user__email', 'badge__name')


@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_count', 'longest_count', 'last_activity_date')
    search_fields = ('user__username', 'user__email')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(UserSkillProgress)
class UserSkillProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill', 'level', 'xp')
    list_filter = ('skill',)
    search_fields = ('user__username', 'user__email', 'skill__name')


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_published', 'created_at')
    list_filter = ('is_published',)
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [LearningPathCourseInline]


@admin.register(UserLearningPathProgress)
class UserLearningPathProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'learning_path', 'progress_percent', 'completed_courses', 'total_courses')
    list_filter = ('learning_path',)
    search_fields = ('user__username', 'user__email', 'learning_path__title')


@admin.register(LearningEvent)
class LearningEventAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_type', 'course', 'lesson', 'created_at')
    list_filter = ('event_type', 'course')
    search_fields = ('user__username', 'user__email', 'course__title', 'lesson__title')


@admin.register(CourseTechnologyCategory)
class CourseTechnologyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'sort_order')
    list_filter = ('course',)
    search_fields = ('name', 'course__title')
    inlines = [CourseTechnologyItemInline]
