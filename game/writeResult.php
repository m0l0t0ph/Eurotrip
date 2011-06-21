<?php
if (isset($_POST['city'])){
	$city = json_encode($_POST['city']);
}
else
    $city = "";
var_dump($city);

$ourFileName = "results.txt";
$fh = fopen($ourFileName, 'a') or die("Can't open file");

fwrite($fh, $city."\n");
fclose($fh);
?>