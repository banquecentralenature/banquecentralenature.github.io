// Very rough empirical calibration for ~year 0 → year 2000 CE
// Units are normalized indices (not literal people / dollars)
// N ≈ relative natural capital, K ≈ produced capital, T ≈ productivity level

export const CONFIG = {
  // Global default parameters
  params: {
    alpha: { default: 0.035 },
    beta: { default: 1.1 },
    gamma: { default: 0.015 },
    r: { default: 0.01 },
    savings: { default: 0.18 },
    depreciation: { default: 0.04 },
    years: { default: 1000 },
    N: {},
    K: {},
    T: {},
    N_max: {},
  },

  actors: {
    // Large population, high long-run productivity, heavy ecological drawdown
    Asia:     { N: 400, K: 40, T: 1.0, N_max: 400 },
    // Smaller population but earlier capital/tech takeoff
    Europe:   { N: 150, K: 45, T: 1.1, N_max: 150 },
    // High natural capital, slower capital accumulation historically
    Africa:   { N: 280, K: 15, T: 0.9, N_max: 280 },
    // Late but rapid capital expansion after ~1500
    Americas: { N: 380, K: 35, T: 1.0, N_max: 380 },
    // Small population, limited capital, high ecological resilience
    Oceania:  { N: 90,  K: 6,  T: 0.95, N_max: 90 }
  },

  getParamNames() {
    return Object.keys(this.params);
  },

  getActorNames() {
    return Object.keys(this.actors);
  }
};
