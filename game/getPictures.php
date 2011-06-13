﻿<?php
include "check.php";

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
	//var_dump($image_urls);
	
	$eins = rand(0,19);
	$zwei = rand(0,19);
	while($zwei==$eins){
	$zwei = rand(0,19);	
	}
	$drei = rand(0,19);
	while($drei==$eins||$drei==$zwei){
	$drei = rand(0,19);	
	}
	/**$image_urls[$eins] = "http://farm5.static.flickr.com/4069/4411543643_0bff9e7333_m.jpg";
	$image_urls[$zwei] = "http://farm3.static.flickr.com/2803/4300632935_7171fc2e87_m.jpg";
	$image_urls[$drei] = "http://farm4.static.flickr.com/3395/3632493896_759cd2d9f5_m.jpg";**/
	echo '{"img_url1":"';
	echo $image_urls[$eins];
	echo '","img_url2":"';
	echo $image_urls[$zwei];
	echo '","img_url3":"';
	echo $image_urls[$drei];
	echo '"}';
	

?>