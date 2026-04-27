from django.db.models import Sum

from courses.models import Badge, UserBadge, UserSkillProgress, XPTransaction


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

    award_threshold_badges(user)
    return transaction


def get_total_xp(user):
    return XPTransaction.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or 0


def award_threshold_badges(user):
    total_xp = get_total_xp(user)
    earned_badge_ids = UserBadge.objects.filter(user=user).values_list('badge_id', flat=True)
    badges = Badge.objects.filter(is_active=True, xp_threshold__lte=total_xp).exclude(id__in=earned_badge_ids)
    return [UserBadge.objects.create(user=user, badge=badge) for badge in badges]

