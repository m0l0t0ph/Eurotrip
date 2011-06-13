<?php 

	if (isset($_GET['city'])){
		$term = $_GET['city'];
	}
	else {
		$term = 'Berlin';
	}


function getUrlDbpediaAbstract($term)
{
   $format = 'json';
 
   $query = 
   "PREFIX dbp: <http://dbpedia.org/resource/>
   PREFIX dbp2: <http://dbpedia.org/ontology/>
 
   SELECT ?abstract
   WHERE {
      dbp:".$term." dbp2:abstract ?abstract . 
      FILTER langMatches(lang(?abstract), 'en')
   }";
 
   $searchUrl = 'http://dbpedia.org/sparql?'
      .'query='.urlencode($query)
      .'&format='.$format;
	  
   return $searchUrl;
}


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


function printArray($array, $spaces = "")
{
   $retValue = "";
	
   if(is_array($array))
   {	
      $spaces = $spaces
         ."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

      $retValue = $retValue."<br/>";

      foreach(array_keys($array) as $key)
      {
         $retValue = $retValue.$spaces
            ."<strong>".$key."</strong>"
            .printArray($array[$key], 
               $spaces);
      }		
      $spaces = substr($spaces, 0, -30);
	  
   }
   else $retValue = 
      $retValue." - ".$array."<br/>";
	
   return $retValue;
}


//$term = "Karlsruhe";

$requestURL = getUrlDbpediaAbstract($term);

$responseArray = json_decode(request($requestURL),true); 

  // abstract als string ermitteln und Stadt durch XXX ersetzen
  $AbstractString = $responseArray["results"]["bindings"][0]["abstract"]["value"];
  // echo $AbstractString; 
  
  $AbstractString = str_replace($term, "XXX", $AbstractString);    
  $AbstractString = "...".substr($AbstractString, 0, 200 )."..."; 
  
  echo json_encode($AbstractString);
  
//$rest = substr("abcdef", 1, 3 ); // gibt "bcd" zurück
//echo strlen($string)
?>
 


 


