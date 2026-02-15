const loading = document.getElementById("loading");
const results = document.getElementById("results");
const errorBox = document.getElementById("error");

function showLoading(state) {
    loading.classList.toggle("hidden", !state);
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
}

function clearError() {
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
}

function displayResults(planets) {
    results.innerHTML = "";

    if (!planets || planets.length === 0) {
        results.innerHTML = "<p>No results found.</p>";
        return;
    }

    planets.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>${p.name}</h3>
            <p><strong>Host Star:</strong> ${p.host_star || "Unknown"}</p>
            <p><strong>Habitability Score:</strong> ${p.habitability_score}</p>
        `;

        results.appendChild(card);
    });
}

async function loadPlanets() {
    clearError();
    showLoading(true);

    try {
        const res = await fetch('/astra/exoplanets?limit=10');

        if (!res.ok) {
            throw new Error("Server error");
        }

        const data = await res.json();
        displayResults(data);

    } catch (err) {
        showError("Space database may be waking up. Please try again in 30 seconds.");
    }

    showLoading(false);
}

async function searchPlanet() {
    clearError();
    showLoading(true);

    const query = document.getElementById("searchBox").value;

    if (!query) {
        showLoading(false);
        return;
    }

    try {
        const res = await fetch(`/astra/search?q=${query}`);

        if (!res.ok) {
            throw new Error("Server error");
        }

        const data = await res.json();
        displayResults(data);

    } catch (err) {
        showError("Search failed. Try again.");
    }

    showLoading(false);
}
