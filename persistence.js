// Very rough empirical calibration for ~year 0 → year 2000 CE
// Units are normalized indices (not literal people / dollars)
// N ≈ relative natural capital, K ≈ produced capital, T ≈ productivity level

export const DEFAULT_ACTORS = [
    // Large population, high long-run productivity, heavy ecological drawdown
    { name: "Asia",     N: 400, K: 40, T: 1.0, N_max: 400 },

    // Smaller population but earlier capital/tech takeoff
    { name: "Europe",  N: 150, K: 45, T: 1.1, N_max: 150 },

    // High natural capital, slower capital accumulation historically
    { name: "Africa",  N: 280, K: 15, T: 0.9, N_max: 280 },

    // Late but rapid capital expansion after ~1500
    { name: "Americas",N: 380, K: 35, T: 1.0, N_max: 380 },

    // Small population, limited capital, high ecological resilience
    { name: "Oceania", N: 90,  K: 6,  T: 0.95, N_max: 90 }
];

export function loadSavedModel() {
    const raw = localStorage.getItem("modelParams");
    if (!raw) {
        return {
            // Extraction responsiveness to tech & scale
            alpha: 0.035,      // historically low pre-industrial extraction intensity
            beta: 1.1,        // extraction accelerates strongly as resources are abundant

            // Endogenous technology productivity
            gamma: 0.015,     // slow knowledge accumulation over long horizons

            // Renewable resource regeneration (forests, soils, fisheries)
            r: 0.01,          // ~1% natural regeneration per year

            // Capital dynamics
            savings: 0.18,    // long-run average investment share
            depreciation: 0.04, // slow capital decay pre-industrial

            // Simulation horizon
            years: 1000
        };
    }
    try { return JSON.parse(raw); } catch { return null; }
}

export function saveModel(model) {
    localStorage.setItem("modelParams", JSON.stringify(model));
}

export function loadSavedActors() {
    const raw = localStorage.getItem("actorsParams");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

export function saveActors(actors) {
    localStorage.setItem("actorsParams", JSON.stringify(actors));
}
