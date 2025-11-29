document.addEventListener("DOMContentLoaded", () => {
    // Konstanten
    const API_BASE = "https://ichhassesunnecreme.janik-honegger.ch";
    const SVG_PATHS = {
        normal: "svg/ski.svg",
        simple: "svg/ski_einfach.svg"
    };
    const DEVIATION_THRESHOLD = 5;

    const allLocations = ["Laax", "Davos", "St. Moritz", "Samnaun", "Disentis"];
    const colors = {
        "Laax": "#ffcf33",
        "Davos": "#33a3ff",
        "St. Moritz": "#2edc07",
        "Samnaun": "#ff5733",
        "Disentis": "#8e44ad"
    };

    // DOM-Elemente
    const params = new URLSearchParams(window.location.search);
    const initialLocation = params.get("location");
    const titleEl = document.getElementById("skiTitle");
    const ctx = document.getElementById("uviChart").getContext("2d");
    
    const timeRangeSelect = document.getElementById("timeRange");
    const checkboxContainer = document.getElementById("checkboxContainer");
    const averageDisplayEl = document.getElementById("averageDisplay");
    const deviationTextEl = document.getElementById("deviationText");
    const skiGraphicEl = document.querySelector(".ski-graphic");
    
    let chart;

    // Helper-Funktionen
    const setSkiGraphic = (type = "normal") => {
        if (skiGraphicEl) {
            skiGraphicEl.src = SVG_PATHS[type];
        }
    };

    const clearAverageDisplay = () => {
        averageDisplayEl.textContent = "";
        deviationTextEl.textContent = "";
        setSkiGraphic("normal");
    };

    const getSelectedLocations = () => {
        return Array.from(checkboxContainer.querySelectorAll("input[type=checkbox]:checked"))
            .map(cb => cb.value);
    };

    // Checkboxen erstellen
    const createCheckbox = (location) => {
        const label = document.createElement("label");
        label.className = "location-button";
        label.style.backgroundColor = colors[location];
        label.style.color = "#000";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = location;
        checkbox.checked = location === initialLocation;
        
        if (checkbox.checked) {
            label.classList.add("checked");
        }

        checkbox.addEventListener("change", () => {
            const checkedCount = getSelectedLocations().length;
            
            if (!checkbox.checked && checkedCount === 0) {
                checkbox.checked = true;
                return;
            }

            label.classList.toggle("checked", checkbox.checked);
            updateChart();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(location));
        checkboxContainer.appendChild(label);
    };

    // Initialisierung der Checkboxen
    const locationsToShow = initialLocation
        ? [initialLocation, ...allLocations.filter(loc => loc !== initialLocation)]
        : allLocations;
    
    locationsToShow.forEach(createCheckbox);

    // Daten-Funktionen
    const fetchData = async (locations) => {
        const promises = locations.map(loc =>
            fetch(`${API_BASE}/unload.php?location=${encodeURIComponent(loc)}`)
                .then(res => res.json())
                .then(data => ({ loc, data }))
        );
        return Promise.all(promises);
    };

    const filterByDays = (data, days) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return data.filter(d => new Date(d.date) >= cutoff);
    };

    const getDateKey = (date) => new Date(date).toDateString();

    const calculateDailyAverages = (filteredData) => {
        const dayData = new Map();
        
        filteredData.forEach(d => {
            const dateKey = getDateKey(d.date);
            const uvValue = parseFloat(d.uvindex) || 0;
            
            if (!dayData.has(dateKey)) {
                dayData.set(dateKey, []);
            }
            dayData.get(dateKey).push(uvValue);
        });

        return dayData;
    };

    // Chart-Funktionen
    const buildChart = async (locations, days) => {
        try {
            const results = await fetchData(locations);
            if (results.length === 0) return;

            // Alle eindeutigen Daten sammeln
            const allDates = new Set();
            results.forEach(r => {
                filterByDays(r.data, days).forEach(d => {
                    allDates.add(getDateKey(d.date));
                });
            });

            // Sortierte Datums-Labels erstellen
            const sortedDates = Array.from(allDates).sort((a, b) => 
                new Date(a) - new Date(b)
            );
            
            const labels = sortedDates.map(dateKey =>
                new Date(dateKey).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "short"
                })
            );

            // Datasets für jede Location erstellen
            const datasets = results.map(r => {
                const filtered = filterByDays(r.data, days);
                const dayData = calculateDailyAverages(filtered);

                const dataValues = sortedDates.map(dateKey => {
                    const values = dayData.get(dateKey) || [];
                    return values.length > 0
                        ? values.reduce((sum, val) => sum + val, 0) / values.length
                        : null;
                });

                return {
                    label: r.loc,
                    data: dataValues,
                    fill: false,
                    borderColor: colors[r.loc],
                    tension: 0.1
                };
            });

            if (chart) chart.destroy();

            chart = new Chart(ctx, {
                type: "line",
                data: { labels, datasets },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                                autoSkip: true,
                                maxTicksLimit: days > 7 ? 15 : 30
                            }
                        },
                        y: {
                            min: 0,
                            max: 7,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
        } catch (err) {
            console.error(err);
            titleEl.textContent = "❌ Daten konnten nicht geladen werden";
        }
    };

    const updateChart = () => {
        const selected = getSelectedLocations();
        buildChart(selected, parseInt(timeRangeSelect.value));
    };

    // Durchschnitts-Funktionen
    const calculateDeviation = (todayAvg, allTimeAvg) => {
        return ((todayAvg - allTimeAvg) / allTimeAvg) * 100;
    };

    const formatDeviation = (deviation) => {
        const absDeviation = Math.abs(deviation);
        
        if (absDeviation < DEVIATION_THRESHOLD) {
            deviationTextEl.textContent = "durchschnittlich";
            setSkiGraphic("simple");
        } else {
            const rounded = Math.round(absDeviation);
            deviationTextEl.textContent = deviation > 0
                ? `${rounded}% höher`
                : `${rounded}% tiefer`;
            setSkiGraphic("normal");
        }
    };

    const loadAverage = async (location) => {
        if (!location) {
            clearAverageDisplay();
            return;
        }

        try {
            const [avgResponse, todayResponse] = await Promise.all([
                fetch(`${API_BASE}/average.php?location=${encodeURIComponent(location)}`),
                fetch(`${API_BASE}/today-average.php?location=${encodeURIComponent(location)}`)
            ]);

            const avgData = await avgResponse.json();
            const todayData = await todayResponse.json();

            if (avgData.average !== undefined) {
                averageDisplayEl.textContent = `Ø${avgData.average}`;
            }

            if (todayData.average !== undefined && avgData.average !== undefined) {
                const deviation = calculateDeviation(todayData.average, avgData.average);
                formatDeviation(deviation);
            } else {
                deviationTextEl.textContent = "";
                setSkiGraphic("normal");
            }
        } catch (error) {
            console.error("Fehler beim Laden der Durchschnittswerte:", error);
            clearAverageDisplay();
        }
    };

    // Initialisierung
    titleEl.textContent = initialLocation
        ? initialLocation.toUpperCase()
        : "Alle Skigebiete";

    if (initialLocation) {
        loadAverage(initialLocation);
    }

    updateChart();
    timeRangeSelect.addEventListener("change", updateChart);
});
