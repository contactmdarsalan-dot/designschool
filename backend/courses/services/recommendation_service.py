from courses.models import Course


def get_recommended_courses_for_user(user, limit=6):
    queryset = Course.objects.filter(is_published=True).select_related('category', 'mentor')

    if user and user.is_authenticated:
        completed_category_ids = (
            user.course_progress.filter(progress_percent=100, course__category__isnull=False)
            .values_list('course__category_id', flat=True)
            .distinct()
        )
        if completed_category_ids:
            queryset = queryset.filter(category_id__in=completed_category_ids)

    return queryset.order_by('-is_featured', 'featured_order', '-rating_avg', '-created_at')[:limit]
