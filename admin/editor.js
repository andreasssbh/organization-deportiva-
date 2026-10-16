/* ============================================================================
   Editor del sitio — Sport Management · organizaciondeportiva.org
   ----------------------------------------------------------------------------
   Lo carga index.html solo cuando hace falta (cookie sm_editor o #acceso).
   · Acceso con contraseña (/api/login). La contraseña es la variable
     ADMIN_PASSWORD del proyecto en Vercel.
   · Modo edición: los textos de las zonas editables (menú, contenido, pie)
     se escriben directamente sobre la página. Una barra flotante permite
     mover, duplicar o eliminar el elemento seleccionado, poner negrita,
     cursiva y enlaces, y cambiar fotos o subir los PDF de los apuntes.
   · «Guardar» envía las zonas a /api/save, que crea un commit en GitHub;
     Vercel publica la nueva versión en uno o dos minutos.
   Ver docs/EDITOR.md.
   ============================================================================ */
(function () {
  'use strict';
  if (window.SM_EDITOR) return;

  var root = document.documentElement;
  function L() { return root.getAttribute('data-lang') === 'en' ? 'en' : 'es'; }

  var TXT = {
    loginTitle: { es: 'Acceso del editor', en: 'Editor login' },
    loginHelp: { es: 'Introduce la contraseña para editar el sitio.', en: 'Enter the password to edit the site.' },
    password: { es: 'Contraseña', en: 'Password' },
    enter: { es: 'Entrar', en: 'Log in' },
    cancel: { es: 'Cancelar', en: 'Cancel' },
    wrongPw: { es: 'Contraseña incorrecta.', en: 'Wrong password.' },
    notConfigured: { es: 'El acceso aún no está configurado (falta ADMIN_PASSWORD en Vercel).', en: 'Login is not configured yet (ADMIN_PASSWORD is missing in Vercel).' },
    netError: { es: 'No se pudo conectar. Inténtalo de nuevo.', en: 'Could not connect. Please try again.' },
    editing: { es: 'Modo edición', en: 'Editing' },
    viewing: { es: 'Vista previa', en: 'Preview' },
    edit: { es: 'Editar', en: 'Edit' },
    preview: { es: 'Ver', en: 'Preview' },
    save: { es: 'Guardar', en: 'Save' },
    discard: { es: 'Descartar', en: 'Discard' },
    history: { es: 'Historial', en: 'History' },
    help: { es: 'Ayuda', en: 'Help' },
    logout: { es: 'Salir', en: 'Log out' },
    clean: { es: 'Sin cambios', en: 'No changes' },
    dirty: { es: 'Cambios sin guardar', en: 'Unsaved changes' },
    saving: { es: 'Guardando…', en: 'Saving…' },
    uploading: { es: 'Subiendo archivo…', en: 'Uploading file…' },
    saved: { es: 'Guardado ✓ La web pública se actualiza en 1–2 minutos.', en: 'Saved ✓ The public site updates in 1–2 minutes.' },
    publishing: { es: 'Guardado ✓ Publicando en la web… (unos 30–60 s, no recargues todavía)', en: 'Saved ✓ Publishing to the site… (about 30–60 s, do not reload yet)' },
    published: { es: 'Publicado ✓ Los cambios ya están en la web.', en: 'Published ✓ The changes are live.' },
    publishSlow: { es: 'Guardado ✓ La publicación está tardando más de lo normal; los cambios aparecerán en unos minutos.', en: 'Saved ✓ Publishing is taking longer than usual; the changes will appear in a few minutes.' },
    staleDone: { es: 'La versión nueva ya está publicada. Recarga la página para verla y seguir editando.', en: 'The new version is now live. Reload the page to see it and keep editing.' },
    leaveWhilePublishing: { es: 'Los cambios se están publicando. Si recargas ahora verás la versión anterior unos segundos.', en: 'Changes are being published. If you reload now you will see the previous version for a few seconds.' },
    saveError: { es: 'No se pudo guardar: ', en: 'Could not save: ' },
    expired: { es: 'La sesión ha caducado. Vuelve a entrar y pulsa «Guardar» otra vez: tus cambios siguen en la página.', en: 'Your session expired. Log in again and press "Save" again: your changes are still on the page.' },
    stale: { es: 'Hay una versión más reciente de la página publicándose. Espera un minuto y recarga antes de editar (si guardas ahora podrías borrar esos cambios).', en: 'A newer version of the page is being published. Wait a minute and reload before editing (saving now could overwrite those changes).' },
    staleSave: { es: 'La página ha cambiado desde que la abriste. Copia tus textos nuevos, recarga la página y vuelve a aplicarlos.', en: 'The page changed since you opened it. Copy your new text, reload the page and apply it again.' },
    reload: { es: 'Recargar', en: 'Reload' },
    langHint: { es: 'Editas la versión en español. Cambia a EN arriba para editar el inglés.', en: 'You are editing the English version. Switch to ES at the top to edit the Spanish one.' },
    confirmDiscard: { es: '¿Descartar todos los cambios sin guardar?', en: 'Discard all unsaved changes?' },
    confirmDelete: { es: '¿Eliminar este bloque completo?', en: 'Delete this whole block?' },
    linkPrompt: { es: 'Dirección del enlace (https://…, mailto:… o #seccion). Déjala vacía para quitar el enlace.', en: 'Link address (https://…, mailto:… or #section). Leave empty to remove the link.' },
    linkPromptBtn: { es: 'Dirección del botón (https://…, mailto:… o #seccion):', en: 'Button address (https://…, mailto:… or #section):' },
    selectText: { es: 'Selecciona primero el texto que quieres convertir en enlace.', en: 'First select the text you want to turn into a link.' },
    changePhoto: { es: 'Cambiar foto', en: 'Change photo' },
    removePhoto: { es: 'Quitar', en: 'Remove' },
    noPhoto: { es: 'Sin foto (oculta en la web) — pulsa «Cambiar foto»', en: 'No photo (hidden on the site) — press "Change photo"' },
    uploadPdf: { es: 'Subir PDF', en: 'Upload PDF' },
    badImage: { es: 'No se pudo leer la imagen. Usa un archivo JPG o PNG.', en: 'Could not read the image. Please use a JPG or PNG file.' },
    tooLarge: { es: 'El archivo es demasiado grande (máximo 3 MB). Comprime el PDF e inténtalo de nuevo.', en: 'The file is too large (max 3 MB). Compress the PDF and try again.' },
    uploadError: { es: 'No se pudo subir el archivo: ', en: 'Could not upload the file: ' },
    pdfReady: { es: 'PDF listo: se publicará al guardar.', en: 'PDF ready: it will be published when you save.' },
    historyTitle: { es: 'Versiones guardadas', en: 'Saved versions' },
    restore: { es: 'Restaurar', en: 'Restore' },
    confirmRestore: { es: '¿Volver a poner el contenido de esta versión? (La versión actual seguirá en el historial.)', en: 'Restore the content of this version? (The current version stays in the history.)' },
    restored: { es: 'Versión restaurada ✓ Se publica en 1–2 minutos; luego recarga la página.', en: 'Version restored ✓ It is published in 1–2 minutes; then reload the page.' },
    close: { es: 'Cerrar', en: 'Close' },
    tBold: { es: 'Negrita', en: 'Bold' },
    tItalic: { es: 'Cursiva', en: 'Italic' },
    tLink: { es: 'Enlace', en: 'Link' },
    tUp: { es: 'Subir', en: 'Move up' },
    tDown: { es: 'Bajar', en: 'Move down' },
    tDup: { es: 'Duplicar (añadir otro igual debajo)', en: 'Duplicate (add another one below)' },
    tDel: { es: 'Eliminar', en: 'Delete' },
    tParent: { es: 'Seleccionar el bloque que lo contiene', en: 'Select the enclosing block' },
    tCut: { es: 'Cortar (para moverlo a otro sitio)', en: 'Cut (to move it somewhere else)' },
    tUnderline: { es: 'Subrayado', en: 'Underline' },
    tSmaller: { es: 'Letra más pequeña', en: 'Smaller text' },
    tBigger: { es: 'Letra más grande', en: 'Bigger text' },
    tColor: { es: 'Color del texto', en: 'Text colour' },
    tAlignLeft: { es: 'Alinear a la izquierda', en: 'Align left' },
    tAlignCenter: { es: 'Centrar', en: 'Centre' },
    tAlignRight: { es: 'Alinear a la derecha', en: 'Align right' },
    tUl: { es: 'Lista con puntos (en un cuadro de texto)', en: 'Bulleted list (in a text box)' },
    tOl: { es: 'Lista numerada (en un cuadro de texto)', en: 'Numbered list (in a text box)' },
    tClear: { es: 'Quitar formato', en: 'Clear formatting' },
    tDrag: { es: 'Arrastrar: mantén pulsado y suelta donde quieras ponerlo', en: 'Drag: hold and drop where you want it' },
    dragHint: { es: 'Para arrastrar, mantén pulsado ⠿ y mueve el ratón hasta donde quieras ponerlo.', en: 'To drag, hold ⠿ and move the mouse to where you want it.' },
    dragMoving: { es: 'Moviendo…', en: 'Moving…' },
    colorNormal: { es: 'Normal', en: 'Normal' },
    colorRed: { es: 'Rojo', en: 'Red' },
    colorGrey: { es: 'Gris', en: 'Grey' },
    selectTextFormat: { es: 'Haz clic primero en un texto (o selecciona unas palabras) para darle formato.', en: 'First click a text (or select some words) to format it.' },
    listOnlyTextbox: { es: 'Las listas se hacen dentro de un «Cuadro de texto» (o con el elemento «Lista»).', en: 'Lists go inside a "Text box" (or use the "List" item).' },
    paletteTitle: { es: 'Añadir', en: 'Add' },
    paletteHint: { es: 'Arrastra a la página o haz clic para añadir junto a lo seleccionado.', en: 'Drag onto the page, or click to add next to the selection.' },
    paletteOpen: { es: 'Mostrar el panel', en: 'Show the panel' },
    paletteClose: { es: 'Ocultar el panel', en: 'Hide the panel' },
    addHere: { es: '＋ Añadir en esta sección', en: '＋ Add to this section' },
    addSectionHere: { es: '＋ Sección nueva aquí', en: '＋ New section here' },
    addWhereSection: { es: 'Se añadirá al final de esta sección:', en: 'It will be added at the end of this section:' },
    add_textbox: { es: 'Cuadro de texto', en: 'Text box' }, addHint_textbox: { es: 'Un recuadro libre para escribir lo que quieras (varios párrafos, listas…)', en: 'A free box to write anything (several paragraphs, lists…)' },
    tPaste: { es: 'Pegar lo cortado debajo de lo seleccionado', en: 'Paste what you cut below the selection' },
    tAdd: { es: 'Añadir algo nuevo aquí', en: 'Add something new here' },
    cutDone: { es: 'Cortado. Selecciona dónde quieres ponerlo y pulsa 📋 Pegar.', en: 'Cut. Select where you want it and press 📋 Paste.' },
    clipLost: { es: 'Hay un elemento cortado que aún no has pegado: si guardas ahora se eliminará. ¿Guardar igualmente?', en: 'There is a cut item you have not pasted yet: saving now will delete it. Save anyway?' },
    addBtn: { es: '＋ Añadir', en: '＋ Add' },
    addWhereSel: { es: 'Se añadirá junto a lo seleccionado:', en: 'It will be added next to the selection:' },
    addWhereEnd: { es: 'Se añadirá al final de la página (selecciona algo antes para elegir el sitio):', en: 'It will be added at the end of the page (select something first to choose the place):' },
    add_text: { es: 'Texto', en: 'Text' }, addHint_text: { es: 'Un párrafo nuevo', en: 'A new paragraph' },
    add_heading: { es: 'Subtítulo', en: 'Subheading' }, addHint_heading: { es: 'Un título pequeño dentro de la sección', en: 'A small heading inside the section' },
    add_list: { es: 'Lista', en: 'List' }, addHint_list: { es: 'Puntos (⧉ para añadir más)', en: 'Bullet points (⧉ to add more)' },
    add_photo: { es: 'Foto', en: 'Photo' }, addHint_photo: { es: 'Una imagen con su pie de foto', en: 'An image with a caption' },
    add_button: { es: 'Botón / enlace', en: 'Button / link' }, addHint_button: { es: 'Un botón que lleva a una web, un correo, una sección o un PDF', en: 'A button to a website, an email, a section or a PDF' },
    add_card: { es: 'Bloque', en: 'Block' }, addHint_card: { es: 'Un recuadro con título y texto (un apartado dentro de la sección)', en: 'A box with a title and text (a part inside the section)' },
    add_section: { es: 'Sección nueva', en: 'New section' }, addHint_section: { es: 'Una sección completa, con su enlace en el menú', en: 'A whole section, with its link in the menu' },
    linkNew: { es: 'Nuevo enlace', en: 'New link' },
    linkNewButton: { es: 'Nuevo botón', en: 'New button' },
    linkEdit: { es: 'Editar enlace', en: 'Edit link' },
    linkText: { es: 'Texto que se ve', en: 'Text shown' },
    linkTo: { es: 'Adónde lleva', en: 'Where it goes' },
    kind_web: { es: 'Una página web', en: 'A website' },
    kind_email: { es: 'Un correo', en: 'An email' },
    kind_section: { es: 'Una sección de esta página', en: 'A section of this page' },
    kind_pdf: { es: 'Un PDF', en: 'A PDF' },
    webAddr: { es: 'Dirección de la web (por ejemplo www.csd.gob.es)', en: 'Website address (for example www.csd.gob.es)' },
    emailAddr: { es: 'Correo electrónico', en: 'Email address' },
    sectionPick: { es: 'Sección', en: 'Section' },
    pdfPick: { es: 'Archivo PDF (máx. 3 MB)', en: 'PDF file (max 3 MB)' },
    pdfCurrent: { es: 'Archivo actual:', en: 'Current file:' },
    removeLink: { es: 'Quitar enlace', en: 'Remove link' },
    accept: { es: 'Aceptar', en: 'OK' },
    needText: { es: 'Escribe el texto que se verá.', en: 'Type the text to show.' },
    needDest: { es: 'Indica adónde lleva el enlace.', en: 'Say where the link goes.' },
    needPdf: { es: 'Elige un archivo PDF.', en: 'Choose a PDF file.' },
    badEmail: { es: 'Ese correo no parece válido.', en: 'That email does not look valid.' },
    helpHtml: {
      es: '<h3>Cómo editar</h3><ul>' +
        '<li><strong>Textos</strong>: haz clic en cualquier texto y escribe. Con la barra pequeña: <strong>B</strong> negrita, <em>I</em> cursiva, <u>U</u> subrayado, A− / A+ tamaño, color, alineación, listas (en un cuadro de texto), 🔗 enlace (eliges el texto y adónde lleva: una web, un correo, una sección o un PDF) y T× para quitar el formato. Si seleccionas palabras se aplica a ellas; si no, al párrafo entero.</li>' +
        '<li><strong>Mover</strong>: mantén pulsado ⠿ y arrastra hasta donde quieras (una línea azul indica dónde quedará). También ↑ ↓, o ✂ cortar y 📋 pegar. Haz clic en el título de una sección para seleccionarla entera; con ⤴ seleccionas lo que contiene al elemento.</li>' +
        '<li><strong>Añadir</strong>: el panel «Añadir» de la izquierda (arrastra un elemento a la página o haz clic), los botones «＋ Añadir en esta sección» y «＋ Sección nueva aquí» de la página, o ＋ en la barra pequeña. Hay texto, cuadro de texto, subtítulo, lista, foto, botón, bloque y sección. Una sección nueva aparece también en el menú.</li>' +
        '<li><strong>Fotos</strong>: «Cambiar foto» en cada foto. Las fotos sin imagen no se ven en la web.</li>' +
        '<li><strong>Apuntes</strong>: «Subir PDF» junto a cada tema (máx. 3 MB).</li>' +
        '<li><strong>Idiomas</strong>: cada texto existe en español y en inglés y se cambia en cada idioma por separado: cambia a EN arriba para editar la versión inglesa. Las fotos, el orden y los bloques y secciones nuevos o borrados son comunes a los dos idiomas.</li>' +
        '<li>Pulsa <strong>Guardar</strong> al terminar. La web pública se actualiza en 1–2 minutos. Si algo sale mal, en <strong>Historial</strong> puedes volver a una versión anterior.</li></ul>',
      en: '<h3>How to edit</h3><ul>' +
        '<li><strong>Text</strong>: click any text and type. With the small bar: <strong>B</strong> bold, <em>I</em> italic, <u>U</u> underline, A− / A+ size, colour, alignment, lists (in a text box), 🔗 link (you choose the text and where it goes: a website, an email, a section or a PDF) and T× to clear formatting. With words selected it applies to them; otherwise to the whole paragraph.</li>' +
        '<li><strong>Move</strong>: hold ⠿ and drag to where you want it (a blue line shows where it will go). Also ↑ ↓, or ✂ cut and 📋 paste. Click a section title to select the whole section; ⤴ selects what contains the item.</li>' +
        '<li><strong>Add</strong>: the "Add" panel on the left (drag an item onto the page or click it), the "＋ Add to this section" and "＋ New section here" buttons on the page, or ＋ in the small bar. There is text, text box, subheading, list, photo, button, block and section. A new section also appears in the menu.</li>' +
        '<li><strong>Photos</strong>: "Change photo" on each photo. Photos without an image are hidden on the site.</li>' +
        '<li><strong>Lecture notes</strong>: "Upload PDF" next to each topic (max 3 MB).</li>' +
        '<li><strong>Languages</strong>: every text exists in Spanish and English and is changed in each language separately: switch to ES at the top to edit the Spanish version. Photos, order, and added or deleted blocks and sections are shared by both languages.</li>' +
        '<li>Press <strong>Save</strong> when you are done. The public site updates in 1–2 minutes. If something goes wrong, <strong>History</strong> lets you go back to an earlier version.</li></ul>'
    }
  };
  function t(k) { return TXT[k][L()]; }

  // Textos editables y elementos que se pueden mover / duplicar / eliminar.
  var TEXT_SEL = '.textbox > .es, .textbox > .en, h1, h2, h3, h4, p, li:not(.theme), figcaption, summary, .btn, .eyebrow, .tag, .stat > strong, .stat > span, .notes-book > strong, .notes-book > span, .schedule > span, nav[data-region] > a, footer nav > a, [data-region="footer"] > div > div';
  var ITEM_SEL = '.textbox, li:not(.textbox li), p:not(.textbox p), h3:not(.textbox h3), h4:not(.textbox h4), figure.photo, article, details, .stat, .notes-book, .schedule, .person, .cta-row > .btn, .actions > a, nav[data-region] > a, footer nav > a';
  var CONTAINER_SEL = 'article, details, section.block, .theme, figure.photo, .person, .textbox, ul:not(.textbox ul), ol:not(.textbox ol), .grid, .gallery, .cta-row';
  var MAX_FILE = 3.3 * 1024 * 1024;

  var state = {
    authed: false, editing: false, dirty: false, busy: false, stale: false, publishing: null, staleDone: false,
    deployed: null, current: null, pending: {}, ui: {},
    clip: null
  };

  /* ---------------- utilidades ---------------- */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function api(path, body) {
    var opts = { method: body ? 'POST' : 'GET', credentials: 'same-origin', headers: {} };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch('/api/' + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var e = new Error(j.detail || j.error || ('HTTP ' + r.status)); e.status = r.status; e.body = j; throw e; }
        return j;
      });
    });
  }
  function regions() { return Array.prototype.slice.call(document.querySelectorAll('[data-region]')); }
  function inRegion(n) { return n && n.closest && n.closest('[data-region]'); }
  function isUI(n) { return n && n.closest && n.closest('.sm-ui, .sm-chrome'); }
  function slug(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'archivo';
  }
  function clearHash() {
    if (location.hash === '#acceso') history.replaceState(null, '', location.pathname + location.search);
  }

  /* ---------------- estilos del editor ---------------- */
  function injectCSS() {
    var css = '' +
      '.sm-chrome, .sm-chrome *, .sm-ui, .sm-ui * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }' +
      '.sm-chrome [hidden], .sm-ui[hidden], .sm-ui [hidden] { display: none !important; }' +
      'html.sm-admin body { padding-bottom: 96px; }' +
      'html.sm-admin .to-top { bottom: 96px; }' +
      'html.sm-editing [data-region] [contenteditable="true"] { cursor: text; border-radius: 4px; }' +
      'html.sm-editing [data-region] [contenteditable="true"]:hover { outline: 1px dashed rgba(37,99,235,.55); outline-offset: 2px; }' +
      'html.sm-editing [data-region] [contenteditable="true"]:focus { outline: 2px solid #2563eb; outline-offset: 2px; }' +
      'html.sm-editing .sm-selected { outline: 2px dashed #2563eb !important; outline-offset: 5px; }' +
      'html.sm-editing .photo.no-img { display: block; border: 2px dashed var(--line); }' +
      'html.sm-editing .photo.no-img::before { content: attr(data-sm-empty); position: absolute; inset: 0; display: grid; place-items: center; padding: 16px; text-align: center; color: var(--text-muted); font-size: .9rem; }' +
      'html.sm-editing .photo figcaption { opacity: 1; }' +
      'html.sm-editing .hero .container:has(> .photo.no-img) { grid-template-columns: 1.15fr .85fr; }' +
      'html.sm-editing .person:has(> .photo.no-img) { grid-template-columns: 200px 1fr; }' +
      '.sm-photo-tools { position: absolute; top: 8px; right: 8px; display: flex; gap: 6px; z-index: 5; }' +
      '.sm-ui button, .sm-chrome button { font: 600 13px/1 ui-sans-serif, system-ui, sans-serif; border: 1px solid rgba(0,0,0,.15); background: #fff; color: #111; padding: 8px 10px; border-radius: 8px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,.15); }' +
      '.sm-ui button:hover, .sm-chrome button:hover { background: #eef3ff; border-color: #2563eb; }' +
      '.sm-chrome button.sm-primary { background: #2563eb; border-color: #2563eb; color: #fff; }' +
      '.sm-chrome button.sm-primary:hover { background: #1d4ed8; }' +
      '.sm-chrome button:disabled { opacity: .5; cursor: default; }' +
      '.sm-pdf-tool { margin-left: 4px; }' +
      '.sm-bar { position: fixed; left: 50%; bottom: 14px; transform: translateX(-50%); z-index: 1000; width: min(100% - 24px, 980px); background: #111; color: #fff; border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,.35); padding: 10px 12px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 14px; }' +
      '.sm-bar .sm-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; flex: none; }' +
      '.sm-bar.sm-is-dirty .sm-dot { background: #f59e0b; }' +
      '.sm-bar .sm-mode { font-weight: 800; }' +
      '.sm-bar .sm-status { color: #d1d5db; flex: 1 1 200px; min-width: 0; }' +
      '.sm-bar .sm-actions { display: flex; flex-wrap: wrap; gap: 6px; }' +
      '.sm-bar button { background: #262626; color: #fff; border-color: #404040; box-shadow: none; }' +
      '.sm-bar button:hover { background: #333; border-color: #737373; }' +
      '.sm-hint { width: 100%; font-size: 12px; color: #a3a3a3; }' +
      '.sm-warn { width: 100%; background: #7f1d1d; color: #fff; border-radius: 8px; padding: 8px 10px; font-size: 13px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }' +
      '.sm-toolbar { position: absolute; z-index: 999; display: none; gap: 4px; background: #111; padding: 5px; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,.3); }' +
      '.sm-toolbar.sm-show { display: flex; }' +
      '.sm-toolbar button { background: #262626; color: #fff; border: 1px solid #404040; box-shadow: none; min-width: 34px; padding: 7px 8px; font-size: 14px; }' +
      '.sm-toolbar button:hover { background: #2563eb; border-color: #2563eb; }' +
      '.sm-toolbar .sm-sep { width: 1px; background: #404040; margin: 2px 3px; }' +
      '.sm-modal { position: fixed; inset: 0; z-index: 1001; background: rgba(0,0,0,.55); display: grid; place-items: center; padding: 16px; }' +
      '.sm-dialog { background: #fff; color: #111; width: min(100%, 520px); max-height: 85vh; overflow: auto; border-radius: 16px; padding: 24px; box-shadow: 0 24px 60px rgba(0,0,0,.4); }' +
      '.sm-dialog h2, .sm-dialog h3 { color: #111; margin: 0 0 10px; font-size: 1.25rem; }' +
      '.sm-dialog p, .sm-dialog li { color: #333; font-size: 15px; }' +
      '.sm-dialog input[type=password] { width: 100%; font: inherit; font-size: 16px; padding: 12px; border: 1px solid #d4d4d8; border-radius: 10px; margin: 6px 0 4px; color: #111; background: #fff; }' +
      '.sm-dialog .sm-err { color: #b91c1c; min-height: 1.4em; font-size: 14px; margin: 4px 0 10px; }' +
      '.sm-dialog .sm-row { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }' +
      '.sm-dialog .sm-version { display: flex; gap: 10px; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e5e5; padding: 10px 0; font-size: 14px; }' +
      '.sm-dialog .sm-version small { color: #666; display: block; }' +
      '.sm-toolbar button:disabled { opacity: .35; cursor: default; }' +
      '.sm-toolbar button:disabled:hover { background: #262626; border-color: #404040; }' +
      '.sm-add-menu { position: absolute; z-index: 1000; width: min(360px, 100vw - 16px); background: #fff; color: #111; border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,.35); padding: 8px; display: grid; gap: 2px; }' +
      '.sm-add-menu .sm-add-where { font-size: 12px; color: #555; padding: 4px 8px 6px; }' +
      '.sm-add-menu button { text-align: left; display: grid; gap: 2px; border: 0; box-shadow: none; padding: 9px 10px; background: transparent; }' +
      '.sm-add-menu button strong { font-size: 14px; }' +
      '.sm-add-menu button small { font-size: 12px; color: #555; font-weight: 400; }' +
      '.sm-dialog .sm-field { display: grid; gap: 6px; margin: 0 0 14px; border: 0; padding: 0; font-size: 14px; color: #333; }' +
      '.sm-dialog .sm-field[hidden] { display: none; }' +
      '.sm-dialog legend { padding: 0; margin-bottom: 6px; }' +
      '.sm-dialog input[type=text], .sm-dialog input[type=email], .sm-dialog select { width: 100%; font: inherit; font-size: 16px; padding: 10px 12px; border: 1px solid #d4d4d8; border-radius: 10px; color: #111; background: #fff; }' +
      '.sm-dialog .sm-kinds { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }' +
      '.sm-dialog .sm-kinds label { display: flex; gap: 8px; align-items: center; border: 1px solid #e4e4e7; border-radius: 10px; padding: 9px 10px; cursor: pointer; }' +
      '.sm-dialog .sm-kinds label:has(input:checked) { border-color: #2563eb; background: #eef3ff; }' +
      '.sm-dialog .sm-pdf-current { color: #555; }' +
      '.sm-dialog .sm-remove { color: #b91c1c; }' +
      '.sm-dialog button[hidden] { display: none; }' +
      'html.sm-editing .photo.photo-inline.no-img { min-height: 160px; }' +
      '.sm-toolbar { flex-direction: column; gap: 4px; }' +
      '.sm-toolbar .sm-tb-row { display: flex; gap: 4px; align-items: stretch; flex-wrap: wrap; }' +
      '.sm-toolbar button small, .sm-toolbar button sup, .sm-toolbar button sub { font-size: 10px; }' +
      '.sm-swatch { display: inline-block; width: 14px; height: 14px; border-radius: 4px; background: conic-gradient(#d92b23 0 33%, #111 0 66%, #8a8a90 0); border: 1px solid #555; vertical-align: middle; }' +
      '.sm-color-menu { width: 180px; }' +
      '.sm-color-menu button { display: flex; align-items: center; gap: 10px; }' +
      '.sm-color-menu .sm-swatch.sm-sw-normal { background: #111; } .sm-color-menu .sm-swatch.txt-red { background: #d92b23; } .sm-color-menu .sm-swatch.txt-muted { background: #8a8a90; }' +
      '.sm-toolbar [data-t="drag"] { cursor: grab; touch-action: none; }' +
      'html.sm-dragging, html.sm-dragging * { cursor: grabbing !important; user-select: none !important; }' +
      '.sm-ghost { position: fixed; z-index: 1003; pointer-events: none; background: #2563eb; color: #fff; padding: 6px 10px; border-radius: 8px; font: 600 13px/1.2 ui-sans-serif, system-ui, sans-serif; box-shadow: 0 8px 20px rgba(0,0,0,.3); }' +
      '.sm-drop-line { position: fixed; z-index: 1002; pointer-events: none; background: #2563eb; border-radius: 4px; box-shadow: 0 0 0 3px rgba(37,99,235,.25); display: none; }' +
      '.sm-drag-src { opacity: .35; }' +
      '.sm-add-here { margin: 18px 0 0; }' +
      '.sm-add-here button, .sm-add-section button { width: 100%; border: 2px dashed rgba(37,99,235,.55) !important; background: rgba(37,99,235,.06) !important; color: #2563eb !important; box-shadow: none !important; padding: 10px !important; font-weight: 700 !important; }' +
      '.sm-add-here button:hover, .sm-add-section button:hover { background: rgba(37,99,235,.14) !important; }' +
      '.sm-add-section { width: min(100% - 32px, 1180px); margin: 0 auto; padding: 6px 0; }' +
      '.sm-add-section button { padding: 6px !important; font-size: 12px !important; opacity: .7; }' +
      '.sm-add-section button:hover { opacity: 1; }' +
      '.sm-palette { position: fixed; left: 10px; top: 86px; z-index: 998; width: 168px; max-height: calc(100vh - 200px); overflow: auto; background: #111; color: #fff; border-radius: 14px; padding: 10px; box-shadow: 0 12px 32px rgba(0,0,0,.35); }' +
      '.sm-palette.sm-collapsed { width: auto; padding: 6px; }' +
      '.sm-palette.sm-collapsed .sm-pal-hint, .sm-palette.sm-collapsed .sm-pal-tiles, .sm-palette.sm-collapsed .sm-pal-head strong { display: none; }' +
      '.sm-pal-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }' +
      '.sm-pal-head strong { font-size: 15px; }' +
      '.sm-pal-toggle { background: #262626 !important; color: #fff !important; border-color: #404040 !important; padding: 4px 8px !important; box-shadow: none !important; }' +
      '.sm-pal-hint { font-size: 11px; color: #a3a3a3; margin: 6px 0 8px; line-height: 1.35; }' +
      '.sm-pal-tiles { display: grid; gap: 6px; }' +
      '.sm-tile { display: flex !important; align-items: center; gap: 8px; text-align: left; background: #1f1f1f !important; color: #fff !important; border: 1px solid #333 !important; box-shadow: none !important; padding: 9px 10px !important; cursor: grab !important; touch-action: none; }' +
      '.sm-tile:hover { border-color: #2563eb !important; background: #1e293b !important; }' +
      '.sm-tile-ico { width: 20px; text-align: center; font-size: 15px; opacity: .85; }' +
      '@media (min-width: 1100px) { html.sm-pal-open body { padding-left: 186px; } }' +
      '@media (max-width: 1099px) { .sm-palette { display: none; } }' +
      'html.sm-editing .textbox > div:empty::before { content: "…"; color: var(--text-muted); }' +
      '@media (max-width: 640px) { .sm-bar .sm-status { flex-basis: 100%; order: 3; } }';
    document.head.appendChild(el('style', { id: 'smEditorCSS' }, css));
  }

  /* ---------------- ventana de acceso ---------------- */
  function modal(content) {
    var wrap = el('div', { class: 'sm-modal sm-chrome', role: 'dialog', 'aria-modal': 'true' });
    var box = el('div', { class: 'sm-dialog' });
    box.appendChild(content);
    wrap.appendChild(box);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
    function onKey(e) { if (e.key === 'Escape') close(); }
    function close() { wrap.remove(); document.removeEventListener('keydown', onKey); }
    document.addEventListener('keydown', onKey);
    document.body.appendChild(wrap);
    return close;
  }

  function openLogin() {
    clearHash();
    if (state.authed) { if (!state.editing) startEditing(); return; }
    if (document.querySelector('.sm-login')) return;
    var form = el('form', { class: 'sm-login' });
    form.innerHTML = '<h2></h2><p></p><label><span class="sm-l"></span><input type="password" name="password" autocomplete="current-password" required></label><div class="sm-err" aria-live="polite"></div><div class="sm-row"><button type="button" class="sm-cancel"></button><button type="submit" class="sm-primary"></button></div>';
    form.querySelector('h2').textContent = t('loginTitle');
    form.querySelector('p').textContent = t('loginHelp');
    form.querySelector('.sm-l').textContent = t('password');
    form.querySelector('.sm-cancel').textContent = t('cancel');
    form.querySelector('.sm-primary').textContent = t('enter');
    var close = modal(form);
    var input = form.querySelector('input'), err = form.querySelector('.sm-err'), submit = form.querySelector('.sm-primary');
    form.querySelector('.sm-cancel').addEventListener('click', close);
    setTimeout(function () { input.focus(); }, 30);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submit.disabled = true; err.textContent = '';
      api('login', { password: input.value }).then(function () {
        close(); state.authed = true;
        return checkSession().then(function () { showBar(); startEditing(); if (state.retrySave) { state.retrySave = false; save(); } });
      }).catch(function (e2) {
        submit.disabled = false; input.select();
        err.textContent = e2.status === 401 ? t('wrongPw') : e2.status === 503 ? t('notConfigured') : t('netError');
      });
    });
  }

  function checkSession() {
    return api('session').then(function (s) {
      state.authed = true;
      state.deployed = s.deployed || null;
      state.stale = Boolean(s.deployed && s.latest && s.deployed !== s.latest);
      state.latest = s.latest || null;
      return s;
    });
  }

  /* ---------------- barra del editor ---------------- */
  function showBar() {
    root.classList.add('sm-admin');
    if (state.ui.bar) { renderBar(); return; }
    var bar = el('div', { class: 'sm-bar sm-chrome', role: 'region', 'aria-label': 'Editor' });
    bar.innerHTML = '<span class="sm-dot" aria-hidden="true"></span><span class="sm-mode"></span><span class="sm-status" aria-live="polite"></span>' +
      '<div class="sm-actions"><button type="button" data-a="toggle"></button><button type="button" data-a="add"></button><button type="button" data-a="save" class="sm-primary"></button>' +
      '<button type="button" data-a="discard"></button><button type="button" data-a="history"></button><button type="button" data-a="help"></button><button type="button" data-a="logout"></button></div>' +
      '<div class="sm-warn" hidden><span></span><button type="button" data-a="reload"></button></div><div class="sm-hint"></div>';
    bar.addEventListener('mousedown', function (e) { if (e.target.closest('[data-a="add"]')) e.preventDefault(); });
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-a]'); if (!b) return;
      ({ toggle: function () { state.editing ? stopEditing() : startEditing(); }, save: save, discard: discard,
        add: function () { if (!state.editing) startEditing(); openAddMenu(b); },
        history: openHistory, help: openHelp, logout: logout, reload: function () { location.reload(); } })[b.getAttribute('data-a')]();
    });
    document.body.appendChild(bar);
    state.ui.bar = bar;
    // Cambiar de idioma con los botones ES/EN de la cabecera actualiza los textos de la barra.
    new MutationObserver(function () { renderBar(); renderPalette(); }).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
    renderBar();
  }

  function renderBar(msg) {
    var bar = state.ui.bar; if (!bar) return;
    if (typeof msg === 'string') state.msg = msg;
    bar.classList.toggle('sm-is-dirty', state.dirty);
    bar.querySelector('.sm-mode').textContent = state.editing ? t('editing') : t('viewing');
    bar.querySelector('.sm-status').textContent = state.msg || (state.dirty ? t('dirty') : t('clean'));
    var labels = { toggle: state.editing ? t('preview') : t('edit'), add: t('addBtn'), save: t('save'), discard: t('discard'), history: t('history'),
      help: t('help'), logout: t('logout'), reload: t('reload') };
    bar.querySelectorAll('button[data-a]').forEach(function (b) { b.textContent = labels[b.getAttribute('data-a')]; });
    bar.querySelector('[data-a="save"]').disabled = state.busy || !state.dirty || state.stale;
    bar.querySelector('[data-a="add"]').hidden = !state.editing;
    bar.querySelector('[data-a="discard"]').disabled = state.busy || !state.dirty;
    var warn = bar.querySelector('.sm-warn');
    warn.hidden = !state.stale;
    warn.querySelector('span').textContent = state.staleDone ? t('staleDone') : t('stale');
    bar.querySelector('.sm-hint').textContent = state.editing ? t('langHint') : '';
  }

  function setDirty() { state.dirty = true; state.msg = ''; renderBar(); }

  /* ---------------- modo edición ---------------- */
  function markEditable() {
    regions().forEach(function (region) {
      region.querySelectorAll(TEXT_SEL).forEach(function (n) {
        if (isUI(n) || n.closest('[contenteditable="true"]')) return;
        var kids = Array.prototype.filter.call(n.children, function (c) { return c.classList.contains('es') || c.classList.contains('en'); });
        if (kids.length) {
          // Si el elemento contiene sus dos idiomas, se edita cada idioma por separado
          // para no borrar sin querer la versión que está oculta.
          Array.prototype.forEach.call(n.children, function (c) {
            if (c.matches('svg, img, .ico, .num, .sm-ui') || c.closest('[contenteditable="true"]')) return;
            c.contentEditable = 'true';
            if (c.__smBefore === undefined) c.__smBefore = c.textContent.trim();
          });
        } else {
          n.contentEditable = 'true';
          if (n.__smBefore === undefined) n.__smBefore = n.textContent.trim();
        }
      });
      region.querySelectorAll('[contenteditable="true"] svg, [contenteditable="true"] .ico, [contenteditable="true"] .num, [contenteditable="true"] img')
        .forEach(function (n) { n.contentEditable = 'false'; });
    });
  }

  function refreshTools() {
    regions().forEach(function (region) {
      region.querySelectorAll('.sm-ui').forEach(function (n) { n.remove(); });
      region.querySelectorAll('figure.photo').forEach(addPhotoTools);
      region.querySelectorAll('a[data-file]').forEach(addPdfTool);
    });
    addInlineAdders();
  }

  // Botones «＋ Añadir en esta sección» (al final de cada sección) y
  // «＋ Sección nueva aquí» (entre secciones), solo en modo edición.
  function addInlineAdders() {
    var main = mainRegion(); if (!main) return;
    Array.prototype.slice.call(main.children).forEach(function (sec) {
      if (!sec.matches('section')) return;
      var container = sec.querySelector(':scope > .container');
      if (container && !sec.classList.contains('hero')) {
        var here = el('div', { class: 'sm-ui sm-add-here', contenteditable: 'false' });
        var b = el('button', { type: 'button' }, t('addHere'));
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          select(sec);
          openAddMenu(b, { append: container }, true);
        });
        here.appendChild(b); container.appendChild(here);
      }
      var between = el('div', { class: 'sm-ui sm-add-section', contenteditable: 'false' });
      var bs = el('button', { type: 'button' }, t('addSectionHere'));
      bs.addEventListener('click', function (e) { e.stopPropagation(); addContent('section', { after: sec }); });
      between.appendChild(bs);
      sec.after(between);
    });
  }

  // Añadir dentro de un contenedor, antes de los botones del editor que haya al final.
  function appendInto(container, nodes) {
    var ref = container.querySelector(':scope > .sm-add-here');
    nodes.forEach(function (n) { container.insertBefore(n, ref); });
  }

  function startEditing() {
    if (!state.authed) return openLogin();
    state.editing = true; state.msg = '';
    root.classList.add('sm-editing');
    document.querySelectorAll('[data-region] details').forEach(function (d) {
      if (!d.hasAttribute('data-sm-wasopen')) d.setAttribute('data-sm-wasopen', d.open ? '1' : '0');
      d.open = true;
    });
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}
    markEditable();
    refreshTools();
    showPalette();
    renderBar();
  }

  function stopEditing() {
    state.editing = false;
    root.classList.remove('sm-editing');
    select(null);
    hidePalette();
    document.querySelectorAll('[data-region] [contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); });
    document.querySelectorAll('[data-region] .sm-ui').forEach(function (n) { n.remove(); });
    renderBar();
  }

  /* ---------------- selección y barra de herramientas ---------------- */
  function toolbar() {
    if (state.ui.toolbar) return state.ui.toolbar;
    var tb = el('div', { class: 'sm-toolbar sm-chrome', role: 'toolbar' });
    // Fila 1: formato del texto. Fila 2: el elemento seleccionado.
    var rows = [
      [['bold', '<b>B</b>', 'tBold'], ['italic', '<i>I</i>', 'tItalic'], ['underline', '<u>U</u>', 'tUnderline'], '|',
        ['smaller', 'A<small>−</small>', 'tSmaller'], ['bigger', 'A<sup>+</sup>', 'tBigger'], ['color', '<span class="sm-swatch"></span>', 'tColor'], '|',
        ['alignLeft', '⫷', 'tAlignLeft'], ['alignCenter', '≡', 'tAlignCenter'], ['alignRight', '⫸', 'tAlignRight'], '|',
        ['ul', '•≡', 'tUl'], ['ol', '1.', 'tOl'], ['link', '🔗', 'tLink'], ['clear', 'T<sub>×</sub>', 'tClear']],
      [['drag', '⠿', 'tDrag'], '|', ['up', '↑', 'tUp'], ['down', '↓', 'tDown'], ['cut', '✂', 'tCut'], ['paste', '📋', 'tPaste'], ['dup', '⧉', 'tDup'], ['del', '🗑', 'tDel'], '|',
        ['parent', '⤴', 'tParent'], ['add', '＋', 'tAdd']]
    ];
    rows.forEach(function (row) {
      var r = el('div', { class: 'sm-tb-row' });
      row.forEach(function (b) {
        if (b === '|') { r.appendChild(el('span', { class: 'sm-sep' })); return; }
        r.appendChild(el('button', { type: 'button', 'data-t': b[0], 'data-tip': b[2] }, b[1]));
      });
      tb.appendChild(r);
    });
    // Arrastrar: se mantiene pulsado ⠿ y se suelta donde se quiera poner.
    tb.querySelector('[data-t="drag"]').addEventListener('pointerdown', function (e) {
      if (!state.current) return;
      startDrag(e, { nodes: group(state.current), section: isTopSection(state.current) });
    });
    // mousedown sin foco: así no se pierde la selección del texto al pulsar.
    tb.addEventListener('mousedown', function (e) { e.preventDefault(); });
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-t]'); if (!b) return;
      var actions = { bold: function () { format('bold'); }, italic: function () { format('italic'); }, underline: function () { format('underline'); },
        smaller: function () { stepSize(-1); }, bigger: function () { stepSize(1); }, color: function () { openColorMenu(b); },
        alignLeft: function () { align(''); }, alignCenter: function () { align('txt-center'); }, alignRight: function () { align('txt-right'); },
        ul: function () { list('insertUnorderedList'); }, ol: function () { list('insertOrderedList'); }, link: editLink, clear: clearFormat,
        drag: function () { renderBar(t('dragHint')); },
        up: function () { move(-1); }, down: function () { move(1); }, cut: cut, paste: paste, dup: duplicate, del: removeItem,
        parent: selectParent, add: function () { openAddMenu(b); } };
      actions[b.getAttribute('data-t')]();
    });
    document.body.appendChild(tb);
    state.ui.toolbar = tb;
    return tb;
  }

  function select(item) {
    document.querySelectorAll('.sm-selected').forEach(function (n) { n.classList.remove('sm-selected'); });
    state.current = item;
    var tb = toolbar();
    closeAddMenu();
    if (!item) { tb.classList.remove('sm-show'); return; }
    group(item).forEach(function (n) { n.classList.add('sm-selected'); });
    tb.querySelectorAll('button[data-tip]').forEach(function (b) { b.title = t(b.getAttribute('data-tip')); b.setAttribute('aria-label', b.title); });
    tb.querySelector('[data-t="paste"]').disabled = !state.clip;
    tb.classList.add('sm-show');
    positionToolbar();
  }

  function positionToolbar() {
    var tb = state.ui.toolbar, item = state.current;
    if (!tb || !item || !item.isConnected) return;
    var target = visible(group(item)) || item;
    var r = target.getBoundingClientRect();
    var top = r.top + window.scrollY - tb.offsetHeight - 10;
    if (r.top - tb.offsetHeight - 10 < 80) top = Math.max(r.top, 80) + window.scrollY + 10; // no taparlo con la cabecera
    if (r.top < 80 && r.bottom > window.innerHeight - 100) top = window.scrollY + 90; // bloque más alto que la pantalla
    var left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - tb.offsetWidth - 8);
    tb.style.top = top + 'px'; tb.style.left = left + 'px';
  }
  function visible(list) { for (var i = 0; i < list.length; i++) if (list[i].offsetParent !== null) return list[i]; return null; }

  // Un elemento y su traducción (p.es + p.en, li.es + li.en) se mueven, duplican y eliminan juntos.
  function group(n) {
    var prev = n.previousElementSibling, next = n.nextElementSibling;
    if (n.classList.contains('es') && next && next.classList.contains('en') && next.tagName === n.tagName) return [n, next];
    if (n.classList.contains('en') && prev && prev.classList.contains('es') && prev.tagName === n.tagName) return [prev, n];
    return [n];
  }

  // Lo que se selecciona al hacer clic: el elemento más cercano; si no hay (el título
  // de una sección, por ejemplo), el bloque o la sección que lo contiene.
  function itemFor(target) {
    var item = target.closest(ITEM_SEL) || target.closest(CONTAINER_SEL + ', section');
    return item && inRegion(item) && !item.matches('[data-region]') ? item : null;
  }

  function mainRegion() { return document.querySelector('[data-region="main"]'); }
  function navRegion() { return document.querySelector('[data-region="nav"]'); }
  // Secciones de primer nivel (las que tienen enlace en el menú).
  function topSection(n) {
    var main = mainRegion();
    while (n && n.parentElement !== main) n = n.parentElement;
    return n && n.matches && n.matches('section') ? n : null;
  }
  function isTopSection(n) { return Boolean(n && n.parentElement === mainRegion() && n.matches('section')); }

  function format(cmd) {
    var sel = window.getSelection();
    if (!sel.rangeCount || !inRegion(sel.anchorNode && sel.anchorNode.parentElement)) return;
    document.execCommand(cmd, false, null);
    setDirty();
  }

  /* ---------------- enlaces ---------------- */
  function editableHost(node) {
    var n = node && (node.nodeType === 1 ? node : node.parentElement);
    return n && n.closest ? n.closest('[contenteditable="true"]') : null;
  }
  function langOf(n) { return n.classList.contains('es') ? 'es' : n.classList.contains('en') ? 'en' : null; }
  // Texto visible de un elemento en el idioma actual (si tiene sus dos idiomas dentro).
  function langSpan(n) { return n.querySelector(':scope > .' + L()) || null; }

  function linkKind(href) {
    href = href || '';
    if (/^mailto:/i.test(href)) return 'email';
    if (href.charAt(0) === '#') return 'section';
    if (/\.pdf($|[?#])/i.test(href) || /^apuntes\//.test(href)) return 'pdf';
    return 'web';
  }
  function normalizeHref(kind, value) {
    value = (value || '').trim();
    if (!value) return '';
    if (kind === 'email') return 'mailto:' + value.replace(/^mailto:/i, '');
    if (kind === 'section' || kind === 'pdf') return value;
    if (/^(https?:|mailto:|tel:|#)/i.test(value) || /^[a-z0-9_-]+\/.+\.[a-z0-9]+$/i.test(value)) return value;
    return 'https://' + value.replace(/^\/+/, '');
  }
  function sectionOptions() {
    var out = [];
    Array.prototype.forEach.call(mainRegion().children, function (s) {
      if (!s.id || !s.matches('section')) return;
      var label = '';
      var navA = navRegion() && navRegion().querySelector('a[href="#' + s.id + '"]');
      var h = s.querySelector('h1, h2');
      [navA, h].forEach(function (n) { if (!label && n) label = ((n.querySelector('.' + L()) || n).textContent || '').trim(); });
      out.push({ id: s.id, label: label || s.id });
    });
    return out;
  }

  // Ventana para crear o cambiar un enlace: texto que se ve + adónde lleva.
  function linkDialog(opts) {
    return new Promise(function (resolve) {
      var kind = linkKind(opts.href);
      var form = el('form', { class: 'sm-link-form' });
      form.innerHTML = '<h2></h2>' +
        '<label class="sm-field"><span data-l="linkText"></span><input name="text" type="text"></label>' +
        '<fieldset class="sm-field"><legend data-l="linkTo"></legend><div class="sm-kinds">' +
        ['web', 'email', 'section', 'pdf'].map(function (k) { return '<label><input type="radio" name="kind" value="' + k + '"><span data-l="kind_' + k + '"></span></label>'; }).join('') +
        '</div></fieldset>' +
        '<label class="sm-field" data-k="web"><span data-l="webAddr"></span><input name="web" type="text" inputmode="url" placeholder="www.ejemplo.com"></label>' +
        '<label class="sm-field" data-k="email"><span data-l="emailAddr"></span><input name="email" type="email" placeholder="nombre@correo.com"></label>' +
        '<label class="sm-field" data-k="section"><span data-l="sectionPick"></span><select name="section"></select></label>' +
        '<div class="sm-field" data-k="pdf"><span data-l="pdfPick"></span><input name="pdf" type="file" accept="application/pdf"><small class="sm-pdf-current"></small></div>' +
        '<div class="sm-err" aria-live="polite"></div>' +
        '<div class="sm-row"><button type="button" class="sm-remove"></button><span style="flex:1"></span><button type="button" class="sm-cancel"></button><button type="submit" class="sm-primary"></button></div>';
      form.querySelector('h2').textContent = opts.title;
      form.querySelectorAll('[data-l]').forEach(function (n) { n.textContent = t(n.getAttribute('data-l')); });
      form.querySelector('.sm-cancel').textContent = t('cancel');
      form.querySelector('.sm-primary').textContent = t('accept');
      var remove = form.querySelector('.sm-remove');
      remove.textContent = t('removeLink');
      remove.hidden = !opts.allowRemove;
      var textInput = form.querySelector('[name="text"]');
      textInput.value = opts.text || '';
      if (opts.hideText) textInput.closest('.sm-field').hidden = true;
      var sel = form.querySelector('[name="section"]');
      sectionOptions().forEach(function (o) { var op = el('option', { value: '#' + o.id }); op.textContent = o.label; sel.appendChild(op); });
      if (kind === 'web') form.querySelector('[name="web"]').value = opts.href || '';
      if (kind === 'email') form.querySelector('[name="email"]').value = (opts.href || '').replace(/^mailto:/i, '').split('?')[0];
      if (kind === 'section') sel.value = opts.href;
      var pdfPath = kind === 'pdf' ? opts.href : '';
      form.querySelector('.sm-pdf-current').textContent = pdfPath ? t('pdfCurrent') + ' ' + pdfPath.split('/').pop() : '';
      function show() {
        var k = form.querySelector('[name="kind"]:checked').value;
        form.querySelectorAll('[data-k]').forEach(function (n) { n.hidden = n.getAttribute('data-k') !== k; });
      }
      form.querySelector('[name="kind"][value="' + kind + '"]').checked = true;
      form.addEventListener('change', function (e) { if (e.target.name === 'kind') show(); });
      show();
      var close = modal(form);
      var err = form.querySelector('.sm-err');
      function done(v) { close(); resolve(v); }
      form.querySelector('.sm-cancel').addEventListener('click', function () { done(null); });
      remove.addEventListener('click', function () { done({ remove: true }); });
      setTimeout(function () { (opts.hideText ? form.querySelector('[name="web"]') : textInput).focus(); }, 30);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var k = form.querySelector('[name="kind"]:checked').value;
        var text = textInput.value.trim();
        if (!opts.hideText && !text) { err.textContent = t('needText'); return; }
        if (k === 'pdf') {
          var file = form.querySelector('[name="pdf"]').files[0];
          if (!file) { if (pdfPath) return done({ text: text, href: pdfPath }); err.textContent = t('needPdf'); return; }
          if (file.size > MAX_FILE) { err.textContent = t('tooLarge'); return; }
          var path = 'apuntes/' + slug(file.name) + '.pdf';
          var reader = new FileReader();
          reader.onload = function () {
            upload(path, String(reader.result).split(',')[1]).then(function () { done({ text: text, href: path }); }).catch(function () {});
          };
          reader.readAsDataURL(file);
          return;
        }
        var raw = k === 'web' ? form.querySelector('[name="web"]').value : k === 'email' ? form.querySelector('[name="email"]').value : sel.value;
        var href = normalizeHref(k, raw);
        if (!href) { err.textContent = t('needDest'); return; }
        if (k === 'email' && !/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/.test(href)) { err.textContent = t('badEmail'); return; }
        done({ text: text, href: href });
      });
    });
  }

  function externalize(a) {
    var href = a.getAttribute('href') || '';
    if (/^https?:/i.test(href) || linkKind(href) === 'pdf') { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    else { a.removeAttribute('target'); a.removeAttribute('rel'); }
  }

  function editLink() {
    var sel = window.getSelection();
    var node = sel.rangeCount ? sel.anchorNode : null;
    var a = node && (node.nodeType === 1 ? node : node.parentElement).closest('a');
    if (!a && state.current && state.current.matches('a')) a = state.current;
    if (a && inRegion(a)) {
      var span = langSpan(a);
      var textNode = span || a;
      linkDialog({ title: t('linkEdit'), text: textNode.textContent.trim(), href: a.getAttribute('href'), allowRemove: !a.classList.contains('btn') && !a.closest('nav') }).then(function (r) {
        if (!r) return;
        if (r.remove) {
          while (a.firstChild) a.parentNode.insertBefore(a.firstChild, a);
          a.remove();
        } else {
          a.setAttribute('href', r.href); externalize(a);
          if (r.text && r.text !== textNode.textContent.trim()) textNode.textContent = r.text;
        }
        setDirty();
      });
      return;
    }
    var host2 = editableHost(node);
    if (!sel.rangeCount || !host2 || !inRegion(host2)) { window.alert(t('selectText')); return; }
    var range = sel.getRangeAt(0).cloneRange();
    var selected = sel.isCollapsed ? '' : range.toString();
    linkDialog({ title: t('linkNew'), text: selected, href: '' }).then(function (r) {
      if (!r || r.remove) return;
      var link = el('a', { href: r.href });
      link.textContent = r.text || r.href;
      externalize(link);
      range.deleteContents();
      range.insertNode(link);
      setDirty();
    });
  }

  /* ---------------- mover, cortar, pegar, duplicar, eliminar ---------------- */
  function move(dir) {
    var item = state.current; if (!item) return;
    var g = group(item);
    if (dir < 0) {
      var before = g[0].previousElementSibling;
      while (before && isUI(before)) before = before.previousElementSibling;
      if (!before) return;
      var bg = group(before);
      bg[0].before.apply(bg[0], g);
    } else {
      var after = g[g.length - 1].nextElementSibling;
      while (after && isUI(after)) after = after.nextElementSibling;
      if (!after) return;
      var ag = group(after);
      ag[ag.length - 1].after.apply(ag[ag.length - 1], g);
    }
    if (isTopSection(item)) { syncNavOrder(); refreshTools(); }
    setDirty(); select(item);
    var tgt = visible(g); if (tgt) tgt.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setTimeout(positionToolbar, 350);
  }

  function cut() {
    var item = state.current; if (!item) return;
    var g = group(item);
    state.clip = { nodes: g, section: isTopSection(item) };
    g.forEach(function (n) { n.classList.remove('sm-selected'); n.remove(); });
    if (state.clip.section) refreshTools();
    select(null); setDirty(); renderBar(t('cutDone'));
  }

  function paste() {
    if (!state.clip) return;
    var clip = state.clip;
    insertNodes(clip.nodes, clip.section ? 'section' : 'item');
    state.clip = null;
    if (clip.section) syncNavOrder();
    renderBar('');
  }

  function duplicate() {
    var item = state.current; if (!item) return;
    var g = group(item);
    var clones = g.map(function (n) {
      var c = n.cloneNode(true);
      c.classList.remove('sm-selected');
      if (c.id) c.removeAttribute('id');
      c.querySelectorAll('[id]').forEach(function (x) { x.removeAttribute('id'); });
      c.querySelectorAll('.sm-ui').forEach(function (x) { x.remove(); });
      return c;
    });
    var last = g[g.length - 1];
    last.after.apply(last, clones);
    if (isTopSection(item)) {
      // Sección duplicada: necesita su propio ancla y su enlace en el menú.
      clones[0].id = newSectionId();
      var orig = navRegion().querySelector('a[href="#' + item.id + '"]');
      addNavLink(clones[0], orig ? orig.innerHTML : null, orig);
    }
    markEditable(); refreshTools(); setDirty();
    select(clones[g.indexOf(item)]);
  }

  function removeItem() {
    var item = state.current; if (!item) return;
    if ((item.matches(CONTAINER_SEL) || isTopSection(item)) && !window.confirm(t('confirmDelete'))) return;
    if (isTopSection(item) && item.id) {
      // Quitar también los enlaces del menú y del pie que llevaban a esta sección.
      document.querySelectorAll('[data-region="nav"] a[href="#' + item.id + '"], [data-region="footer"] a[href="#' + item.id + '"]').forEach(function (a) { a.remove(); });
    }
    var wasSection = isTopSection(item);
    group(item).forEach(function (n) { n.remove(); });
    if (wasSection) refreshTools();
    select(null); setDirty();
  }

  function selectParent() {
    var item = state.current; if (!item) return;
    var up = item.parentElement && item.parentElement.closest(ITEM_SEL + ', ' + CONTAINER_SEL + ', section');
    if (up && inRegion(up) && !up.matches('[data-region]')) {
      select(up); up.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); setTimeout(positionToolbar, 350);
    }
  }

  /* ---------------- menú: el orden de los enlaces sigue al de las secciones ---------------- */
  function newSectionId() { return 'seccion-' + Date.now().toString(36); }

  function addNavLink(section, html, after) {
    var nav = navRegion(); if (!nav || !section.id) return;
    var a = el('a', { href: '#' + section.id }, html || '<span class="es">Nueva sección</span><span class="en">New section</span>');
    if (after && after.parentElement === nav) after.after(a); else nav.appendChild(a);
    syncNavOrder();
    markEditable();
  }

  function syncNavOrder() {
    var nav = navRegion(); if (!nav) return;
    var order = Array.prototype.filter.call(mainRegion().children, function (s) { return s.id && s.matches('section'); })
      .map(function (s) { return '#' + s.id; });
    var links = Array.prototype.filter.call(nav.children, function (a) { return a.matches('a') && order.indexOf(a.getAttribute('href')) >= 0; });
    var sorted = links.slice().sort(function (a, b) { return order.indexOf(a.getAttribute('href')) - order.indexOf(b.getAttribute('href')); });
    var marks = links.map(function (a) { var m = document.createComment('sm'); a.replaceWith(m); return m; });
    marks.forEach(function (m, i) { m.replaceWith(sorted[i]); });
  }

  /* ---------------- añadir contenido nuevo ---------------- */
  var ADD_KINDS = ['text', 'textbox', 'heading', 'list', 'photo', 'button', 'card', 'section'];
  // Contenedores dentro de los que se colocan los elementos nuevos.
  var FLOW_SEL = '.container, article, .card, details > .body, .section-head, .hero-copy, .notes-intro > div, .notes-side, .notes-book, .person > div';

  function closeAddMenu() { if (state.ui.addMenu) { state.ui.addMenu.remove(); state.ui.addMenu = null; } }

  function openAddMenu(anchorBtn, target, inSection) {
    if (state.ui.addMenu) { closeAddMenu(); if (!target) return; }
    var menu = el('div', { class: 'sm-add-menu sm-chrome', role: 'menu' });
    var where = el('div', { class: 'sm-add-where' });
    where.textContent = inSection ? t('addWhereSection') : state.current ? t('addWhereSel') : t('addWhereEnd');
    menu.appendChild(where);
    ADD_KINDS.forEach(function (k) {
      if (inSection && k === 'section') return;
      var b = el('button', { type: 'button', role: 'menuitem', 'data-k': k });
      b.innerHTML = '<strong></strong><small></small>';
      b.querySelector('strong').textContent = t('add_' + k);
      b.querySelector('small').textContent = t('addHint_' + k);
      menu.appendChild(b);
    });
    menu.addEventListener('mousedown', function (e) { e.preventDefault(); });
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-k]'); if (!b) return;
      closeAddMenu(); addContent(b.getAttribute('data-k'), target);
    });
    document.body.appendChild(menu);
    state.ui.addMenu = menu;
    var r = anchorBtn.getBoundingClientRect();
    var top = r.bottom + window.scrollY + 6;
    if (r.bottom + menu.offsetHeight + 10 > window.innerHeight) top = r.top + window.scrollY - menu.offsetHeight - 6;
    menu.style.top = Math.max(window.scrollY + 8, top) + 'px';
    menu.style.left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - menu.offsetWidth - 8) + 'px';
  }

  function both(es, en) { return '<span class="es">' + es + '</span><span class="en">' + en + '</span>'; }

  function template(kind) {
    var h = {
      text: '<p class="es">Escribe aquí el texto.</p><p class="en">Write the text here.</p>',
      textbox: '<div class="textbox"><div class="es"><p>Escribe aquí lo que quieras. Puedes poner varios párrafos, listas, negritas, tamaños y colores.</p></div>' +
        '<div class="en"><p>Write anything here. You can add several paragraphs, lists, bold text, sizes and colours.</p></div></div>',
      heading: '<h3>' + both('Subtítulo', 'Subheading') + '</h3>',
      list: '<ul><li>' + both('Primer punto', 'First item') + '</li><li>' + both('Segundo punto', 'Second item') + '</li></ul>',
      photo: '<figure class="photo photo-inline" data-src=""><img alt=""><figcaption>' + both('Pie de foto', 'Caption') + '</figcaption></figure>',
      card: '<article class="card"><h3>' + both('Título del bloque', 'Block title') + '</h3><p class="es">Escribe aquí el texto del bloque.</p><p class="en">Write the block text here.</p></article>',
      section: '<section class="block"><div class="container"><div class="section-head"><span class="eyebrow">' + both('Nueva sección', 'New section') + '</span>' +
        '<h2>' + both('Título de la sección', 'Section title') + '</h2></div>' +
        '<p class="es">Escribe aquí el texto de la sección.</p><p class="en">Write the section text here.</p></div></section>'
    }[kind];
    var tpl = document.createElement('template'); tpl.innerHTML = h;
    return Array.prototype.slice.call(tpl.content.children);
  }

  function insertTarget(kind) {
    var main = mainRegion();
    var cur = state.current && state.current.isConnected && state.current.closest('[data-region="main"]') ? state.current : null;
    if (kind === 'section') {
      var sec = topSection(cur);
      return sec ? { after: sec } : { append: main };
    }
    if (!cur) {
      var secs = main.querySelectorAll(':scope > section');
      var lastSec = secs[secs.length - 1];
      return { append: (lastSec && lastSec.querySelector(':scope > .container')) || main };
    }
    if (cur.matches('section')) return { append: cur.querySelector(':scope > .container') || cur };
    if (cur.matches('article, .card')) return { append: cur };
    if (cur.matches('details')) return { append: cur.querySelector(':scope > .body') || cur };
    if (kind === 'photo' && cur.matches('figure.photo') && cur.parentElement.matches('.gallery')) return { after: cur };
    var anchor = cur;
    while (anchor.parentElement && !anchor.parentElement.matches(FLOW_SEL) && !anchor.parentElement.matches('[data-region]')) anchor = anchor.parentElement;
    var g = group(anchor);
    return { after: g[g.length - 1] };
  }

  function insertNodes(nodes, kind, target) {
    target = target || insertTarget(kind);
    if (target.before) target.before.before.apply(target.before, nodes);
    else if (target.after) target.after.after.apply(target.after, nodes);
    else appendInto(target.append, nodes);
    markEditable(); refreshTools(); setDirty();
    var first = nodes[0];
    select(first.matches(ITEM_SEL) || first.matches('section') ? first : (first.querySelector(ITEM_SEL) || first));
    var tgt = visible(nodes) || first;
    tgt.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(positionToolbar, 400);
    return nodes;
  }

  function addContent(kind, target) {
    if (kind === 'button') {
      linkDialog({ title: t('linkNewButton'), text: '', href: '' }).then(function (r) {
        if (!r || r.remove) return;
        var row = el('div', { class: 'cta-row' });
        // El mismo texto en los dos idiomas hasta que lo traduzca (si no, en el otro idioma el botón saldría vacío).
        var a = el('a', { class: 'btn btn-primary btn-sm', href: r.href }, both('', ''));
        a.querySelectorAll('.es, .en').forEach(function (n) { n.textContent = r.text; });
        externalize(a); row.appendChild(a);
        insertNodes([row], 'item', target);
      });
      return;
    }
    var nodes = template(kind);
    if (kind === 'section') {
      target = target || insertTarget('section');
      nodes[0].id = newSectionId();
      insertNodes(nodes, 'section', target);
      placeNewSection(nodes[0]);
    } else {
      insertNodes(nodes, 'item', target);
    }
    // Poner el cursor en el texto nuevo, seleccionado para escribir encima.
    var editable = null;
    nodes.some(function (n) {
      var c = [n].concat(Array.prototype.slice.call(n.querySelectorAll('[contenteditable="true"]')))
        .filter(function (x) { return x.getAttribute && x.getAttribute('contenteditable') === 'true' && x.offsetParent !== null; });
      editable = c[0] || null; return Boolean(editable);
    });
    if (kind === 'photo') {
      var input = nodes[0].querySelector('.sm-photo-tools input[type=file]');
      if (input) input.click();
    } else if (editable) {
      editable.focus();
      var range = document.createRange(); range.selectNodeContents(editable);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(range);
    }
  }

  // Una sección nueva alterna el fondo con la anterior y recibe su enlace en el menú.
  function placeNewSection(sec) {
    var prev = sec.previousElementSibling;
    while (prev && !prev.matches('section')) prev = prev.previousElementSibling;
    sec.classList.toggle('alt', Boolean(prev && !prev.classList.contains('alt')));
    var prevLink = prev && prev.id ? navRegion().querySelector('a[href="#' + prev.id + '"]') : null;
    addNavLink(sec, null, prevLink);
  }

  /* ---------------- formato del texto ---------------- */
  var SIZES = ['txt-sm', '', 'txt-lg', 'txt-xl'];
  var COLORS = [['', 'colorNormal'], ['txt-red', 'colorRed'], ['txt-muted', 'colorGrey']];

  function currentHost() {
    var sel = window.getSelection();
    var host = sel.rangeCount ? editableHost(sel.anchorNode) : null;
    return host && inRegion(host) ? host : null;
  }
  // Lo que es común a los dos idiomas (alineación, tamaño de un párrafo entero)
  // se aplica también a su traducción.
  function blockTargets(host) {
    var blk = host.matches('span') ? host.parentElement : host;
    if (host.matches('.textbox > div')) blk = host.parentElement;
    return group(blk);
  }
  function setClass(nodes, list, cls) {
    nodes.forEach(function (n) { list.forEach(function (c) { if (c) n.classList.remove(c); }); if (cls) n.classList.add(cls); });
  }
  function unwrap(n) { while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n); n.remove(); }
  // Vuelve a seleccionar unos nodos (para poder seguir aplicando formato al mismo texto).
  function selectInside(n) {
    var r = document.createRange(); r.selectNodeContents(n);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  function selectNodes(first, last) {
    if (!first || !first.parentNode) return;
    var r = document.createRange(); r.setStartBefore(first); r.setEndAfter(last || first);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }

  // Aplica una clase (tamaño o color) al texto seleccionado; sin selección, al párrafo entero.
  function applyText(list, cls) {
    var host = currentHost(); if (!host) { window.alert(t('selectTextFormat')); return; }
    var sel = window.getSelection();
    if (sel.isCollapsed) {
      setClass(blockTargets(host), list, cls); // párrafo entero: en los dos idiomas
    } else {
      var range = sel.getRangeAt(0);
      // Si lo seleccionado ya es justo un fragmento con formato del mismo tipo
      // (por ejemplo, una palabra ya agrandada), se cambia ese formato en vez de anidar otro.
      var anc = range.commonAncestorContainer; anc = anc.nodeType === 1 ? anc : anc.parentElement;
      var sp = anc.closest('span');
      while (sp && sp !== host && host.contains(sp)) {
        var hasList = list.some(function (c) { return c && sp.classList.contains(c); });
        if (hasList && sp.textContent.trim() === range.toString().trim()) {
          setClass([sp], list, cls);
          if (!sp.className) {
            var first = sp.firstChild, last = sp.lastChild;
            sp.removeAttribute('class'); unwrap(sp); selectNodes(first, last);
          } else selectInside(sp);
          setDirty();
          return;
        }
        sp = sp.parentElement && sp.parentElement.closest('span');
      }
      var frag = range.extractContents();
      frag.querySelectorAll('span').forEach(function (sp) { setClass([sp], list, ''); if (!sp.className) { sp.removeAttribute('class'); unwrap(sp); } });
      if (cls) {
        var span = el('span', { class: cls }); span.appendChild(frag);
        range.insertNode(span); selectInside(span);
      } else {
        var f = frag.firstChild, l = frag.lastChild;
        range.insertNode(frag); selectNodes(f, l);
      }
    }
    setDirty();
  }
  function currentClass(list) {
    var sel = window.getSelection(); if (!sel.rangeCount) return '';
    var n = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
    var host = currentHost(); if (!host) return '';
    var stop = blockTargets(host)[0].parentElement;
    while (n && n !== stop) {
      for (var i = 0; i < list.length; i++) if (list[i] && n.classList && n.classList.contains(list[i])) return list[i];
      n = n.parentElement;
    }
    return '';
  }
  function stepSize(dir) {
    if (!currentHost()) { window.alert(t('selectTextFormat')); return; }
    var i = SIZES.indexOf(currentClass(SIZES));
    var next = SIZES[Math.min(SIZES.length - 1, Math.max(0, i + dir))];
    applyText(SIZES, next);
  }
  function align(cls) {
    var host = currentHost(); if (!host) { window.alert(t('selectTextFormat')); return; }
    setClass(blockTargets(host), ['txt-center', 'txt-right'], cls);
    setDirty();
  }
  function list(cmd) {
    var host = currentHost();
    if (!host || !host.matches('.textbox > div')) { window.alert(t('listOnlyTextbox')); return; }
    document.execCommand(cmd, false, null);
    // El navegador a veces mete la lista dentro de un párrafo: sacarla.
    host.querySelectorAll('p > ul, p > ol').forEach(function (lst) {
      var par = lst.parentElement; par.after(lst);
      if (!par.textContent.trim()) par.remove();
    });
    setDirty();
  }
  function clearFormat() {
    var host = currentHost(); if (!host) { window.alert(t('selectTextFormat')); return; }
    var sel = window.getSelection();
    var whole = sel.isCollapsed;
    if (whole) {
      var r = document.createRange(); r.selectNodeContents(host); sel.removeAllRanges(); sel.addRange(r);
    }
    // Decidir qué se quita antes de tocar nada (al cambiar el texto la selección se mueve).
    var spans = Array.prototype.filter.call(host.querySelectorAll('span[class*="txt-"]'), function (sp) { return whole || sel.containsNode(sp, true); });
    document.execCommand('removeFormat', false, null);
    spans.forEach(function (sp) { if (sp.isConnected) unwrap(sp); });
    setClass(blockTargets(host), SIZES.concat(['txt-red', 'txt-muted']), '');
    setDirty();
  }
  function openColorMenu(btn) {
    if (!currentHost()) { window.alert(t('selectTextFormat')); return; }
    closeAddMenu();
    var menu = el('div', { class: 'sm-add-menu sm-color-menu sm-chrome', role: 'menu' });
    COLORS.forEach(function (c) {
      var b = el('button', { type: 'button', 'data-c': c[0] }, '<span class="sm-swatch ' + (c[0] || 'sm-sw-normal') + '"></span><strong></strong>');
      b.querySelector('strong').textContent = t(c[1]);
      menu.appendChild(b);
    });
    menu.addEventListener('mousedown', function (e) { e.preventDefault(); });
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]'); if (!b) return;
      closeAddMenu(); applyText(['txt-red', 'txt-muted'], b.getAttribute('data-c'));
    });
    document.body.appendChild(menu);
    state.ui.addMenu = menu;
    var r = btn.getBoundingClientRect();
    menu.style.top = (r.bottom + window.scrollY + 6) + 'px';
    menu.style.left = Math.max(8, r.left + window.scrollX) + 'px';
  }

  /* ---------------- panel «Añadir» ---------------- */
  function showPalette() {
    if (state.ui.palette) return;
    var collapsed = false;
    try { collapsed = localStorage.getItem('sm-palette') === '0'; } catch (e) {}
    var pal = el('aside', { class: 'sm-palette sm-chrome', 'aria-label': t('paletteTitle') });
    pal.innerHTML = '<div class="sm-pal-head"><strong></strong><button type="button" class="sm-pal-toggle"></button></div><p class="sm-pal-hint"></p><div class="sm-pal-tiles"></div>';
    ADD_KINDS.forEach(function (k) {
      var b = el('button', { type: 'button', class: 'sm-tile', 'data-k': k });
      b.innerHTML = '<span class="sm-tile-ico" aria-hidden="true"></span><strong></strong>';
      b.querySelector('.sm-tile-ico').textContent = { text: '¶', textbox: '▭', heading: 'H', list: '•', photo: '🖼', button: '⬭', card: '▣', section: '☰' }[k];
      b.querySelector('strong').textContent = t('add_' + k);
      b.title = t('addHint_' + k);
      pal.querySelector('.sm-pal-tiles').appendChild(b);
      // Clic: añadir junto a lo seleccionado. Arrastrar: soltar donde se quiera.
      b.addEventListener('pointerdown', function (e) {
        var x0 = e.clientX, y0 = e.clientY;
        function mv(ev) {
          if (Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) < 6) return;
          cleanup(); startDrag(ev, { kind: k, section: k === 'section' });
        }
        function up() { cleanup(); }
        function cleanup() { document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', up); }
        document.addEventListener('pointermove', mv); document.addEventListener('pointerup', up);
      });
      b.addEventListener('click', function () { if (!state.dragJustEnded) addContent(k); });
    });
    pal.querySelector('.sm-pal-toggle').addEventListener('click', function () { setPaletteOpen(pal.classList.contains('sm-collapsed')); });
    pal.addEventListener('mousedown', function (e) { if (e.target.closest('.sm-tile')) e.preventDefault(); });
    document.body.appendChild(pal);
    state.ui.palette = pal;
    renderPalette();
    setPaletteOpen(!collapsed);
  }
  function renderPalette() {
    var pal = state.ui.palette; if (!pal) return;
    pal.querySelector('.sm-pal-head strong').textContent = t('paletteTitle');
    pal.querySelector('.sm-pal-hint').textContent = t('paletteHint');
    pal.querySelectorAll('.sm-tile').forEach(function (b) {
      b.querySelector('strong').textContent = t('add_' + b.getAttribute('data-k'));
      b.title = t('addHint_' + b.getAttribute('data-k'));
    });
    pal.querySelector('.sm-pal-toggle').textContent = pal.classList.contains('sm-collapsed') ? '»' : '«';
    pal.querySelector('.sm-pal-toggle').title = pal.classList.contains('sm-collapsed') ? t('paletteOpen') : t('paletteClose');
  }
  function setPaletteOpen(open) {
    var pal = state.ui.palette; if (!pal) return;
    pal.classList.toggle('sm-collapsed', !open);
    root.classList.toggle('sm-pal-open', open);
    try { localStorage.setItem('sm-palette', open ? '1' : '0'); } catch (e) {}
    renderPalette();
    setTimeout(positionToolbar, 50);
  }
  function hidePalette() {
    if (state.ui.palette) { state.ui.palette.remove(); state.ui.palette = null; }
    root.classList.remove('sm-pal-open');
  }

  /* ---------------- arrastrar y soltar ---------------- */
  // payload: { nodes: [...] } para mover algo que ya existe, o { kind } para algo nuevo del panel.
  var drag = null;
  function startDrag(e, payload) {
    e.preventDefault();
    closeAddMenu();
    var label = payload.kind ? t('add_' + payload.kind) : t('dragMoving');
    drag = {
      payload: payload, drop: null, x: e.clientX, y: e.clientY,
      ghost: el('div', { class: 'sm-ghost sm-chrome' }), line: el('div', { class: 'sm-drop-line sm-chrome' })
    };
    drag.ghost.textContent = '⠿ ' + label;
    document.body.appendChild(drag.ghost); document.body.appendChild(drag.line);
    if (payload.nodes) payload.nodes.forEach(function (n) { n.classList.add('sm-drag-src'); });
    root.classList.add('sm-dragging');
    if (state.ui.toolbar) state.ui.toolbar.classList.remove('sm-show');
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragEnd);
    document.addEventListener('keydown', onDragKey);
    drag.timer = setInterval(autoScroll, 16);
    onDragMove(e);
  }
  function autoScroll() {
    if (!drag) return;
    if (drag.y < 90) window.scrollBy(0, -Math.ceil((90 - drag.y) / 6));
    else if (drag.y > window.innerHeight - 110) window.scrollBy(0, Math.ceil((drag.y - window.innerHeight + 110) / 6));
  }
  function onDragKey(e) { if (e.key === 'Escape') { drag.drop = null; onDragEnd(); } }

  function onDragMove(e) {
    if (!drag) return;
    drag.x = e.clientX; drag.y = e.clientY;
    drag.ghost.style.left = (e.clientX + 14) + 'px';
    drag.ghost.style.top = (e.clientY + 14) + 'px';
    var under = document.elementFromPoint(e.clientX, e.clientY);
    drag.drop = dropAt(under, e.clientX, e.clientY);
    drawDropLine(drag.drop);
  }

  function insideDragged(n) {
    var nodes = drag.payload.nodes || [];
    for (var i = 0; i < nodes.length; i++) if (nodes[i] === n || nodes[i].contains(n)) return true;
    return false;
  }

  // Dónde caería lo arrastrado: { ref, before } o { container } (al final).
  function dropAt(under, x, y) {
    var main = mainRegion();
    if (!under || !main.contains(under) || under.closest('.sm-chrome')) return null;
    if (under.closest('.sm-add-section')) {
      var prevSec = under.closest('.sm-add-section').previousElementSibling;
      return drag.payload.section ? { ref: prevSec, before: false, axis: 'y' } : null;
    }
    if (drag.payload.section) {
      var sec = topSection(under); if (!sec || insideDragged(sec)) return null;
      var rs = sec.getBoundingClientRect();
      return { ref: sec, before: y < rs.top + rs.height / 2, axis: 'y' };
    }
    if (insideDragged(under)) return null;
    var nodes = drag.payload.nodes;
    if (nodes && nodes[0].matches('li')) {
      var li = under.closest('li');
      if (!li || insideDragged(li) || li.closest('.textbox')) return null;
      var rl = li.getBoundingClientRect();
      return { ref: li, before: y < rl.top + rl.height / 2, axis: 'y' };
    }
    if (under.closest('.sm-add-here')) return { container: under.closest('.sm-add-here').parentElement };
    // Un bloque arrastrado (recuadro, cuadro de texto, desplegable) se pone antes o
    // después de otros bloques, no dentro de ellos.
    var box = (nodes && nodes[0].matches('article, .card, details, .textbox')) || drag.payload.kind === 'card';
    var BOX_SEL = 'article, .card, details > .body, .notes-book, .person > div';
    // Subir hasta un elemento cuyo padre sea un contenedor donde se pueden poner cosas.
    var n = under.closest('.textbox') || under;
    while (n && n !== main) {
      var parent = n.parentElement;
      if (!parent) return null;
      if (box && parent.matches(BOX_SEL)) { n = parent; continue; }
      if (n.matches('section') && parent === main) {
        var c = n.querySelector(':scope > .container');
        return c && !n.classList.contains('hero') ? { container: c } : null;
      }
      if (!n.classList.contains('sm-ui') && (parent.matches(FLOW_SEL) || parent.matches('.grid, .gallery'))) {
        if (insideDragged(n)) return null;
        // Sobre el espacio vacío de un contenedor: al final del contenedor.
        if (n.matches(FLOW_SEL) && n === under && !n.matches('.section-head')) return { container: n };
        var r = n.getBoundingClientRect();
        var axis = parent.matches('.grid, .gallery') && r.width < parent.getBoundingClientRect().width * 0.8 ? 'x' : 'y';
        var before = axis === 'x' ? x < r.left + r.width / 2 : y < r.top + r.height / 2;
        return { ref: n, before: before, axis: axis };
      }
      n = parent;
    }
    return null;
  }

  function drawDropLine(d) {
    var line = drag.line;
    if (!d) { line.style.display = 'none'; return; }
    var r, top, left, w, h;
    if (d.container) {
      var c = d.container, ref = c.querySelector(':scope > .sm-add-here');
      var last = ref ? ref.previousElementSibling : c.lastElementChild;
      var cr = c.getBoundingClientRect();
      top = last ? last.getBoundingClientRect().bottom + 4 : cr.top + 8;
      left = cr.left; w = cr.width; h = 4;
    } else {
      var g = group(d.ref);
      r = (d.before ? g[0] : g[g.length - 1]).getBoundingClientRect();
      var vis = visible(g); if (vis) r = vis.getBoundingClientRect();
      if (d.axis === 'x') { top = r.top; h = r.height; left = d.before ? r.left - 6 : r.right + 2; w = 4; }
      else { left = r.left; w = r.width; h = 4; top = d.before ? r.top - 6 : r.bottom + 2; }
    }
    line.style.display = 'block';
    line.style.top = top + 'px'; line.style.left = left + 'px'; line.style.width = w + 'px'; line.style.height = h + 'px';
  }

  function onDragEnd() {
    if (!drag) return;
    var d = drag.drop, payload = drag.payload;
    clearInterval(drag.timer);
    drag.ghost.remove(); drag.line.remove();
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragEnd);
    document.removeEventListener('keydown', onDragKey);
    root.classList.remove('sm-dragging');
    if (payload.nodes) payload.nodes.forEach(function (n) { n.classList.remove('sm-drag-src'); });
    drag = null;
    state.dragJustEnded = true; setTimeout(function () { state.dragJustEnded = false; }, 50);
    if (!d) { if (state.current) select(state.current); return; }
    var target;
    if (d.container) target = { append: d.container };
    else {
      var g = group(d.ref);
      target = d.before ? { before: g[0] } : { after: g[g.length - 1] };
    }
    if (payload.kind) { addContent(payload.kind, target); return; }
    insertNodes(payload.nodes, payload.section ? 'section' : 'item', target);
    if (payload.section) { syncNavOrder(); refreshTools(); }
    select(payload.nodes[0]);
  }

  /* ---------------- fotos ---------------- */
  function addPhotoTools(fig) {
    fig.setAttribute('data-sm-empty', t('noPhoto'));
    var box = el('div', { class: 'sm-ui sm-photo-tools', contenteditable: 'false' });
    var input = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', hidden: '' });
    var change = el('button', { type: 'button' }, t('changePhoto'));
    var remove = el('button', { type: 'button' }, t('removePhoto'));
    change.addEventListener('click', function (e) { e.stopPropagation(); input.click(); });
    remove.addEventListener('click', function (e) {
      e.stopPropagation();
      fig.setAttribute('data-src', '');
      var img = fig.querySelector('img'); if (img) img.removeAttribute('src');
      fig.classList.remove('has-img'); fig.classList.add('no-img');
      setDirty();
    });
    input.addEventListener('change', function () {
      var file = input.files && input.files[0]; if (!file) return;
      resizeImage(file).then(function (dataUrl) {
        var base = slug((fig.getAttribute('data-src') || '').split('/').pop() || file.name).replace(/-[a-z0-9]{6,9}$/, '');
        var path = 'images/' + base + '-' + Date.now().toString(36) + '.jpg';
        return upload(path, dataUrl.split(',')[1]).then(function () {
          fig.setAttribute('data-src', path);
          var img = fig.querySelector('img');
          if (!img) { img = el('img', { alt: '' }); fig.insertBefore(img, fig.firstChild); }
          img.src = dataUrl; // vista previa: el archivo real se publica al guardar
          fig.classList.add('has-img'); fig.classList.remove('no-img');
        });
      }).catch(function (e) { if (!e.status) window.alert(t('badImage')); }).then(function () { input.value = ''; });
    });
    box.appendChild(change); box.appendChild(remove); box.appendChild(input);
    fig.appendChild(box);
  }

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var max = 1800, k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('image')); };
      img.src = url;
    });
  }

  /* ---------------- PDF de los apuntes ---------------- */
  function addPdfTool(a) {
    var input = el('input', { type: 'file', accept: 'application/pdf', hidden: '' });
    var btn = el('button', { type: 'button', class: 'sm-ui sm-pdf-tool', contenteditable: 'false' }, '📄 ' + t('uploadPdf'));
    btn.appendChild(input);
    btn.addEventListener('click', function (e) { if (e.target === input) return; e.stopPropagation(); e.preventDefault(); input.click(); });
    input.addEventListener('click', function (e) { e.stopPropagation(); });
    input.addEventListener('change', function () {
      var file = input.files && input.files[0]; if (!file) return;
      if (file.size > MAX_FILE) { window.alert(t('tooLarge')); input.value = ''; return; }
      var current = a.getAttribute('data-file') || '';
      var path = /^apuntes\/[a-z0-9][a-z0-9._-]*\.pdf$/.test(current) ? current : 'apuntes/' + slug(file.name) + '.pdf';
      var reader = new FileReader();
      reader.onload = function () {
        upload(path, String(reader.result).split(',')[1]).then(function () {
          a.setAttribute('data-file', path); a.setAttribute('href', path);
          a.removeAttribute('aria-disabled');
          renderBar(t('pdfReady'));
        }).catch(function () {}).then(function () { input.value = ''; });
      };
      reader.readAsDataURL(file);
    });
    a.after(btn);
  }

  function upload(path, base64) {
    state.busy = true; renderBar(t('uploading'));
    return api('upload', { data: base64 }).then(function (r) {
      state.pending[path] = { path: path, sha: r.sha };
      state.busy = false; setDirty();
      return r;
    }).catch(function (e) {
      state.busy = false;
      if (e.status === 401) { state.authed = false; renderBar(t('expired')); openLogin(); }
      else { renderBar(''); window.alert(e.status === 413 ? t('tooLarge') : t('uploadError') + e.message); }
      throw e;
    });
  }

  /* ---------------- guardar ---------------- */
  // Devuelve el HTML de cada zona tal como debe quedar en index.html:
  // sin nada del editor y sin los cambios que hace el script de la página al cargar.
  function serialize() {
    var out = {};
    regions().forEach(function (region) {
      var c = region.cloneNode(true);
      c.querySelectorAll('.sm-ui').forEach(function (n) { n.remove(); });
      c.querySelectorAll('[contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); });
      c.querySelectorAll('.sm-selected, .sm-drag-src').forEach(function (n) { n.classList.remove('sm-selected', 'sm-drag-src'); });
      c.querySelectorAll('[data-sm-empty]').forEach(function (n) { n.removeAttribute('data-sm-empty'); });
      c.querySelectorAll('details[data-sm-wasopen]').forEach(function (d) {
        if (d.getAttribute('data-sm-wasopen') === '0') d.removeAttribute('open'); else d.setAttribute('open', '');
        d.removeAttribute('data-sm-wasopen');
      });
      c.querySelectorAll('figure.photo').forEach(function (f) {
        f.classList.remove('has-img', 'no-img');
        var img = f.querySelector('img'); if (img) img.removeAttribute('src');
      });
      c.querySelectorAll('a[data-file]').forEach(function (a) {
        a.setAttribute('aria-disabled', 'true');
        a.innerHTML = 'PDF · <span class="es">Próximamente</span><span class="en">Coming soon</span>';
      });
      c.querySelectorAll('a.active').forEach(function (a) { a.classList.remove('active'); });
      c.querySelectorAll('[data-copied]').forEach(function (n) { n.textContent = ''; });
      c.querySelectorAll('[class=""]').forEach(function (n) { n.removeAttribute('class'); });
      out[region.getAttribute('data-region')] = c.innerHTML.replace(/<!--\/?editable:[a-z]+-->/g, '');
    });
    return out;
  }

  function save() {
    if (state.busy || state.stale) return;
    if (!state.dirty) return;
    if (state.clip && !window.confirm(t('clipLost'))) return;
    state.clip = null;
    state.busy = true; renderBar(t('saving'));
    var files = Object.keys(state.pending).map(function (k) { return state.pending[k]; });
    api('save', { regions: serialize(), files: files, base: state.deployed }).then(function (r) {
      state.busy = false; state.dirty = false; state.pending = {};
      // La página abierta ya es la versión guardada: los siguientes guardados no necesitan comprobar la base.
      state.deployed = null;
      if (r.commit) waitForPublish(r.commit, false); else renderBar(t('saved'));
    }).catch(function (e) {
      state.busy = false;
      if (e.status === 401) { state.authed = false; state.retrySave = true; renderBar(t('expired')); openLogin(); }
      else if (e.status === 409) { state.stale = true; renderBar(t('staleSave')); }
      else renderBar(t('saveError') + e.message);
    });
  }

  // Vercel tarda unos segundos en publicar cada commit. Mientras tanto, recargar
  // muestra la versión anterior y parece que no se ha guardado: se avisa hasta
  // que la versión publicada coincide con la guardada.
  function waitForPublish(commit, reloadNeeded) {
    var started = Date.now(), token = {};
    state.publishing = token;
    if (!reloadNeeded) renderBar(t('publishing'));
    (function poll() {
      setTimeout(function () {
        if (state.publishing !== token) return;
        api('session').then(function (s) {
          if (state.publishing !== token) return;
          if (!s.deployed) { state.publishing = null; renderBar(reloadNeeded ? '' : t('saved')); return; }
          if (s.deployed === commit) {
            state.publishing = null;
            if (reloadNeeded) { state.staleDone = true; renderBar(''); } else renderBar(t('published'));
            return;
          }
          if (Date.now() - started > 5 * 60 * 1000) { state.publishing = null; renderBar(reloadNeeded ? '' : t('publishSlow')); return; }
          poll();
        }).catch(function () { if (Date.now() - started < 5 * 60 * 1000) poll(); else state.publishing = null; });
      }, 4000);
    })();
  }

  function discard() {
    if (!state.dirty || window.confirm(t('confirmDiscard'))) { state.dirty = false; location.reload(); }
  }

  function logout() {
    if (state.dirty && !window.confirm(t('confirmDiscard'))) return;
    state.dirty = false;
    api('logout', {}).catch(function () {}).then(function () { location.reload(); });
  }

  /* ---------------- historial y ayuda ---------------- */
  function openHistory() {
    var box = el('div');
    box.innerHTML = '<h2></h2><div class="sm-list"><p>…</p></div><div class="sm-row" style="margin-top:14px"><button type="button" class="sm-close"></button></div>';
    box.querySelector('h2').textContent = t('historyTitle');
    box.querySelector('.sm-close').textContent = t('close');
    var close = modal(box);
    box.querySelector('.sm-close').addEventListener('click', close);
    var list = box.querySelector('.sm-list');
    api('history').then(function (r) {
      list.innerHTML = '';
      r.versions.forEach(function (v, i) {
        var row = el('div', { class: 'sm-version' });
        var info = el('div');
        info.appendChild(document.createTextNode(new Date(v.date).toLocaleString(L() === 'en' ? 'en-GB' : 'es-ES')));
        var small = el('small'); small.textContent = v.message; info.appendChild(small);
        row.appendChild(info);
        if (i > 0) {
          var b = el('button', { type: 'button' }, t('restore'));
          b.addEventListener('click', function () {
            if (!window.confirm(t('confirmRestore'))) return;
            b.disabled = true;
            // La página abierta ya no es la versión guardada: no dejar guardar encima hasta recargar.
            api('history', { sha: v.sha }).then(function (r) { close(); state.dirty = false; state.stale = true; renderBar(t('restored')); if (r.commit) waitForPublish(r.commit, true); })
              .catch(function (e) { b.disabled = false; window.alert(t('saveError') + e.message); });
          });
          row.appendChild(b);
        }
        list.appendChild(row);
      });
    }).catch(function (e) { list.textContent = t('saveError') + e.message; });
  }

  function openHelp() {
    var box = el('div', null, t('helpHtml') + '<div class="sm-row"><button type="button" class="sm-primary"></button></div>');
    box.querySelector('button').textContent = t('close');
    var close = modal(box);
    box.querySelector('button').addEventListener('click', close);
  }

  /* ---------------- eventos de la página ---------------- */
  document.addEventListener('click', function (e) {
    if (state.ui.addMenu && !e.target.closest('.sm-add-menu, [data-t="add"], [data-a="add"]')) closeAddMenu();
    if (!state.editing || isUI(e.target)) return;
    var region = inRegion(e.target);
    if (!region) { if (!e.target.closest('.sm-toolbar')) select(null); return; }
    // En modo edición los enlaces y los desplegables no navegan: se editan.
    if (e.target.closest('a, summary')) e.preventDefault();
    select(itemFor(e.target));
  }, true);

  document.addEventListener('input', function (e) {
    if (!state.editing || !inRegion(e.target)) return;
    var host = editableHost(e.target);
    if (host) syncNavLabel(host);
    setDirty();
  });

  // Si se cambia el antetítulo de una sección y su enlace del menú decía lo mismo,
  // el enlace del menú se actualiza también (así las secciones nuevas no se quedan
  // como «Nueva sección» en el menú).
  function syncNavLabel(host) {
    if (!host.closest('.section-head .eyebrow')) return;
    var sec = topSection(host); if (!sec || !sec.id) return;
    var link = navRegion() && navRegion().querySelector('a[href="#' + sec.id + '"]'); if (!link) return;
    var lang = langOf(host) || L();
    var span = link.querySelector(':scope > .' + lang) || link;
    var text = host.textContent.trim();
    if (span.textContent.trim() !== (host.__smBefore || '')) { host.__smBefore = text; return; }
    span.textContent = text;
    host.__smBefore = text; // para seguir sincronizando mientras escribe
  }

  // Pegar siempre como texto sin formato (evita traer estilos de Word o de otras webs).
  document.addEventListener('paste', function (e) {
    if (!state.editing || !inRegion(e.target)) return;
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    e.preventDefault();
    document.execCommand('insertText', false, text);
  });

  // Intro en títulos y botones no crea líneas nuevas.
  document.addEventListener('keydown', function (e) {
    if (!state.editing || e.key !== 'Enter') return;
    var n = e.target.closest && e.target.closest('[contenteditable="true"]');
    if (n && inRegion(n) && n.closest('h1, h2, h3, h4, summary, .btn, .tag, .eyebrow, nav, .stat')) e.preventDefault();
  });

  window.addEventListener('resize', positionToolbar);
  window.addEventListener('beforeunload', function (e) {
    if (state.dirty || state.publishing) { e.preventDefault(); e.returnValue = state.dirty ? '' : t('leaveWhilePublishing'); }
  });

  /* ---------------- arranque ---------------- */
  injectCSS();
  window.SM_EDITOR = { openLogin: openLogin };
  var wantsLogin = location.hash === '#acceso';
  checkSession().then(function () {
    clearHash();
    showBar();
    if (state.stale && state.latest) waitForPublish(state.latest, true);
    if (wantsLogin) startEditing();
  }).catch(function () {
    state.authed = false;
    if (wantsLogin) openLogin();
  });
})();
