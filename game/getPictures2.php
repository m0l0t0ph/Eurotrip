<?php

	if (isset($_GET['locName'])){
		$location = $_GET['locName'];
	}
	else {
		$location = 'Berlin';
	}

	//echo 'Location: '.$location.'<br><br>';
	$location_url = 'http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/'.$location.'?format=rdf';
	$image_urls = array();
	
	if(!fopen($location_url,r)){
		exit('Datei nicht gefunden!');
	}
	else {
		$xml = simplexml_load_file($location_url);
		foreach($xml->children('http://www.w3.org/1999/02/22-rdf-syntax-ns#')->Description as $tag1){
			foreach($tag1->children('http://xmlns.com/foaf/0.1/')->depiction as $tag2){
				foreach($tag2->attributes('http://www.w3.org/1999/02/22-rdf-syntax-ns#') as $a =>$b){
					$image_urls[] = $b;
				}
			}
		}
	}
	
	$eins = rand(0,19);
	$zwei = rand(0,19);
	while($zwei==$eins){
	$zwei = rand(0,19);	
	}
	$drei = rand(0,19);
	while($drei==$eins||$drei==$zwei){
	$drei = rand(0,19);	
	}
	
	echo '{"img_url1":"';
	echo $image_urls[$eins];
	echo '","img_url2":"';
	echo $image_urls[$zwei];
	echo '","img_url3":"';
	echo $image_urls[$drei];
	echo '"}';
	
	// $result = array();
	//     
	//     $result["img_url1"] = $image_urls[$eins];
	//     $result["img_url2"] = $image_urls[$zwei];
	//     $result["img_url3"] = $image_urls[$drei];
	//     echo json_encode($result);
	
	//echo '<img src='.$image_urls[$eins].'></img><br>';
	//echo $image_urls[$eins].'<br><br><br>';
	//echo '<img src='.$image_urls[$zwei].'></img><br>';
	//echo $image_urls[$zwei].'<br><br><br>';
	//echo '<img src='.$image_urls[$drei].'></img><br>';
	//echo $image_urls[$drei].'<br><br><br>';
?>