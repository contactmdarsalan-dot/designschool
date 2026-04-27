from courses.models import Lesson, LessonProgress


def serialize_resume_lesson(lesson, status="not_started", progress_percent=0):
    course = lesson.module.course
    return {
        "course": {
            "id": str(course.id),
            "slug": course.slug,
            "title": course.title,
        },
        "lesson": {
            "id": lesson.id,
            "slug": lesson.slug,
            "title": lesson.title,
            "moduleTitle": lesson.module.title,
            "status": status,
            "progressPercent": progress_percent,
        },
        "href": f"/learn/{course.slug}?lesson={lesson.id}",
    }


def get_next_unfinished_lesson(user, course, after_lesson=None):
    lessons = list(
        Lesson.objects.filter(module__course=course, is_published=True)
        .select_related("module__course")
        .order_by("module__sort_order", "sort_order", "id")
    )
    if not lessons:
        return None

    completed_ids = set(
        LessonProgress.objects.filter(
            user=user,
            lesson__module__course=course,
            status="completed",
        ).values_list("lesson_id", flat=True)
    )

    if after_lesson:
        after_index = next(
            (index for index, lesson in enumerate(lessons) if lesson.id == after_lesson.id), -1
        )
        ordered_lessons = lessons[after_index + 1 :] + lessons[: after_index + 1]
    else:
        ordered_lessons = lessons

    return next((lesson for lesson in ordered_lessons if lesson.id not in completed_ids), None)


def get_resume_learning(user):
    if not user or not user.is_authenticated:
        return None

    latest_progress = (
        LessonProgress.objects.filter(user=user, lesson__is_published=True)
        .select_related("lesson__module__course")
        .order_by("-last_seen_at", "-started_at")
        .first()
    )

    if not latest_progress:
        return None

    if latest_progress.status != "completed":
        return serialize_resume_lesson(
            latest_progress.lesson,
            status=latest_progress.status,
            progress_percent=latest_progress.progress_percent,
        )

    next_lesson = get_next_unfinished_lesson(
        user=user,
        course=latest_progress.lesson.module.course,
        after_lesson=latest_progress.lesson,
    )
    if not next_lesson:
        return None

    return serialize_resume_lesson(next_lesson)
