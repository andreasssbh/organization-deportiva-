// POST /api/logout → cierra la sesión del editor
'use strict';
const auth = require('./_lib/auth');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  auth.clearSession(req, res);
  res.status(200).json({ ok: true });
};
