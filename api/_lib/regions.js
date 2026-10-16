// Zonas editables de index.html. Cada zona está delimitada en el HTML por
//   <!--editable:nombre--> … <!--/editable:nombre-->
// y el editor envía el contenido nuevo de cada zona. Todo lo que queda fuera
// de las zonas (estilos, script, cabecera, enlace «Acceso») no se puede tocar
// desde el editor.
'use strict';

const REGIONS = ['nav', 'main', 'footer'];
const MAX_REGION = 600 * 1024;

function markers(name) {
  return { open: '<!--editable:' + name + '-->', close: '<!--/editable:' + name + '-->' };
}

// El contenido lo escribe el editor autenticado, pero se limpia igualmente
// para que una sesión robada no pueda inyectar código en el sitio.
function sanitize(html) {
  return String(html)
    .replace(/<!--\/?editable:[a-z]+-->/gi, '')
    .replace(/<(script|iframe|object|embed|style|form)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?(script|iframe|object|embed|style|link|meta|base|form)\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(href|src|data-src|data-file|action|formaction)\s*=\s*("|')\s*(javascript|vbscript|data):[^"']*\2/gi, ' $1="#"')
    .replace(/\scontenteditable(="[^"]*")?/gi, '');
}

function replaceRegions(source, regions) {
  let out = source;
  for (const name of REGIONS) {
    if (!(name in regions)) continue;
    const html = regions[name];
    if (typeof html !== 'string' || html.length > MAX_REGION) throw new Error('region:' + name);
    const { open, close } = markers(name);
    const a = out.indexOf(open), b = out.indexOf(close);
    if (a < 0 || b < a) throw new Error('markers:' + name);
    out = out.slice(0, a + open.length) + '\n' + sanitize(html).trim() + '\n' + out.slice(b);
  }
  return out;
}

// Lee las zonas de una versión de index.html (para restaurar versiones antiguas
// sin deshacer los cambios de código hechos después).
function extractRegions(source) {
  const out = {};
  for (const name of REGIONS) {
    const { open, close } = markers(name);
    const a = source.indexOf(open), b = source.indexOf(close);
    if (a >= 0 && b > a) out[name] = source.slice(a + open.length, b);
  }
  return out;
}

module.exports = { REGIONS, replaceRegions, extractRegions, sanitize };
