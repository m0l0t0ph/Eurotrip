var Game = {
    //Settings
    startQuesPts: 1000,
    penaltyDistance: 1000,
    quesPerRound: 10,
    distanceBonusQuestion: 100,
    
    pointsTotal: 0,
    questionNr: 0,
    hasMorePics: false,
    hasHint: false,
    
    /** Set up the game for the first time **/
    init: function() {
        Question.getCities();
        Map.load();
        
        var $getInfo = $('#getInfo');
        $getInfo.find('span:last').hide();
        $getInfo.find('b:last').hide();
        
        /** bind appropriate function to buttons **/
        $.blockUI.defaults.css = {};
        $('div#map_canvas').block({ message: null, overlayCSS: { opacity: 0} });
        $('#getMorePics').click(function(event) {
            event.preventDefault();
            Answers.currentCity.images = [];
            Question.getPictures(false);
            if (Game.hasMorePics === false) {
                //$(this).fadeOut();
                //Game.hasMorePics = true;
                Game.calculatePoints(null, -200);
            }
        });
        
        $('#getInfo').click(function(event) {
            event.preventDefault();
            Question.displayHint();
            if (Game.hasHint === false) {
                Game.calculatePoints(null, -400);
                Game.hasHint = true;
            }
        });
        
        $('#answer a').click(function(event) {
            event.preventDefault();
            Question.generate();
        });
    },
    setQuestionNr: function() {
        if(this.questionNr < this.quesPerRound) {
            this.questionNr++;
            
        } else {
            this.newRound();
        }
            
    },
    newRound: function() {
        this.pointsTotal = 0;
        this.questionNr = 0;
        Answers.reset();
        Question.generate();
    },
    
    /** Calculate points **/
    calculatePoints: function(entfernung, diffPoints) {
    	var points = 0;
    	if(entfernung !== null) {
    	    entfernung = Math.round(entfernung);
        	if(entfernung < this.penaltyDistance) {
        	    points = this.startQuesPts - entfernung;
        	}
        	this.pointsTotal += points;
    	}
    	if(diffPoints !== null) {
    	    this.pointsTotal += diffPoints;
        }
        this.setPoints();
    	return points;
    },
    setPoints: function() {
        var points = $('#points'),
    	    currCount = parseInt(points.html());
    	points.text(this.pointsTotal);
        /**points.text(currCount + 7);
        if (currCount + 7 <= this.pointsTotal) {
            setTimeout('Game.setPoints()', 15);
        } else {
    		points.text(this.pointsTotal);
    	}**/
    }
};

var Map = {
    markersArray: [],
    infowindowsArray: [],
    map: {},
    directionsService : {},
    directionsDisplay: {},
    
    /** basic map settings **/
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
    
    /** load map **/
    load: function() {
        this.map = new google.maps.Map(document.getElementById("map_canvas"), this.config.myOptions);
        var styledMapOptions = {
    		    map: this.map,
    		    name: "Spiel" },
    	    gameMapType =  new google.maps.StyledMapType(this.config.mapStyle, styledMapOptions);
        
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer(Map.config.rendererOptions);
    	
    	
    	
    	this.map.mapTypes.set('Spiel', gameMapType);
    	this.map.setMapTypeId('Spiel');

    	//auf den Klick reagieren, in dem getDistance() aufgerufen wird
    	google.maps.event.addListener(this.map, 'click', function(event) {
    		Map.getDistance(event.latLng);
    	});
    },
    
    /** get distance to actual location from Maps API **/
    getDistance: function(clickedLocation) {
    	var ergebnisArray = [],
    	    userInput = clickedLocation,
    	    request = {
    		    origin:                     Answers.currentCity.name, 
    		    destination:                userInput,
    		    provideRouteAlternatives:   false,
    		    travelMode:                 google.maps.DirectionsTravelMode.DRIVING,
    		    unitSystem:                 google.maps.DirectionsUnitSystem.METRIC
    	        };
        this.directionsDisplay.setMap(this.map);
    	this.directionsService.route(request, function(result, status) {
    		
    		if (status == google.maps.DirectionsStatus.OK) {
    			Map.directionsDisplay.setDirections(result);
    			ergebnisArray[0] = Math.round(result.routes[0].legs[0].distance.value/1000);
    			ergebnisArray[1] = result.routes[0].legs[0].duration.text;
                
                ergebnisArray[2] = Game.calculatePoints(ergebnisArray[0], null);
                
                Question.displayAnswer(ergebnisArray);
                if (ergebnisArray[0] <= Game.distanceBonusQuestion) {
                    Question.displayBonusQuestion();
                }
            }
    	});
    },
    
    reset: function() {
        //map.setCenter(Map.config.myOptions.center);
        //Entfernt alle Marker und Infowindows
    	if (this.markersArray) {
    		for (i in this.markersArray) {
    			this.markersArray[i].setMap(null);
    		}
    		this.markersArray.length = 0;
    	}
    	if (this.infowindowsArray) {
    		for (i in this.infowindowsArray) {
    			this.infowindowsArray[i].setMap(null);
    		}
    		this.infowindowsArray.length = 0;
    	}
    }
};

var Question = {
    /** loads a selection of ten cities **/
    getCities: function() {
        $.getJSON("getCity.php", function(data) {
    	  for(var i = 0, limit = data.length; i < limit; i += 1) {
    	      var tempCity = new City();
    	      tempCity.name = data[i][0];
    	      tempCity.dbPediaUrl = data[i][1];
    	      tempCity.country = data[i][2];
    	      Answers.cities.push(tempCity);
    	  }
    	  
    	  console.log(Answers.cities);
    	  Question.generate();
    	});
    },
    
    generate: function() {
        Game.setQuestionNr();
        
        var $getInfo = $('#getInfo');
        $getInfo.find('b:last').hide();
        $getInfo.find('b:first').show();
        
        /** pick last city as question, cache it and remove it from array (stack...) **/
        Answers.currentCity = Answers.cities.pop();
        
        if (Game.questionNr === 1) {
            this.getPictures(false);
        } else {
            /** Marker usw. entfernen und Karte zentrieren.
                evtl. zu radikal hier die komplette Karte neuzuladen **/
            Map.load();
            
            Game.hasMorePics = false;
            Game.hasHint = false;
            
            this.displayQuestion();
        }
        /** preload pictures for next question **/
        this.getPictures(true);
        
        /** preload abstract for better responsivness **/
        this.getHint();
        
        /** preload bonus question for better responsivness **/
        this.getBonusQuestion();
        
        console.log("Elements left: " + Answers.cities.length);
    },
    
    /** loads part of abstract as a hint to the player **/
    getHint: function() {
        $.getJSON("getInfo.php", 
                { city:         Answers.currentCity.name,
                  dbPediaUrl:   Answers.currentCity.dbPediaUrl 
                  }, function(data) {
                      Answers.currentCity.abstract = data;
                      console.log(Answers.currentCity.abstract);
        });
    },
    
    /** loads pictures (with preloading option) **/
    getPictures: function(isPreload) {
        var location = Answers.cities[Answers.cities.length-1];
        if (!isPreload) {
            location = Answers.currentCity;
        }
        $.getJSON("getPictures.php", 
        { locName: location.name,
            dbPediaUrl: location.dbPediaUrl },
            function(data) {
                location.images.push(data.img_url1);
                location.images.push(data.img_url2);
                location.images.push(data.img_url3);
                console.log(location.images);
                if(location.images.length === 3 && !isPreload) {
                    Question.displayQuestion();
                }
        });
    },
    getBonusQuestion: function() {
        var countries = [],
            ran = 0,
            citiesLength = Answers.cities.length;
        //console.log("length: " + citiesLength);
        countries.push(Answers.currentCity.country);
        for(var i = 0; countries.length < 3; i += 1) {
            ran = Math.floor(Math.random()*citiesLength);
            //console.log(ran);
            if($.inArray(Answers.cities[ran].country, countries) === -1) {
                countries.push(Answers.cities[ran].country);
            }
        }
        
        //console.log(countries);
        $.getJSON("getFlag.php", 
        { countries: countries },
            function(data) {
                $.each(data, function(country, pic) {
                    
                });
                console.log(Bonus);
        });
    },
    displayBonusQuestion: function() {
        $.each(data, function(country, pic) {
            console.log(country + ": "+ pic + "\n");
        });
        $('#bonusQuestion').fadeIn();
    },
    
    /** displays the hint text **/
    displayHint: function() {
        $('#hintText').html(Answers.currentCity.abstract);
        if($('#hint').is(":visible")) {
            this.picturesSlide("up");
        }
        if($('#hint').is(":hidden")) {
            this.picturesSlide("down");
        }
    },
    
    /** slide effect, takes "up" or "down" as a parameter **/
    picturesSlide: function(direction) {
        var $getInfo = $('#getInfo');
        if(direction === "up") {
            $('div.polaroid').each(function(i) {
                var move = i*-20;
                $(this).animate({
                    top: move+'px'
                    }, 400);
            });
            $('#hint').slideUp();
            
            $getInfo.find('span:last').hide();
            $getInfo.find('span:first').show();
        }
         
        if(direction === "down") {
            var height = $('#hint').outerHeight(true);
            $('div.polaroid').each(function(i) {
                if(i > 0) {
                    var move = i*height/2;
                    $(this).animate({
                        top: '-='+move
                        }, 400);
                }
            });
            $('#hint').slideDown();
            $getInfo.find('span:first').hide();
            $getInfo.find('span:last').show();
            $getInfo.find('b:first').hide();
            $getInfo.find('b:last').show();
        }
    },
    
    /** displays the pictures of the question **/
    displayQuestion: function() {
        $('div.polaroid img').each(function(i) {
            $(this).attr('src', Answers.currentCity.images[i]);
        });
        
        this.picturesSlide("up");
        
        if($('#bonusQuestion').is(":visible")) {
        $('#bonusQuestion').fadeOut('fast');
        }
        if($('#getMorePics').is(":hidden")) {
            $('#getMorePics').fadeIn('fast');
        }
        if($('#getInfo').is(":hidden")) {
            $('#getInfo').fadeIn('fast');
        }
        
        $('#answer').hide();
        $('#progress').html("Question " + Game.questionNr + " out of 10:");

        
        if($('.polaroid').is(":hidden")) {
                $('.polaroid').fadeIn();
        }
        $('div#map_canvas').unblock();
    },
  
   /** displays the answer screen **/
   displayAnswer: function(result) {
   	   //Game.setPoints();
       
       $('#navigation > a').hide();
       $('#hint').hide();
       $('.polaroid').hide();
       $('div#map_canvas').block({ message: null, overlayCSS: { opacity: 0} });
       var answer = "<b>"+result[2] +" points!</b>" +
   	                    "The correct answer is:<b>" + Answers.currentCity.name + "</b>" +
   	                    "You missed it by " + result[0] + "km. <br>" +
   	                    "That would mean a " + result[1] + " drive.";
   	   $('#answerText').html(answer);
       $('#answer').fadeIn('fast');
       
       this.writeResult();
   },
   
   /** outputs the collected information to a file, database etc. **/
   writeResult: function() {
       $.post("writeResult.php", { city: Answers.currentCity } );
   }
};

/** Object for storing the answers **/
var Answers = {
    currentCity: {},
    cities: [],
    reset: function() {
        this.currentCity = {},
        this.cities = [];
    }
};
var Bonus = {
    obj : {
        country: "",
        flagUrl: ""
    },
    flags: []
};

/** Object for a city with its properties and reset method **/
var City = function() {
    this.name = "";
    this.dbPediaUrl = "";
    this.country = "";
    this.abstract = "";
    this.sights = [];
    this.images = [];
    this.reset = function() {
        this.name = "";
        this.abstract = "";
        this.country = "";
        this.dbPediaUrl = "";
        this.sights = [];
        this.images = [];
    }
};

/** Helper Functions **/
function random(from, to){
       return Math.floor(Math.random() * (to - from + 1) + from);
}

$(function() {
   
   Game.init();
   
});