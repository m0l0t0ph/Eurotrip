<?php
// bekommt Stadt als Übergabewert und liefert Teil des DBpedia abstracts als SMS Hilfe zurück

// Überprüfung des Übergabeparameter
if (isset($_GET['city'])){
    $term = $_GET['city'];
}
else {
    $term = 'Berlin';
}

//Abfangen von Sonderfällen (Notwendig da dbPediaendung nur Frankfurt)
if ($term == "Frankfurt am Main") {
		$term = "Frankfurt";
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

// Aufruf, String-Anpassung und Rückgabe
$term = str_replace(" ","_",$term);

$requestURL = getUrlDbpediaAbstract($term);

$responseArray = json_decode(request($requestURL),true);

  // abstract als string ermitteln und Stadt durch XXX ersetzen
  $AbstractString = $responseArray["results"]["bindings"][0]["abstract"]["value"];
  
  $AbstractString = str_replace($term, "XXX", $AbstractString);
  $AbstractString = "...".substr($AbstractString, 50, 250 )."..."; // Position kann entsprechend im testing optimiert werden
  
  //leere "abstract" abfangen  
  if ($AbstractString == "......") {
  		$AbstractString = "";
  }
  
  echo json_encode($AbstractString);
  
?>
