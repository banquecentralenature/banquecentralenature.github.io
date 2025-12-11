import { i18n, initI18n } from './i18n.js';
import { Actor } from './actor.js';
import { DEFAULT_ACTORS, loadSavedModel, loadSavedActors, saveModel, saveActors } from './persistence.js';
import { populateActorSelect, setFormValuesForModel, attachConfigHandlers, setFormValuesForActor } from './ui.js';
import { renderMultiCharts, renderLog } from './charts.js';

// Build actor parameter store (either defaults or saved)
let actorsParams = loadSavedActors() || DEFAULT_ACTORS.slice();
const modelParams = loadSavedModel();

// init i18n
initI18n();

// DOM wiring: populate actor select, sidebar behavior, save/load
populateActorSelect(actorsParams);

// initialize form with saved values
setFormValuesForModel(modelParams, actorsParams);

// attach config/save/reset handlers
attachConfigHandlers(actorsParams, modelParams, { saveModel, saveActors }, i18n);

// actor change: ensure actor form sync (some UI code needs this exported function)
const actorSelect = document.getElementById("actorSelect");
if (actorSelect) {
    actorSelect.addEventListener("change", () => {
        setFormValuesForActor(actorSelect.selectedIndex, actorsParams, modelParams);
    });
}

// Build actors for simulation
function buildActorsFromParams() {
    const common = {
        alpha: parseFloat(document.getElementById("alpha").value),
        beta: parseFloat(document.getElementById("beta").value),
        r: parseFloat(document.getElementById("r").value),
        savings: parseFloat(document.getElementById("savings").value),
        depreciation: parseFloat(document.getElementById("depreciation").value)
    };

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
const runBtn = document.getElementById("runBtn");
if (runBtn) runBtn.addEventListener("click", runAllAndRender);
