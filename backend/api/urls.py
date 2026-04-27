from django.urls import include, path

urlpatterns = [
    path("auth/", include("users.api_urls")),
    path("admin/", include("users.admin_api_urls")),
    path("public/", include("websitecontent.api_urls")),
    path("public/courses/", include("courses.public_api_urls")),
    path("public/blogs/", include("blogs.api_public_urls")),
    path("blogs/", include("blogs.api_urls")),
    path("courses/", include("courses.api_urls")),
    path("enrollments/", include("enrollments.api_urls")),
    path("students/", include("students.api_urls")),
    path("mentors/", include("mentors.api_urls")),
    path("assignments/", include("assignments.api_urls")),
    path("attendance/", include("attendance.api_urls")),
    path("certificates/", include("certificates.api_urls")),
    path("recordings/", include("classrecordings.api_urls")),
    path("site/", include("websitecontent.admin_api_urls")),
]
