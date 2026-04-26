from django.contrib import admin

from .models import (
    Category,
    Course,
    CourseBuilderItem,
    CourseCertificatePoint,
    CourseComparisonPoint,
    CourseFAQ,
    CourseMentorSpotlight,
    CourseModule,
    CourseModulePoint,
    CourseReview,
    CourseTag,
    CourseTechnologyCategory,
    CourseTechnologyItem,
    Requirement,
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
        ('Homepage Impact Card', {'fields': ('image', 'badge', 'icon_name', 'show_on_home', 'sort_order')}),
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
    inlines = [CourseModulePointInline]


@admin.register(CourseTechnologyCategory)
class CourseTechnologyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'sort_order')
    list_filter = ('course',)
    search_fields = ('name', 'course__title')
    inlines = [CourseTechnologyItemInline]
