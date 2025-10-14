<?php
require_once 'config.php';
header('Content-Type: application/json; charset=utf-8');

if(!isset($_GET['location']) || empty($_GET['location'])){
    echo json_encode(['error'=>'Standortparameter wird benötigt.']);
    exit;
}

$location = $_GET['location'];

try{
    $pdo = new PDO($dsn,$username,$password,$options);
    $sql="SELECT date,uvindex FROM UVI WHERE location=? ORDER BY date ASC";
    $stmt=$pdo->prepare($sql);
    $stmt->execute([$location]);
    $results=$stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);

}catch(PDOException $e){
    echo json_encode(['error'=>$e->getMessage()]);
    exit;
}
