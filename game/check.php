<?php 

function getUrlDbpediaAbstract($term)
{
   $format = 'json';
 
   $query = 
   "PREFIX dbp: <http://dbpedia.org/resource/>
   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
   
   SELECT ?label
   WHERE {
      dbp:".$term." rdfs:label ?label . 
      FILTER langMatches(lang(?label), 'en')
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

//$term = "Pechino";
function checkURL($term) {
    $requestURL = getUrlDbpediaAbstract($term);

    $responseArray = json_decode(request($requestURL),true); 
    if(empty($responseArray["results"]["bindings"])){
        //echo printArray($responseArray);
        //echo "FALSE1";
        return FALSE;

    }
    else{
        $labelString = $responseArray["results"]["bindings"][0]["label"]["value"]; 

        if($term == $labelString){
            //echo $responseArray["results"]["bindings"][0]["label"]["value"];
            //echo "$labelString".":"."http://dbpedia.org/page/"."$term";
            return "http://dbpedia.org/page/"."$term";
        }
        else {
            echo "FALSE2";
            return FALSE;

        }
    }

}
?>


