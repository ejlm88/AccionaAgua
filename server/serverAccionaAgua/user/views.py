import csv
import os
import random

from bson import SON
from django.http import FileResponse
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

        exogenousHeadTable = ['Hormuz strait', 'Southern Shallows', 'Iran Coast', 'Bahrain Gulf']
        lastDate = db.RegionData.find({"PlantName": namePlant},{"_id":0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]

        data = list(db.RegionData.find({"PlantName": namePlant, "Date": lastDate}))

        exogenousVariablesTable = []
        exogenousVariablesSend = []

        for var in exogenousVariables:
            variableStatistis = ['NA'] * (len(data) + 1)
            myvar = var.lower()
            exogenousVariablesSend.append(myvar.replace("_", " "))
            exogenousUnit = db.Variables.find({"ShortName": myvar})[0]["Units"]
            variableStatistis[0] = var + " (" + exogenousUnit + ")"

            for element in data:
                regionNumber = int(element['RegionNumber'])
                variableStatistis[regionNumber+1] = element[myvar]
            exogenousVariablesTable.append(variableStatistis)

        i = 0
        while i < len(exogenousVariablesTable):
            exogenousVariablesTable[i][0] = exogenousVariablesTable[i][0].replace("_", " ").title()
            i = i+1
        request.session['exogenousVariablesTable'] = exogenousVariablesTable

        #Endogenous table
        endogenousVariables = db.Plant.find({"PlantName": namePlant},{"EndogenousVariables": 1})[0]["EndogenousVariables"]
        request.session['endogenousVariables'] = endogenousVariables
        request.session['endogenousVariablesAll'] = endogenousVariables

        endogenousheadTable = ['min', 'max', 'avg', lastDate.strftime('%Y-%m-%d')]
        request.session['headTable'] = endogenousheadTable

        endogenousVariablesPre = []
        for var in endogenousVariables:
            endogenousUnit = db.Variables.find({"SourceName": var})[0]["Units"]
            endogenousVariablesPre.append(var + " (" + endogenousUnit + ")")

        lastDate = db.InternalData.find({"Plant": namePlant}, {"_id": 0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]
        pipeline = [
            {"$match": {"Plant": namePlant}
             },
            {
                "$group":
                    {
                        "_id": "$Plant"
                    }
            }
        ]

        for var in endogenousVariables:
            myvar = var.lower()
            pipeline[1]["$group"][("min" + var)] = {"$min": ("$" + myvar)}
            pipeline[1]["$group"][("max" + var)] = {"$max": ("$" + myvar)}
            pipeline[1]["$group"][("avg" + var)] = {"$avg": ("$" + myvar)}

        statisticsCursor = db.InternalData.aggregate(pipeline)

        endogenousVariablesTable = []
        for element in statisticsCursor:
            for var in endogenousVariables:
                myvar = var.lower()
                endogenousUnit = db.Variables.find({"SourceName": myvar})[0]["Units"]
                variableStatistis = [var + " (" + endogenousUnit + ")"]
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
                lastValue = db.InternalData.find({"Plant": namePlant, "Date": lastDate})[0][var]
                variableStatistis.append(lastValue)
                endogenousVariablesTable.append(variableStatistis)

        i = 0
        while i < len(endogenousVariablesTable):
            endogenousVariablesTable[i][0] = endogenousVariablesTable[i][0].replace("_", " ").title()
            i = i+1
        request.session['endogenousStatistics'] = endogenousVariablesTable
        """
        Ejecutar las predicciones y leerlas de archivo csv esta por acabar
        os.system("predictive_model predict_all_variables \"" + namePlant + "\" " + lastDate.strftime('%Y/%m/%d'))

        outputsFilePath = "/disk1/model_data/" + namePlant + "/outputs.csv"


        datePrediction = [] lo he de calcular antes
        predictionVariables = []
        i = 0
        with open(outputsFilePath, newline = '') as file:
            reader = csv.reader(file)
            for row in spamreader:
                predictionVariables[i] = [row[0], row[1], row[2]]
                i = i+1


        """
        context = {'plants': plants,
                   'namePlant': namePlant,
                   'exogenousHeadTable': exogenousHeadTable,
                   'exogenousVariablesTable':exogenousVariablesTable,
                   'exogenousVariablesSend': exogenousVariablesSend,
                   #'titleMap': titleMap,
                   #'predictionVariables': predictionVariables,
                   'endogenousVariables': endogenousVariables,
                   'endogenousVariablesAll': endogenousVariables,
                   'endogenousheadTable': endogenousheadTable,
                   'endogenousVariablesTable': endogenousVariablesTable}
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        template = 'user.html'
        db = settings.MONGO_CONNECT.AccionaAgua

        if request.POST.get('plants', 'false') != 'false':
            request.session['namePlant'] = request.POST.get('plants', 'false')
            return redirect(template)
        elif request.POST.get('analytics', 'false') != 'false':
            return FileResponse(open('media/analytics.pdf', 'rb'), content_type='application/pdf')
        elif request.POST.get('graph', 'false') == 'graph':
            response_graph = {}
            response_graph['color'] = 'blue'
            response_graph['metrics'] = request.POST.get('variableGraph', 'false')

            lastDate = db.InternalData.find({"Plant": request.POST.get('namePlant', 'false')}, {"_id": 0, "Date": 1}).sort([("Date", -1)]).limit(1)[0]["Date"]
            startDate = lastDate - timedelta(days=4)

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
            response_graph['arrayPrediction'] = []
            response_graph['days'] = []


            for element in graphElement:
                response_graph['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])
                response_graph['arrayPrediction'].append(element[request.POST.get('variableGraph', 'false')])
                response_graph['days'].append(element["Date"].strftime('%Y%m%d'))

            varData = db.Variables.find({"Source": request.POST.get('namePlant', 'false'), "SourceName": request.POST.get('variableGraph', 'false')})

            for element in varData:
                response_graph['units'] = element['Units']
                response_graph['quartiles'] = element['Quartiles']

            """x = datetime.today() estas lineas son para cuando este con la base de datos actualizada al dia obtener las predicciones
            if lastDate.strftime('%Y%m%d') == x.strftime('%Y%m%d'):
                     obtener predicciones de la base de datos y anadirlos al final del array
            """
            response_graph['arrayValue'].append(response_graph['arrayValue'][1])
            response_graph['arrayPrediction'].append(random.gauss(response_graph['arrayValue'][4], 1))
            response_graph['days'].append((lastDate + timedelta(days=1)).strftime('%Y%m%d'))
            response_graph['arrayValue'].append(response_graph['arrayValue'][2])
            response_graph['arrayPrediction'].append(random.gauss(response_graph['arrayValue'][4], 1))
            response_graph['days'].append((lastDate + timedelta(days=2)).strftime('%Y%m%d'))
            response_graph['arrayValue'].append(response_graph['arrayValue'][3])
            response_graph['arrayPrediction'].append(random.gauss(response_graph['arrayValue'][4], 1))
            response_graph['days'].append((lastDate + timedelta(days=3)).strftime('%Y%m%d'))

            response_graph['date'] = str(lastDate.year) + "-" + str(lastDate.month) + "-" + str(lastDate.day)
            return JsonResponse(response_graph)
        elif request.POST.get('graphAll', 'false') == 'graphAll':
            response_graphAll = {}
            response_graphAll['color'] = 'blue'
            response_graphAll['metrics'] = request.POST.get('variableGraph', 'false')

            lastDate = datetime(2017, 10, 31)
            startDate = datetime(2017, 1, 2)

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

            response_graphAll['arrayValue'] = []
            response_graphAll['arrayPrediction'] = []
            response_graphAll['days'] = []

            for element in graphElement:
                response_graphAll['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])
                response_graphAll['arrayPrediction'].append(element[request.POST.get('variableGraph', 'false')])
                response_graphAll['days'].append(element["Date"].strftime('%Y%m%d'))

            varData = db.Variables.find({"Source": request.POST.get('namePlant', 'false'),
                                         "SourceName": request.POST.get('variableGraph', 'false')})

            for element in varData:
                response_graphAll['units'] = element['Units']
                response_graphAll['quartiles'] = element['Quartiles']
            print(response_graphAll['quartiles'])
            return JsonResponse(response_graphAll)
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
            varMap = request.POST.get('varMap', 'false').replace(" ", "_").lower()
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

            minimum = db.RegionData.find({varMap: {"$nin": ["NaN"]}}).sort([(varMap, 1)]).limit(1)[0][varMap]
            maximum = db.RegionData.find({varMap: {"$nin": ["NaN"]}}).sort([(varMap, -1)]).limit(1)[0][varMap]

            if str(minimum) == 'nan':
                minimum = 0

            varData = [0.0] * len(response_drawMap['lat'])

            for i in range(0, len(response_drawMap['lat'])):
                currentRegion = data[i]['RegionNumber']
                if str(data[i][varMap]) == "nan":
                    varData[currentRegion] = random.gauss((maximum+minimum)/2,1)
                else:
                    varData[currentRegion] = str(data[i][varMap])

            response_drawMap['data'] = varData

            myVar = varMap.lower()
            units = db.Variables.find({"ShortName": myVar})[0]['Units']

            response_drawMap['min'] = str(round(float(minimum), 2))
            response_drawMap['max'] = str(round(float(maximum), 2))
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

            minimum = db.RegionData.find({varMap: {"$nin": ["NaN"]}}).sort([(varMap, 1)]).limit(1)[0][varMap]
            maximum = db.RegionData.find({varMap: {"$nin": ["NaN"]}}).sort([(varMap, -1)]).limit(1)[0][varMap]

            if str(minimum) == 'nan':
                minimum = 0

            varData = [0.0] * len(response_drawMapDate['lat'])

            for i in range(0, len(response_drawMapDate['lat'])):
                currentRegion = data[i]['RegionNumber']
                if str(data[i][varMap]) == "nan":
                    varData[currentRegion] = random.gauss((maximum+minimum)/2,1)
                else:
                    varData[currentRegion] = str(data[i][varMap])

            response_drawMapDate['data'] = varData

            myVar = varMap.lower()
            units = db.Variables.find({"ShortName": myVar})[0]['Units']

            response_drawMapDate['min'] = str(round(float(minimum), 2))
            response_drawMapDate['max'] = str(round(float(maximum), 2))
            response_drawMapDate['units'] = units

            exogenousVariables = \
            db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"ExogenousVariables": 1})[0][
                "ExogenousVariables"]
            exogenousSend = []
            for var in exogenousVariables:
                var = var.replace("_", " ").title()
                exogenousSend.append(var)
            response_drawMapDate['exogenousSend'] = exogenousSend

            data = list(db.RegionData.find({"PlantName": request.POST.get('namePlant', 'false'), "Date": date}))

            exogenousVariablesTable = []

            for var in exogenousVariables:
                variableStatistis = ['NA'] * (len(data) + 1)
                myvar = var.lower()
                exogenousUnit = db.Variables.find({"ShortName": myvar})[0]["Units"]
                variableStatistis[0] = var + " (" + exogenousUnit + ")"
                for element in data:
                    regionNumber = int(element['RegionNumber'])
                    variableStatistis[regionNumber+1] = element[myvar]
                exogenousVariablesTable.append(variableStatistis)

            i = 0
            while i < len(exogenousVariablesTable):
                exogenousVariablesTable[i][0] = exogenousVariablesTable[i][0].replace("_", " ").title()
                i = i + 1
            response_drawMapDate['exogenousVariablesTable'] = exogenousVariablesTable
            response_drawMapDate['exogenousHeadTable'] = ['Hormuz strait', 'Southern Shallows', 'Iran Coast', 'Bahrain Gulf']

            return JsonResponse(response_drawMapDate)
        elif request.POST.get('graphDate', 'false') == 'graphDate':
            response_graphDate = {}
            response_graphDate['color'] = 'blue'
            response_graphDate['metrics'] = request.POST.get('variableGraph', 'false')

            dateString = request.POST.get('dateGraph', 'false')
            date = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))
            startDate = date - timedelta(days=4)

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
            response_graphDate['arrayPrediction'] = []
            response_graphDate['days'] = []


            for element in graphElement:
                response_graphDate['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])
                response_graphDate['arrayPrediction'].append(element[request.POST.get('variableGraph', 'false')])
                response_graphDate['days'].append(element["Date"].strftime('%Y%m%d'))

            if dateString == '2017-10-31':
                response_graphDate['arrayValue'].append(None)
                response_graphDate['arrayValue'].append(None)
                response_graphDate['arrayValue'].append(None)

            elif dateString == '2017-10-30':
                date1 = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))
                startDate1 = date + timedelta(days=1)
                pipeline = [
                    {"$match": {"Plant": request.POST.get('namePlant', 'false'),
                                "Date": {"$gte": date1, "$lte": startDate1}}
                     },
                    {"$sort": SON([("Date", 1)])},
                    {"$project": {"_id": 0,
                                  "Date": 1,
                                  request.POST.get('variableGraph', 'false'): 1}}
                ]

                graphElement1 = db.InternalData.aggregate(pipeline)
                for element in graphElement1:
                    response_graphDate['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])

                response_graphDate['arrayValue'].append(None)
                response_graphDate['arrayValue'].append(None)

            elif dateString == '2017-10-29':
                date2 = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))
                startDate2 = date + timedelta(days=2)
                pipeline = [
                    {"$match": {"Plant": request.POST.get('namePlant', 'false'),
                                "Date": {"$gte": date2, "$lte": startDate2}}
                     },
                    {"$sort": SON([("Date", 1)])},
                    {"$project": {"_id": 0,
                                  "Date": 1,
                                  request.POST.get('variableGraph', 'false'): 1}}
                ]

                graphElement2 = db.InternalData.aggregate(pipeline)
                for element in graphElement2:
                    response_graphDate['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])

                response_graphDate['arrayValue'].append(None)

            else:
                date3 = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))
                startDate3 = date + timedelta(days=3)
                pipeline = [
                    {"$match": {"Plant": request.POST.get('namePlant', 'false'),
                                "Date": {"$gte": date3, "$lte": startDate3}}
                     },
                    {"$sort": SON([("Date", 1)])},
                    {"$project": {"_id": 0,
                                  "Date": 1,
                                  request.POST.get('variableGraph', 'false'): 1}}
                ]

                graphElement3 = db.InternalData.aggregate(pipeline)
                for element in graphElement3:
                    response_graphDate['arrayValue'].append(element[request.POST.get('variableGraph', 'false')])

            varData = db.Variables.find({"Source": request.POST.get('namePlant', 'false'), "SourceName": request.POST.get('variableGraph', 'false')})

            for element in varData:
                response_graphDate['units'] = element['Units']
                response_graphDate['quartiles'] = element['Quartiles']

            """x = datetime.today() estas lineas son para cuando este con la base de datos actualizada al dia obtener las predicciones
                        if lastDate.strftime('%Y%m%d') == x.strftime('%Y%m%d'):
                                 obtener predicciones de la base de datos y anadirlos al final del array
                        """

            response_graphDate['arrayValue'].append(response_graphDate['arrayValue'][1])
            response_graphDate['arrayPrediction'].append(random.gauss(response_graphDate['arrayValue'][4], 1))
            response_graphDate['days'].append((date + timedelta(days=1)).strftime('%Y%m%d'))
            response_graphDate['arrayValue'].append(response_graphDate['arrayValue'][2])
            response_graphDate['arrayPrediction'].append(random.gauss(response_graphDate['arrayValue'][4], 1))
            response_graphDate['days'].append((date + timedelta(days=2)).strftime('%Y%m%d'))
            response_graphDate['arrayValue'].append(response_graphDate['arrayValue'][3])
            response_graphDate['arrayPrediction'].append(random.gauss(response_graphDate['arrayValue'][4], 1))
            response_graphDate['days'].append((date + timedelta(days=3)).strftime('%Y%m%d'))

            #####

            endogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"EndogenousVariables": 1})[0][
                "EndogenousVariables"]

            endogenousDateTable =  date.strftime('%Y-%m-%d')
            response_graphDate['endogenousDateTable'] = endogenousDateTable

            endogenousVariablesTable = []
            for var in endogenousVariables:
                myvar = var.lower()
                endogenousUnit = db.Variables.find({"SourceName": myvar})[0]["Units"]
                variableStatistis = [var + " (" + endogenousUnit + ")"]
                lastValue = db.InternalData.find({"Plant": request.POST.get('namePlant', 'false'), "Date": date})[0][var]
                variableStatistis.append(lastValue)
                endogenousVariablesTable.append(variableStatistis)

            i = 0
            while i < len(endogenousVariablesTable):
                endogenousVariablesTable[i][0] = endogenousVariablesTable[i][0].replace("_", " ").title()
                i = i + 1
            response_graphDate['endogenousDataTable'] = endogenousVariablesTable

            return JsonResponse(response_graphDate)
        elif request.POST.get('createCSV', 'false') == 'createCSV':
            dateString = request.POST.get('date', 'false')
            date = datetime(int(dateString[0:4]), int(dateString[5:7]), int(dateString[8:10]))

            response_CSV = {}
            if request.POST.get('data', 'false') == 'exogenous':
                exogenousVariables = \
                db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"ExogenousVariables": 1})[0][
                    "ExogenousVariables"]
                exogenousSend = []
                for var in exogenousVariables:
                    var = var.replace("_", " ")
                    exogenousSend.append(var)
                titleMap = exogenousSend[0]

                exogenousHeadTable = ['', 'Hormuz strait', 'Southern Shallows', 'Iran Coast', 'Bahrain Gulf']

                response_CSV['head'] = exogenousHeadTable

                data = list(db.RegionData.find({"PlantName": request.POST.get('namePlant', 'false'), "Date": date}))

                exogenousVariablesTable = []
                exogenousVariablesSend = []

                for var in exogenousVariables:
                    variableStatistis = ['NA'] * (len(data) + 1)
                    myvar = var.lower()
                    exogenousVariablesSend.append(myvar.replace("_", " "))
                    exogenousUnit = db.Variables.find({"ShortName": myvar})[0]["Units"]
                    variableStatistis[0] = var + " (" + exogenousUnit + ")"

                    for element in data:
                        regionNumber = int(element['RegionNumber'])
                        variableStatistis[regionNumber + 1] = element[myvar]
                    exogenousVariablesTable.append(variableStatistis)

                i = 0
                while i < len(exogenousVariablesTable):
                    exogenousVariablesTable[i][0] = exogenousVariablesTable[i][0].replace("_", " ").title()
                    i = i + 1

                response_CSV['table'] = exogenousVariablesTable

            elif request.POST.get('data', 'false') == 'endogenous':
                endogenousVariables = db.Plant.find({"PlantName": request.POST.get('namePlant', 'false')}, {"EndogenousVariables": 1})[0][
                    "EndogenousVariables"]
                request.session['endogenousVariables'] = endogenousVariables
                request.session['endogenousVariablesAll'] = endogenousVariables

                endogenousheadTable = ['', 'min', 'max', 'avg', date.strftime('%Y-%m-%d')]
                response_CSV['head'] = endogenousheadTable

                endogenousVariablesPre = []
                for var in endogenousVariables:
                    endogenousUnit = db.Variables.find({"SourceName": var})[0]["Units"]
                    endogenousVariablesPre.append(var + " (" + endogenousUnit + ")")

                pipeline = [
                    {"$match": {"Plant": request.POST.get('namePlant', 'false')}
                     },
                    {
                        "$group":
                            {
                                "_id": "$Plant"
                            }
                    }
                ]

                for var in endogenousVariables:
                    myvar = var.lower()
                    pipeline[1]["$group"][("min" + var)] = {"$min": ("$" + myvar)}
                    pipeline[1]["$group"][("max" + var)] = {"$max": ("$" + myvar)}
                    pipeline[1]["$group"][("avg" + var)] = {"$avg": ("$" + myvar)}

                statisticsCursor = db.InternalData.aggregate(pipeline)

                endogenousVariablesTable = []
                for element in statisticsCursor:
                    for var in endogenousVariables:
                        myvar = var.lower()
                        endogenousUnit = db.Variables.find({"SourceName": myvar})[0]["Units"]
                        variableStatistis = [var + " (" + endogenousUnit + ")"]
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
                        lastValue = db.InternalData.find({"Plant": request.POST.get('namePlant', 'false'), "Date": date})[0][var]
                        variableStatistis.append(lastValue)
                        endogenousVariablesTable.append(variableStatistis)

                i = 0
                while i < len(endogenousVariablesTable):
                    endogenousVariablesTable[i][0] = endogenousVariablesTable[i][0].replace("_", " ").title()
                    i = i + 1
                response_CSV['table'] = endogenousVariablesTable

            elif request.POST.get('data', 'false') == 'prediction':
                print('')

            else:
                print('')
            response_CSV['name'] = request.POST.get('date', 'false') + request.POST.get('data', 'false') + ".csv"
            return JsonResponse(response_CSV)