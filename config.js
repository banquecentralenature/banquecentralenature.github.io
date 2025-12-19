// Very rough empirical calibration for ~year 0 → year 2000 CE
// Units are normalized indices (not literal people / dollars)
// N ≈ relative natural capital, K ≈ produced capital, T ≈ productivity level

export const CONFIG = {
  // Global default parameters
  params: {
    years: { default: 1000, overridable: false },
    r: {}, // natural recovery toward pristine state
    depreciation: {},
    K: {},
    T: {},
    T_growth: {},
    N_max: {},
    emission_cap: { default: 0.02 }, // max % of GDP per year
    regencoin_price: { default: 2.0 }, // regencoin to capital conversion rate
    capital_constraint: { default: Infinity }, // capital constraint parameter
    reward_stock: { default: 0.02 }, // regencoin reward rate for preserved ecosystems
    reward_regen: { default: 1 }, // regencoin reward rate for regeneration
    tipping_point: { default: 0 }, // value of N/N_max below which K and T start to decline
    technology_impact: { default: 0.95 }, // fractional T loss when below tipping point
  },

  // Some params were calibrated to match today's N/N_max values 
  actors: {
    // Large population, high long-run productivity, heavy ecological drawdown
    Asia:     { K: 40, T: 0.9, N_max: 400, depreciation: 0.06, r: 0.005, T_growth: 1.012 },
    // Smaller population but earlier capital/tech takeoff
    Europe:   { K: 45, T: 2.0, N_max: 150, depreciation: 0.04, r: 0.01, T_growth: 1.01 },
    // High natural capital, slower capital accumulation historically
    Africa:   { K: 15, T: 0.9, N_max: 280, depreciation: 0.04, r: 0.003, T_growth: 1.005 },
    // Late but rapid capital expansion after ~1500
    Americas: { K: 35, T: 1.0, N_max: 380, depreciation: 0.04, r: 0.01, T_growth: 1.014 },
    // Small population, limited capital, high ecological resilience
    Oceania:  { K: 6,  T: 0.95, N_max: 90, depreciation: 0.01, r: 0.07, T_growth: 1.01 }
  },

  getParamNames() {
    return Object.keys(this.params);
  },

  getActorNames() {
    return Object.keys(this.actors);
  }
};
