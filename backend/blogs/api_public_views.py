from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import BlogPost
from .api_serializers import PublicBlogListSerializer, PublicBlogDetailSerializer


def parse_positive_int(raw_value, default, upper_bound):
    try:
        parsed = int(raw_value)
    except (TypeError, ValueError):
        return default
    return max(1, min(upper_bound, parsed))


class PublicBlogListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        page = parse_positive_int(request.query_params.get('page', 1), default=1, upper_bound=100000)
        limit = parse_positive_int(request.query_params.get('limit', 12), default=12, upper_bound=50)
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category', '').strip()

        queryset = BlogPost.objects.filter(is_published=True, status='published').select_related('category')

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(excerpt__icontains=query)
                | Q(content__icontains=query)
            )

        if category:
            queryset = queryset.filter(Q(category__slug__iexact=category) | Q(category__name__iexact=category))

        queryset = queryset.order_by('-published_at')

        total = queryset.count()
        offset = (page - 1) * limit
        posts = queryset[offset: offset + limit]
        serializer = PublicBlogListSerializer(posts, many=True, context={'request': request})

        return Response(
            {
                'data': {
                    'posts': serializer.data,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total,
                        'hasNextPage': offset + limit < total,
                    },
                }
            }
        )


class PublicBlogDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        post = (
            BlogPost.objects.filter(is_published=True, status='published', slug=slug)
            .select_related('category', 'author')
            .first()
        )

        if not post:
            return Response({'message': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

        post.views = (post.views or 0) + 1
        post.save(update_fields=['views'])

        related_queryset = (
            BlogPost.objects.filter(is_published=True, status='published')
            .exclude(id=post.id)
            .select_related('category')
            .order_by('-published_at')[:3]
        )
        if post.category_id:
            same_category = related_queryset.filter(category_id=post.category_id)
            if same_category.exists():
                related_queryset = same_category

        serializer = PublicBlogDetailSerializer(post, context={'request': request})
        related_serializer = PublicBlogListSerializer(related_queryset, many=True, context={'request': request})
        return Response({'data': {'post': serializer.data, 'related_posts': related_serializer.data}})
