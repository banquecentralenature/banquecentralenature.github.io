export class Actor {
    constructor({ name, N, K, T, N_max, alpha = 0.1, beta = 1.0, r = 0.01, savings = 0.2, depreciation = 0.05 }) {
        this.name = name;

        this.N = N;
        this.K = K;
        this.T = T;
        this.N_max = N_max;

        this.alpha = alpha;
        this.beta = beta;
        this.r = r;
        this.savings = savings;
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
        const GDP = A * this.T * Math.sqrt(Math.max(0, this.K)) + B * E;

        // Natural regeneration
        const regen = this.r * this.N * (1 - this.N / this.N_max);

        // Update N
        this.N = Math.max(0, Math.min(this.N_max, this.N + regen - E));

        // Update K
        this.K = Math.max(0, this.K + this.savings * GDP - this.depreciation * this.K);

        // Update T
        this.T = this.T * 1.01;

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
