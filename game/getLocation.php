<?php 
$result = array();
$result2 = array();
$location_name = "Ort";
$coordinates = "Koordinaten";

	if (isset($_GET['location'])){
		$location = $_GET['location'];
	}
	else {
		$location = 'Berlin';
	}
	
	if (isset($_GET['limit'])){
		$limit = $_GET['limit'];
	}
	else {
		$limit = 10;
	}	

$url = "http://api.freebase.com/api/service/mqlread?query={\"query\":{\"/common/topic/image\":{\"id\":null,\"limit\":1,\"optional\":true},\"id\":null,\"type\":\"/travel/tourist_attraction\",\"name\":null,\"limit\":".$limit.",\"u0:near_travel_destination\":[{\"id\":null,\"name~=\":\"*".$location."*\",\"type\":\"/travel/travel_destination\"}]}}";	
/**
$contents = file_get_contents($url); 
$contents = utf8_encode($contents); 
$result = json_decode($contents, true); 	

for ($i = 0; $i <= 9; $i++) {
	$s=$result['messages']['0']['info']['result'][$i]['name'];
	if($s!=null){
		$result2['locations'][$i] = ($s);
	}
	if($s==null){
		break;
	}
}
**/
$result2 = array();
$result['anzahl']="lalelu";
//var_dump($result2);
echo json_encode($result2);	
?>