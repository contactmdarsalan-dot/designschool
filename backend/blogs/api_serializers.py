from rest_framework import serializers
from .models import BlogPost


class PublicBlogListSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    readTime = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ('id', 'slug', 'title', 'excerpt', 'category', 'date', 'readTime', 'image')

    def get_id(self, obj):
        return obj.slug

    def get_category(self, obj):
        if obj.category:
            return obj.category.name
        return 'General'

    def get_date(self, obj):
        if not obj.published_at:
            return ''
        return obj.published_at.strftime('%b %d, %Y')

    def get_readTime(self, obj):
        return f'{obj.read_time} min read'

    def get_image(self, obj):
        if not obj.featured_image:
            return ''
        request = self.context.get('request')
        image_url = obj.featured_image.url
        if request is not None:
            return request.build_absolute_uri(image_url)
        return image_url


class PublicBlogDetailSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    readTime = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = (
            'slug',
            'title',
            'excerpt',
            'content',
            'category',
            'date',
            'readTime',
            'image',
            'author_name',
            'views',
        )

    def get_category(self, obj):
        if obj.category:
            return obj.category.name
        return 'General'

    def get_date(self, obj):
        if not obj.published_at:
            return ''
        return obj.published_at.strftime('%b %d, %Y')

    def get_readTime(self, obj):
        return f'{obj.read_time} min read'

    def get_image(self, obj):
        if not obj.featured_image:
            return ''
        request = self.context.get('request')
        image_url = obj.featured_image.url
        if request is not None:
            return request.build_absolute_uri(image_url)
        return image_url

    def get_author_name(self, obj):
        if not obj.author:
            return 'Design School'
        return obj.author.get_full_name() or obj.author.username
