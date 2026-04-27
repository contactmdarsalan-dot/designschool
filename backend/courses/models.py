import uuid

from django.conf import settings
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    short_description = models.CharField(max_length=220, blank=True)
    image = models.ImageField(
        upload_to="courses/categories/",
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
        blank=True,
        null=True,
    )
    icon = models.ImageField(
        upload_to="courses/category-icons/",
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp", "svg"])],
        blank=True,
        null=True,
    )
    badge = models.CharField(max_length=60, blank=True)
    icon_name = models.CharField(max_length=80, blank=True, default="Brain")
    show_on_home = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("sort_order", "name")
        verbose_name_plural = "Categories"


class Course(models.Model):
    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("np", "Nepali"),
        ("en_np", "English & Nepali"),
    ]

    FEATURED_THEME_CHOICES = [
        ("light", "Light"),
        ("dark", "Dark"),
    ]

    FEATURED_LAYOUT_CHOICES = [
        ("media-left", "Media Left"),
        ("media-right", "Media Right"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mentor_courses",
        limit_choices_to={"role": "mentor"},
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="courses"
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(
        upload_to="courses/thumbnails/",
        validators=[FileExtensionValidator(["jpg", "jpeg", "png", "webp"])],
        blank=True,
        null=True,
    )
    display_video = models.URLField(blank=True, help_text="Public intro video URL")
    duration_weeks = models.PositiveIntegerField(default=12)
    syllabus_url = models.URLField(blank=True)
    certificate_available = models.BooleanField(default=True)
    detail_badge_text = models.CharField(max_length=80, blank=True, default="Job Ready!")

    # Pricing
    actual_price = models.DecimalField(max_digits=8, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_discount_active = models.BooleanField(default=False)

    # Schedule & Duration
    start_date = models.DateField()
    live_days = models.CharField(max_length=100, help_text="e.g., Mon, Wed, Fri")
    live_time = models.CharField(max_length=50, help_text="e.g., 7 - 9 PM")
    total_hours = models.PositiveIntegerField(default=0, help_text="Total course hours")
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default="en")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="beginner")

    # Enrollment
    total_seats = models.PositiveIntegerField(default=20)
    enrolled_students = models.PositiveIntegerField(default=0)
    is_live = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    featured_order = models.PositiveIntegerField(default=0)
    featured_theme = models.CharField(
        max_length=10, choices=FEATURED_THEME_CHOICES, default="light"
    )
    featured_layout = models.CharField(
        max_length=20, choices=FEATURED_LAYOUT_CHOICES, default="media-left"
    )
    featured_eyebrow = models.CharField(max_length=120, blank=True)
    support_value = models.CharField(max_length=80, blank=True, default="24/7")
    support_label = models.CharField(max_length=80, blank=True, default="Mentor Support")

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
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="learning_points")
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text


class Requirement(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="requirements")
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text


class WhoIsFor(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="target_audience")
    text = models.CharField(max_length=255)

    def __str__(self):
        return self.text


class CourseDetailFact(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="detail_facts")
    label = models.CharField(max_length=90)
    value = models.CharField(max_length=140)
    description = models.CharField(max_length=240, blank=True)
    icon_name = models.CharField(max_length=80, blank=True, default="CircleCheck")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return f"{self.course.title} - {self.label}"


class CourseSkillOutcome(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="skill_outcomes")
    title = models.CharField(max_length=140)
    description = models.TextField(max_length=700, blank=True)
    icon_name = models.CharField(max_length=80, blank=True, default="Sparkles")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.title


class CourseTopic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="topics")
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        unique_together = ("course", "name")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class CourseAudienceItem(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="audience_items")
    title = models.CharField(max_length=140)
    description = models.TextField(max_length=600, blank=True)
    icon_name = models.CharField(max_length=80, blank=True, default="Users")
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.title


class CourseTag(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="tags")
    text = models.CharField(max_length=80)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.text


class CourseFAQ(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="faqs")
    question = models.CharField(max_length=255)
    answer = models.TextField(max_length=1200)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.question


class CourseModule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True, max_length=600)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class CourseModulePoint(models.Model):
    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name="points")
    text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.text


class Lesson(models.Model):
    LESSON_TYPE_CHOICES = [
        ("article", "Article"),
        ("video", "Video"),
        ("interactive", "Interactive"),
        ("challenge", "Challenge"),
        ("quiz", "Quiz"),
    ]

    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, blank=True)
    summary = models.CharField(max_length=300, blank=True)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES, default="article")
    estimated_minutes = models.PositiveIntegerField(default=8)
    xp_reward = models.PositiveIntegerField(default=10)
    is_preview = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("module", "slug"), name="unique_lesson_slug_per_module"
            ),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1
            while Lesson.objects.filter(module=self.module, slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.module.title} - {self.title}"


class LessonContentBlock(models.Model):
    BLOCK_TYPE_CHOICES = [
        ("text", "Text"),
        ("video", "Video"),
        ("image", "Image"),
        ("code", "Code"),
        ("callout", "Callout"),
        ("task", "Task"),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="content_blocks")
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPE_CHOICES, default="text")
    title = models.CharField(max_length=160, blank=True)
    body = models.TextField(blank=True)
    media_url = models.URLField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.title or f"{self.lesson.title} {self.block_type} block"


class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name="quiz")
    title = models.CharField(max_length=180)
    passing_score = models.PositiveSmallIntegerField(
        default=70, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    xp_reward = models.PositiveIntegerField(default=25)
    max_attempts = models.PositiveIntegerField(default=3)
    is_published = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Quizzes"

    def __str__(self):
        return self.title


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ("single_choice", "Single choice"),
        ("multiple_choice", "Multiple choice"),
        ("true_false", "True / false"),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    prompt = models.TextField()
    question_type = models.CharField(
        max_length=20, choices=QUESTION_TYPE_CHOICES, default="single_choice"
    )
    explanation = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.prompt[:80]


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.text[:80]


class QuizAttempt(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quiz_attempts"
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    score = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=dict, blank=True)
    xp_awarded = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ("-started_at",)

    def __str__(self):
        return f"{self.user} - {self.quiz} - {self.score}%"


class LessonProgress(models.Model):
    STATUS_CHOICES = [
        ("not_started", "Not started"),
        ("in_progress", "In progress"),
        ("completed", "Completed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_progress"
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress_records")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="not_started")
    progress_percent = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_seen_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "lesson")
        ordering = ("lesson__module__sort_order", "lesson__sort_order")

    def __str__(self):
        return f"{self.user} - {self.lesson} - {self.status}"


class CourseProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="course_progress"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="progress_records")
    completed_lessons = models.PositiveIntegerField(default=0)
    total_lessons = models.PositiveIntegerField(default=0)
    progress_percent = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    xp_earned = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "course")
        ordering = ("-updated_at",)

    def __str__(self):
        return f"{self.user} - {self.course} - {self.progress_percent}%"


class XPTransaction(models.Model):
    SOURCE_CHOICES = [
        ("lesson_completed", "Lesson completed"),
        ("quiz_passed", "Quiz passed"),
        ("streak_bonus", "Streak bonus"),
        ("manual", "Manual"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="xp_transactions"
    )
    course = models.ForeignKey(
        Course, on_delete=models.SET_NULL, blank=True, null=True, related_name="xp_transactions"
    )
    lesson = models.ForeignKey(
        Lesson, on_delete=models.SET_NULL, blank=True, null=True, related_name="xp_transactions"
    )
    amount = models.PositiveIntegerField()
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.user} +{self.amount} XP"


class Badge(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    icon_name = models.CharField(max_length=80, blank=True, default="Award")
    xp_threshold = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="badges"
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name="user_badges")
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "badge")
        ordering = ("-awarded_at",)

    def __str__(self):
        return f"{self.user} - {self.badge}"


class DailyStreak(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_streak"
    )
    current_count = models.PositiveIntegerField(default=0)
    longest_count = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.current_count} day streak"


class Skill(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    courses = models.ManyToManyField(Course, related_name="skills", blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class UserSkillProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="skill_progress"
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="user_progress")
    level = models.PositiveIntegerField(default=1)
    xp = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "skill")

    def __str__(self):
        return f"{self.user} - {self.skill} L{self.level}"


class LearningPath(models.Model):
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class LearningPathCourse(models.Model):
    learning_path = models.ForeignKey(
        LearningPath, on_delete=models.CASCADE, related_name="path_courses"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="learning_path_items")
    sort_order = models.PositiveIntegerField(default=0)
    required = models.BooleanField(default=True)

    class Meta:
        unique_together = ("learning_path", "course")
        ordering = ("sort_order", "id")

    def __str__(self):
        return f"{self.learning_path} - {self.course}"


class UserLearningPathProgress(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_path_progress"
    )
    learning_path = models.ForeignKey(
        LearningPath, on_delete=models.CASCADE, related_name="user_progress"
    )
    completed_courses = models.PositiveIntegerField(default=0)
    total_courses = models.PositiveIntegerField(default=0)
    progress_percent = models.PositiveSmallIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "learning_path")

    def __str__(self):
        return f"{self.user} - {self.learning_path} - {self.progress_percent}%"


class LearningEvent(models.Model):
    EVENT_CHOICES = [
        ("lesson_started", "Lesson started"),
        ("lesson_completed", "Lesson completed"),
        ("quiz_failed", "Quiz failed"),
        ("quiz_passed", "Quiz passed"),
        ("video_watched", "Video watched"),
        ("course_dropped", "Course dropped"),
        ("certificate_issued", "Certificate issued"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="learning_events"
    )
    course = models.ForeignKey(
        Course, on_delete=models.SET_NULL, blank=True, null=True, related_name="learning_events"
    )
    lesson = models.ForeignKey(
        Lesson, on_delete=models.SET_NULL, blank=True, null=True, related_name="learning_events"
    )
    event_type = models.CharField(max_length=30, choices=EVENT_CHOICES)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.user} - {self.event_type}"


class CourseComparisonPoint(models.Model):
    SIDE_CHOICES = [
        ("school", "School"),
        ("others", "Others"),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="comparison_points")
    side = models.CharField(max_length=10, choices=SIDE_CHOICES)
    text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("side", "sort_order", "id")

    def __str__(self):
        return f"{self.course.title} - {self.side} - {self.text}"


class CourseTechnologyCategory(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="technology_categories"
    )
    name = models.CharField(max_length=120)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        verbose_name_plural = "Course technology categories"

    def __str__(self):
        return f"{self.course.title} - {self.name}"


class CourseTechnologyItem(models.Model):
    category = models.ForeignKey(
        CourseTechnologyCategory, on_delete=models.CASCADE, related_name="items"
    )
    name = models.CharField(max_length=120)
    icon_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.name


class CourseBuilderItem(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="builder_items")
    title = models.CharField(max_length=160)
    icon_name = models.CharField(max_length=80, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.title


class CourseCertificatePoint(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="certificate_points")
    text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.text


class CourseMentorSpotlight(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="mentor_spotlights")
    name = models.CharField(max_length=120, blank=True)
    role = models.CharField(max_length=120, blank=True)
    photo_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return self.name or f"{self.course.title} mentor"


class CourseReview(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("course", "student")

    def __str__(self):
        return f"{self.course.title} - {self.rating}★ by {self.student.username}"
