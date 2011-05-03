$(function() {
   loadMap();
   getQuestions();
 });




var map;
var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var routeStatus;
var pointsTotal = 0;
var markersArray = [];
var infowindowsArray = [];
var directionsDisplay,
		end_address,
		end_location;

function loadMap() {
	var myLatlng = new google.maps.LatLng(48.99643826296838, 8.397674685546917);

	var rendererOptions = {
		preserveViewport: true
	}
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
	var mapStyle = [
	{
		featureType: "all",
		elementType: "labels",
		stylers: [
		{ visibility: "off" }
		]
	},
	{
		featureType: "administrative",
		elementType: "geometry",
		stylers: [
		{ visibility: "off" }
		]
	},
	{
		featureType: "administrative.country",
		elementType: "geometry",
		stylers: [
		{ visibility: "on" }
		]
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [
		{ visibility: "off" }
		]
	}
	];
	var myOptions = {
		zoom: 5,
		center: myLatlng
		//mapTypeId: google.maps.MapTypeId.HYBRID
	}
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	directionsDisplay.setMap(map);
	var styledMapOptions = {
		map: map,
		name: "Spiel"
	}

	var jayzMapType =  new google.maps.StyledMapType(mapStyle, styledMapOptions);

	map.mapTypes.set('Spiel', jayzMapType);
	map.setMapTypeId('Spiel');

	//auf den Klick reagieren, in dem getDistance() aufgerufen wird
	google.maps.event.addListener(map, 'click', function(event) {
		getDistance(event.latLng);
	});
}


function getDistance(clickedLocation) {
	var entfernung;
	var start = "Karlsruhe";
	var end = clickedLocation;
	var request = {
		origin: start, 
		destination: end,
		provideRouteAlternatives: false,
		travelMode: google.maps.DirectionsTravelMode.DRIVING,
		unitSystem: google.maps.DirectionsUnitSystem.METRIC
	};

	directionsService.route(request, function(result, status) {
		routeStatus = status;
		var ergebnisArray = [];
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
			//entfernung = Math.round(result.routes[0].legs[0].distance.value/1000);
			//entfernung /= 1000;
			ergebnisArray[0] = Math.round(result.routes[0].legs[0].distance.value/1000);
			ergebnisArray[1] = result.routes[0].legs[0].duration.text;
			ergebnisArray[2] = result.routes[0].legs[0].end_address;
			ergebnisArray[3] = result.routes[0].legs[0].end_location;
			placeMarker(clickedLocation, ergebnisArray);
			calcPoints(ergebnisArray[0]);
		}
	});
}

function deleteOverlays() {
	//Entfernt alle Marker und Infowindows
	if (markersArray) {
		for (i in markersArray) {
			markersArray[i].setMap(null);
		}
		markersArray.length = 0;
	}
	if (infowindowsArray) {
		for (i in infowindowsArray) {
			infowindowsArray[i].setMap(null);
		}
		infowindowsArray.length = 0;
	}
}

function placeMarker(location, ergebnisArray) {
	//alle vorherigen Marker und Blasen entfernen
	deleteOverlays();
	//neuer Marker
	var marker = new google.maps.Marker({
		position: location, 
		map: map
	});
	markersArray.push(marker);
	
	//var bubbleContent = "Position " + location + "<br>Entfernung: " + Math.round(ergebnisArray[0]) + " km<br>" + ergebnisArray[2]
	//neue Infoblase
	var bubbleContent = "<p class=\"infowindow\">Du liegst " + ergebnisArray[0] + "km daneben! <br>Da musst du noch " + ergebnisArray[1] + " fahren!</p>";
	var infowindow = new google.maps.InfoWindow(
		{ content: bubbleContent,
		size: new google.maps.Size(50,50),
		position: location
	});
	infowindow.open(map);
	infowindowsArray.push(infowindow);
	//Karte auf den geklickten Ort zentrieren
	map.setCenter(location);
}

function getQuestions() {
	$.getJSON("getQuestions.php", function(data){
	  //console.log(data.coordinates);
	  var images = "<img class='thumbnail' src='"+ data.img_url1 + "'><img class='thumbnail' src='"+ data.img_url2 + "'><img class='thumbnail' src='"+ data.img_url3 + "'>";
	  $('#questions').append(images);
	});
}

function calcPoints(entfernung) {
	pointsTotal += Math.round(entfernung);
	
	//Hochzählanimation
	incCounter();
}

function incCounter() {
    var points = $('#points');
		var currCount = parseInt(points.html());
    points.text(currCount+7);
    if (currCount+7 <= pointsTotal) {
        setTimeout('incCounter()',25);
    }
		else {
			points.text(pointsTotal);
		}
}
