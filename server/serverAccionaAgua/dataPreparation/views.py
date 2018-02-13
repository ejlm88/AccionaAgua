from django.http import JsonResponse

from django.shortcuts import render, redirect
from django.views.generic.edit import FormView
from django.conf import settings
import subprocess

class datapreparation(FormView):

    template_name = "dataPreparation/datapreparation.html"
    success_url = '/datapreparation.html'

    def get(self, request, *args, **kwargs):
        db = settings.MONGO_CONNECT.AccionaAgua
        plants = db.User.find({"User": "User2"}, {"_id": 0, "Plants": 1})[0]["Plants"]
        request.session['plants'] = plants
        log = ['succes']
        namePlant = request.session.get('namePlant', 'error')
        db = settings.MONGO_CONNECT.AccionaAgua
        endogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"EndogenousVariables": 1})[0]["EndogenousVariables"]
        context = {'plants': plants,
                   'namePlant': namePlant,
                   'log': log,
                   'endogenousVariables': endogenousVariables}
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        if request.POST.get('log', 'false') == 'true':
            template = "dataacquisition.html"

            r = subprocess.call(['echo \"hola\" | mail -s \"hola\" choco@usal.es'], shell=True)

            return  redirect(template)
        elif request.POST.get('map', 'false') == 'map':
            db = settings.MONGO_CONNECT.AccionaAgua
            response_map = {}
            response_map['latPlant'] = '25.2124580'
            response_map['lngPlant'] = '51.6402182'
            response_map['points'] = []
            #points = obtener latitud, longitud, datos
            for var in points:
                for var2 in var:
                    var.append(var2)
                response_map['points'].append(var)
            return JsonResponse(response_map)
        elif request.POST.get('selectVariables', 'false') == 'selectVariables':
            db = settings.MONGO_CONNECT.AccionaAgua
            endogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"EndogenousVariables": 1})[0]["EndogenousVariables"]
            exogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"ExogenousVariables": 1})[0]["ExogenousVariables"]
            response_selectVariables = {}
            response_selectVariables['variables'] = []
            for var in endogenousVariables:
                response_selectVariables['variables'].append(var)
            for var in exogenousVariables:
                response_selectVariables['variables'].append(var)
            return JsonResponse(response_selectVariables)
        elif request.POST.get('saveVariables', 'false') == 'true':
            db = settings.MONGO_CONNECT.AccionaAgua
