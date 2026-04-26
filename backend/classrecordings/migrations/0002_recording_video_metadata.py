from django.db import migrations, models
from urllib.parse import parse_qs, urlparse


def extract_youtube_video_id(video_url):
    parsed = urlparse(video_url or '')
    hostname = parsed.hostname or ''
    path_parts = [part for part in parsed.path.split('/') if part]

    if hostname.endswith('youtu.be') and path_parts:
        return path_parts[0]
    if 'youtube.com' not in hostname:
        return ''

    query_video_id = parse_qs(parsed.query).get('v', [''])[0]
    if query_video_id:
        return query_video_id
    if path_parts and path_parts[0] in {'embed', 'shorts', 'live'} and len(path_parts) > 1:
        return path_parts[1]
    return ''


def populate_video_metadata(apps, schema_editor):
    ClassRecording = apps.get_model('classrecordings', 'ClassRecording')
    for recording in ClassRecording.objects.all():
        youtube_video_id = extract_youtube_video_id(recording.video_url)
        recording.youtube_video_id = youtube_video_id
        recording.video_provider = 'youtube' if youtube_video_id else 'external'
        recording.save(update_fields=['youtube_video_id', 'video_provider'])


class Migration(migrations.Migration):

    dependencies = [
        ('classrecordings', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='classrecording',
            name='video_url',
            field=models.URLField(help_text='Paste YouTube unlisted/public, Vimeo, Drive, or external video link'),
        ),
        migrations.AddField(
            model_name='classrecording',
            name='video_provider',
            field=models.CharField(choices=[('youtube', 'YouTube'), ('external', 'External Link')], default='external', max_length=20),
        ),
        migrations.AddField(
            model_name='classrecording',
            name='youtube_video_id',
            field=models.CharField(blank=True, help_text='Auto-filled for YouTube links, including unlisted videos', max_length=32),
        ),
        migrations.AddField(
            model_name='classrecording',
            name='is_unlisted',
            field=models.BooleanField(default=True, help_text='Mark private catalog videos that should only be visible to enrolled students'),
        ),
        migrations.AddField(
            model_name='classrecording',
            name='duration_seconds',
            field=models.PositiveIntegerField(blank=True, help_text='Optional duration used by the custom player UI', null=True),
        ),
        migrations.RunPython(populate_video_metadata, migrations.RunPython.noop),
    ]
