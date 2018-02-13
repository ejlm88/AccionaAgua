var code1 = new Array();
var map, heatmap;
var pointArray;
var type;
var res;
var date = new Date;
var latPlant;
var lngPlant;
var dataGraph;
var tempData = [];
var polygon = [];
var tipObj = null;
var offset = {
    x: 20,
    y: 20
};
var latPolygon = [];
var lngPolygon = [];

function drawGraphInit(variableGraph){
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'graph': 'graph',
                'variableGraph': variableGraph.toLowerCase(),
                'namePlant': document.getElementById("title-name-plant-user").innerHTML.replace("Settings ", "")},
            error: function (response) { 
                alert("Error starting the graph.");
            },
            success: function (response) { 

                var metrics = response['metrics'];
                var arrayValue = response['arrayValue'];
                var color = response['color'];
                var days = response['days'];

                var dataGraph = new google.visualization.DataTable();
                var arrayData = [];
                var dateString = new Date().toISOString().substr(0,4) + new Date().toISOString().substr(5,2) + new Date().toISOString().substr(8,2);
    
                var i = 0;
                //if(dateString == days[4]){ these lines are for when this with the database updated to the day get the predictions
                if('20171031' == days[4]){
                    dataGraph.addColumn('date', 'X');
                    dataGraph.addColumn('number', 'prediction');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', variableGraph);
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilMax');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilInf');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    for(i = 0; i < days.length; i++){
                        if(i == 4){
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                        }else if( i == 5 || i == 6 || i == 7){
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, null, null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                        }else if( i == 0){
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                        }
                        else{
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                        }
                    }
                    
                    dataGraph.addRows(arrayData);

                    var options = {
                        colors: ['green', color, 'orange', 'orange'],
                        hAxis: {
                            title: 'Date',
                            ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[2].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[3].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[4].substr(4,2))-1), days[4].substr(6,2)), new Date(days[5].substr(0,4), (parseInt(days[5].substr(4,2))-1), days[5].substr(6,2)), new Date(days[6].substr(0,4), (parseInt(days[6].substr(4,2))-1), days[6].substr(6,2)), new Date(days[7].substr(0,4), (parseInt(days[7].substr(4,2))-1), days[7].substr(6,2))]
                        },
                        vAxis: {
                            title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                            viewWindow: {
                              min: response['quartiles'][0],
                              max: response['quartiles'][4]
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'linear',
                            startup: true
                        },
                        series: {
                            2: { lineDashStyle: [4, 4] },
                            3: { lineDashStyle: [4, 4] }
                        },
                        pointSize: 0,
                        legend: {
                            position: 'bottom'
                        }
                    };
                }
                var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

                chart.draw(dataGraph, options);
            
                if(parseFloat(response['quartiles'][1]) >= parseFloat(arrayValue[4])){
                    document.getElementById("information-graph-user").innerHTML= "<span class=\"glyphicon glyphicon-warning-sign\"></span>" + " The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is low.";
                    
                    
                } else if(parseFloat(response['quartiles'][3]) <= parseFloat(arrayValue[4])){
                    document.getElementById("information-graph-user").innerHTML=  "<span class=\"glyphicon glyphicon-warning-sign\"></span>" + " The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is high.";
                    
                } else{
                    document.getElementById("information-graph-user").innerHTML= "The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is normal.";
                    
                }
                
                drawGraphAllInit(variableGraph);
            }
        });
    });
}

function drawGraphAllInit(variableGraph){
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'graphAll': 'graphAll',
                'variableGraph': variableGraph.toLowerCase(),
                'namePlant': document.getElementById("title-name-plant-user").innerHTML.replace("Settings ", "")},
            error: function (response) { 
                alert("Error starting the graph All.");
            },
            success: function (response) { 

                var metrics = response['metrics'];
                var arrayValue = response['arrayValue'];
                var color = response['color'];
                var days = response['days'];

                var dataGraph = new google.visualization.DataTable();
                var arrayData = [];
                var arrayTicks = [];

                var i = 0;
               
                dataGraph.addColumn('date', 'X');
                dataGraph.addColumn('number', variableGraph);
                dataGraph.addColumn('number', 'QuartilMax');
                dataGraph.addColumn({type: 'string', role: 'annotation'});
                dataGraph.addColumn('number', 'QuartilInf');
                dataGraph.addColumn({type: 'string', role: 'annotation'});
                for(i = 0; i < days.length; i++){
                    if(i == 0){
                        arrayTicks.push(new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)));
                        arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']); 
                    }else if((parseInt(days[i].substr(4,2))-1) != (parseInt(days[(i - 1)].substr(4,2))-1)){
                        arrayTicks.push(new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)));
                        arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]); 
                    } else{
                        arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]); 
                    }
                }

                dataGraph.addRows(arrayData);

                var options = {
                    colors: [color, 'orange', 'orange'],
                    hAxis: {
                        title: 'Date',
                        ticks: arrayTicks
                        },
                    vAxis: {
                        title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                        viewWindow: {
                          min: response['quartiles'][0],
                          max: response['quartiles'][4]
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'linear',
                        startup: true
                    },
                    series: {
                        1: { lineDashStyle: [4, 4] },
                        2: { lineDashStyle: [4, 4] }
                    },
                    pointSize: 0,
                    legend: {
                        position: 'bottom'
                    }
                };
                var chart = new google.visualization.LineChart(document.getElementById("graph-all-user"));

                chart.draw(dataGraph, options);
            }
        });
    });
}

function drawMapInit(titleGraph) {
    var varMap = document.getElementById('table-button-exogenous-user').innerHTML.replace(" <span class=\"caret\"></span>",""); 
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'drawMap': 'drawMap',
                'varMap': varMap.toLowerCase(),
                'namePlant': document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "")},
            error: function (response) { 
                alert("Error starting the.");
            },
            success: function (response) { 
                document.getElementById("title-map-user-acciona").innerHTML = varMap + ' ' + response['date'];
                document.getElementById("legend-ini-user").innerHTML = response['min'] + ' ' + response['units'];
                document.getElementById("legend-end-user").innerHTML = response['max'] + ' ' + response['units'];
                $("#date-map-user").val(response['date']);
                
                var i; 
                var data = 0;
                 
                var red = 0;
                var blue = 0;
                
                for(i = 0; i < response['lat'].length; i++){
                    var coords = [
                      {lat: parseFloat(response['lat'][i][0]), lng: parseFloat(response['lng'][i][0])}, 
                      {lat: parseFloat(response['lat'][i][1]), lng: parseFloat(response['lng'][i][0])}, 
                      {lat: parseFloat(response['lat'][i][1]), lng: parseFloat(response['lng'][i][1])}, 
                      {lat: parseFloat(response['lat'][i][0]), lng: parseFloat(response['lng'][i][1])} 
                    ];
                    
                    if(parseFloat(response['lat'][i][0]) > parseFloat(response['lat'][i][1])){
                        latPolygon.push([parseFloat(response['lat'][i][0]), parseFloat(response['lat'][i][1])]);
                        
                    }else{
                        latPolygon.push([parseFloat(response['lat'][i][1]), parseFloat(response['lat'][i][0])]);              
                    }
                    
                    if(parseFloat(response['lng'][i][0]) > parseFloat(response['lng'][i][1])){
                        lngPolygon.push([parseFloat(response['lng'][i][0]), parseFloat(response['lng'][i][1])]);
                        
                    }else{
                        lngPolygon.push([parseFloat(response['lng'][i][1]), parseFloat(response['lng'][i][0])]);              
                    }

                    if(response['data'][i] != 'nan'){                        
                        var color = 240 * (1 - (parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min'])));
                        
                        var hsl = {
                            h: color,
                            s: 100,
                            l: 50
                        };
                        var myHslColor = Color( hsl );
                        
                    }else{
                        myHslColor = '#000000';
                        
                    }
                    
                    polygon[i] = new google.maps.Polygon({
                      paths: coords,
                      strokeColor: 'RGB(256,0,0)',
                      strokeOpacity: 0,
                      strokeWeight: 1,
                      fillColor: myHslColor,
                      fillOpacity: 0.5,
                      text : response['zone'][i] + ":<br>" + varMap + "<br>" + parseFloat(response['data'][i]).toFixed(2) + " (" + response['units'] + ")"
                    });
                    
                    var temp = i;
                    google.maps.event.addListener(polygon[i], 'mouseover', function (e) {
                        var j = 0;
                        var ind = 0;
                        while(j <= temp){
                            if(parseFloat(e.latLng.lat()) > latPolygon[j][1] && parseFloat(e.latLng.lat()) < latPolygon[j][0] && lngPolygon[j][1] < parseFloat(e.latLng.lng()) && lngPolygon[j][0] > parseFloat(e.latLng.lng())){
                                ind = j;
                                j = temp + 1;
                            }
                            j++;
                        }
                        injectTooltip(e, polygon[ind].text);
                    });

                    google.maps.event.addListener(polygon[i], 'mousemove', function (e) {
                        moveTooltip(e);
                    });

                    google.maps.event.addListener(polygon[i], 'mouseout', function (e) {
                        deleteTooltip(e);
                    });
                    
                    polygon[i].setMap(map);
                }
                
                drawGraphInit(titleGraph);
            }
        });

    });
}

function initMap() {
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            headers: {'Access-Control-Allow-Origin': '*'},
            data: {'startMap': 'startMap',
                  'namePlant': document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "")},
            error: function (response) { 
                alert("Error starting the map.");
            },
            success: function (response) {
                latPlant = response['latPlant'];
                lngPlant = response['lngPlant'];
                var titleGraph = response['titleGraph'];

                var center = new google.maps.LatLng(parseFloat(25.934356), parseFloat(53.312975));
                if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    map = new google.maps.Map(document.getElementById('map-user'), {
                        zoom: 6,
                        center: center
                    });
                }else {
                    map = new google.maps.Map(document.getElementById('map-user'), {
                        zoom: 7,
                        center: center
                    });
                }

                var contentString = '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h6 id="firstHeading" class="firstHeading">' + document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "") + '</h6>' +
                    '</div>';

                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                var marker = new google.maps.Marker({
                    position: {lat: parseFloat(latPlant), lng: parseFloat(lngPlant)},
                    map: map
                });

                marker.addListener('click', function() {
                    infowindow.open(map, marker);
                });

                
                setLegendGradientBlue();
                
                drawMapInit(titleGraph);
            }
        });
    });
} 

function drawMap(value) {
    var dateMap1 = document.getElementById('date-map-user').value;
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'drawMapDate': 'drawMapDate',
                'varMap': value.toLowerCase(),
                'dateMap': dateMap1,
                'namePlant': document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "")},
            error: function (response) { 
                alert('error');
            },
            success: function (response) { 
                document.getElementById("legend-ini-user").innerHTML = response['min'] + ' ' + response['units'];
                document.getElementById("legend-end-user").innerHTML = response['max'] + ' ' + response['units'];
                document.getElementById("table-button-exogenous-user").innerHTML = value + " <span class=\"caret\"></span>";
                document.getElementById("title-map-user-acciona").innerHTML = value + ' ' + dateMap1;
                
                var i; 
                var data = 0;
                 
                var red = 0;
                var blue = 0;
                
                for(i = 0; i < response['lat'].length; i++){
                    polygon[i].setMap(null);
                    var coords = [
                      {lat: parseFloat(response['lat'][i][0]), lng: parseFloat(response['lng'][i][0])}, 
                      {lat: parseFloat(response['lat'][i][1]), lng: parseFloat(response['lng'][i][0])}, 
                      {lat: parseFloat(response['lat'][i][1]), lng: parseFloat(response['lng'][i][1])}, 
                      {lat: parseFloat(response['lat'][i][0]), lng: parseFloat(response['lng'][i][1])} 
                    ];
                    
                    if(response['data'][i] != 'nan'){                        
                        var color = 240 * (1 - (parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min'])));
                        
                        var hsl = {
                            h: color,
                            s: 100,
                            l: 50
                        };
                        var myHslColor = Color( hsl );
                        
                    }else{
                        myHslColor = '#000000';
                        
                    }
                    
                    polygon[i] = new google.maps.Polygon({
                      paths: coords,
                      strokeColor: 'RGB(256,0,0)',
                      strokeOpacity: 0,
                      strokeWeight: 1,
                      fillColor: myHslColor,
                      fillOpacity: 0.5,
                      text : response['zone'][i] + ":<br>" + value + "<br>" + parseFloat(response['data'][i]).toFixed(2) + " (" + response['units'] + ")"
                    });
                    
                    var temp = i;
                    google.maps.event.addListener(polygon[i], 'mouseover', function (e) {
                        var j = 0;
                        var ind = 0;
                        while(j <= temp){
                            if(parseFloat(e.latLng.lat()) > latPolygon[j][1] && parseFloat(e.latLng.lat()) < latPolygon[j][0] && lngPolygon[j][1] < parseFloat(e.latLng.lng()) && lngPolygon[j][0] > parseFloat(e.latLng.lng())){
                                ind = j;
                                j = temp + 1;
                            }
                            j++;
                        }
                        injectTooltip(e, polygon[ind].text);
                    });

                    google.maps.event.addListener(polygon[i], 'mousemove', function (e) {
                        moveTooltip(e);
                    });

                    google.maps.event.addListener(polygon[i], 'mouseout', function (e) {
                        deleteTooltip(e);
                    });
                    
                    polygon[i].setMap(map);
                }
                
                setLegendGradientBlue();
            }
        });

    });
}

function datePush(){
    var dateMap = document.getElementById('date-map-user').value;
    var varMap = document.getElementById('table-button-exogenous-user').innerHTML.replace(" <span class=\"caret\"></span>","");
    $.ajax({                           
        url: "http://192.168.136.131/acciona/user",
        type: "POST",
        data: {'drawMapDate': 'drawMapDate',
            'dateMap': dateMap,
            'varMap': varMap.toLowerCase(),
            'namePlant': document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "")},
        error: function (response) { 
            alert("Please select a date.");
        },
        success: function (response) { 
            document.getElementById("exogenous-date-user").innerHTML = "Exogenous variables " + document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "") + " " + dateMap;
            document.getElementById("title-map-user-acciona").innerHTML = varMap + ' ' + dateMap;
            document.getElementById("legend-ini-user").innerHTML = response['min'] + ' ' + response['units'];
            document.getElementById("legend-end-user").innerHTML = response['max'] + ' ' + response['units']; 
                
            var i; 
            var data = 0;

            var red = 0;
            var blue = 0;

            for(i = 0; i < response['lat'].length; i++){
                polygon[i].setMap(null);
                var coords = [
                  {lat: parseFloat(response['lat'][i][0]), lng: parseFloat(response['lng'][i][0])}, 
                  {lat: parseFloat(response['lat'][i][1]), lng: parseFloat(response['lng'][i][0])}, 
                  {lat: parseFloat(response['lat'][i][1]), lng: parseFloat(response['lng'][i][1])}, 
                  {lat: parseFloat(response['lat'][i][0]), lng: parseFloat(response['lng'][i][1])} 
                ];

                if(response['data'][i] != 'nan'){                        
                    var color = 240 * (1 - (parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min'])));

                    var hsl = {
                        h: color,
                        s: 100,
                        l: 50
                    };
                    var myHslColor = Color( hsl );

                }else{
                    myHslColor = '#000000';

                }

                polygon[i] = new google.maps.Polygon({
                  paths: coords,
                  strokeColor: 'RGB(256,0,0)',
                  strokeOpacity: 0,
                  strokeWeight: 1,
                  fillColor: myHslColor,
                  fillOpacity: 0.5,
                  text : response['zone'][i] + ":<br>" + varMap + "<br>" + parseFloat(response['data'][i]).toFixed(2) + " (" + response['units'] + ")"
                });
                    
                var temp = i;
                google.maps.event.addListener(polygon[i], 'mouseover', function (e) {
                    var j = 0;
                    var ind = 0;
                    while(j <= temp){
                        if(parseFloat(e.latLng.lat()) > latPolygon[j][1] && parseFloat(e.latLng.lat()) < latPolygon[j][0] && lngPolygon[j][1] < parseFloat(e.latLng.lng()) && lngPolygon[j][0] > parseFloat(e.latLng.lng())){
                            ind = j;
                            j = temp + 1;
                        }
                        j++;
                    }
                    injectTooltip(e, polygon[ind].text);
                });

                google.maps.event.addListener(polygon[i], 'mousemove', function (e) {
                    moveTooltip(e);
                });

                google.maps.event.addListener(polygon[i], 'mouseout', function (e) {
                    deleteTooltip(e);
                });
                
                polygon[i].setMap(map);
            }
            
            setLegendGradientBlue();

            for(i = 0; i < response['exogenousSend'].length; i++){
                document.getElementById('p1' + response['exogenousVariablesName'][i]).innerHTML = response['exogenousVariablesTable'][i][1];
                document.getElementById('p2' + response['exogenousVariablesName'][i]).innerHTML = response['exogenousVariablesTable'][i][2];
                document.getElementById('p3' + response['exogenousVariablesName'][i]).innerHTML = response['exogenousVariablesTable'][i][3];
                document.getElementById('p4' + response['exogenousVariablesName'][i]).innerHTML = response['exogenousVariablesTable'][i][4];
            }
            
            var variableGraph = document.getElementById('table-button-endogenous-user').innerHTML.replace(" <span class=\"caret\"></span>","");
            $.ajax({                           
                url: "http://192.168.136.131/acciona/user",
                type: "POST",
                data: {'graphDate': 'graphDate',
                    'dateGraph': dateMap,
                    'variableGraph': variableGraph.toLowerCase(),
                    'namePlant': document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "")},
                error: function (response) { 
                    alert("Please select a date.");
                },
                success: function (response) { 
                    document.getElementById("predictive-user").innerHTML = variableGraph + " " + dateMap;
                    document.getElementById("endogenous-prediction-user").innerHTML = "Endogenous variables predictions " + dateMap;
                    document.getElementById('endogenousDateTable').innerHTML = response['endogenousDateTable'];
                    for(i = 0; i < response['endogenousDataTable'].length; i++){
                        document.getElementById('endogenousDataTable' + response['endogenousDataTable'][i][2]).innerHTML = response['endogenousDataTable'][i][1];
                    }

                    document.getElementById('tablePrediction1').innerHTML = response['dateTablePrediction'][0];
                    document.getElementById('tablePrediction2').innerHTML = response['dateTablePrediction'][1];
                    document.getElementById('tablePrediction3').innerHTML = response['dateTablePrediction'][2];
                    
                    for(i = 0; i < response['dataPrediction'].length; i++){
                        document.getElementById('1' + response['dataPrediction'][i][0]).innerHTML = response['dataPrediction'][i][1];
                        document.getElementById('2' + response['dataPrediction'][i][0]).innerHTML = response['dataPrediction'][(i+1)][1];
                        document.getElementById('3' + response['dataPrediction'][i][0]).innerHTML = response['dataPrediction'][(i+2)][1];
                        i = i + 2;
                    }
                    
                    var metrics = response['metrics'];
                    var arrayValue = response['arrayValue'];
                    var color = response['color'];
                    var days = response['days'];

                    var dataGraph = new google.visualization.DataTable();
                    var arrayData = [];
                    var dateString = new Date().toISOString().substr(0,4) + new Date().toISOString().substr(5,2) + new Date().toISOString().substr(8,2);

                    var i = 0;
                    //if(dateString == days[4]){ these lines are for when this with the database updated to the day get the predictions
                    if(i == 0){
                        dataGraph.addColumn('date', 'X');
                        dataGraph.addColumn('number', 'prediction');
                        if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10'){
                            if(days[4].substr(6,2) == '31' || days[4].substr(6,2) == '30' || days[4].substr(6,2) == '29'){
                                dataGraph.addColumn({type: 'string', role: 'annotation'});
                            }
                        }
                        dataGraph.addColumn('number', variableGraph);
                        dataGraph.addColumn({type: 'string', role: 'annotation'});
                        dataGraph.addColumn('number', 'QuartilMax');
                        dataGraph.addColumn({type: 'string', role: 'annotation'});
                        dataGraph.addColumn('number', 'QuartilInf');
                        dataGraph.addColumn({type: 'string', role: 'annotation'});
                        if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '31'){
                            for(i = 0; i < days.length; i++){
                                if(i == 4){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }else if( i == 5 || i == 6 || i == 7){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }else if( i == 0){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                                }
                                else{
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }
                            }
                        }else if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '30'){
                             for(i = 0; i < days.length; i++){
                                if(i == 4){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }else if(i == 6 || i == 7){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }else if( i == 0){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                                }else if(i == 5){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }
                                else{
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }
                            }

                        }else if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '29'){
                            for(i = 0; i < days.length; i++){
                                if(i == 4){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }else if(i == 5 || i == 7){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }else if( i == 0){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                                }else if(i == 6){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }
                                else{
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }
                            }

                        }else {
                            for(i = 0; i < days.length; i++){
                                if(i == 4){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }else if( i == 5 || i == 6 || i == 7){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }else if( i == 0){
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                                }
                                else{
                                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                                }
                            }
                        }

                        dataGraph.addRows(arrayData);

                        var options = {
                            colors: ['green', color, 'orange', 'orange'],
                            hAxis: {
                                title: 'Date',
                                ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[2].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[3].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[4].substr(4,2))-1), days[4].substr(6,2)), new Date(days[5].substr(0,4), (parseInt(days[5].substr(4,2))-1), days[5].substr(6,2)), new Date(days[6].substr(0,4), (parseInt(days[6].substr(4,2))-1), days[6].substr(6,2)), new Date(days[7].substr(0,4), (parseInt(days[7].substr(4,2))-1), days[7].substr(6,2))]
                            },
                            vAxis: {
                                title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                                viewWindow: {
                                  min: response['quartiles'][0],
                                  max: response['quartiles'][4]
                                }
                            },
                            animation: {
                                duration: 2000,
                                easing: 'linear',
                                startup: true
                            },
                            series: {
                                2: { lineDashStyle: [4, 4] },
                                3: { lineDashStyle: [4, 4] }
                            },
                            pointSize: 0,
                            legend: {
                                position: 'bottom'
                            }
                        };
                    }else{
                        dataGraph.addColumn('date', 'X');
                        dataGraph.addColumn('number', variableGraph);
                        dataGraph.addColumn({type: 'string', role: 'annotation'});
                        dataGraph.addColumn('number', 'QuartilMax');
                        dataGraph.addColumn({type: 'string', role: 'annotation'});
                        dataGraph.addColumn('number', 'QuartilInf');
                        dataGraph.addColumn({type: 'string', role: 'annotation'});
                        for(i = 0; i < days.length; i++){
                            if(i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '75%', parseFloat(response['quartiles'][3]), '25%']);
                            }else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]); 
                            }
                        }

                        dataGraph.addRows(arrayData);

                        var options = {
                            colors: [color, 'orange', 'orange'],
                            hAxis: {
                                title: 'Date',
                                ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[2].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[3].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[4].substr(4,2))-1), days[4].substr(6,2))]
                                },
                            vAxis: {
                                title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                                viewWindow: {
                                  min: response['quartiles'][0],
                                  max: response['quartiles'][4]
                                }
                            },
                            animation: {
                                duration: 2000,
                                easing: 'linear',
                                startup: true
                            },
                            series: {
                                1: { lineDashStyle: [4, 4] },
                                2: { lineDashStyle: [4, 4] }
                            },
                            pointSize: 0,
                            legend: {
                                position: 'bottom'
                            }
                        };
                    }
                    var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

                    chart.draw(dataGraph, options);

                    if(parseFloat(response['quartiles'][1]) >= parseFloat(arrayValue[4])){
                        document.getElementById("information-graph-user").innerHTML= "<span class=\"glyphicon glyphicon-warning-sign\"></span>" + " The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is low.";


                    } else if(parseFloat(response['quartiles'][3]) <= parseFloat(arrayValue[4])){
                        document.getElementById("information-graph-user").innerHTML= "<span class=\"glyphicon glyphicon-warning-sign\"></span>" + " The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is high.";

                    } else{
                        document.getElementById("information-graph-user").innerHTML= "The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is normal.";

                    }
                }
            });
        }
    });
};

function drawGraph(variableGraph){
    var dateGraph = document.getElementById('date-map-user').value;
    jQuery(function(){
        $.ajax({
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'graphDate': 'graphDate',
                'dateGraph': dateGraph,
                'variableGraph': variableGraph.toLowerCase(),
                'namePlant': document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "")},
            error: function (response) { 
                alert("Please select a date.");
            },
            success: function (response) { 
                document.getElementById("predictive-user").innerHTML = variableGraph + " " + dateGraph;
                var metrics = response['metrics'];
                var arrayValue = response['arrayValue'];
                var color = response['color'];
                var days = response['days'];
                document.getElementById("table-button-endogenous-user").innerHTML = variableGraph + " <span class=\"caret\"></span>";

                var dataGraph = new google.visualization.DataTable();
                var arrayData = [];
                var dateString = new Date().toISOString().substr(0,4) + new Date().toISOString().substr(5,2) + new Date().toISOString().substr(8,2);
    
                var i = 0;
                //if(dateString == days[4]){ these lines are for when this with the database updated to the day get the predictions
                if(i == 0){
                    dataGraph.addColumn('date', 'X');
                    dataGraph.addColumn('number', 'prediction');
                    if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10'){
                        if(days[4].substr(6,2) == '31' || days[4].substr(6,2) == '30' || days[4].substr(6,2) == '29'){
                            dataGraph.addColumn({type: 'string', role: 'annotation'});
                        }
                    }
                    dataGraph.addColumn('number', variableGraph);
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilMax');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilInf');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '31'){
                        for(i = 0; i < days.length; i++){
                            if(i == 4){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 5 || i == 6 || i == 7){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                            }
                            else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                        }
                    }else if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '30'){
                         for(i = 0; i < days.length; i++){
                            if(i == 4){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if(i == 6 || i == 7){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                            }else if(i == 5){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                            else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                        }

                    }else if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '29'){
                        for(i = 0; i < days.length; i++){
                            if(i == 4){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if(i == 5 || i == 7){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                            }else if(i == 6){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                            else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                        }

                    }else {
                        for(i = 0; i < days.length; i++){
                            if(i == 4){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 5 || i == 6 || i == 7){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                            }
                            else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                        }
                    }
                    
                    dataGraph.addRows(arrayData);

                    var options = {
                        colors: ['green', color, 'orange', 'orange'],
                        hAxis: {
                            title: 'Date',
                            ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[2].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[3].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[4].substr(4,2))-1), days[4].substr(6,2)), new Date(days[5].substr(0,4), (parseInt(days[5].substr(4,2))-1), days[5].substr(6,2)), new Date(days[6].substr(0,4), (parseInt(days[6].substr(4,2))-1), days[6].substr(6,2)), new Date(days[7].substr(0,4), (parseInt(days[7].substr(4,2))-1), days[7].substr(6,2))]
                        },
                        vAxis: {
                            title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                            viewWindow: {
                              min: response['quartiles'][0],
                              max: response['quartiles'][4]
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'linear',
                            startup: true
                        },
                        series: {
                            2: { lineDashStyle: [4, 4] },
                            3: { lineDashStyle: [4, 4] }
                        },
                        pointSize: 0,
                        legend: {
                            position: 'bottom'
                        }
                    };
                }else{
                    dataGraph.addColumn('date', 'X');
                    dataGraph.addColumn('number', variableGraph);
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilMax');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilInf');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    for(i = 0; i < days.length; i++){
                        if(i == 0){
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '75%', parseFloat(response['quartiles'][3]), '25%']);
                        }else{
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]); 
                        }
                    }
                    
                    dataGraph.addRows(arrayData);
    
                    var options = {
                        colors: [color, 'orange', 'orange'],
                        hAxis: {
                            title: 'Date',
                            ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[2].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[3].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[4].substr(4,2))-1), days[4].substr(6,2))]
                            },
                        vAxis: {
                            title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                            viewWindow: {
                              min: response['quartiles'][0],
                              max: response['quartiles'][4]
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'linear',
                            startup: true
                        },
                        series: {
                            1: { lineDashStyle: [4, 4] },
                            2: { lineDashStyle: [4, 4] }
                        },
                        pointSize: 0,
                        legend: {
                            position: 'bottom'
                        }
                    };
                }
                var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

                chart.draw(dataGraph, options);
                
                if(parseFloat(response['quartiles'][1]) >= parseFloat(arrayValue[4])){
                    document.getElementById("information-graph-user").innerHTML= "<span class=\"glyphicon glyphicon-warning-sign\"></span>" + " The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is low.";


                } else if(parseFloat(response['quartiles'][3]) <= parseFloat(arrayValue[4])){
                    document.getElementById("information-graph-user").innerHTML= "<span class=\"glyphicon glyphicon-warning-sign\"></span>" + " The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is high.";

                } else{
                    document.getElementById("information-graph-user").innerHTML= "The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is normal.";

                }
            }
        });
    });
}

function drawGraphAll(variableGraph){
    var dateGraph = document.getElementById('date-map-user').value;
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'graphAll': 'graphAll',
                'variableGraph': variableGraph.toLowerCase(),
                'namePlant': document.getElementById("title-name-plant-user").innerHTML.replace("Settings ", "")},
            error: function (response) { 
                alert("Error starting the graph All.");
            },
            success: function (response) { 
                document.getElementById("records-user").innerHTML = variableGraph + " records";
                document.getElementById("table-button-endogenous-all-user").innerHTML = variableGraph + " <span class=\"caret\"></span>";
                var metrics = response['metrics'];
                var arrayValue = response['arrayValue'];
                var color = response['color'];
                var days = response['days'];

                var dataGraph = new google.visualization.DataTable();
                var arrayData = [];
                var arrayTicks = [];

                var i = 0;

                dataGraph.addColumn('date', 'X');
                dataGraph.addColumn('number', variableGraph);
                dataGraph.addColumn('number', 'QuartilMax');
                dataGraph.addColumn({type: 'string', role: 'annotation'});
                dataGraph.addColumn('number', 'QuartilInf');
                dataGraph.addColumn({type: 'string', role: 'annotation'});
                for(i = 0; i < days.length; i++){
                    if(i == 0){
                        arrayTicks.push(new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)));
                        arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']); 
                    }else if((parseInt(days[i].substr(4,2))-1) != (parseInt(days[(i - 1)].substr(4,2))-1)){
                        arrayTicks.push(new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)));
                        arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]); 
                    } else{
                        arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]); 
                    }
                }

                dataGraph.addRows(arrayData);

                var options = {
                    colors: [color, 'orange', 'orange'],
                    hAxis: {
                        title: 'Date',
                        ticks: arrayTicks
                        },
                    vAxis: {
                        title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                        viewWindow: {
                          min: response['quartiles'][0],
                          max: response['quartiles'][4]
                        }
                    },
                    animation: {
                        duration: 2000,
                        easing: 'linear',
                        startup: true
                    },
                    series: {
                        1: { lineDashStyle: [4, 4] },
                        2: { lineDashStyle: [4, 4] }
                    },
                    pointSize: 0,
                    legend: {
                        position: 'bottom'
                    }
                };
                var chart = new google.visualization.LineChart(document.getElementById("graph-all-user"));

                chart.draw(dataGraph, options);
            }
        });
    });
}

jQuery('#button-date-graph-user').click(function () {
    var dateGraph = document.getElementById('date-graph-user').value;
    var variableGraph = document.getElementById('table-button-endogenous-user').innerHTML.replace(" <span class=\"caret\"></span>","");
    $.ajax({                           
        url: "http://192.168.136.131/acciona/user",
        type: "POST",
        data: {'graphDate': 'graphDate',
            'dateGraph': dateGraph,
            'variableGraph': variableGraph.toLowerCase(),
            'namePlant': document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "")},
        error: function (response) { 
            alert("Please select a date.");
        },
        success: function (response) { 

                var metrics = response['metrics'];
                var arrayValue = response['arrayValue'];
                var color = response['color'];
                var days = response['days'];

                var dataGraph = new google.visualization.DataTable();
                var arrayData = [];
                var dateString = new Date().toISOString().substr(0,4) + new Date().toISOString().substr(5,2) + new Date().toISOString().substr(8,2);
    
                var i = 0;
                //if(dateString == days[4]){ cambiar esta linea por la de abajo cuando las bases de datos esten al dia
                if('20171031' == days[4]){
                    dataGraph.addColumn('date', 'X');
                    dataGraph.addColumn('number', 'prediction');
                    dataGraph.addColumn('number', variableGraph);
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilMax');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilInf');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    for(i = 0; i < days.length; i++){
                        if(i == 4){
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), 'prediction ->', parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                        }else if( i == 5 || i == 6 || i == 7){
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                        }else if( i == 0){
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                        }
                        else{
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                        }
                    }
                    
                    dataGraph.addRows(arrayData);

                    var options = {
                        colors: ['green', color, 'orange', 'orange'],
                        hAxis: {
                            title: 'Date',
                            ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[2].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[3].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[4].substr(4,2))-1), days[4].substr(6,2)), new Date(days[5].substr(0,4), (parseInt(days[5].substr(4,2))-1), days[5].substr(6,2)), new Date(days[6].substr(0,4), (parseInt(days[6].substr(4,2))-1), days[6].substr(6,2)), new Date(days[7].substr(0,4), (parseInt(days[7].substr(4,2))-1), days[7].substr(6,2))]
                        },
                        vAxis: {
                            title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                            viewWindow: {
                              min: response['quartiles'][0],
                              max: response['quartiles'][4]
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'linear',
                            startup: true
                        },
                        series: {
                            0: { lineDashStyle: [4, 4] },
                            2: { lineDashStyle: [4, 4] },
                            3: { lineDashStyle: [4, 4] }
                        },
                        pointSize: 0,
                        legend: {
                            position: 'bottom'
                        }
                    };
                }else{
                    dataGraph.addColumn('date', 'X');
                    dataGraph.addColumn('number', 'prediction');
                    if((days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10') && (days[4].substr(6,2) == '31' || days[4].substr(6,2) == '30' || days[4].substr(6,2) == '29')){
                        dataGraph.addColumn({type: 'string', role: 'annotation'});
                    }
                    dataGraph.addColumn('number', variableGraph);
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilMax');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    dataGraph.addColumn('number', 'QuartilInf');
                    dataGraph.addColumn({type: 'string', role: 'annotation'});
                    if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '31'){
                        for(i = 0; i < days.length; i++){
                            if(i == 4){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 5 || i == 6 || i == 7){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                            }
                            else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                        }
                    }else if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '30'){
                         for(i = 0; i < days.length; i++){
                            if(i == 4){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if(i == 6 || i == 7){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                            }else if(i == 5){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                            else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                        }

                    }else if(days[4].substr(0,4) == '2017' && days[4].substr(4,2) == '10' && days[4].substr(6,2) == '29'){
                        for(i = 0; i < days.length; i++){
                            if(i == 4){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if(i == 5 || i == 7){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                            }else if(i == 6){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), 'prediction >', parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                            else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                        }

                    }else {
                        for(i = 0; i < days.length; i++){
                            if(i == 4){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 5 || i == 6 || i == 7){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }else if( i == 0){
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '25%', parseFloat(response['quartiles'][3]), '75%']);
                            }
                            else{
                                arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), null, parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]);
                            }
                        }
                    }
                    
                    dataGraph.addRows(arrayData);
    
                    var options = {
                        colors: [color, 'orange', 'orange'],
                        hAxis: {
                            title: 'Date',
                            ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[2].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[3].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[4].substr(4,2))-1), days[4].substr(6,2))]
                            },
                        vAxis: {
                            title: MaysPrimera(metrics + ' (' + response['units'] + ')'),
                            viewWindow: {
                              min: response['quartiles'][0],
                              max: response['quartiles'][4]
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'linear',
                            startup: true
                        },
                        series: {
                            1: { lineDashStyle: [4, 4] },
                            2: { lineDashStyle: [4, 4] }
                        },
                        pointSize: 0,
                        legend: {
                            position: 'bottom'
                        }
                    };
            }
            var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

            chart.draw(dataGraph, options);
            
            if(parseFloat(response['quartiles'][1]) >= parseFloat(arrayValue[4])){
                document.getElementById("information-graph-user").innerHTML= "<span class=\"glyphicon glyphicon-warning-sign\"></span>" + " The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is low.";


            } else if(parseFloat(response['quartiles'][3]) <= parseFloat(arrayValue[4])){
                document.getElementById("information-graph-user").innerHTML= "<span class=\"glyphicon glyphicon-warning-sign\"></span>" + " The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is high.";

            } else{
                document.getElementById("information-graph-user").innerHTML= "The " + variableGraph + " for " + document.getElementById("date-map-user").value + " is normal.";

            }
        }
    });
});

function setLegendGradientBlue() {
    var gradientCss = '(bottom, white, blue, green, yellow, red)';

    $('#legendGradient-user').css('background', '-webkit-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', '-moz-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', '-o-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', 'linear-gradient' + gradientCss);
}

google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(initMap);

$('#map-time-map-picker').datetimepicker({
    format: 'YYYY-MM-DD',
    minDate: '2017-01-02',
    maxDate: '2017-10-31'
}).on('change dp.change',function(e){
    datePush();
});

function download(tipe) {
    var dateCSV = document.getElementById('date-map-user').value;
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'createCSV': 'createCSV',
                'date': dateCSV,
                'data': tipe,
                'namePlant': document.getElementById('title-name-plant-user').innerHTML.replace("Settings ", "")},
            error: function (response) { 
                alert('error');
            },
            success: function (response) { 
                if(window.Blob && (window.URL || window.webkitURL)){
                    var contenido = "",
                      blob,
                      reader,
                      save,
                      clicEvent;
                
                    var i = 0;
                    var j = 0;
                    for(i = 0; i < response['head'].length; i++){
                        contenido += response['head'][i] + ';';
                    }
                    
                    for(i = 0; i < response['table'].length; i++){
                        for(j = 0; j < response['head'].length; j++){
                            if(j == (response['head'].length -1)){
                                contenido += response['table'][i][j] + ';' + '\n';
                            }else if(i == 0 && j == 0){
                                contenido += '\n' + response['table'][i][j] + ';';
                            }else{
                                contenido += response['table'][i][j] + ';'; 
                            }
                        }
                    }
                    blob =  new Blob(["\ufeff", contenido], {type: 'text/csv'});
                    var reader = new FileReader();
                    reader.onload = (event) => {
                        save = document.createElement('a');
                        save.href = event.target.result;
                        save.target = '_blank';
                        save.download = response['name'];
                        try {
                            clicEvent = new MouseEvent('click', {
                              'view': window,
                              'bubbles': true,
                              'cancelable': true
                            });
                        } catch (e) {
                            clicEvent = document.createEvent("MouseEvent");
                            clicEvent.initEvent('click', true, true);
                        }
                        save.dispatchEvent(clicEvent);
                        (window.URL || window.webkitURL).revokeObjectURL(save.href);
                    }
                    reader.readAsDataURL(blob);
                } else {
                alert("Su navegador no permite esta acción");
                }
            }
        });

    });
    
}

function componentToHex(c) {
    var hex = Number(c).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
}

var coordPropName = null;

function injectTooltip(event,data){
		if(!tipObj && event){
        tipObj = document.createElement("div");
        tipObj.style.width = '300px';
        tipObj.style.height = '100px';
        tipObj.style.background = "white";
        tipObj.style.borderRadius = "5px";
        tipObj.style.padding = "10px";
        tipObj.style.fontFamily = "Arial,Helvetica";
        tipObj.style.textAlign = "center";
        tipObj.innerHTML = data;
        
        eventPropNames = Object.keys(event);
        if(!coordPropName){
          for(var i in eventPropNames){
          	var name = eventPropNames[i];
            if(event[name] instanceof MouseEvent){
                coordPropName = name;
                break;
            }
          }
        }
        
        if(coordPropName){
          tipObj.style.position = "fixed";
          tipObj.style.top = event[coordPropName].clientY + window.scrollY + offset.y + "px";
          tipObj.style.left = event[coordPropName].clientX + window.scrollX + offset.x + "px";
          document.body.appendChild(tipObj);
        }
    }
}

function moveTooltip(event){
		if(tipObj && event && coordPropName){
        tipObj.style.top = event[coordPropName].clientY + offset.y + "px";
        tipObj.style.left = event[coordPropName].clientX + window.scrollX + offset.x + "px";
    }
}

function deleteTooltip(event){
		if(tipObj){
    		document.body.removeChild(tipObj);
        tipObj = null;
    }
}          
                   
function MaysPrimera(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}
           
$(window).resize(function(){
    var varGraph = document.getElementById('table-button-endogenous-user').innerHTML.replace(" <span class=\"caret\"></span>","");
    var varGraphAll = document.getElementById('table-button-endogenous-all-user').innerHTML.replace(" <span class=\"caret\"></span>",""); 
    
    drawGraph(varGraph);
    drawGraphAll(varGraphAll);
});
           
           
           
