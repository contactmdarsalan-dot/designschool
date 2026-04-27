from django.contrib.auth import get_user_model
from django.db.models import Sum

from courses.models import UserBadge, UserSkillProgress, XPTransaction
from courses.services.resume_service import get_resume_learning
from courses.services.xp_service import get_total_xp

XP_PER_LEVEL = 250


def calculate_level(total_xp):
    level = total_xp // XP_PER_LEVEL + 1
    xp_into_level = total_xp % XP_PER_LEVEL
    return {
        "level": level,
        "totalXp": total_xp,
        "xpIntoLevel": xp_into_level,
        "xpForNextLevel": XP_PER_LEVEL,
        "levelProgressPercent": round((xp_into_level / XP_PER_LEVEL) * 100),
    }


def get_leaderboard(limit=10):
    User = get_user_model()
    users = (
        User.objects.annotate(total_xp=Sum("xp_transactions__amount"))
        .filter(total_xp__gt=0, is_active=True)
        .order_by("-total_xp", "first_name", "username")[:limit]
    )
    return [
        {
            "rank": index + 1,
            "userId": str(user.id),
            "name": user.get_full_name() or user.username or user.email,
            "totalXp": user.total_xp or 0,
            "level": calculate_level(user.total_xp or 0)["level"],
        }
        for index, user in enumerate(users)
    ]


def get_gamification_summary(user):
    total_xp = get_total_xp(user)
    streak = getattr(user, "daily_streak", None)
    badges = UserBadge.objects.filter(user=user).select_related("badge").order_by("-awarded_at")[:8]
    recent_transactions = XPTransaction.objects.filter(user=user).select_related(
        "course", "lesson"
    )[:8]
    skill_rows = (
        UserSkillProgress.objects.filter(user=user).select_related("skill").order_by("-xp")[:6]
    )

    return {
        **calculate_level(total_xp),
        "streak": {
            "current": getattr(streak, "current_count", 0) or 0,
            "longest": getattr(streak, "longest_count", 0) or 0,
            "lastActivityDate": getattr(streak, "last_activity_date", None),
        },
        "badges": [
            {
                "id": row.badge_id,
                "name": row.badge.name,
                "slug": row.badge.slug,
                "description": row.badge.description,
                "iconName": row.badge.icon_name,
                "awardedAt": row.awarded_at,
            }
            for row in badges
        ],
        "recentXp": [
            {
                "id": row.id,
                "amount": row.amount,
                "source": row.source,
                "description": row.description,
                "courseTitle": row.course.title if row.course else "",
                "lessonTitle": row.lesson.title if row.lesson else "",
                "createdAt": row.created_at,
            }
            for row in recent_transactions
        ],
        "skills": [
            {
                "id": row.skill_id,
                "name": row.skill.name,
                "slug": row.skill.slug,
                "level": row.level,
                "xp": row.xp,
            }
            for row in skill_rows
        ],
        "resumeLearning": get_resume_learning(user),
        "leaderboard": get_leaderboard(),
    }
