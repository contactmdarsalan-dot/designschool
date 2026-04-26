import os
import sys
import traceback


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")

    try:
        import django
        from django.conf import settings
        from django.core.management import call_command

        django.setup()

        database = settings.DATABASES["default"]
        print("Render startup check:", flush=True)
        print(f"- Python: {sys.version.split()[0]}", flush=True)
        print(f"- Django: {django.get_version()}", flush=True)
        print(f"- Database engine: {database.get('ENGINE')}", flush=True)
        print(f"- Database host: {database.get('HOST') or 'local'}", flush=True)
        print(f"- Allowed hosts: {settings.ALLOWED_HOSTS}", flush=True)

        call_command("migrate", interactive=False, verbosity=2)
    except Exception:
        print("Render startup failed before Gunicorn:", file=sys.stderr, flush=True)
        traceback.print_exc()
        return 1

    port = os.environ.get("PORT", "8000")
    os.execvp(
        "gunicorn",
        [
            "gunicorn",
            "project.wsgi:application",
            "--bind",
            f"0.0.0.0:{port}",
            "--access-logfile",
            "-",
            "--error-logfile",
            "-",
            "--capture-output",
            "--log-level",
            os.environ.get("GUNICORN_LOG_LEVEL", "info"),
        ],
    )


if __name__ == "__main__":
    raise SystemExit(main())
