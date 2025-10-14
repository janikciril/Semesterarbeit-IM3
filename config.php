<?php
/**
 * config.php
 * ==========
 * Konfigurationsdatei für die Datenbankverbindung (PDO)
 * Wird von load.php automatisch eingebunden.
 * 
 * ⚠️ Hinweis:
 * Diese Datei sollte im .gitignore stehen, um sensible Daten nicht zu veröffentlichen.
 */

// === Basisparameter ===
$host     = 'hu0t5k.myd.infomaniak.com';  // Datenbank-Host (Infomaniak)
$dbname   = 'hu0t5k_im3';                 // Name der Datenbank
$username = 'hu0t5k_Janik';               // DB-Benutzername
$password = 'Hallo22334455@';             // DB-Passwort

// === PDO Data Source Name (DSN) ===
$dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";

// === PDO Optionen ===
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // Fehler als Exceptions
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // Assoziative Arrays als Default
    PDO::ATTR_EMULATE_PREPARES   => false,                   // Native Prepared Statements verwenden
];

// === Optional: Dev-Modus zur Fehlersichtbarkeit ===
$devMode = true; // auf false setzen, wenn auf Live-Server

if ($devMode) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}
?>
