document.addEventListener("DOMContentLoaded", () => {
    loadSuggestions();

    const button = document.getElementById("searchButton");
    if (button) {
        button.addEventListener("click", searchPlanet);
    }
});

async function loadSuggestions() {
    try {
        const res = await fetch('/suggestions');
        const data = await res.json();
        display(data, "suggestions", true);
    } catch (err) {
        console.error("Suggestion load failed:", err);
    }
}

async function searchPlanet() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const query = input.value.trim();
    if (!query) return;

    try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        display(data, "results", false);
    } catch (err) {
        console.error("Search failed:", err);
    }
}

function display(planets, elementId, isSuggestion) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";

    if (!Array.isArray(planets) || planets.length === 0) {
        container.innerHTML = "<p>No data available.</p>";
        return;
    }

    planets.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>${p.name || "Unknown"}</h3>
            <p><strong>Star:</strong> ${p.host_star || "Unknown"}</p>
            <p><strong>Radius:</strong> ${p.radius_earth || "?"} Earth</p>
            <span class="badge">${p.classification || "Unknown"}</span>
        `;

        container.appendChild(card);
    });
}
