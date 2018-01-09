var locations = [
  ['p1', 25.2124580, 51.6402182, 'variables 1'],
  ['p2', 25.369071, 54.371129, 'variables 2'],
  ['p3', 26.188379, 53.245381, 'variables 3'],
  ['p4', 25.265282, 53.383584, 'variables 4'],
  ['p5', 26.051963, 55.236710, 'variables 5']
  ];

function initMap() {
   var map = new google.maps.Map(document.getElementById('map-admin'), {
        zoom: 6,
        center: {lat: 27.101380, lng: 52.479698}
    });

    setMarkers(map, locations)
}

function setMarkers(map, locations){
    var i;
    
    for (i = 0; i < locations.length; i++){  

        var point = locations[i][0];
        var lat = locations[i][1];
        var long = locations[i][2];
        var data =  locations[i][3];

        var latlngset = new google.maps.LatLng(lat, long);

        var marker = new google.maps.Marker({  
            map: map, title: point , position: latlngset  
        });
        
        map.setCenter(marker.getPosition());

        var content = 'Variables: ' + data;     

        var infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
            return function() {
                infowindow.setContent(content);
                infowindow.open(map,marker);
            };
        })(marker,content,infowindow)); 
    }
}

$('#button-new').click(function(e){
    location.href ="./adminPrepare.html";
});