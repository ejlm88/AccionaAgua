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

//function date() {
  //  document.getElementById("title-map").innerHTML = "Date: " + date.getDate() + "/" + (date.getMonth() +1) + "/" + //date.getFullYear();
//}

function drawGraphInit(variableGraph){
    jQuery(function(){
        $.ajax({                           
            url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
            type: "POST",
            data: {'graph': 'graph',
                'variableGraph': variableGraph,
                'namePlant': document.getElementById("title-name-plant-user").innerHTML},
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
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '75%', parseFloat(response['quartiles'][3]), '25%']);
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
                            title: metrics + ' (' + response['units'] + ')',
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
                            position: 'none'
                        },
                        width:850,
                        height:400
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
                            title: metrics + ' (' + response['units'] + ')',
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
                            position: 'none'
                        },
                        width:850,
                        height:400
                    };
                }
                var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

                chart.draw(dataGraph, options);
                
                drawGraphAllInit(variableGraph);
            }
        });
    });
}

function drawGraphAllInit(variableGraph){
    jQuery(function(){
        $.ajax({                           
            url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
            type: "POST",
            data: {'graphAll': 'graphAll',
                'variableGraph': variableGraph,
                'namePlant': document.getElementById("title-name-plant-user").innerHTML},
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
                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i]), parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null]); 
                    if(i == 0){
                        arrayTicks.push(new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['quartiles'][1]), '75%', parseFloat(response['quartiles'][3]), '25%');
                    }else if((parseInt(days[i].substr(4,2))-1) != (parseInt(days[(i - 1)].substr(4,2))-1)){
                        arrayTicks.push(new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['quartiles'][1]), null, parseFloat(response['quartiles'][3]), null);
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
                        title: metrics + ' (' + response['units'] + ')',
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
                    pointSize: 0,
                    legend: {
                        position: 'none'
                    },
                    width:850,
                    height:400
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
            url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
            type: "POST",
            data: {'drawMap': 'drawMap',
                'varMap': varMap,
                'namePlant': document.getElementById('title-name-plant-user').innerHTML},
            error: function (response) { 
                alert("Error starting the map.");
            },
            success: function (response) { 
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
                        red = 255 * ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min'])));

                        red = componentToHex(parseInt(red));

                        blue = 255 * (1 - ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min']))));

                        blue = componentToHex(parseInt(blue));
                    }else{
                        red = '00';
                        blue = '00';
                    }
                    
                    polygon[i] = new google.maps.Polygon({
                      paths: coords,
                      strokeColor: 'RGB(256,0,0)',
                      strokeOpacity: 0,
                      strokeWeight: 1,
                      fillColor: '#' + red + '00' + blue,
                      fillOpacity: 0.5,
                      text : varMap + ":<br>" + parseFloat(response['data'][i]).toFixed(2) + " (" + response['units'] + ")"
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

               /* heatmap = new HeatmapOverlay(map, 
                  {
                    // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                    "radius": 0.01,
                    "maxOpacity": 0.5, 
                    "minOpacity": 0,
                    // scales the radius based on map zoom
                    "scaleRadius": true, 
                    // if set to false the heatmap uses the global maximum for colorization
                    // if activated: uses the data maximum within the current map boundaries 
                    //   (there will always be a red spot with useLocalExtremas true)
                    "useLocalExtrema": true,
                    // which field name in your data represents the latitude - default "lat"
                    latField: 'lat',
                    // which field name in your data represents the longitude - default "lng"
                    lngField: 'lng',
                    // which field name in your data represents the data value - default "value"
                    valueField: 'count'
                  }
                );
                
                var testData = {
                    max: response['max'],
                    min: response['min'],
                    data: tempData
                };
                
                heatmap.setData(testData);*/
                
                drawGraphInit(titleGraph);
            }
        });

    });
}

function initMap() {
    jQuery(function(){
        $.ajax({                           
            url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
            type: "POST",
            headers: {'Access-Control-Allow-Origin': '*'},
            data: {'startMap': 'startMap',
                  'namePlant': document.getElementById('title-name-plant-user').innerHTML},
            error: function (response) { 
                alert("Error starting the map.");
            },
            success: function (response) {
                latPlant = response['latPlant'];
                lngPlant = response['lngPlant'];
                var titleGraph = response['titleGraph'];

                var center = new google.maps.LatLng(parseFloat(25.934356), parseFloat(53.312975));
                map = new google.maps.Map(document.getElementById('map-user'), {
                    zoom: 7,
                    center: center
                });

                var contentString = '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h6 id="firstHeading" class="firstHeading">' + document.getElementById('title-name-plant-user').innerHTML + '</h6>' +
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
            url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
            type: "POST",
            data: {'drawMapDate': 'drawMapDate',
                'varMap': value,
                'dateMap': dateMap1,
                'namePlant': document.getElementById('title-name-plant-user').innerHTML},
            error: function (response) { 
                alert('error');
            },
            success: function (response) { 
                document.getElementById("legend-ini-user").innerHTML = response['min'] + ' ' + response['units'];
                document.getElementById("legend-end-user").innerHTML = response['max'] + ' ' + response['units'];
                document.getElementById("table-button-exogenous-user").innerHTML = value + " <span class=\"caret\"></span>";
                
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
                        red = 255 * ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min'])));

                        red = componentToHex(parseInt(red));

                        blue = 255 * (1 - ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min']))));

                        blue = componentToHex(parseInt(blue));
                    }else{
                        red = '00';
                        blue = '00';
                    }
                    
                    polygon[i] = new google.maps.Polygon({
                      paths: coords,
                      strokeColor: 'RGB(256,0,0)',
                      strokeOpacity: 0,
                      strokeWeight: 1,
                      fillColor: '#' + red + '00' + blue,
                      fillOpacity: 0.5,
                      text : value + ":<br>" + parseFloat(response['data'][i]).toFixed(2) + " (" + response['units'] + ")"
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

jQuery('#button-date-map-user').click(function () {
    var dateMap = document.getElementById('date-map-user').value;
    var varMap = document.getElementById('table-button-exogenous-user').innerHTML.replace(" <span class=\"caret\"></span>","");
    $.ajax({                           
        url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
        type: "POST",
        data: {'drawMapDate': 'drawMapDate',
            'dateMap': dateMap,
            'varMap': varMap,
            'namePlant': document.getElementById('title-name-plant-user').innerHTML},
        error: function (response) { 
            alert("Please select a date.");
        },
        success: function (response) { 
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
                    red = 255 * ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min'])));

                    red = componentToHex(parseInt(red));

                    blue = 255 * (1 - ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min']))));

                    blue = componentToHex(parseInt(blue));
                }else{
                    red = '00';
                    blue = '00';
                }

                polygon[i] = new google.maps.Polygon({
                  paths: coords,
                  strokeColor: 'RGB(256,0,0)',
                  strokeOpacity: 0,
                  strokeWeight: 1,
                  fillColor: '#' + red + '00' + blue,
                  fillOpacity: 0.5,
                  text : varMap + ":<br>" + parseFloat(response['data'][i]).toFixed(2) + " (" + response['units'] + ")"
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

            for(i = 0; i < response['statisticsName'].length; i++){
                document.getElementById('min' + response['statisticsName'][i][0]).innerHTML = response['statisticsName'][i][1];
                document.getElementById('max' + response['statisticsName'][i][0]).innerHTML = response['statisticsName'][i][2];
                document.getElementById('avg' + response['statisticsName'][i][0]).innerHTML = response['statisticsName'][i][3];
                document.getElementById('std' + response['statisticsName'][i][0]).innerHTML = response['statisticsName'][i][4];
            }
        }
    });
});

function drawGraph(variableGraph){
    var dateGraph = document.getElementById('date-graph-user').value;
    jQuery(function(){
        $.ajax({
            url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
            type: "POST",
            data: {'graphDate': 'graphDate',
                'dateGraph': dateGraph,
                'variableGraph': variableGraph,
                'namePlant': document.getElementById('title-name-plant-user').innerHTML},
            error: function (response) { 
                alert("Please select a date.");
            },
            success: function (response) { 

                var metrics = response['metrics'];
                var arrayValue = response['arrayValue'];
                var color = response['color'];
                var days = response['days'];
                document.getElementById("table-button-endogenous-user").innerHTML = variableGraph + " <span class=\"caret\"></span>";

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
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '75%', parseFloat(response['quartiles'][3]), '25%']);
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
                            title: metrics + ' (' + response['units'] + ')',
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
                            position: 'none'
                        },
                        width:850,
                        height:400
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
                            title: metrics + ' (' + response['units'] + ')',
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
                            position: 'none'
                        },
                        width:850,
                        height:400
                    };
                }
                var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

                chart.draw(dataGraph, options);
                
                $.ajax({                           
                    url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
                    type: "POST",
                    data: {'graphAll': 'graphAll',
                        'variableGraph': variableGraph,
                        'namePlant': document.getElementById("title-name-plant-user").innerHTML},
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

                        i = 0;

                        dataGraph.addColumn('date', 'X');
                        dataGraph.addColumn('number', variableGraph);
                        for(i = 0; i < days.length; i++){
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i])]); 
                            if(i == 0){
                                arrayTicks.push(new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)));
                            }else if((parseInt(days[i].substr(4,2))-1) != (parseInt(days[(i - 1)].substr(4,2))-1)){
                                arrayTicks.push(new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)));
                            }
                        }

                        dataGraph.addRows(arrayData);

                        var options = {
                            colors: [color],
                            hAxis: {
                                title: 'Date',
                                ticks: arrayTicks
                                },
                            vAxis: {
                                title: metrics + ' (' + response['units'] + ')',
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
                            pointSize: 0,
                            legend: {
                                position: 'none'
                            },
                            width:850,
                            height:400
                        };
                        var chart = new google.visualization.LineChart(document.getElementById("graph-all-user"));

                        chart.draw(dataGraph, options);
                    }
                });
            }
        });
    });
}

jQuery('#button-date-graph-user').click(function () {
    var dateGraph = document.getElementById('date-graph-user').value;
    var variableGraph = document.getElementById('table-button-endogenous-user').innerHTML.replace(" <span class=\"caret\"></span>","");
    $.ajax({                           
        url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
        type: "POST",
        data: {'graphDate': 'graphDate',
            'dateGraph': dateGraph,
            'variableGraph': variableGraph,
            'namePlant': document.getElementById('title-name-plant-user').innerHTML},
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
                            arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[i].substr(4,2))-1), days[i].substr(6,2)), parseFloat(response['arrayPrediction'][i]), parseFloat(arrayValue[i]), null, parseFloat(response['quartiles'][1]), '75%', parseFloat(response['quartiles'][3]), '25%']);
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
                            title: metrics + ' (' + response['units'] + ')',
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
                            position: 'none'
                        },
                        width:850,
                        height:400
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
                            title: metrics + ' (' + response['units'] + ')',
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
                            position: 'none'
                        },
                        width:850,
                        height:400
                    };
                }
                var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

                chart.draw(dataGraph, options);
            }
    });
});

function setGradientGreen() {
    heatmap.set('gradient', null);
}
        
function setGradientBlue() {
    gradient = [
    'rgba(0, 255, 255, 0)',
    'rgba(0, 255, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 127, 255, 1)',
    'rgba(0, 63, 255, 1)',
    'rgba(0, 0, 255, 1)',
    'rgba(0, 0, 223, 1)',
    'rgba(0, 0, 191, 1)',
    'rgba(0, 0, 159, 1)',
    'rgba(0, 0, 127, 1)',
    'rgba(63, 0, 91, 1)',
    'rgba(127, 0, 63, 1)',
    'rgba(191, 0, 31, 1)',
    'rgba(255, 0, 0, 1)'
    ]

    heatmap.set('gradient', gradient);
}  

function setLegendGradientBlue() {
    var gradientCss = '(bottom, white, blue, red)';

    $('#legendGradient-user').css('background', '-webkit-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', '-moz-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', '-o-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', 'linear-gradient' + gradientCss);
}
        
function setLegendGradientGreen() {
    var gradientCss = '(bottom, white, green, red)';

    $('#legendGradient-user').css('background', '-webkit-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', '-moz-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', '-o-linear-gradient' + gradientCss);
    $('#legendGradient-user').css('background', 'linear-gradient' + gradientCss);
}

google.charts.load('current', {packages: ['corechart', 'line']});
//google.charts.setOnLoadCallback(drawPrediction);
google.charts.setOnLoadCallback(initMap);


$('#map-time-map-picker').datetimepicker({
    format: 'YYYY-MM-DD',
    minDate: '2017-01-02',
    maxDate: '2017-10-31'
});

$('#map-time-graph-picker').datetimepicker({
    format: 'YYYY-MM-DD',
    minDate: '2017-01-02',
    maxDate: '2017-10-31'
});


function download(tipe) {
    var dateCSV = document.getElementById('date-user').value;
    jQuery(function(){
        $.ajax({                           
            url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
            type: "POST",
            data: {'createCSV': 'createCSV',
                'date': dateCSV,
                'data': tipe,
                'namePlant': document.getElementById('title-name-plant-user').innerHTML},
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
                    //creamos el reader
                    var reader = new FileReader();
                    reader.onload = (event) => {
                        //escuchamos su evento load y creamos un enlace en dom
                        save = document.createElement('a');
                        save.href = event.target.result;
                        save.target = '_blank';
                        //aquí le damos nombre al archivo
                        save.download = response['name'];
                        try {
                            //creamos un evento click
                            clicEvent = new MouseEvent('click', {
                              'view': window,
                              'bubbles': true,
                              'cancelable': true
                            });
                        } catch (e) {
                            //si llega aquí es que probablemente implemente la forma antigua de crear un enlace
                            clicEvent = document.createEvent("MouseEvent");
                            clicEvent.initEvent('click', true, true);
                        }
                        //disparamos el evento
                        save.dispatchEvent(clicEvent);
                        //liberamos el objeto window.URL por si estuviera usado
                        (window.URL || window.webkitURL).revokeObjectURL(save.href);
                    }
                    //leemos como url
                    reader.readAsDataURL(blob);
                } else {
                //el navegador no admite esta opción
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


/********************************************************************
 * injectTooltip(e,data)
 * inject the custom tooltip into the DOM
 ********************************************************************/
var coordPropName = null;

function injectTooltip(event,data){
		if(!tipObj && event){
        //create the tooltip object
        tipObj = document.createElement("div");
        tipObj.style.width = '300px';
        tipObj.style.height = '80px';
        tipObj.style.background = "white";
        tipObj.style.borderRadius = "5px";
        tipObj.style.padding = "10px";
        tipObj.style.fontFamily = "Arial,Helvetica";
        tipObj.style.textAlign = "center";
        tipObj.innerHTML = data;
        
        //fix for the version issue
        eventPropNames = Object.keys(event);
        if(!coordPropName){
        	//discover the name of the prop with MouseEvent
          for(var i in eventPropNames){
          	var name = eventPropNames[i];
            if(event[name] instanceof MouseEvent){
                coordPropName = name;
                break;
            }
          }
        }
        
        if(coordPropName){
          //position it
          tipObj.style.position = "fixed";
          tipObj.style.top = event[coordPropName].clientY + window.scrollY + offset.y + "px";
          tipObj.style.left = event[coordPropName].clientX + window.scrollX + offset.x + "px";
            //alert(event[coordPropName].clientY + window.scrollY + offset.y + "px");
          //add it to the body
          document.body.appendChild(tipObj);
        }
    }
}

/********************************************************************
 * moveTooltip(e)
 * update the position of the tooltip based on the event data
 ********************************************************************/
function moveTooltip(event){
		if(tipObj && event && coordPropName){
	    	//position it
        tipObj.style.top = event[coordPropName].clientY + offset.y + "px";
        tipObj.style.left = event[coordPropName].clientX + window.scrollX + offset.x + "px";
    }
}

/********************************************************************
	* deleteTooltip(e)
  * delete the tooltip if it exists in the DOM
********************************************************************/
function deleteTooltip(event){
		if(tipObj){
    		//delete the tooltip if it exists in the DOM
    		document.body.removeChild(tipObj);
        tipObj = null;
    }
}          
           
           
           
           
           
           
           
           
           
           