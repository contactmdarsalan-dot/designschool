import json

from django.db import transaction
from rest_framework import serializers

from .models import (
    CallbackRequest,
    FreeResource,
    FreeResourceInclude,
    FreeResourceModule,
    FreeResourceOutcome,
    FreeResourceWorkflowStep,
    SiteSetting,
)


class FreeResourceOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResourceOutcome
        fields = ("id", "text", "sort_order")


class FreeResourceModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResourceModule
        fields = ("id", "title", "detail", "duration", "sort_order")


class FreeResourceWorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResourceWorkflowStep
        fields = ("id", "title", "detail", "sort_order")


class FreeResourceIncludeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResourceInclude
        fields = ("id", "text", "sort_order")


class FreeResourceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeResource
        fields = (
            "id",
            "title",
            "slug",
            "short_description",
            "resource_type",
            "count_label",
            "icon_key",
            "accent_label",
            "sort_order",
        )


class FreeResourceDetailSerializer(serializers.ModelSerializer):
    outcomes = FreeResourceOutcomeSerializer(many=True, required=False)
    modules = FreeResourceModuleSerializer(many=True, required=False)
    workflow_steps = FreeResourceWorkflowStepSerializer(many=True, required=False)
    includes = FreeResourceIncludeSerializer(many=True, required=False)

    class Meta:
        model = FreeResource
        fields = (
            "id",
            "title",
            "slug",
            "short_description",
            "resource_type",
            "count_label",
            "icon_key",
            "level",
            "format",
            "estimate_time",
            "updated_label",
            "accent_label",
            "subtitle",
            "preview_title",
            "preview_code",
            "outcomes",
            "modules",
            "workflow_steps",
            "includes",
            "is_published",
            "sort_order",
        )

    nested_json_fields = ("outcomes", "modules", "workflow_steps", "includes")

    def to_internal_value(self, data):
        mutable = data.copy() if hasattr(data, "copy") else dict(data)
        for field in self.nested_json_fields:
            raw_value = mutable.get(field, serializers.empty)
            if raw_value is serializers.empty or raw_value in (None, ""):
                continue
            if isinstance(raw_value, str):
                try:
                    mutable[field] = json.loads(raw_value)
                except json.JSONDecodeError as exc:
                    raise serializers.ValidationError({field: "Invalid JSON payload."}) from exc
        return super().to_internal_value(mutable)

    def _replace_children(self, resource, field_name, model, items, serializer_key):
        getattr(resource, field_name).all().delete()
        serializer_cls = serializer_key
        for index, item in enumerate(items or []):
            payload = serializer_cls(data=item)
            payload.is_valid(raise_exception=True)
            model.objects.create(
                resource=resource,
                **{
                    **payload.validated_data,
                    "sort_order": payload.validated_data.get("sort_order", index),
                },
            )

    @transaction.atomic
    def create(self, validated_data):
        outcomes = validated_data.pop("outcomes", [])
        modules = validated_data.pop("modules", [])
        workflow_steps = validated_data.pop("workflow_steps", [])
        includes = validated_data.pop("includes", [])

        resource = FreeResource.objects.create(**validated_data)
        self._replace_children(
            resource, "outcomes", FreeResourceOutcome, outcomes, FreeResourceOutcomeSerializer
        )
        self._replace_children(
            resource, "modules", FreeResourceModule, modules, FreeResourceModuleSerializer
        )
        self._replace_children(
            resource,
            "workflow_steps",
            FreeResourceWorkflowStep,
            workflow_steps,
            FreeResourceWorkflowStepSerializer,
        )
        self._replace_children(
            resource, "includes", FreeResourceInclude, includes, FreeResourceIncludeSerializer
        )
        return resource

    @transaction.atomic
    def update(self, instance, validated_data):
        outcomes = validated_data.pop("outcomes", None)
        modules = validated_data.pop("modules", None)
        workflow_steps = validated_data.pop("workflow_steps", None)
        includes = validated_data.pop("includes", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        if outcomes is not None:
            self._replace_children(
                instance, "outcomes", FreeResourceOutcome, outcomes, FreeResourceOutcomeSerializer
            )
        if modules is not None:
            self._replace_children(
                instance, "modules", FreeResourceModule, modules, FreeResourceModuleSerializer
            )
        if workflow_steps is not None:
            self._replace_children(
                instance,
                "workflow_steps",
                FreeResourceWorkflowStep,
                workflow_steps,
                FreeResourceWorkflowStepSerializer,
            )
        if includes is not None:
            self._replace_children(
                instance, "includes", FreeResourceInclude, includes, FreeResourceIncludeSerializer
            )
        return instance


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = (
            "id",
            "site_name",
            "support_email",
            "support_phone",
            "support_whatsapp",
            "address",
            "office_hours",
            "footer_tagline",
            "updated_at",
        )


class CallbackRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallbackRequest
        fields = (
            "id",
            "name",
            "country_code",
            "phone_number",
            "enquiry_for",
            "message",
            "source_page",
            "status",
            "admin_note",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("created_at", "updated_at")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if not request or not request.user.is_staff:
            self.fields["status"].read_only = True
            self.fields["admin_note"].read_only = True
