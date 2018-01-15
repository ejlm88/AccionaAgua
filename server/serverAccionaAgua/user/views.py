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
        exogenousSend = []
        for var in exogenousVariables:
            var = var.replace("_", " ")
            exogenousSend.append(var)
        titleMap = exogenousSend[0]

        lastDate = db.SatelliteData.find({"Plant": namePlant},{"_id":0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]
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
                myvar = var.lower()
                exogenousUnit = db.Variables.find({"ShortName": myvar})[0]["Units"]
                variableStatistis = [var + " (" + exogenousUnit + ")"]
                variableStatistis.append(round(element[("min" + var)], 2))
                variableStatistis.append(round(element[("max" + var)], 2))
                variableStatistis.append(round(element[("avg" + var)], 2))
                variableStatistis.append(round(element[("std" + var)], 2))
                statistics.append(variableStatistis)
        i = 0
        while i < len(statistics):
            statistics[i][0] = statistics[i][0].replace("_", " ")
            i = i+1
        request.session['statistics'] = statistics
        endogenousVariables = db.Plant.find({"PlantName": namePlant},{"EndogenousVariables": 1})[0]["EndogenousVariables"]
        request.session['endogenousVariables'] = endogenousVariables

        date = ['03/01/18', '05/01/18', '07/01/18', 'Error']
        request.session['date'] = date

        endogenousVariablesPre = []
        for var in endogenousVariables:
            endogenousUnit = db.Variables.find({"SourceName": var})[0]["Units"]
            endogenousVariablesPre.append(var + " (" + endogenousUnit + ")")

        print(endogenousVariablesPre)
        prediction = [[endogenousVariablesPre[0], '30.84', '30.93', '30.94', '7.1%'],
            [endogenousVariablesPre[1], '29.94', '30.04', '30.02', '7.1%'],
            [endogenousVariablesPre[2], '61158', '61117', '61122', '6.54%'],
            [endogenousVariablesPre[3], '61163', '61103', '61137', '6.54%'],
            [endogenousVariablesPre[4], '1.57', '1.02', '1.09', '3.45%']]
        request.session['prediction'] = prediction
        context = {'plants': plants,
                   'namePlant': namePlant,
                   'exogenousVariables': exogenousSend,
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
            response_map['latPlant'] = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')})[0]["PlantLatitude"]
            response_map['lngPlant'] = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')})[0]["PlantLongitude"]
            response_map['titleGraph'] = endogenousVariables[0]
            return JsonResponse(response_map)
        elif request.POST.get('drawMap', 'false') == 'drawMap':
            response_drawMapDate = {}

            lastDate = db.InternalData.find({"Plant": request.POST.get('namePlant', 'false')}, {"_id": 0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]

            response_drawMapDate['date'] = str(lastDate.year) + "/" + str(lastDate.month) + "/" + str(lastDate.day)
            varMap = request.POST.get('varMap', 'false').replace(" ", "_")
            data = db.SatelliteData.find({"Plant": request.POST.get('namePlant', 'false'), "Date": lastDate},
                                         {"_id": 0, "Latitude": 1, "Longitude": 1, varMap: 1})
            response_drawMapDate['lat'] = []
            response_drawMapDate['lng'] = []
            response_drawMapDate['data'] = []

            for element in data:
                response_drawMapDate['data'].append(element[varMap])
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

            pipeline[1]["$group"][("min" + varMap)] = {"$min": ("$" + varMap)}
            pipeline[1]["$group"][("max" + varMap)] = {"$max": ("$" + varMap)}

            statisticsCursor = db.SatelliteData.aggregate(pipeline)
            myVar = varMap.lower()
            units = db.Variables.find({"ShortName": myVar})[0]['Units']
            for element in statisticsCursor:
                response_drawMapDate['min'] = str(round(element[("min" + varMap)], 2)) + "\n" + units
                response_drawMapDate['max'] = str(round(element[("max" + varMap)], 2)) + "\n" + units

            return JsonResponse(response_drawMapDate)
        elif request.POST.get('drawMapDate', 'false') == 'drawMapDate':
            response_drawMapDate = {}

            dateString = request.POST.get('dateMap', 'false')
            date = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))

            varMap = request.POST.get('varMap', 'false').replace(" ", "_")
            data = db.SatelliteData.find({"Plant": request.POST.get('namePlant', 'false'), "Date": date},
                                         {"_id": 0, "Latitude": 1, "Longitude": 1, varMap: 1})
            response_drawMapDate['lat'] = []
            response_drawMapDate['lng'] = []
            response_drawMapDate['data'] = []

            for element in data:
                response_drawMapDate['data'].append(element[varMap])
                response_drawMapDate['lat'].append(element["Latitude"])
                response_drawMapDate['lng'].append(element["Longitude"])

            exogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"ExogenousVariables": 1})[0][
                "ExogenousVariables"]

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

            pipeline[1]["$group"][("min" + varMap)] = {
                "$min": ("$" + varMap)}
            pipeline[1]["$group"][("max" + varMap)] = {
                "$max": ("$" + varMap)}

            statisticsCursor = db.SatelliteData.aggregate(pipeline)

            for element in statisticsCursor:
                response_drawMapDate['min'] = round(element[("min" + varMap)], 2)
                response_drawMapDate['max'] = round(element[("max" + varMap)], 2)

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

            for var in exogenousVariables:
                pipeline[1]["$group"][("min" + var)] = {"$min": ("$" + var)}
                pipeline[1]["$group"][("max" + var)] = {"$max": ("$" + var)}
                pipeline[1]["$group"][("avg" + var)] = {"$avg": ("$" + var)}
                pipeline[1]["$group"][("std" + var)] = {"$stdDevPop": ("$" + var)}

            statisticsCursor = db.SatelliteData.aggregate(pipeline)

            exogenousSend = []
            for var in exogenousVariables:
                var = var.replace("_", " ")
                exogenousSend.append(var)
            response_drawMapDate['statisticsName'] = exogenousSend
            i = 0
            for element in statisticsCursor:
                for var in exogenousVariables:
                    statistics = []
                    statistics.append(str(round(element[("min" + var)], 2)))
                    statistics.append(str(round(element[("max" + var)], 2)))
                    statistics.append(str(round(element[("avg" + var)], 2)))
                    statistics.append(str(round(element[("std" + var)], 2)))
                    response_drawMapDate[exogenousSend[i]] = statistics
                    i = i + 1

            return JsonResponse(response_drawMapDate)
