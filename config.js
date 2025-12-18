// Very rough empirical calibration for ~year 0 → year 2000 CE
// Units are normalized indices (not literal people / dollars)
// N ≈ relative natural capital, K ≈ produced capital, T ≈ productivity level

export const CONFIG = {
  // Global default parameters
  params: {
    beta: { default: 1.1 },
    r: { default: 0.01 }, // 1% per year natural recovery toward pristine state
    depreciation: { default: 0.04 },
    years: { default: 1000, overridable: false },
    N: {},
    K: {},
    T: {},
    T_growth: { default: 1.01 }, // ~1% per year technology growth
    N_max: {},
    emission_cap: { default: 0.02 }, // max % of GDP per year
    biocoin_price: { default: 8.0 }, // biocoin to capital conversion rate
    capital_constraint: { default: Infinity }, // capital constraint parameter
    eco_yield: { default: 1000 } // ecosystem yield coefficient
  },

  // Some params were calibrated to match today's N/N_max values 
  actors: {
    // Large population, high long-run productivity, heavy ecological drawdown
    Asia:     { N: 400, K: 40, T: 0.9, N_max: 400, depreciation: 0.06, r: 0.005, beta: 0.1, T_growth: 1.012 },
    // Smaller population but earlier capital/tech takeoff
    Europe:   { N: 150, K: 45, T: 2.0, N_max: 150},
    // High natural capital, slower capital accumulation historically
    Africa:   { N: 280, K: 15, T: 0.9, N_max: 280, T_growth: 1.005, r: 0.003, beta: 0.05 },
    // Late but rapid capital expansion after ~1500
    Americas: { N: 380, K: 35, T: 1.0, N_max: 380, T_growth: 1.014 },
    // Small population, limited capital, high ecological resilience
    Oceania:  { N: 90,  K: 6,  T: 0.95, N_max: 90, r: 0.07, depreciation: 0 }
  },

  getParamNames() {
    return Object.keys(this.params);
  },

  getActorNames() {
    return Object.keys(this.actors);
  }
};
