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

//function date() {
  //  document.getElementById("title-map").innerHTML = "Date: " + date.getDate() + "/" + (date.getMonth() +1) + "/" + //date.getFullYear();
//}

function drawGraph(variableGraph){
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
                document.getElementById("table-button-endogenous-user").innerHTML = variableGraph + " <span class=\"caret\"></span>";

                var dataGraph = new google.visualization.DataTable();
                dataGraph.addColumn('date', 'X');
                dataGraph.addColumn('number', variableGraph);
                var f = new Date();
                var arrayData = [];
                var i = 0;
                for(i = 0; i < days.length; i++){
                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i])]);
                }
                
                dataGraph.addRows(arrayData);

                var options = {
                    colors: [color],
                    hAxis: {
                        title: 'Days',
                        ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[4].substr(6,2)), new Date(days[5].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[5].substr(6,2)), new Date(days[6].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[6].substr(6,2)), new Date(days[7].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[7].substr(6,2)), new Date(days[8].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[8].substr(6,2)), new Date(days[9].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[9].substr(6,2)), new Date(days[10].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[10].substr(6,2))]
                    },
                    vAxis: {
                        title: metrics,
                        viewWindow: {
                          min: '0',
                          max: '50'
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

                var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

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
                document.getElementById("legend-ini-user").innerHTML = response['min'];
                document.getElementById("legend-end-user").innerHTML = response['max'];
                $("#date-user").val(response['date']);

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
                    
                    red = 255 * ((parseFloat(response['data'][i]) - parseFloat(response['min']) / (parseFloat(response['max']) - parseFloat(response['min']))));
                    blue = 255 * (1 - ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min']))));
                    
                    polygon[i] = new google.maps.Polygon({
                      paths: coords,
                      strokeColor: 'RGB(256,0,0)',
                      strokeOpacity: 0,
                      strokeWeight: 1,
                      fillColor: 'RGB(' + red + ',' + 0 + ',' + blue + ')',
                      fillOpacity: 0.7
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
                
                heatmap.setData(testData);
                
                setLegendGradientGreen();*/
                
                drawGraph(titleGraph);
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

                var center = new google.maps.LatLng(parseFloat(26.908726), parseFloat(51.977471));
                map = new google.maps.Map(document.getElementById('map-user'), {
                    zoom: 6,
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

                
                setLegendGradientGreen();
                
                drawMapInit(titleGraph);
            }
        });
    });
} 

function drawMap(value) {
    var dateMap1 = document.getElementById('date-user').value;
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
                if(response['min'].substr(0,3) == "nan"){
                    document.getElementById("legend-ini-user").innerHTML = "0" + response['min'].substr(3, response['min'].length);
                } else{
                    document.getElementById("legend-ini-user").innerHTML = response['min'];
                }
                document.getElementById("legend-end-user").innerHTML = response['max'];
                //acordarme de tratar los nan
                document.getElementById("table-button-exogenous-user").innerHTML = value + " <span class=\"caret\"></span>";
                $("#date-user").val(response['date']);
                
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
                    
                    red = 255 * ((parseFloat(response['data'][i]) - parseFloat(response['min']) / (parseFloat(response['max']) - parseFloat(response['min']))));
                    blue = 255 * (1 - ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min']))));
                    
                    polygon[i] = new google.maps.Polygon({
                      paths: coords,
                      strokeColor: 'RGB(256,0,0)',
                      strokeOpacity: 0,
                      strokeWeight: 1,
                      fillColor: 'RGB(' + red + ',' + 0 + ',' + blue + ')',
                      fillOpacity: 0.7
                    });
                    polygon[i].setMap(map);
                }
                
                setLegendGradientGreen();
            }
        });

    });
}

jQuery('#button-date-user').click(function () {
    var dateMap = document.getElementById('date-user').value;
    var varMap = document.getElementById('table-button-exogenous-user').innerHTML.replace(" <span class=\"caret\"></span>","");
    var variableGraph = document.getElementById('table-button-endogenous-user').innerHTML.replace(" <span class=\"caret\"></span>","");
    $.ajax({                           
        url: "http://accionaagua.northeurope.cloudapp.azure.com/acciona/user",
        type: "POST",
        data: {'drawMapGraphDate': 'drawMapGraphDate',
            'dateMap': dateMap,
            'varMap': varMap,
            'variableGraph': variableGraph,
            'namePlant': document.getElementById('title-name-plant-user').innerHTML},
        error: function (response) { 
            alert("Please select a date.");
        },
        success: function (response) { 
            if(response['min'].substr(0,3) == "nan"){
                    document.getElementById("legend-ini-user").innerHTML = "0" + response['min'].substr(3, response['min'].length);
                } else{
                    document.getElementById("legend-ini-user").innerHTML = response['min'];
                }
            document.getElementById("legend-end-user").innerHTML = response['max']; 
                
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

                red = 255 * ((parseFloat(response['data'][i]) - parseFloat(response['min']) / (parseFloat(response['max']) - parseFloat(response['min']))));
                blue = 255 * (1 - ((parseFloat(response['data'][i]) - parseFloat(response['min'])) / (parseFloat(response['max']) - parseFloat(response['min']))));

                polygon[i] = new google.maps.Polygon({
                  paths: coords,
                  strokeColor: 'RGB(256,0,0)',
                  strokeOpacity: 0,
                  strokeWeight: 1,
                  fillColor: 'RGB(' + red + ',' + 0 + ',' + blue + ')',
                  fillOpacity: 0.7
                });
                    polygon[i].setMap(map);
                }
            
            setLegendGradientGreen();
            
            for(i = 0; i < response['statisticsName'].length; i++){
                document.getElementById('min' + response['statisticsName'][i]).innerHTML = response[response['statisticsName'][i]][0];
                document.getElementById('max' + response['statisticsName'][i]).innerHTML = response[response['statisticsName'][i]][1];
                document.getElementById('avg' + response['statisticsName'][i]).innerHTML = response[response['statisticsName'][i]][2];
                document.getElementById('std' + response['statisticsName'][i]).innerHTML = response[response['statisticsName'][i]][3];
            }
            
            if (response['aviableGraph'] === 'true'){
                var metrics = response['metrics'];
                var arrayValue = response['arrayValue'];
                var color = response['color'];
                var days = response['days'];

                var dataGraph = new google.visualization.DataTable();
                dataGraph.addColumn('date', 'X');
                dataGraph.addColumn('number', variableGraph);
                var f = new Date();
                var arrayData = [];
                var i = 0;
                for(i = 0; i < days.length; i++){
                    arrayData.push([new Date(days[i].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[i].substr(6,2)), parseFloat(arrayValue[i])]);
                }
                
                dataGraph.addRows(arrayData);

                var options = {
                    colors: [color],
                    hAxis: {
                        title: 'Days',
                        ticks: [new Date(days[0].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[0].substr(6,2)), new Date(days[1].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[1].substr(6,2)), new Date(days[2].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[2].substr(6,2)), new Date(days[3].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[3].substr(6,2)), new Date(days[4].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[4].substr(6,2)), new Date(days[5].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[5].substr(6,2)), new Date(days[6].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[6].substr(6,2)), new Date(days[7].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[7].substr(6,2)), new Date(days[8].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[8].substr(6,2)), new Date(days[9].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[9].substr(6,2)), new Date(days[10].substr(0,4), (parseInt(days[0].substr(4,2))-1), days[10].substr(6,2))]
                    },
                    vAxis: {
                        title: metrics,
                        viewWindow: {
                          min: '0',
                          max: '50'
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

                var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

                chart.draw(dataGraph, options);
           }else{
               alert('no hay fecha');
           }
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


$('#map-time-picker').datetimepicker({
    format: 'YYYY-MM-DD',
    minDate: '2016-01-01',
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
           
           
           
           
           
           
           
           
           
           
           
           
           
           