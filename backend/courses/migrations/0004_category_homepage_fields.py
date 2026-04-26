import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_course_certificate_available_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='short_description',
            field=models.CharField(blank=True, max_length=220),
        ),
        migrations.AddField(
            model_name='category',
            name='image',
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to='courses/categories/',
                validators=[django.core.validators.FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp'])],
            ),
        ),
        migrations.AddField(
            model_name='category',
            name='badge',
            field=models.CharField(blank=True, max_length=60),
        ),
        migrations.AddField(
            model_name='category',
            name='icon_name',
            field=models.CharField(blank=True, default='Brain', max_length=80),
        ),
        migrations.AddField(
            model_name='category',
            name='show_on_home',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='category',
            name='sort_order',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ('sort_order', 'name'), 'verbose_name_plural': 'Categories'},
        ),
    ]
