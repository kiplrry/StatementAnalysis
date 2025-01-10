'''Celery setup'''
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
os.environ.setdefault('FASTAPI_SETTINGS_MODULE', 'app.settings')
app = Celery(__name__)


# Load settings from Django settings
app.config_from_object('app.settings', namespace='CELERY')


# Auto-discover tasks in installed apps
app.autodiscover_tasks(['app'])
