// Simple in-memory data
let athletes = [
    { id: 1, name: "Rahul Sharma", age: 22, sport: "100m Sprint", country: "India", points: 95 },
    { id: 2, name: "Emily Carter", age: 24, sport: "Long Jump", country: "USA", points: 88 },
    { id: 3, name: "Kaito Tanaka", age: 21, sport: "High Jump", country: "Japan", points: 92 }
];

// Currently logged-in athlete (for Athlete panel)
let currentAthleteId = null;

// Filters
let coachSportFilter = "";
let adminSportFilter = "";

document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    setupAthleteProfileHandlers();
    setupCoachHandlers();
    setupAdminHandlers();
    setupFilterHandlers();

    // Initialize current athlete
    if (athletes.length > 0 && currentAthleteId === null) {
        currentAthleteId = athletes[0].id;
    }

    renderAllViews();
});

/* ------------ TABS ------------ */
function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const panels = document.querySelectorAll(".panel");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.target;

            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            panels.forEach(panel => {
                if (panel.id === targetId) {
                    panel.classList.add("active");
                } else {
                    panel.classList.remove("active");
                }
            });
        });
    });
}

/* ------------ RENDERING ------------ */
function renderAllViews() {
    renderAthleteLoginSelect();
    renderAthleteProfile();
    renderAthleteRankingTable();
    renderCoachRankingTable();
    renderCoachAthleteDropdown();
    renderAdminTable();
}

function getSortedAthletes() {
    // Sort by points descending
    return [...athletes].sort((a, b) => b.points - a.points);
}

/* Athlete login switcher */
function renderAthleteLoginSelect() {
    const select = document.getElementById("athleteLoginSelect");
    if (!select) return;

    select.innerHTML = "";

    athletes.forEach(a => {
        const option = document.createElement("option");
        option.value = a.id;
        option.textContent = a.name;
        select.appendChild(option);
    });

    if (athletes.length === 0) {
        currentAthleteId = null;
        return;
    }

    if (currentAthleteId === null) {
        currentAthleteId = athletes[0].id;
    }

    select.value = currentAthleteId;

    // Only add listener once
    if (!select.dataset.hasListener) {
        select.addEventListener("change", () => {
            currentAthleteId = Number(select.value);
            renderAllViews();
        });
        select.dataset.hasListener = "true";
    }
}

/* Athlete profile (for currentAthleteId) */
function renderAthleteProfile() {
    const nameEl = document.getElementById("athleteName");
    const ageEl = document.getElementById("athleteAge");
    const sportEl = document.getElementById("athleteSport");
    const countryEl = document.getElementById("athleteCountry");

    const nameInput = document.getElementById("inputName");
    const ageInput = document.getElementById("inputAge");
    const sportInput = document.getElementById("inputSport");
    const countryInput = document.getElementById("inputCountry");

    if (!athletes.length || currentAthleteId === null) {
        nameEl.textContent = "";
        ageEl.textContent = "";
        sportEl.textContent = "";
        countryEl.textContent = "";

        nameInput.value = "";
        ageInput.value = "";
        sportInput.value = "";
        countryInput.value = "";
        return;
    }

    let athlete = athletes.find(a => a.id === currentAthleteId);
    if (!athlete) {
        currentAthleteId = athletes[0].id;
        athlete = athletes[0];
    }

    nameEl.textContent = athlete.name;
    ageEl.textContent = athlete.age;
    sportEl.textContent = athlete.sport;
    countryEl.textContent = athlete.country;

    nameInput.value = athlete.name;
    ageInput.value = athlete.age;
    sportInput.value = athlete.sport;
    countryInput.value = athlete.country;
}

/* Athlete view ranking table (shows all sports) */
function renderAthleteRankingTable() {
    const tbody = document.getElementById("athleteRankingTable");
    tbody.innerHTML = "";

    const sorted = getSortedAthletes();
    sorted.forEach((athlete, index) => {
        const tr = document.createElement("tr");
        if (athlete.id === currentAthleteId) {
            tr.classList.add("athlete-highlight");
        }

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${athlete.name}</td>
            <td>${athlete.sport}</td>
            <td>${athlete.country}</td>
            <td>${athlete.points}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* Coach view ranking table (with sport filter) */
function renderCoachRankingTable() {
    const tbody = document.getElementById("coachRankingTable");
    tbody.innerHTML = "";

    let list = getSortedAthletes();
    if (coachSportFilter) {
        list = list.filter(a =>
            a.sport.toLowerCase().includes(coachSportFilter)
        );
    }

    list.forEach((athlete, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${athlete.name}</td>
            <td>${athlete.sport}</td>
            <td>${athlete.points}</td>
        `;
        tbody.appendChild(tr);
    });
}

/* Coach athlete dropdown */
function renderCoachAthleteDropdown() {
    const select = document.getElementById("coachAthleteSelect");
    select.innerHTML = "";

    athletes.forEach(a => {
        const option = document.createElement("option");
        option.value = a.id;
        option.textContent = a.name;
        select.appendChild(option);
    });
}

/* Admin table of all athletes (with sport filter) */
function renderAdminTable() {
    const tbody = document.getElementById("adminAthleteTable");
    tbody.innerHTML = "";

    let list = [...athletes];
    if (adminSportFilter) {
        list = list.filter(a =>
            a.sport.toLowerCase().includes(adminSportFilter)
        );
    }

    list.forEach((a, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${a.name}</td>
            <td>${a.sport}</td>
            <td>${a.country}</td>
            <td>${a.points}</td>
            <td>
                <button data-id="${a.id}" class="delete-btn">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach delete handlers
    tbody.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = Number(btn.dataset.id);
            deleteAthlete(id);
        });
    });
}

/* ------------ ATHLETE HANDLERS ------------ */
function setupAthleteProfileHandlers() {
    const editBtn = document.getElementById("editProfileBtn");
    const profileView = document.getElementById("athleteProfileView");
    const profileForm = document.getElementById("athleteProfileForm");
    const cancelBtn = document.getElementById("cancelEditBtn");

    editBtn.addEventListener("click", () => {
        profileView.classList.add("hidden");
        profileForm.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        profileForm.classList.add("hidden");
        profileView.classList.remove("hidden");
        renderAthleteProfile(); // reset form values
    });

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const athlete = athletes.find(a => a.id === currentAthleteId);
        if (!athlete) return;

        athlete.name = document.getElementById("inputName").value.trim();
        athlete.age = Number(document.getElementById("inputAge").value);
        athlete.sport = document.getElementById("inputSport").value.trim();
        athlete.country = document.getElementById("inputCountry").value.trim();

        profileForm.classList.add("hidden");
        profileView.classList.remove("hidden");

        renderAllViews();
    });
}

/* ------------ COACH HANDLERS ------------ */
function setupCoachHandlers() {
    const form = document.getElementById("coachUpdateForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const athleteId = Number(document.getElementById("coachAthleteSelect").value);
        const newPoints = Number(document.getElementById("coachPointsInput").value);

        if (Number.isNaN(newPoints)) return;

        const athlete = athletes.find(a => a.id === athleteId);
        if (!athlete) return;

        athlete.points = newPoints;
        document.getElementById("coachPointsInput").value = "";

        renderAllViews();
    });
}

/* ------------ FILTER HANDLERS ------------ */
function setupFilterHandlers() {
    const coachFilterInput = document.getElementById("coachSportFilter");
    const adminFilterInput = document.getElementById("adminSportFilter");

    coachFilterInput.addEventListener("input", () => {
        coachSportFilter = coachFilterInput.value.trim().toLowerCase();
        renderCoachRankingTable();
    });

    adminFilterInput.addEventListener("input", () => {
        adminSportFilter = adminFilterInput.value.trim().toLowerCase();
        renderAdminTable();
    });
}

/* ------------ ADMIN HANDLERS ------------ */
function setupAdminHandlers() {
    const form = document.getElementById("adminAddForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("adminNameInput").value.trim();
        const age = Number(document.getElementById("adminAgeInput").value);
        const sport = document.getElementById("adminSportInput").value.trim();
        const country = document.getElementById("adminCountryInput").value.trim();
        const points = Number(document.getElementById("adminPointsInput").value);

        if (!name || !sport || !country || Number.isNaN(age) || Number.isNaN(points)) {
            alert("Please fill all fields correctly.");
            return;
        }

        const newId = athletes.length ? Math.max(...athletes.map(a => a.id)) + 1 : 1;
        athletes.push({ id: newId, name, age, sport, country, points });

        // Clear form
        form.reset();

        renderAllViews();
    });
}

function deleteAthlete(id) {
    // Prevent deleting the logged-in athlete to avoid weird state
    if (id === currentAthleteId) {
        alert("You cannot delete the currently logged-in athlete.");
        return;
    }
    athletes = athletes.filter(a => a.id !== id);
    renderAllViews();
}