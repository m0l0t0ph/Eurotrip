<?php 
$result = array();
$location_name = "Ort";
$coordinates = "Koordinaten";
$img_url1 = "http://placekitten.com/200/150";
$img_url2 = "http://placekitten.com/200/149";
$img_url3 = "http://placekitten.com/200/148";

$result["location_name"] = $location_name;
$result["coordinates"] = $coordinates;
$result["img_url1"] = $img_url1;
$result["img_url2"] = $img_url2;
$result["img_url3"] = $img_url3;
echo json_encode($result); 
?>