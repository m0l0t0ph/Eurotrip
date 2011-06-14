$(function() {
   
   Game.init();
   $.blockUI.defaults.css = {};
   $('div#map_canvas').block({ message: null, overlayCSS: { opacity: 0} });
   $('#getMorePics').click(function(event) {
	    event.preventDefault();
	    Answers.city[Answers.currentPointer].images = [];
	    Question.getPictures();
	});
	$('#getInfo').click(function(event) {
    	    event.preventDefault();
    	    Question.displayHint();
    });
    $('#answer a').click(function(event) {
		    event.preventDefault();
    	    Question.generate();
    });
 });
 
var markersArray = [];
var infowindowsArray = [];

var Game = {
    //Settings
    startQuesPts: 1000,
    penaltyDistance: 1000,
    quesPerRound: 10,
    
    pointsTotal: 0,
    questionNr: 0,
    
    //Setup the game for the first time
    init: function() {
        Question.generate();
        Map.load();
    },
    setQuestionNr: function() {
        if(this.questionNr < this.quesPerRound) {
            this.questionNr++;
            
        }
        else
            this.newRound();
    },
    newRound: function() {
        this.pointsTotal = 0;
        this.questionNr = 0;
        Answers.reset();
        Question.generate();
    },
    //Calculate points
    calcPoints: function(entfernung) {
    	var points = 0;
    	entfernung = Math.round(entfernung);
    	if(entfernung < Game.penaltyDistance) {
    	    points = Game.startQuesPts - entfernung;
    	}
    	Game.pointsTotal += points;

    	//Hochzählanimation
    	incCounter();
    	return points;
    }
};

var Map = {
    // Basic Map Settings
    config: {
        myLatlng: new google.maps.LatLng(48.99643826296838, 8.397674685546917),
        rendererOptions: { preserveViewport: true },
        mapStyle: [
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
        ],
        myOptions: {
                zoom: 5,
                center: new google.maps.LatLng(48.99643826296838, 8.397674685546917),
                mapTypeControl: false,
                navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL, position: google.maps.ControlPosition.TOP_RIGHT },
                streetViewControl: false,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            }
    },
    
   //Karte laden
    load: function() {
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer(Map.config.rendererOptions);
    	map = new google.maps.Map(document.getElementById("map_canvas"), Map.config.myOptions);
    	
    	styledMapOptions = {
    		map: map,
    		name: "Spiel"
    	};
    	var gameMapType =  new google.maps.StyledMapType(Map.config.mapStyle, styledMapOptions);

    	map.mapTypes.set('Spiel', gameMapType);
    	map.setMapTypeId('Spiel');

    	//auf den Klick reagieren, in dem getDistance() aufgerufen wird
    	google.maps.event.addListener(map, 'click', function(event) {
    		Map.getDistance(event.latLng);
    	});
    },
    
    //Entfernungsberechnung über GoogleMaps
    getDistance: function(clickedLocation) {
    	var userInput = clickedLocation;
    	var request = {
    		origin: Answers.city[Answers.currentPointer].name, 
    		destination: userInput,
    		provideRouteAlternatives: false,
    		travelMode: google.maps.DirectionsTravelMode.DRIVING,
    		unitSystem: google.maps.DirectionsUnitSystem.METRIC
    	};
        directionsDisplay.setMap(map);
    	directionsService.route(request, function(result, status) {
    		routeStatus = status;
    		var ergebnisArray = [];
    		if (status == google.maps.DirectionsStatus.OK) {
    			directionsDisplay.setDirections(result);
    			ergebnisArray[0] = Math.round(result.routes[0].legs[0].distance.value/1000);
    			ergebnisArray[1] = result.routes[0].legs[0].duration.text;
                
                ergebnisArray[2] = Game.calcPoints(ergebnisArray[0]);
                Map.showAnswer(ergebnisArray);
    			//Map.placeMarker(clickedLocation, ergebnisArray);
            }
    	});
    },
    showAnswer: function(result) {
        $('#navigation > a').hide();
        $('#hint').hide();
        $('.polaroid').hide();
        $('div#map_canvas').block({ message: null, overlayCSS: { opacity: 0} });
        var answer = result[2] +" points!<br>" +
    	                    "The correct answer is:<p>" + Answers.city[Answers.currentPointer].name + "</p>" +
    	                    "You missed it by " + result[0] + "km. <br>" +
    	                    "That would mean a " + result[1] + " drive.";
    	$('#answerText').html(answer);
        $('#answer').fadeIn('fast');
        
    },
    /**Deprecated**/
    placeMarker: function(location, ergebnisArray) {
        //alle vorherigen Marker und Blasen entfernen
    	Map.reset();
    	//neuer Marker
    	var marker = new google.maps.Marker({
    		position: location, 
    		map: map
    	});
    	markersArray.push(marker);

    	//var bubbleContent = "Position " + location + "<br>Entfernung: " + Math.round(ergebnisArray[0]) + " km<br>" + ergebnisArray[2]
    	//neue Infoblase
    	var bubbleContent = "<article class=\"overlay\">"+ ergebnisArray[2] +" Punkte!<br>" +
    	                    "Die richtig Antwort war " + Answers.city[Answers.currentPointer].name + ". <br>" +
    	                    "Du liegst " + ergebnisArray[0] + "km daneben. <br>" +
    	                    "Da musst du noch " + ergebnisArray[1] + " fahren.<br>" +
    	                    "<a id=\"nq\" href=\"#\">Nächste Frage</a></article>";

    	var infowindow = new google.maps.InfoWindow(
    		{ content: bubbleContent,
    		size: new google.maps.Size(50,50),
    		position: location
    	});
    	infowindow.open(map);

    	//Wenn Infowindow 'fertig', Link entsprechend bearbeiten
    	google.maps.event.addListener(infowindow, 'domready', function() {
    		var nq = $('#nq');
    		//nq.css('margin-top', '10px');
    		var infow = $('.infowindow');
    		infow.css('text-align', 'center');
    		nq.click(function(event) {
    		    event.preventDefault();
        	    Question.generate();
        	});
    	});
    	infowindowsArray.push(infowindow);
    	//Karte auf den geklickten Ort zentrieren
    	//map.setCenter(location);
    },
    reset: function() {
        //map.setCenter(Map.config.myOptions.center);
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
};

var Question = {
    generate: function() {
        Game.setQuestionNr();
        
        //Wenn 1. Frage, dann Städtenamen holen
        if(Game.questionNr == 1) {
            this.getCity();
        }
        else {
            /** Write collected data set to file **/
            Question.writeResult();
            
            /** Zuletzt gefragten Ort entfernen, damit er nicht wieder abgefragt wird **/
            Answers.removeElement(Answers.currentPointer);
            console.log("removed Element nr: " + Answers.currentPointer);
            Map.load();
            this.getSights();
        }
        
    },
    getCity: function() {
        $.getJSON("getCity.php", function(data) {
    	  for(var i=0, limit=data.length; i<limit; i++) {
    	      tempCity = new City();
    	      tempCity.name = data[i][0];
    	      tempCity.dbPediaUrl = data[i][1];
    	      Answers.city[i] = tempCity;
    	  }
    	  console.log(Answers.city);
    	  Question.getSights();
    	});
    },
    getSights: function() {
        var to = Answers.city.length;
        Answers.currentPointer = Math.floor(Math.random() * (to - 1));
        console.log(Answers.currentPointer);
        
        /** preload abstract for performance purposes **/
        Question.getHint();
        
        var city = Answers.city[Answers.currentPointer].name;
        console.log("getSights city: "+city);
        $.getJSON("getLocation.php",
                    { location: city }, 
                    function(data) {
    	                console.log("getSights data.locations: "+data.locations);
    	                if($.isArray(data.locations)) {
    	                    $.each(data.locations, function(i, value) {
        	                    Answers.city[Answers.currentPointer].sights.push(value);
        	                });
    	                }
    	                
    	                console.log(Answers.city);
    	                /** now that we have the sights, get the matching pictures **/
    	                Question.getPictures();
    	            });
    },
    getHint: function() {
        var dbPedia = Answers.city[Answers.currentPointer].dbPediaUrl;
        $.getJSON("getInfo.php", 
                { city:         Answers.city[Answers.currentPointer].name,
                  dbPediaUrl:   dbPedia 
                  }, function(data) {
                      Answers.city[Answers.currentPointer].abstract = data;
                  });
    },
    getPictures: function() {
        var dbPedia = Answers.city[Answers.currentPointer].dbPediaUrl;
        var location = [];
        location.push(Answers.city[Answers.currentPointer].name);
        console.log(location);
        for(var i=0; i<location.length; i++) {
            /*if(Answers.city[Answers.currentPointer].sights.length != 0) {
                location = Answers.city[Answers.currentPointer].sights[i];
            }*/
            
            console.log("getPictures location: "+location);
            $.getJSON("getPictures.php", 
            { locName: location[i],
              dbPediaUrl: dbPedia },
            function(data) {
                Answers.city[Answers.currentPointer].images.push(data.img_url1);
                Answers.city[Answers.currentPointer].images.push(data.img_url2);
                Answers.city[Answers.currentPointer].images.push(data.img_url3);
                console.log("image URL: " + Answers.city[Answers.currentPointer].images);
                if(Answers.city[Answers.currentPointer].images.length == 3) {
                    Question.displayQuestion();
                }
            });
        }
    },
    displayHint: function() {
        $('#hintText').html(Answers.city[Answers.currentPointer].abstract);
        
        var height = $('#hint').outerHeight(true);
        
        $('div.polaroid').each(function(i) {
            if(i>0) {
                var move = i*height/2;
                $(this).animate({
                    top: '-='+move
                    }, 600);
            }
        });
        $('#hint').slideDown('slow');
        $('#getInfo').fadeOut('fast');
    },
    displayQuestion: function() {
        $('div.polaroid img').each(function(i) {
            $(this).attr('src', Answers.city[Answers.currentPointer].images[i]);
        });
        $('div.polaroid').each(function(i) {
            var move = i*-20;
            $(this).animate({
                top: move+'px'
                }, 600);
        });
        if($('#getMorePics').is(":hidden")) {
            $('#getMorePics').fadeIn();
        }
        if($('#getInfo').is(":hidden")) {
            $('#getInfo').fadeIn();
        }
        if($('#hint').is(":visible")) {
            $('#hint').slideUp('slow');
        }
        
        $('#answer').hide();
        $('#progress').html("Question " + Game.questionNr + " out of 10:");
        var height = $('#hint').outerHeight(true);

        
        if($('.polaroid').is(":hidden")) {
                $('.polaroid').fadeIn();
        }
        $('div#map_canvas').unblock();


            
        },
   writeResult: function() {
       $.post("writeResult.php", { city: Answers.city[Answers.currentPointer]} );
   }
};

var Answers = {
    currentPointer: "",
    city: [],
    removeElement: function(i)   {
        Answers.city.splice(i, 1);
    },
    reset: function() {
        this.city = [];
    }
};

var City = function() {
    this.name = "";
    this.dbPediaUrl = "";
    this.abstract = "";
    this.sights = [];
    this.images = [];
    this.reset = function() {
        this.name = "";
        this.dbPediaUrl = "";
        this.sights = [];
        this.images = [];
    }
};

/** Helper Functions **/
function incCounter() {
    var points = $('#points');
		var currCount = parseInt(points.html());
    points.text(currCount+7);
    if (currCount+7 <= Game.pointsTotal) {
        setTimeout('incCounter()',15);
    }
		else {
			points.text(Game.pointsTotal);
		}
}

function random(from, to){
       return Math.round(Math.random() * (to - from + 1) + from);
}