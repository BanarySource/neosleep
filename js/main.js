/* NeoSleep — utilidades comunes: encabezado, pie, carrito, pestañas, glosario, QR, formularios */
const NS = {
  // Cambiar aquí si el sitio se mueve a otro dominio (el QR se regenera solo).
  SITE_URL: "https://banarysource.github.io/neosleep/",
  EMAIL: "neosleep.mx@gmail.com",
  PRICE: 3194.75,
  SHIPPING: 0, // envío simulado gratis
  WHATSAPP: "", // pendiente: número con lada, p. ej. "524431234567"
  VIDEO_PROTOTIPO: "", // pendiente: enlace de Google Drive
  VIDEO_PITCH: "",     // pendiente: enlace de Google Drive
  DEMO_PIN: "NEO2026",
};

const money = (n) => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MXN";

const store = {
  get(k, d) { try { const v = localStorage.getItem("ns_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("ns_" + k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
  del(k) { try { localStorage.removeItem("ns_" + k); } catch {} },
};

const cart = {
  qty() { return store.get("cart", 0); },
  set(n) { store.set("cart", Math.max(0, Math.min(10, n))); updateCartBadge(); },
  add(n = 1) { this.set(this.qty() + n); },
};

function updateCartBadge() {
  document.querySelectorAll(".cart-count").forEach((el) => { const n = cart.qty(); el.textContent = n; el.dataset.n = n; });
}

function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

/* Encabezado y pie compartidos: se editan en un solo lugar */
function renderChrome() {
  const home = document.body.dataset.page === "home" ? "" : "index.html";
  const header = document.querySelector("[data-header]");
  if (header) header.outerHTML = `
  <header class="site-header">
    <nav class="wrap nav" aria-label="Principal">
      <a class="brand" href="index.html"><img src="img/logo.jpg" alt="" width="40" height="40">NeoSleep</a>
      <ul class="nav-links" id="navlinks">
        <li><a href="${home}#inicio">Inicio</a></li>
        <li><a href="${home}#producto">Producto</a></li>
        <li><a href="${home}#como-funciona">Cómo funciona</a></li>
        <li><a href="${home}#validacion">Validación</a></li>
        <li><a href="${home}#precio">Precio</a></li>
        <li><a href="materiales.html">Materiales</a></li>
        <li><a href="soporte.html">Soporte</a></li>
        <li><a href="${home}#equipo">Equipo</a></li>
      </ul>
      <div class="nav-cta">
        <a class="cart-link" href="carrito.html" aria-label="Pedido">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>
          <span class="cart-count" data-n="0">0</span>
        </a>
        <a class="btn btn-secondary btn-sm desk" href="tienda.html">Pedir ahora</a>
        <a class="btn btn-primary btn-sm" href="mi-neosleep.html">Mi NeoSleep</a>
        <button class="menu-btn" aria-label="Abrir menú" aria-expanded="false" aria-controls="navlinks">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div>
    </nav>
  </header>`;

  const footer = document.querySelector("[data-footer]");
  if (footer) footer.outerHTML = `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="brand" href="index.html"><img src="img/logo.jpg" alt="" width="40" height="40">NeoSleep</a>
          <p class="muted small" style="margin-top:12px">Innovación en cada respiro. Sistema de monitoreo respiratorio neonatal no invasivo.<br>InnovaTecNM 2026 · Etapa nacional · Folio 71855-17</p>
          <p class="small"><a href="mailto:${NS.EMAIL}">${NS.EMAIL}</a></p>
        </div>
        <div>
          <strong class="small">Sitio</strong>
          <ul class="small" style="margin-top:10px">
            <li><a href="tienda.html">Tienda</a></li>
            <li><a href="mi-neosleep.html">Mi NeoSleep (demostración)</a></li>
            <li><a href="soporte.html">Soporte técnico</a></li>
            <li><a href="materiales.html">Materiales</a></li>
          </ul>
        </div>
        <div>
          <strong class="small">Videos</strong>
          <ul class="small" style="margin-top:10px">
            <li>${videoLink(NS.VIDEO_PROTOTIPO, "Prototipo en funcionamiento")}</li>
            <li>${videoLink(NS.VIDEO_PITCH, "Pitch del proyecto")}</li>
          </ul>
        </div>
        <div>
          <div class="qr-box" data-qr="${NS.SITE_URL}" aria-label="Código QR del sitio"></div>
          <p class="small muted" style="margin:8px 0 0">Abrir en dispositivo móvil</p>
        </div>
      </div>
      <div class="legal">
        Aviso de simulación: la tienda y el pago de este sitio son una demostración para el concurso InnovaTecNM 2026; no se realizan cargos ni se almacenan datos bancarios.
        NeoSleep es una herramienta de monitoreo complementario; no sustituye la supervisión de un adulto ni la valoración clínica. Prototipo en TRL 5, sin certificación sanitaria.
        © 2026 Equipo NeoSleep · Instituto Tecnológico Superior de Ciudad Hidalgo.
      </div>
    </div>
  </footer>`;

  const btn = document.querySelector(".menu-btn");
  const links = document.getElementById("navlinks");
  btn?.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  links?.addEventListener("click", (e) => { if (e.target.tagName === "A") { links.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
  updateCartBadge();
}

function videoLink(url, label) {
  return url ? `<a href="${url}" target="_blank" rel="noopener">${label}</a>` : `<span class="muted">${label} (enlace pendiente)</span>`;
}

/* Pestañas accesibles: [data-tabs] con .tab[aria-controls] */
function initTabs(root = document) {
  root.querySelectorAll("[data-tabs]").forEach((group) => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    tabs.forEach((tab) => tab.addEventListener("click", () => {
      tabs.forEach((t) => { const sel = t === tab; t.setAttribute("aria-selected", sel); document.getElementById(t.getAttribute("aria-controls")).hidden = !sel; });
    }));
  });
}

/* Glosario: <abbr class="g" data-g="apnea">apnea</abbr> */
const GLOSARIO = {
  apnea: "Pausa respiratoria. En NeoSleep se reporta cuando no se confirma respiración durante el intervalo de verificación configurado.",
  trl: "Technology Readiness Level: escala de 1 a 9 de madurez tecnológica. TRL 5 = prototipo validado en un entorno relevante.",
  profundidad: "Mapa de profundidad: imagen en la que cada píxel representa la distancia del sensor a la escena, en milímetros.",
  cnn: "Red neuronal convolucional: modelo de aprendizaje profundo para clasificación de imágenes; aquí, la posición del lactante.",
  fr: "Frecuencia respiratoria: número de ciclos respiratorios por minuto (resp/min).",
};
function initGlossary() {
  let tip;
  const hide = () => { tip?.remove(); tip = null; };
  document.querySelectorAll("abbr.g").forEach((el) => {
    el.tabIndex = 0;
    el.removeAttribute("title");
    const show = () => {
      hide();
      tip = document.createElement("div"); tip.className = "gtip"; tip.setAttribute("role", "tooltip");
      tip.textContent = GLOSARIO[el.dataset.g] || "";
      document.body.appendChild(tip);
      const r = el.getBoundingClientRect();
      const left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - tip.offsetWidth - 8);
      tip.style.left = left + "px"; tip.style.top = (r.bottom + window.scrollY + 8) + "px";
    };
    el.addEventListener("mouseenter", show); el.addEventListener("focus", show);
    el.addEventListener("click", show);
    el.addEventListener("mouseleave", hide); el.addEventListener("blur", hide);
  });
}

/* QR (librería qrcodejs) */
function initQR() {
  if (typeof QRCode === "undefined") return;
  document.querySelectorAll("[data-qr]").forEach((el) => {
    if (el.dataset.done) return;
    el.dataset.done = 1;
    new QRCode(el, { text: el.dataset.qr, width: 512, height: 512, colorDark: "#0F1B33", colorLight: "#FFFFFF", correctLevel: QRCode.CorrectLevel.M });
  });
}

/* Envío de formularios a correo (FormSubmit). Si falla, se ofrece mailto. */
async function sendForm(subject, data) {
  const payload = { _subject: subject, _template: "table", _captcha: "false", ...data };
  try {
    const r = await fetch(`https://formsubmit.co/ajax/${NS.EMAIL}`, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload),
    });
    return r.ok;
  } catch { return false; }
}
function mailtoFallback(subject, data) {
  const body = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
  return `mailto:${NS.EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  initTabs();
  initGlossary();
  initQR();
});
window.addEventListener("load", initQR);
