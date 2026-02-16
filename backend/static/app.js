document.addEventListener("DOMContentLoaded", () => {
    createModal();
    loadDashboard();
    loadSuggestions();

    const btn = document.getElementById("searchButton");
    if (btn) {
        btn.addEventListener("click", searchPlanet);
    }
});

/* =====================================================
   SAFE CATEGORY CLASS
===================================================== */

function getBadgeClass(category) {
    if (!category) return "badge-unknown";
    return "badge-" + category.toLowerCase().replace(/\s+/g, "-");
}

/* =====================================================
   DASHBOARD
===================================================== */

async function loadDashboard() {
    try {
        const res = await fetch('/dashboard');
        const data = await res.json();

        if (!data || typeof data !== "object") {
            throw new Error("Invalid dashboard response");
        }

        const summary = data.summary || {};
        const hazardous = data.hazardous_asteroids_today || [];

        // Summary Card
        document.getElementById("summaryCard").innerHTML = `
            <h3>Planet Statistics</h3>
            <p><strong>Total Planets:</strong> ${summary.total_planets ?? "N/A"}</p>
            <p><strong>Average Radius:</strong> ${summary.average_radius ?? "N/A"} Earth</p>
            <p><strong>Latest Discovery:</strong> ${summary.latest_discovery_year ?? "N/A"}</p>
            <p><strong>Common Method:</strong> ${summary.most_common_discovery_method ?? "N/A"}</p>
        `;

        // Category Distribution
        if (summary.category_distribution &&
            typeof summary.category_distribution === "object") {

            document.getElementById("categoryCard").innerHTML = `
                <h3>Category Distribution</h3>
                ${Object.entries(summary.category_distribution)
                    .map(([k,v]) => `<p>${k}: ${v}</p>`)
                    .join("")}
            `;
        } else {
            document.getElementById("categoryCard").innerHTML =
                "<h3>Category Distribution</h3><p>No data available.</p>";
        }

        // Hazardous Asteroids
        document.getElementById("asteroidCard").innerHTML = `
            <h3>Hazardous Asteroids Today</h3>
            ${hazardous.length === 0
                ? "<p>No hazardous objects detected.</p>"
                : hazardous.map(a => `<p>${a.name}</p>`).join("")}
        `;

    } catch (err) {
        console.error("Dashboard error:", err);

        document.getElementById("summaryCard").innerHTML =
            "<h3>Planet Statistics</h3><p>Unable to load data.</p>";

        document.getElementById("categoryCard").innerHTML =
            "<h3>Category Distribution</h3><p>Unable to load data.</p>";

        document.getElementById("asteroidCard").innerHTML =
            "<h3>Hazardous Asteroids Today</h3><p>Unable to load data.</p>";
    }
}

/* =====================================================
   SUGGESTIONS
===================================================== */

async function loadSuggestions() {
    try {
        const res = await fetch('/suggestions');
        const data = await res.json();
        renderCards(data, "suggestions");
    } catch (err) {
        console.error("Suggestion error:", err);
    }
}

/* =====================================================
   SEARCH
===================================================== */

async function searchPlanet() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const query = input.value.trim();
    if (!query) return;

    try {
        const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        renderCards(data, "results");
    } catch (err) {
        console.error("Search error:", err);
    }
}

/* =====================================================
   RENDER PLANET CARDS
===================================================== */

function renderCards(planets, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (!Array.isArray(planets) || planets.length === 0) {
        container.innerHTML = "<p>No data available.</p>";
        return;
    }

    planets.forEach(p => {
        const badgeClass = getBadgeClass(p.classification);

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>${p.name ?? "Unknown"}</h3>
            <p><strong>Star:</strong> ${p.host_star ?? "Unknown"}</p>
            <p><strong>Radius:</strong> ${p.radius_earth ?? "?"} Earth</p>
            <span class="badge ${badgeClass}">
                ${p.classification ?? "Unknown"}
            </span>
        `;

        card.onclick = () => openDetailPanel(p);
        container.appendChild(card);
    });
}

/* =====================================================
   DETAIL PANEL (ADVANCED)
===================================================== */

function createModal() {
    const modal = document.createElement("div");
    modal.id = "planetModal";
    modal.innerHTML = `
        <div class="modal-content">
            <span id="closeModal">&times;</span>
            <div id="modalBody"></div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("closeModal").onclick = closeModal;

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

function openDetailPanel(p) {
    const badgeClass = getBadgeClass(p.classification);

    document.getElementById("modalBody").innerHTML = `
        <div class="detail-header">
            <h2>${p.name ?? "Unknown"}</h2>
            <span class="badge ${badgeClass}">
                ${p.classification ?? "Unknown"}
            </span>
        </div>

        <div class="detail-section">
            <h3>Planet Metrics</h3>
            <div class="detail-grid">
                <div>
                    <strong>Host Star</strong>
                    <p>${p.host_star ?? "Unknown"}</p>
                </div>
                <div>
                    <strong>Radius</strong>
                    <p>${p.radius_earth ?? "?"} Earth</p>
                </div>
                <div>
                    <strong>Mass</strong>
                    <p>${p.mass_earth ?? "?"} Earth</p>
                </div>
                <div>
                    <strong>Orbital Period</strong>
                    <p>${p.orbital_period_days ?? "?"} Days</p>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>Discovery Information</h3>
            <p><strong>Method:</strong> ${p.discovery_method ?? "Unknown"}</p>
            <p><strong>Year:</strong> ${p.discovery_year ?? "Unknown"}</p>
        </div>
    `;

    document.getElementById("planetModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("planetModal").style.display = "none";
}
