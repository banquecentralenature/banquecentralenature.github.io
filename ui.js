// ===============================
// Internationalization (i18n)
// ===============================

const i18n = {
    currentLang: "en",
    data: {},

    async load(lang) {
        try {
            const response = await fetch(`./i18n/${lang}.json`);
            if (!response.ok) throw new Error("i18n file not found");
            this.data = await response.json();
            this.currentLang = lang;
            this.apply();
        } catch (err) {
            console.warn("i18n load failed, keeping previous language", err);
        }
    },

    apply() {
        // Elements explicitly marked with data-i18n (preferred)
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (this.data[key]) el.textContent = this.data[key];
        });

        // Known UI elements that don't have data-i18n in the markup — map them here
        // Header / brand
        const brand = document.querySelector(".brand");
        if (brand && this.data.brand) brand.textContent = this.data.brand;

        // Controls labels (order in the header: Configure, Actor, Language)
        const controlInline = document.querySelectorAll(".controls .inline");
        if (controlInline && controlInline.length >= 1) {
            if (this.data.configure_label) controlInline[0].childNodes[0].nodeValue = this.data.configure_label + " ";
        }
        if (controlInline && controlInline.length >= 2) {
            if (this.data.actor_label) controlInline[1].childNodes[0].nodeValue = this.data.actor_label + " ";
        }
        if (controlInline && controlInline.length >= 3) {
            if (this.data.language_label) controlInline[2].childNodes[0].nodeValue = this.data.language_label + " ";
        }

        // Buttons
        const runBtn = document.getElementById("runBtn");
        if (runBtn && this.data.run) runBtn.textContent = this.data.run;
        const saveBtn = document.getElementById("saveBtn");
        if (saveBtn && this.data.save) saveBtn.textContent = this.data.save;
        const resetBtn = document.getElementById("resetBtn");
        if (resetBtn && this.data.reset) resetBtn.textContent = this.data.reset;

        // Config title (will be updated also by configMode listener, but set a default)
        const cfgTitle = document.getElementById("configTitle");
        if (cfgTitle && this.data.model_params) cfgTitle.textContent = this.data.model_params;

        // Log details summary
        const details = document.getElementById("logDetails");
        if (details) {
            const summary = details.querySelector("summary");
            if (summary && this.data.simulation_log) summary.textContent = this.data.simulation_log;
        }
    }
};

const langSelect = document.getElementById("languageSelect");
if (langSelect) {
    langSelect.addEventListener("change", e => {
        i18n.load(e.target.value);
    });
    // Load English by default
    i18n.load("en");
}

// ===============================
// Simulation Model (Actor)
// ===============================

class Actor {
    constructor({ name, N, K, T, N_max, alpha = 0.1, beta = 1.0, r = 0.01, savings = 0.2, depreciation = 0.05 }) {
        this.name = name;

        this.N = N;
        this.K = K;
        this.T = T;
        this.N_max = N_max;

        this.alpha = alpha;
        this.beta = beta;
        this.r = r;
        this.savings = savings;
        this.depreciation = depreciation;

        this.history = {
            N: [],
            K: [],
            T: [],
            GDP: [],
            E: []
        };
    }

    step() {
        // Extraction
        let E = this.alpha * this.T * Math.pow(this.N / this.N_max, this.beta);
        E = Math.min(E, this.N);

        // GDP
        const A = 1.0;
        const B = 1.0;
        const GDP = A * this.T * Math.sqrt(Math.max(0, this.K)) + B * E;

        // Natural regeneration
        const regen = this.r * this.N * (1 - this.N / this.N_max);

        // Update N
        this.N = Math.max(0, Math.min(this.N_max, this.N + regen - E));

        // Update K
        this.K = Math.max(0, this.K + this.savings * GDP - this.depreciation * this.K);

        // Update T
        this.T = this.T * 1.01;

        // Save history
        this.history.N.push(this.N);
        this.history.K.push(this.K);
        this.history.T.push(this.T);
        this.history.GDP.push(GDP);
        this.history.E.push(E);
    }

    run(years) {
        this.history = { N: [], K: [], T: [], GDP: [], E: [] };
        for (let t = 0; t < years; t++) this.step();
        return this.history;
    }
}

// ===============================
// Default actors and persistence
// ===============================

const DEFAULT_ACTORS = [
    { name: "Asia", N: 300, K: 20, T: 1, N_max: 400 },
    { name: "Europe", N: 100, K: 20, T: 1, N_max: 150 },
    { name: "Africa", N: 200, K: 10, T: 1, N_max: 250 },
    { name: "Americas", N: 250, K: 10, T: 1, N_max: 350 },
    { name: "Oceania", N: 50, K: 3, T: 1, N_max: 80 }
];

function loadSavedModel() {
    const raw = localStorage.getItem("modelParams");
    if (!raw) {
        return { alpha: 0.1, beta: 1.0, r: 0.02, savings: 0.2, depreciation: 0.05, years: 50 };
    }
    try { return JSON.parse(raw); } catch { return null; }
}

function saveModel(model) {
    localStorage.setItem("modelParams", JSON.stringify(model));
}

function loadSavedActors() {
    const raw = localStorage.getItem("actorsParams");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

function saveActors(actors) {
    localStorage.setItem("actorsParams", JSON.stringify(actors));
}

// Build actor parameter store (either defaults or saved)
let actorsParams = loadSavedActors() || DEFAULT_ACTORS.slice();
const modelParams = loadSavedModel();

// ===============================
// UI wiring: populate select, set form values and attach handlers for config/save/reset
// ===============================

export function populateActorSelect(actorsParams) {
    const actorSelect = document.getElementById("actorSelect");
    if (!actorSelect) return;
    actorSelect.innerHTML = "";
    actorsParams.forEach((a, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = a.name;
        actorSelect.appendChild(opt);
    });
}

export function setFormValuesForModel(modelParams, actorsParams) {
    const get = id => document.getElementById(id);
    if (get("alpha")) get("alpha").value = modelParams.alpha;
    if (get("beta")) get("beta").value = modelParams.beta;
    if (get("r")) get("r").value = modelParams.r;
    if (get("savings")) get("savings").value = modelParams.savings;
    if (get("depreciation")) get("depreciation").value = modelParams.depreciation;
    if (get("years")) get("years").value = modelParams.years || 50;

    const sel = document.getElementById("actorSelect");
    const selIndex = sel && sel.selectedIndex >= 0 ? sel.selectedIndex : 0;
    const actor = actorsParams[selIndex];
    if (actor) {
        if (get("N")) get("N").value = actor.N;
        if (get("K")) get("K").value = actor.K;
        if (get("T")) get("T").value = actor.T;
        if (get("N_max")) get("N_max").value = actor.N_max;
    }
}

export function setFormValuesForActor(index, actorsParams, modelParams) {
    const a = actorsParams[index];
    const get = id => document.getElementById(id);
    if (!a) return;
    if (get("alpha")) get("alpha").value = modelParams.alpha;
    if (get("beta")) get("beta").value = modelParams.beta;
    if (get("r")) get("r").value = modelParams.r;
    if (get("savings")) get("savings").value = modelParams.savings;
    if (get("depreciation")) get("depreciation").value = modelParams.depreciation;
    if (get("years")) get("years").value = modelParams.years || 50;

    if (get("N")) get("N").value = a.N;
    if (get("K")) get("K").value = a.K;
    if (get("T")) get("T").value = a.T;
    if (get("N_max")) get("N_max").value = a.N_max;
}

// attach config/save/reset handlers; modelParams and actorsParams are mutated directly here
export function attachConfigHandlers(actorsParams, modelParams, { saveModel, saveActors }, i18n) {
    // Sidebar-first configuration handlers
    const actorSelect = document.getElementById("actorSelect");
    const modelInputIds = ["alpha", "beta", "r", "savings", "depreciation", "years"];
    const actorInputIds = ["N", "K", "T", "N_max"];

    // persist model on blur
    modelInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("blur", () => {
            const values = {
                alpha: parseFloat(document.getElementById("alpha").value),
                beta: parseFloat(document.getElementById("beta").value),
                r: parseFloat(document.getElementById("r").value),
                savings: parseFloat(document.getElementById("savings").value),
                depreciation: parseFloat(document.getElementById("depreciation").value),
                years: parseInt(document.getElementById("years").value, 10)
            };
            Object.assign(modelParams, values);
            saveModel(modelParams);
            console.log("Model parameters saved (on blur).");
        });
    });

    // actor select change -> populate fields
    if (actorSelect) {
        actorSelect.addEventListener("change", () => {
            const idx = actorSelect.selectedIndex >= 0 ? actorSelect.selectedIndex : 0;
            setFormValuesForActor(idx, actorsParams, modelParams);
        });
    }

    // save actor fields on blur/change
    actorInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const handler = () => {
            const idx = actorSelect ? actorSelect.selectedIndex : 0;
            if (idx < 0 || !actorsParams[idx]) return;
            const a = { ...actorsParams[idx] };
            if (document.getElementById("N")) a.N = parseFloat(document.getElementById("N").value);
            if (document.getElementById("K")) a.K = parseFloat(document.getElementById("K").value);
            if (document.getElementById("T")) a.T = parseFloat(document.getElementById("T").value);
            if (document.getElementById("N_max")) a.N_max = parseFloat(document.getElementById("N_max").value);
            actorsParams[idx] = a;
            saveActors(actorsParams);
            populateActorSelect(actorsParams);
            if (actorSelect) actorSelect.selectedIndex = idx;
            console.log(`Actor ${a.name} saved.`);
        };
        el.addEventListener("blur", handler);
    });

    // Reset button (sidebar)
    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (confirm((i18n && i18n.data && i18n.data.reset_confirm) ? i18n.data.reset_confirm : "Reset model and actors to default values?")) {
                localStorage.removeItem("modelParams");
                localStorage.removeItem("actorsParams");
                location.reload();
            }
        });
    }

    // Save button explicit fallback
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            saveModel(modelParams);
            saveActors(actorsParams);
            console.log("Model and actors saved (explicit).");
        });
    }
}