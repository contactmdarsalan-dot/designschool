import os
import random
import logging
import json
from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.mail import send_mail
from django.db.models import Count, Q, Sum
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
import requests

from assignments.models import Assignment
from blogs.models import BlogPost
from courses.models import Category, Course
from enrollments.models import Enrollment
from websitecontent.models import CallbackRequest, FreeResource
from .serializers import (
    AdminUserSerializer,
    EmailTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
)

try:
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token
except ImportError:
    google_requests = None
    id_token = None

User = get_user_model()
logger = logging.getLogger(__name__)


def send_otp_email(email, otp_code):
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD or not settings.DEFAULT_FROM_EMAIL:
        return False

    try:
        send_mail(
            subject='Your Design School verification code',
            message=(
                'Use this 6-digit verification code to verify your account.\n\n'
                f'OTP: {otp_code}\n\n'
                'This code expires in 5 minutes.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception:
        logger.exception('Failed to send OTP email to %s', email)
        return False


def ensure_whatsapp_address(phone_number):
    normalized = (phone_number or '').strip()
    if not normalized:
        return ''
    if normalized.startswith('whatsapp:'):
        return normalized
    return f'whatsapp:{normalized}'


def send_whatsapp_otp(phone_number, otp_code):
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID', '').strip()
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN', '').strip()
    sender = os.environ.get('TWILIO_WHATSAPP_FROM', '').strip()
    content_sid = os.environ.get('TWILIO_WHATSAPP_CONTENT_SID', '').strip()

    if not account_sid or not auth_token or not sender:
        return {
            'configured': False,
            'sent': False,
            'message_sid': '',
            'error': 'Twilio WhatsApp is not configured yet. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM.',
        }

    payload = {
        'From': ensure_whatsapp_address(sender),
        'To': ensure_whatsapp_address(phone_number),
    }

    if content_sid:
        payload['ContentSid'] = content_sid
        payload['ContentVariables'] = json.dumps({'1': otp_code})
    else:
        payload['Body'] = f'Your Design School verification code is {otp_code}. It expires in 5 minutes.'

    try:
        response = requests.post(
            f'https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json',
            auth=(account_sid, auth_token),
            data=payload,
            timeout=15,
        )
    except requests.RequestException:
        logger.exception('WhatsApp OTP delivery request failed for %s', phone_number)
        return {
            'configured': True,
            'sent': False,
            'message_sid': '',
            'error': 'Could not reach Twilio while sending the WhatsApp OTP.',
        }

    if response.ok:
        payload = response.json()
        return {
            'configured': True,
            'sent': True,
            'message_sid': payload.get('sid', ''),
            'error': '',
        }

    try:
        error_payload = response.json()
    except ValueError:
        error_payload = {}

    error_message = error_payload.get('message') or 'Twilio rejected the WhatsApp OTP request.'
    logger.warning(
        'WhatsApp OTP delivery failed for %s with status %s: %s',
        phone_number,
        response.status_code,
        error_message,
    )
    return {
        'configured': True,
        'sent': False,
        'message_sid': '',
        'error': error_message,
    }


class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = EmailTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            try:
                token.blacklist()
            except Exception:
                pass
            return Response(
                {'message': 'Logged out successfully.'},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except Exception:
            return Response(
                {'error': 'Invalid refresh token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GoogleLoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('token')
        access_token = request.data.get('access_token')

        email = None
        first_name = ''
        last_name = ''

        if token:
            if id_token is None or google_requests is None:
                return Response(
                    {'error': 'Google Sign-In is not configured on the server yet.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            try:
                audience = os.environ.get('GOOGLE_CLIENT_ID') or None
                idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), audience=audience)
                email = idinfo.get('email')
                first_name = idinfo.get('given_name', '')
                last_name = idinfo.get('family_name', '')
            except ValueError as exc:
                return Response(
                    {'error': 'Invalid Google token', 'details': str(exc)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif access_token:
            import requests

            response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {access_token}'},
                timeout=10,
            )
            if response.status_code != 200:
                return Response({'error': 'Invalid access token'}, status=status.HTTP_400_BAD_REQUEST)
            user_info = response.json()
            email = user_info.get('email')
            first_name = user_info.get('given_name', '')
            last_name = user_info.get('family_name', '')
        else:
            return Response(
                {'error': 'token or access_token is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email:
            return Response({'error': 'Email not found in Google token'}, status=status.HTTP_400_BAD_REQUEST)

        email = email.strip().lower()
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
            },
        )

        if not created:
            updated_fields = []
            if first_name and not user.first_name:
                user.first_name = first_name
                updated_fields.append('first_name')
            if last_name and not user.last_name:
                user.last_name = last_name
                updated_fields.append('last_name')
            if updated_fields:
                user.save(update_fields=updated_fields)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
                'is_new_user': created,
            }
        )


class GenerateOTPView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        phone_number = (request.data.get('phone_number') or '').strip()

        if not email or not phone_number:
            return Response(
                {'error': 'Email and phone number are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(''.join(char for char in phone_number if char.isdigit())) < 10:
            return Response(
                {'error': 'Please enter a valid phone number.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        otp_code = str(random.randint(100000, 999999))
        whatsapp_delivery = send_whatsapp_otp(phone_number, otp_code)
        email_sent = send_otp_email(email, otp_code)
        debug_otp = otp_code if settings.DEBUG else None

        if not whatsapp_delivery['sent']:
            logger.warning(
                'OTP requested for %s, but WhatsApp delivery was unavailable. Phone=%s Error=%s',
                email,
                phone_number,
                whatsapp_delivery['error'],
            )
        if settings.DEBUG and not whatsapp_delivery['sent']:
            print('====================================')
            print(f'DEV OTP FOR {phone_number}: {otp_code}')
            print('====================================')

        cache.set(f'otp_{email}', otp_code, timeout=300)

        user.phone_number = phone_number
        user.is_phone_verified = False
        user.save(update_fields=['phone_number', 'is_phone_verified'])

        delivery = {
            'channel': 'whatsapp',
            'whatsapp_sent': whatsapp_delivery['sent'],
            'whatsapp_configured': whatsapp_delivery['configured'],
            'whatsapp_error': whatsapp_delivery['error'],
            'message_sid': whatsapp_delivery['message_sid'],
            'sms_sent': False,
            'email_sent': email_sent,
            'debug_fallback_available': bool(debug_otp),
            'phone_number': phone_number,
        }

        if whatsapp_delivery['sent']:
            message = 'OTP sent to your WhatsApp successfully.'
        elif email_sent:
            message = (
                'WhatsApp delivery was unavailable, so OTP was sent to your email.'
                if not debug_otp
                else 'WhatsApp delivery was unavailable, so OTP was sent to your email, and a development fallback is available below.'
            )
        elif debug_otp:
            message = 'WhatsApp delivery was unavailable. Use the development OTP fallback below to continue.'
        else:
            message = 'OTP could not be sent to WhatsApp because the WhatsApp gateway is not configured or rejected the request.'

        response_payload = {
            'message': message,
            'delivery': delivery,
        }

        if debug_otp:
            response_payload['debug_otp'] = debug_otp

        return Response(response_payload)


class VerifyOTPView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        otp_code = (request.data.get('otp_code') or '').strip()

        if not email or not otp_code:
            return Response(
                {'error': 'Email and OTP code are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cached_otp = cache.get(f'otp_{email}')
        if not cached_otp:
            return Response(
                {'error': 'OTP expired or not found. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if cached_otp != otp_code:
            return Response({'error': 'Invalid OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.is_phone_verified = True
        user.save(update_fields=['is_phone_verified'])
        cache.delete(f'otp_{email}')

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'message': 'Phone verified successfully.',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
            }
        )


class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = (permissions.IsAdminUser,)
    queryset = User.objects.all().order_by('-date_joined')

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        role = (self.request.query_params.get('role') or '').strip().lower()
        query = (self.request.query_params.get('q') or '').strip()

        if role:
            queryset = queryset.filter(role=role)

        if query:
            queryset = queryset.filter(
                Q(email__icontains=query)
                | Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(username__icontains=query)
            )

        return queryset


class AdminDashboardView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        def month_start(value):
            return value.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        def shift_month(value, delta):
            month_index = (value.year * 12 + value.month - 1) + delta
            year = month_index // 12
            month = month_index % 12 + 1
            return value.replace(year=year, month=month, day=1, hour=0, minute=0, second=0, microsecond=0)

        def get_course_price(course):
            discounted = course.discounted_price or Decimal('0')
            if course.is_discount_active and discounted and discounted < course.actual_price:
                return discounted
            return course.actual_price or Decimal('0')

        def quantize_money(value):
            return Decimal(value).quantize(Decimal('0.01'))

        def serialize_money(value):
            amount = quantize_money(value)
            return {
                'value': float(amount),
                'display': f'${amount:,.2f}',
            }

        now = timezone.now()
        current_month_start = month_start(now)
        current_week_start = (
            now - timedelta(days=now.weekday())
        ).replace(hour=0, minute=0, second=0, microsecond=0)
        current_day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        recent_enrollments = (
            Enrollment.objects.select_related('course')
            .order_by('-created_at')[:5]
        )
        recent_callbacks = CallbackRequest.objects.order_by('-created_at')[:5]
        upcoming_assignments = (
            Assignment.objects.select_related('course')
            .order_by('due_date')[:5]
        )
        recent_posts = (
            BlogPost.objects.select_related('category', 'author')
            .order_by('-updated_at')[:5]
        )
        verified_enrollments = list(
            Enrollment.objects.filter(status='verified')
            .select_related('course')
            .order_by('-created_at')
        )

        total_revenue = sum((get_course_price(item.course) for item in verified_enrollments), Decimal('0'))
        month_revenue = sum(
            (get_course_price(item.course) for item in verified_enrollments if item.created_at >= current_month_start),
            Decimal('0'),
        )
        week_revenue = sum(
            (get_course_price(item.course) for item in verified_enrollments if item.created_at >= current_week_start),
            Decimal('0'),
        )

        enrollment_series_start = shift_month(current_month_start, -5)
        monthly_enrollment_rows = (
            Enrollment.objects.filter(created_at__gte=enrollment_series_start)
            .annotate(period=TruncMonth('created_at'))
            .values('period')
            .annotate(total=Count('id'))
            .order_by('period')
        )
        monthly_enrollment_map = {
            row['period'].strftime('%Y-%m'): row['total']
            for row in monthly_enrollment_rows
            if row.get('period')
        }
        enrollment_series = []
        cursor = enrollment_series_start
        for _ in range(6):
            key = cursor.strftime('%Y-%m')
            enrollment_series.append({
                'label': cursor.strftime('%b'),
                'value': monthly_enrollment_map.get(key, 0),
            })
            cursor = shift_month(cursor, 1)

        top_categories_rows = list(
            Category.objects.annotate(
                enrollment_total=Count(
                    'courses__enrollments',
                    filter=Q(courses__enrollments__status='verified'),
                ),
                course_total=Count('courses', distinct=True),
            )
            .order_by('-enrollment_total', '-course_total', 'name')[:7]
        )
        category_total = sum((item.enrollment_total or 0) for item in top_categories_rows)
        category_breakdown = [
            {
                'name': item.name,
                'value': item.enrollment_total or 0,
                'share': round(((item.enrollment_total or 0) / category_total) * 100) if category_total else 0,
                'course_total': item.course_total or 0,
            }
            for item in top_categories_rows
        ]

        top_course_rows = (
            Course.objects.select_related('category')
            .annotate(
                verified_sales=Count('enrollments', filter=Q(enrollments__status='verified')),
            )
            .order_by('-verified_sales', '-enrolled_students', '-rating_count', 'title')[:5]
        )
        top_courses = []
        for course in top_course_rows:
            active_price = get_course_price(course)
            revenue = quantize_money(active_price * (course.verified_sales or 0))
            top_courses.append({
                'id': str(course.id),
                'title': course.title,
                'category': course.category.name if course.category else 'General',
                'price': serialize_money(active_price),
                'revenue': serialize_money(revenue),
                'sold': course.verified_sales or 0,
                'rating': float(course.rating_avg or 0),
                'rating_count': course.rating_count or 0,
            })

        top_mentor_rows = (
            User.objects.filter(role='mentor')
            .select_related('mentor_profile')
            .annotate(
                course_total=Count('mentor_courses', distinct=True),
                learner_total=Coalesce(Sum('mentor_courses__enrolled_students'), 0),
                review_total=Coalesce(Sum('mentor_courses__rating_count'), 0),
            )
            .order_by('-learner_total', '-course_total', 'first_name', 'last_name')[:5]
        )
        top_instructors = [
            {
                'id': item.id,
                'name': item.get_full_name() or item.email,
                'email': item.email,
                'expertise': getattr(getattr(item, 'mentor_profile', None), 'expertise', '') or 'Mentor',
                'company': getattr(getattr(item, 'mentor_profile', None), 'current_company', '') or 'Design School',
                'course_total': item.course_total or 0,
                'learner_total': item.learner_total or 0,
                'review_total': item.review_total or 0,
            }
            for item in top_mentor_rows
        ]

        enquiry_labels = dict(CallbackRequest.ENQUIRY_CHOICES)
        lead_source_rows = (
            CallbackRequest.objects.values('enquiry_for')
            .annotate(total=Count('id'))
            .order_by('-total', 'enquiry_for')[:4]
        )
        lead_total = sum((item['total'] for item in lead_source_rows), 0)
        lead_sources = [
            {
                'label': enquiry_labels.get(item['enquiry_for'], item['enquiry_for'].replace('_', ' ').title()),
                'value': item['total'],
                'share': round((item['total'] / lead_total) * 100) if lead_total else 0,
            }
            for item in lead_source_rows
        ]

        student_qs = User.objects.filter(role='student')
        learner_activity = {
            'monthly': {
                'label': 'This month',
                'value': student_qs.filter(date_joined__gte=current_month_start).count(),
            },
            'weekly': {
                'label': 'This week',
                'value': student_qs.filter(date_joined__gte=current_week_start).count(),
            },
            'daily': {
                'label': 'Today',
                'value': student_qs.filter(date_joined__gte=current_day_start).count(),
            },
        }

        return Response(
            {
                'data': {
                    'stats': {
                        'admins': User.objects.filter(role='admin').count(),
                        'students': User.objects.filter(role='student').count(),
                        'mentors': User.objects.filter(role='mentor').count(),
                        'courses': Course.objects.count(),
                        'published_courses': Course.objects.filter(is_published=True).count(),
                        'verified_enrollments': Enrollment.objects.filter(status='verified').count(),
                        'pending_enrollments': Enrollment.objects.filter(status='pending').count(),
                        'callback_requests': CallbackRequest.objects.exclude(status='resolved').count(),
                        'free_resources': FreeResource.objects.count(),
                        'blog_posts': BlogPost.objects.count(),
                    },
                    'kpis': {
                        'enrollment_month': {
                            'value': Enrollment.objects.filter(created_at__gte=current_month_start).count(),
                            'label': 'This month',
                        },
                        'enrollment_week': {
                            'value': Enrollment.objects.filter(created_at__gte=current_week_start).count(),
                            'label': 'This week',
                        },
                        'revenue_total': serialize_money(total_revenue),
                        'revenue_week': serialize_money(week_revenue),
                    },
                    'enrollment_series': enrollment_series,
                    'category_breakdown': category_breakdown,
                    'top_courses': top_courses,
                    'top_instructors': top_instructors,
                    'lead_sources': lead_sources,
                    'learner_activity': learner_activity,
                    'recent_enrollments': [
                        {
                            'id': item.id,
                            'name': f'{item.first_name} {item.last_name}'.strip(),
                            'email': item.email,
                            'course_title': item.course.title,
                            'status': item.get_status_display(),
                            'created_at': item.created_at,
                        }
                        for item in recent_enrollments
                    ],
                    'recent_callbacks': [
                        {
                            'id': item.id,
                            'name': item.name,
                            'phone_number': f'{item.country_code} {item.phone_number}',
                            'enquiry_for': item.get_enquiry_for_display(),
                            'status': item.get_status_display(),
                            'created_at': item.created_at,
                        }
                        for item in recent_callbacks
                    ],
                    'upcoming_assignments': [
                        {
                            'id': item.id,
                            'title': item.title,
                            'course_title': item.course.title,
                            'due_date': item.due_date,
                        }
                        for item in upcoming_assignments
                    ],
                    'recent_posts': [
                        {
                            'id': item.id,
                            'title': item.title,
                            'slug': item.slug,
                            'status': item.get_status_display(),
                            'category': item.category.name if item.category else 'General',
                            'updated_at': item.updated_at,
                        }
                        for item in recent_posts
                    ],
                }
            }
        )
