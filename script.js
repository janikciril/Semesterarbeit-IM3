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

    // Checkboxen für alle Skigebiete außer initialLocation
    allLocations.forEach(loc => {
        if(loc !== initialLocation){
            const label = document.createElement("label");
            label.style.marginRight = "10px";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = loc;
            checkbox.addEventListener("change", updateChart);
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" " + loc));
            checkboxContainer.appendChild(label);
        }
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
            const datasets = results.map(r => {
                const filtered = filterByDays(r.data, days);
                return {
                    label: r.loc,
                    data: filtered.map(d => d.uvindex),
                    fill: false,
                    borderColor: colors[r.loc],
                    tension: 0.1
                };
            });

            const labels = filterByDays(results[0].data, days).map(d =>
                days > 7
                    ? new Date(d.date).toLocaleDateString("de-DE",{month:"short"})
                    : new Date(d.date).toLocaleDateString("de-DE",{day:"numeric",month:"short"})
            );

            if(chart) chart.destroy();

            chart = new Chart(ctx, {
                type:"line",
                data:{labels, datasets},
                options:{
                    responsive:true,
                    plugins:{title:{display:true,text:"UV-Index – "+(initialLocation || "Alle")}},
                    scales:{
                        y:{
                            min:1,
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
        const selected = [initialLocation];
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
