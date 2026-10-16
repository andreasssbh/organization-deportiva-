// Sesión del editor: una cookie firmada (HMAC) con la fecha de caducidad.
// No hay base de datos de usuarios: la única cuenta es la del editor, cuya
// contraseña vive en la variable de entorno ADMIN_PASSWORD de Vercel.
// Cambiar ADMIN_PASSWORD invalida todas las sesiones abiertas.
'use strict';

const crypto = require('crypto');

const COOKIE = 'sm_session';
const MARKER = 'sm_editor'; // cookie visible desde JS: solo indica "cargar el editor"
const MAX_AGE = 60 * 60 * 12; // 12 h

function secret() {
  const pw = process.env.ADMIN_PASSWORD || '';
  return crypto.createHash('sha256').update('sm-session:' + pw + ':' + (process.env.SESSION_SECRET || '')).digest();
}

function configured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  if (x.length !== y.length) { crypto.timingSafeEqual(x, x); return false; }
  return crypto.timingSafeEqual(x, y);
}

function checkPassword(password) {
  if (!configured()) return false;
  // Comparar resúmenes para no filtrar la longitud de la contraseña.
  const h = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
  return safeEqual(h(password), h(process.env.ADMIN_PASSWORD));
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function isSecure(req) {
  return (req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

function setSession(req, res) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  const flags = '; Path=/; Max-Age=' + MAX_AGE + '; SameSite=Strict' + (isSecure(req) ? '; Secure' : '');
  res.setHeader('Set-Cookie', [
    COOKIE + '=' + exp + '.' + sign(exp) + flags + '; HttpOnly',
    MARKER + '=1' + flags
  ]);
}

function clearSession(req, res) {
  const flags = '; Path=/; Max-Age=0; SameSite=Strict' + (isSecure(req) ? '; Secure' : '');
  res.setHeader('Set-Cookie', [COOKIE + '=' + flags + '; HttpOnly', MARKER + '=' + flags]);
}

function isAuthenticated(req) {
  if (!configured()) return false;
  const raw = parseCookies(req)[COOKIE];
  if (!raw) return false;
  const [exp, sig] = raw.split('.');
  if (!exp || !sig || !safeEqual(sig, sign(exp))) return false;
  return Number(exp) > Date.now() / 1000;
}

// Las peticiones que modifican algo deben venir del propio sitio.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // navegadores antiguos; la cookie SameSite=Strict ya protege
  try { return new URL(origin).host === req.headers.host; } catch (e) { return false; }
}

function requireEditor(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return false; }
  if (!sameOrigin(req)) { res.status(403).json({ error: 'origin' }); return false; }
  if (!isAuthenticated(req)) { res.status(401).json({ error: 'auth' }); return false; }
  return true;
}

module.exports = { configured, checkPassword, setSession, clearSession, isAuthenticated, sameOrigin, requireEditor };
