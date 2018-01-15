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

//function date() {
  //  document.getElementById("title-map").innerHTML = "Date: " + date.getDate() + "/" + (date.getMonth() +1) + "/" + //date.getFullYear();
//}

function drawGraph(variableGraph){
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'graph': 'graph',
                'variableGraph': variableGraph,
                'namePlant': document.getElementById("title-page-user").innerHTML},
            error: function (response) { 
                alert("Error starting the graph.");
            },
            success: function (response) {
                var metrics = response['metrics'];
                var arrayValue = response['arrayValue'];
                var color = response['color'];
                var days = response['days'];
                document.getElementById("table-button-endogenous-user").innerHTML = variableGraph;
                
                var dataGraph = new google.visualization.DataTable();
                dataGraph.addColumn('number', 'X');
                dataGraph.addColumn('number', variableGraph);
                dataGraph.addColumn({type:'boolean',role:'certainty'});
                var f = new Date();
                var arrayData = [
                    [parseInt(days[0]), parseFloat(arrayValue[0]), false],
                    [parseInt(days[1]), parseFloat(arrayValue[1]), false],
                    [parseInt(days[2]), parseFloat(arrayValue[2]), false],
                    [parseInt(days[3]), parseFloat(arrayValue[3]), false],
                    [parseInt(days[4]), parseFloat(arrayValue[4]), false],
                    [parseInt(days[5]), parseFloat(arrayValue[5]), false],
                    [parseInt(days[6]), parseFloat(arrayValue[6]), false],
                    [parseInt(days[7]), parseFloat(arrayValue[7]), false],
                    [parseInt(days[8]), parseFloat(arrayValue[8]), false],
                    [parseInt(days[9]), parseFloat(arrayValue[9]), false]
                ];
                dataGraph.addRows(arrayData);

                var options = {
                    colors: [color],
                    hAxis: {
                        title: 'Days',
                        ticks: [parseInt(days[0]), parseInt(days[1]), parseInt(days[2]), parseInt(days[3]), parseInt(days[4]), parseInt(days[5]), parseInt(days[6]), parseInt(days[7]), parseInt(days[8]), parseInt(days[9])]
                    },
                    vAxis: {
                        title: metrics
                    },
                    series: {
                        0: { lineDashStyle: [1, 1] },
                        1: { lineDashStyle: [2, 2] }, 
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
                    width:650,
                    height:200
                };

                var chart = new google.visualization.LineChart(document.getElementById("graph-user"));

                chart.draw(dataGraph, options);
            }
        });
    });
}

function drawMapInit(titleGraph) {
    jQuery(function(){
        $.ajax({                           
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'drawMap': 'drawMap',
                'varMap': document.getElementById('table-button-exogenous-user').innerHTML,
                'namePlant': document.getElementById('title-page-user').innerHTML},
            error: function (response) { 
                alert("Error starting the map.");
            },
            success: function (response) { 
                document.getElementById("legend-ini-user").innerHTML = response['min'];
                document.getElementById("legend-end-user").innerHTML = response['max'];
                $("#date-user").val(response['date']);

                var i; 

               for(i = 2; i < response['lat'].length; i++){
                    tempData.push({location: new google.maps.LatLng(response['lat'][i], response['lng'][i]), weight: response['data'][i]});
               }
                
                tempData.push({location: new google.maps.LatLng(response['lat'][0], response['lng'][0]), weight: 0});
                tempData.push({location: new google.maps.LatLng(response['lat'][1], response['lng'][1]), weight: 100});

                heatmap = new google.maps.visualization.HeatmapLayer({
                        data: tempData
                });
                
                heatmap.setMap(map);
                
                setLegendGradientGreen();
                drawGraph(titleGraph);
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
                  'namePlant': document.getElementById('title-page-user').innerHTML},
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
                    '<h6 id="firstHeading" class="firstHeading">' + document.getElementById('title-page-user').innerHTML + '</h6>' +
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
            url: "http://192.168.136.131/acciona/user",
            type: "POST",
            data: {'drawMapDate': 'drawMapDate',
                'varMap': value,
                'dateMap': dateMap1,
                'namePlant': document.getElementById('title-page-user').innerHTML},
            error: function (response) { 
                alert("Error in obtaining information.");
            },
            success: function (response) { 
                document.getElementById("legend-ini-user").innerHTML = response['min'];
                document.getElementById("legend-end-user").innerHTML = response['max'];
                document.getElementById("table-button-exogenous-user").innerHTML = value;
                $("#date-user").val(response['date']);
                
                tempData = [];
                var i;  
                    
                heatmap.setMap(null);
                heatmap = new google.maps.visualization.HeatmapLayer({
                        data: tempData
                });

                heatmap.setMap(map);
                
                for(i = 0; i < response['lat'].length; i++){
                    
                    var weightTemp = parseFloat(response['data'][i]);
                    weightTemp = (weightTemp - 0) / (50 - 0);
                    tempData.push({location: new google.maps.LatLng(response['lat'][i], response['lng'][i]), weight: weightTemp});
                    i = i + 10000;
                }
                
                heatmap = new google.maps.visualization.HeatmapLayer({
                        data: tempData
                });
                
                heatmap.setMap(map);
                
                setLegendGradientGreen();
            }
        });

    });
}

jQuery('#button-date-user').click(function () {
    var dateMap = document.getElementById('date-user').value;
    $.ajax({                           
        url: "http://192.168.136.131/acciona/user",
        type: "POST",
        data: {'drawMapDate': 'drawMapDate',
            'dateMap': dateMap,
            'varMap': document.getElementById('table-button-exogenous-user').innerHTML,
            'namePlant': document.getElementById('title-page-user').innerHTML},
        error: function (response) { 
            alert("Please select a date.");
        },
        success: function (response) { 
            document.getElementById("legend-ini-user").innerHTML = response['min'];
            document.getElementById("legend-end-user").innerHTML = response['max']; 
                
            tempData = [];
            var i;
            heatmap.setMap(null);
            heatmap = new google.maps.visualization.HeatmapLayer({
                        data: tempData
                });
            
            for(i = 0; i < response['lat'].length; i++){
                tempData.push({location: new google.maps.LatLng(response['lat'][i], response['lng'][i]), weight: response['data'][i]})
                i = i + 10000;
            }
            heatmap = new google.maps.visualization.HeatmapLayer({
                        data: tempData
            });
            
            heatmap.setMap(map);
            
            setLegendGradientGreen();
            
            for(i = 0; i < response['statisticsName'].length; i++){
                document.getElementById('min' + response['statisticsName'][i]).innerHTML = response[response['statisticsName'][i]][0];
                document.getElementById('max' + response['statisticsName'][i]).innerHTML = response[response['statisticsName'][i]][1];
                document.getElementById('avg' + response['statisticsName'][i]).innerHTML = response[response['statisticsName'][i]][2];
                document.getElementById('std' + response['statisticsName'][i]).innerHTML = response[response['statisticsName'][i]][3];
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
    format: 'YYYY/MM/DD',
    pickTime: false
});


