from rest_framework import serializers

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


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')
        read_only_fields = ('id', 'slug')


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


class CourseModuleSerializer(serializers.ModelSerializer):
    points = CourseModulePointSerializer(many=True, read_only=True)

    class Meta:
        model = CourseModule
        fields = ('id', 'title', 'description', 'sort_order', 'points')


class CourseComparisonPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseComparisonPoint
        fields = ('id', 'side', 'text', 'sort_order')


class CourseTechnologyItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseTechnologyItem
        fields = ('id', 'name', 'icon_url', 'sort_order')


class CourseTechnologyCategorySerializer(serializers.ModelSerializer):
    items = CourseTechnologyItemSerializer(many=True, read_only=True)

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


class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    mentor_name = serializers.CharField(source='mentor.get_full_name', read_only=True)
    mentor_photo = serializers.ImageField(source='mentor.mentor_profile.photo', read_only=True)
    learning_points = WhatYouWillLearnSerializer(many=True, read_only=True)
    requirements = RequirementSerializer(many=True, read_only=True)
    target_audience = WhoIsForSerializer(many=True, read_only=True)
    tags = CourseTagSerializer(many=True, read_only=True)
    faqs = CourseFAQSerializer(many=True, read_only=True)
    modules = CourseModuleSerializer(many=True, read_only=True)
    comparison_points = CourseComparisonPointSerializer(many=True, read_only=True)
    technology_categories = CourseTechnologyCategorySerializer(many=True, read_only=True)
    builder_items = CourseBuilderItemSerializer(many=True, read_only=True)
    certificate_points = CourseCertificatePointSerializer(many=True, read_only=True)
    mentor_spotlights = CourseMentorSpotlightSerializer(many=True, read_only=True)
    reviews = CourseReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'
