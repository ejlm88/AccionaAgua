from django.forms import ModelForm
from django import forms
from .models import DataAcquisitionModel, Document

class FormUpload(forms.Form):
    '''
    Form principal
    '''
    csv = forms.FileField()

    def __init__(self, *args, **kwargs):
        super(FormUpload, self).__init__(*args, **kwargs)

    def handle_uploaded_file(self, f):
        with open('media/' + f.name, 'w') as destination:
            for chunk in f.chunks():
                destination.write(chunk.decode('utf-8'))

class DataAcquisitionForms(forms.ModelForm):

    class Meta:
        model = DataAcquisitionModel
        fields = '__all__'

