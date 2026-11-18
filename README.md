# NeoSleep — Sitio web (InnovaTecNM 2026, etapa nacional)

Sitio estático (HTML, CSS y JS, sin compilación) publicado con GitHub Pages.

- **En línea:** https://banarysource.github.io/neosleep/
- **Publicar cambios:** hacer `git push` a `main`; GitHub Pages actualiza el sitio en 1 o 2 minutos.

## Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| Correo, precio, PIN de demostración, WhatsApp, enlaces de video, URL del sitio (QR) | `js/main.js` → objeto `NS` |
| Menú y pie de página (compartidos) | `js/main.js` → `renderChrome()` |
| Textos de la página principal | `index.html` |
| Tienda / pedido simulado | `tienda.html`, `carrito.html`, `js/checkout.js` |
| Soporte y preguntas frecuentes | `soporte.html` |
| Materiales descargables (PDF) | copiar el PDF a `docs/` y poner la ruta en `materiales.html` → `MATERIALES` |
| Panel de demostración | `js/panel.js` |
| Colores y tipografía | `css/styles.css` (variables en `:root`) |

## Formularios
Los formularios de soporte, demostración institucional y acceso al monitor se envían a `neosleep.mx@gmail.com` con FormSubmit.co.
**La primera vez** que alguien envíe un formulario, FormSubmit manda un correo de activación a esa cuenta: hay que abrirlo y confirmar. Si el servicio falla, el sitio abre el cliente de correo (mailto).

## Privacidad
- No se publican fotos del lactante real ni los correos de los asesores.
- La tienda es una simulación: no se envían ni guardan datos de tarjeta.
- No publicar la memoria técnica ni el plan de negocios sin quitar la foto de la bebé, los correos y el desglose de costos.
