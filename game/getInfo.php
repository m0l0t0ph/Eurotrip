<?php
// bekommt Stadt als �bergabewert und liefert Teil des DBpedia abstracts als SMS Hilfe zur�ck

// �berpr�fung des �bergabeparameter
if (isset($_GET['city'])){
    $term = $_GET['city'];
}
else {
    $term = 'Berlin';
}


// Query nach DPpedia
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
 
   $searchUrl = 'http://dbpedia.org/sparql?' // Endpoint der DBpedia
      .'query='.urlencode($query)
      .'&format='.$format;

   return $searchUrl;
}


// HTTP request mit cURL
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

// Aufruf, String-Anpassung und R�ckgabe

$requestURL = getUrlDbpediaAbstract($term);

$responseArray = json_decode(request($requestURL),true);

  // abstract als string ermitteln und Stadt durch XXX ersetzen
  $AbstractString = $responseArray["results"]["bindings"][0]["abstract"]["value"];
  
  $AbstractString = str_replace($term, "XXX", $AbstractString);
  $AbstractString = "...".substr($AbstractString, 50, 250 )."..."; // Position kann entsprechend im testing optimiert werden
  
  echo json_encode($AbstractString);
  
?>
