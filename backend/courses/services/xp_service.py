from django.db.models import Sum
from django.utils import timezone

from courses.models import Badge, DailyStreak, UserBadge, UserSkillProgress, XPTransaction


def award_xp(user, amount, source, course=None, lesson=None, description=''):
    if amount <= 0:
        return None

    transaction = XPTransaction.objects.create(
        user=user,
        course=course,
        lesson=lesson,
        amount=amount,
        source=source,
        description=description,
    )

    if course:
        for skill in course.skills.all():
            progress, _ = UserSkillProgress.objects.get_or_create(user=user, skill=skill)
            progress.xp += amount
            progress.level = max(1, progress.xp // 250 + 1)
            progress.save(update_fields=['xp', 'level', 'updated_at'])

    update_daily_streak(user)
    award_threshold_badges(user)
    return transaction


def get_total_xp(user):
    return XPTransaction.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0


def award_threshold_badges(user):
    total_xp = get_total_xp(user)
    earned_badge_ids = UserBadge.objects.filter(user=user).values_list('badge_id', flat=True)
    badges = Badge.objects.filter(is_active=True, xp_threshold__lte=total_xp).exclude(id__in=earned_badge_ids)
    return [UserBadge.objects.create(user=user, badge=badge) for badge in badges]


def update_daily_streak(user):
    today = timezone.localdate()
    streak, _ = DailyStreak.objects.get_or_create(user=user)

    if streak.last_activity_date == today:
        return streak

    yesterday = today - timezone.timedelta(days=1)
    if streak.last_activity_date == yesterday:
        streak.current_count += 1
    else:
        streak.current_count = 1

    streak.longest_count = max(streak.longest_count, streak.current_count)
    streak.last_activity_date = today
    streak.save(update_fields=['current_count', 'longest_count', 'last_activity_date', 'updated_at'])
    return streak
