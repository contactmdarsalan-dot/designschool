from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Course
from .public_serializers import PublicCourseListSerializer, PublicCourseDetailSerializer


def parse_positive_int(raw_value, default, upper_bound):
    try:
        parsed = int(raw_value)
    except (TypeError, ValueError):
        return default
    return max(1, min(upper_bound, parsed))


class PublicCourseListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        page = parse_positive_int(request.query_params.get('page', 1), default=1, upper_bound=100000)
        limit = parse_positive_int(request.query_params.get('limit', 24), default=24, upper_bound=100)
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category', '').strip()
        featured_only = request.query_params.get('featured')

        queryset = (
            Course.objects.filter(is_published=True)
            .select_related('category')
            .prefetch_related('tags')
            .order_by('-is_featured', 'featured_order', '-created_at')
        )

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(short_description__icontains=query)
                | Q(description__icontains=query)
                | Q(category__name__icontains=query)
                | Q(tags__text__icontains=query)
            )

        if category:
            queryset = queryset.filter(category__slug=category)

        if featured_only in {'1', 'true', 'True', 'yes'}:
            queryset = queryset.filter(is_featured=True)

        queryset = queryset.distinct()

        total = queryset.count()
        offset = (page - 1) * limit
        courses = queryset[offset: offset + limit]
        serializer = PublicCourseListSerializer(courses, many=True, context={'request': request})

        return Response(
            {
                'data': {
                    'courses': serializer.data,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'hasNextPage': offset + limit < total,
                    },
                }
            }
        )


import uuid

class PublicCourseDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, course_identifier):
        query = Q(slug=course_identifier)
        try:
            uuid.UUID(str(course_identifier))
            query |= Q(id=course_identifier)
        except ValueError:
            pass

        course = (
            Course.objects.filter(is_published=True)
            .select_related('category', 'mentor', 'mentor__mentor_profile')
            .prefetch_related(
                'tags',
                'learning_points',
                'requirements',
                'target_audience',
                'detail_facts',
                'skill_outcomes',
                'topics',
                'audience_items',
                'skills',
                'faqs',
                'modules__points',
                'modules__lessons__content_blocks',
                'modules__lessons__quiz__questions__options',
                'comparison_points',
                'technology_categories__items',
                'builder_items',
                'certificate_points',
                'mentor_spotlights',
                'reviews__student',
            )
            .filter(query)
            .first()
        )

        if not course:
            return Response({'message': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicCourseDetailSerializer(course, context={'request': request})
        return Response({'data': {'course': serializer.data}})
