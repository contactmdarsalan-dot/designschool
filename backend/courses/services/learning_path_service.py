from django.db import transaction
from django.utils import timezone

from courses.models import CourseProgress, LearningPath, UserLearningPathProgress


def get_learning_path_queryset():
    return (
        LearningPath.objects.filter(is_published=True)
        .prefetch_related(
            "path_courses__course__category",
            "path_courses__course__tags",
            "path_courses__course__modules__lessons",
        )
        .order_by("created_at", "id")
    )


@transaction.atomic
def recompute_learning_path_progress(user, learning_path):
    course_ids = list(learning_path.path_courses.values_list("course_id", flat=True))
    total_courses = len(course_ids)
    completed_courses = CourseProgress.objects.filter(
        user=user,
        course_id__in=course_ids,
        progress_percent=100,
    ).count()
    progress_percent = round((completed_courses / total_courses) * 100) if total_courses else 0

    progress, _ = UserLearningPathProgress.objects.get_or_create(
        user=user,
        learning_path=learning_path,
    )
    progress.total_courses = total_courses
    progress.completed_courses = completed_courses
    progress.progress_percent = progress_percent
    if total_courses and completed_courses == total_courses:
        progress.completed_at = progress.completed_at or timezone.now()
    elif completed_courses < total_courses:
        progress.completed_at = None
    progress.save(
        update_fields=[
            "total_courses",
            "completed_courses",
            "progress_percent",
            "completed_at",
            "updated_at",
        ]
    )
    return progress


def recompute_paths_for_course(user, course):
    path_ids = course.learning_path_items.values_list("learning_path_id", flat=True)
    paths = LearningPath.objects.filter(id__in=path_ids, is_published=True)
    return [recompute_learning_path_progress(user, path) for path in paths]


def start_learning_path(user, learning_path):
    progress = recompute_learning_path_progress(user, learning_path)
    if not progress.started_at:
        progress.started_at = timezone.now()
        progress.save(update_fields=["started_at", "updated_at"])
    return progress


def serialize_path_progress(user, learning_path):
    if not user or not user.is_authenticated:
        return {
            "started": False,
            "completedCourses": 0,
            "totalCourses": learning_path.path_courses.count(),
            "progressPercent": 0,
            "completedAt": None,
        }

    progress = recompute_learning_path_progress(user, learning_path)
    return {
        "started": True,
        "completedCourses": progress.completed_courses,
        "totalCourses": progress.total_courses,
        "progressPercent": progress.progress_percent,
        "completedAt": progress.completed_at,
    }
