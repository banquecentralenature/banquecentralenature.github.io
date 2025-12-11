# 🌍 Nature Central Bank

**Simulation of Coupled Economic–Ecological Dynamics**

This is a framework for simulating the co-evolution of economic activity and natural ecosystems over time.
Its purpose is to explore how different economic mechanisms, technological pathways, and extraction behaviors influence:

* **GDP and capital growth**
* **Ecosystem state and natural capital**
* **Stability vs. collapse dynamics**
* **Tradeoffs between economic expansion and ecological resilience**

Ultimately, the goal is to study whether alternative economic designs can produce stable trajectories that maintain ecosystem integrity—unlike the destabilizing patterns observed in modern economies.

---

# ⭐ **Project Overview**

### 1. **Actors as Generic Economic-Ecological Units**

Actors represent entities that consume natural capital (`N`), accumulate economic capital (`K`), and develop technology (`T`).
They can represent:

* individuals
* communities
* cities
* companies
* countries
* regions
* continents
* or abstract agents

The model is deliberately **agnostic**: hierarchy and institutional structure emerge only from how actors interact.

### 2. **Coupled Natural–Economic Dynamics**

Each actor performs:

1. **Resource extraction**
2. **Regeneration of natural capital**
3. **Production and GDP formation**
4. **Capital accumulation with depreciation**
5. **Technology growth or shocks**

The model is minimal by design, similar in philosophy to:

* Lotka-Volterra ecological dynamics
* Neoclassical capital models
* Earth-system dynamics models
* Ecological-economic feedback models

### 3. **Validation in Two Stages**

The project proceeds in two phases:

1. **Reproduce scientific consensus patterns**
   Using data-backed parameters and relationships from the literature.

2. **Introduce novel economic mechanisms**
   to test hypotheses about stability, resilience, and sustainability.

---

# 📚 **Scientific Literature & Data Sources**

---

## 🏛️ **1. World Economy (GDP, Capital, Technology, Growth Theory)**

### **Authoritative Data Sources**

| Domain                               | Source                                  | Link                                                                                                             |
| ------------------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Global GDP, historical economic data | World Bank World Development Indicators | [https://data.worldbank.org](https://data.worldbank.org)                                                         |
| National accounts, capital stock     | Penn World Table (PWT 10.0+)            | [https://www.rug.nl/ggdc/productivity/pwt](https://www.rug.nl/ggdc/productivity/pwt)                             |
| International trade, production      | OECD Data                               | [https://data.oecd.org](https://data.oecd.org)                                                                   |
| Long-run historical GDP data         | Maddison Project                        | [https://www.rug.nl/ggdc/historicaldevelopment/maddison](https://www.rug.nl/ggdc/historicaldevelopment/maddison) |

### **Foundational Economic Theory Sources**

* **Solow (1956)** – Neoclassical growth model
  [https://doi.org/10.2307/1884513](https://doi.org/10.2307/1884513)

* **Nordhaus & Tobin (1972)** – Measure of economic welfare
  [https://www.nber.org/books-and-chapters/sixth-conference-research-income-and-wealth-economic-growth-fifth-conference/economic-growth-measure-economic-welfare](https://www.nber.org/books-and-chapters/sixth-conference-research-income-and-wealth-economic-growth-fifth-conference/economic-growth-measure-economic-welfare)

* **Acemoglu (2002–2012)** – Directed technical change, environmental economics
  [https://economics.mit.edu/people/faculty/daron-acemoglu](https://economics.mit.edu/people/faculty/daron-acemoglu)

* **Dasgupta & Heal (1974)** – Resource extraction in economic growth
  [https://doi.org/10.1007/978-1-349-02399-8](https://doi.org/10.1007/978-1-349-02399-8)

### **Economic–environmental integrated models**

* **DICE / RICE models** (Nordhaus)
  [https://www.econ.yale.edu/~nordhaus/homepage/homepage/documents/DICE_Manual_100413r.pdf](https://www.econ.yale.edu/~nordhaus/homepage/homepage/documents/DICE_Manual_100413r.pdf)

* **GUM / MESSAGE / REMIND** integrated assessment models
  [https://iiasa.ac.at/models](https://iiasa.ac.at/models)

---

## 🌱 **2. Natural Capital & Ecosystem Services**

### **Global Valuation of Ecosystem Services**

**Costanza et al. (1997, 2014)** — The seminal papers estimating the global monetary value of ecosystem services.
Used widely for natural capital modeling.
2014 revision: [https://doi.org/10.1016/j.gloenvcha.2014.04.002](https://doi.org/10.1016/j.gloenvcha.2014.04.002)
Original 1997 paper: [https://doi.org/10.1038/387253a0](https://doi.org/10.1038/387253a0)

**TEEB (The Economics of Ecosystems and Biodiversity)**
United Nations–backed valuation project.
[https://teebweb.org](https://teebweb.org)

**IPBES Global Assessment (2019)**
Most comprehensive modern scientific assessment of nature’s contributions to people.
[https://ipbes.net/global-assessment](https://ipbes.net/global-assessment)

**Natural Capital Project (InVEST models)**
Provides functional relationships between ecosystems and services.
[https://naturalcapitalproject.stanford.edu](https://naturalcapitalproject.stanford.edu)

### **Ecological & Natural Regeneration Dynamics**

* **Schaefer (1954)** – fishing & renewable resource logistic replenishment
  [https://doi.org/10.1575/1912/1137](https://doi.org/10.1575/1912/1137)
* **Holling (1973)** – ecological resilience
  [https://doi.org/10.1146/annurev.es.04.110173.000245](https://doi.org/10.1146/annurev.es.04.110173.000245)
* **Folke et al. (2004)** – global resilience and social-ecological systems
  [https://doi.org/10.1146/annurev.ecolsys.35.021103.105711](https://doi.org/10.1146/annurev.ecolsys.35.021103.105711)
* **Meadows et al. (1972) — Limits to Growth**
  [https://www.clubofrome.org/publications/the-limits-to-growth](https://www.clubofrome.org/publications/the-limits-to-growth)

### **Planetary Boundaries (for stability constraints)**

**Rockström et al. (2009), Steffen et al. (2015)** — Planetary Boundaries Framework
[https://www.stockholmresilience.org/research/planetary-boundaries.html](https://www.stockholmresilience.org/research/planetary-boundaries.html)

---

## 🌐 **3. Coupled Economic–Ecological Dynamics**

* **Barbier (2011)** – Capital, natural resources, and development
  [https://doi.org/10.1017/CBO9780511862562](https://doi.org/10.1017/CBO9780511862562)

* **Dasgupta Review (2021)** – Economics of biodiversity
  [https://www.gov.uk/government/publications/final-report-the-economics-of-biodiversity-the-dasgupta-review](https://www.gov.uk/government/publications/final-report-the-economics-of-biodiversity-the-dasgupta-review)

* **“Human and nature dynamics (HANDY)”** – Motesharrei et al. (2014)
  [https://doi.org/10.1016/j.ecolecon.2014.02.014](https://doi.org/10.1016/j.ecolecon.2014.02.014)

---

# ✔️ **Model Assumptions & Calibration Rules**

### All contributors should follow these principles:

1. **Use empirical ranges from the literature above**
   For regeneration rates, extraction elasticities, depreciation, productivity scaling, etc.

2. **Keep dynamics interpretable**
   Avoid black-box ML inside the core simulation.

3. **Prefer low-parameter functional forms**
   (e.g., logistic growth, Cobb–Douglas-like production, power laws)

4. **Document every parameter and its source**
   Either in code comments or `/docs/methodology/`.

5. **Prefer carbon-neutral / material-flow consistent assumptions**
   Avoid models that implicitly assume infinite substitution between natural and economic capital.
