const TODAY = 300;

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

export class Actor {
    constructor({ name, K, T, T_growth, N_max, r, depreciation, emission_cap, regencoin_price, capital_constraint, reward_stock, reward_regen }) {
        this.name = name;

        this.N = N_max; // start at pristine state
        this.K = K;
        this.T = T;
        this.T_growth = T_growth;
        this.N_max = N_max;
        this.R = 0; // regencoins held
        this.GDP = 0;

        // Extraction aggressiveness (α)
        // a3 > a1 > a2
        this.alpha_min = 0.01;   // pre-industrial
        this.alpha_max = 0.12;  // industrial extraction ceiling
        this.a1 = 1.2;  // sensitivity to technology
        this.a2 = 0.8;  // sensitivity to capital/infrastructure
        this.a3 = 2.0;  // penalty from resource depletion
        this.alpha = this.alpha_min;

        // Extraction scaling exponent (β)
        this.beta = 1.1;

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

        // Regencoins (not used until TODAY is reached)
        this.emission_cap = emission_cap;     // max % of GDP per year
        this.burn_rate = 0.0;         // used in harsher regimes
        this.regencoin_price = regencoin_price; // exchange rate into GDP
        this.capital_constraint = capital_constraint;  // capital constraint parameter
        this.reward_stock = reward_stock; // regencoin reward rate for preserved ecosystems
        this.reward_regen = reward_regen; // regencoin reward rate for regeneration

        this.extraction_sensitivity = 0.5; // how strongly income tradeoffs affect extraction
        this.extraction_adjustment_speed = 0.02; // speed of adjustment toward optimal extraction
        this.previous_extraction_intensity = 0.5;

        this.history = {
            N: [],
            K: [],
            T: [],
            GDP: [],
            E: [],
            R: [],
            EI: []
        };
    }

    step(year) {
        // Natural regeneration
        const regen = this.r * (this.N_max - this.N);

        // Potential extraction (capacity)
        const E_max = this.alpha * this.T * Math.pow(this.N / this.N_max, this.beta);

        // Regencoin emissions = opportunity cost of extraction
        const emission_cap = year >= TODAY ? this.emission_cap : 0;
        const scarcity = 1 - (this.N / this.N_max);
        const raw_emission = this.reward_stock * this.N + this.reward_regen * regen;
        const scarcity_multiplier = 1 + scarcity * scarcity;
        const emission = Math.min(
            raw_emission * scarcity_multiplier,
            emission_cap * this.GDP
        );

        // Myopic extraction choice (no foresight)
        const incentive_gap = E_max - this.regencoin_price * emission;
        const target_extraction_intensity = sigmoid(this.extraction_sensitivity * incentive_gap);
        const extraction_intensity = this.extraction_adjustment_speed * (target_extraction_intensity - this.previous_extraction_intensity) + this.previous_extraction_intensity;
        this.previous_extraction_intensity = extraction_intensity;

        // Actual extraction
        let E = extraction_intensity * E_max;
        E = Math.min(E, this.N);

        // GDP from extraction economy
        this.GDP = this.T * Math.pow(this.K, this.alpha) * Math.pow(this.N, this.gamma);

        // Update N
        this.N = Math.max(0, Math.min(this.N_max, this.N + regen - E));

        // Update K from GDP
        this.K = Math.max(0, this.K + this.savings * this.GDP - this.depreciation * this.K);

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
                this.g1 * Math.log(this.GDP + 1)
                + this.g2 * Math.log(this.K + 1)
                - this.g3 * resource_stress
            );

        this.savings = this.s_min + (this.s_max - this.s_min)
            * sigmoid(
                this.s1 * Math.log(this.GDP + 1)
            );

        if (this.N < this.tipping_point * this.N_max) {
            this.T *= 0.95; // innovation slows
            this.K *= 0.95; // capital losses
        }

        if (year >= TODAY) {
            // Starting today, emit regencoins (if emission_cap > 0)
            this.R += emission;

            // Spend fraction of regencoins
            const regencoin_spent = 0.3 * this.R;
            this.R -= regencoin_spent;

            // Shadow ecosystem yield (only when preserved)
            const eco_income = emission * (1 - extraction_intensity);
            this.K += eco_income;

            // Convert to capital (if regencoin_price > 0)
            if (this.capital_constraint < Infinity) {
                this.K += this.regencoin_price * regencoin_spent;
            }

            // Or apply capital constraint (if capital_constraint < Infinity)
            this.K = Math.min(this.K, this.capital_constraint * this.R * this.regencoin_price);
        }

        // History
        this.history.N.push(this.N);
        this.history.K.push(this.K);
        this.history.T.push(this.T);
        this.history.GDP.push(this.GDP);
        this.history.E.push(E);
        this.history.R.push(this.R);
        this.history.EI.push(extraction_intensity);
    }

    run(years) {
        for (let t = 0; t < years; t++) this.step(t);
        return this.history;
    }
}
