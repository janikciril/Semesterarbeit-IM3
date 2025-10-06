<?php

/*
$name = 'Janik';
echo $name;

$a = 292;
$b = 22;
echo $a + $b; 
*/

// -> Funktionen
function multiply($a, $b) {
    return $a * $b;
}
// echo multiply(234,181);

// -> Bedingungen
// note muss 4 oder grösser sein
/*
$note = 3.5;
if($note >=4) {
     echo 'easy, hettsch weniger chöne lerne';
}   else if ($note < 4 && $note >=3.5) {
     echo 'du muesch nomal ran an die lisa';
}   else {
     echo 'jetzt isch gsi';
} 
*/

// -> arrays
$banane = ['länge', 'dicke', 'krümmung'];


/*echo '<pre>';
print_r($banane[1]);
echo '</pre>';*/


foreach($banane as $item) {
    //echo $item . '<br>';
}

// -> assoziative arrays (aka. objekte)

$standorte = [
    'chur' => 15.4,
    'zuerich' => 20,
    'bern' => -1
];

/*echo '<pre>';
print_r($standorte['bern']);
echo '</pre>';*/

foreach($standorte as $ort => $temperatur) {
    // echo $temperatur . '/' . $ort . '<br>';
}







?>