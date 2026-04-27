from django.db import transaction
from django.utils import timezone

from courses.models import LearningEvent, QuizAttempt
from courses.services.progress_service import (
    get_course_for_lesson,
    mark_lesson_completed,
    recompute_course_progress,
)
from courses.services.xp_service import award_xp, update_daily_streak


def normalize_answer_payload(raw_answers):
    if not isinstance(raw_answers, dict):
        return {}

    normalized = {}
    for question_id, option_ids in raw_answers.items():
        if option_ids in (None, ""):
            normalized[str(question_id)] = []
            continue
        if not isinstance(option_ids, list):
            option_ids = [option_ids]
        normalized[str(question_id)] = sorted({str(option_id) for option_id in option_ids})
    return normalized


@transaction.atomic
def submit_quiz_attempt(user, quiz, raw_answers):
    questions = list(quiz.questions.prefetch_related("options").all())
    normalized_answers = normalize_answer_payload(raw_answers)
    total_questions = len(questions)
    correct_count = 0
    checked_answers = {}

    for question in questions:
        correct_option_ids = sorted(
            str(option.id) for option in question.options.all() if option.is_correct
        )
        selected_option_ids = normalized_answers.get(str(question.id), [])
        is_correct = selected_option_ids == correct_option_ids
        correct_count += 1 if is_correct else 0
        checked_answers[str(question.id)] = {
            "selectedOptionIds": selected_option_ids,
            "correct": is_correct,
        }

    score = round((correct_count / total_questions) * 100) if total_questions else 0
    passed = total_questions > 0 and score >= quiz.passing_score
    lesson = quiz.lesson
    course = get_course_for_lesson(lesson)
    already_passed = QuizAttempt.objects.filter(user=user, quiz=quiz, passed=True).exists()
    xp_awarded = 0

    if passed and not already_passed:
        transaction = award_xp(
            user=user,
            amount=quiz.xp_reward,
            source="quiz_passed",
            course=course,
            lesson=lesson,
            description=f"Passed quiz: {quiz.title}",
        )
        xp_awarded = transaction.amount if transaction else 0
        mark_lesson_completed(user, lesson)

    attempt = QuizAttempt.objects.create(
        user=user,
        quiz=quiz,
        score=score,
        passed=passed,
        answers=checked_answers,
        xp_awarded=xp_awarded,
        completed_at=timezone.now(),
    )
    LearningEvent.objects.create(
        user=user,
        course=course,
        lesson=lesson,
        event_type="quiz_passed" if passed else "quiz_failed",
        metadata={"score": score, "attemptId": attempt.id},
    )
    update_daily_streak(user)
    course_progress = recompute_course_progress(user, course)

    return {
        "attempt": attempt,
        "course": course,
        "course_progress": course_progress,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "already_passed": already_passed,
    }
