// ---------- DATA & STORAGE ----------

// Default seed data
const defaultAthletes = [
    {
        id: 1,
        name: "Rahul Sharma",
        age: 22,
        sport: "100m Sprint",
        country: "India",
        gender: "Male",
        points: 95,
        avatar: null,
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
        gender: "Female",
        points: 88,
        avatar: null,
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
        gender: "Male",
        points: 92,
        avatar: null,
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

let athletes = [];          // loaded from localStorage or default
let currentAthleteId = null;
let coachSportFilter = "";
let adminSportFilter = "";
let adminGenderFilter = "All";
let globalSearchQuery = "";

// Load from localStorage or fall back to default
function loadAthletesFromStorage() {
    try {
        const raw = localStorage.getItem("khelbharatAthletes");
        if (raw) {
            const parsed = JSON.parse(raw);
            // Ensure new fields exist
            return parsed.map(a => ({
                gender: "",
                avatar: null,
                injuries: [],
                performanceHistory: [],
                career: { level: "Not set", nextGoal: "" },
                finance: { stipend: 0, sponsorship: 0 },
                ...a,
                career: { level: "Not set", nextGoal: "", ...(a.career || {}) },
                finance: { stipend: 0, sponsorship: 0, ...(a.finance || {}) }
            }));
        }
    } catch (e) {
        console.warn("Failed to load athletes from storage", e);
    }
    return JSON.parse(JSON.stringify(defaultAthletes));
}

function saveAthletesToStorage() {
    try {
        localStorage.setItem("khelbharatAthletes", JSON.stringify(athletes));
    } catch (e) {
        console.warn("Failed to save athletes to storage", e);
    }
}

// ---------- UTILITIES & HELPERS ----------

function getSortedAthletes() {
    return [...athletes].sort((a, b) => b.points - a.points);
}

function getInjurySummary(athlete) {
    if (!athlete.injuries || athlete.injuries.length === 0) return "No current injuries";
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

function matchesGlobalSearch(athlete) {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
        athlete.name.toLowerCase().includes(q) ||
        athlete.sport.toLowerCase().includes(q) ||
        athlete.country.toLowerCase().includes(q)
    );
}

function getLastPerformanceSummary(athlete) {
    if (!athlete.performanceHistory || athlete.performanceHistory.length === 0) {
        return "No performance logged";
    }
    const last = athlete.performanceHistory[athlete.performanceHistory.length - 1];
    return `${last.date || "N/A"} – ${last.metric} (${last.pointsSnapshot} pts${last.notes ? " – " + last.notes : ""})`;
}

function computeProfileCompletion(athlete) {
    let total = 7;
    let filled = 0;
    if (athlete.name) filled++;
    if (athlete.age) filled++;
    if (athlete.sport) filled++;
    if (athlete.country) filled++;
    if (athlete.gender) filled++;
    if (athlete.avatar) filled++;
    if (athlete.career?.level && athlete.career.level !== "Not set") filled++;
    return Math.round((filled / total) * 100);
}

function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 200);
    }, 2000);
}

// ---------- THEME HANDLER ----------

function setupTheme() {
    const btn = document.getElementById("themeToggleBtn");
    if (!btn) return;

    const stored = localStorage.getItem("khelbharatTheme");
    if (stored === "dark") {
        document.body.classList.add("dark");
        btn.textContent = "☀️ Light";
    }

    btn.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark");
        btn.textContent = isDark ? "☀️ Light" : "🌙 Dark";
        localStorage.setItem("khelbharatTheme", isDark ? "dark" : "light");
    });
}

// ---------- DRAWER (DETAIL VIEW) ----------

function openAthleteDrawer(athleteId) {
    const athlete = athletes.find(a => a.id === athleteId);
    if (!athlete) return;

    const drawer = document.getElementById("athleteDrawer");
    if (!drawer) return;

    document.getElementById("drawerName").textContent = athlete.name;
    document.getElementById("drawerSport").textContent = athlete.sport;
    document.getElementById("drawerCountry").textContent = athlete.country;
    document.getElementById("drawerAge").textContent = athlete.age;
    document.getElementById("drawerGender").textContent = athlete.gender || "Not set";
    document.getElementById("drawerPoints").textContent = athlete.points;

    document.getElementById("drawerCareerLevel").textContent =
        athlete.career?.level || "Not set";
    document.getElementById("drawerNextGoal").textContent =
        athlete.career?.nextGoal || "-";

    const stipend = athlete.finance?.stipend || 0;
    const sponsorship = athlete.finance?.sponsorship || 0;
    const total = stipend + sponsorship;
    document.getElementById("drawerStipend").textContent =
        `₹${stipend.toLocaleString("en-IN")}`;
    document.getElementById("drawerSponsorship").textContent =
        `₹${sponsorship.toLocaleString("en-IN")}`;
    document.getElementById("drawerTotalSupport").textContent =
        `₹${total.toLocaleString("en-IN")}`;

    const injuryList = document.getElementById("drawerInjuryList");
    injuryList.innerHTML = "";
    if (!athlete.injuries || athlete.injuries.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No current injuries.";
        injuryList.appendChild(li);
    } else {
        athlete.injuries.forEach(inj => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${inj.type}
                <span class="badge">${inj.severity}</span>
                <span class="badge">${inj.status}</span>
                ${inj.startDate ? " – " + inj.startDate : ""}
                ${inj.notes ? " – " + inj.notes : ""}
            `;
            injuryList.appendChild(li);
        });
    }

    const perfList = document.getElementById("drawerPerformanceList");
    perfList.innerHTML = "";
    if (!athlete.performanceHistory || athlete.performanceHistory.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No performance history.";
        perfList.appendChild(li);
    } else {
        const recent = [...athlete.performanceHistory].slice(-5).reverse();
        recent.forEach(p => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${p.date || "N/A"}</strong> – ${p.metric} (${p.pointsSnapshot} pts)${p.notes ? " – " + p.notes : ""}`;
            perfList.appendChild(li);
        });
    }

    drawer.classList.remove("hidden");
}

function setupDrawerHandlers() {
    const drawer = document.getElementById("athleteDrawer");
    if (!drawer) return;

    const closeBtn = document.getElementById("drawerCloseBtn");
    const backdrop = drawer.querySelector(".drawer-backdrop");

    function close() {
        drawer.classList.add("hidden");
    }

    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
}

// Make rows clickable to open drawer
function makeRowsClickable(container) {
    container.querySelectorAll("tr[data-athlete-id]").forEach(tr => {
        tr.classList.add("clickable-row");
        tr.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;
            const id = Number(tr.dataset.athleteId);
            openAthleteDrawer(id);
        });
    });
}

// ---------- AVATAR (IMAGE UPLOAD) ----------

function setupAvatarHandlers() {
    const input = document.getElementById("avatarInput");
    if (!input) return;

    input.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const athlete = athletes.find(a => a.id === currentAthleteId);
            if (!athlete) return;
            athlete.avatar = reader.result;
            saveAthletesToStorage();
            showToast("Profile photo updated");
            renderAthleteProfile();
        };
        reader.readAsDataURL(file);
    });
}

// ---------- COMPARE MODAL ----------

function renderCompareDropdowns() {
    const selectA = document.getElementById("compareSelectA");
    const selectB = document.getElementById("compareSelectB");
    if (!selectA || !selectB) return;

    selectA.innerHTML = "";
    selectB.innerHTML = "";

    athletes.forEach(a => {
        const optA = document.createElement("option");
        optA.value = a.id;
        optA.textContent = a.name;
        selectA.appendChild(optA);

        const optB = document.createElement("option");
        optB.value = a.id;
        optB.textContent = a.name;
        selectB.appendChild(optB);
    });

    if (athletes.length >= 2) {
        selectA.value = athletes[0].id;
        selectB.value = athletes[1].id;
    }
}

function openCompareModal(idA, idB) {
    const a = athletes.find(x => x.id === idA);
    const b = athletes.find(x => x.id === idB);
    if (!a || !b) return;

    const modal = document.getElementById("compareModal");
    if (!modal) return;

    const stipendA = a.finance?.stipend || 0;
    const sponsorshipA = a.finance?.sponsorship || 0;
    const totalA = stipendA + sponsorshipA;

    const stipendB = b.finance?.stipend || 0;
    const sponsorshipB = b.finance?.sponsorship || 0;
    const totalB = stipendB + sponsorshipB;

    // Left
    document.getElementById("compareNameA").textContent = a.name;
    document.getElementById("compareSportA").textContent = a.sport;
    document.getElementById("compareCountryA").textContent = a.country;
    document.getElementById("compareAgeA").textContent = a.age;
    document.getElementById("compareGenderA").textContent = a.gender || "-";
    document.getElementById("comparePointsA").textContent = a.points;
    document.getElementById("compareCareerLevelA").textContent = a.career?.level || "Not set";
    document.getElementById("compareTotalSupportA").textContent = `₹${totalA.toLocaleString("en-IN")}`;
    document.getElementById("compareInjurySummaryA").textContent = getInjurySummary(a);
    document.getElementById("compareLastPerformanceA").textContent = getLastPerformanceSummary(a);

    // Right
    document.getElementById("compareNameB").textContent = b.name;
    document.getElementById("compareSportB").textContent = b.sport;
    document.getElementById("compareCountryB").textContent = b.country;
    document.getElementById("compareAgeB").textContent = b.age;
    document.getElementById("compareGenderB").textContent = b.gender || "-";
    document.getElementById("comparePointsB").textContent = b.points;
    document.getElementById("compareCareerLevelB").textContent = b.career?.level || "Not set";
    document.getElementById("compareTotalSupportB").textContent = `₹${totalB.toLocaleString("en-IN")}`;
    document.getElementById("compareInjurySummaryB").textContent = getInjurySummary(b);
    document.getElementById("compareLastPerformanceB").textContent = getLastPerformanceSummary(b);

    let summary = "";
    if (a.points > b.points) {
        summary += `${a.name} currently has higher points than ${b.name}. `;
    } else if (b.points > a.points) {
        summary += `${b.name} currently has higher points than ${a.name}. `;
    } else {
        summary += `${a.name} and ${b.name} are tied on points. `;
    }

    if (totalA > totalB) {
        summary += `${a.name} receives higher monthly support (₹${totalA.toLocaleString("en-IN")} vs ₹${totalB.toLocaleString("en-IN")}). `;
    } else if (totalB > totalA) {
        summary += `${b.name} receives higher monthly support (₹${totalB.toLocaleString("en-IN")} vs ₹${totalA.toLocaleString("en-IN")}). `;
    }

    document.getElementById("compareSummaryText").textContent = summary.trim();

    modal.classList.remove("hidden");
}

function setupCompareHandlers() {
    const modal = document.getElementById("compareModal");
    const btn = document.getElementById("compareBtn");
    const closeBtn = document.getElementById("compareCloseBtn");
    const backdrop = modal.querySelector(".modal-backdrop");

    btn.addEventListener("click", () => {
        const selectA = document.getElementById("compareSelectA");
        const selectB = document.getElementById("compareSelectB");
        const idA = Number(selectA.value);
        const idB = Number(selectB.value);
        if (!idA || !idB) {
            showToast("Select two athletes to compare.");
            return;
        }
        if (idA === idB) {
            showToast("Please select two different athletes.");
            return;
        }
        openCompareModal(idA, idB);
    });

    function close() {
        modal.classList.add("hidden");
    }

    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);
}

// ---------- RENDER FUNCTIONS ----------

function renderAllViews() {
    renderAthleteLoginSelect();
    renderAthleteProfile();
    renderAthleteRankingTable();
    renderAthleteHealthAndCareer();

    renderCoachRankingTable();
    renderCoachAthleteDropdown();
    renderCoachPerformanceList();
    renderCoachInjuryDropdowns();
    renderCoachInjuryList();

    renderAdminTable();
    renderAdminTotalSupport();
    renderAdminGenderStats();

    renderCompareDropdowns();
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

    if (!select.dataset.hasListener) {
        select.addEventListener("change", () => {
            currentAthleteId = Number(select.value);
            renderAllViews();
        });
        select.dataset.hasListener = "true";
    }
}

/* Athlete profile */
function renderAthleteProfile() {
    const nameEl = document.getElementById("athleteName");
    const ageEl = document.getElementById("athleteAge");
    const sportEl = document.getElementById("athleteSport");
    const countryEl = document.getElementById("athleteCountry");
    const genderEl = document.getElementById("athleteGender");

    const nameInput = document.getElementById("inputName");
    const ageInput = document.getElementById("inputAge");
    const sportInput = document.getElementById("inputSport");
    const countryInput = document.getElementById("inputCountry");
    const genderInput = document.getElementById("inputGender");

    const avatarEl = document.getElementById("athleteAvatar");
    const completionBar = document.getElementById("completionBar");
    const completionText = document.getElementById("completionText");

    if (!athletes.length || currentAthleteId === null) {
        nameEl.textContent = "";
        ageEl.textContent = "";
        sportEl.textContent = "";
        countryEl.textContent = "";
        genderEl.textContent = "";
        nameInput.value = "";
        ageInput.value = "";
        sportInput.value = "";
        countryInput.value = "";
        genderInput.value = "";
        avatarEl.style.backgroundImage = "none";
        avatarEl.textContent = "A";
        completionBar.style.width = "0%";
        completionText.textContent = "";
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
    genderEl.textContent = athlete.gender || "Not set";

    nameInput.value = athlete.name || "";
    ageInput.value = athlete.age || "";
    sportInput.value = athlete.sport || "";
    countryInput.value = athlete.country || "";
    genderInput.value = athlete.gender || "";

    // Avatar
    const initials = (athlete.name || "?")
        .split(" ")
        .filter(Boolean)
        .map(p => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    if (athlete.avatar) {
        avatarEl.style.backgroundImage = `url(${athlete.avatar})`;
        avatarEl.textContent = "";
    } else {
        avatarEl.style.backgroundImage = "none";
        avatarEl.textContent = initials || "A";
    }

    // Profile completion
    const percent = computeProfileCompletion(athlete);
    completionBar.style.width = `${percent}%`;
    completionText.textContent = `${percent}% of your profile is complete.`;
}

/* Athlete ranking table */
function renderAthleteRankingTable() {
    const tbody = document.getElementById("athleteRankingTable");
    tbody.innerHTML = "";

    const sorted = getSortedAthletes().filter(matchesGlobalSearch);
    const maxPoints = sorted.length ? sorted[0].points : 0;

    sorted.forEach((athlete, index) => {
        const tr = document.createElement("tr");
        tr.dataset.athleteId = athlete.id;
        if (athlete.id === currentAthleteId) {
            tr.classList.add("athlete-highlight");
        }

        const percent = maxPoints ? Math.round((athlete.points / maxPoints) * 100) : 0;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${athlete.name}</td>
            <td>${athlete.sport}</td>
            <td>${athlete.country}</td>
            <td>
                ${athlete.points}
                <div class="performance-bar-wrapper">
                    <div class="performance-bar" style="width:${percent}%;"></div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    makeRowsClickable(tbody);
}

/* Athlete health + career + finance */
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
        preventionNotes.textContent =
            "Follow your rehab plan carefully, avoid overloading injured areas, and report pain early to your coach/physio.";
    }

    const level = athlete.career?.level || "Not set";
    const nextGoal = athlete.career?.nextGoal || "Add your next career goal with admin/coach.";
    careerLevelEl.textContent = level;
    nextGoalEl.textContent = nextGoal;

    const stipend = athlete.finance?.stipend || 0;
    const sponsorship = athlete.finance?.sponsorship || 0;
    const total = stipend + sponsorship;

    stipendEl.textContent = `₹${stipend.toLocaleString("en-IN")}`;
    sponsorshipEl.textContent = `₹${sponsorship.toLocaleString("en-IN")}`;
    totalSupportEl.textContent = `₹${total.toLocaleString("en-IN")}`;
}

/* Coach ranking table */
function renderCoachRankingTable() {
    const tbody = document.getElementById("coachRankingTable");
    tbody.innerHTML = "";

    let list = getSortedAthletes().filter(matchesGlobalSearch);
    if (coachSportFilter) {
        list = list.filter(a =>
            a.sport.toLowerCase().includes(coachSportFilter)
        );
    }

    const maxPoints = list.length ? list[0].points : 0;

    list.forEach((athlete, index) => {
        const tr = document.createElement("tr");
        tr.dataset.athleteId = athlete.id;
        const percent = maxPoints ? Math.round((athlete.points / maxPoints) * 100) : 0;

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${athlete.name}</td>
            <td>${athlete.sport}</td>
            <td>
                ${athlete.points}
                <div class="performance-bar-wrapper">
                    <div class="performance-bar" style="width:${percent}%;"></div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    makeRowsClickable(tbody);
}

/* Coach dropdowns & lists */
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

    const recent = [...athlete.performanceHistory].slice(-5).reverse();
    recent.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${p.date || "No date"}</strong> – ${p.metric} (${p.pointsSnapshot} pts) ${p.notes ? " – " + p.notes : ""}`;
        listEl.appendChild(li);
    });
}

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

/* Admin table & totals */
function renderAdminTable() {
    const tbody = document.getElementById("adminAthleteTable");
    tbody.innerHTML = "";

    let list = [...athletes].filter(matchesGlobalSearch);
    if (adminSportFilter) {
        list = list.filter(a =>
            a.sport.toLowerCase().includes(adminSportFilter)
        );
    }
    if (adminGenderFilter !== "All") {
        list = list.filter(a => (a.gender || "") === adminGenderFilter);
    }

    list.forEach((a, idx) => {
        const tr = document.createElement("tr");
        const support = getMonthlySupport(a);
        const injurySummary = getInjurySummary(a);

        tr.dataset.athleteId = a.id;
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${a.name}</td>
            <td>${a.sport}</td>
            <td>${a.country}</td>
            <td>${a.gender || "-"}</td>
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

    tbody.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = Number(btn.dataset.id);
            deleteAthlete(id);
        });
    });

    makeRowsClickable(tbody);
}

function renderAdminTotalSupport() {
    const textEl = document.getElementById("totalSupportText");
    if (!textEl) return;

    const total = athletes.reduce((sum, a) => sum + getMonthlySupport(a), 0);
    textEl.textContent = `Total monthly financial support (stipend + sponsorship) for all athletes: ₹${total.toLocaleString("en-IN")}`;
}

function renderAdminGenderStats() {
    const textEl = document.getElementById("genderStatsText");
    if (!textEl) return;

    let male = 0, female = 0, other = 0;
    athletes.forEach(a => {
        if (a.gender === "Male") male++;
        else if (a.gender === "Female") female++;
        else if (a.gender === "Other") other++;
    });

    textEl.textContent = `Gender distribution – Male: ${male}, Female: ${female}, Other: ${other}`;
}

// ---------- EVENT HANDLERS ----------

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
        renderAthleteProfile();
    });

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const athlete = athletes.find(a => a.id === currentAthleteId);
        if (!athlete) return;

        athlete.name = document.getElementById("inputName").value.trim();
        athlete.age = Number(document.getElementById("inputAge").value);
        athlete.sport = document.getElementById("inputSport").value.trim();
        athlete.country = document.getElementById("inputCountry").value.trim();
        athlete.gender = document.getElementById("inputGender").value;

        saveAthletesToStorage();
        showToast("Profile updated");

        profileForm.classList.add("hidden");
        profileView.classList.remove("hidden");

        renderAllViews();
    });
}

function setupCoachHandlers() {
    const form = document.getElementById("coachUpdateForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const athleteId = Number(document.getElementById("coachAthleteSelect").value);
        const newPoints = Number(document.getElementById("coachPointsInput").value);
        const metric = document.getElementById("coachPerformanceMetric").value.trim();
        const date = document.getElementById("coachPerformanceDate").value;
        const notes = document.getElementById("coachPerformanceNotes").value.trim();

        const athlete = athletes.find(a => a.id === athleteId);
        if (!athlete) return;

        if (!Number.isNaN(newPoints)) {
            athlete.points = newPoints;
        }

        if (!Array.isArray(athlete.performanceHistory)) {
            athlete.performanceHistory = [];
        }

        if (metric || date || notes || !Number.isNaN(newPoints)) {
            athlete.performanceHistory.push({
                date: date || "N/A",
                metric: metric || "Performance recorded",
                notes,
                pointsSnapshot: !Number.isNaN(newPoints) ? newPoints : athlete.points
            });
        }

        document.getElementById("coachPointsInput").value = "";
        document.getElementById("coachPerformanceMetric").value = "";
        document.getElementById("coachPerformanceDate").value = "";
        document.getElementById("coachPerformanceNotes").value = "";

        saveAthletesToStorage();
        showToast("Performance updated");

        renderAllViews();
    });

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

        injuryForm.reset();
        saveAthletesToStorage();
        showToast("Injury added");

        renderAllViews();
    });
}

function setupFilterHandlers() {
    const coachFilterInput = document.getElementById("coachSportFilter");
    const adminFilterInput = document.getElementById("adminSportFilter");
    const adminGenderFilterSelect = document.getElementById("adminGenderFilter");
    const globalSearchInput = document.getElementById("globalSearchInput");

    coachFilterInput.addEventListener("input", () => {
        coachSportFilter = coachFilterInput.value.trim().toLowerCase();
        renderCoachRankingTable();
    });

    adminFilterInput.addEventListener("input", () => {
        adminSportFilter = adminFilterInput.value.trim().toLowerCase();
        renderAdminTable();
        renderAdminTotalSupport();
        renderAdminGenderStats();
    });

    adminGenderFilterSelect.addEventListener("change", () => {
        adminGenderFilter = adminGenderFilterSelect.value;
        renderAdminTable();
        renderAdminGenderStats();
    });

    globalSearchInput.addEventListener("input", () => {
        globalSearchQuery = globalSearchInput.value.trim();
        renderAllViews();
    });

    const coachAthleteSelect = document.getElementById("coachAthleteSelect");
    coachAthleteSelect.addEventListener("change", () => {
        renderCoachPerformanceList();
    });

    const coachInjurySelect = document.getElementById("coachInjuryAthleteSelect");
    coachInjurySelect.addEventListener("change", () => {
        renderCoachInjuryList();
    });
}

function setupAdminHandlers() {
    const form = document.getElementById("adminAddForm");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("adminNameInput").value.trim();
        const age = Number(document.getElementById("adminAgeInput").value);
        const sport = document.getElementById("adminSportInput").value.trim();
        const country = document.getElementById("adminCountryInput").value.trim();
        const gender = document.getElementById("adminGenderInput").value;
        const points = Number(document.getElementById("adminPointsInput").value);

        const careerLevel = document.getElementById("adminCareerLevelInput").value.trim();
        const nextGoal = document.getElementById("adminNextGoalInput").value.trim();
        const stipend = Number(document.getElementById("adminStipendInput").value || 0);
        const sponsorship = Number(document.getElementById("adminSponsorshipInput").value || 0);

        if (!name || !sport || !country || !gender || Number.isNaN(age) || Number.isNaN(points)) {
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
            gender,
            points,
            avatar: null,
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

        form.reset();
        saveAthletesToStorage();
        showToast("Athlete added");

        renderAllViews();
    });
}

function deleteAthlete(id) {
    if (id === currentAthleteId) {
        alert("You cannot delete the currently logged-in athlete.");
        return;
    }
    athletes = athletes.filter(a => a.id !== id);
    saveAthletesToStorage();
    showToast("Athlete deleted");
    renderAllViews();
}

// ---------- INIT ----------

document.addEventListener("DOMContentLoaded", () => {
    athletes = loadAthletesFromStorage();

    if (athletes.length > 0 && currentAthleteId === null) {
        currentAthleteId = athletes[0].id;
    }

    setupTabs();
    setupTheme();
    setupDrawerHandlers();
    setupCompareHandlers();
    setupAvatarHandlers();
    setupAthleteProfileHandlers();
    setupCoachHandlers();
    setupAdminHandlers();
    setupFilterHandlers();

    renderAllViews();
});