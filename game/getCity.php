<?php 
include "check.php";

// Settings
$continent = "EU";
$countryFocus = "DE";
$minPopulation = 400000;
$minPopulationGer = 250000;
$startRow = 0;
$search = "http://api.geonames.org/searchJSON?q=&continentCode=$continent&lang=en&featureClass=P&startRow=$startRow&maxRows=500&username=klaemo";

		// WebService aufrufen
		$json = file_get_contents($search);

		// HTTP Status auslesen
		if(isset($http_response_header[0]))
			list($version,$status_code,$msg) = explode(' ',$http_response_header[0], 3);
 
		// HTTP Status ueberpruefen
		if($status_code != 200) {
			die('Ungueltiger Aufruf des Web Services.');
		}
        //var_dump($json);
		$cities = json_decode($json);
		
		$array = $cities->geonames;
		$cache = array();
		$result = array();
		foreach ($array as $value) {
            //Nur Städte größer als $minPopulation, nicht in Russland oder Ukraine. Zusätzl. Deutschland Filter
            if(
                (($value->population > $minPopulation) AND ($value->countryCode != "RU") AND ($value->countryCode != "UA")) 
                OR (($value->population > $minPopulationGer) AND ($value->countryCode == $countryFocus))
                ) {
                $cache['name'] = $value->name;
                $cache['country'] = $value->countryName;
                $result[] = $cache;
            }
        }

$resultLength = count($result);
$location = array();

for($i=0; count($location) < 10; $i++) {
    $ran = rand(0, $resultLength);
    //Irgendwie gibt der 94. Wert immer null zurück, also ignorieren
    if($ran == 94) {
        continue;
    }
    $cityName = $result[$ran]['name'];
    $country = $result[$ran]['country'];
    $dbPedia = checkURL($cityName);
    
    //Keine Duplikate
    array_splice($result, $ran, 1);
    
    // Blacklist für "kaputte" Städte
    if($dbPedia AND $cityName != "Sarajevo" AND $cityName != "Szczecin") {
           $city[0] = $cityName;
           $city[1] = $dbPedia;
           $city[2] = $country;
           $location[] = $city;
    }
    
}

//var_dump($location);	
echo json_encode($location);
?>
