from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import BlogCategory, BlogPost, Comment

User = get_user_model()


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ('id', 'name', 'slug', 'meta_title', 'meta_description')
        read_only_fields = ('id', 'slug')


class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    author = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    category = serializers.PrimaryKeyRelatedField(queryset=BlogCategory.objects.all(), allow_null=True, required=False)

    class Meta:
        model = BlogPost
        fields = (
            'id',
            'title',
            'slug',
            'author',
            'author_name',
            'category',
            'category_name',
            'meta_title',
            'meta_description',
            'keywords',
            'excerpt',
            'content',
            'featured_image',
            'read_time',
            'status',
            'views',
            'is_published',
            'created_at',
            'updated_at',
            'published_at',
        )
        read_only_fields = ('id', 'slug', 'views', 'created_at', 'updated_at')


class CommentSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source='post.title', read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=BlogPost.objects.all())

    class Meta:
        model = Comment
        fields = (
            'id',
            'post',
            'post_title',
            'name',
            'email',
            'content',
            'approved',
            'created_at',
        )
        read_only_fields = ('id', 'created_at')
