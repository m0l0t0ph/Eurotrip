<?php
/* getPictures.php
 * @author: Christoph Gielisch, Karlsruher Institut fuer Technologie
 * @date: 19.06.2011	
 *
 * Diese Datei bekommt eine Stadt uebergeben und liefert fuer diese sechs Bildlinks und zwar in drei 
 * Kategorien je ein Haupt- und ein Ersatzbild. Als Kategorien sucht es sich dabei touristisch interessante
 * Ziele in der Naehe der Stadt aus, solange diese vorhanden sind.
 *
 * Die Ausgabe erfolgt via JSON.
 *
*/ 

define('HOMEPAGE_URL',str_replace("getPictures2.php","","http://".$_SERVER['SERVER_NAME'].$_SERVER['SCRIPT_NAME']));

/* Definition der Uebergabeparameter:
 * location[Default:Berlin], limit[Default:15], debugmode[Default:false]
 *
*/
	if (isset($_GET['location'])){
		$location = $_GET['location'];
	}
	else {
		$location = 'Berlin';
	}
	
	//////////////////////////////////////
	
	if (isset($_GET['limit'])){
		$limit = $_GET['limit'];
	}
	else {
		$limit = 15;
	}	
		
	//////////////////////////////////////
	
	if (isset($_GET['debugmode'])){
		$debugmode = $_GET['debugmode'];
	}
	else {
		$debugmode = false;
	}
	
/* Wandelt Unicode codierte Zeichen wie "$00BF" in ihre Wikipedia-like
 * UTF-Varianten wie "%C2%BF" um
 *
 * @param $string : Der zu bearbeitende String
*/	
function unicode2utf ($string){
	$b = true;
	while($b){
		// Wenn das Zeichen "$" im Ausgangsstring nicht vorkommt, muessen wir auf jeden Fall nichts tun
		$pos =strpos($string,"$");
		if	($pos === false){
			$b= false;
			$return_value = $string;
			break;
		}
		else {
			// Da es anscheinend noch mind. ein Sonderzeichen gibt, suchen wir uns dies nun mit Hilfe von regulaeren Ausdruecken heraus
			preg_match("/([0-9]|[A-F])([0-9]|[A-F])([0-9]|[A-F])([0-9]|[A-F])/",$string,$treffer);
			// Die letzten zwei Werte sind fuer uns interessant. Fuer die bessere Rechnung wandeln wir diese in das dezimale System um
			$value_unicode=$treffer[3].$treffer[4];
			$var = hexdec($value_unicode);
			// der i-Wert entpricht der Zahl hinter dem C im UTF8-Zeichensatz
			$i=0;
			// Alle 64 Werte springt der i-Wert um eins nach oben
			while($var>63){
				$i=$i+1;
				$var=$var-64;			
			}
			// Anpassung des i-Werts, falls ggf. die dritte Stelle im Unicode-Satz benutzt wird. Ein "Hunderter" entspricht 4 i's
			if($treffer[2]>0){
				$i=$i+(4*$treffer[2]);
			}
			// bis 128 wird normal hochgezaehlt, danach ist 128 Startwert. Also ab C1 beginnt mit 0, C2 mit 64, C3 mit 128, C4 mit 128 ...
			// Dies muessen wir darum noch korrigieren.
			if($i>0){
				$var=$var+64;			
			}
			if($i>1){
				$var=$var+64;				
			}			
			// Zurueck gehts ins Hexsystem. Damit es schoener aussieht sogar in Grossbuchstaben
			$var=strtoupper(dechex($var));			
			// Da Wikipedia C1 anders behandelt hier noch eine kleine Fallunterscheidung	
			if($i>1){
				$value_utf="%C".$i."%".$var;
			}
			else{
				// Das Komma bekommt auch noch eine Extrabehandlung spendiert
				if($var=="2C"){
					$value_utf=",";
				}
				else{
					$value_utf="%".$var;
				}
			}
			// Den "Hunderter" beim Ersetzen nicht vergessen
			$vorsilbe="$0".$treffer[2];
			// Wir ersetzen nun unseren Unicode-Wert mit unserem UTF8-Wert im String
			$string = str_replace($vorsilbe.$value_unicode,$value_utf,$string);
		}
	}
	return $return_value;
}

/* Liefert eine URL fuer eine DBpedia-Query nach dem hasPhotoCollection-Tag zur gewaehlten URI.
 * 
 * @param $term : Die URI nachdem wir die DBpedia nach eine PhotoCollection durchsuchen.
*/
function getUrlDbpediaPhotoCollection($term)
{
	// Wir wollen eine Rueckgabe in JSON
    $format = 'json';
	
	// Unsere SPARQL-Query
    $query =
    "PREFIX dbp: <http://dbpedia.org/resource/>
	PREFIX dbp2: <http://dbpedia.org/property/>
	SELECT ?hasPhotoCollection
	WHERE {
	dbp:".$term." dbp2:hasPhotoCollection ?hasPhotoCollection .
	}";
 
	// SPARQL-Query fuer den DBpedia-Endpoint vorbereiten
    $searchUrl = 'http://dbpedia.org/sparql?'
      .'query='.urlencode($query)
      .'&format='.$format;

	// Rueckgabe der fertigen Query-URL  
	return $searchUrl;
}

/* Liefert eine String-Representation der angesteuerten $url-Datei.
 * Sollte äquivalent sein zu get_file_contents($url).
 *
 * @param $url : Eine URL zu einer Datei.
 * @author : John Wright (http://johnwright.me/blog/sparql-query-in-code-rest-php-and-json-tutorial/)
*/
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

/* Liefert einen Array mit $number_count unterschiedlichen Integer-Zahlen,
 * die sich im Bereich zwischen $highest_number und $lowest_number bewegen.
 *
 * @param $lowest_number : Die kleinste Zahl unserer Menge.
 * @param $highest_number : Die groesste Zahl unserer Menge.
 * @param $number_count : Die Anzahl an Eintraegen im Endarray.
*/
function random_numbers($lowest_number,$highest_number,$number_count){
	// Abfrage falls number_count zu hoch fehlt noch!
	// Sollte die groesste Zahl gleich oder kleiner der kleinsten Zahl sein, geben wir einen Null-Array zurueck
	if($highest_number-$lowest_number<=0){
		$result[0]=0;
	}
	else{
		// Zunaechst generieren wir einen Array mit allen Zahlen zwischen groesster und kleinster Zahl
		for ($i=$lowest_number;$i<=$highest_number;$i++){
			$data[$i]=$i;
		}
		// Nun waehlen wir uns genau $number_count-Eintraege aus unserem generierten Array heraus
		$result = array_rand($data,$number_count+1);
		// Nocheinmal gut durchschuetteln
		shuffle($result);
	}
	return $result;
}

/* Diese Funktion formatiert den Debug-Output nur etwas für eine schoenere HTML-Ausgabe.
 * 
 * @param $in : Der zu formatierende String.
*/
function print_deb($in){
	echo "<pre>";
	print_r($in);
	echo "</pre>";
}

//////////////////////////////////// Start des eigentlichen Programmes ////////////////////////////////////
 
$starttime = microtime(true);


//////////////////////////////////////////////// MQL-Query ////////////////////////////////////////////////

$starttime2 = microtime(true);
// Der MQL-Query String, um die Freebase-API nach Touristic Attractions, die als near_travel_Destination $location haben, abzufragen	
$url =	
"http://api.freebase.com/api/service/mqlread?query={\"query\":[{\"type\":\"/travel/tourist_attraction\",\"key\":[{\"namespace\":\"/wikipedia/en\",\"value\":null,\"limit\":1}],\"u0:near_travel_destination\":[{\"name~=\":\"*".$location."*\"}],\"limit\":".$limit.",\"name\":[]}]}";
// Wir holen uns zuerst die Rueckgabe als String
$mql_array = request($url); 
// Erstmal nach UTF8 encodieren
$mql_array = utf8_encode($mql_array);
// Und dann als JSON-Element auslesen 
$mql_array = json_decode($mql_array, true); 	
$endtime2 = microtime(true);


////////////////////////////////////////// Umformatieren zu UTF8 /////////////////////////////////////////

$starttime3 = microtime(true);

for ($i = 0; $i < $limit; $i++) {
	if(isset($mql_array['result'][$i]['key'][0]['value'])){
		$location_name=$mql_array['result'][$i]['key'][0]['value'];
	}
	else{
		$location_name=null;
	}
	if(isset($location_name)){
		$location_name_array['locations'][$i] = unicode2utf($location_name);
	}
	else{
		break;
	}
}
$endtime3 = microtime(true);


///////////////////////////////////// DBpedia hasPhotoCollection-Query ////////////////////////////////////

$starttime4 = microtime(true);
// Wir gehen nun alle gefunden Locations durch und checken, ob sie einen hasPhotoCollection-Tag auf DBpedia besitzen
if(isset($location_name_array['locations'])){
	for ($i = 0; $i < count($location_name_array['locations']); $i++) {
		// Wir generieren zunaechst eine Query-URL fuer die Location
		$searchURL = getUrlDbpediaPhotoCollection($location_name_array['locations'][$i]);
		// Die eigentliche Abfrage
		$responseArray = json_decode(request($searchURL),true);
		// Wir lesen nun die fuer uns relevante Stelle heraus
		if(isset($responseArray["results"]["bindings"][0]["hasPhotoCollection"]["value"])){
			$url = $responseArray["results"]["bindings"][0]["hasPhotoCollection"]["value"];	
		}
		else{
			$url=null;
		}
		// Wenn keine PhotoCollection vorhanden ist diese Variable null!
		if($url!=null){
			// wg FlickrWrappr $location_url_array['locations'][] = $url;
			$location_url_array['locations'][] = str_replace("http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/",HOMEPAGE_URL."flickrwrappr/flickrwrappr.php?item=",$url);
		}
	}
}
$endtime4 = microtime(true);

//print_r($location_url_array);

/////////////////////////////////////////// FlickrWrappr-Query ///////////////////////////////////////////

$starttime5 = microtime(true);
$image_urls = array(); //array umbennen fürs naming-schema
// Der Counter zaehlt durch, wie viele finale Locations mit Bildlinks wir schon abgespeichert haben
$counter = 0;
// Der Location_Count gibt an, wie viele Locations wir maximal zur Verfügung haben
if(isset($location_url_array['locations'])){
	$location_count = count($location_url_array['locations']);
}
else{
	$location_count = 0;
}
// Der Corrector sorgt dafuer, dass die for-Schleife bei einer zu kleinen Anzahl an Locations (<3) oder 
// "kaputten" Locations trotzdem haeufig genug durchlaeuft 
$corrector = 0;
// Diese Variable definiert, dass wie vielte mal wir bereits auf die Stadt als Location zurueckgreifen mussten
$no_more_locations = 0;
// Wir generieren einen Zufallszahlen-Array um spaeter die Reihenfolge der Locations zufaellig auswaehlen 
// zu koennen
$iterator_zahlen = random_numbers(0,$location_count-1,$location_count-1);

//Generieren des Ausgangs Correctors
if($location_count<3){
	$corrector = 3-$location_count;
}

// Und los gehts
for ($i = 0; $i<$location_count+$corrector; $i++) {
		// Zuerst der Check, ob wir noch eine Location haben oder auf die Stadt zurueckgreifen muessen
		if (($location_count-$counter)<=0){
			// Nun der Check, ob wir nicht ggf. schoneinmal die Stadt reingeladen haben, dann muessen wir dies ja nicht erneut tun
			if($no_more_locations<1){
				// Reinladen der Stadt und setzen der passenden URL fuer die FlickrWrappr-Abfrage
				$searchURL = getUrlDbpediaPhotoCollection($location);
				$responseArray = json_decode(request($searchURL),true); 
				// wg FlickrWrappr $location_url = $responseArray["results"]["bindings"][0]["hasPhotoCollection"]["value"].'?format=rdf';
				$location_url = str_replace("http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/",HOMEPAGE_URL."flickrwrappr/flickrwrappr.php?item=",$responseArray["results"]["bindings"][0]["hasPhotoCollection"]["value"]).'&format=rdf';
			}
			// Hochzaehlen von no_more_locations, da wir einmal die Stadt reingeladen haben sowie setzen des Namens
			$image_urls[($counter+1)][0]=$location;
			$no_more_locations = $no_more_locations+1;
		}
		// Wir haben noch genug Locations!
		else{
			// Wir setzen die Location-URL und setzen den Namen
			// wg FlickrWrappr $location_url = $location_url_array['locations'][$iterator_zahlen[$i]].'?format=rdf';
			$location_url = $location_url_array['locations'][$iterator_zahlen[$i]].'&format=rdf';
			// wg FlickrWrappr $image_urls[($counter+1)][0]=str_replace("http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/","",$location_url_array['locations'][$iterator_zahlen[$i]]);
			$image_urls[($counter+1)][0]=str_replace(HOMEPAGE_URL."flickrwrappr/flickrwrappr.php?item=","",$location_url_array['locations'][$iterator_zahlen[$i]]);
		}
		
		// Nur falls wir zum ersten mal die Stadt benutzen muessen, muessen wir diese reinladen!
		if($no_more_locations<2){
			// Abholen der XML-DAtei als String via request
			$xml_string=request($location_url);
			// Existiert in diesem String ein Teilstring "<?xml"?
			$pos = stripos($xml_string,"<?xml");
		}	
		// Falls kein Teilstring "<?xml" existiert war dies eine "defekte" Location
		if($pos===false){
			// Namen wieder loeschen
			$image_urls[($counter+1)][0]=null;
			// Corrector und Location-Count korrigieren
			$corrector = $corrector+2;
			$location_count=$location_count-1;
		}
		// Nun haben wir einen korrekten XML-String
		else{
			// Sollten wir keine Locations mehr haben und die Stadt schon einmal reingeladen haben, muessen wir dies nicht erneut tun
			if($no_more_locations<2){
				// Hereinladen des XML-Strings in den XML-Parser
				$xml=simplexml_load_string($xml_string);
			}
			// Wir haben eine neue Bildquelle!
			$counter = $counter+1;
			// Da nur jeder zweite Eintrag in der vorliegenden Datei ein fuer uns interessanter Bildlink ist, benoetigen wir einen 
			// weiteren durchlaufenden Parameter
			$c=0;
			// Auswahl des richtigen XML-Arguments
			foreach($xml->children('http://www.w3.org/1999/02/22-rdf-syntax-ns#')->Description as $tag1){
				foreach($tag1->attributes('http://www.w3.org/1999/02/22-rdf-syntax-ns#') as $a =>$b){
					// Nur jedes zweite Element auswaehlen!
					if(($c%2)==1){
						$image_urls[$counter][] = $b; //Abfrage ob genug Elemente (2!)
					}
					$c=$c+1;
				}	
			}
		}
	// Wenn der Counter größer als 2 ist haben wir unsere 3 Bildlinks zusammen! Wichtig wenn es mehr als 3 Locations gibt
	if ($counter>2){
		break;
	}	
}
$endtime5 = microtime(true);


////////////////////////////////////////// Schreiben des End-Arrays //////////////////////////////////////////

$starttime6 = microtime(true);	
$result=array();
// Nun schreiben wir Location(=Stadt) in den Endarray
$result["City"]["Name"]=$location;
$result["City"]["URL"]="http://dbpedia.org/page/".$location;
$result["City"]["PhotoCollection"]="http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/".$location;
// Wir brauchen drei Ausgabebilder (+Ersatzbilder) daher von 1 bis 4
for($i=0;$i<3;$i++){
	// Von den vorhandenen Bildlinks wählen wir zufällig je zwei aus
	$zufallszahl = random_numbers(1,count($image_urls[$i+1])-1,2);
	// Wir holen uns außerdem den Location-Name aus dem image_url
	$location_name = $image_urls[$i+1][0];
	// Nun schreiben wir den Location-Namen in den Endarray
	$result["City"]["Locations"][$i]["Name"]=$location_name;
	$result["City"]["Locations"][$i]["URL"]="http://dbpedia.org/page/".$location_name;
	$result["City"]["Locations"][$i]["PhotoCollection"]="http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/".$location_name;
	// Außerdem noch den Typ unserer Bildlinks
	if ($location_name==$location){
		$result["City"]["Locations"][$i]["Type"]="City";
	}
	else{
		$result["City"]["Locations"][$i]["Type"]="Touristic Attraction";
	}
	// Und nun noch die zwei herausgesuchten Bildlinks
	$result["City"]["Locations"][$i]["PictureURLs"][0]=$image_urls[$i+1][$zufallszahl[0]];
	$result["City"]["Locations"][$i]["PictureURLs"][1]=$image_urls[$i+1][$zufallszahl[1]];	
}
$endtime6 = microtime(true);


////////////////////////////////////////////////// Ausgabe //////////////////////////////////////////////////

// Der Debugmode gibt nur eine etwas schoenere HTML-Ausgabe der gefundenen Daten aus	
if($debugmode){
	echo "<html><head></head><body>";
	$time = (microtime(true)-$starttime)." sec.";
	echo "||||||||||||||||||||||||||||| Benoetigte Zeit |||||||||||||||||||||||||||||";
	print_deb($time);
	echo "-->Fuer die Freebase MQL-Query: ".($endtime2-$starttime2)."<br>";
	echo "-->Fuer das Umformatieren zu UTF8: ".($endtime3-$starttime3)."<br>";
	echo "-->Fuer die DBpedia hasPhotoCollection-Query: ".($endtime4-$starttime4)."<br>";
	echo "-->Fuer die FlickrWrappr-Query: ".($endtime5-$starttime5)."<br>";
	echo "-->Fuer das Schreiben des End-Arrays: ".($endtime6-$starttime6)."<br><br>";	
	echo "||||||||||||||||||||||||||| Rausgesuchte Bilder |||||||||||||||||||||||||||";
	echo "<br><br><table border=\"1\"><tr>";
	echo "<td><img src=\"".$result['City']['Locations']['0']['PictureURLs'][0]."\"></td>";
	echo "<td><img src=\"".$result['City']['Locations']['1']['PictureURLs'][0]."\"></td>";
	echo "<td><img src=\"".$result['City']['Locations']['2']['PictureURLs'][0]."\"></td>";
	echo "</tr><tr>";
	echo "<td>".$result["City"]["Locations"]["0"]["Name"]."</td>";
	echo "<td>".$result["City"]["Locations"]["1"]["Name"]."</td>";
	echo "<td>".$result["City"]["Locations"]["2"]["Name"]."</td>";
	echo "</tr></table><br><br>";
	echo "|||||||||||||||||||||||||||||| Ersatzbilder |||||||||||||||||||||||||||||||";
	echo "<br><br><table border=\"1\"><tr>";
	echo "<td><img src=\"".$result['City']['Locations']['0']['PictureURLs'][1]."\"></td>";
	echo "<td><img src=\"".$result['City']['Locations']['1']['PictureURLs'][1]."\"></td>";
	echo "<td><img src=\"".$result['City']['Locations']['2']['PictureURLs'][1]."\"></td>";
	echo "</tr><tr>";
	echo "<td>".$result["City"]["Locations"]["0"]["Name"]."</td>";
	echo "<td>".$result["City"]["Locations"]["1"]["Name"]."</td>";
	echo "<td>".$result["City"]["Locations"]["2"]["Name"]."</td>";
	echo "</tr></table><br><br>";
	echo "||||||||||||||||||||||||||||||| JSON-Output |||||||||||||||||||||||||||||||";
	print_deb($result);
	echo "||||||||||||||||||||||||||| Gefundene Locations |||||||||||||||||||||||||||";
	if(isset($location_name_array)){
		print_deb($location_name_array);
	}
	else{
		print_deb("-");
	}
	echo "|||||||||||||||||||||| Locations mit PhotoCollection ||||||||||||||||||||||";
	if(isset($location_url_array)){
		print_deb($location_url_array);
	}
	else{
		print_deb("-");
	}
	echo "|||||||||||||||||||||||| Herausgesuchte Bildlinks |||||||||||||||||||||||||";
	if(isset($image_urls)){
		print_deb($image_urls);
	}
	else{
		print_deb("-");
	}
	echo "</body></html>";
}
// "Normale" Ausgabe fuer die Kommunikation zwischen den Programmteilen
else{
	echo json_encode($result);
}
?> 
           
