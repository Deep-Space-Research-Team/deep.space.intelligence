document.addEventListener("DOMContentLoaded", () => {
    createModal();
    loadSuggestions();

    const searchBtn = document.getElementById("searchButton");
    if (searchBtn) {
        searchBtn.addEventListener("click", searchPlanet);
    }
});

/* ===============================
   CATEGORY CLASS SAFE CONVERTER
================================= */

function getBadgeClass(category) {
    if (!category) return "badge-unknown";

    const safe = category.toLowerCase().replace(/\s+/g, "-");
    return `badge-${safe}`;
}

/* ===============================
   LOAD SUGGESTIONS
================================= */

async function loadSuggestions() {
    try {
        const res = await fetch('/suggestions');
        const data = await res.json();
        renderCards(data, "suggestions");
    } catch (err) {
        console.error("Suggestions failed:", err);
    }
}

/* ===============================
   SEARCH
================================= */

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
        console.error("Search failed:", err);
    }
}

/* ===============================
   RENDER CARDS
================================= */

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
            <h3>${p.name || "Unknown"}</h3>
            <p><strong>Star:</strong> ${p.host_star || "Unknown"}</p>
            <p><strong>Radius:</strong> ${p.radius_earth ?? "?"} Earth</p>
            <span class="badge ${badgeClass}">
                ${p.classification || "Unknown"}
            </span>
        `;

        card.addEventListener("click", () => openModal(p));
        container.appendChild(card);
    });
}

/* ===============================
   MODAL
================================= */

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

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function openModal(planet) {
    const modal = document.getElementById("planetModal");
    const body = document.getElementById("modalBody");

    body.innerHTML = `
        <h2>${planet.name}</h2>
        <p><strong>Host Star:</strong> ${planet.host_star || "Unknown"}</p>
        <p><strong>Radius:</strong> ${planet.radius_earth ?? "?"} Earth</p>
        <p><strong>Mass:</strong> ${planet.mass_earth ?? "?"} Earth</p>
        <p><strong>Classification:</strong> ${planet.classification || "Unknown"}</p>
    `;

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("planetModal").style.display = "none";
}
