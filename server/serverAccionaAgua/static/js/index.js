var code1 = new Array();
var map, heatmap;
var pointArray;
var type;
var res;
var date = new Date;

function date() {
    document.getElementById("title-map").innerHTML = "Date: " + date.getDate() + "/" + (date.getMonth() +1) + "/" + date.getFullYear();
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 6,
        center: {lat: 27.101380, lng: 52.479698}
    });

    pointArray = new google.maps.MVCArray([
     ]);

    var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h6 id="firstHeading" class="firstHeading">Ras Abu Fontas Kahrama Water Desalination Station</h6>'+
        '</div>';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    var marker = new google.maps.Marker({
        position: {lat: 25.2124580, lng: 51.6402182},
        map: map
    });

    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: pointArray

    });

    heatmap.setMap(map);
    
    show("Chlorophyll (mg/m ^3)");
}

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

    $('#legendGradient').css('background', '-webkit-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-moz-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-o-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', 'linear-gradient' + gradientCss);
}
        
function setLegendGradientGreen() {
    var gradientCss = '(bottom, white, green, red)';

    $('#legendGradient').css('background', '-webkit-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-moz-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', '-o-linear-gradient' + gradientCss);
    $('#legendGradient').css('background', 'linear-gradient' + gradientCss);
}

function show (name){
    var f = new Date();
    
    if(name == "Chlorophyll (mg/m ^3)"){

        document.getElementById("legend-ini").innerHTML = "0";
        document.getElementById("legend-end").innerHTML = "100";

        pointArray.clear();
        pointArray = new google.maps.MVCArray([
            {location: new google.maps.LatLng(29.4541, 50.524635), weight: 1.873940}]);
        
        heatmap.setMap(null);
        heatmap.set('data', pointArray);
        heatmap.setMap(map);
        setGradientGreen();
        setLegendGradientGreen();
    }
    
    if(name == "Temperature (Celsius)"){

        document.getElementById("legend-ini").innerHTML = "0";
        document.getElementById("legend-end").innerHTML = "50";

        pointArray.clear();
        pointArray = new google.maps.MVCArray([
            {location: new google.maps.LatLng(29.4541, 50.524635), weight: 1.873940}]);
        
        heatmap.setMap(null);
        heatmap.set('data', pointArray);
        heatmap.setMap(map);
        setGradientBlue();
        setLegendGradientBlue();
    }
    
    if(name == "Particulate organic carbon (mg/m ^3)"){

        document.getElementById("legend-ini").innerHTML = "-200";
        document.getElementById("legend-end").innerHTML = "20000";

        pointArray.clear();
        pointArray = new google.maps.MVCArray([
            {location: new google.maps.LatLng(29.4541, 50.524635), weight: 1.873940}]);
        
        heatmap.setMap(null);
        heatmap.set('data', pointArray);
        heatmap.setMap(map);
        setGradientGreen();
        setLegendGradientGreen();
    }
    
    if(name == "Remote sensing reflectance (sr ^-1)"){

        document.getElementById("legend-ini").innerHTML = "-0.1";
        document.getElementById("legend-end").innerHTML = "0.1";

        pointArray.clear();
        pointArray = new google.maps.MVCArray([
            {location: new google.maps.LatLng(29.4541, 50.524635), weight: 1.873940}]);
        
        heatmap.setMap(null);
        heatmap.set('data', pointArray);
        heatmap.setMap(map);
        setGradientBlue();
        setLegendGradientBlue();
    }
    
    if(name == "Calcite concentration (mol/m ^3)"){

        document.getElementById("legend-ini").innerHTML = "-0.5";
        document.getElementById("legend-end").innerHTML = "0.5";

        pointArray.clear();
        pointArray = new google.maps.MVCArray([
            {location: new google.maps.LatLng(29.4541, 50.524635), weight: 1.873940}]);
        
        heatmap.setMap(null);
        heatmap.set('data', pointArray);
        heatmap.setMap(map);
        setGradientGreen();
        setLegendGradientGreen();
    }
    
    if(name == "Normalized fluorescence line height (W/m ^2 um sr)"){

        document.getElementById("legend-ini").innerHTML = "-1";
        document.getElementById("legend-end").innerHTML = "5";

        pointArray.clear();
        pointArray = new google.maps.MVCArray([
            {location: new google.maps.LatLng(29.4541, 50.524635), weight: 1.873940}]);
        
        heatmap.setMap(null);
        heatmap.set('data', pointArray);
        heatmap.setMap(map);
        setGradientBlue();
        setLegendGradientBlue();
    }
    
    if(name == "Diffuse attenuation coefficient (m ^-1)"){

        document.getElementById("legend-ini").innerHTML = "0";
        document.getElementById("legend-end").innerHTML = "10";

        pointArray.clear();
        pointArray = new google.maps.MVCArray([
            {location: new google.maps.LatLng(29.4541, 50.524635), weight: 1.873940}]);
        
        heatmap.setMap(null);
        heatmap.set('data', pointArray);
        heatmap.setMap(map);
        setGradientGreen();
        setLegendGradientGreen();
    }
}

google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawPrediction);
google.charts.setOnLoadCallback(initMap);

var arrayTemp1 = [[10, 20], [11, 23], [12, 25], [13, 30], [14, 32], [15, 31], [16, 24], [17, 22], [18, 27], [19, 31]];

function drawBasic(vY, type, arrayTemp, color, table) {
    var data = new google.visualization.DataTable();
    data.addColumn('date', 'X');
    data.addColumn('number', type);
    var f = new Date();
    var arrayData = [
        [new Date(2017, 10, arrayTemp[0][0]), arrayTemp[0][1]],
        [new Date(2017, 10, arrayTemp[1][0]), arrayTemp[1][1]],
        [new Date(2017, 10, arrayTemp[2][0]), arrayTemp[2][1]],
        [new Date(2017, 10, arrayTemp[3][0]), arrayTemp[3][1]],
        [new Date(2017, 10, arrayTemp[4][0]), arrayTemp[4][1]],
        [new Date(2017, 10, arrayTemp[5][0]), arrayTemp[5][1]],
        [new Date(2017, 10, arrayTemp[6][0]), arrayTemp[6][1]],
        [new Date(2017, 10, arrayTemp[7][0]), arrayTemp[7][1]],
        [new Date(2017, 10, arrayTemp[8][0]), arrayTemp[8][1]],
        [new Date(2017, 10, arrayTemp[9][0]), arrayTemp[9][1]]
    ];
    data.addRows(arrayData);

    var options = {
        colors: [color],
        title: type,
        hAxis: {
            title: 'Date',
            ticks: [new Date(2017, 10, arrayTemp[0][0]), new Date(2017, 10, arrayTemp[1][0]), new Date(2017, 10, arrayTemp[2][0]), new Date(2017, 10, arrayTemp[3][0]), new Date(2017, 10, arrayTemp[4][0]), new Date(2017, 10, arrayTemp[5][0]), new Date(2017, 10, arrayTemp[6][0]), new Date(2017, 10, arrayTemp[7][0]), new Date(2017, 10, arrayTemp[8][0]), new Date(2017, 10, arrayTemp[9][0])]
        },
        vAxis: {
            title: vY
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
        width:550,
        height:200
    };

    var chart = new google.visualization.LineChart(document.getElementById(table));

    chart.draw(data, options);
}

function drawPrediction() {
    drawBasic("Degrees Celsius", "Temperature", arrayTemp1, "blue", "graphics");
}