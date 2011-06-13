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
    	    Question.getInfo();
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
        $('div#map_canvas').block({ message: null, overlayCSS: { opacity: 0} });
        var answer = result[2] +" points!<br>" +
    	                    "The correct answer is:<p>" + Answers.city[Answers.currentPointer].name + "</p>" +
    	                    "You missed it by " + result[0] + "km. <br>" +
    	                    "That would mean a " + result[1] + " drive.";
    	$('#answerText').html(answer);
        
        $('#hint').hide();
        $('.polaroid').hide();
        $('#answer').fadeIn('fast');
        
    },
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
    //Frage erzeugen
    generate: function() {
        Game.setQuestionNr();
        
        //Wenn 1. Frage, dann Städtenamen holen
        if(Game.questionNr == 1) {
            this.getCity();
        }
        else {
            //Zuletzt gefragten Ort entfernen, damit er nicht wieder abgefragt wird
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
        //console.log(Answers.city);
        var to = Answers.city.length;
        Answers.currentPointer = Math.floor(Math.random() * (to - 1));
        console.log(Answers.currentPointer);
        //Answers.currentPointer = Math.round(Math.random()*10);
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
    	                Question.getPictures();
    	            });
    },
    getInfo: function() {
        var dbPedia = Answers.city[Answers.currentPointer].dbPediaUrl;
        $.getJSON("getInfo.php", 
                { city: Answers.city[Answers.currentPointer].name,
                  dbPediaUrl: dbPedia }, function(data) {
            $('#hintText').html(data);
            
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
                    Question.display();
                }
            });
        }
    },
    display: function() {
            $('#getInfo').fadeIn();
            $('#answer').hide();
            $('#progress').html("Question " + Game.questionNr + " out of 10:");
            var height = $('#hint').outerHeight(true);
            $('#hint').slideUp('slow');
            $('div.polaroid').each(function(i) {
                var move = i*-20;
                $(this).animate({
                    top: move+'px'
                    }, 600);
                });
            //$('div.polaroid').fadeOut('fast', function() {
                $('div.polaroid img').each(function(i) {
                    $(this).attr('src', Answers.city[Answers.currentPointer].images[i]);
                });
                //$(this).fadeIn('fast');
                $('div#map_canvas').unblock();
            //});
            
            //Schreibe unsere gesammelten Daten in eine Datei
            Question.writeResult();
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
/**
{"name":"Essen","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Essen","sights":"","images":["http:\/\/farm3.static.flickr.com\/2593\/3915292287_e7208ce0bb_m.jpg","http:\/\/farm3.static.flickr.com\/2512\/3915722217_82aeb049e4_m.jpg","http:\/\/farm3.static.flickr.com\/2784\/4398785105_f47f92c518_m.jpg"],"reset":"undefined"}
{"name":"Lyon","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Lyon","sights":"","images":["http:\/\/farm1.static.flickr.com\/216\/447045880_265a2b1713_m.jpg","http:\/\/farm3.static.flickr.com\/2563\/3929341945_b87d251255_m.jpg","http:\/\/farm5.static.flickr.com\/4106\/5204351388_6ae082ebf0_m.jpg"],"reset":"undefined"}
{"name":"Edinburgh","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Edinburgh","sights":"","images":["http:\/\/farm4.static.flickr.com\/3026\/2744888752_da26564b80_m.jpg","http:\/\/farm4.static.flickr.com\/3085\/2725046931_a3e4149f8a_m.jpg","http:\/\/farm4.static.flickr.com\/3153\/2850925558_fbafb220e3_m.jpg"],"reset":"undefined"}
{"name":"Kiel","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Kiel","sights":"","images":["http:\/\/farm1.static.flickr.com\/138\/324646563_8cd634124f_m.jpg","http:\/\/farm5.static.flickr.com\/4023\/4441728930_232d52f840_m.jpg","http:\/\/farm3.static.flickr.com\/2693\/4026300779_175028ee6c_m.jpg"],"reset":"undefined"}
{"name":"Aachen","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Aachen","sights":"","images":["http:\/\/farm5.static.flickr.com\/4122\/4814436023_690539471a_m.jpg","http:\/\/farm4.static.flickr.com\/3234\/2840651968_01557e6f41_m.jpg","http:\/\/farm5.static.flickr.com\/4037\/4309526785_7c038bcc4b_m.jpg"],"reset":"undefined"}
{"name":"Helsinki","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Helsinki","sights":["Suomenlinna","Sibelius monument","Museum of Cultures, Helsinki","Kiasma, Helsinki","Ateneum","Eduskuntatalo","Helsinki City Art Museum","Finlandia Hall, Helsinki","Seurasaari","Helsinki Olympic Stadium"],"images":["http:\/\/farm1.static.flickr.com\/74\/191476713_2590710b39_m.jpg","http:\/\/farm1.static.flickr.com\/20\/73755547_36dcc65271_m.jpg","http:\/\/farm1.static.flickr.com\/4\/4108415_453fca2a8c_m.jpg"],"reset":"undefined"}
{"name":"Bochum","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Bochum","sights":"","images":["http:\/\/farm4.static.flickr.com\/3154\/2769848959_f9ab967951_m.jpg","http:\/\/farm4.static.flickr.com\/3283\/2770690256_2ae7680109_m.jpg","http:\/\/farm4.static.flickr.com\/3251\/2770686608_a0659c4829_m.jpg"],"reset":"undefined"}
{"name":"Turin","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Turin","sights":["Royal Palace of Turin","Palazzo Madama","Cathedral of Saint John the Baptist","Palatine Towers","Observatory of Turin","Mole Antonelliana"],"images":["http:\/\/farm4.static.flickr.com\/3132\/2874281671_9fd33d7122_m.jpg","http:\/\/farm1.static.flickr.com\/218\/519568420_895355f139_m.jpg","http:\/\/farm4.static.flickr.com\/3190\/2872425749_bccc7e1f60_m.jpg"],"reset":"undefined"}
{"name":"Homyel","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Homyel","sights":"","images":["http:\/\/farm5.static.flickr.com\/4069\/4411543643_0bff9e7333_m.jpg","http:\/\/farm3.static.flickr.com\/2803\/4300632935_7171fc2e87_m.jpg","http:\/\/farm4.static.flickr.com\/3395\/3632493896_759cd2d9f5_m.jpg"],"reset":"undefined"}
{"name":"Lyon","dbPediaUrl":"http:\/\/dbpedia.org\/page\/Lyon","sights":"","images":["http:\/\/farm5.static.flickr.com\/4069\/4411543643_0bff9e7333_m.jpg","http:\/\/farm3.static.flickr.com\/2803\/4300632935_7171fc2e87_m.jpg","http:\/\/farm4.static.flickr.com\/3395\/3632493896_759cd2d9f5_m.jpg"],"reset":"undefined"}
**/