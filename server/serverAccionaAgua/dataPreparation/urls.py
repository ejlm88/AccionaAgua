from django.conf.urls import include, url
from .views import datapreparation

urlpatterns = [
        url(r'^datapreparation', datapreparation.as_view(), name='datapreparation'),
    ]
