
<?php
//This code is to save array 'city' into a Result.xml file as a Database

//to get a array named 'city',put it into variable $city
if (isset($_POST['city'])){
	$city = $_POST['city'];
}
else{
    return FALSE;
}
var_dump($city);

//the first city array example with cityname "Riga" to test the code.
/*$city = array(
	"name"=>"Riga",
    "dbPediaUrl"=>"http://dbpedia.org/page/Riga",
    "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Riga",
    "country"=>"Latvia",
    "hint"=>"...ajor industrial, commercial, cultural and financial centre of the Baltics, and an important seaport, situated on the mouth of the Daugava. With 706,413 inhabitants (2010) it is the largest city of the Baltic states and third-largest in the Baltic reg...",
    "sights"=>array (
        array (
            "name"=>"Riga",
            "dbPediaUrl"=>"http://dbpedia.org/page/Riga",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Riga",
            "pictures"=>array (
                "http://farm5.static.flickr.com/4068/4549360726_250e13ae17_m.jpg",
                "http://farm6.static.flickr.com/5098/5503458907_dd4ffa5330_m.jpg"
            )
        ),
        array (
            "name"=>"Riga",
            "dbPediaUrl"=>"http://dbpedia.org/page/Riga",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Riga",
            "pictures"=>array (
                "http://farm5.static.flickr.com/4009/4549357850_fe353f4038_m.jpg",
                "http://farm5.static.flickr.com/4011/4549360944_5ba4ffb37e_m.jpg"
            )
        ),
        array (
            "name"=>"Riga",
            "dbPediaUrl"=>"http://dbpedia.org/page/Riga",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Riga",
            "pictures"=>array (
                "http://farm5.static.flickr.com/4063/4549363290_a2617b746e_m.jpg",
                "http://farm5.static.flickr.com/4068/4549360726_250e13ae17_m.jpg"
            )
        )
    ),
    "reset"=>"undefined"
);*/

//the second city array example wiht name "Riga" but different information to test the code.
/*$city = array(
	"name"=>"Riga",
    "dbPediaUrl"=>"http://dbpedia.org/page/Riga",
    "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Riga",
    "country"=>"Latvia",
    "hint"=>"...ajor industrial, commercial, cultural and financial centre of the Baltics, and an important seaport, situated on the mouth of the Daugava. With 706,413 inhabitants (2010) it is the largest city of the Baltic states and third-largest in the Baltic reg...",
    "sights"=>array (
        array (
            "name"=>"RigaADD",
            "dbPediaUrl"=>"http://dbpedia.org/page/Riga",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Riga",
            "pictures"=>array (
                "http://farm5.static.flickr.com/4068/4549360726_250e13ae17_mADD.jpg",
                "http://farm6.static.flickr.com/5098/5503458907_dd4ffa5330_m.jpg"
            )
        ),
        array (
            "name"=>"Riga",
            "dbPediaUrl"=>"http://dbpedia.org/page/Riga",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Riga",
            "pictures"=>array (
                "http://farm5.static.flickr.com/4009/4549357850_fe353f4038_mADD.jpg",
                "http://farm5.static.flickr.com/4011/4549360944_5ba4ffb37e_mADD.jpg"
            )
        ),
        array (
            "name"=>"Riga",
            "dbPediaUrl"=>"http://dbpedia.org/page/Riga",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Riga",
            "pictures"=>array (
                "http://farm5.static.flickr.com/4063/4549363290_a2617b746e_m.jpg",
                "http://farm5.static.flickr.com/4068/4549360726_250e13ae17_m.jpg"
            )
        )
    ),
    "reset"=>"undefined"
);*/


//The third array example with total different city information 
/*$city=array (
    "name"=>"Glasgow",
    "dbPediaUrl"=>"http://dbpedia.org/page/Glasgow",
    "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Glasgow",
    "country"=>"United Kingdom",
    "hint"=>"... populous in the United Kingdom. The city is situated on the River Clyde in the country\'s west central lowlands. A person from XXX is known as a Glaswegian, which is also the name of the local dialect. XXX grew from the medieval Bishopric of XXX and ...",
    "sights"=>array(
        array(
            "name"=>"Glasgow_Necropolis",
            "dbPediaUrl"=>"http://dbpedia.org/page/Glasgow_Necropolis",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Glasgow_Necropolis",
            "pictures"=>array(
                "http://farm5.static.flickr.com/4061/4505924124_ba04900bb7_m.jpg",
                "http://farm1.static.flickr.com/123/408121412_ecb75f781e_m.jpg"
            )
        ),
        array(
            "name"=>"Glasgow_Science_Centre",
            "dbPediaUrl"=>"http://dbpedia.org/page/Glasgow_Science_Centre",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Glasgow_Science_Centre",
            "pictures"=>array(
                "http://farm4.static.flickr.com/3601/3373280766_f5b35486af_m.jpg",
                "http://farm4.static.flickr.com/3661/3552662632_24e32e3246_m.jpg"
            )
        ),
        array(
            "name"=>"Burrell_Collection",
            "dbPediaUrl"=>"http://dbpedia.org/page/Burrell_Collection",
            "photoCollection"=>"http://www4.wiwiss.fu-berlin.de/flickrwrappr/photos/Burrell_Collection",
            "pictures"=>array(
                "http://farm3.static.flickr.com/2715/4500451294_bdb6ddbd06_m.jpg",
                "http://farm4.static.flickr.com/3642/3369574181_5c1a95ca80_m.jpg"
            )
        )
    ),
    "reset"=>"undefined"
);*/

foreach($city as $key=>$value){
	echo $key.":".$value;
}
$tof="!exist";
$dom = new DOMDocument("1.0" , "utf-8");

//if the Results.xml exists, load it ,to find if the information of array has  already existed in the xml file. 
if(is_file("Results.xml")){
	$dom->load("Results.xml");
    $root = $dom->documentElement;
    echo "Results.xml exists!/n";
    
    $cityname = array_shift($city);
    echo $cityname;

    $subNodes = $root->childNodes; 
    
    //beginn a loop to check if the cityname  has already existed! 
    foreach ($subNodes as $subNode){
        $cityn=$subNode->nodeName;
	    if(!($cityname==$cityn)){
	    	echo "here";
	    }
	    else{		
	        $tof="exist";	
		    $sameNode = $subNode;
		    break;
	    }
    } 
    
    //if the cityname has already existed, then call function add_information 
    //to add extra infomations under the same cityname.
    //otherwise to make a new element with the cityname under the root.
    if($tof=="!exist"){
        echo "The city name doesn't exist!";
        $item = $dom->createElement($cityname);           
        $root->appendChild($item);

        //to build the tree of the array.
        creat_item($dom,$item,$city);
    }
    else{
 	    echo "The city name "."'".$cityn."'"." does exist!";
 	    add_information($dom,$sameNode,$city);
    }
}

//if the Results.xml not exists, creat a new root and add a new Element under the root.
else{
	$root=$dom->createElement('city');           
    $dom->appendChild($root);
    //echo "no";
    $cityname = array_shift($city);
    //echo $cityname;
    $item = $dom->createElement($cityname);           
    $root->appendChild($item);

    //to build the tree of the array.
    creat_item($dom,$item,$city);
}

echo $dom->saveXML();
//save it to "Results.xml"
$dom->save("Results.xml");

//.............................................................
//function to add extra different information to the xml file.
function add_information($adddomdata,$additemdata,$addarraydata){
    foreach($addarraydata as $addkeydata => $addvaluedata){
		//compare sights arrayelement with sightsnode and add the extra information
		if($addkeydata=="sights" && !($addkeydata== "0" | $addkeydata== "1" | $addkeydata== "2")){
		    $addchildnodes = $additemdata->childNodes;
		    echo $addkeydata."1";
		    foreach($addchildnodes as $addsubnode){
		    	if($addsubnode->nodeName=="sights"){
		    		echo "2";
		    		add_information($adddomdata,$addsubnode,$addvaluedata);
		    		break;
		    	}
		    	
		    }
		}
		//to find sights element and add the extra information
        if(($addkeydata== "0" | $addkeydata== "1" | $addkeydata== "2") && is_array($addvaluedata)){            
        	$sightexist="sight !exist";
        	echo "3";
        	$addsightname=$addvaluedata["name"];
		    $addchildnodes = $additemdata->childNodes;
		    
		    foreach($addchildnodes as $addsubnode){				    
			//check if the sights of the cityarray exists! 
			    if($addsightname==$addsubnode->nodeName){
			        $sightexist = "sight exist";//exist!
			        echo "4";
			        echo $addsightname."==".$addsubnode->nodeName."...";			    
		            add_information($adddomdata,$addsubnode,$addvaluedata);
		            break;
			    }    	        
		    }
		    if($sightexist=="sight !exist"){
		    	echo "5";
		    	creat_item($adddomdata,$additemdata,$addvaluedata);
		    }
        }
		//compare pictures arrayelement with picturenode and add the extra information
		if($addkeydata=="pictures" && !($addkeydata=="0" | $addkeydata=="1")){
			echo $addkeydata;
			echo "6";
			
			$addchildnodes = $additemdata->childNodes; 
		    foreach($addchildnodes as $addsubnode){
		    	if($addsubnode->nodeName=="pictures"){
		    	    echo "7"; 
		    	    add_information($adddomdata,$addsubnode,$addvaluedata);
		            break;
		    	}    
		    }
		}
        //to find the pictures element and add the extra information
		if(($addkeydata=="0"|$addkeydata=="1")&&($additemdata->nodeName=="pictures")){
			$addchildnodes = $additemdata->childNodes;
		    echo "8";
		   
		    foreach($addchildnodes as $addsubnode){
		    	$pictureexist="picture not exist";
		    	if($addvaluedata==$addsubnode->nodeValue){
		    		echo "9";
		            $pictureexist="picture exist";
		            
		            break;
		    	}
		    	
		    }
		    if($pictureexist=="picture not exist"){
		    	
		    	echo "a";
		        $additemchild=$adddomdata->createElement("picture");
		        $additemdata->appendChild($additemchild);
	        	$additemtext = $adddomdata->createTextNode($addvaluedata);
			    $additemchild->appendChild($additemtext);
		    }
		    
		}		
	}
}
//..........................................
//function to create element and add it  into the xml file.     
function creat_item($domdata,$itemdata,$arraydata){
	if(isset($arraydata["name"])){
		echo "a";
        $sightname=array_shift($arraydata);
		$itemchild = $domdata->createElement($sightname);           
        $itemdata->appendChild($itemchild);
        creat_item($domdata,$itemchild,$arraydata);
	}
	else{
		
	    //to judge if the value is another array or not.
	    foreach($arraydata as $keydata => $valuedata){
		    if($keydata=="0" | $keydata=="1" | $keydata=="2" ){
			    echo "b";
	            if(is_array($valuedata)){
	        	    echo "c";
	        	    $sightname=array_shift($valuedata);
	        	    $itemchild = $domdata -> createElement($sightname);
	        	    $itemdata->appendChild($itemchild);
	        	    creat_item($domdata,$itemchild,$valuedata);
	        	
	            }
	            else{
	        	    echo "d";
	        	    $itemchild = $domdata -> createElement("picture");
	        	    $itemdata->appendChild($itemchild);
	        	    $itemtext = $domdata->createTextNode($valuedata);
			        $itemchild->appendChild($itemtext);
	        	
	            }
	        }
		    //add a childelement
		    else{
			    echo "e";
		        $itemchild = $domdata->createElement($keydata);           
                $itemdata->appendChild($itemchild);
                if(is_array($valuedata)){
            	    creat_item($domdata,$itemchild,$valuedata);
		        }
		        else{
			        echo "f"; 
	                //add the text.
	                $itemtext = $domdata->createTextNode($valuedata);
			        $itemchild->appendChild($itemtext);
		           
		        }
		    }
	    }
	}
}
?>