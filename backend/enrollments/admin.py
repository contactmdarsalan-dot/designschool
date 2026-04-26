from django.contrib import admin
from .models import Enrollment, PaymentMethod, PendingEnrollment, VerifiedEnrollment


# Default admin for all enrollments
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'whatsapp_number', 'course', 'payment_method', 'status', 'created_at')
    list_filter = ('status', 'course', 'payment_method')
    search_fields = ('first_name', 'last_name', 'email', 'whatsapp_number')
    ordering = ('-created_at',)


# Shows only pending enrollments
@admin.register(PendingEnrollment)
class PendingEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'course', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')
    ordering = ('-created_at',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(status='pending')


# Shows only verified enrollments
@admin.register(VerifiedEnrollment)
class VerifiedEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'course', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')
    ordering = ('-created_at',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(status='verified')


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('name', 'account_label', 'is_active', 'sort_order', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'account_label')
    ordering = ('sort_order', 'name')
