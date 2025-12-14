// ui.js
import { CONFIG } from "./config.js";
import {
  loadConfig,
  saveConfig,
  resolveParam
} from "./state.js";

const cfg = loadConfig();

const globalContainer = document.getElementById("globalParams");
const actorContainer = document.getElementById("actorParams");
const actorSelect = document.getElementById("actorSelect");

/* -----------------------------
   Utilities
------------------------------ */

function paramSource(param, actor) {
  if (actor && cfg.actors?.[actor]?.[param] !== undefined) return "actor";
  if (cfg.global?.[param] !== undefined) return "global";
  return "default";
}

function renderRow(param, actor = null) {
  const value = resolveParam(param, actor, cfg);
  const source = paramSource(param, actor);

  const row = document.createElement("div");
  row.className = "param-row";

  const label = document.createElement("label");
  label.textContent = param;

  const input = document.createElement("input");
  input.value = value;
  input.className =
    source === "actor"
      ? "overridden"
      : source === "global"
      ? "inherited-global"
      : "inherited-default";

  input.addEventListener("change", () => {
    const v = parseFloat(input.value);
    if (actor) {
      cfg.actors[actor] ??= {};
      cfg.actors[actor][param] = v;
    } else {
      cfg.global[param] = v;
    }
    saveConfig(cfg);
    refresh();
  });

  const clear = document.createElement("span");
  clear.textContent = "↺";
  clear.className = "clear-btn";
  clear.title = "Clear override";

  clear.addEventListener("click", () => {
    if (actor) {
      delete cfg.actors?.[actor]?.[param];
    } else {
      delete cfg.global?.[param];
    }
    saveConfig(cfg);
    refresh();
  });

  row.append(label, input, clear);
  return row;
}

/* -----------------------------
   Rendering
------------------------------ */

function renderGlobals() {
  globalContainer.innerHTML = "";
  CONFIG.getParamNames().forEach(p => {
    globalContainer.appendChild(renderRow(p));
  });
}

function renderActors() {
  actorContainer.innerHTML = "";
  const actor = actorSelect.value;
  if (!actor) return;

  CONFIG.getParamNames().forEach(p => {
    actorContainer.appendChild(renderRow(p, actor));
  });
}

function refresh() {
  renderGlobals();
  renderActors();
}

/* -----------------------------
   Init
------------------------------ */

function initActors() {
  actorSelect.innerHTML = "";
  CONFIG.getActorNames().forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    actorSelect.appendChild(opt);
  });
  actorSelect.addEventListener("change", renderActors);
}

document.getElementById("resetAll").addEventListener("click", () => {
  if (confirm("Reset all parameters to defaults?")) {
    localStorage.clear();
    location.reload();
  }
});

initActors();
refresh();
