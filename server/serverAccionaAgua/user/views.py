from bson import SON
from django.shortcuts import render
from django.http import HttpResponse
from django.template.loader import get_template

from django.shortcuts import render, redirect
from django.views.generic.edit import FormView
from django.http import JsonResponse
from django.conf import settings
from datetime import datetime, timedelta
import logging

class user(FormView):

    template_name = "user/user.html"
    success_url = '/user.html'

    def get(self, request, *args, **kwargs):
        db = settings.MONGO_CONNECT.AccionaAgua
        plants = db.User.find({"User": "User2"}, {"_id": 0, "Plants": 1})[0]["Plants"]
        request.session['plants'] = plants
        namePlant = request.session.get('namePlant', 'error')
        if namePlant == 'error':
            request.session['namePlant'] = plants[0]
            namePlant = plants[0]
        exogenousVariables = db.Plant.find({"PlantName": namePlant},{"ExogenousVariables": 1})[0]["ExogenousVariables"]
        request.session['exogenousVariables'] = exogenousVariables
        titleMap = exogenousVariables[0]
        request.session['titleMap'] = titleMap

        lastDate = db.SatelliteData.find({"Plant": namePlant},{"_id":0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]
#       mapDate = datetime(y,m,d)
        pipeline = [
            {"$match": {"Plant": namePlant,
                        "Date": lastDate}
             },
            {
                "$group":
                    {
                        "_id": "$Date"
                    }
            }
        ]

        for var in exogenousVariables:
            pipeline[1]["$group"][("min" + var)] = {"$min": ("$" + var)}
            pipeline[1]["$group"][("max" + var)] = {"$max": ("$" + var)}
            pipeline[1]["$group"][("avg" + var)] = {"$avg": ("$" + var)}
            pipeline[1]["$group"][("std" + var)] = {"$stdDevPop": ("$" + var)}

        statisticsCursor = db.SatelliteData.aggregate(pipeline)

        statistics = []
        for element in statisticsCursor:
            for var in exogenousVariables:
                variableStatistis = [var]
                variableStatistis.append(round(element[("min" + var)], 2))
                variableStatistis.append(round(element[("max" + var)], 2))
                variableStatistis.append(round(element[("avg" + var)], 2))
                variableStatistis.append(round(element[("std" + var)], 2))
                statistics.append(variableStatistis)

        request.session['statistics'] = statistics
        endogenousVariables = db.Plant.find({"PlantName": namePlant},{"EndogenousVariables": 1})[0]["EndogenousVariables"]
        request.session['endogenousVariables'] = endogenousVariables
        date = ['03/01/18', '05/01/18', '07/01/18', 'error']
        request.session['date'] = date
        prediction = [[endogenousVariables[0], '30.84', '30.93', '30.94', '7.1%'],
            [endogenousVariables[1], '29.94', '30.04', '30.02', '7.1%'],
            [endogenousVariables[2], '61158', '61117', '61122', '6.54%'],
            [endogenousVariables[3], '61163', '61103', '61137', '6.54%'],
            [endogenousVariables[4], '1.57', '1.02', '1.09', '3.45%']]
        request.session['prediction'] = prediction
        context = {'plants': plants,
                   'namePlant': namePlant,
                   'exogenousVariables': exogenousVariables,
                   'statistics':statistics,
                   'titleMap': titleMap,
                   'endogenousVariables': endogenousVariables,
                   'date': date,
                   'prediction': prediction}
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        template = 'user.html'
        db = settings.MONGO_CONNECT.AccionaAgua

        if request.POST.get('plants', 'false') != 'false':
            request.session['namePlant'] = request.POST.get('plants', 'false')
            return redirect(template)
        elif request.POST.get('graph', 'false') == 'graph':
            response_graph = {}
            response_graph['color'] = 'blue'
            response_graph['metrics'] = ''

            lastDate = db.InternalData.find({"Plant": request.POST.get('namePlant', 'false')}, {"_id": 0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]
            startDate = lastDate - timedelta(days=10)

            pipeline = [
                {"$match": {"Plant": request.POST.get('namePlant', 'false'),
                            "Date": {"$gte": startDate, "$lte": lastDate}}
                 },
                {"$sort": SON([("Date", 1)])},
                {"$project": {"_id": 0,
                              "Date": 1,
                              request.POST.get('variableGraph', 'false'): 1}}
            ]


            graphElemente = db.InternalData.aggregate(pipeline)

            response_graph['arrayValue'] = []
            response_graph['days'] = []

            for element in graphElemente:
                response_graph['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])
                response_graph['days'].append(element["Date"].strftime('%d'))

            return JsonResponse(response_graph)
        elif request.POST.get('startMap', 'false') == 'startMap':
            endogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"EndogenousVariables": 1})[0]["EndogenousVariables"]
            response_map = {}
            response_map['latPlant'] = '25.2124580'
            response_map['lngPlant'] = '51.6402182'
            response_map['titleGraph'] = endogenousVariables[0]
            return JsonResponse(response_map)
        elif request.POST.get('drawMap', 'false') == 'drawMap':
            response_drawMapDate = {}

            lastDate = db.InternalData.find({"Plant": request.POST.get('namePlant', 'false')}, {"_id": 0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]

            data = db.SatelliteData.find({"Plant": request.POST.get('namePlant', 'false'), "Date": lastDate},
                                         {"_id": 0, "Latitude": 1, "Longitude": 1, request.POST.get('varMap', 'false'): 1})
            response_drawMapDate['lat'] = []
            response_drawMapDate['lng'] = []
            response_drawMapDate['data'] = []

            for element in data:
                response_drawMapDate['data'].append(element[request.POST.get('varMap', 'false')])
                response_drawMapDate['lat'].append(element["Latitude"])
                response_drawMapDate['lng'].append(element["Longitude"])

            pipeline = [
                {"$match": {"Plant": request.POST.get('namePlant', 'false'),
                            "Date": lastDate}
                 },
                {
                    "$group":
                        {
                            "_id": "$Date"
                        }
                }
            ]

            pipeline[1]["$group"][("min" + request.POST.get('varMap', 'false'))] = {"$min": ("$" + request.POST.get('varMap', 'false'))}
            pipeline[1]["$group"][("max" + request.POST.get('varMap', 'false'))] = {"$max": ("$" + request.POST.get('varMap', 'false'))}

            statisticsCursor = db.SatelliteData.aggregate(pipeline)

            for element in statisticsCursor:
                response_drawMapDate['min'] = round(element[("min" + request.POST.get('varMap', 'false'))], 2)
                response_drawMapDate['max'] = round(element[("max" + request.POST.get('varMap', 'false'))], 2)

            return JsonResponse(response_drawMapDate)
        elif request.POST.get('drawMapDate', 'false') == 'drawMapDate':
            response_drawMapDate = {}

            dateString = request.POST.get('dateMap', 'false')
            print(dateString)
            date = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))

            data = db.SatelliteData.find({"Plant": request.POST.get('namePlant', 'false'), "Date": date},
                                         {"_id": 0, "Latitude": 1, "Longitude": 1, request.POST.get('varMap', 'false'): 1})
            response_drawMapDate['lat'] = []
            response_drawMapDate['lng'] = []
            response_drawMapDate['data'] = []

            for element in data:
                response_drawMapDate['data'].append(element[request.POST.get('varMap', 'false')])
                response_drawMapDate['lat'].append(element["Latitude"])
                response_drawMapDate['lng'].append(element["Longitude"])

            pipeline = [
                {"$match": {"Plant": request.POST.get('namePlant', 'false'),
                            "Date": date}
                 },
                {
                    "$group":
                        {
                            "_id": "$Date"
                        }
                }
            ]

            pipeline[1]["$group"][("min" + request.POST.get('varMap', 'false'))] = {
                "$min": ("$" + request.POST.get('varMap', 'false'))}
            pipeline[1]["$group"][("max" + request.POST.get('varMap', 'false'))] = {
                "$max": ("$" + request.POST.get('varMap', 'false'))}

            statisticsCursor = db.SatelliteData.aggregate(pipeline)

            for element in statisticsCursor:
                response_drawMapDate['min'] = round(element[("min" + request.POST.get('varMap', 'false'))], 2)
                response_drawMapDate['max'] = round(element[("max" + request.POST.get('varMap', 'false'))], 2)

            return JsonResponse(response_drawMapDate)
