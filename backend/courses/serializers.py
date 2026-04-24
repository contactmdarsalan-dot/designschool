from rest_framework import serializers
from .models import Category, Course, WhatYouWillLearn, Requirement, WhoIsFor, CourseReview

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
    reviews = CourseReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'
