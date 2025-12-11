export const DEFAULT_ACTORS = [
    { name: "Asia", N: 300, K: 20, T: 1, N_max: 400 },
    { name: "Europe", N: 100, K: 20, T: 1, N_max: 150 },
    { name: "Africa", N: 200, K: 10, T: 1, N_max: 250 },
    { name: "Americas", N: 250, K: 10, T: 1, N_max: 350 },
    { name: "Oceania", N: 50, K: 3, T: 1, N_max: 80 }
];

export function loadSavedModel() {
    const raw = localStorage.getItem("modelParams");
    if (!raw) {
        return { alpha: 0.1, beta: 1.0, r: 0.02, savings: 0.2, depreciation: 0.05, years: 50 };
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
