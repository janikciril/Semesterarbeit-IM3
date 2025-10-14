<?php
/**
 * transform.php
 * ==============
 * Wandelt die Rohdaten aus extract.php um:
 * - Datum/Zeit → Schweizer Lokalzeit (Europe/Zurich)
 * - Bereitet die Daten für die DB vor
 * - Nur Ortsnamen werden als location weitergegeben
 */

date_default_timezone_set('Europe/Zurich');

$allData = include('extract.php');
$transformedData = [];

foreach ($allData as $name => $location) {
    if (isset($location['error'])) {
        continue; // Fehlerhafte Orte überspringen
    }

    $timestampUtc = $location['timestamp'] ?? null;
    if (!$timestampUtc) continue;

    // UTC → Europe/Zurich umrechnen
    $dt = new DateTime($timestampUtc, new DateTimeZone('UTC'));
    $dt->setTimezone(new DateTimeZone('Europe/Zurich'));

    $transformedData[] = [
        'name'      => $name,                       // Ortsname, wird später als location verwendet
        'uvindex'   => $location['uvindex'] ?? null,
        'timestamp' => $dt->format('Y-m-d H:i:s'),
        'latitude'  => $location['latitude'] ?? null,
        'longitude' => $location['longitude'] ?? null,
    ];
}

// JSON-Ausgabe + Rückgabe für load.php
$jsonOutput = json_encode($transformedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo $jsonOutput;
} else {
    return $jsonOutput;
}
?>
