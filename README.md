Projektbericht: UV-Index-Visualisierung für Bündner Skigebiete
Diese Anwendung ermöglicht die Visualisierung des UV-Indexes für die Skigebiete Disentis, Laax, Davos, St. Moritz und Samnaun. Über eine interaktive Karte wählen die Nutzenden ein Gebiet aus, woraufhin eine Detailansicht den durchschnittlichen UV-Index sowie die aktuelle Abweichung präsentiert. Ein Liniendiagramm veranschaulicht zudem den zeitlichen Verlauf der Werte.

Entwicklung und Code-Optimierung
Der Aufbau der Datenbank verlief überraschend effizient, sodass die Datensammlung ohne Verzögerungen starten konnte. Da das Grundgerüst der Webseite bereits auf den Codealongs aus dem Unterricht basierte, war eine stabile Basis vorhanden. In der Anfangsphase war der Code durch die mehrfache Zuordnung von Skigebieten zu Nametags noch recht umständlich aufgebaut. Durch den gezielten Einsatz von künstlicher Intelligenz konnten wir diese Strukturen jedoch erheblich vereinfachen und effizienter gestalten.

Herausforderungen bei der Datenvisualisierung
Die Gestaltung der Charts stellte uns vor einige Hürden. Es erforderte intensive Arbeit, bis wir eine übersichtliche Beschriftung und die passenden Einheiten gefunden hatten. Besonders komplex war die Implementierung verschiedener Zeitspannen, da die Datumsbezeichnungen je nach gewähltem Format variierten. Um eine korrekte Darstellung zu gewährleisten, mussten wir für jedes Zeitformat eine spezifische Datumsanzeige definieren.

Optimierung der Benutzeroberfläche
Auch die Steuerung über die Auswahlbuttons war ein iterativer Prozess. Zeitweise existierten eigene Buttons parallel zu den im Chart integrierten Bedienelementen, was die Bedienung erschwerte. Es beanspruchte einige Zeit, die chart-eigenen Buttons exakt nach unseren Vorstellungen zu gestalten.

Zusätzlich stellten wir fest, dass es möglich war, alle Gebiete abzuwählen, was zu einer leeren Anzeige führte. Um die User Experience zu verbessern, haben wir den Code so angepasst, dass immer mindestens ein Skigebiet aktiv bleibt. Standardmässig wird das Gebiet angezeigt, welches über die Karte ausgewählt wurde, wobei weitere Skigebiete flexibel hinzugefügt werden können.

Logik und sprachliche Präzision
Ein wichtiges Detail betrifft die Anzeige der Abweichungen zum Durchschnittswert. Hier haben wir eine logische Prüfung eingebaut, die den Fall abdeckt, dass keine Abweichung vorliegt. In diesem Szenario passt sich der Text automatisch an und wechselt von einer wertenden Beschreibung zu der neutralen Aussage, dass der Wert identisch ist.

Werkzeuge und manuelles Fine-Tuning
Während des gesamten Prozesses haben wir intensiv mit ChatGPT und Cursor gearbeitet, was die Programmierung massiv erleichterte. Dennoch war beim Styling weiterhin Handarbeit gefragt. Da Abstände und die Dimensionen der SVGs durch die KI nicht immer präzise genug generiert wurden, haben wir diese Feinheiten manuell angepasst, um das gewünschte visuelle Ergebnis zu erzielen.
