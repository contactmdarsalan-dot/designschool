from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from mentors.models import MentorProfile

from courses.models import (
    Category,
    Course,
    CourseBuilderItem,
    CourseCertificatePoint,
    CourseComparisonPoint,
    CourseFAQ,
    CourseMentorSpotlight,
    CourseModule,
    CourseModulePoint,
    CourseTag,
    CourseTechnologyCategory,
    CourseTechnologyItem,
    Requirement,
    WhatYouWillLearn,
    WhoIsFor,
)

User = get_user_model()


MENTOR_SEEDS = [
    {
        "email": "arsalan@eduflow.dev",
        "username": "arsalan_mentor",
        "first_name": "Arsalan",
        "last_name": "Khan",
        "expertise": "Lead UI/UX Mentor",
        "bio": "Guides students through research, interface systems, and portfolio-quality design decisions.",
        "current_company": "Eduflow Studio",
        "experience": 7,
    },
    {
        "email": "sara@eduflow.dev",
        "username": "sara_mentor",
        "first_name": "Sara",
        "last_name": "Shrestha",
        "expertise": "Product Design Coach",
        "bio": "Focuses on user flows, case studies, and transforming concepts into polished product experiences.",
        "current_company": "PixelCraft",
        "experience": 6,
    },
    {
        "email": "nabin@eduflow.dev",
        "username": "nabin_mentor",
        "first_name": "Nabin",
        "last_name": "Basnet",
        "expertise": "Full Stack Mentor",
        "bio": "Helps students architect scalable web products with clean frontend and backend workflows.",
        "current_company": "StackForge",
        "experience": 8,
    },
    {
        "email": "priya@eduflow.dev",
        "username": "priya_mentor",
        "first_name": "Priya",
        "last_name": "Rai",
        "expertise": "Frontend Systems Mentor",
        "bio": "Specializes in modern interface engineering, responsive systems, and component-driven thinking.",
        "current_company": "Interface Lab",
        "experience": 5,
    },
    {
        "email": "rohan@eduflow.dev",
        "username": "rohan_mentor",
        "first_name": "Rohan",
        "last_name": "Thapa",
        "expertise": "Career & Project Review Mentor",
        "bio": "Supports students with delivery quality, project reviews, and career-ready presentation skills.",
        "current_company": "Launchpad Works",
        "experience": 9,
    },
]


COURSE_SEEDS = [
    {
        "title": "MERN Stack Development",
        "slug": "mern-stack-development",
        "category": "Development",
        "mentor_email": "nabin@eduflow.dev",
        "course": {
            "short_description": "Master MongoDB, Express, React, and Node with real product workflows.",
            "description": "Build full-stack web applications from scratch with production-style architecture, authentication, dashboards, APIs, and deployment workflows.",
            "display_video": "https://youtu.be/xGtcHcPVb0o",
            "duration_weeks": 16,
            "syllabus_url": "https://example.com/syllabus/mern-stack-development",
            "certificate_available": True,
            "detail_badge_text": "Full Stack Ready",
            "actual_price": Decimal("4500.00"),
            "discounted_price": Decimal("1499.00"),
            "is_discount_active": True,
            "start_date": date(2026, 5, 1),
            "live_days": "Sun, Tue, Thu",
            "live_time": "8 - 9:30 PM",
            "total_hours": 72,
            "language": "en_np",
            "level": "advanced",
            "total_seats": 40,
            "enrolled_students": 0,
            "is_live": True,
            "is_featured": True,
            "featured_order": 1,
            "featured_theme": "light",
            "featured_layout": "media-left",
            "featured_eyebrow": "Flagship Cohort",
            "support_value": "24/7",
            "support_label": "Mentor Support",
            "is_published": True,
        },
        "tags": ["MERN Stack", "Live Classes", "Portfolio Projects"],
        "learning_points": [
            "Build real full-stack products with React and Node.js",
            "Create secure authentication and dashboard flows",
            "Design APIs and connect them to MongoDB cleanly",
            "Deploy a production-ready MERN application",
        ],
        "requirements": [
            "Laptop or desktop",
            "Reliable internet connection",
            "Basic HTML, CSS, and JavaScript familiarity",
        ],
        "target_audience": [
            "Students who want to become full-stack developers",
            "Beginners ready for structured live guidance",
            "Freelancers building client-ready web apps",
        ],
        "faqs": [
            (
                "Is this course beginner friendly?",
                "Yes. We start with strong fundamentals and gradually move into advanced full-stack workflows.",
            ),
            (
                "Will I build projects?",
                "Yes. You will build multiple guided projects and one strong portfolio-ready capstone.",
            ),
            (
                "Do I get a certificate?",
                "Yes. You receive a certificate after completing the course requirements.",
            ),
        ],
        "comparison_left": [
            "Live mentor feedback on projects and assignments",
            "Structured progression from frontend to backend to deployment",
            "Portfolio-ready product building focus",
        ],
        "comparison_right": [
            "Recorded-only content with limited support",
            "Disconnected topics with no real roadmap",
            "Too much theory and not enough building",
        ],
        "builder_items": [
            ("Build Real Projects", "Rocket"),
            ("Validate Product Ideas", "Lightbulb"),
            ("Ship Backend Systems", "Cpu"),
            ("Pitch Better Solutions", "Handshake"),
        ],
        "certificate_points": [
            "Complete guided modules and portfolio deliverables",
            "Receive mentor review checkpoints throughout the cohort",
            "Earn a certificate after successfully completing the program",
        ],
        "mentor_spotlights": [
            {"name": "Arsalan Mentor", "role": "Lead Full Stack Mentor", "photo_url": ""},
            {"name": "Product Coach", "role": "Project Review Mentor", "photo_url": ""},
        ],
        "technology_sections": {
            "Frontend": ["React", "JavaScript", "Tailwind CSS", "Routing"],
            "Backend": ["Node.js", "Express.js", "REST APIs", "Authentication"],
            "Database": ["MongoDB", "Mongoose", "Schema Design"],
            "Deployment": ["Git", "CI/CD Basics", "Production Deployment"],
        },
        "modules": [
            (
                "Frontend Foundations",
                "Build the user-facing layer with modern React patterns.",
                [
                    "Component architecture",
                    "Routing and layout systems",
                    "State management",
                    "Responsive UI building",
                ],
            ),
            (
                "Backend and APIs",
                "Create scalable backend flows for real projects.",
                [
                    "Express app structure",
                    "REST API design",
                    "JWT authentication",
                    "Protected routes and validation",
                ],
            ),
            (
                "Database and Deployment",
                "Persist data and take your app live.",
                [
                    "MongoDB schema design",
                    "CRUD operations",
                    "Deployment workflow",
                    "Environment and production basics",
                ],
            ),
        ],
    },
    {
        "title": "UI UX Design",
        "slug": "ui-ux-design",
        "category": "Design",
        "mentor_email": "arsalan@eduflow.dev",
        "course": {
            "short_description": "Learn user-centered design, wireframes, prototyping, and polished interface systems.",
            "description": "Build a practical UI/UX design workflow from research and information architecture to prototypes, components, and polished product screens.",
            "display_video": "https://youtu.be/B-4eN1Pb7qo",
            "duration_weeks": 12,
            "syllabus_url": "https://example.com/syllabus/ui-ux-design",
            "certificate_available": True,
            "detail_badge_text": "Design Career Track",
            "actual_price": Decimal("1499.00"),
            "discounted_price": Decimal("1299.00"),
            "is_discount_active": True,
            "start_date": date(2026, 5, 10),
            "live_days": "Mon, Wed, Fri",
            "live_time": "7 - 8:30 PM",
            "total_hours": 45,
            "language": "en_np",
            "level": "beginner",
            "total_seats": 30,
            "enrolled_students": 0,
            "is_live": True,
            "is_featured": True,
            "featured_order": 2,
            "featured_theme": "dark",
            "featured_layout": "media-right",
            "featured_eyebrow": "Design Career Track",
            "support_value": "Live",
            "support_label": "Review Sessions",
            "is_published": True,
        },
        "tags": ["UI Design", "UX Process", "Figma"],
        "learning_points": [
            "Understand user research and design thinking basics",
            "Create wireframes, flows, and information architecture",
            "Design polished interfaces in Figma with real hierarchy",
            "Build case-study-ready design projects for your portfolio",
        ],
        "requirements": [
            "Laptop or desktop",
            "Willingness to practice regularly",
            "No prior design experience required",
        ],
        "target_audience": [
            "Students entering UI/UX for the first time",
            "Developers improving product thinking",
            "Creative learners building a design portfolio",
        ],
        "faqs": [
            (
                "Do I need prior design knowledge?",
                "No. This course is structured for beginners and gradually moves into professional workflows.",
            ),
            ("Which tool will we use?", "We use Figma for wireframes, components, and prototypes."),
            (
                "Will I build portfolio projects?",
                "Yes. You will complete practical projects that can be shaped into portfolio case studies.",
            ),
        ],
        "comparison_left": [
            "Strong focus on UX thinking and interface clarity",
            "Live critiques on design decisions and flows",
            "Portfolio-oriented practical assignments",
        ],
        "comparison_right": [
            "Only tool tutorials without product thinking",
            "No structured critique or feedback loop",
            "Generic tasks that are hard to present in a portfolio",
        ],
        "builder_items": [
            ("Understand Users Better", "Lightbulb"),
            ("Design With Clarity", "Cpu"),
            ("Prototype Real Products", "Rocket"),
            ("Present Strong Case Studies", "Handshake"),
        ],
        "certificate_points": [
            "Complete design tasks and guided practical exercises",
            "Participate in critique and iteration checkpoints",
            "Receive a certificate after finishing the course successfully",
        ],
        "mentor_spotlights": [
            {"name": "Design Mentor", "role": "Lead UI/UX Instructor", "photo_url": ""},
            {"name": "Portfolio Coach", "role": "Case Study Reviewer", "photo_url": ""},
        ],
        "technology_sections": {
            "Foundations": ["Design Thinking", "User Research", "Information Architecture"],
            "Workflow": ["Wireframing", "Low-fi to Hi-fi Design", "Interaction Flows"],
            "Tools": ["Figma", "Components", "Prototyping", "Design Systems"],
        },
        "modules": [
            (
                "UX Foundations",
                "Understand people, product goals, and decision-making.",
                [
                    "User research basics",
                    "Persona and journey thinking",
                    "Information architecture",
                    "Problem framing",
                ],
            ),
            (
                "Wireframes and UI Systems",
                "Turn ideas into clear interface systems.",
                [
                    "Wireframe structures",
                    "Visual hierarchy",
                    "Components and spacing",
                    "Responsive interface planning",
                ],
            ),
            (
                "Prototypes and Portfolio Work",
                "Package your work into strong portfolio-ready outcomes.",
                [
                    "Interactive prototyping",
                    "Case study storytelling",
                    "Design presentation",
                    "Iteration and polish",
                ],
            ),
        ],
    },
]


class Command(BaseCommand):
    help = "Seed featured demo courses and rich detail content for local development."

    def handle(self, *args, **options):
        mentors_by_email = {}
        for mentor_seed in MENTOR_SEEDS:
            mentor, _ = User.objects.update_or_create(
                email=mentor_seed["email"],
                defaults={
                    "username": mentor_seed["username"],
                    "first_name": mentor_seed["first_name"],
                    "last_name": mentor_seed["last_name"],
                    "role": "mentor",
                    "is_staff": True,
                    "is_active": True,
                    "is_phone_verified": True,
                },
            )

            mentor.set_password("DevMentor123!")
            mentor.save(update_fields=["password"])

            MentorProfile.objects.update_or_create(
                user=mentor,
                defaults={
                    "expertise": mentor_seed["expertise"],
                    "bio": mentor_seed["bio"],
                    "current_company": mentor_seed["current_company"],
                    "experience": mentor_seed["experience"],
                },
            )

            mentors_by_email[mentor_seed["email"]] = mentor

        for seed in COURSE_SEEDS:
            mentor = mentors_by_email[seed["mentor_email"]]
            category, _ = Category.objects.get_or_create(name=seed["category"])
            course_defaults = dict(seed["course"])
            course_defaults.update(
                {
                    "mentor": mentor,
                    "category": category,
                }
            )

            course, _ = Course.objects.update_or_create(
                slug=seed["slug"],
                defaults={
                    "title": seed["title"],
                    **course_defaults,
                },
            )

            course.tags.all().delete()
            course.learning_points.all().delete()
            course.requirements.all().delete()
            course.target_audience.all().delete()
            course.faqs.all().delete()
            course.comparison_points.all().delete()
            course.builder_items.all().delete()
            course.certificate_points.all().delete()
            course.mentor_spotlights.all().delete()
            course.technology_categories.all().delete()
            course.modules.all().delete()

            for index, text in enumerate(seed["tags"]):
                CourseTag.objects.create(course=course, text=text, sort_order=index)

            for text in seed["learning_points"]:
                WhatYouWillLearn.objects.create(course=course, text=text)

            for text in seed["requirements"]:
                Requirement.objects.create(course=course, text=text)

            for text in seed["target_audience"]:
                WhoIsFor.objects.create(course=course, text=text)

            for index, (question, answer) in enumerate(seed["faqs"]):
                CourseFAQ.objects.create(
                    course=course, question=question, answer=answer, sort_order=index
                )

            for index, text in enumerate(seed["comparison_left"]):
                CourseComparisonPoint.objects.create(
                    course=course,
                    side="school",
                    text=text,
                    sort_order=index,
                )

            for index, text in enumerate(seed["comparison_right"]):
                CourseComparisonPoint.objects.create(
                    course=course,
                    side="others",
                    text=text,
                    sort_order=index,
                )

            for index, (title, icon_name) in enumerate(seed["builder_items"]):
                CourseBuilderItem.objects.create(
                    course=course,
                    title=title,
                    icon_name=icon_name,
                    sort_order=index,
                )

            for index, text in enumerate(seed["certificate_points"]):
                CourseCertificatePoint.objects.create(course=course, text=text, sort_order=index)

            for index, mentor_data in enumerate(seed["mentor_spotlights"]):
                CourseMentorSpotlight.objects.create(course=course, sort_order=index, **mentor_data)

            for category_index, (name, items) in enumerate(seed["technology_sections"].items()):
                tech_category = CourseTechnologyCategory.objects.create(
                    course=course,
                    name=name,
                    sort_order=category_index,
                )
                for item_index, item_name in enumerate(items):
                    CourseTechnologyItem.objects.create(
                        category=tech_category,
                        name=item_name,
                        sort_order=item_index,
                    )

            for module_index, (title, description, points) in enumerate(seed["modules"]):
                module = CourseModule.objects.create(
                    course=course,
                    title=title,
                    description=description,
                    sort_order=module_index,
                )
                for point_index, point_text in enumerate(points):
                    CourseModulePoint.objects.create(
                        module=module,
                        text=point_text,
                        sort_order=point_index,
                    )

            self.stdout.write(self.style.SUCCESS(f"Seeded course: {course.title}"))

        self.stdout.write(self.style.SUCCESS("Demo course content is ready."))
