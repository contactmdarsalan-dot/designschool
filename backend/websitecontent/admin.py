from django.contrib import admin

from .models import (
    CallbackRequest,
    FreeResource,
    FreeResourceInclude,
    FreeResourceModule,
    FreeResourceOutcome,
    FreeResourceWorkflowStep,
    SiteSetting,
)


class FreeResourceOutcomeInline(admin.TabularInline):
    model = FreeResourceOutcome
    extra = 1


class FreeResourceModuleInline(admin.TabularInline):
    model = FreeResourceModule
    extra = 1


class FreeResourceWorkflowStepInline(admin.TabularInline):
    model = FreeResourceWorkflowStep
    extra = 1


class FreeResourceIncludeInline(admin.TabularInline):
    model = FreeResourceInclude
    extra = 1


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ("site_name", "support_email", "support_phone", "updated_at")
    search_fields = ("site_name", "support_email", "support_phone")


@admin.register(FreeResource)
class FreeResourceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "resource_type",
        "count_label",
        "is_published",
        "sort_order",
        "updated_at",
    )
    list_filter = ("resource_type", "is_published", "icon_key")
    search_fields = ("title", "slug", "short_description", "subtitle")
    readonly_fields = ("created_at", "updated_at")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [
        FreeResourceOutcomeInline,
        FreeResourceModuleInline,
        FreeResourceWorkflowStepInline,
        FreeResourceIncludeInline,
    ]
    fieldsets = (
        (
            "Basic",
            {
                "fields": (
                    "title",
                    "slug",
                    "short_description",
                    "subtitle",
                    "resource_type",
                    "count_label",
                    "icon_key",
                ),
            },
        ),
        (
            "Display Labels",
            {
                "fields": (
                    "accent_label",
                    "level",
                    "format",
                    "estimate_time",
                    "updated_label",
                    "preview_title",
                    "preview_code",
                ),
            },
        ),
        (
            "Status",
            {
                "fields": ("is_published", "sort_order", "created_at", "updated_at"),
            },
        ),
    )


@admin.register(CallbackRequest)
class CallbackRequestAdmin(admin.ModelAdmin):
    list_display = ("name", "country_code", "phone_number", "enquiry_for", "status", "created_at")
    list_filter = ("status", "enquiry_for", "created_at")
    search_fields = ("name", "phone_number", "message", "source_page")
    readonly_fields = ("created_at", "updated_at")
    list_editable = ("status",)
    fieldsets = (
        (
            "Lead Details",
            {
                "fields": (
                    "name",
                    "country_code",
                    "phone_number",
                    "enquiry_for",
                    "message",
                    "source_page",
                ),
            },
        ),
        (
            "Follow-up",
            {
                "fields": ("status", "admin_note", "created_at", "updated_at"),
            },
        ),
    )
