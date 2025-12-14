// state.js
import { CONFIG } from "./config.js";

const STORAGE_KEY = "modelConfig";

export function loadConfig() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { global: {}, actors: {} };
  try {
    return JSON.parse(raw);
  } catch {
    return { global: {}, actors: {} };
  }
}

export function saveConfig(cfg) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

// Effective value resolution
export function resolveParam(param, actorName, cfg) {
  if (actorName && cfg.actors?.[actorName]?.[param] !== undefined) {
    return cfg.actors[actorName][param];
  }
  if (cfg.global?.[param] !== undefined) {
    return cfg.global[param];
  }
  if (actorName && CONFIG.actors?.[actorName]?.[param] !== undefined) {
    return CONFIG.actors[actorName][param];
  }
  return CONFIG.params[param].default;
}

// Build full effective actor object
export function buildActorParams(actorName, cfg) {
  const result = {};
  CONFIG.getParamNames().forEach(p => {
    result[p] = resolveParam(p, actorName, cfg);
  });
  return result;
}

// Build effective global params
export function buildGlobalParams(cfg) {
  const result = {};
  CONFIG.getParamNames().forEach(p => {
    result[p] =
      cfg.global?.[p] ?? CONFIG.params[p].default;
  });
  return result;
}
