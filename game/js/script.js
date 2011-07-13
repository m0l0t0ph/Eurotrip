// All work done by Clemens Stolle 
// Copyright 2011
// This script controls the UI and the gameplay of "Eurotrip"


// Object for storing the answers 
var Answers = {
    currentCity: {},
    countries: [],
    bonus: [],
    cities: [],
    reset: function () {
        this.currentCity = {};
        this.countries = [];
        this.cities = [];
        this.bonus = [];
    }
};

// Object for a city with its properties and reset method 
var City = function () {
    this.name = "";
    this.dbPediaUrl = "";
    this.photoCollection = "";
    this.country = "";
    this.hint = "";
    this.sights = [];
    this.playerDistance = 0;
    this.joker = 0;
};

var Sight = function () {
    this.name = "";
    this.dbPediaUrl = "";
    this.photoCollection = "";
    this.pictures = [];
};

var Game = {
    // Basic gameplay settings, change to your needs 
    startQuesPts: 1000,
    penaltyDistance: 1000,
    quesPerRound: 10,
    distanceBonusQuestion: 200,
    hintPoints: -400,
    morePicsPoints: -200,
    bonusPoints: 100,
    
    // these control the flow of things 
    pointsTotal: 0,
    questionNr: 0,
    hasMorePics: false,
    hasHint: false,
    
    setQuestionNr: function () {
        if (this.questionNr < this.quesPerRound) {
            this.questionNr = this.questionNr + 1;
        } 
        else {
            var $endRound = $('#endOfRound');
            $endRound.find('b').html(this.pointsTotal + " Points");
            this.displayDialog($endRound);
        }
    },
    
    newRound: function () {
        this.pointsTotal = 0;
        this.questionNr = 0;
        this.hasMorePics = false;
        this.hasHint = false;
        Answers.reset();
        Question.getCities();
    },
    
    // Calculate points
    calculatePoints: function (entfernung, diffPoints) {
        var points = 0;
        if (entfernung !== null) {
            entfernung = Math.round(entfernung);
            if (entfernung < this.penaltyDistance) {
                points = this.startQuesPts - entfernung;
            }
            this.pointsTotal += points;
        }
        if (diffPoints !== null) {
            this.pointsTotal += diffPoints;
        }
        this.setPoints();
        return points;
    },
    setPoints: function () {
        var points = $('#points');
        points.text(this.pointsTotal);
        // currCount = parseInt(points.html(), 10);
        // points.text(currCount + 7);
        // if (currCount + 7 <= this.pointsTotal) {
        //             setTimeout('Game.setPoints()', 15);
        //         } else {
        //          points.text(this.pointsTotal);
        //      }
    },
    
    // displays the passed element (jQuery object) as a dialog
    displayDialog: function ($element) {
        var windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            left = 0,
            top = 0;

        $('#map_canvas').block({ message: null, overlayCSS: { opacity: 0.4} });
        left = (windowWidth - $element.outerWidth()) / 2;
        top = (windowHeight - $element.outerHeight()) / 2;
        $element.css({ 
            "left": left + "px",
            "top": top + "px" 
        }).fadeIn();
    }
};

var Question = {
    // loads a selection of ten cities 
    getCities: function () {
        $.getJSON("getCity.php", function (data) {
            var i,
                tempCity, 
                limit;
            for (i = 0, limit = data.length; i < limit; i += 1) {
                tempCity = new City();
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
    
    // sets up each question 
    generate: function () {
        Game.setQuestionNr();
        Answers.bonus = [];
        
        $('#answer').fadeOut();
        $('#bonusQuestion').fadeOut();
        
        var $getInfo = $('#getInfo');
        $getInfo.find('b:last').hide();
        $getInfo.find('b:first').show();
        $getInfo.unblock();
        
        // pick last city as question, cache it and remove it from array (stack...) 
        Answers.currentCity = Answers.cities.pop();
        console.log(Answers.currentCity);
        
        if (Game.questionNr === 1) {
            this.getPictures(false);
            
            // preload pictures for the other questions
            // helps us hide the long loading times of getPictures2.php 
            for (var i=1; i < 10; i += 1) {
                this.getPictures(true, i);
            }
        } else {
            // Marker usw. entfernen und Karte zentrieren, evtl. zu radikal hier die komplette Karte neuzuladen 
            Map.load();
            
            // reset help buttons
            Game.hasMorePics = false;
            Game.hasHint = false;
            $('#getMorePics').unblock();
            
            this.displayQuestion();
        }
        
        // preload hint for better responsivness 
        this.getHint();
        
        // preload bonus question for better responsivness 
        this.getBonusQuestion();
        
    },
    
    // loads part of hint as a hint to the player 
    getHint: function () {
        var queryString = Answers.currentCity.name.replace(/ /g, "_");
        $.getJSON("getInfo.php", { city: queryString, dbPediaUrl: Answers.currentCity.dbPediaUrl }, function (data) {
            if (!data) {
                $('#getInfo').block({ message: null });
            }
            Answers.currentCity.hint = data;
            console.log(Answers.currentCity.hint);
        });
    },
    
    // loads pictures (with preloading option) 
    getPictures: function (isPreload, i) {
        var location = Answers.cities[Answers.cities.length - i],
            queryString = "",
            $nextQuest = $('#answer').find('a'),
            $loading = $('#loading');
        console.log("i= " + i);
        $nextQuest.hide();
        $loading.fadeIn();
            
        if (!isPreload || Answers.cities.length === 0) {
            location = Answers.currentCity;
        }
        
        // replace spaces with underscore, for locations with multiple words in the name
        queryString = location.name.replace(/ /g, "_");
        console.log("bilder fuer " + queryString);
        
        $.getJSON("getPictures2.php", 
            { 'location': queryString },
            function (data) {
                var city = data.City;
                location.photoCollection = city.PhotoCollection;
                //console.log(city);
                $.each(city.Locations, function (key, value) {
                    var tempSight = new Sight();
                    tempSight.name = value.Name;
                    tempSight.dbPediaUrl = value.URL;
                    tempSight.photoCollection = value.PhotoCollection;
                    $.each(value.PictureURLs[0], function (key, value) {
                        tempSight.pictures.push(value);
                    });
                    $.each(value.PictureURLs[1], function (key, value) {
                        tempSight.pictures.push(value);
                    });
                    
                    location.sights.push(tempSight);
                });
                //console.log(location.sights);
                
                if (!isPreload) {
                    Question.displayQuestion();
                }
                
                // simple loading indicator
                $loading.hide();
                $nextQuest.fadeIn();
        });
    },
    
    // gets the data for the Bonus Question (flags of 3 different countries) 
    getBonusQuestion: function () {
        var i,
            countries = [],
            ran = 0,
            citiesLength = Answers.countries.length - 1;
        
        for (i = 0; countries.length < 3; i += 1) {
            ran = Math.floor(Math.random() * citiesLength);
            
            // no duplicates && avoid UK since the link is wrong in DBpedia 
            if ($.inArray(Answers.countries[ran], countries) === -1 && Answers.countries[ran] !== "United Kingdom") {
                countries.push(Answers.countries[ran]);
            }
        }
        
        // insert correct answer at random position
        ran = Math.floor(Math.random() * 2.9);
        // no duplicates
        if ($.inArray(Answers.currentCity.country, countries) === -1) {
            countries[ran] = Answers.currentCity.country;
        }
        
        $.getJSON("getFlag.php", 
            { countries: countries },
            function (data) {
                $.each(data, function (country, pic) {
                    var obj = {
                        name: country,
                        flag: pic
                    };
                    Answers.bonus.push(obj);
                });
                console.log(Answers.bonus);
        });
    },
    
    // checks if the given answer was correct 
    evalBonusQuestion : function (country) {
        if (country === Answers.currentCity.country) {
            Game.calculatePoints(null, Game.bonusPoints);
            $('#bonusQuestion').find('form').fadeOut('fast', function () {
                $('#bonusCorrect').fadeIn('fast');
            });
        } else {
            $('#bonusQuestion').find('form').fadeOut('fast', function () {
                $('#bonusWrong').fadeIn('fast');
            });
        }
    },
    
    // displays the Bonus Question 
    displayBonusQuestion: function () {
        // reset visibility 
        if (Answers.bonus.length !== 0) {
            $('#bonusQuestion').find('b').hide();
            $('#bonusQuestion').find('form').show();

            $('#bonusQuestion').find('label').each(function (i) {
                $(this).find('input').attr('value', Answers.bonus[i].name);
                $(this).find('img').attr('src', Answers.bonus[i].flag);
                $(this).find('input').click(function (event) {
                    event.preventDefault();
                    var country = $(this).val();
                    Question.evalBonusQuestion(country);
                });
            });
            $('#bonusQuestion').show();
        }
        
    },
    
    // slide effect, takes "up" or "down" as a parameter 
    picturesSlide: function (direction) {
        var $getInfo = $('#getInfo'),
            $polaroid = $('.polaroid'),
            height = 0;
        if (direction === "up") {
            $polaroid.each(function (i) {
                var move = i * -20;
                $(this).animate({
                    top: move + 'px'
                }, 400);
            });
            $('#hint').slideUp();
            
            $getInfo.find('span:last').hide();
            $getInfo.find('span:first').show();
        }
         
        if (direction === "down") {
            height = $('#hint').outerHeight(true);
            $polaroid.each(function (i) {
                if (i > 0) {
                    var move = i * height / 2;
                    $(this).animate({
                        top: '-=' + move
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
    
    // displays the pictures of the question 
    displayQuestion: function (batch) {
        var $polaroid = $('.polaroid');
        batch = typeof (batch) !== 'undefined' ? batch : 0;
        
        if ($('#hint').is(':visible')) {
            this.picturesSlide("up");
        }
        
        
        $polaroid.find('img').each(function (i) {
            $(this).attr('src', Answers.currentCity.sights[i].pictures[batch]);
        });
        
        
        $polaroid.fadeOut('slow', function () {
            $(this).fadeIn('slow');
        });
        
        $('#progress').html("Question " + Game.questionNr + " out of 10:");

    },
  
    // displays the answer screen 
    displayAnswer: function (result) {
        var $answer = $('#answer'),
            answer = "<b>" + result[2] + " points!</b>" +
                    "The correct answer is:<b>" + Answers.currentCity.name + "</b>" +
                    "You missed it by " + result[0] + "km. <br>" +
                    "That would mean a " + result[1] + " drive.";
        $answer.find('#answerText').html(answer);
       
        // display Bonus Question if player was close enough 
        if (result[0] <= Game.distanceBonusQuestion) {
            this.displayBonusQuestion();
        }
        
        Game.displayDialog($answer);
        this.writeResult();
    },
    
    // displays the hint text 
    displayHint: function () {
        $('#hintText').html(Answers.currentCity.hint);
        if ($('#hint').is(":visible")) {
            this.picturesSlide("up");
        }
        if ($('#hint').is(":hidden")) {
            this.picturesSlide("down");
        }
    },
   
    // outputs the collected information to a file, database etc. 
    writeResult: function () {
        $.post("writeResultXML.php", { city: Answers.currentCity });
    }
};

var Map = {
    markersArray: [],
    infowindowsArray: [],
    map: {},
    directionsService : {},
    directionsDisplay: {},
    
    // basic map settings 
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
            draggableCursor: "crosshair",
            mapTypeControl: false,
            navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL, position: google.maps.ControlPosition.TOP_RIGHT },
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.TERRAIN
        }
    },
    
    // loads map 
    load: function () {
        this.map = new google.maps.Map(document.getElementById("map_canvas"), this.config.myOptions);
        var styledMapOptions = {
                map: this.map,
                name: "Spiel" 
            },
            gameMapType =  new google.maps.StyledMapType(this.config.mapStyle, styledMapOptions);
        
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer(Map.config.rendererOptions);
        
        this.map.mapTypes.set('Spiel', gameMapType);
        this.map.setMapTypeId('Spiel');

        //auf den Klick reagieren, in dem getDistance() aufgerufen wird
        google.maps.event.addListener(this.map, 'click', function (event) {
            Map.getDistance(event.latLng);
        });
    },
    
    // get distance to actual location from Maps API 
    getDistance: function (clickedLocation) {
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
        this.directionsService.route(request, function (result, status) {
            
            if (status === google.maps.DirectionsStatus.OK) {
                Map.directionsDisplay.setDirections(result);
                ergebnisArray[0] = Math.round(result.routes[0].legs[0].distance.value / 1000);
                ergebnisArray[1] = result.routes[0].legs[0].duration.text;
                
                ergebnisArray[2] = Game.calculatePoints(ergebnisArray[0], null);
                
                Answers.currentCity.playerDistance = ergebnisArray[0];
                Question.displayAnswer(ergebnisArray);
                
            }
        });
    }
};

var Eurotrip = {
    // Set up the game for the first time 
    init: function () {
        var $getInfo = $('#getInfo');
        
        // get list of cities and load the map
        Question.getCities();
        Map.load();
        
        // Welcome screen
        Game.displayDialog($('#welcome'));
        
        $getInfo.find('span:last').hide();
        $getInfo.find('b:last').hide();
        
        // bind appropriate functions to buttons
        $('#getMorePics').click(function (event) {
            event.preventDefault();
            
            if (Game.hasMorePics === false) {
                Answers.currentCity.joker += 1;
                Answers.currentCity.images = [];
                Question.displayQuestion(1);
                $(this).block({ message: null });
                Game.hasMorePics = true;
                Game.calculatePoints(null, Game.morePicsPoints);
            }
        });
        
        $getInfo.click(function (event) {
            event.preventDefault();
            Question.displayHint();
            if (Game.hasHint === false) {
                Answers.currentCity.joker += 1;
                Game.calculatePoints(null, Game.hintPoints);
                Game.hasHint = true;
            }
        });
        
        $('#answer').find('a').click(function (event) {
            event.preventDefault();
            Question.generate();
        });
        $('#startGame').click(function (event) {
            event.preventDefault();
            $('div#map_canvas').unblock();
            $('#welcome').fadeOut();
        });
        $('#newRound').click(function (event) {
            event.preventDefault();
            Game.newRound();
            $('#endOfRound').fadeOut();
        });
    }

};

// onReady 
$(function () {
    Eurotrip.init();
   
});