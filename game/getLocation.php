<?php 

// Bounding Box Coordinates for Europe
$north  =    "81.008797";
$south  =    "27.636311";
$east   =    "39.869301";
$west   =    "-31.266001";

$minPopulation = 200000;

$webservice =  'http://api.geonames.org/citiesJSON?north='.$north.'&south='.$south.'&east='.$east.'&west='.$west.'&lang=de&username=klaemo';
 
		// WebService aufrufen
		$json = file_get_contents($webservice);
 
		// HTTP Status auslesen
		if(isset($http_response_header[0]))
			list($version,$status_code,$msg) = explode(' ',$http_response_header[0], 3);
 
		// HTTP Status ueberpruefen
		if($status_code != 200) {
			die('Ungueltiger Aufruf des Web Services.');
		}
 
		$cities = json_decode($json);
		$array = $cities->geonames;
		$result = array();
		foreach ($array as $value) {
            if($value->population > $minPopulation) {
                $result[] = $value->name;
            }
            
        }
$ran = rand(0, count($result));
$location["locationName"] = $result[$ran];		
echo json_encode($location);
?>