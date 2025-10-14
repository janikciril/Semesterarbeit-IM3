<?php
/**
 * extract.php
 * ============
 * Ruft aktuelle UVI-Daten von mehreren Orten ab
 * und gibt sie als Array zurück.
 * Beim direkten Aufruf im Browser werden die Daten als JSON angezeigt (Debug).
 */

function fetchUVIDataForUrl(string $url): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'User-Agent: Greenbite-UVI-Fetch/1.0'
        ],
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new Exception("Transportfehler bei $url: $curlError");
    }
    if ($httpCode !== 200) {
        throw new Exception("HTTP-Fehler $httpCode bei $url");
    }

    $data = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON-Fehler bei $url: " . json_last_error_msg());
    }

    return $data;
}

function fetchAllUVIData(): array
{
    $locations = [
        'Disentis'  => 'https://currentuvindex.com/api/v1/uvi?latitude=46.70092254134369&longitude=8.841374648295009',
        'Davos'     => 'https://currentuvindex.com/api/v1/uvi?latitude=46.792312236953606&longitude=9.821955342733743',
        'St. Moritz'=> 'https://currentuvindex.com/api/v1/uvi?latitude=46.48364812059305&longitude=9.832745511133508',
        'Samnaun'   => 'https://currentuvindex.com/api/v1/uvi?latitude=46.9513517404241&longitude=10.375346811150786',
        'Laax'      => 'https://currentuvindex.com/api/v1/uvi?latitude=46.82008553902139&longitude=9.263287669590326',
    ];

    $results = [];

    foreach ($locations as $name => $url) {
        try {
            $data = fetchUVIDataForUrl($url);
            $results[$name] = [
                'uvindex'   => $data['now']['uvi'] ?? null,
                'timestamp' => $data['now']['time'] ?? null,
                'latitude'  => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
            ];
        } catch (Exception $e) {
            $results[$name] = ['error' => $e->getMessage()];
        }
    }

    return $results;
}

// Beim direkten Aufruf → JSON-Ausgabe (Debug)
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(fetchAllUVIData(), JSON_PRETTY_PRINT);
} else {
    return fetchAllUVIData();
}
?>
