from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.images import get_image_dimensions
from django.template.defaultfilters import filesizeformat

ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def validate_image_upload(uploaded_file):
    if not uploaded_file:
        return

    max_size = getattr(settings, "DATA_UPLOAD_MAX_MEMORY_SIZE", 5 * 1024 * 1024)
    if uploaded_file.size > max_size:
        raise ValidationError(f"Image must be smaller than {filesizeformat(max_size)}.")

    content_type = getattr(uploaded_file, "content_type", "").lower()
    if content_type and content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise ValidationError("Upload a JPEG, PNG, WebP, or GIF image.")

    extension = Path(uploaded_file.name).suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError("Upload a file with a valid image extension.")

    try:
        get_image_dimensions(uploaded_file)
    except Exception as exc:
        raise ValidationError("Upload a valid image file.") from exc
    finally:
        try:
            uploaded_file.seek(0)
        except (AttributeError, OSError):
            pass
