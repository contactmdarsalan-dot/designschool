import logging
import os
from datetime import date

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from certificates.models import StudentCertificate

logger = logging.getLogger(__name__)


def is_certificate_email_configured():
    return bool(
        settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD and settings.DEFAULT_FROM_EMAIL
    )


@receiver(post_save, sender=StudentCertificate)
def send_certificate_email(sender, instance, created, **kwargs):
    """
    Sends an email to student when a certificate is issued.
    Handles download_link as string and accepts all kwargs from signals.
    """
    if not created:
        return  # Only send email on new certificate creation

    student = instance.student
    certificate_obj = instance.certificate
    if not student.email or not is_certificate_email_configured():
        logger.info(
            "Certificate email skipped for %s because SMTP is not configured.", student.email
        )
        return

    # Handle download_link (string) safely
    cert_url = None
    if instance.download_link:
        cert_url = os.path.join(settings.MEDIA_URL, instance.download_link)

    # Handle login URL fallback
    site_url = getattr(settings, "FRONTEND_SITE_URL", None) or getattr(
        settings, "SITE_URL", "http://127.0.0.1:8000"
    )
    login_url = site_url.rstrip("/") + "/dashboard/certificates"

    # Render email
    html_content = render_to_string(
        "students/emails/certificate_published_email.html",
        {
            "student": student,
            "certificate": instance,
            "cert_url": cert_url,
            "login_url": login_url,
            "now": date.today(),
        },
    )
    text_content = strip_tags(html_content)

    email_message = EmailMultiAlternatives(
        subject=f"Your Certificate for {certificate_obj.course.title} is Issued!",
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[student.email],
    )
    email_message.attach_alternative(html_content, "text/html")

    # Attach PDF file if exists
    if instance.download_link:
        pdf_path = os.path.join(settings.MEDIA_ROOT, instance.download_link)
        if os.path.exists(pdf_path):
            email_message.attach_file(pdf_path)

    try:
        email_message.send(fail_silently=False)
    except Exception:
        logger.exception("Failed to send certificate email to %s", student.email)
