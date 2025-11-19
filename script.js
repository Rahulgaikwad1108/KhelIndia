// Simple in-memory data (extended with injuries, performance, career, finance)
let athletes = [
    {
        id: 1,
        name: "Rahul Sharma",
        age: 22,
        sport: "100m Sprint",
        country: "India",
        points: 95,
        injuries: [
            {
                id: 1,
                type: "Ankle strain",
                severity: "Minor",
                status: "Rehab",
                startDate: "2025-10-05",
                notes: "Avoid hard landings"
            }
        ],
        performanceHistory: [
            {
                date: "2025-11-10",
                metric: "100m - 10.55s",
                notes: "Season best",
                pointsSnapshot: 95
            }
        ],
        career: {
            level: "National",
            nextGoal: "Qualify for Asian Games trials"
        },
        finance: {
            stipend: 25000,
            sponsorship: 15000
        }
    },
    {
        id: 2,
        name: "Emily Carter",
        age: 24,
        sport: "Long Jump",
        country: "USA",
        points: 88,
        injuries: [],
        performanceHistory: [],
        career: {
            level: "International",
            nextGoal: "Maintain top-10 world ranking"
        },
        finance: {
            stipend: 40000,
            sponsorship: 60000
        }
    },
    {
        id: 3,
        name: "Kaito Tanaka",
        age: 21,
        sport: "High Jump",
        country: "Japan",
        points: 92,
        injuries: [],
        performanceHistory: [],
        career: {
            level: "National",
            nextGoal: "Clear 2.30m in competition"
        },
        finance: {
            stipend: 30000,
            sponsorship: 20000
        }
    }
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

/* ------------ HELPERS ------------ */

function getSortedAthletes() {
    // Sort by points descending
    return [...athletes].sort((a, b) => b.points - a.points);
}

function getInjurySummary(athlete) {
    if (!athlete.injuries || athlete.injuries.length === 0) return "No current injuries";
    // Show most recent non-cleared injury
    const active = athlete.injuries.filter(i => i.status !== "Cleared");
    if (!active.length) return "All injuries cleared";
    const last = active[active.length - 1];
    return `${last.type} (${last.status})`;
}

function getMonthlySupport(athlete) {
    const stipend = athlete.finance?.stipend || 0;
    const sponsorship = athlete.finance?.sponsorship || 0;
    return stipend + sponsorship;
}

/* ------------ RENDERING ------------ */
function renderAllViews() {
    renderAthleteLoginSelect();
    renderAthleteProfile();
    renderAthleteRankingTable();
    renderAthleteHealthAndCareer(); // NEW

    renderCoachRankingTable();
    renderCoachAthleteDropdown();
    renderCoachPerformanceList();   // NEW
    renderCoachInjuryDropdowns();   // NEW
    renderCoachInjuryList();        // NEW

    renderAdminTable();
    renderAdminTotalSupport();      // NEW
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

/* NEW: Athlete health + career + finance snapshot */
function renderAthleteHealthAndCareer() {
    const athlete = athletes.find(a => a.id === currentAthleteId);
    const injuryList = document.getElementById("athleteInjuryList");
    const preventionNotes = document.getElementById("athletePreventionNotes");
    const careerLevelEl = document.getElementById("athleteCareerLevel");
    const nextGoalEl = document.getElementById("athleteNextGoal");
    const stipendEl = document.getElementById("athleteStipend");
    const sponsorshipEl = document.getElementById("athleteSponsorship");
    const totalSupportEl = document.getElementById("athleteTotalSupport");

    if (!athlete) {
        injuryList.innerHTML = "";
        preventionNotes.textContent = "";
        careerLevelEl.textContent = "";
        nextGoalEl.textContent = "";
        stipendEl.textContent = "";
        sponsorshipEl.textContent = "";
        totalSupportEl.textContent = "";
        return;
    }

    // Injuries
    injuryList.innerHTML = "";
    if (!athlete.injuries || athlete.injuries.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No current injuries logged.";
        injuryList.appendChild(li);
        preventionNotes.textContent = "Maintain proper warm-up, cool-down, and recovery sessions.";
    } else {
        athlete.injuries.forEach(inj => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${inj.type}
                <span class="badge">${inj.severity}</span>
                <span class="badge">${inj.status}</span>
                ${inj.startDate ? ` – since ${inj.startDate}` : ""}
                ${inj.notes ? ` – ${inj.notes}` : ""}
            `;
            injuryList.appendChild(li);
        });

        // Simple generic prevention note
        preventionNotes.textContent =
            "Follow your rehab plan carefully, avoid overloading injured areas, and report pain early to your coach/physio.";
    }

    // Career
    const level = athlete.career?.level || "Not set";
    const nextGoal = athlete.career?.nextGoal || "Add your next career goal with admin/coach.";
    careerLevelEl.textContent = level;
    nextGoalEl.textContent = nextGoal;

    // Finance
    const stipend = athlete.finance?.stipend || 0;
    const sponsorship = athlete.finance?.sponsorship || 0;
    const total = stipend + sponsorship;

    stipendEl.textContent = `₹${stipend.toLocaleString("en-IN")}`;
    sponsorshipEl.textContent = `₹${sponsorship.toLocaleString("en-IN")}`;
    totalSupportEl.textContent = `₹${total.toLocaleString("en-IN")}`;
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
    if (!select) return;
    select.innerHTML = "";

    athletes.forEach(a => {
        const option = document.createElement("option");
        option.value = a.id;
        option.textContent = a.name;
        select.appendChild(option);
    });
}

/* NEW: coach injury dropdown uses same list */
function renderCoachInjuryDropdowns() {
    const injurySelect = document.getElementById("coachInjuryAthleteSelect");
    if (!injurySelect) return;
    injurySelect.innerHTML = "";

    athletes.forEach(a => {
        const option = document.createElement("option");
        option.value = a.id;
        option.textContent = a.name;
        injurySelect.appendChild(option);
    });
}

/* Admin table of all athletes (with sport filter + status + finance) */
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
        const support = getMonthlySupport(a);
        const injurySummary = getInjurySummary(a);

        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${a.name}</td>
            <td>${a.sport}</td>
            <td>${a.country}</td>
            <td>${a.points}</td>
            <td>${a.career?.level || "-"}</td>
            <td>${injurySummary}</td>
            <td>₹${support.toLocaleString("en-IN")}</td>
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

/* NEW: admin total monthly support */
function renderAdminTotalSupport() {
    const textEl = document.getElementById("totalSupportText");
    if (!textEl) return;

    const total = athletes.reduce((sum, a) => sum + getMonthlySupport(a), 0);
    textEl.textContent = `Total monthly financial support (stipend + sponsorship) for all athletes: ₹${total.toLocaleString("en-IN")}`;
}

/* NEW: coach performance history list (for selected athlete) */
function renderCoachPerformanceList() {
    const listEl = document.getElementById("coachPerformanceList");
    if (!listEl) return;

    const select = document.getElementById("coachAthleteSelect");
    const athleteId = select && select.value ? Number(select.value) : null;
    const athlete = athletes.find(a => a.id === athleteId) || athletes[0];

    listEl.innerHTML = "";
    if (!athlete || !athlete.performanceHistory || athlete.performanceHistory.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No performance history yet. Add from the form above.";
        listEl.appendChild(li);
        return;
    }

    // Show most recent 5 entries
    const recent = [...athlete.performanceHistory].slice(-5).reverse();
    recent.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${p.date || "No date"}</strong> – ${p.metric} (${p.pointsSnapshot} pts) ${p.notes ? " – " + p.notes : ""}`;
        listEl.appendChild(li);
    });
}

/* NEW: coach injury list for selected athlete in injury panel */
function renderCoachInjuryList() {
    const listEl = document.getElementById("coachInjuryList");
    if (!listEl) return;

    const select = document.getElementById("coachInjuryAthleteSelect");
    const athleteId = select && select.value ? Number(select.value) : null;
    const athlete = athletes.find(a => a.id === athleteId) || athletes[0];

    listEl.innerHTML = "";
    if (!athlete || !athlete.injuries || athlete.injuries.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No injuries logged for this athlete.";
        listEl.appendChild(li);
        return;
    }

    athlete.injuries.forEach(inj => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${inj.type}
            <span class="badge">${inj.severity}</span>
            <span class="badge">${inj.status}</span>
            ${inj.startDate ? ` – since ${inj.startDate}` : ""}
            ${inj.notes ? ` – ${inj.notes}` : ""}
        `;
        listEl.appendChild(li);
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
        const metric = document.getElementById("coachPerformanceMetric").value.trim();
        const date = document.getElementById("coachPerformanceDate").value;
        const notes = document.getElementById("coachPerformanceNotes").value.trim();

        if (Number.isNaN(newPoints)) return;

        const athlete = athletes.find(a => a.id === athleteId);
        if (!athlete) return;

        athlete.points = newPoints;

        // Ensure arrays exist
        if (!Array.isArray(athlete.performanceHistory)) {
            athlete.performanceHistory = [];
        }

        if (metric || date || notes) {
            athlete.performanceHistory.push({
                date: date || "N/A",
                metric: metric || "Performance recorded",
                notes,
                pointsSnapshot: newPoints
            });
        }

        // Clear fields (except athlete selection)
        document.getElementById("coachPointsInput").value = "";
        document.getElementById("coachPerformanceMetric").value = "";
        document.getElementById("coachPerformanceDate").value = "";
        document.getElementById("coachPerformanceNotes").value = "";

        renderAllViews();
    });

    // NEW: injury form
    const injuryForm = document.getElementById("coachInjuryForm");
    injuryForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const athleteId = Number(document.getElementById("coachInjuryAthleteSelect").value);
        const type = document.getElementById("injuryTypeInput").value.trim();
        const severity = document.getElementById("injurySeverityInput").value;
        const status = document.getElementById("injuryStatusInput").value;
        const startDate = document.getElementById("injuryStartDateInput").value;
        const notes = document.getElementById("injuryNotesInput").value.trim();

        const athlete = athletes.find(a => a.id === athleteId);
        if (!athlete || !type) return;

        if (!Array.isArray(athlete.injuries)) {
            athlete.injuries = [];
        }

        const newId =
            athlete.injuries.length > 0
                ? Math.max(...athlete.injuries.map(i => i.id)) + 1
                : 1;

        athlete.injuries.push({
            id: newId,
            type,
            severity,
            status,
            startDate,
            notes
        });

        // Clear fields
        injuryForm.reset();

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
        renderAdminTotalSupport();
    });

    // Also update coach performance list when athlete dropdown changes
    const coachAthleteSelect = document.getElementById("coachAthleteSelect");
    coachAthleteSelect.addEventListener("change", () => {
        renderCoachPerformanceList();
    });

    const coachInjurySelect = document.getElementById("coachInjuryAthleteSelect");
    coachInjurySelect.addEventListener("change", () => {
        renderCoachInjuryList();
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

        const careerLevel = document.getElementById("adminCareerLevelInput").value.trim();
        const nextGoal = document.getElementById("adminNextGoalInput").value.trim();
        const stipend = Number(document.getElementById("adminStipendInput").value || 0);
        const sponsorship = Number(document.getElementById("adminSponsorshipInput").value || 0);

        if (!name || !sport || !country || Number.isNaN(age) || Number.isNaN(points)) {
            alert("Please fill all required fields correctly.");
            return;
        }

        const newId = athletes.length ? Math.max(...athletes.map(a => a.id)) + 1 : 1;
        athletes.push({
            id: newId,
            name,
            age,
            sport,
            country,
            points,
            injuries: [],
            performanceHistory: [],
            career: {
                level: careerLevel || "Not set",
                nextGoal: nextGoal || ""
            },
            finance: {
                stipend: stipend || 0,
                sponsorship: sponsorship || 0
            }
        });

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
