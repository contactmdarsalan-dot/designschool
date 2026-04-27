from rest_framework import permissions, viewsets

from .models import BlogCategory, BlogPost, Comment
from .serializers import BlogCategorySerializer, BlogPostSerializer, CommentSerializer


class BlogCategoryViewSet(viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all().order_by("name")
    serializer_class = BlogCategorySerializer
    permission_classes = [permissions.IsAdminUser]


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all().select_related("category", "author").order_by("-updated_at")
    serializer_class = BlogPostSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = "slug"

    def get_queryset(self):
        queryset = BlogPost.objects.select_related("category", "author").order_by("-updated_at")
        status = (self.request.query_params.get("status") or "").strip()
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().select_related("post").order_by("-created_at")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Comment.objects.select_related("post").order_by("-created_at")
        post = self.request.query_params.get("post")
        if post:
            queryset = queryset.filter(post_id=post)
        return queryset
