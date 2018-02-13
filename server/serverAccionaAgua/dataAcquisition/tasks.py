from __future__ import absolute_import
from celery import shared_task
import subprocess

@shared_task
def dataAcquisition():
    r = subprocess.call(['echo \"hola\" | mail -s \"hola\" choco@usal.es'])

