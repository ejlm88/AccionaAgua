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
                if str(round(element[("min" + var)], 2)) == "nan":
                    variableStatistis.append("0")
                else:
                    variableStatistis.append(round(element[("min" + var)], 2))
                if str(round(element[("max" + var)], 2)) == "nan":
                    variableStatistis.append("0")
                else:
                    variableStatistis.append(round(element[("max" + var)], 2))
                if str(round(element[("avg" + var)], 2)) == "nan":
                    variableStatistis.append("0")
                else:
                    variableStatistis.append(round(element[("avg" + var)], 2))
                if str(round(element[("std" + var)], 2)) == "nan":
                    variableStatistis.append("0")
                else:
                    variableStatistis.append(round(element[("std" + var)], 2))
                variableStatistis.append(var)
                statistics.append(variableStatistis)
        i = 0
        while i < len(statistics):
            statistics[i][0] = statistics[i][0].replace("_", " ")
            i = i+1
        request.session['statistics'] = statistics
        endogenousVariables = db.Plant.find({"PlantName": namePlant},{"EndogenousVariables": 1})[0]["EndogenousVariables"]
        request.session['endogenousVariables'] = endogenousVariables

        date = ['01/11/18', '02/11/18', '03/11/18', 'Error']
        request.session['date'] = date

        endogenousVariablesPre = []
        for var in endogenousVariables:
            endogenousUnit = db.Variables.find({"SourceName": var})[0]["Units"]
            endogenousVariablesPre.append(var + " (" + endogenousUnit + ")")

        prediction = [[endogenousVariablesPre[0], '30.84', '30.93', '30.94', '7.1%'],
            [endogenousVariablesPre[1], '29.94', '30.04', '30.02', '7.1%'],
            [endogenousVariablesPre[2], '61158', '61117', '61122', '6.54%']]
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
            response_graph['metrics'] = request.POST.get('variableGraph', 'false')

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


            graphElement = db.InternalData.aggregate(pipeline)

            response_graph['arrayValue'] = []
            response_graph['days'] = []

            tempDate = ""
            for element in graphElement:
                response_graph['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])
                response_graph['days'].append(element["Date"].strftime('%Y%m%d'))

            varData = db.Variables.find({"Source": request.POST.get('namePlant', 'false'), "SourceName": request.POST.get('variableGraph', 'false')})

            for element in varData:
                response_graph['units'] = element['Units']
                response_graph['quartiles'] = element['Quartiles']

            response_graph['date'] = str(lastDate.year) + "-" + str(lastDate.month) + "-" + str(lastDate.day)
            return JsonResponse(response_graph)
        elif request.POST.get('startMap', 'false') == 'startMap':
            endogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"EndogenousVariables": 1})[0]["EndogenousVariables"]
            response_map = {}
            response_map['latPlant'] = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')})[0]["PlantLatitude"]
            response_map['lngPlant'] = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')})[0]["PlantLongitude"]
            response_map['titleGraph'] = endogenousVariables[0]
            return JsonResponse(response_map)
        elif request.POST.get('drawMap', 'false') == 'drawMap':
            response_drawMap = {}

            lastDate = db.InternalData.find({"Plant": request.POST.get('namePlant', 'false')}, {"_id": 0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]

            response_drawMap['date'] = str(lastDate.year) + "-" + str(lastDate.month) + "-" + str(lastDate.day)
            varMap = request.POST.get('varMap', 'false').replace(" ", "_")
            #data = db.SatelliteData.find({"Plant": request.POST.get('namePlant', 'false'), "Date": lastDate},
             #                            {"_id": 0, "Latitude": 1, "Longitude": 1, varMap: 1})
            #response_drawMapDate['lat'] = []
            #response_drawMapDate['lng'] = []
            #response_drawMapDate['data'] = []

            #for element in data:
             #   response_drawMapDate['data'].append(element[varMap])
              #  response_drawMapDate['lat'].append(element["Latitude"])
               # response_drawMapDate['lng'].append(element["Longitude"])

            data = db.RegionData.find({"PlantName": request.POST.get('namePlant', 'false'), "Date": lastDate},{"_id": 0, "RegionNumber": 1, varMap: 1})

            regionsData = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')},{"_id": 0, "RegionLatitudes": 1, "RegionLongitudes": 1})
            response_drawMap['lat'] = []
            response_drawMap['lng'] = []

            for element in regionsData:
                response_drawMap['lat'] = element["RegionLatitudes"]
                response_drawMap['lng'] = element["RegionLongitudes"]

            varData = [0.0] * len(response_drawMap['lat'])

            for i in range(0, len(response_drawMap['lat'])):
                currentRegion = data[i]['RegionNumber']
                if str(data[i][varMap]) == 'nan':
                    varData[currentRegion] = 0
                else:
                    varData[currentRegion] = data[i][varMap]

            response_drawMap['data'] = varData

            minimum = db.RegionData.find({varMap: {"$nin": ["NaN"]}}).sort([(varMap, 1)]).limit(1)[0][varMap]
            maximum = db.RegionData.find({varMap: {"$nin": ["NaN"]}}).sort([(varMap, -1)]).limit(1)[0][varMap]

            myVar = varMap.lower()
            units = db.Variables.find({"ShortName": myVar})[0]['Units']

            response_drawMap['min'] = str(round(minimum, 2))
            response_drawMap['max'] = str(round(maximum, 2))
            response_drawMap['units'] = units

            return JsonResponse(response_drawMap)
        elif request.POST.get('drawMapDate', 'false') == 'drawMapDate':
            response_drawMapDate = {}
            response_drawMapDate['date'] = request.POST.get('dateMap', 'false')
            dateString = request.POST.get('dateMap', 'false')
            date = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))

            varMap = request.POST.get('varMap', 'false').replace(" ", "_")

            data = db.RegionData.find({"PlantName": request.POST.get('namePlant', 'false'), "Date": date},{"_id": 0, "RegionNumber": 1, varMap: 1})

            regionsData = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')},
                                        {"_id": 0, "RegionLatitudes": 1, "RegionLongitudes": 1})
            response_drawMapDate['lat'] = []
            response_drawMapDate['lng'] = []

            for element in regionsData:
                response_drawMapDate['lat'] = element["RegionLatitudes"]
                response_drawMapDate['lng'] = element["RegionLongitudes"]

            varData = [0.0] * len(response_drawMapDate['lat'])

            for i in range(0, len(response_drawMapDate['lat'])):
                currentRegion = data[i]['RegionNumber']
                if str(data[i][varMap]) == 'nan':
                    varData[currentRegion] = 0
                else:
                    varData[currentRegion] = data[i][varMap]

            response_drawMapDate['data'] = varData

            minimum = db.RegionData.find({varMap: {"$nin": ["NaN"]}}).sort([(varMap, 1)]).limit(1)[0][varMap]
            maximum = db.RegionData.find({varMap: {"$nin": ["NaN"]}}).sort([(varMap, -1)]).limit(1)[0][varMap]

            if str(minimum) == 'nan':
                minimum = 0

            myVar = varMap.lower()
            units = db.Variables.find({"ShortName": myVar})[0]['Units']

            response_drawMapDate['min'] = str(round(minimum, 2))
            response_drawMapDate['max'] = str(round(maximum, 2))
            response_drawMapDate['units'] = units

            print(response_drawMapDate['data'])

            return JsonResponse(response_drawMapDate)
        elif request.POST.get('graphDate', 'false') == 'graphDate':
            response_graphDate = {}
            response_graphDate['color'] = 'blue'
            response_graphDate['metrics'] = request.POST.get('variableGraph', 'false')

            dateString = request.POST.get('dateGraph', 'false')
            date = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))

            startDate = date - timedelta(days=10)

            pipeline = [
                {"$match": {"Plant": request.POST.get('namePlant', 'false'),
                            "Date": {"$gte": startDate, "$lte": date}}
                 },
                {"$sort": SON([("Date", 1)])},
                {"$project": {"_id": 0,
                              "Date": 1,
                              request.POST.get('variableGraph', 'false'): 1}}
            ]

            graphElement = db.InternalData.aggregate(pipeline)

            response_graphDate['arrayValue'] = []
            response_graphDate['days'] = []

            tempDate = ""
            for element in graphElement:
                response_graphDate['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])
                response_graphDate['days'].append(element["Date"].strftime('%Y%m%d'))

            varData = db.Variables.find({"Source": request.POST.get('namePlant', 'false'),
                                         "SourceName": request.POST.get('variableGraph', 'false')})

            for element in varData:
                response_graphDate['units'] = element['Units']
                response_graphDate['quartiles'] = element['Quartiles']

            return JsonResponse(response_graphDate)
        elif request.POST.get('createCSV', 'false') == 'createCSV':
            dateString = request.POST.get('date', 'false')
            date = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))

            response_CSV = {}
            if request.POST.get('data', 'false') == 'statistics':

                exogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"ExogenousVariables": 1})[0]["ExogenousVariables"]

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
                listName = ['', 'Minimum', 'Maximum', 'Average', 'Standard deviation']
                response_CSV['head'] = listName
                exogenous = []
                for var in exogenousVariables:
                    exogenous.append(var)

                response_CSV['table'] = []
                i = 0
                for element in statisticsCursor:
                    for var in exogenousVariables:
                        myvar = var.lower()
                        exogenousUnit = db.Variables.find({"ShortName": myvar})[0]["Units"]
                        statistics = []
                        statistics.append(exogenous[i] + " (" + exogenousUnit + ")")
                        if str(round(element[("min" + var)], 2)) == "nan":
                            statistics.append("0")
                        else:
                            statistics.append(str(round(element[("min" + var)], 2)))
                        if str(round(element[("max" + var)], 2)) == "nan":
                            statistics.append("0")
                        else:
                            statistics.append(str(round(element[("max" + var)], 2)))
                        if str(round(element[("avg" + var)], 2)) == "nan":
                            statistics.append("0")
                        else:
                            statistics.append(str(round(element[("avg" + var)], 2)))
                        if str(round(element[("std" + var)], 2)) == "nan":
                            statistics.append("0")
                        else:
                            statistics.append(str(round(element[("std" + var)], 2)))
                        #spamreader.writerow(statistics)
                        response_CSV['table'].append(statistics)

                        i = i + 1

                response_CSV['name'] = request.POST.get('date', 'false') + request.POST.get('data', 'false') + ".csv"

            elif request.POST.get('data', 'false') == 'graph':
                print('')
            elif request.POST.get('data', 'false') == 'prediction':
                print('')

            else:
                print('')
            return JsonResponse(response_CSV)