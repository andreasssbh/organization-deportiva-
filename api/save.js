// POST /api/save  { regions: { nav, main, footer }, files: [{ path, sha }], base }
// Escribe los cambios del editor en index.html y crea un commit en GitHub.
'use strict';
const auth = require('./_lib/auth');
const github = require('./_lib/github');
const { replaceRegions } = require('./_lib/regions');

// Solo se pueden escribir fotos y PDF dentro de images/ y apuntes/.
const FILE_PATH = /^(images\/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|gif)|apuntes\/[a-z0-9][a-z0-9._-]*\.pdf)$/;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!auth.requireEditor(req, res)) return;
  const body = req.body || {};
  const regions = body.regions || {};
  const files = Array.isArray(body.files) ? body.files : [];
  for (const f of files) {
    if (!f || !FILE_PATH.test(f.path) || !/^[0-9a-f]{40}$/.test(f.sha)) return res.status(400).json({ error: 'file', path: f && f.path });
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const base = await github.readFile('index.html');
      // La página que tiene abierta el editor no es la última versión: guardar
      // encima borraría los cambios que se están publicando.
      if (body.base && body.base !== base.commitSha) return res.status(409).json({ error: 'stale' });
      const html = replaceRegions(base.text, regions);
      const changes = files.map((f) => ({ path: f.path, sha: f.sha }));
      if (html !== base.text) changes.push({ path: 'index.html', content: html });
      if (!changes.length) return res.status(200).json({ ok: true, unchanged: true });
      const sha = await github.commitFiles(base, changes, 'Edición desde el sitio (editor)');
      return res.status(200).json({ ok: true, commit: sha });
    } catch (e) {
      if (e.status === 422 && attempt < 2) continue; // la rama avanzó: reintentar sobre la última versión
      console.error(e);
      return res.status(e.message.startsWith('markers') || e.message.startsWith('region') ? 400 : 502).json({ error: 'save', detail: e.message });
    }
  }
};
