/* Flujo de pedido simulado: carrito → envío → pago (solo validación de formato) → confirmación.
   No se envían ni se guardan datos de tarjeta. */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const ESTADOS = ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"];
  $("#estado").insertAdjacentHTML("beforeend", ESTADOS.map((e) => `<option>${e}</option>`).join(""));

  let shipping = {};

  function go(n) {
    document.querySelectorAll("[data-step]").forEach((el) => (el.hidden = +el.dataset.step !== n));
    document.querySelectorAll(".stepper span").forEach((s) => { const k = +s.dataset.s; s.className = k === n ? "on" : k < n ? "done" : ""; });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function summary() {
    const q = cart.qty();
    const sub = q * NS.PRICE;
    $("#q").textContent = q; $("#s-q").textContent = q;
    $("#s-sub").textContent = money(sub);
    $("#s-ship").textContent = NS.SHIPPING ? money(NS.SHIPPING) : "Gratis";
    $("#s-tot").textContent = money(sub + (q ? NS.SHIPPING : 0));
    $("#empty").hidden = q > 0; $("#line").style.display = q ? "flex" : "none"; $("#to2").hidden = !q;
  }
  $("#minus").onclick = () => { cart.set(Math.max(1, cart.qty() - 1)); summary(); };
  $("#plus").onclick = () => { cart.set(cart.qty() + 1); summary(); };
  $("#remove").onclick = () => { cart.set(0); summary(); };
  $("#to2").onclick = () => go(2);
  document.querySelectorAll("[data-back]").forEach((b) => (b.onclick = () => go(+b.dataset.back)));

  function check(input, ok, msg) {
    const err = input.parentElement.querySelector(".err");
    err.textContent = ok ? "" : msg; input.setAttribute("aria-invalid", !ok);
    return ok;
  }

  $("#ship").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target; let ok = true;
    [...f.elements].filter((x) => x.name).forEach((x) => {
      const msgs = { correo: "Correo no válido.", telefono: "Teléfono de 10 dígitos.", cp: "Código postal de 5 dígitos." };
      ok = check(x, x.checkValidity() && x.value.trim() !== "", msgs[x.name] || "Campo obligatorio.") && ok;
    });
    if (!ok) { f.querySelector('[aria-invalid="true"]')?.focus(); return; }
    shipping = Object.fromEntries(new FormData(f));
    go(3);
  });

  // Formato de tarjeta
  const luhn = (n) => { let s = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return s % 10 === 0; };
  const brand = (n) => /^4/.test(n) ? "VISA" : /^(5[1-5]|2[2-7])/.test(n) ? "MASTERCARD" : /^3[47]/.test(n) ? "AMEX" : "TARJETA";
  $("#cnum").addEventListener("input", (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = d.replace(/(.{4})/g, "$1 ").trim();
    $("#cv-num").textContent = (d + "•".repeat(16 - d.length)).replace(/(.{4})/g, "$1 ").trim();
    $("#brand").textContent = brand(d);
  });
  $("#cname").addEventListener("input", (e) => ($("#cv-name").textContent = e.target.value.toUpperCase() || "NOMBRE DEL TITULAR"));
  $("#cexp").addEventListener("input", (e) => {
    let d = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (d.length > 2) d = d.slice(0, 2) + "/" + d.slice(2);
    e.target.value = d; $("#cv-exp").textContent = d || "MM/AA";
  });
  $("#ccvv").addEventListener("input", (e) => (e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4)));

  $("#pay").addEventListener("submit", (e) => {
    e.preventDefault();
    const num = $("#cnum").value.replace(/\s/g, "");
    const [mm, yy] = $("#cexp").value.split("/").map(Number);
    const now = new Date(); const cy = now.getFullYear() % 100, cm = now.getMonth() + 1;
    let ok = check($("#cnum"), num.length >= 15 && luhn(num), "Número de tarjeta no válido (formato).");
    ok = check($("#cname"), $("#cname").value.trim().length > 3, "Nombre del titular obligatorio.") && ok;
    ok = check($("#cexp"), mm >= 1 && mm <= 12 && (yy > cy || (yy === cy && mm >= cm)), "Fecha no válida o vencida.") && ok;
    ok = check($("#ccvv"), /^\d{3,4}$/.test($("#ccvv").value), "CVV de 3 o 4 dígitos.") && ok;
    if (!ok) return;

    // Folio ficticio consecutivo por navegador
    const n = store.get("orderSeq", 0) + 1; store.set("orderSeq", n);
    const folio = "NS-" + String(n).padStart(4, "0");
    const q = cart.qty();
    const order = { folio, q, total: q * NS.PRICE + NS.SHIPPING, fecha: new Date().toLocaleString("es-MX"), ciudad: shipping.ciudad, estado: shipping.estado, tarjeta: brand(num) + " •••• " + num.slice(-4) };
    store.set("lastOrder", order);
    // Se borran los datos de tarjeta del formulario
    e.target.reset();
    $("#folio").textContent = folio;
    cart.set(0); summary();
    $("#s-q").textContent = q; $("#s-sub").textContent = money(q * NS.PRICE); $("#s-tot").textContent = money(order.total);
    go(4);
    // Notificación opcional al equipo (sin datos bancarios)
    sendForm(`NeoSleep · Pedido simulado ${folio}`, { folio, cantidad: q, total: money(order.total), nombre: shipping.nombre, correo: shipping.correo, ciudad: shipping.ciudad, estado: shipping.estado, nota: "Pedido simulado del concurso InnovaTecNM. Sin cargo." });
  });

  summary();
  go(1);
});
