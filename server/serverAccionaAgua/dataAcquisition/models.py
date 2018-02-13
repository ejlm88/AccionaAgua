from django.db import models

class Document(models.Model):
    csv = models.FileField(upload_to='.')
# Create your models here.


class DataAcquisitionModel(models.Model):
    namePlant = models.CharField(max_length=200)


    def __str__(self):
        return self.namePlant

