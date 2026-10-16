// GET /api/session → ¿hay una sesión de editor válida?
// Si la hay, indica también qué versión está publicada (deployed) y cuál es la
// última guardada en GitHub (latest): si no coinciden, aún se está publicando
// un cambio y el editor avisa antes de dejar guardar encima.
'use strict';
const auth = require('./_lib/auth');
const github = require('./_lib/github');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!auth.isAuthenticated(req)) {
    auth.clearSession(req, res);
    return res.status(401).json({ ok: false, configured: auth.configured() });
  }
  const out = { ok: true, deployed: process.env.VERCEL_GIT_COMMIT_SHA || null, latest: null };
  try { out.latest = await github.headSha(); } catch (e) { console.error(e); }
  res.status(200).json(out);
};
