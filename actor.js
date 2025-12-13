function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

export class Actor {
    constructor({ name, N, K, T, N_max, alpha, beta, gamma, r, savings, depreciation }) {
        this.name = name;

        this.N = N;
        this.K = K;
        this.T = T;
        this.N_max = N_max;

        // a3 > a1 > a2
        this.alpha_min = 0.01;   // pre-industrial
        this.alpha_max = 0.12;  // industrial extraction ceiling
        this.a1 = 1.2;  // sensitivity to technology
        this.a2 = 0.8;  // sensitivity to capital/infrastructure
        this.a3 = 2.0;  // penalty from resource depletion
        this.alpha = this.alpha_min;

        this.beta = beta;

        // g3 > g1 > g2
        this.gamma_min = 0.002;  // ancient stagnation
        this.gamma_max = 0.03;   // modern R&D productivity
        this.g1 = 1.0;  // sensitivity to GDP (surplus)
        this.g2 = 0.6;  // scale effects from capital
        this.g3 = 1.5;  // ecological stress penalty
        this.gamma = this.gamma_min;

        this.rho = 0.01; // 1% per year natural recovery toward pristine state
        this.ecoShare = 0.02; // 2% of GDP devoted to ecosystem restoration
        this.eta = 0.6;      // efficiency of restoration spending
        
        this.r = r;

        // s1 ≈ 1
        this.s_min = 0.05;
        this.s_max = 0.30;
        this.s1 = 1.1;  // responsiveness to surplus
        this.savings = this.s_min;
        
        this.depreciation = depreciation;

        this.history = {
            N: [],
            K: [],
            T: [],
            GDP: [],
            E: []
        };
    }

    step() {
        // Extraction
        let E = this.alpha * this.T * Math.pow(this.N / this.N_max, this.beta);
        E = Math.min(E, this.N);

        // GDP
        const A = 1.0;
        const B = 1.0;
        const GDP = this.T * Math.pow(this.K, this.alpha) * Math.pow(this.N, this.gamma);

        // Natural regeneration
        const passiveRegen = this.rho * (this.N_max - this.N);
        const activeRegen = this.eta * this.ecoShare * GDP;
        const regen = passiveRegen + activeRegen;

        // Update N
        this.N = Math.max(0, Math.min(this.N_max, this.N + regen - E));

        // Update K
        this.K = Math.max(0, this.K + this.savings * GDP - this.depreciation * this.K);

        // Update T
        this.T = this.T * 1.01;

        // Update endogenous parameters
        const resourceStress = 1 - (this.N / this.N_max);

        this.alpha = this.alpha_min + (this.alpha_max - this.alpha_min)
            * sigmoid(
                this.a1 * Math.log(this.T + 1)
                + this.a2 * Math.log(this.K + 1)
                - this.a3 * resourceStress
                );

        this.gamma = this.gamma_min + (this.gamma_max - this.gamma_min)
            * sigmoid(
                this.g1 * Math.log(GDP + 1)
                + this.g2 * Math.log(this.K + 1)
                - this.g3 * resourceStress
                );

        this.savings = this.s_min + (this.s_max - this.s_min)
            * sigmoid(
                this.s1 * Math.log(GDP + 1)
            );
        
        if (this.N < 0.4 * this.N_max) {
            this.T *= 0.98; // innovation slows
            this.K *= 0.99; // capital losses
        }

        // Save history
        this.history.N.push(this.N);
        this.history.K.push(this.K);
        this.history.T.push(this.T);
        this.history.GDP.push(GDP);
        this.history.E.push(E);
    }

    run(years) {
        this.history = { N: [], K: [], T: [], GDP: [], E: [] };
        for (let t = 0; t < years; t++) this.step();
        return this.history;
    }
}
