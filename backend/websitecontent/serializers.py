from rest_framework import serializers
from .models import (
    SiteSetting,
    FreeResource,
    FreeResourceOutcome,
    FreeResourceModule,
    FreeResourceWorkflowStep,
    FreeResourceInclude,
    CallbackRequest,
)


class FreeResourceOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResourceOutcome
        fields = ('id', 'text', 'sort_order')


class FreeResourceModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResourceModule
        fields = ('id', 'title', 'detail', 'duration', 'sort_order')


class FreeResourceWorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResourceWorkflowStep
        fields = ('id', 'title', 'detail', 'sort_order')


class FreeResourceIncludeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResourceInclude
        fields = ('id', 'text', 'sort_order')


class FreeResourceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResource
        fields = (
            'id',
            'title',
            'slug',
            'short_description',
            'resource_type',
            'count_label',
            'icon_key',
            'accent_label',
            'sort_order',
        )


class FreeResourceDetailSerializer(serializers.ModelSerializer):
    outcomes = FreeResourceOutcomeSerializer(many=True, read_only=True)
    modules = FreeResourceModuleSerializer(many=True, read_only=True)
    workflow_steps = FreeResourceWorkflowStepSerializer(many=True, read_only=True)
    includes = FreeResourceIncludeSerializer(many=True, read_only=True)

    class Meta:
        model = FreeResource
        fields = (
            'id',
            'title',
            'slug',
            'short_description',
            'resource_type',
            'count_label',
            'icon_key',
            'level',
            'format',
            'estimate_time',
            'updated_label',
            'accent_label',
            'subtitle',
            'preview_title',
            'preview_code',
            'outcomes',
            'modules',
            'workflow_steps',
            'includes',
        )


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = (
            'site_name',
            'support_email',
            'support_phone',
            'support_whatsapp',
            'address',
            'office_hours',
            'footer_tagline',
            'updated_at',
        )


class CallbackRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallbackRequest
        fields = (
            'id',
            'name',
            'country_code',
            'phone_number',
            'enquiry_for',
            'message',
            'source_page',
            'status',
            'admin_note',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('status', 'admin_note', 'created_at', 'updated_at')
