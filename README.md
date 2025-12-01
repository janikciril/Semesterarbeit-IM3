## Semesterarbeit IM3 – UV-Index in Skigebieten Graubünden

Diese Anwendung visualisiert den UV-Index für ausgewählte Skigebiete in Graubünden (Disentis, Laax, Davos, St. Moritz, Samnaun).  
Auf einer Karte können Skigebiete ausgewählt werden, danach zeigt eine Detailansicht den durchschnittlichen UV-Index, die heutige Abweichung und einen Zeitverlauf als Liniendiagramm.

---

### Aufbau des Projekts

- **Frontend**
  - `index.html`: Startseite mit Karte von Graubünden. Rote Marker-Buttons verlinken auf die Detail-Seite der einzelnen Skigebiete (`skigebiet.html?location=Name`).
  - `Skigebiet.html`: Detailseite für ein Skigebiet mit:
    - Titel (Skigebietsname)
    - Anzeige des durchschnittlichen UV-Index (`Ø…`)
    - Illustration (`dude.png`)
    - Ski-Grafik (`svg/ski.svg` / `svg/ski_einfach.svg`) mit Text zur Abweichung vom Durchschnitt
    - Zeitraum-Dropdown (1 Woche / 3 Wochen / 1 Monat / 3 Monate)
    - Checkbox-Buttons zum Ein-/Ausblenden der einzelnen Skigebiete
    - Chart.js-Liniendiagramm mit der Entwicklung des UV-Index
  - `style.css`: Styles für die Startseite mit der Karte.
  - `style-sub.css`: Styles für die Detailseite (Typografie, Buttons, Diagramm-Layout, Wegweiser zurück zur Karte).
  - `script.js`: Frontend-Logik auf der Detailseite:
    - Liest `location` aus der URL.
    - Erstellt farbige Checkbox-Buttons für alle Skigebiete.
    - Stellt sicher, dass immer mindestens ein Skigebiet ausgewählt bleibt.
    - Lädt UV-Daten per `fetch` von der API und baut daraus das Chart.js-Liniendiagramm.
    - Berechnet Durchschnittswerte (gesamt / heute) und zeigt die Abweichung in % an.
    - Wechselt je nach Abweichung zwischen `ski.svg` und `ski_einfach.svg`.

- **Backend / Datenpipeline**
  - `config.php`: PDO-Konfiguration für den MySQL-Zugriff (Host, DB-Name, User, Passwort).  
    **Wichtig:** Diese Datei enthält sensible Zugangsdaten und sollte in einer echten Umgebung in `.gitignore` stehen bzw. mit Umgebungsvariablen arbeiten.
  - `extract.php`:
    - Holt aktuelle UV-Daten von `currentuvindex.com` für alle vordefinierten Orte (Disentis, Davos, St. Moritz, Samnaun, Laax) via cURL.
    - Gibt ein Array mit `uvindex`, `timestamp`, `latitude`, `longitude` pro Ort zurück.
    - Beim direkten Aufruf im Browser werden die Daten als JSON ausgegeben (Debug-Zwecke).
  - `transform.php`:
    - Nimmt die Rohdaten aus `extract.php`.
    - Wandelt die Zeitstempel von UTC in Schweizer Lokalzeit (`Europe/Zurich`) um.
    - Bereitet die Daten für die Datenbank vor (Felder: `name`, `uvindex`, `timestamp`, `latitude`, `longitude`).
    - Gibt die transformierten Daten als JSON zurück.
  - `load.php`:
    - Liest die transformierten JSON-Daten aus `transform.php`.
    - Schreibt sie in die Datenbank-Tabelle `UVI` mit den Spalten `date`, `time`, `location`, `uvindex`.
  - API-Endpunkte für das Frontend:
    - `unload.php?location=Name`  
      Liefert alle UV-Einträge (`date`, `uvindex`) für einen Standort als JSON (sortiert nach Datum).
    - `average.php?location=Name`  
      Liefert den durchschnittlichen UV-Index der letzten 180 Tage für einen Standort.
    - `today-average.php?location=Name`  
      Liefert den durchschnittlichen UV-Index für **heute** (alle Einträge von heute) für einen Standort.

---

### Funktionsweise im Frontend (`script.js`)

- Liest beim Laden der Detailseite den `location`-Parameter aus der URL.
- Setzt den Seitentitel (`#skiTitle`) und lädt:
  - den **langfristigen Durchschnitt** (`average.php`)
  - den **heutigen Durchschnitt** (`today-average.php`)
- Berechnet daraus die prozentuale Abweichung:
  - \(\text{Abweichung} = \frac{\text{heute} - \text{langfristig}}{\text{langfristig}} \times 100\)
  - Bei einer Abweichung unter 5 % wird „**durchschnittlich**“ angezeigt und das einfache Ski-SVG verwendet.
  - Bei grösserer Abweichung zeigt der Text `x% höher` oder `x% tiefer` und das normale Ski-SVG.
- Baut aus den Daten von `unload.php` für die gewählten Skigebiete ein Liniendiagramm:
  - Alle Einträge werden nach Tag gruppiert.
  - Pro Tag wird der durchschnittliche UV-Index berechnet.
  - Je nach gewähltem Zeitraum (Dropdown) werden nur die letzten `n` Tage berücksichtigt.

---

- **Schritte**
  1. Projekt-Code auf den Webserver kopieren (Dokumenten-Root oder Unterverzeichnis).
  2. `config.php` mit den eigenen Datenbank-Zugangsdaten anpassen.
  3. Sicherstellen, dass die Tabelle `UVI` existiert (Schema analog der Insert-Statements in `load.php`).
  4. Datenpipeline einmalig bzw. periodisch ausführen:
     - `extract.php` → `transform.php` → `load.php` (kann z.B. via Cronjob zyklisch laufen).
  5. Im Browser `index.html` aufrufen und über die Karte ein Skigebiet auswählen.

---

### Sicherheit / Hinweise

- `config.php` enthält Klartext-Zugangsdaten zur Datenbank und sollte in einem realen Projekt:
  - nicht in ein öffentliches Git-Repository committed werden,
  - über Umgebungsvariablen oder separate, ignorierte Konfigurationsdateien verwaltet werden.
- API-Limits und Verfügbarkeit von `currentuvindex.com` sollten bei produktivem Einsatz beachtet werden.

---

### Weiterentwicklung (Ideen)

- Mehr Skigebiete hinzufügen oder dynamisch aus der Datenbank laden.
- Responsiveness weiter optimieren (z.B. für sehr kleine Bildschirme).
- Tooltips und Legende im Diagramm verbessern (z.B. individuelle Farben/Labels hervorheben).
- Option für andere Zeiträume (z.B. 6 Monate, 1 Jahr) ergänzen.