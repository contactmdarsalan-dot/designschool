from django.db import models
from django.utils.text import slugify


class SiteSetting(models.Model):
    site_name = models.CharField(max_length=120, default='Design School')
    support_email = models.EmailField(blank=True)
    support_phone = models.CharField(max_length=30, blank=True)
    support_whatsapp = models.CharField(max_length=30, blank=True)
    address = models.CharField(max_length=255, blank=True)
    office_hours = models.CharField(max_length=120, blank=True)
    footer_tagline = models.CharField(max_length=180, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Setting'
        verbose_name_plural = 'Site Settings'

    def __str__(self):
        return self.site_name or 'Site Setting'


class FreeResource(models.Model):
    ICON_CHOICES = [
        ('workflow', 'Workflow'),
        ('code2', 'Code2'),
        ('notebook', 'Notebook'),
        ('layout', 'Layout'),
        ('server', 'Server'),
        ('database', 'Database'),
        ('filetext', 'File Text'),
        ('pen', 'Pen'),
        ('book', 'Book'),
        ('video', 'Video'),
        ('lightbulb', 'Lightbulb'),
        ('revision', 'Revision'),
    ]

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.TextField(max_length=320)
    resource_type = models.CharField(max_length=60)
    count_label = models.CharField(max_length=60, help_text='Example: 120 Guides, 200 Videos')
    icon_key = models.CharField(max_length=30, choices=ICON_CHOICES, default='book')
    level = models.CharField(max_length=100, default='All Levels')
    format = models.CharField(max_length=160, default='Structured Resource Pack')
    estimate_time = models.CharField(max_length=80, default='2-3 hours per week')
    updated_label = models.CharField(max_length=80, default='Updated regularly')
    accent_label = models.CharField(max_length=80, default='Free Resource')
    subtitle = models.TextField(max_length=500, blank=True)
    preview_title = models.CharField(max_length=120, default='Resource Preview')
    preview_code = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('sort_order', 'title')

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1
            while FreeResource.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{count}'
                count += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class FreeResourceOutcome(models.Model):
    resource = models.ForeignKey(FreeResource, on_delete=models.CASCADE, related_name='outcomes')
    text = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.text


class FreeResourceModule(models.Model):
    resource = models.ForeignKey(FreeResource, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=120)
    detail = models.TextField(max_length=280)
    duration = models.CharField(max_length=60, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return f'{self.resource.title} - {self.title}'


class FreeResourceWorkflowStep(models.Model):
    resource = models.ForeignKey(FreeResource, on_delete=models.CASCADE, related_name='workflow_steps')
    title = models.CharField(max_length=120)
    detail = models.TextField(max_length=280)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return f'{self.resource.title} - {self.title}'


class FreeResourceInclude(models.Model):
    resource = models.ForeignKey(FreeResource, on_delete=models.CASCADE, related_name='includes')
    text = models.CharField(max_length=180)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('sort_order', 'id')

    def __str__(self):
        return self.text


class CallbackRequest(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('spam', 'Spam'),
    ]

    ENQUIRY_CHOICES = [
        ('online_course', 'Online Course (Website)'),
        ('live_cohort', 'Live Cohort Program'),
        ('offline_classes', 'Offline Classes'),
        ('career_guidance', 'Career Guidance'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=120)
    country_code = models.CharField(max_length=8, default='+977')
    phone_number = models.CharField(max_length=24)
    enquiry_for = models.CharField(max_length=30, choices=ENQUIRY_CHOICES, default='online_course')
    message = models.TextField(max_length=1200, blank=True)
    source_page = models.CharField(max_length=140, blank=True, help_text='Example: /request-callback')
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='new')
    admin_note = models.TextField(max_length=1000, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.name} ({self.country_code} {self.phone_number})'
