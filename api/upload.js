// POST /api/upload  { data: base64 } → { sha }
// Sube una foto o un PDF a GitHub (sin commit todavía). El archivo se publica
// al pulsar «Guardar», en el mismo commit que los textos.
'use strict';
const auth = require('./_lib/auth');
const github = require('./_lib/github');

// Vercel limita el cuerpo de la petición a 4,5 MB; en base64 eso son ~3,3 MB.
const MAX_BYTES = 3.3 * 1024 * 1024;

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!auth.requireEditor(req, res)) return;
  const data = req.body && req.body.data;
  if (typeof data !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(data)) return res.status(400).json({ error: 'data' });
  if (data.length * 0.75 > MAX_BYTES) return res.status(413).json({ error: 'too-large' });
  try {
    res.status(200).json({ sha: await github.createBlob(data) });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'github', detail: e.message });
  }
};
