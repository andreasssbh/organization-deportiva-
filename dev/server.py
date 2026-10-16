#!/usr/bin/env python3
"""Servidor local para probar el editor sin Vercel ni GitHub.

    python3 dev/server.py            → http://localhost:8787

Copia el sitio a .dev-site/ y lo sirve desde ahí; /api/* imita las funciones
de Vercel (api/*.js) guardando en esa copia en lugar de hacer commits, así que
el index.html del repositorio no se toca. La contraseña se lee de
ADMIN_PASSWORD en .env.local (ver .env.example).
"""
import base64, hashlib, hmac, http.server, json, os, re, shutil, threading, time, uuid
from http import cookies
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, '.dev-site')
PORT = int(os.environ.get('PORT', '8787'))
PUBLISH_DELAY = float(os.environ.get('PUBLISH_DELAY', '8'))
SERVER = None
REGIONS = ['nav', 'main', 'footer']
FILE_PATH = re.compile(r'^(images/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|gif)|apuntes/[a-z0-9][a-z0-9._-]*\.pdf)$')


def load_env():
    path = os.path.join(ROOT, '.env.local')
    if os.path.exists(path):
        for line in open(path, encoding='utf-8'):
            if '=' in line and not line.lstrip().startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ.setdefault(k, v.strip().strip('"'))


load_env()
PASSWORD = os.environ.get('ADMIN_PASSWORD', '')
SECRET = hashlib.sha256(('dev:' + PASSWORD).encode()).digest()
blobs = {}       # sha → bytes (subidos y aún sin guardar)
versions = []    # [{sha, date, message, html}]


def sign(v):
    return base64.urlsafe_b64encode(hmac.new(SECRET, v.encode(), 'sha256').digest()).decode().rstrip('=')


def sanitize(html):
    html = re.sub(r'<!--/?editable:[a-z]+-->', '', html, flags=re.I)
    html = re.sub(r'<(script|iframe|object|embed|style|form)\b[\s\S]*?</\1\s*>', '', html, flags=re.I)
    html = re.sub(r'</?(script|iframe|object|embed|style|link|meta|base|form)\b[^>]*>', '', html, flags=re.I)
    html = re.sub(r'\s+on[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)', '', html, flags=re.I)
    html = re.sub(r'\s(href|src|data-src|data-file|action|formaction)\s*=\s*("|\')\s*(javascript|vbscript|data):[^"\']*\2', r' \1="#"', html, flags=re.I)
    return re.sub(r'\scontenteditable(="[^"]*")?', '', html, flags=re.I)


def replace_regions(src, regions):
    for name in REGIONS:
        if name not in regions:
            continue
        o, c = '<!--editable:%s-->' % name, '<!--/editable:%s-->' % name
        a, b = src.find(o), src.find(c)
        if a < 0 or b < a:
            raise ValueError('markers:' + name)
        src = src[:a + len(o)] + '\n' + sanitize(regions[name]).strip() + '\n' + src[b:]
    return src


def extract_regions(src):
    out = {}
    for name in REGIONS:
        o, c = '<!--editable:%s-->' % name, '<!--/editable:%s-->' % name
        a, b = src.find(o), src.find(c)
        if a >= 0 and b > a:
            out[name] = src[a + len(o):b]
    return out


def index_path():
    return os.path.join(SITE, 'index.html')


def commit(html, files, message):
    for path, data in files:
        full = os.path.join(SITE, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        open(full, 'wb').write(data)
    open(index_path(), 'w', encoding='utf-8').write(html)
    sha = hashlib.sha1(uuid.uuid4().bytes).hexdigest()
    versions.insert(0, {'sha': sha, 'date': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'message': message, 'html': html})
    # Como Vercel: la versión nueva se da por «publicada» unos segundos después del commit.
    threading.Timer(PUBLISH_DELAY, lambda: setattr(SERVER, 'deployed', sha)).start()
    return sha


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=SITE, **kw)

    def translate_path(self, path):
        # El editor se sirve siempre desde el repositorio, para ver los cambios al recargar.
        if urlparse(path).path.startswith('/admin/'):
            return os.path.join(ROOT, urlparse(path).path.lstrip('/'))
        return super().translate_path(path)

    def log_message(self, fmt, *args):
        if self.path.startswith('/api/'):
            super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    # --- utilidades ---
    def json(self, code, obj, set_cookies=()):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        for c in set_cookies:
            self.send_header('Set-Cookie', c)
        self.end_headers()
        self.wfile.write(body)

    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        return json.loads(self.rfile.read(n) or b'{}')

    def authed(self):
        if not PASSWORD:
            return False
        jar = cookies.SimpleCookie(self.headers.get('Cookie', ''))
        raw = jar['sm_session'].value if 'sm_session' in jar else ''
        if '.' not in raw:
            return False
        exp, sig = raw.split('.', 1)
        return hmac.compare_digest(sig, sign(exp)) and int(exp) > time.time()

    def session_cookies(self, clear=False):
        age = 0 if clear else 43200
        exp = str(int(time.time()) + age)
        flags = '; Path=/; Max-Age=%d; SameSite=Strict' % age
        return ['sm_session=%s%s; HttpOnly' % ('' if clear else exp + '.' + sign(exp), flags),
                'sm_editor=%s%s' % ('' if clear else '1', flags)]

    def head_sha(self):
        return versions[0]['sha'] if versions else 'initial'

    # --- rutas ---
    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/api/session':
            if not self.authed():
                return self.json(401, {'ok': False, 'configured': bool(PASSWORD)}, self.session_cookies(True))
            return self.json(200, {'ok': True, 'deployed': self.server.deployed, 'latest': self.head_sha()})
        if path == '/api/history':
            if not self.authed():
                return self.json(401, {'error': 'auth'})
            return self.json(200, {'versions': [{k: v[k] for k in ('sha', 'date', 'message')} for v in versions]})
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == '/api/login':
            if not PASSWORD:
                return self.json(503, {'error': 'not-configured'})
            pw = str(self.body().get('password', ''))
            if not hmac.compare_digest(hashlib.sha256(pw.encode()).digest(), hashlib.sha256(PASSWORD.encode()).digest()):
                time.sleep(1.2)
                return self.json(401, {'error': 'password'})
            return self.json(200, {'ok': True}, self.session_cookies())
        if path == '/api/logout':
            return self.json(200, {'ok': True}, self.session_cookies(True))
        if not self.authed():
            return self.json(401, {'error': 'auth'})
        body = self.body()
        if path == '/api/upload':
            data = body.get('data', '')
            raw = base64.b64decode(data)
            if len(raw) > 3.3 * 1024 * 1024:
                return self.json(413, {'error': 'too-large'})
            sha = hashlib.sha1(raw).hexdigest()
            blobs[sha] = raw
            return self.json(200, {'sha': sha})
        if path == '/api/save':
            if body.get('base') and body['base'] != self.head_sha():
                return self.json(409, {'error': 'stale'})
            files = []
            for f in body.get('files') or []:
                if not FILE_PATH.match(f.get('path', '')) or f.get('sha') not in blobs:
                    return self.json(400, {'error': 'file', 'path': f.get('path')})
                files.append((f['path'], blobs[f['sha']]))
            try:
                html = replace_regions(open(index_path(), encoding='utf-8').read(), body.get('regions') or {})
            except ValueError as e:
                return self.json(400, {'error': 'save', 'detail': str(e)})
            return self.json(200, {'ok': True, 'commit': commit(html, files, 'Edición desde el sitio (editor)')})
        if path == '/api/history':
            old = next((v for v in versions if v['sha'] == body.get('sha')), None)
            if not old:
                return self.json(404, {'error': 'version'})
            html = replace_regions(open(index_path(), encoding='utf-8').read(), extract_regions(old['html']))
            return self.json(200, {'ok': True, 'commit': commit(html, [], 'Restaurar versión %s (editor)' % old['sha'][:7])})
        return self.json(404, {'error': 'not-found'})


if __name__ == '__main__':
    if os.path.exists(SITE):
        shutil.rmtree(SITE)
    shutil.copytree(ROOT, SITE, ignore=shutil.ignore_patterns('.git', '.dev-site', '.env*', 'dev', 'api', 'node_modules'))
    versions.append({'sha': 'initial', 'date': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'message': 'Versión inicial',
                     'html': open(index_path(), encoding='utf-8').read()})
    if not PASSWORD:
        print('Aviso: ADMIN_PASSWORD no está definido en .env.local; el acceso estará desactivado.')
    srv = SERVER = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    srv.deployed = 'initial'
    print('Sitio de prueba en http://localhost:%d' % PORT)
    srv.serve_forever()
