// main.js
import { initI18n } from "./i18n.js";
import { CONFIG } from "./config.js";
import { Actor } from "./actor.js";
import {
  loadConfig,
  buildGlobalParams,
  buildActorParams
} from "./state.js";
import "./ui.js"; // UI self-initializes and manages persistence
import { renderMultiCharts, renderLog } from "./charts.js";

// -----------------------------
// Init
// -----------------------------
const i18n = initI18n();

// -----------------------------
// Build actors from resolved config
// -----------------------------
function buildActorsFromConfig() {
  const cfg = loadConfig();
  const globalParams = buildGlobalParams(cfg);

  return CONFIG.getActorNames().map(name => {
    const actorParams = buildActorParams(name, cfg);

    return new Actor({
      name,
      ...globalParams,
      ...actorParams
    });
  });
}

// -----------------------------
// Run + render
// -----------------------------
function runAllAndRender() {
  const cfg = loadConfig();
  const globalParams = buildGlobalParams(cfg);
  const actors = buildActorsFromConfig();
  const years = globalParams.years;

  const histories = {};
  actors.forEach(actor => {
    histories[actor.name] = actor.run(years);
  });

  renderMultiCharts(histories);
  renderLog(histories);
  i18n.apply();
}

// -----------------------------
// Re-run on explicit save
// -----------------------------
document
  .getElementById("saveBtn")
  ?.addEventListener("click", runAllAndRender);

// initial run
runAllAndRender();
