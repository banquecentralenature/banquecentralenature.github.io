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
// DOM wiring: populate actor select, sidebar behavior, save/load
// ===============================

const actorSelect = document.getElementById("actorSelect");
const configMode = document.getElementById("configMode");
const actorSelectWrapper = document.getElementById("actorSelectWrapper");

function populateActorSelect() {
    actorSelect.innerHTML = "";
    actorsParams.forEach((a, i) => {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = a.name;
        actorSelect.appendChild(opt);
    });
}
populateActorSelect();

function setFormValuesForModel() {
    document.getElementById("alpha").value = modelParams.alpha;
    document.getElementById("beta").value = modelParams.beta;
    document.getElementById("r").value = modelParams.r;
    document.getElementById("savings").value = modelParams.savings;
    document.getElementById("depreciation").value = modelParams.depreciation;
    document.getElementById("years").value = modelParams.years || 50;

    // hide or disable actor-specific initial values (but keep visible for convenience)
    const sel = actorSelect.selectedIndex >= 0 ? actorSelect.selectedIndex : 0;
    const actor = actorsParams[sel];
    document.getElementById("N").value = actor.N;
    document.getElementById("K").value = actor.K;
    document.getElementById("T").value = actor.T;
    document.getElementById("N_max").value = actor.N_max;
}

function setFormValuesForActor(index) {
    const a = actorsParams[index];
    document.getElementById("alpha").value = modelParams.alpha;
    document.getElementById("beta").value = modelParams.beta;
    document.getElementById("r").value = modelParams.r;
    document.getElementById("savings").value = modelParams.savings;
    document.getElementById("depreciation").value = modelParams.depreciation;
    document.getElementById("years").value = modelParams.years || 50;

    document.getElementById("N").value = a.N;
    document.getElementById("K").value = a.K;
    document.getElementById("T").value = a.T;
    document.getElementById("N_max").value = a.N_max;
}

if (configMode) {
    configMode.addEventListener("change", () => {
        const mode = configMode.value;
        // Use i18n strings when available
        const modelText = (i18n.data && i18n.data.model_params) ? i18n.data.model_params : "Model parameters";
        const actorText = (i18n.data && i18n.data.actor_params) ? i18n.data.actor_params : "Actor parameters";
        document.getElementById("configTitle").textContent = mode === "model" ? modelText : actorText;
        actorSelectWrapper.style.display = mode === "actor" ? "" : "none";
        // update form
        if (mode === "model") setFormValuesForModel(); else setFormValuesForActor(actorSelect.selectedIndex || 0);
    });
}

// actor change
actorSelect.addEventListener("change", () => {
    setFormValuesForActor(actorSelect.selectedIndex);
});

// save button
document.getElementById("saveBtn").addEventListener("click", () => {
    const mode = configMode.value;
    const values = {
        alpha: parseFloat(document.getElementById("alpha").value),
        beta: parseFloat(document.getElementById("beta").value),
        r: parseFloat(document.getElementById("r").value),
        savings: parseFloat(document.getElementById("savings").value),
        depreciation: parseFloat(document.getElementById("depreciation").value),
        years: parseInt(document.getElementById("years").value, 10)
    };
    if (mode === "model") {
        Object.assign(modelParams, values);
        saveModel(modelParams);
        console.log("Model parameters saved.");
    } else {
        // save actor-specific values to selected actor
        const idx = actorSelect.selectedIndex;
        if (idx < 0) return;
        actorsParams[idx] = {
            ...actorsParams[idx],
            N: parseFloat(document.getElementById("N").value),
            K: parseFloat(document.getElementById("K").value),
            T: parseFloat(document.getElementById("T").value),
            N_max: parseFloat(document.getElementById("N_max").value)
        };
        saveActors(actorsParams);
        populateActorSelect();
        console.log("Actor parameters saved.");
    }
});

document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Reset model and actors to default values?")) {
        localStorage.removeItem("modelParams");
        localStorage.removeItem("actorsParams");
        location.reload();
    }
});

// initialize form with saved values
setFormValuesForModel();

// ===============================
// Run simulation for all actors and render charts/log
// ===============================

function buildActorsFromParams() {
    const common = {
        alpha: parseFloat(document.getElementById("alpha").value),
        beta: parseFloat(document.getElementById("beta").value),
        r: parseFloat(document.getElementById("r").value),
        savings: parseFloat(document.getElementById("savings").value),
        depreciation: parseFloat(document.getElementById("depreciation").value)
    };

    // Each actor uses its own initial N/K/T/N_max but shares model params
    return actorsParams.map(a => new Actor({
        name: a.name,
        N: parseFloat(a.N),
        K: parseFloat(a.K),
        T: parseFloat(a.T),
        N_max: parseFloat(a.N_max),
        ...common
    }));
}

function runAllAndRender() {
    const years = parseInt(document.getElementById("years").value, 10) || 50;
    const actors = buildActorsFromParams();

    const histories = {};
    actors.forEach(actor => {
        histories[actor.name] = actor.run(years);
    });

    renderMultiCharts(histories);
    renderLog(histories);
}

// attach run button
document.getElementById("runBtn").addEventListener("click", runAllAndRender);

// ===============================
// Log display (collapsed by default using <details>)
// ===============================

function renderLog(allHistories) {
    const log = document.getElementById("logArea");
    log.innerHTML = "";

    const years = Object.values(allHistories)[0]?.N.length || 0;
    for (let i = 0; i < years; i++) {
        const line = document.createElement("div");
        const parts = [];
        for (const name in allHistories) {
            const h = allHistories[name];
            parts.push(`${name}: N=${h.N[i].toFixed(1)} K=${h.K[i].toFixed(1)} GDP=${h.GDP[i].toFixed(1)}`);
        }
        line.textContent = `Year ${i}: ` + parts.join(" | ");
        log.appendChild(line);
    }

    // open the details only if there is content (but keep collapsed by default)
    const details = document.getElementById("logDetails");
    if (details) details.open = false;
}

// ===============================
// Multi-actor chart renderer
// ===============================

function renderMultiCharts(histories) {
    const gdpCanvas = document.getElementById("gdpChart");
    const nCanvas = document.getElementById("nChart");
    if (!gdpCanvas || !nCanvas) return;

    const ctxG = gdpCanvas.getContext("2d");
    const ctxN = nCanvas.getContext("2d");
    const width = gdpCanvas.width = gdpCanvas.clientWidth * devicePixelRatio;
    const height = gdpCanvas.height = gdpCanvas.clientHeight * devicePixelRatio;
    nCanvas.width = width; nCanvas.height = height;

    ctxG.clearRect(0, 0, width, height);
    ctxN.clearRect(0, 0, width, height);

    const names = Object.keys(histories);
    const colors = ["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6"];
    // compute global max for scaling
    let maxGDP = 0, maxN = 0, maxLen = 0;
    for (const name of names) {
        const h = histories[name];
        maxGDP = Math.max(maxGDP, ...h.GDP);
        maxN = Math.max(maxN, ...h.N);
        maxLen = Math.max(maxLen, h.N.length);
    }
    maxGDP = maxGDP || 1;
    maxN = maxN || 1;

    const pad = 30 * devicePixelRatio;
    function xFor(i) { return pad + ( (width - pad * 2) * (i / Math.max(1, maxLen - 1)) ); }
    function yFor(val, max, H) { return H - pad - ( (H - pad * 2) * (val / max) ); }

    // draw axes (simple)
    ctxG.strokeStyle = "#e6eef6"; ctxG.lineWidth = 1;
    ctxG.beginPath(); ctxG.moveTo(pad, pad); ctxG.lineTo(pad, height - pad); ctxG.lineTo(width - pad, height - pad); ctxG.stroke();
    ctxN.strokeStyle = "#e6eef6"; ctxN.lineWidth = 1;
    ctxN.beginPath(); ctxN.moveTo(pad, pad); ctxN.lineTo(pad, height - pad); ctxN.lineTo(width - pad, height - pad); ctxN.stroke();

    // draw each actor series
    names.forEach((name, idx) => {
        const h = histories[name];
        const color = colors[idx % colors.length];

        // GDP
        ctxG.beginPath();
        ctxG.strokeStyle = color;
        ctxG.lineWidth = 2 * devicePixelRatio;
        h.GDP.forEach((v, i) => {
            const x = xFor(i);
            const y = yFor(v, maxGDP, height);
            i === 0 ? ctxG.moveTo(x,y) : ctxG.lineTo(x,y);
        });
        ctxG.stroke();

        // N
        ctxN.beginPath();
        ctxN.strokeStyle = color;
        ctxN.lineWidth = 2 * devicePixelRatio;
        h.N.forEach((v, i) => {
            const x = xFor(i);
            const y = yFor(v, maxN, height);
            i === 0 ? ctxN.moveTo(x,y) : ctxN.lineTo(x,y);
        });
        ctxN.stroke();
    });

    // legend
    ctxG.font = `${12 * devicePixelRatio}px sans-serif`;
    ctxG.fillStyle = "#0f172a";
    names.forEach((name, idx) => {
        const x = pad + idx * 110 * devicePixelRatio;
        const y = pad - 10 * devicePixelRatio;
        ctxG.fillStyle = colors[idx % colors.length];
        ctxG.fillRect(x, y, 12 * devicePixelRatio, 8 * devicePixelRatio);
        ctxG.fillStyle = "#0f172a";
        ctxG.fillText(" " + name, x + 16 * devicePixelRatio, y + 8 * devicePixelRatio);
    });

    // titles
    ctxG.fillStyle = "#0f172a";
    ctxG.font = `${14 * devicePixelRatio}px sans-serif`;
    ctxG.fillText("GDP", width - pad - 50 * devicePixelRatio, pad - 6 * devicePixelRatio);

    ctxN.fillStyle = "#0f172a";
    ctxN.font = `${14 * devicePixelRatio}px sans-serif`;
    ctxN.fillText("Natural Capital N", width - pad - 140 * devicePixelRatio, pad - 6 * devicePixelRatio);
}
