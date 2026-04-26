from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator, MinValueValidator, MaxValueValidator
import uuid

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    short_description = models.CharField(max_length=220, blank=True)
    image = models.ImageField(
        upload_to='courses/categories/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])],
        blank=True,
        null=True,
    )
    badge = models.CharField(max_length=60, blank=True)
    icon_name = models.CharField(max_length=80, blank=True, default='Brain')
    show_on_home = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('sort_order', 'name')
        verbose_name_plural = 'Categories'


class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('np', 'Nepali'),
        ('en_np', 'English & Nepali'),
    ]

    FEATURED_THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
    ]

    FEATURED_LAYOUT_CHOICES = [
        ('media-left', 'Media Left'),
        ('media-right', 'Media Right'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mentor_courses',
        limit_choices_to={'role': 'mentor'}
    )
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(
        upload_to='courses/thumbnails/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])],
        blank=True,
        null=True
    )
    display_video = models.URLField(blank=True, help_text='Public intro video URL')
    duration_weeks = models.PositiveIntegerField(default=12)
    syllabus_url = models.URLField(blank=True)
    certificate_available = models.BooleanField(default=True)
    detail_badge_text = models.CharField(max_length=80, blank=True, default='Job Ready!')

    # Pricing
    actual_price = models.DecimalField(max_digits=8, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_discount_active = models.BooleanField(default=False)

    # Schedule & Duration
    start_date = models.DateField()
    live_days = models.CharField(max_length=100, help_text="e.g., Mon, Wed, Fri")
    live_time = models.CharField(max_length=50, help_text="e.g., 7 - 9 PM")
    total_hours = models.PositiveIntegerField(default=0, help_text="Total course hours")
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')

    # Enrollment
    total_seats = models.PositiveIntegerField(default=20)
    enrolled_students = models.PositiveIntegerField(default=0)
    is_live = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    featured_order = models.PositiveIntegerField(default=0)
    featured_theme = models.CharField(max_length=10, choices=FEATURED_THEME_CHOICES, default='light')
    featured_layout = models.CharField(max_length=20, choices=FEATURED_LAYOUT_CHOICES, default='media-left')
    featured_eyebrow = models.CharField(max_length=120, blank=True)
    support_value = models.CharField(max_length=80, blank=True, default='24/7')
    support_label = models.CharField(max_length=80, blank=True, default='Mentor Support')

    # Status
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Ratings
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    rating_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def discount_percentage(self):
        if self.is_discount_active and self.discounted_price < self.actual_price:
            return int(100 - (self.discounted_price / self.actual_price) * 100)
        return 0


class WhatYouWillLearn(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='learning_points')
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text


class Requirement(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='requirements')
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text


class WhoIsFor(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='target_audience')
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text


class CourseTag(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tags')
    text = models.CharField(max_length=80)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.text


class CourseFAQ(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=255)
    answer = models.TextField(max_length=1200)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.question


class CourseModule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True, max_length=600)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return f'{self.course.title} - {self.title}'


class CourseModulePoint(models.Model):
    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name='points')
    text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.text


class CourseComparisonPoint(models.Model):
    SIDE_CHOICES = [
        ('school', 'School'),
        ('others', 'Others'),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='comparison_points')
    side = models.CharField(max_length=10, choices=SIDE_CHOICES)
    text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('side', 'sort_order', 'id')

    def __str__(self):
        return f'{self.course.title} - {self.side} - {self.text}'


class CourseTechnologyCategory(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='technology_categories')
    name = models.CharField(max_length=120)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')
        verbose_name_plural = 'Course technology categories'

    def __str__(self):
        return f'{self.course.title} - {self.name}'


class CourseTechnologyItem(models.Model):
    category = models.ForeignKey(CourseTechnologyCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=120)
    icon_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.name


class CourseBuilderItem(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='builder_items')
    title = models.CharField(max_length=160)
    icon_name = models.CharField(max_length=80, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.title


class CourseCertificatePoint(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificate_points')
    text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.text


class CourseMentorSpotlight(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='mentor_spotlights')
    name = models.CharField(max_length=120, blank=True)
    role = models.CharField(max_length=120, blank=True)
    photo_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.name or f'{self.course.title} mentor'




class CourseReview(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'student')

    def __str__(self):
        return f"{self.course.title} - {self.rating}★ by {self.student.username}"
