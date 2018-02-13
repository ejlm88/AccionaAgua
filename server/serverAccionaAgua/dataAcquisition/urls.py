from django.conf.urls import include, url
from .views import dataacquisition

urlpatterns = [
        url(r'^dataacquisition', dataacquisition.as_view(), name='dataacquisition'),
    ]
