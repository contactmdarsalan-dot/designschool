from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from courses.models import CourseProgress, LearningEvent, LessonProgress
from courses.services.xp_service import award_xp


def get_course_for_lesson(lesson):
    return lesson.module.course


@transaction.atomic
def mark_lesson_started(user, lesson):
    progress, _ = LessonProgress.objects.get_or_create(user=user, lesson=lesson)
    if progress.status == "not_started":
        progress.status = "in_progress"
        progress.started_at = timezone.now()
        progress.progress_percent = max(progress.progress_percent, 1)
        progress.save(update_fields=["status", "started_at", "progress_percent", "last_seen_at"])
        LearningEvent.objects.create(
            user=user,
            course=get_course_for_lesson(lesson),
            lesson=lesson,
            event_type="lesson_started",
        )
    return progress


@transaction.atomic
def mark_lesson_completed(user, lesson):
    progress, _ = LessonProgress.objects.get_or_create(user=user, lesson=lesson)
    first_completion = progress.status != "completed"
    progress.status = "completed"
    progress.progress_percent = 100
    progress.started_at = progress.started_at or timezone.now()
    progress.completed_at = progress.completed_at or timezone.now()
    progress.save(
        update_fields=["status", "progress_percent", "started_at", "completed_at", "last_seen_at"]
    )

    course = get_course_for_lesson(lesson)
    if first_completion:
        award_xp(
            user=user,
            amount=lesson.xp_reward,
            source="lesson_completed",
            course=course,
            lesson=lesson,
            description=f"Completed lesson: {lesson.title}",
        )
        LearningEvent.objects.create(
            user=user, course=course, lesson=lesson, event_type="lesson_completed"
        )

    course_progress = recompute_course_progress(user, course)
    if first_completion:
        from courses.services.learning_path_service import recompute_paths_for_course

        recompute_paths_for_course(user, course)
    return course_progress


def recompute_course_progress(user, course):
    total_lessons = course.modules.filter(lessons__is_published=True).values("lessons").count()
    completed_lessons = LessonProgress.objects.filter(
        user=user,
        lesson__module__course=course,
        lesson__is_published=True,
        status="completed",
    ).count()
    progress_percent = round((completed_lessons / total_lessons) * 100) if total_lessons else 0

    course_progress, _ = CourseProgress.objects.get_or_create(user=user, course=course)
    course_progress.total_lessons = total_lessons
    course_progress.completed_lessons = completed_lessons
    course_progress.progress_percent = progress_percent
    course_progress.xp_earned = (
        course.xp_transactions.filter(user=user).aggregate(total=Sum("amount"))["total"] or 0
    )
    if total_lessons and completed_lessons == total_lessons:
        course_progress.completed_at = course_progress.completed_at or timezone.now()
    elif completed_lessons < total_lessons:
        course_progress.completed_at = None
    course_progress.save(
        update_fields=[
            "total_lessons",
            "completed_lessons",
            "progress_percent",
            "xp_earned",
            "completed_at",
            "updated_at",
        ]
    )
    return course_progress
