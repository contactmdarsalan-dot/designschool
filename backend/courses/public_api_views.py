from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Course
from .public_serializers import PublicCourseListSerializer, PublicCourseDetailSerializer


class PublicCourseListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        page = max(1, int(request.query_params.get('page', 1)))
        limit = max(1, min(100, int(request.query_params.get('limit', 24))))
        query = request.query_params.get('q', '').strip()

        queryset = (
            Course.objects.filter(is_published=True)
            .prefetch_related('tags')
            .order_by('-created_at')
        )

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(short_description__icontains=query)
                | Q(description__icontains=query)
            )

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
            .prefetch_related('tags', 'requirements', 'faqs', 'modules__points')
            .filter(query)
            .first()
        )

        if not course:
            return Response({'message': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicCourseDetailSerializer(course, context={'request': request})
        return Response({'data': {'course': serializer.data}})
