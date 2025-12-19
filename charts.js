export function renderLog(allHistories) {
    const log = document.getElementById("logArea");
    if (!log) return;
    log.innerHTML = "";

    const years = Object.values(allHistories)[0]?.N.length || 0;
    for (let i = 0; i < years; i++) {
        const line = document.createElement("div");
        const parts = [];
        for (const name in allHistories) {
            const h = allHistories[name];
            parts.push(`${name}: N=${h.N[i].toFixed(1)} K=${h.K[i].toFixed(1)} GDP=${h.GDP[i].toFixed(1) } T=${h.T[i].toFixed(2)} E=${h.E[i].toFixed(3)} R=${h.R[i].toFixed(2)} EI=${h.EI[i].toFixed(3)}`);
        }
        line.textContent = `Year ${i}: ` + parts.join(" | ");
        log.appendChild(line);
    }

    const details = document.getElementById("logDetails");
    if (details) details.open = false;
}

export function renderMultiCharts(histories, keys = ["GDP", "N", "K", "T", "E", "R", "EI"]) {
    // Try to find dynamic container; if absent, fall back to old static canvases (backwards compatibility)
    const container = document.getElementById("chartsContainer");
    const DPR = window.devicePixelRatio || 1;

    const createdCanvases = [];

    // Clear container and create chart cards + canvases for each requested key
    container.innerHTML = "";

    keys.forEach((key) => {
        const card = document.createElement("div");
        card.className = "chart-card";
        card.style.flex = "1 1 50%";
        card.style.minWidth = "360px";

        const h4 = document.createElement("h4");
        h4.dataset.i18n = `charts.${key.toLowerCase()}`;
        card.appendChild(h4);

        const canvas = document.createElement("canvas");
        canvas.dataset.seriesKey = key;
        canvas.style.width = "100%";
        canvas.style.height = "300px";
        card.appendChild(canvas);

        container.appendChild(card);
        createdCanvases.push({ key, canvas });
    });

    // colors and drawing logic (mostly unchanged)
    const names = Object.keys(histories);
    const colors = ["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6"];

    function renderSeriesChart(key, canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const width = canvas.width = canvas.clientWidth * DPR;
        const height = canvas.height = canvas.clientHeight * DPR;

        ctx.clearRect(0, 0, width, height);

        // compute maxima and length
        let maxVal = 0;
        let maxLen = 0;
        for (const name of names) {
            const arr = histories[name]?.[key];
            if (Array.isArray(arr)) {
                if (arr.length > 0) maxVal = Math.max(maxVal, ...arr);
                maxLen = Math.max(maxLen, arr.length);
            }
        }
        maxVal = maxVal || 1;

        const pad = 30 * DPR;
        function xFor(i) { return pad + ((width - pad * 2) * (i / Math.max(1, maxLen - 1))); }
        function yFor(val) { return height - pad - ((height - pad * 2) * (val / maxVal)); }

        // axes
        ctx.strokeStyle = "#e6eef6";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, pad);
        ctx.lineTo(pad, height - pad);
        ctx.lineTo(width - pad, height - pad);
        ctx.stroke();

        // draw each series
        const DASH_START_INDEX = 300; // "Today" corresponds to year 300
        names.forEach((name, idx) => {
            const arr = histories[name]?.[key];
            if (!Array.isArray(arr) || arr.length === 0) return;
            const color = colors[idx % colors.length];

            ctx.strokeStyle = color;
            ctx.lineWidth = 2 * DPR;

            // draw in segments: solid for indices < DASH_START_INDEX, dashed for indices >= DASH_START_INDEX
            let start = 0;
            while (start < arr.length) {
                const isDashed = start >= DASH_START_INDEX;
                const end = isDashed ? arr.length - 1 : Math.min(arr.length - 1, DASH_START_INDEX - 1);

                ctx.beginPath();
                ctx.setLineDash(isDashed ? [6 * DPR, 6 * DPR] : []);
                ctx.moveTo(xFor(start), yFor(arr[start]));
                for (let j = start + 1; j <= end; j++) {
                    ctx.lineTo(xFor(j), yFor(arr[j]));
                }
                ctx.stroke();

                start = end + 1;
            }

            // reset dash to solid for subsequent draws
            ctx.setLineDash([]);
        });

        // legend
        ctx.font = `${12 * DPR}px sans-serif`;
        ctx.fillStyle = "#0f172a";
        names.forEach((name, idx) => {
            const x = pad + idx * 110 * DPR;
            const y = pad - 10 * DPR;
            ctx.fillStyle = colors[idx % colors.length];
            ctx.fillRect(x, y, 12 * DPR, 8 * DPR);
            ctx.fillStyle = "#0f172a";
            ctx.fillText(" " + name, x + 16 * DPR, y + 8 * DPR);
        });

        // labels font (left for future use)
        ctx.fillStyle = "#0f172a";
        ctx.font = `${14 * DPR}px sans-serif`;
    }

    // render all created canvases
    createdCanvases.forEach(({ key, canvas }) => renderSeriesChart(key, canvas));
}
