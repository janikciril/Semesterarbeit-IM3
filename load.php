<?php
require_once 'config.php';

$jsonData = include('transform.php');
$dataArray = json_decode($jsonData, true);

if($dataArray===null){
    die(json_encode(['error'=>"Fehler beim Dekodieren der JSON-Daten"]));
}

try {
    $pdo = new PDO($dsn,$username,$password,$options);
} catch(PDOException $e){
    die(json_encode(['error'=>$e->getMessage()]));
}

$sql = "INSERT INTO UVI (date,time,location,uvindex) VALUES (:date,:time,:location,:uvindex)";
$stmt = $pdo->prepare($sql);
$insertCount=0;

foreach($dataArray as $row){
    if(empty($row['timestamp']) || $row['uvindex']===null) continue;
    $ts=strtotime($row['timestamp']);
    if($ts===false) continue;

    $stmt->execute([
        ':date'=>date('Y-m-d',$ts),
        ':time'=>date('H:i:s',$ts),
        ':location'=>$row['name'],
        ':uvindex'=>$row['uvindex']
    ]);
    $insertCount++;
}

echo json_encode(['success'=>true,'inserted'=>$insertCount]);
