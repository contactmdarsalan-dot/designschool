from rest_framework import serializers
from .models import Course


class PublicCourseListSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    discountPercentage = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    metaData = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('_id', 'title', 'price', 'discountPercentage', 'state', 'type', 'metaData')

    def get__id(self, obj):
        return str(obj.id)

    def get_price(self, obj):
        return float(obj.actual_price or 0)

    def get_discountPercentage(self, obj):
        if not obj.is_discount_active:
            return 0

        actual = float(obj.actual_price or 0)
        discounted = float(obj.discounted_price or 0)
        if actual <= 0 or discounted >= actual:
            return 0

        return int(round(((actual - discounted) / actual) * 100))

    def get_state(self, obj):
        return 'published' if obj.is_published else 'draft'

    def get_type(self, obj):
        return 'live' if obj.is_live else 'self-paced'

    def get_metaData(self, obj):
        request = self.context.get('request')
        thumbnail_url = ''
        if obj.thumbnail:
            thumbnail_url = obj.thumbnail.url
            if request is not None:
                thumbnail_url = request.build_absolute_uri(thumbnail_url)

        return {
            'thumbnail': thumbnail_url,
            'displayTags': [tag.text for tag in obj.tags.all()],
            'language': obj.get_language_display(),
        }


class PublicCourseDetailSerializer(PublicCourseListSerializer):
    duration_weeks = serializers.IntegerField()
    batches = serializers.SerializerMethodField()
    metaData = serializers.SerializerMethodField()

    class Meta(PublicCourseListSerializer.Meta):
        fields = PublicCourseListSerializer.Meta.fields + ('duration_weeks', 'batches')

    def get_batches(self, obj):
        return {'_id': str(obj.id)}

    def get_metaData(self, obj):
        base = super().get_metaData(obj)
        base.update(
            {
                'description': obj.description or obj.short_description,
                'displayVideo': obj.display_video,
                'requirements': [req.text for req in obj.requirements.all()],
                'content': [
                    {
                        'title': module.title,
                        'description': module.description,
                        'content': [point.text for point in module.points.all()],
                    }
                    for module in obj.modules.all()
                ],
                'faqs': [{'que': faq.question, 'ans': faq.answer} for faq in obj.faqs.all()],
            }
        )
        return base
