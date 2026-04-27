import logging

from django.conf import settings
from django.core.mail import send_mail

from .models import StudentNotification

logger = logging.getLogger(__name__)


def is_email_configured():
    return bool(
        settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD and settings.DEFAULT_FROM_EMAIL
    )


def send_student_notification_email(user, title, message, action_url=""):
    if not user.email or not is_email_configured():
        return False

    site_url = getattr(settings, "SITE_URL", "").rstrip("/")
    full_action_url = action_url
    if action_url and action_url.startswith("/"):
        frontend_url = getattr(settings, "FRONTEND_SITE_URL", "") or site_url
        full_action_url = f"{frontend_url.rstrip('/')}{action_url}"

    body_parts = [message]
    if full_action_url:
        body_parts.extend(["", f"Open: {full_action_url}"])

    try:
        send_mail(
            subject=f"Design School: {title}",
            message="\n".join(body_parts),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception:
        logger.exception("Failed to send student notification email to %s", user.email)
        return False


def notify_student(user, *, category, title, message, action_url="", event_key="", send_email=True):
    if not user or getattr(user, "role", "") != "student":
        return None

    notification, created = StudentNotification.objects.get_or_create(
        event_key=event_key,
        defaults={
            "user": user,
            "category": category,
            "title": title,
            "message": message,
            "action_url": action_url,
        },
    )

    if created and send_email:
        notification.email_sent = send_student_notification_email(user, title, message, action_url)
        notification.save(update_fields=["email_sent"])

    return notification
