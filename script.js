document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const initialLocation = params.get("location");

    const allLocations = ["Laax","Davos","St. Moritz","Samnaun","Disentis"];
    const colors = {
        "Laax":"#ffcf33",
        "Davos":"#33a3ff",
        "St. Moritz":"#2edc07",
        "Samnaun":"#ff5733",
        "Disentis":"#8e44ad"
    };

    const titleEl = document.getElementById("skiTitle");
    const ctx = document.getElementById("uviChart").getContext("2d");
    const timeRangeSelect = document.getElementById("timeRange");
    const checkboxContainer = document.getElementById("checkboxContainer");
    let chart;

    // Checkboxen für alle Skigebiete, initialLocation zuerst
    const locationsToShow = initialLocation 
        ? [initialLocation, ...allLocations.filter(loc => loc !== initialLocation)]
        : allLocations;
    
    locationsToShow.forEach(loc => {
        const label = document.createElement("label");
        label.className = "location-button";
        label.style.backgroundColor = colors[loc];
        label.style.color = "#000";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = loc;
        checkbox.checked = loc === initialLocation; // Initial location is checked by default
        if (checkbox.checked) {
            label.classList.add("checked");
        }
        checkbox.addEventListener("change", function() {
            if (this.checked) {
                label.classList.add("checked");
            } else {
                label.classList.remove("checked");
            }
            updateChart();
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(loc));
        checkboxContainer.appendChild(label);
    });

    function fetchData(locations) {
        const promises = locations.map(loc =>
            fetch(`https://ichhassesunnecreme.janik-honegger.ch/unload.php?location=${encodeURIComponent(loc)}`)
                .then(res => res.json())
                .then(data => ({loc, data}))
        );
        return Promise.all(promises);
    }

    function filterByDays(data, days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return data.filter(d => new Date(d.date) >= cutoff);
    }

    function buildChart(locations, days) {
        fetchData(locations).then(results => {
            if (results.length === 0) return;
            
            // Group data by day and get unique dates for labels
            const allDates = new Set();
            results.forEach(r => {
                const filtered = filterByDays(r.data, days);
                filtered.forEach(d => {
                    const date = new Date(d.date);
                    const dateKey = date.toDateString();
                    allDates.add(dateKey);
                });
            });
            
            // Sort dates and create labels (always day-level granularity)
            const sortedDates = Array.from(allDates).sort((a, b) => 
                new Date(a) - new Date(b)
            );
            const labels = sortedDates.map(dateKey => {
                const date = new Date(dateKey);
                return date.toLocaleDateString("de-DE", {day: "numeric", month: "short"});
            });

            // Group data by day for each location (average multiple entries per day)
            const datasets = results.map(r => {
                const filtered = filterByDays(r.data, days);
                
                // Group by day and calculate average UV index per day
                const dayData = new Map();
                filtered.forEach(d => {
                    const date = new Date(d.date);
                    const dateKey = date.toDateString();
                    const uvValue = parseFloat(d.uvindex) || 0;
                    
                    if (!dayData.has(dateKey)) {
                        dayData.set(dateKey, []);
                    }
                    dayData.get(dateKey).push(uvValue);
                });
                
                // Calculate average per day and map to label positions
                const dataValues = sortedDates.map(dateKey => {
                    const values = dayData.get(dateKey) || [];
                    if (values.length === 0) return null;
                    // Average the values for the day
                    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                    return avg;
                });
                
                return {
                    label: r.loc,
                    data: dataValues,
                    fill: false,
                    borderColor: colors[r.loc],
                    tension: 0.1
                };
            });

            if(chart) chart.destroy();

            chart = new Chart(ctx, {
                type:"line",
                data:{labels, datasets},
                options:{
                    responsive:true,
                    plugins:{
                        legend:{display:false},
                        title:{display:false}
                    },
                    scales:{
                        x:{
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45,
                                autoSkip: true,
                                maxTicksLimit: days > 7 ? 15 : 30
                            }
                        },
                        y:{
                            min:0,
                            max:11,
                            ticks:{stepSize:1}
                        }
                    }
                }
            });
        }).catch(err=>{
            console.error(err);
            titleEl.textContent="❌ Daten konnten nicht geladen werden";
        });
    }

    function updateChart() {
        const selected = [];
        const checkboxes = checkboxContainer.querySelectorAll("input[type=checkbox]");
        checkboxes.forEach(cb => { if(cb.checked) selected.push(cb.value); });
        buildChart(selected, parseInt(timeRangeSelect.value));
    }

    titleEl.textContent = initialLocation ? initialLocation.toUpperCase() : "Alle Skigebiete";

    // Initiales Chart
    updateChart();

    // Zeitraum ändern
    timeRangeSelect.addEventListener("change", updateChart);
});
