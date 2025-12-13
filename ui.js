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
    if (get("gamma")) get("gamma").value = modelParams.gamma;
    if (get("r")) get("r").value = modelParams.r;
    if (get("savings")) get("savings").value = modelParams.savings;
    if (get("depreciation")) get("depreciation").value = modelParams.depreciation;
    if (get("years")) get("years").value = modelParams.years;

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
    if (get("gamma")) get("gamma").value = modelParams.gamma;
    if (get("r")) get("r").value = modelParams.r;
    if (get("savings")) get("savings").value = modelParams.savings;
    if (get("depreciation")) get("depreciation").value = modelParams.depreciation;
    if (get("years")) get("years").value = modelParams.years;

    if (get("N")) get("N").value = a.N;
    if (get("K")) get("K").value = a.K;
    if (get("T")) get("T").value = a.T;
    if (get("N_max")) get("N_max").value = a.N_max;
}

// attach config/save/reset handlers; modelParams and actorsParams are mutated directly here
export function attachConfigHandlers(actorsParams, modelParams, { saveModel, saveActors }, i18n) {
    // Sidebar-first configuration handlers
    const actorSelect = document.getElementById("actorSelect");
    const modelInputIds = ["alpha", "beta", "gamma", "r", "savings", "depreciation", "years"];
    const actorInputIds = ["N", "K", "T", "N_max"];

    // persist model on blur
    modelInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("blur", () => {
            const values = {
                alpha: parseFloat(document.getElementById("alpha").value),
                beta: parseFloat(document.getElementById("beta").value),
                gamma: parseFloat(document.getElementById("gamma").value),
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