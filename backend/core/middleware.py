class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response.setdefault(
            'Content-Security-Policy',
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: blob: https:; "
            "media-src 'self' https: blob:; "
            "connect-src 'self' https://designschool-beta.vercel.app https://designschool.onrender.com https://api.twilio.com https://www.googleapis.com; "
            "frame-src 'self' https://accounts.google.com; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "frame-ancestors 'none'",
        )
        response.setdefault('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        return response
