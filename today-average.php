<?php
/**
 * today-average.php
 * =================
 * Berechnet den durchschnittlichen UV-Index für einen Standort
 * für heute (basierend auf allen Einträgen von heute).
 */

require_once 'config.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['location']) || empty($_GET['location'])) {
    echo json_encode(['error' => 'Standortparameter wird benötigt.']);
    exit;
}

$location = $_GET['location'];
$today = date('Y-m-d');

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Berechne den Durchschnitt der UV-Index Werte für heute
    $sql = "SELECT AVG(uvindex) as average FROM UVI 
            WHERE location = ? AND date = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$location, $today]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result && $result['average'] !== null) {
        $average = round((float)$result['average'], 2);
        echo json_encode(['average' => $average], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['error' => 'Keine Daten für heute gefunden.']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
?>

