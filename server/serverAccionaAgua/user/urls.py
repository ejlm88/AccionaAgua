from django.conf.urls import include, url
from .views import user

urlpatterns = [
        url(r'^user', user.as_view(), name='user'),
    ]
