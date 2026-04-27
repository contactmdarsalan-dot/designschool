from mentors.models import MentorProfile
from rest_framework import serializers

from .models import Course


def build_absolute_media_url(request, media_field):
    if not media_field:
        return ""

    media_url = media_field.url
    if request is None:
        return media_url
    return request.build_absolute_uri(media_url)


def mentor_display_name(user):
    full_name = user.get_full_name() if hasattr(user, "get_full_name") else ""
    return full_name or getattr(user, "username", "") or getattr(user, "email", "")


def serialize_platform_mentor(request, profile, associated_mentor_id=None):
    user = profile.user
    return {
        "id": str(user.id),
        "name": mentor_display_name(user),
        "role": profile.expertise or profile.current_company or "Platform Mentor",
        "photoUrl": build_absolute_media_url(request, profile.photo),
        "bio": profile.bio,
        "experience": profile.experience,
        "company": profile.current_company,
        "associated": bool(associated_mentor_id and user.id == associated_mentor_id),
    }


def serialize_course_mentor(request, user):
    mentor_profile = getattr(user, "mentor_profile", None)
    mentor_photo = ""
    mentor_role = "Course Mentor"
    mentor_company = ""

    if mentor_profile:
        mentor_photo = build_absolute_media_url(request, mentor_profile.photo)
        mentor_role = mentor_profile.expertise or mentor_profile.current_company or mentor_role
        mentor_company = mentor_profile.current_company

    return {
        "id": str(user.id),
        "name": mentor_display_name(user),
        "photo": mentor_photo,
        "role": mentor_role,
        "company": mentor_company,
    }


DEFAULT_COMPARISON = {
    "left": [
        "Structured live guidance from experienced mentors",
        "Project-first learning with practical reviews",
        "Consistent support and accountability throughout the course",
    ],
    "right": [
        "Disconnected theory without enough practical feedback",
        "Generic lessons that do not map to real project work",
        "Limited support once a lesson is over",
    ],
}

DEFAULT_BUILDER_ITEMS = [
    {"title": "Build Real Projects", "iconName": "Rocket"},
    {"title": "Validate Your Ideas", "iconName": "Lightbulb"},
    {"title": "Ship With Confidence", "iconName": "Cpu"},
    {"title": "Grow With Mentors", "iconName": "Handshake"},
]

DEFAULT_CERTIFICATE_POINTS = [
    "Complete guided coursework and hands-on submissions",
    "Receive mentor-led feedback during your learning journey",
    "Earn a completion certificate after finishing the course requirements",
]


def infer_technology_sections(course):
    title = (course.title or "").lower()
    if "mern" in title:
        return [
            {
                "name": "Frontend",
                "items": [
                    {"name": "React", "iconUrl": ""},
                    {"name": "JavaScript", "iconUrl": ""},
                    {"name": "HTML & CSS", "iconUrl": ""},
                ],
            },
            {
                "name": "Backend",
                "items": [
                    {"name": "Node.js", "iconUrl": ""},
                    {"name": "Express.js", "iconUrl": ""},
                    {"name": "REST APIs", "iconUrl": ""},
                ],
            },
            {
                "name": "Database",
                "items": [
                    {"name": "MongoDB", "iconUrl": ""},
                    {"name": "Authentication", "iconUrl": ""},
                    {"name": "CRUD Workflows", "iconUrl": ""},
                ],
            },
        ]

    if "ui" in title or "ux" in title or "design" in title:
        return [
            {
                "name": "Foundations",
                "items": [
                    {"name": "Design Thinking", "iconUrl": ""},
                    {"name": "Visual Hierarchy", "iconUrl": ""},
                    {"name": "User Flows", "iconUrl": ""},
                ],
            },
            {
                "name": "Workflow",
                "items": [
                    {"name": "Wireframing", "iconUrl": ""},
                    {"name": "Prototyping", "iconUrl": ""},
                    {"name": "Design Systems", "iconUrl": ""},
                ],
            },
            {
                "name": "Tools",
                "items": [
                    {"name": "Figma", "iconUrl": ""},
                    {"name": "Research", "iconUrl": ""},
                    {"name": "Usability Testing", "iconUrl": ""},
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
    shortDescription = serializers.CharField(source="short_description")
    description = serializers.SerializerMethodField()
    durationWeeks = serializers.IntegerField(source="duration_weeks")
    languageLabel = serializers.CharField(source="get_language_display")
    levelLabel = serializers.CharField(source="get_level_display")
    thumbnail = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    isFeatured = serializers.BooleanField(source="is_featured")
    featuredOrder = serializers.IntegerField(source="featured_order")
    featuredCard = serializers.SerializerMethodField()
    ratingAvg = serializers.SerializerMethodField()
    ratingCount = serializers.IntegerField(source="rating_count")
    category = serializers.SerializerMethodField()
    metaData = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "_id",
            "id",
            "slug",
            "title",
            "price",
            "salePrice",
            "discountPercentage",
            "state",
            "type",
            "shortDescription",
            "description",
            "durationWeeks",
            "language",
            "languageLabel",
            "level",
            "levelLabel",
            "thumbnail",
            "tags",
            "isFeatured",
            "featuredOrder",
            "featuredCard",
            "ratingAvg",
            "ratingCount",
            "category",
            "metaData",
        )

    def get__id(self, obj):
        return str(obj.id)

    def get_price(self, obj):
        return float(obj.actual_price or 0)

    def get_salePrice(self, obj):
        if (
            obj.is_discount_active
            and obj.discounted_price
            and obj.discounted_price < obj.actual_price
        ):
            return float(obj.discounted_price)
        return float(obj.actual_price or 0)

    def get_discountPercentage(self, obj):
        return obj.discount_percentage()

    def get_state(self, obj):
        return "published" if obj.is_published else "draft"

    def get_type(self, obj):
        return "live" if obj.is_live else "self-paced"

    def get_description(self, obj):
        return obj.description or obj.short_description

    def get_thumbnail(self, obj):
        return build_absolute_media_url(self.context.get("request"), obj.thumbnail)

    def get_tags(self, obj):
        tags = [tag.text for tag in obj.tags.all()]
        if tags:
            return tags

        derived = []
        if obj.category:
            derived.append(obj.category.name)
        derived.append(obj.get_level_display())
        derived.append("Live" if obj.is_live else "Self-paced")
        return derived

    def get_featuredCard(self, obj):
        duration_value = f"{obj.duration_weeks}"
        duration_label = "Weeks" if obj.duration_weeks != 1 else "Week"
        return {
            "eyebrow": obj.featured_eyebrow or "Featured Program",
            "theme": obj.featured_theme,
            "layout": obj.featured_layout,
            "supportValue": obj.support_value or "24/7",
            "supportLabel": obj.support_label or "Mentor Support",
            "durationValue": duration_value,
            "durationLabel": duration_label,
            "certificationValue": "Yes" if obj.certificate_available else "No",
            "certificationLabel": "Certified",
        }

    def get_ratingAvg(self, obj):
        return float(obj.rating_avg or 0)

    def get_category(self, obj):
        if not obj.category:
            return None
        return {
            "name": obj.category.name,
            "slug": obj.category.slug,
        }

    def get_metaData(self, obj):
        return {
            "thumbnail": self.get_thumbnail(obj),
            "displayTags": self.get_tags(obj),
            "language": obj.get_language_display(),
            "description": self.get_description(obj),
            "displayVideo": obj.display_video,
        }


class PublicCourseDetailSerializer(PublicCourseListSerializer):
    mentor = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()
    batches = serializers.SerializerMethodField()
    pricing = serializers.SerializerMethodField()
    badgeText = serializers.CharField(source="detail_badge_text")
    syllabusUrl = serializers.CharField(source="syllabus_url")
    heroHighlights = serializers.SerializerMethodField()
    heroBullets = serializers.SerializerMethodField()
    detailFacts = serializers.SerializerMethodField()
    courseIncludes = serializers.SerializerMethodField()
    skillOutcomes = serializers.SerializerMethodField()
    topics = serializers.SerializerMethodField()
    audienceCards = serializers.SerializerMethodField()
    syllabusSummary = serializers.SerializerMethodField()
    reviewsSummary = serializers.SerializerMethodField()
    relatedCourses = serializers.SerializerMethodField()
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
            "mentor",
            "category",
            "schedule",
            "batches",
            "pricing",
            "badgeText",
            "syllabusUrl",
            "heroHighlights",
            "heroBullets",
            "detailFacts",
            "courseIncludes",
            "skillOutcomes",
            "topics",
            "audienceCards",
            "syllabusSummary",
            "reviewsSummary",
            "relatedCourses",
            "requirements",
            "targetAudience",
            "curriculum",
            "faqs",
            "comparison",
            "technologySections",
            "builderItems",
            "certificatePoints",
            "platformMentors",
            "mentorSpotlights",
        )

    def get_mentor(self, obj):
        return serialize_course_mentor(self.context.get("request"), obj.mentor)

    def get_category(self, obj):
        if not obj.category:
            return None
        return {
            "name": obj.category.name,
            "slug": obj.category.slug,
        }

    def get_schedule(self, obj):
        return {
            "startDate": obj.start_date,
            "days": obj.live_days,
            "time": obj.live_time,
            "totalHours": obj.total_hours,
            "durationWeeks": obj.duration_weeks,
            "type": self.get_type(obj),
        }

    def get_batches(self, obj):
        return {
            "_id": str(obj.id),
            "startDate": obj.start_date,
        }

    def get_pricing(self, obj):
        return {
            "price": self.get_price(obj),
            "salePrice": self.get_salePrice(obj),
            "discountPercentage": self.get_discountPercentage(obj),
        }

    def get_heroHighlights(self, obj):
        return [
            {"title": "Schedule", "value": f"{obj.live_days} ({obj.live_time})"},
            {"title": "Certificate", "value": "Yes" if obj.certificate_available else "No"},
            {"title": "Language", "value": obj.get_language_display()},
            {"title": "Class", "value": "Live Classes" if obj.is_live else "Self-paced"},
        ]

    def get_heroBullets(self, obj):
        return [point.text for point in obj.learning_points.all()]

    def get_syllabus_stats(self, obj):
        modules = list(obj.modules.all())
        lessons = [
            lesson for module in modules for lesson in module.lessons.all() if lesson.is_published
        ]
        quizzes = [lesson.quiz for lesson in lessons if hasattr(lesson, "quiz")]
        question_count = sum(quiz.questions.count() for quiz in quizzes)
        total_minutes = sum(lesson.estimated_minutes or 0 for lesson in lessons)
        total_xp = sum(lesson.xp_reward or 0 for lesson in lessons) + sum(
            quiz.xp_reward or 0 for quiz in quizzes
        )
        total_hours = obj.total_hours or (round(total_minutes / 60) if total_minutes else 0)

        return {
            "moduleCount": len(modules),
            "lessonCount": len(lessons),
            "quizCount": len(quizzes),
            "questionCount": question_count,
            "totalMinutes": total_minutes,
            "totalHours": total_hours,
            "totalXp": total_xp,
            "certificateAvailable": obj.certificate_available,
        }

    def get_detailFacts(self, obj):
        facts = [
            {
                "label": fact.label,
                "value": fact.value,
                "description": fact.description,
                "iconName": fact.icon_name,
            }
            for fact in obj.detail_facts.all()
        ]
        if facts:
            return facts

        stats = self.get_syllabus_stats(obj)
        mentor = self.get_mentor(obj)
        duration = obj.total_hours or stats["totalHours"] or 0
        duration_value = f"{duration} hours" if duration else f"{obj.duration_weeks} weeks"
        return [
            {
                "label": "Instructor",
                "value": mentor.get("name") or "Design School Mentor",
                "description": mentor.get("role") or "Course mentor",
                "iconName": "UserRound",
            },
            {
                "label": "Skill level",
                "value": obj.get_level_display(),
                "description": "Built for the listed learner level",
                "iconName": "BarChart3",
            },
            {
                "label": "Time to complete",
                "value": duration_value,
                "description": f"{obj.duration_weeks} week guided program",
                "iconName": "Clock3",
            },
            {
                "label": "Learning format",
                "value": "Gamified and interactive",
                "description": "Lessons, tasks, quizzes, XP, and progress",
                "iconName": "Sparkles",
            },
            {
                "label": "Course structure",
                "value": f"{stats['lessonCount']} lessons, {stats['moduleCount']} levels",
                "description": f"{stats['quizCount']} level tests included",
                "iconName": "ListChecks",
            },
            {
                "label": "Certificate",
                "value": "Course certificate" if obj.certificate_available else "Not included",
                "description": "Shareable proof of completion",
                "iconName": "Award",
            },
            {
                "label": "Language",
                "value": obj.get_language_display(),
                "description": "Course delivery language",
                "iconName": "Languages",
            },
            {
                "label": "Last updated",
                "value": obj.updated_at.strftime("%b %d, %Y") if obj.updated_at else "",
                "description": "Content freshness marker",
                "iconName": "RefreshCw",
            },
        ]

    def get_courseIncludes(self, obj):
        stats = self.get_syllabus_stats(obj)
        return [
            {
                "label": "Interactive lessons",
                "value": stats["lessonCount"],
                "description": "Bite-sized lesson flow",
                "iconName": "BookOpen",
            },
            {
                "label": "Level tests",
                "value": stats["quizCount"],
                "description": "Quiz checkpoints",
                "iconName": "ClipboardCheck",
            },
            {
                "label": "Practice questions",
                "value": stats["questionCount"],
                "description": "Feedback and recall prompts",
                "iconName": "MessagesSquare",
            },
            {
                "label": "XP available",
                "value": stats["totalXp"],
                "description": "Gamified learning rewards",
                "iconName": "Trophy",
            },
        ]

    def get_skillOutcomes(self, obj):
        outcomes = [
            {
                "title": item.title,
                "description": item.description,
                "iconName": item.icon_name,
            }
            for item in obj.skill_outcomes.all()
        ]
        if outcomes:
            return outcomes

        learning_points = [point.text for point in obj.learning_points.all()]
        return [
            {
                "title": point.split(":", 1)[0][:80],
                "description": point,
                "iconName": "Sparkles",
            }
            for point in learning_points[:6]
        ]

    def get_topics(self, obj):
        explicit_topics = [
            {
                "name": topic.name,
                "slug": topic.slug,
            }
            for topic in obj.topics.all()
        ]
        if explicit_topics:
            return explicit_topics

        topic_names = []
        for tag in obj.tags.all():
            topic_names.append(tag.text)
        for skill in obj.skills.all():
            topic_names.append(skill.name)
        for section in self.get_technologySections(obj):
            topic_names.extend(item["name"] for item in section["items"])

        seen = set()
        topics = []
        for name in topic_names:
            normalized = (name or "").strip()
            key = normalized.lower()
            if normalized and key not in seen:
                seen.add(key)
                topics.append({"name": normalized, "slug": key.replace(" ", "-")})
        return topics[:14]

    def get_audienceCards(self, obj):
        cards = [
            {
                "title": item.title,
                "description": item.description,
                "iconName": item.icon_name,
            }
            for item in obj.audience_items.all()
        ]
        if cards:
            return cards

        return [
            {
                "title": item.text,
                "description": "Use this course to build confidence, portfolio depth, and a stronger learning habit.",
                "iconName": "Users",
            }
            for item in obj.target_audience.all()
        ]

    def get_syllabusSummary(self, obj):
        return self.get_syllabus_stats(obj)

    def get_reviewsSummary(self, obj):
        reviews = list(obj.reviews.all())
        return {
            "average": self.get_ratingAvg(obj),
            "count": obj.rating_count or len(reviews),
            "items": [
                {
                    "id": review.id,
                    "rating": review.rating,
                    "comment": review.comment,
                    "studentName": mentor_display_name(review.student),
                    "createdAt": review.created_at,
                }
                for review in reviews[:8]
                if review.comment
            ],
        }

    def get_relatedCourses(self, obj):
        queryset = (
            Course.objects.filter(is_published=True)
            .exclude(id=obj.id)
            .select_related("category")
            .prefetch_related("tags")
        )
        if obj.category_id:
            queryset = queryset.filter(category_id=obj.category_id)
        queryset = queryset.order_by("-is_featured", "featured_order", "-created_at")[:4]
        serializer = PublicCourseListSerializer(queryset, many=True, context=self.context)
        return serializer.data

    def get_requirements(self, obj):
        return [req.text for req in obj.requirements.all()]

    def get_targetAudience(self, obj):
        return [item.text for item in obj.target_audience.all()]

    def get_curriculum(self, obj):
        modules = [
            {
                "title": module.title,
                "description": module.description,
                "content": [point.text for point in module.points.all()],
                "lessons": [
                    {
                        "id": lesson.id,
                        "title": lesson.title,
                        "slug": lesson.slug,
                        "summary": lesson.summary,
                        "type": lesson.lesson_type,
                        "estimatedMinutes": lesson.estimated_minutes,
                        "xpReward": lesson.xp_reward,
                        "isPreview": lesson.is_preview,
                        "blocks": [
                            {
                                "type": block.block_type,
                                "title": block.title,
                                "body": block.body,
                                "mediaUrl": block.media_url,
                                "metadata": block.metadata,
                            }
                            for block in lesson.content_blocks.all()
                        ],
                        "quiz": {
                            "id": lesson.quiz.id,
                            "title": lesson.quiz.title,
                            "passingScore": lesson.quiz.passing_score,
                            "xpReward": lesson.quiz.xp_reward,
                            "questionCount": lesson.quiz.questions.count(),
                            "questions": [
                                {
                                    "id": question.id,
                                    "prompt": question.prompt,
                                    "type": question.question_type,
                                    "options": [
                                        {
                                            "id": option.id,
                                            "text": option.text,
                                        }
                                        for option in question.options.all()
                                    ],
                                }
                                for question in lesson.quiz.questions.all()
                            ],
                        }
                        if hasattr(lesson, "quiz")
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
                    "title": "Core Learning Outcomes",
                    "description": "A quick view of the main topics covered in this course.",
                    "content": learning_points,
                }
            ]
        return []

    def get_faqs(self, obj):
        return [
            {
                "que": faq.question,
                "ans": faq.answer,
            }
            for faq in obj.faqs.all()
        ]

    def get_comparison(self, obj):
        left = [point.text for point in obj.comparison_points.all() if point.side == "school"]
        right = [point.text for point in obj.comparison_points.all() if point.side == "others"]
        if not left and not right:
            return DEFAULT_COMPARISON
        return {
            "left": left,
            "right": right,
        }

    def get_technologySections(self, obj):
        sections = [
            {
                "name": category.name,
                "items": [
                    {
                        "name": item.name,
                        "iconUrl": item.icon_url,
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
                "title": item.title,
                "iconName": item.icon_name,
            }
            for item in obj.builder_items.all()
        ]
        return items or DEFAULT_BUILDER_ITEMS

    def get_certificatePoints(self, obj):
        points = [point.text for point in obj.certificate_points.all()]
        return points or DEFAULT_CERTIFICATE_POINTS

    def get_platformMentors(self, obj):
        request = self.context.get("request")
        profiles = (
            MentorProfile.objects.filter(user__role="mentor", user__is_active=True)
            .select_related("user")
            .order_by("-experience", "user__first_name", "user__last_name", "user__id")
        )

        mentors = [
            serialize_platform_mentor(request, profile, associated_mentor_id=obj.mentor_id)
            for profile in profiles
        ]

        if not any(mentor["id"] == str(obj.mentor_id) for mentor in mentors):
            course_mentor = serialize_course_mentor(request, obj.mentor)
            mentors.insert(
                0,
                {
                    "id": course_mentor["id"],
                    "name": course_mentor["name"],
                    "role": course_mentor["role"],
                    "photoUrl": course_mentor["photo"],
                    "bio": "",
                    "experience": 0,
                    "company": course_mentor["company"],
                    "associated": True,
                },
            )

        return mentors

    def get_mentorSpotlights(self, obj):
        spotlights = [
            {
                "name": mentor.name,
                "role": mentor.role,
                "photoUrl": mentor.photo_url,
            }
            for mentor in obj.mentor_spotlights.all()
        ]

        if spotlights:
            return spotlights

        mentor = self.get_mentor(obj)
        if not mentor["name"] and not mentor["photo"]:
            return []
        return [
            {
                "name": mentor["name"],
                "role": "Course Mentor",
                "photoUrl": mentor["photo"],
            }
        ]

    def get_metaData(self, obj):
        base = super().get_metaData(obj)
        technology_sections = self.get_technologySections(obj)
        base.update(
            {
                "requirements": self.get_requirements(obj),
                "content": self.get_curriculum(obj),
                "faqs": self.get_faqs(obj),
                "features": self.get_heroHighlights(obj),
                "techStack": [
                    item["name"] for section in technology_sections for item in section["items"]
                ],
                "outcomes": self.get_heroBullets(obj),
                "certificate": obj.certificate_available,
                "detailFacts": self.get_detailFacts(obj),
                "courseIncludes": self.get_courseIncludes(obj),
                "skillOutcomes": self.get_skillOutcomes(obj),
                "topics": self.get_topics(obj),
                "audienceCards": self.get_audienceCards(obj),
                "syllabusSummary": self.get_syllabusSummary(obj),
                "reviewsSummary": self.get_reviewsSummary(obj),
            }
        )
        return base
