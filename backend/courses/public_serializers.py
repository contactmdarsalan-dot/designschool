from rest_framework import serializers

from mentors.models import MentorProfile

from .models import Course


def build_absolute_media_url(request, media_field):
    if not media_field:
        return ''

    media_url = media_field.url
    if request is None:
        return media_url
    return request.build_absolute_uri(media_url)


def mentor_display_name(user):
    full_name = user.get_full_name() if hasattr(user, 'get_full_name') else ''
    return full_name or getattr(user, 'username', '') or getattr(user, 'email', '')


def serialize_platform_mentor(request, profile, associated_mentor_id=None):
    user = profile.user
    return {
        'id': str(user.id),
        'name': mentor_display_name(user),
        'role': profile.expertise or profile.current_company or 'Platform Mentor',
        'photoUrl': build_absolute_media_url(request, profile.photo),
        'bio': profile.bio,
        'experience': profile.experience,
        'company': profile.current_company,
        'associated': bool(associated_mentor_id and user.id == associated_mentor_id),
    }


def serialize_course_mentor(request, user):
    mentor_profile = getattr(user, 'mentor_profile', None)
    mentor_photo = ''
    mentor_role = 'Course Mentor'
    mentor_company = ''

    if mentor_profile:
        mentor_photo = build_absolute_media_url(request, mentor_profile.photo)
        mentor_role = mentor_profile.expertise or mentor_profile.current_company or mentor_role
        mentor_company = mentor_profile.current_company

    return {
        'id': str(user.id),
        'name': mentor_display_name(user),
        'photo': mentor_photo,
        'role': mentor_role,
        'company': mentor_company,
    }


DEFAULT_COMPARISON = {
    'left': [
        'Structured live guidance from experienced mentors',
        'Project-first learning with practical reviews',
        'Consistent support and accountability throughout the course',
    ],
    'right': [
        'Disconnected theory without enough practical feedback',
        'Generic lessons that do not map to real project work',
        'Limited support once a lesson is over',
    ],
}

DEFAULT_BUILDER_ITEMS = [
    {'title': 'Build Real Projects', 'iconName': 'Rocket'},
    {'title': 'Validate Your Ideas', 'iconName': 'Lightbulb'},
    {'title': 'Ship With Confidence', 'iconName': 'Cpu'},
    {'title': 'Grow With Mentors', 'iconName': 'Handshake'},
]

DEFAULT_CERTIFICATE_POINTS = [
    'Complete guided coursework and hands-on submissions',
    'Receive mentor-led feedback during your learning journey',
    'Earn a completion certificate after finishing the course requirements',
]


def infer_technology_sections(course):
    title = (course.title or '').lower()
    if 'mern' in title:
        return [
            {
                'name': 'Frontend',
                'items': [
                    {'name': 'React', 'iconUrl': ''},
                    {'name': 'JavaScript', 'iconUrl': ''},
                    {'name': 'HTML & CSS', 'iconUrl': ''},
                ],
            },
            {
                'name': 'Backend',
                'items': [
                    {'name': 'Node.js', 'iconUrl': ''},
                    {'name': 'Express.js', 'iconUrl': ''},
                    {'name': 'REST APIs', 'iconUrl': ''},
                ],
            },
            {
                'name': 'Database',
                'items': [
                    {'name': 'MongoDB', 'iconUrl': ''},
                    {'name': 'Authentication', 'iconUrl': ''},
                    {'name': 'CRUD Workflows', 'iconUrl': ''},
                ],
            },
        ]

    if 'ui' in title or 'ux' in title or 'design' in title:
        return [
            {
                'name': 'Foundations',
                'items': [
                    {'name': 'Design Thinking', 'iconUrl': ''},
                    {'name': 'Visual Hierarchy', 'iconUrl': ''},
                    {'name': 'User Flows', 'iconUrl': ''},
                ],
            },
            {
                'name': 'Workflow',
                'items': [
                    {'name': 'Wireframing', 'iconUrl': ''},
                    {'name': 'Prototyping', 'iconUrl': ''},
                    {'name': 'Design Systems', 'iconUrl': ''},
                ],
            },
            {
                'name': 'Tools',
                'items': [
                    {'name': 'Figma', 'iconUrl': ''},
                    {'name': 'Research', 'iconUrl': ''},
                    {'name': 'Usability Testing', 'iconUrl': ''},
                ],
            },
        ]

    return []


class PublicCourseListSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    salePrice = serializers.SerializerMethodField()
    discountPercentage = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    shortDescription = serializers.CharField(source='short_description')
    description = serializers.SerializerMethodField()
    durationWeeks = serializers.IntegerField(source='duration_weeks')
    languageLabel = serializers.CharField(source='get_language_display')
    levelLabel = serializers.CharField(source='get_level_display')
    thumbnail = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    isFeatured = serializers.BooleanField(source='is_featured')
    featuredOrder = serializers.IntegerField(source='featured_order')
    featuredCard = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    metaData = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            '_id',
            'id',
            'slug',
            'title',
            'price',
            'salePrice',
            'discountPercentage',
            'state',
            'type',
            'shortDescription',
            'description',
            'durationWeeks',
            'language',
            'languageLabel',
            'level',
            'levelLabel',
            'thumbnail',
            'tags',
            'isFeatured',
            'featuredOrder',
            'featuredCard',
            'category',
            'metaData',
        )

    def get__id(self, obj):
        return str(obj.id)

    def get_price(self, obj):
        return float(obj.actual_price or 0)

    def get_salePrice(self, obj):
        if obj.is_discount_active and obj.discounted_price and obj.discounted_price < obj.actual_price:
            return float(obj.discounted_price)
        return float(obj.actual_price or 0)

    def get_discountPercentage(self, obj):
        return obj.discount_percentage()

    def get_state(self, obj):
        return 'published' if obj.is_published else 'draft'

    def get_type(self, obj):
        return 'live' if obj.is_live else 'self-paced'

    def get_description(self, obj):
        return obj.description or obj.short_description

    def get_thumbnail(self, obj):
        return build_absolute_media_url(self.context.get('request'), obj.thumbnail)

    def get_tags(self, obj):
        tags = [tag.text for tag in obj.tags.all()]
        if tags:
            return tags

        derived = []
        if obj.category:
            derived.append(obj.category.name)
        derived.append(obj.get_level_display())
        derived.append('Live' if obj.is_live else 'Self-paced')
        return derived

    def get_featuredCard(self, obj):
        duration_value = f'{obj.duration_weeks}'
        duration_label = 'Weeks' if obj.duration_weeks != 1 else 'Week'
        return {
            'eyebrow': obj.featured_eyebrow or 'Featured Program',
            'theme': obj.featured_theme,
            'layout': obj.featured_layout,
            'supportValue': obj.support_value or '24/7',
            'supportLabel': obj.support_label or 'Mentor Support',
            'durationValue': duration_value,
            'durationLabel': duration_label,
            'certificationValue': 'Yes' if obj.certificate_available else 'No',
            'certificationLabel': 'Certified',
        }

    def get_category(self, obj):
        if not obj.category:
            return None
        return {
            'name': obj.category.name,
            'slug': obj.category.slug,
        }

    def get_metaData(self, obj):
        return {
            'thumbnail': self.get_thumbnail(obj),
            'displayTags': self.get_tags(obj),
            'language': obj.get_language_display(),
            'description': self.get_description(obj),
            'displayVideo': obj.display_video,
        }


class PublicCourseDetailSerializer(PublicCourseListSerializer):
    mentor = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()
    batches = serializers.SerializerMethodField()
    pricing = serializers.SerializerMethodField()
    badgeText = serializers.CharField(source='detail_badge_text')
    syllabusUrl = serializers.CharField(source='syllabus_url')
    heroHighlights = serializers.SerializerMethodField()
    heroBullets = serializers.SerializerMethodField()
    requirements = serializers.SerializerMethodField()
    targetAudience = serializers.SerializerMethodField()
    curriculum = serializers.SerializerMethodField()
    faqs = serializers.SerializerMethodField()
    comparison = serializers.SerializerMethodField()
    technologySections = serializers.SerializerMethodField()
    builderItems = serializers.SerializerMethodField()
    certificatePoints = serializers.SerializerMethodField()
    platformMentors = serializers.SerializerMethodField()
    mentorSpotlights = serializers.SerializerMethodField()
    metaData = serializers.SerializerMethodField()

    class Meta(PublicCourseListSerializer.Meta):
        fields = PublicCourseListSerializer.Meta.fields + (
            'mentor',
            'category',
            'schedule',
            'batches',
            'pricing',
            'badgeText',
            'syllabusUrl',
            'heroHighlights',
            'heroBullets',
            'requirements',
            'targetAudience',
            'curriculum',
            'faqs',
            'comparison',
            'technologySections',
            'builderItems',
            'certificatePoints',
            'platformMentors',
            'mentorSpotlights',
        )

    def get_mentor(self, obj):
        return serialize_course_mentor(self.context.get('request'), obj.mentor)

    def get_category(self, obj):
        if not obj.category:
            return None
        return {
            'name': obj.category.name,
            'slug': obj.category.slug,
        }

    def get_schedule(self, obj):
        return {
            'startDate': obj.start_date,
            'days': obj.live_days,
            'time': obj.live_time,
            'totalHours': obj.total_hours,
            'durationWeeks': obj.duration_weeks,
            'type': self.get_type(obj),
        }

    def get_batches(self, obj):
        return {
            '_id': str(obj.id),
            'startDate': obj.start_date,
        }

    def get_pricing(self, obj):
        return {
            'price': self.get_price(obj),
            'salePrice': self.get_salePrice(obj),
            'discountPercentage': self.get_discountPercentage(obj),
        }

    def get_heroHighlights(self, obj):
        return [
            {'title': 'Schedule', 'value': f'{obj.live_days} ({obj.live_time})'},
            {'title': 'Certificate', 'value': 'Yes' if obj.certificate_available else 'No'},
            {'title': 'Language', 'value': obj.get_language_display()},
            {'title': 'Class', 'value': 'Live Classes' if obj.is_live else 'Self-paced'},
        ]

    def get_heroBullets(self, obj):
        return [point.text for point in obj.learning_points.all()]

    def get_requirements(self, obj):
        return [req.text for req in obj.requirements.all()]

    def get_targetAudience(self, obj):
        return [item.text for item in obj.target_audience.all()]

    def get_curriculum(self, obj):
        modules = [
            {
                'title': module.title,
                'description': module.description,
                'content': [point.text for point in module.points.all()],
                'lessons': [
                    {
                        'id': lesson.id,
                        'title': lesson.title,
                        'slug': lesson.slug,
                        'summary': lesson.summary,
                        'type': lesson.lesson_type,
                        'estimatedMinutes': lesson.estimated_minutes,
                        'xpReward': lesson.xp_reward,
                        'isPreview': lesson.is_preview,
                        'blocks': [
                            {
                                'type': block.block_type,
                                'title': block.title,
                                'body': block.body,
                                'mediaUrl': block.media_url,
                                'metadata': block.metadata,
                            }
                            for block in lesson.content_blocks.all()
                        ],
                        'quiz': {
                            'id': lesson.quiz.id,
                            'title': lesson.quiz.title,
                            'passingScore': lesson.quiz.passing_score,
                            'xpReward': lesson.quiz.xp_reward,
                            'questionCount': lesson.quiz.questions.count(),
                            'questions': [
                                {
                                    'id': question.id,
                                    'prompt': question.prompt,
                                    'type': question.question_type,
                                    'options': [
                                        {
                                            'id': option.id,
                                            'text': option.text,
                                        }
                                        for option in question.options.all()
                                    ],
                                }
                                for question in lesson.quiz.questions.all()
                            ],
                        }
                        if hasattr(lesson, 'quiz')
                        else None,
                    }
                    for lesson in module.lessons.all()
                    if lesson.is_published
                ],
            }
            for module in obj.modules.all()
        ]
        if modules:
            return modules

        learning_points = [point.text for point in obj.learning_points.all()]
        if learning_points:
            return [
                {
                    'title': 'Core Learning Outcomes',
                    'description': 'A quick view of the main topics covered in this course.',
                    'content': learning_points,
                }
            ]
        return []

    def get_faqs(self, obj):
        return [
            {
                'que': faq.question,
                'ans': faq.answer,
            }
            for faq in obj.faqs.all()
        ]

    def get_comparison(self, obj):
        left = [point.text for point in obj.comparison_points.all() if point.side == 'school']
        right = [point.text for point in obj.comparison_points.all() if point.side == 'others']
        if not left and not right:
            return DEFAULT_COMPARISON
        return {
            'left': left,
            'right': right,
        }

    def get_technologySections(self, obj):
        sections = [
            {
                'name': category.name,
                'items': [
                    {
                        'name': item.name,
                        'iconUrl': item.icon_url,
                    }
                    for item in category.items.all()
                ],
            }
            for category in obj.technology_categories.all()
        ]
        return sections or infer_technology_sections(obj)

    def get_builderItems(self, obj):
        items = [
            {
                'title': item.title,
                'iconName': item.icon_name,
            }
            for item in obj.builder_items.all()
        ]
        return items or DEFAULT_BUILDER_ITEMS

    def get_certificatePoints(self, obj):
        points = [point.text for point in obj.certificate_points.all()]
        return points or DEFAULT_CERTIFICATE_POINTS

    def get_platformMentors(self, obj):
        request = self.context.get('request')
        profiles = (
            MentorProfile.objects.filter(user__role='mentor', user__is_active=True)
            .select_related('user')
            .order_by('-experience', 'user__first_name', 'user__last_name', 'user__id')
        )

        mentors = [
            serialize_platform_mentor(request, profile, associated_mentor_id=obj.mentor_id)
            for profile in profiles
        ]

        if not any(mentor['id'] == str(obj.mentor_id) for mentor in mentors):
            course_mentor = serialize_course_mentor(request, obj.mentor)
            mentors.insert(
                0,
                {
                    'id': course_mentor['id'],
                    'name': course_mentor['name'],
                    'role': course_mentor['role'],
                    'photoUrl': course_mentor['photo'],
                    'bio': '',
                    'experience': 0,
                    'company': course_mentor['company'],
                    'associated': True,
                },
            )

        return mentors

    def get_mentorSpotlights(self, obj):
        spotlights = [
            {
                'name': mentor.name,
                'role': mentor.role,
                'photoUrl': mentor.photo_url,
            }
            for mentor in obj.mentor_spotlights.all()
        ]

        if spotlights:
            return spotlights

        mentor = self.get_mentor(obj)
        if not mentor['name'] and not mentor['photo']:
            return []
        return [
            {
                'name': mentor['name'],
                'role': 'Course Mentor',
                'photoUrl': mentor['photo'],
            }
        ]

    def get_metaData(self, obj):
        base = super().get_metaData(obj)
        technology_sections = self.get_technologySections(obj)
        base.update(
            {
                'requirements': self.get_requirements(obj),
                'content': self.get_curriculum(obj),
                'faqs': self.get_faqs(obj),
                'features': self.get_heroHighlights(obj),
                'techStack': [item['name'] for section in technology_sections for item in section['items']],
                'outcomes': self.get_heroBullets(obj),
                'certificate': obj.certificate_available,
            }
        )
        return base
