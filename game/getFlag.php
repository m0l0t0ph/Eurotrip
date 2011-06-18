<?php 
//This code is to get  links of the flags of 3 countries.

//To get an input array named "countries", otherwise return FALSE
	if (isset($_GET['countries'])){
       $Countries = $_GET['countries'];
       
    }
    else { 
    	$Countries = array('Germany', 'France', 'Spain');
    }
    
//var_dump($_GET['countries']);
//Constructing  SPARQL query and preparing URL
function getUrlDbpediaFlag($Countriesname)
{
   $format = 'json';
 
   $query = 
   "PREFIX dbp: <http://dbpedia.org/resource/>
   PREFIX dbp2: <http://dbpedia.org/ontology/>
   
   SELECT ?thumbnail
   WHERE {
      dbp:".$Countriesname." dbp2:thumbnail ?thumbnail . 
      
   }";
 
   $searchUrl = 'http://dbpedia.org/sparql?'
      .'query='.urlencode($query)
      .'&format='.$format;
	  
   return $searchUrl;
}

//Make the HTTP request to the URL
function request($url){
 
   // is curl installed? 
   if (!function_exists('curl_init')){ 
      die('CURL is not installed!'); 
   }
 
   // get curl handle
   $ch= curl_init();
 
   // set request url
   curl_setopt($ch, CURLOPT_URL, $url);
 
   // return response, don't print/echo
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  
   $response = curl_exec($ch);
 
   curl_close($ch);
  
   return $response;
}


$Countriesflag=array();

//to iterate over array $Countries 
//add the Countriesname into Array $Countriesflag as key
//add the link of a flag as a value under the key of an Array $Countriesflag
//for example : if  echo $Countriesflag["Germany"], the link of the German flag will be printed. 
foreach($Countries as $Value){
	$Countriesname=$Value;
	
	$term = str_replace(" ", "_", $Countriesname);
	
	$requestURL = getUrlDbpediaFlag($term);
	
	$responseArray = json_decode(request($requestURL),true);
	
	$Countriesflag[$Value]=$responseArray["results"]["bindings"][0]["thumbnail"]["value"];

    
}

//at last return the Array $Countriesflag 

echo json_encode($Countriesflag);
 

?>


