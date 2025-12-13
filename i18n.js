export const i18n = {
    currentLang: "fr",
    data: {},

    async load(lang) {
        try {
            const response = await fetch(`./i18n/${lang}.json`);
            if (!response.ok) throw new Error("i18n file not found");
            this.data = await response.json();
            this.currentLang = lang;
            this.apply();
        } catch (err) {
            console.warn("i18n load failed, keeping previous language", err);
        }
    },

    apply() {
        // Elements explicitly marked with data-i18n (preferred)
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (this.data[key]) el.textContent = this.data[key];
        });

        // Known UI elements that don't have data-i18n in the markup — map them here
        const brand = document.querySelector(".brand");
        if (brand && this.data.brand) brand.textContent = this.data.brand;

        const controlInline = document.querySelectorAll(".controls .inline");
        if (controlInline && controlInline.length >= 1) {
            if (this.data.configure_label) controlInline[0].childNodes[0].nodeValue = this.data.configure_label + " ";
        }
        if (controlInline && controlInline.length >= 2) {
            if (this.data.actor_label) controlInline[1].childNodes[0].nodeValue = this.data.actor_label + " ";
        }
        if (controlInline && controlInline.length >= 3) {
            if (this.data.language_label) controlInline[2].childNodes[0].nodeValue = this.data.language_label + " ";
        }

        const saveBtn = document.getElementById("saveBtn");
        if (saveBtn && this.data.save) saveBtn.textContent = this.data.save;
        const resetBtn = document.getElementById("resetBtn");
        if (resetBtn && this.data.reset) resetBtn.textContent = this.data.reset;

        const cfgTitle = document.getElementById("configTitle");
        if (cfgTitle && this.data.model_params) cfgTitle.textContent = this.data.model_params;

        const details = document.getElementById("logDetails");
        if (details) {
            const summary = details.querySelector("summary");
            if (summary && this.data.simulation_log) summary.textContent = this.data.simulation_log;
        }
    }
};

// helper to wire language selector and load default
export function initI18n() {
    const langSelect = document.getElementById("languageSelect");
    if (langSelect) {
        langSelect.addEventListener("change", e => {
            i18n.load(e.target.value);
        });
    }
    i18n.load("fr");
}
