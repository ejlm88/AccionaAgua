from django.http import HttpResponse
from django.template.loader import get_template

from django.shortcuts import render, redirect
from django.views.generic.edit import FormView
import json
import subprocess

class datapreparation(FormView):

    template_name = "dataPreparation/datapreparation.html"
    success_url = '/datapreparation.html'

    def get(self, request, *args, **kwargs):
        plants = ['Ras Abu Fontas Kahrama', 'Torrevieja', 'Ras Abu Fontas Kahrama', 'Torrevieja',
                'Ras Abu Fontas Kahrama', 'Torrevieja', 'Ras Abu Fontas Kahrama', 'Torrevieja',
                'Ras Abu Fontas Kahrama', 'Torrevieja']
        log = ['succes']
        context = {'plants': plants,
                   'log': log}
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        if request.POST.get('log', 'false') == 'true':

            template = "dataacquisition.html"
            return  redirect(template)