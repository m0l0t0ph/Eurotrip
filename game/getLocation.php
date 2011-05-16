<?php 
/** stub **/
$result = array();
$locationName = "Dresden";
$lat = "48.99643826296838";
$lng = "8.397674685546917";
$country = "Deutschland";

$result["locationName"] = $locationName;
$result["lat"] = $lat;
$result["lng"] = $lng;
$result["country"] = $country;
echo json_encode($result); 
?>