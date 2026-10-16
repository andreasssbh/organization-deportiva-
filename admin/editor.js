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
    helpHtml: {
      es: '<h3>Cómo editar</h3><ul>' +
        '<li><strong>Textos</strong>: haz clic en cualquier texto y escribe. Selecciona palabras para ponerlas en <strong>negrita</strong>, <em>cursiva</em> o convertirlas en enlace.</li>' +
        '<li><strong>Elementos</strong>: al hacer clic en un párrafo, punto de lista, tarjeta o foto aparece una barra con ↑ ↓ (mover), ⧉ (duplicar) y 🗑 (eliminar). Con ⤴ seleccionas el bloque que lo contiene (la tarjeta, la sección…).</li>' +
        '<li><strong>Añadir</strong> algo nuevo (una referencia, un enlace, una foto de la galería…): duplica uno parecido con ⧉ y cambia su texto.</li>' +
        '<li><strong>Fotos</strong>: «Cambiar foto» en cada foto. Las fotos sin imagen no se ven en la web.</li>' +
        '<li><strong>Apuntes</strong>: «Subir PDF» junto a cada tema (máx. 3 MB).</li>' +
        '<li><strong>Idiomas</strong>: cada texto existe en español y en inglés. Cambia a EN arriba para editar la versión inglesa.</li>' +
        '<li>Pulsa <strong>Guardar</strong> al terminar. La web pública se actualiza en 1–2 minutos. Si algo sale mal, en <strong>Historial</strong> puedes volver a una versión anterior.</li></ul>',
      en: '<h3>How to edit</h3><ul>' +
        '<li><strong>Text</strong>: click any text and type. Select words to make them <strong>bold</strong>, <em>italic</em> or a link.</li>' +
        '<li><strong>Items</strong>: clicking a paragraph, list item, card or photo shows a bar with ↑ ↓ (move), ⧉ (duplicate) and 🗑 (delete). ⤴ selects the enclosing block (the card, the section…).</li>' +
        '<li><strong>Add</strong> something new (a reference, a link, a gallery photo…): duplicate a similar one with ⧉ and change its text.</li>' +
        '<li><strong>Photos</strong>: "Change photo" on each photo. Photos without an image are hidden on the site.</li>' +
        '<li><strong>Lecture notes</strong>: "Upload PDF" next to each topic (max 3 MB).</li>' +
        '<li><strong>Languages</strong>: every text exists in Spanish and English. Switch to ES/EN at the top to edit each version.</li>' +
        '<li>Press <strong>Save</strong> when you are done. The public site updates in 1–2 minutes. If something goes wrong, <strong>History</strong> lets you go back to an earlier version.</li></ul>'
    }
  };
  function t(k) { return TXT[k][L()]; }

  // Textos editables y elementos que se pueden mover / duplicar / eliminar.
  var TEXT_SEL = 'h1, h2, h3, h4, p, li:not(.theme), figcaption, summary, .btn, .eyebrow, .tag, .stat > strong, .stat > span, .notes-book > strong, .notes-book > span, .schedule > span, nav[data-region] > a, footer nav > a, [data-region="footer"] > div > div';
  var ITEM_SEL = 'li, p, h4, figure.photo, article, details, .stat, .notes-book, .schedule, .person, .cta-row > .btn, .actions > a, nav[data-region] > a, footer nav > a';
  var CONTAINER_SEL = 'article, details, section.block, .theme, figure.photo, .person, ul, ol, .grid, .gallery';
  var MAX_FILE = 3.3 * 1024 * 1024;

  var state = {
    authed: false, editing: false, dirty: false, busy: false, stale: false,
    deployed: null, current: null, pending: {}, ui: {}
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
      return s;
    });
  }

  /* ---------------- barra del editor ---------------- */
  function showBar() {
    root.classList.add('sm-admin');
    if (state.ui.bar) { renderBar(); return; }
    var bar = el('div', { class: 'sm-bar sm-chrome', role: 'region', 'aria-label': 'Editor' });
    bar.innerHTML = '<span class="sm-dot" aria-hidden="true"></span><span class="sm-mode"></span><span class="sm-status" aria-live="polite"></span>' +
      '<div class="sm-actions"><button type="button" data-a="toggle"></button><button type="button" data-a="save" class="sm-primary"></button>' +
      '<button type="button" data-a="discard"></button><button type="button" data-a="history"></button><button type="button" data-a="help"></button><button type="button" data-a="logout"></button></div>' +
      '<div class="sm-warn" hidden><span></span><button type="button" data-a="reload"></button></div><div class="sm-hint"></div>';
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-a]'); if (!b) return;
      ({ toggle: function () { state.editing ? stopEditing() : startEditing(); }, save: save, discard: discard,
        history: openHistory, help: openHelp, logout: logout, reload: function () { location.reload(); } })[b.getAttribute('data-a')]();
    });
    document.body.appendChild(bar);
    state.ui.bar = bar;
    // Cambiar de idioma con los botones ES/EN de la cabecera actualiza los textos de la barra.
    new MutationObserver(renderBar).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
    renderBar();
  }

  function renderBar(msg) {
    var bar = state.ui.bar; if (!bar) return;
    if (typeof msg === 'string') state.msg = msg;
    bar.classList.toggle('sm-is-dirty', state.dirty);
    bar.querySelector('.sm-mode').textContent = state.editing ? t('editing') : t('viewing');
    bar.querySelector('.sm-status').textContent = state.msg || (state.dirty ? t('dirty') : t('clean'));
    var labels = { toggle: state.editing ? t('preview') : t('edit'), save: t('save'), discard: t('discard'), history: t('history'), help: t('help'), logout: t('logout'), reload: t('reload') };
    bar.querySelectorAll('button[data-a]').forEach(function (b) { b.textContent = labels[b.getAttribute('data-a')]; });
    bar.querySelector('[data-a="save"]').disabled = state.busy || !state.dirty || state.stale;
    bar.querySelector('[data-a="discard"]').disabled = state.busy || !state.dirty;
    var warn = bar.querySelector('.sm-warn');
    warn.hidden = !state.stale;
    warn.querySelector('span').textContent = t('stale');
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
          });
        } else {
          n.contentEditable = 'true';
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
  }

  function startEditing() {
    if (!state.authed) return openLogin();
    state.editing = true; state.msg = '';
    root.classList.add('sm-editing');
    document.querySelectorAll('[data-region] details').forEach(function (d) {
      if (!d.hasAttribute('data-sm-wasopen')) d.setAttribute('data-sm-wasopen', d.open ? '1' : '0');
      d.open = true;
    });
    markEditable();
    refreshTools();
    renderBar();
  }

  function stopEditing() {
    state.editing = false;
    root.classList.remove('sm-editing');
    select(null);
    document.querySelectorAll('[data-region] [contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); });
    document.querySelectorAll('[data-region] .sm-ui').forEach(function (n) { n.remove(); });
    renderBar();
  }

  /* ---------------- selección y barra de herramientas ---------------- */
  function toolbar() {
    if (state.ui.toolbar) return state.ui.toolbar;
    var tb = el('div', { class: 'sm-toolbar sm-chrome', role: 'toolbar' });
    var buttons = [
      ['bold', '<b>B</b>', 'tBold'], ['italic', '<i>I</i>', 'tItalic'], ['link', '🔗', 'tLink'], '|',
      ['up', '↑', 'tUp'], ['down', '↓', 'tDown'], ['dup', '⧉', 'tDup'], ['del', '🗑', 'tDel'], '|',
      ['parent', '⤴', 'tParent']
    ];
    buttons.forEach(function (b) {
      if (b === '|') { tb.appendChild(el('span', { class: 'sm-sep' })); return; }
      var btn = el('button', { type: 'button', 'data-t': b[0], 'data-tip': b[2] }, b[1]);
      tb.appendChild(btn);
    });
    // mousedown sin foco: así no se pierde la selección del texto al pulsar.
    tb.addEventListener('mousedown', function (e) { e.preventDefault(); });
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-t]'); if (!b) return;
      ({ bold: function () { format('bold'); }, italic: function () { format('italic'); }, link: editLink,
        up: function () { move(-1); }, down: function () { move(1); }, dup: duplicate, del: removeItem, parent: selectParent })[b.getAttribute('data-t')]();
    });
    document.body.appendChild(tb);
    state.ui.toolbar = tb;
    return tb;
  }

  function select(item) {
    document.querySelectorAll('.sm-selected').forEach(function (n) { n.classList.remove('sm-selected'); });
    state.current = item;
    var tb = toolbar();
    if (!item) { tb.classList.remove('sm-show'); return; }
    group(item).forEach(function (n) { n.classList.add('sm-selected'); });
    tb.querySelectorAll('button[data-tip]').forEach(function (b) { b.title = t(b.getAttribute('data-tip')); b.setAttribute('aria-label', b.title); });
    tb.classList.add('sm-show');
    positionToolbar();
  }

  function positionToolbar() {
    var tb = state.ui.toolbar, item = state.current;
    if (!tb || !item || !item.isConnected) return;
    var target = visible(group(item)) || item;
    var r = target.getBoundingClientRect();
    var top = r.top + window.scrollY - tb.offsetHeight - 10;
    if (r.top - tb.offsetHeight - 10 < 80) top = r.bottom + window.scrollY + 10; // no taparlo con la cabecera
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

  function itemFor(target) {
    var item = target.closest(ITEM_SEL);
    return item && inRegion(item) ? item : null;
  }

  function format(cmd) {
    var sel = window.getSelection();
    if (!sel.rangeCount || !inRegion(sel.anchorNode && sel.anchorNode.parentElement)) return;
    document.execCommand(cmd, false, null);
    setDirty();
  }

  function editLink() {
    var sel = window.getSelection();
    var node = sel.rangeCount ? sel.anchorNode : null;
    var a = node && (node.nodeType === 1 ? node : node.parentElement).closest('a');
    if (!a && state.current && state.current.matches('a')) a = state.current;
    if (a && inRegion(a)) {
      var url = window.prompt(a.classList.contains('btn') ? t('linkPromptBtn') : t('linkPrompt'), a.getAttribute('href') || '');
      if (url === null) return;
      url = url.trim();
      if (!url) {
        if (a.classList.contains('btn')) return;
        while (a.firstChild) a.parentNode.insertBefore(a.firstChild, a);
        a.remove();
      } else {
        a.setAttribute('href', url); externalize(a);
      }
      setDirty();
      return;
    }
    if (!sel.rangeCount || sel.isCollapsed || !inRegion(node.parentElement)) { window.alert(t('selectText')); return; }
    var range = sel.getRangeAt(0);
    var href = window.prompt(t('linkPrompt'), 'https://');
    if (!href || !href.trim() || href.trim() === 'https://') return;
    sel.removeAllRanges(); sel.addRange(range);
    document.execCommand('createLink', false, href.trim());
    var made = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement).closest('a');
    if (made) externalize(made);
    setDirty();
  }
  function externalize(a) {
    if (/^https?:/i.test(a.getAttribute('href'))) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    else { a.removeAttribute('target'); a.removeAttribute('rel'); }
  }

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
    setDirty(); select(item);
    var tgt = visible(g); if (tgt) tgt.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setTimeout(positionToolbar, 350);
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
    markEditable(); refreshTools(); setDirty();
    var idx = g.indexOf(item);
    select(clones[idx]);
  }

  function removeItem() {
    var item = state.current; if (!item) return;
    if (item.matches(CONTAINER_SEL) && !window.confirm(t('confirmDelete'))) return;
    group(item).forEach(function (n) { n.remove(); });
    select(null); setDirty();
  }

  function selectParent() {
    var item = state.current; if (!item) return;
    var up = item.parentElement && item.parentElement.closest(ITEM_SEL + ', ' + CONTAINER_SEL);
    if (up && inRegion(up) && !up.matches('[data-region]')) {
      select(up); up.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); setTimeout(positionToolbar, 350);
    }
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
      c.querySelectorAll('.sm-selected').forEach(function (n) { n.classList.remove('sm-selected'); });
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
    state.busy = true; renderBar(t('saving'));
    var files = Object.keys(state.pending).map(function (k) { return state.pending[k]; });
    api('save', { regions: serialize(), files: files, base: state.deployed }).then(function () {
      state.busy = false; state.dirty = false; state.pending = {};
      // La página publicada tardará un poco en reflejar este guardado.
      state.deployed = null;
      try { sessionStorage.setItem('sm-saved-at', String(Date.now())); } catch (e) {}
      renderBar(t('saved'));
    }).catch(function (e) {
      state.busy = false;
      if (e.status === 401) { state.authed = false; state.retrySave = true; renderBar(t('expired')); openLogin(); }
      else if (e.status === 409) { state.stale = true; renderBar(t('staleSave')); }
      else renderBar(t('saveError') + e.message);
    });
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
            api('history', { sha: v.sha }).then(function () { close(); state.dirty = false; state.stale = true; renderBar(t('restored')); })
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
    if (!state.editing || isUI(e.target)) return;
    var region = inRegion(e.target);
    if (!region) { if (!e.target.closest('.sm-toolbar')) select(null); return; }
    // En modo edición los enlaces y los desplegables no navegan: se editan.
    if (e.target.closest('a, summary')) e.preventDefault();
    select(itemFor(e.target));
  }, true);

  document.addEventListener('input', function (e) { if (state.editing && inRegion(e.target)) setDirty(); });

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
  window.addEventListener('beforeunload', function (e) { if (state.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------------- arranque ---------------- */
  injectCSS();
  window.SM_EDITOR = { openLogin: openLogin };
  var wantsLogin = location.hash === '#acceso';
  checkSession().then(function () {
    clearHash();
    showBar();
    if (wantsLogin) startEditing();
  }).catch(function () {
    state.authed = false;
    if (wantsLogin) openLogin();
  });
})();
