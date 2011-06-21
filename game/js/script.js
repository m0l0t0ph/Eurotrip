var Game = {
    /** Basic gameplay settings, change to your needs **/
    startQuesPts: 1000,
    penaltyDistance: 1000,
    quesPerRound: 10,
    distanceBonusQuestion: 200,
    hintPoints: -400,
    morePicsPoints: -200,
    
    /** these control the flow of things **/
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
            
            if (Game.hasMorePics === false) {
                Answers.currentCity.images = [];
                Question.displayQuestion(1);
                $(this).block({ message: null });
                Game.hasMorePics = true;
                Game.calculatePoints(null, Game.morePicsPoints);
            }
        });
        
        $('#getInfo').click(function(event) {
            event.preventDefault();
            Question.displayHint();
            if (Game.hasHint === false) {
                Game.calculatePoints(null, Game.hintPoints);
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
        this.hasMorePics = false;
        this.hasHint = false;
        Answers.reset();
        Question.getCities();
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
    		    origin:                     Answers.currentCity.name + ", " + Answers.currentCity.country, 
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
    	      Answers.countries.push(data[i][2]);
    	      Answers.cities.push(tempCity);
    	  }
    	  
    	  console.log(Answers.cities);
    	  Question.generate();
    	});
    },
    
    /** sets up each question **/
    generate: function() {
        Game.setQuestionNr();
        Answers.bonus = [];
        
        
        $('#answer').fadeOut();
        $('#bonusQuestion').fadeOut();
        
        
        var $getInfo = $('#getInfo');
        $getInfo.find('b:last').hide();
        $getInfo.find('b:first').show();
        
        /** pick last city as question, cache it and remove it from array (stack...) **/
        Answers.currentCity = Answers.cities.pop();
        console.log(Answers.currentCity);
        
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
        
    },
    
    /** loads part of abstract as a hint to the player **/
    getHint: function() {
        $.getJSON("getInfo.php", 
                { city:         Answers.currentCity.name,
                  dbPediaUrl:   Answers.currentCity.dbPediaUrl 
                  }, function(data) {
                      if(data === "") {
                          $('#getHint').block({ message: null });
                      }
                      Answers.currentCity.abstract = data;
                      console.log(Answers.currentCity.abstract);
        });
    },
    
    /** loads pictures (with preloading option) **/
    getPictures: function(isPreload) {
        var location = Answers.cities[Answers.cities.length - 1];
        if (!isPreload || Answers.cities.length == 0) {
            location = Answers.currentCity;
        }
        console.log("bilder fuer " + location.name);
        $.getJSON("getPictures2.php", 
        { 'location': location.name },
            function(data) {
                var city = data.City;
                location.photoCollection = city.PhotoCollection;
                console.log(city);
                $.each(city.Locations, function(key, value) {
                    var tempSight = new Sight();
                    tempSight.name = value.Name;
                    tempSight.dbPediaUrl = value.URL;
                    tempSight.photoCollection = value.PhotoCollection;
                    $.each(value.PictureURLs[0], function(key, value) {
                        tempSight.pictures.push(value);
                    });
                    $.each(value.PictureURLs[1], function(key, value) {
                        tempSight.pictures.push(value);
                    });
                    
                    location.sights.push(tempSight);
                });
                console.log(location.sights);
                
                if(!isPreload) {
                    Question.displayQuestion();
                }
        });
    },
    
    /** gets the data for the Bonus Question (flags of 3 different countries) **/
    getBonusQuestion: function() {
        var countries = [],
            ran = 0,
            citiesLength = Answers.countries.length;
        
        countries.push(Answers.currentCity.country);
        
        for(var i = 0; countries.length < 3; i += 1) {
            ran = Math.floor(Math.random()*citiesLength);
            
            /** no duplicates and avoid UK since the link is wrong in DBpedia **/
            if($.inArray(Answers.countries[ran], countries) === -1 && Answers.countries[ran] !== "United Kingdom") {
                countries.push(Answers.countries[ran]);
            }
        }
        
        $.getJSON("getFlag.php", 
        { countries: countries },
            function(data) {
                $.each(data, function(country, pic) {
                    var obj = {
                        name: country,
                        flag: pic
                    };
                    Answers.bonus.push(obj);
                });
                console.log(Answers.bonus);
        });
    },
    
    /** checks if the given answer was correct **/
    evalBonusQuestion : function(country) {
        if(country === Answers.currentCity.country) {
            Game.calculatePoints(null, 100);
            $('#bonusQuestion').find('form').fadeOut('fast', function() {
                $('#bonusCorrect').fadeIn('fast');
            });
        } else {
            $('#bonusQuestion').find('form').fadeOut('fast', function() {
                $('#bonusWrong').fadeIn('fast');
            });
        }
    },
    
    /** displays the Bonus Question **/
    displayBonusQuestion: function() {
        /** reset visibility **/
        $('#bonusQuestion b').hide();
        $('#bonusQuestion form').show();
        
        $('#bonusQuestion label').each(function(i) {
            $(this).find('input').attr('value', Answers.bonus[i].name);
            $(this).find('img').attr('src', Answers.bonus[i].flag);
            $(this).find('input').click(function(event) {
                event.preventDefault();
                var country = $(this).val();
                Question.evalBonusQuestion(country);
            });
        });
        $('#bonusQuestion').show();
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
    displayQuestion: function(batch) {
        batch = typeof(batch) != 'undefined' ? batch : 0;
        if( $('#hint').is(':visible') ) {
            this.picturesSlide("up");
        }
        
        $('.polaroid img').each(function(i) {
            $(this).attr('src', Answers.currentCity.sights[i].pictures[batch]);
        });
        $('.polaroid').fadeOut('slow', function() {
            
            $(this).fadeIn('slow');
        });
        
        $('#progress').html("Question " + Game.questionNr + " out of 10:");

        $('div#map_canvas').unblock();
    },
  
   /** displays the answer screen **/
   displayAnswer: function(result) {
   	   var windowWidth = window.innerWidth,
           windowHeight = window.innerHeight,
           left = "",
           top = "";
       
       $('#map_canvas').block({ message: null, overlayCSS: { opacity: 0.4} });
       var answer = "<b>"+result[2] +" points!</b>" +
   	                    "The correct answer is:<b>" + Answers.currentCity.name + "</b>" +
   	                    "You missed it by " + result[0] + "km. <br>" +
   	                    "That would mean a " + result[1] + " drive.";
   	   $('#answerText').html(answer);
   	   
   	   /** display Bonus Question if player was close enough **/
   	   if (result[0] <= Game.distanceBonusQuestion) {
           this.displayBonusQuestion();
       }
       
   	   left = (windowWidth - $('#answer').outerWidth())/2;
   	   top = (windowHeight - $('#answer').outerHeight())/2;
       $('#answer').css({ 
           "left": left+"px",
           "top": top+"px"})
           .fadeIn();
       
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
    countries: [],
    bonus: [],
    cities: [],
    reset: function() {
        this.currentCity = {};
        this.countries = [];
        this.cities = [];
        this.bonus = [];
    }
};

/** Object for a city with its properties and reset method **/
var City = function() {
    this.name = "";
    this.dbPediaUrl = "";
    this.country = "";
    this.abstract = "";
    this.sights = [];
    this.photoCollection = "";
    this.reset = function() {
        this.name = "";
        this.dbPediaUrl = "";
        this.country = "";
        this.abstract = "";
        this.dbPediaUrl = "";
        this.sights = [];
        this.photoCollection = "";
    }
};

var Sight = function() {
    this.name = "";
    this.dbPediaUrl = "";
    this.photoCollection = "";
    this.pictures = [];
};

/** Helper Function **/
function random(from, to){
       return Math.floor(Math.random() * (to - from + 1) + from);
}

/** onReady **/
$(function() {
   
   Game.init();
   
});