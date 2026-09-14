# Generated manually to add PowerPoint support.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("files", "0004_uploadedfile_drive_file_id_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="uploadedfile",
            name="file_type",
            field=models.CharField(
                choices=[
                    ("image", "Image"),
                    ("pdf", "PDF"),
                    ("docx", "DOCX"),
                    ("pptx", "PPTX"),
                    ("txt", "TXT"),
                    ("audio", "Audio"),
                ],
                max_length=20,
            ),
        ),
    ]
