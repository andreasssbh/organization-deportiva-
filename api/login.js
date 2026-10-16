// POST /api/login  { password }  → abre la sesión del editor
'use strict';
const auth = require('./_lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!auth.sameOrigin(req)) return res.status(403).json({ error: 'origin' });
  if (!auth.configured()) return res.status(503).json({ error: 'not-configured' });
  const password = (req.body && req.body.password) || '';
  if (!auth.checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 1200)); // frena los intentos a ciegas
    return res.status(401).json({ error: 'password' });
  }
  auth.setSession(req, res);
  res.status(200).json({ ok: true });
};
