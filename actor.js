const TODAY = 300;

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

export class Actor {
    constructor({ name, N, K, T, T_growth, N_max, beta, r, depreciation, emission_cap, biocoin_price, capital_constraint, eco_yield }) {
        this.name = name;

        this.N = N;
        this.K = K;
        this.T = T;
        this.T_growth = T_growth;
        this.N_max = N_max;
        this.B = 0; // biocoins held

        // Extraction aggressiveness (α)
        // a3 > a1 > a2
        this.alpha_min = 0.01;   // pre-industrial
        this.alpha_max = 0.12;  // industrial extraction ceiling
        this.a1 = 1.2;  // sensitivity to technology
        this.a2 = 0.8;  // sensitivity to capital/infrastructure
        this.a3 = 2.0;  // penalty from resource depletion
        this.alpha = this.alpha_min;

        this.beta = beta;

        // Technology exponent (γ)
        // g3 > g1 > g2
        this.gamma_min = 0.002;  // ancient stagnation
        this.gamma_max = 0.03;   // modern R&D productivity
        this.g1 = 1.0;  // sensitivity to GDP (surplus)
        this.g2 = 0.6;  // scale effects from capital
        this.g3 = 1.5;  // ecological stress penalty
        this.gamma = this.gamma_min;

        this.r = r;

        // s1 ≈ 1
        this.s_min = 0.05;
        this.s_max = 0.30;
        this.s1 = 1.1;  // responsiveness to surplus
        this.savings = this.s_min;

        this.depreciation = depreciation;

        // Value of N/N_max below which K and T start to decline
        this.tipping_point = 0;

        // Biocoins (not used until TODAY is reached)
        this.last_year_emission = 0.0;
        this.emission_cap = emission_cap;     // max % of GDP per year
        this.burn_rate = 0.0;         // used in harsher regimes
        this.biocoin_price = biocoin_price; // exchange rate into GDP
        this.capital_constraint = capital_constraint;  // capital constraint parameter
        this.eco_yield = eco_yield; // ecosystem yield coefficient

        // Parasitic overlay
        // this.emission_cap = 0.01;
        // this.biocoin_price = 0.8;
        // this.kappa = Infinity;

        this.extraction_sensitivity = 4; // how strongly income tradeoffs affect extraction

        this.history = {
            N: [],
            K: [],
            T: [],
            GDP: [],
            E: [],
            B: [],
            EI: []
        };
    }

    step(year) {
        // Potential extraction (capacity)
        const E_max = this.alpha * this.T * Math.pow(this.N / this.N_max, this.beta);

        // opportunity cost of extraction
        let standing_value =
            this.eco_yield *
            (this.N / this.N_max) *
            Math.pow(1 - this.N / this.N_max, 2);
        standing_value = Math.min(standing_value, this.last_year_emission);

        const extraction_value = E_max;

        // Myopic extraction choice (no foresight)
        const incentive_gap = extraction_value - this.biocoin_price * standing_value;
        const extraction_intensity = sigmoid(this.extraction_sensitivity * incentive_gap);

        // Actual extraction
        let E = extraction_intensity * E_max;
        E = Math.min(E, this.N);

        // GDP from extraction economy
        const GDP = this.T * Math.pow(this.K, this.alpha) * Math.pow(this.N, this.gamma);

        // Natural regeneration
        const regen = this.r * (this.N_max - this.N);

        // Update N
        const prevN = this.N;
        this.N = Math.max(0, Math.min(this.N_max, this.N + regen - E));
        const deltaN = this.N - prevN;
        const positive_regen = Math.max(0, deltaN);

        // Update K from GDP
        this.K = Math.max(0, this.K + this.savings * GDP - this.depreciation * this.K);

        // Update T
        this.T *= this.T_growth;

        // Endogenous parameters
        const resource_stress = 1 - (this.N / this.N_max);

        this.alpha = this.alpha_min + (this.alpha_max - this.alpha_min)
            * sigmoid(
                this.a1 * Math.log(this.T + 1)
                + this.a2 * Math.log(this.K + 1)
                - this.a3 * resource_stress
            );

        this.gamma = this.gamma_min + (this.gamma_max - this.gamma_min)
            * sigmoid(
                this.g1 * Math.log(GDP + 1)
                + this.g2 * Math.log(this.K + 1)
                - this.g3 * resource_stress
            );

        this.savings = this.s_min + (this.s_max - this.s_min)
            * sigmoid(
                this.s1 * Math.log(GDP + 1)
            );

        if (this.N < this.tipping_point * this.N_max) {
            this.T *= 0.95; // innovation slows
            this.K *= 0.95; // capital losses
        }

        if (year >= TODAY) {
            // Starting today, emit biocoins (if emission_cap > 0)
            const emission_cap = this.emission_cap

            const scarcity = 1 - (this.N / this.N_max);
            const raw_emission =
                0.5 * positive_regen +
                0.3 * regen;
            const scarcity_multiplier = 1 + scarcity * scarcity;
            const emission = Math.min(
                raw_emission * scarcity_multiplier,
                emission_cap * GDP
            );
            this.B += emission;

            // Spend fraction of biocoins
            const biocoin_spent = 0.3 * this.B;
            this.B -= biocoin_spent;

            // Convert to capital (if biocoin_price > 0)
            this.K += this.biocoin_price * biocoin_spent;

            // Shadow ecosystem yield (only when preserved)
            const eco_income = standing_value * (1 - extraction_intensity);
            this.K += eco_income;

            // Apply capital constraint (if capital_constraint < Infinity)
            this.K = Math.min(this.K, this.capital_constraint * this.B);

            this.last_year_emission = emission;
        }

        // History
        this.history.N.push(this.N);
        this.history.K.push(this.K);
        this.history.T.push(this.T);
        this.history.GDP.push(GDP);
        this.history.E.push(E);
        this.history.B.push(this.B);
        this.history.EI.push(extraction_intensity);
    }

    run(years) {
        for (let t = 0; t < years; t++) this.step(t);
        return this.history;
    }
}
