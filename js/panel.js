/* Panel de monitoreo NeoSleep — demostración con datos de ejemplo.
   Uso: <div data-panel></div>  (se puede usar más de una vez por página) */
(function () {
  const template = (id) => `
  <div class="phone">
    <div class="phone-top"><span><span class="live-dot"></span>Monitoreo activo</span><span class="mono">Datos de ejemplo</span></div>
    <div class="ptabs" role="tablist">
      <button role="tab" aria-selected="true" data-v="inicio">Inicio</button>
      <button role="tab" aria-selected="false" data-v="historial">Historial</button>
      <button role="tab" aria-selected="false" data-v="alertas">Alertas <span data-count></span></button>
    </div>
    <div class="pview" data-view="inicio">
      <div class="depth"><canvas width="320" height="240"></canvas><span>Mapa de profundidad · representación ilustrativa</span></div>
      <div class="metric"><div class="muted small">Frecuencia respiratoria</div><span class="val" data-fr>34.2</span><span class="unit">resp/min</span></div>
      <div class="mini">
        <div class="metric"><div class="muted small">Posición</div><span class="val" data-pos>Supino</span></div>
        <div class="metric"><div class="muted small">Tiempo monitoreando</div><span class="val mono" data-time>00:00:00</span></div>
        <div class="metric"><div class="muted small">Desplazamiento torácico</div><span class="val mono" data-mm>4.1 mm</span></div>
        <div class="metric"><div class="muted small">Alertas activas</div><span class="val" data-active>0</span></div>
      </div>
    </div>
    <div class="pview" data-view="historial" hidden>
      <p class="small muted" style="margin:4px 0 8px">Frecuencia respiratoria de la sesión (resp/min)</p>
      <canvas class="chart" width="640" height="340" data-chart aria-label="Gráfica de frecuencia respiratoria"></canvas>
      <div class="mini" style="margin-top:10px">
        <div class="metric"><div class="muted small">Promedio</div><span class="val mono" data-avg>—</span></div>
        <div class="metric"><div class="muted small">Mín / Máx</div><span class="val mono" data-mm2>—</span></div>
      </div>
    </div>
    <div class="pview" data-view="alertas" hidden>
      <div data-alerts></div>
    </div>
    <button class="btn btn-danger" style="width:100%;margin-top:6px" data-sim>Simular alerta</button>
    <div class="alert-banner" role="alertdialog" aria-labelledby="ab-${id}">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F87171" stroke-width="2" style="margin:0 auto" aria-hidden="true"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg>
      <h3 id="ab-${id}">Alerta de apnea — Revisar al lactante de inmediato</h3>
      <p class="mono small" style="color:#FFD5D5">ALERTA: apnea — Sin respiración confirmada por 15.0 s</p>
      <button class="btn btn-primary" data-resolve>Marcar como atendida</button>
    </div>
  </div>`;

  const pad = (n) => String(n).padStart(2, "0");
  const now = () => new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  function beep(ctxHolder) {
    try {
      const ctx = ctxHolder.ctx || (ctxHolder.ctx = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "square"; o.frequency.value = 2400; g.gain.value = 0.05;
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.18);
    } catch { /* sin audio */ }
  }

  function init(root, idx) {
    root.innerHTML = template(idx);
    const $ = (s) => root.querySelector(s);
    const start = Date.now() - 47 * 60 * 1000; // sesión iniciada hace 47 min
    const history = [];
    for (let i = 0; i < 60; i++) history.push(+(33 + Math.sin(i / 6) * 1.6 + (Math.random() - 0.5) * 1.4).toFixed(1));
    const alerts = [
      { t: "22:41:08", msg: "ALERTA: signal_lost — No se detecta al bebé (ni cara ni silueta) en cuadro", cls: "w" },
      { t: "22:41:19", msg: "Resuelto", cls: "r" },
    ];
    let apnea = false, phase = 0, buzz = null; const audio = {};

    // Vistas
    root.querySelectorAll(".ptabs button").forEach((b) => b.addEventListener("click", () => {
      root.querySelectorAll(".ptabs button").forEach((x) => x.setAttribute("aria-selected", x === b));
      root.querySelectorAll(".pview").forEach((v) => (v.hidden = v.dataset.view !== b.dataset.v));
      if (b.dataset.v === "historial") drawChart();
    }));

    function renderAlerts() {
      $("[data-alerts]").innerHTML = alerts.slice().reverse().map((a) =>
        `<div class="alert-item ${a.on ? "on" : ""}"><span class="t">${a.t}</span><span class="${a.cls === "a" ? "" : ""}" style="color:${a.cls === "a" ? "#F87171" : a.cls === "r" ? "#5EEAD4" : "#FCD34D"}">${a.msg}</span></div>`).join("");
      const active = apnea ? 1 : 0;
      $("[data-active]").textContent = active;
      $("[data-active]").style.color = active ? "#F87171" : "";
      $("[data-count]").textContent = active ? "•" : "";
    }

    function drawChart() {
      const c = $("[data-chart]"), x = c.getContext("2d"), W = c.width, H = c.height, p = 36;
      x.clearRect(0, 0, W, H);
      const min = 20, max = 45;
      x.strokeStyle = "rgba(245,247,250,.08)"; x.fillStyle = "#A9B4CC"; x.font = "20px IBM Plex Mono, monospace"; x.lineWidth = 1;
      [20, 30, 40].forEach((v) => { const y = H - p - ((v - min) / (max - min)) * (H - 2 * p); x.beginPath(); x.moveTo(p + 20, y); x.lineTo(W - 10, y); x.stroke(); x.fillText(v, 4, y + 6); });
      x.beginPath(); x.strokeStyle = "#5EEAD4"; x.lineWidth = 4; x.lineJoin = "round";
      history.forEach((v, i) => { const X = p + 20 + (i / (history.length - 1)) * (W - p - 30); const Y = H - p - ((v - min) / (max - min)) * (H - 2 * p); i ? x.lineTo(X, Y) : x.moveTo(X, Y); });
      x.stroke();
      const vals = history.filter((v) => v > 0);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      $("[data-avg]").textContent = avg.toFixed(1);
      $("[data-mm2]").textContent = Math.min(...vals).toFixed(1) + " / " + Math.max(...vals).toFixed(1);
    }

    // Mapa de profundidad ilustrativo (paleta de distancia), con respiración
    const cv = $(".depth canvas"), g = cv.getContext("2d");
    function drawDepth() {
      const W = cv.width, H = cv.height;
      const k = apnea ? 0 : Math.sin(phase) * 0.5 + 0.5;
      const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, "#1b0b52"); grd.addColorStop(1, "#2a1a7a");
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      // colchón
      g.fillStyle = "#3b38a8"; g.fillRect(30, 40, W - 60, H - 70);
      // cuerpo (más cercano = más cálido)
      const body = (cx, cy, rx, ry, c) => { const r = g.createRadialGradient(cx, cy, 2, cx, cy, Math.max(rx, ry)); r.addColorStop(0, c[0]); r.addColorStop(.6, c[1]); r.addColorStop(1, "rgba(59,56,168,0)"); g.fillStyle = r; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
      body(160, 150, 70 + k * 3, 46 + k * 4, ["#fde047", "#22c55e"]); // tórax
      body(160, 82, 30, 28, ["#facc15", "#16a34a"]); // cabeza
      body(110, 190, 26, 18, ["#84cc16", "#0ea5e9"]);
      body(210, 190, 26, 18, ["#84cc16", "#0ea5e9"]);
      // caja de detección
      g.strokeStyle = apnea ? "#F87171" : "#5EEAD4"; g.lineWidth = 2; g.strokeRect(84, 54, 152, 160);
      g.fillStyle = apnea ? "#F87171" : "#5EEAD4"; g.font = "12px IBM Plex Mono, monospace";
      g.fillText(apnea ? "SIN RESPIRACIÓN" : "LACTANTE · SUPINO", 88, 50);
    }

    function tick() {
      phase += 0.09;
      drawDepth();
    }
    function second() {
      const s = Math.floor((Date.now() - start) / 1000);
      $("[data-time]").textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
      if (!apnea) {
        const fr = +(34 + Math.sin(Date.now() / 9000) * 1.4 + (Math.random() - 0.5) * 0.8).toFixed(1);
        $("[data-fr]").textContent = fr.toFixed(1);
        $("[data-mm]").textContent = (3.6 + Math.random() * 1.2).toFixed(1) + " mm";
        if (s % 5 === 0) { history.push(fr); history.shift(); }
      } else {
        $("[data-fr]").textContent = "0.0"; $("[data-mm]").textContent = "0.0 mm";
      }
      $("[data-fr]").style.color = apnea ? "#F87171" : "";
    }

    $("[data-sim]").addEventListener("click", () => {
      if (apnea) return;
      apnea = true;
      alerts.push({ t: now(), msg: "ALERTA: apnea — Sin respiración confirmada por 15.0 s", cls: "a", on: true });
      $(".alert-banner").classList.add("show");
      beep(audio); buzz = setInterval(() => beep(audio), 600);
      renderAlerts(); second();
      $("[data-resolve]").focus();
    });
    $("[data-resolve]").addEventListener("click", () => {
      apnea = false; clearInterval(buzz);
      alerts.forEach((a) => (a.on = false));
      alerts.push({ t: now(), msg: "Resuelto — evento registrado con su resolución", cls: "r" });
      $(".alert-banner").classList.remove("show");
      renderAlerts(); second();
      if (typeof toast === "function") toast("Alerta atendida y registrada en el historial");
    });

    renderAlerts(); second(); drawDepth();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) setInterval(tick, 50);
    setInterval(second, 1000);
  }

  let count = 0;
  window.NSPanelInit = (root) => init(root, count++);
  document.addEventListener("DOMContentLoaded", () => document.querySelectorAll("[data-panel]").forEach((r) => window.NSPanelInit(r)));
})();
