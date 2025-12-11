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
            parts.push(`${name}: N=${h.N[i].toFixed(1)} K=${h.K[i].toFixed(1)} GDP=${h.GDP[i].toFixed(1)}`);
        }
        line.textContent = `Year ${i}: ` + parts.join(" | ");
        log.appendChild(line);
    }

    const details = document.getElementById("logDetails");
    if (details) details.open = false;
}

export function renderMultiCharts(histories) {
    const gdpCanvas = document.getElementById("gdpChart");
    const nCanvas = document.getElementById("nChart");
    if (!gdpCanvas || !nCanvas) return;

    const ctxG = gdpCanvas.getContext("2d");
    const ctxN = nCanvas.getContext("2d");
    const width = gdpCanvas.width = gdpCanvas.clientWidth * devicePixelRatio;
    const height = gdpCanvas.height = gdpCanvas.clientHeight * devicePixelRatio;
    nCanvas.width = width; nCanvas.height = height;

    ctxG.clearRect(0, 0, width, height);
    ctxN.clearRect(0, 0, width, height);

    const names = Object.keys(histories);
    const colors = ["#ef4444","#f59e0b","#10b981","#3b82f6","#8b5cf6"];
    let maxGDP = 0, maxN = 0, maxLen = 0;
    for (const name of names) {
        const h = histories[name];
        maxGDP = Math.max(maxGDP, ...h.GDP);
        maxN = Math.max(maxN, ...h.N);
        maxLen = Math.max(maxLen, h.N.length);
    }
    maxGDP = maxGDP || 1;
    maxN = maxN || 1;

    const pad = 30 * devicePixelRatio;
    function xFor(i) { return pad + ( (width - pad * 2) * (i / Math.max(1, maxLen - 1)) ); }
    function yFor(val, max, H) { return H - pad - ( (H - pad * 2) * (val / max) ); }

    ctxG.strokeStyle = "#e6eef6"; ctxG.lineWidth = 1;
    ctxG.beginPath(); ctxG.moveTo(pad, pad); ctxG.lineTo(pad, height - pad); ctxG.lineTo(width - pad, height - pad); ctxG.stroke();
    ctxN.strokeStyle = "#e6eef6"; ctxN.lineWidth = 1;
    ctxN.beginPath(); ctxN.moveTo(pad, pad); ctxN.lineTo(pad, height - pad); ctxN.lineTo(width - pad, height - pad); ctxN.stroke();

    names.forEach((name, idx) => {
        const h = histories[name];
        const color = colors[idx % colors.length];

        ctxG.beginPath();
        ctxG.strokeStyle = color;
        ctxG.lineWidth = 2 * devicePixelRatio;
        h.GDP.forEach((v, i) => {
            const x = xFor(i);
            const y = yFor(v, maxGDP, height);
            i === 0 ? ctxG.moveTo(x,y) : ctxG.lineTo(x,y);
        });
        ctxG.stroke();

        ctxN.beginPath();
        ctxN.strokeStyle = color;
        ctxN.lineWidth = 2 * devicePixelRatio;
        h.N.forEach((v, i) => {
            const x = xFor(i);
            const y = yFor(v, maxN, height);
            i === 0 ? ctxN.moveTo(x,y) : ctxN.lineTo(x,y);
        });
        ctxN.stroke();
    });

    ctxG.font = `${12 * devicePixelRatio}px sans-serif`;
    ctxG.fillStyle = "#0f172a";
    names.forEach((name, idx) => {
        const x = pad + idx * 110 * devicePixelRatio;
        const y = pad - 10 * devicePixelRatio;
        ctxG.fillStyle = colors[idx % colors.length];
        ctxG.fillRect(x, y, 12 * devicePixelRatio, 8 * devicePixelRatio);
        ctxG.fillStyle = "#0f172a";
        ctxG.fillText(" " + name, x + 16 * devicePixelRatio, y + 8 * devicePixelRatio);
    });

    ctxG.fillStyle = "#0f172a";
    ctxG.font = `${14 * devicePixelRatio}px sans-serif`;

    ctxN.fillStyle = "#0f172a";
    ctxN.font = `${14 * devicePixelRatio}px sans-serif`;
}
