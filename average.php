<?php
/**
 * average.php
 * ===========
 * Berechnet den durchschnittlichen UV-Index für einen Standort
 * über die letzten 180 Tage (maximal).
 */

require_once 'config.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['location']) || empty($_GET['location'])) {
    echo json_encode(['error' => 'Standortparameter wird benötigt.']);
    exit;
}

$location = $_GET['location'];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Berechne das Datum vor 180 Tagen
    $cutoffDate = date('Y-m-d', strtotime('-180 days'));
    
    // Berechne den Durchschnitt der UV-Index Werte für den Standort (max 180 Tage zurück)
    $sql = "SELECT AVG(uvindex) as average FROM UVI 
            WHERE location = ? AND date >= ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$location, $cutoffDate]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result && $result['average'] !== null) {
        $average = round((float)$result['average'], 2);
        echo json_encode(['average' => $average], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['error' => 'Keine Daten gefunden.']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
?>

