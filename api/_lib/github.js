// Guardado en el repositorio de GitHub: cada «Guardar» del editor crea un
// commit en la rama de producción, y Vercel vuelve a publicar el sitio solo.
// Así los cambios son permanentes, quedan en el historial (se pueden
// deshacer) y nunca se pisan con los cambios hechos en el código.
'use strict';

const API = 'https://api.github.com';

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO || 'andreasssbh/organization-deportiva-';
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token) throw new Error('GITHUB_TOKEN no está configurado');
  return { token, repo, branch };
}

async function gh(path, options) {
  const { token, repo } = config();
  const res = await fetch(API + '/repos/' + repo + path, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'organizaciondeportiva-editor'
    }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error('GitHub ' + res.status + ': ' + (body.message || ''));
    err.status = res.status;
    throw err;
  }
  return body;
}

// Sube un archivo como objeto «blob» de Git (aún sin commit). El commit se
// hace al guardar, junto con el resto de cambios.
async function createBlob(base64) {
  const blob = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: base64, encoding: 'base64' }) });
  return blob.sha;
}

async function headSha() {
  const { branch } = config();
  const head = await gh('/git/ref/heads/' + encodeURIComponent(branch).replace(/%2F/g, '/'));
  return head.object.sha;
}

async function readFile(path) {
  const commitSha = await headSha();
  const commit = await gh('/git/commits/' + commitSha);
  const file = await gh('/contents/' + path + '?ref=' + commitSha);
  return { commitSha, treeSha: commit.tree.sha, text: Buffer.from(file.content, 'base64').toString('utf8') };
}

// files: [{ path, content }] (texto) o [{ path, sha }] (blob ya subido)
async function commitFiles(base, files, message) {
  const { branch } = config();
  const tree = await gh('/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      base_tree: base.treeSha,
      tree: files.map((f) => (f.sha
        ? { path: f.path, mode: '100644', type: 'blob', sha: f.sha }
        : { path: f.path, mode: '100644', type: 'blob', content: f.content }))
    })
  });
  const commit = await gh('/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [base.commitSha] })
  });
  // force:false → si alguien guardó entretanto, GitHub rechaza y se reintenta.
  await gh('/git/refs/heads/' + branch, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
  return commit.sha;
}

async function listCommits(path, limit) {
  const { branch } = config();
  return gh('/commits?sha=' + encodeURIComponent(branch) + '&path=' + encodeURIComponent(path) + '&per_page=' + (limit || 20));
}

module.exports = { config, headSha, createBlob, readFile, commitFiles, listCommits };
