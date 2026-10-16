// GET  /api/history           → últimas versiones guardadas de index.html
// POST /api/history { sha }   → vuelve a poner el contenido editable tal como estaba en esa versión
'use strict';
const auth = require('./_lib/auth');
const github = require('./_lib/github');
const { replaceRegions, extractRegions } = require('./_lib/regions');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      if (!auth.isAuthenticated(req)) return res.status(401).json({ error: 'auth' });
      const commits = await github.listCommits('index.html', 15);
      return res.status(200).json({
        versions: commits.map((c) => ({ sha: c.sha, date: c.commit.author.date, message: c.commit.message.split('\n')[0] }))
      });
    }
    if (!auth.requireEditor(req, res)) return;
    const sha = req.body && req.body.sha;
    if (!/^[0-9a-f]{40}$/.test(sha || '')) return res.status(400).json({ error: 'sha' });
    const { token, repo } = github.config();
    const old = await fetch('https://api.github.com/repos/' + repo + '/contents/index.html?ref=' + sha, {
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github.raw+json', 'User-Agent': 'organizaciondeportiva-editor' }
    });
    if (!old.ok) return res.status(404).json({ error: 'version' });
    const regions = extractRegions(await old.text());
    if (!Object.keys(regions).length) return res.status(409).json({ error: 'too-old' });
    const base = await github.readFile('index.html');
    const commit = await github.commitFiles(base, [{ path: 'index.html', content: replaceRegions(base.text, regions) }], 'Restaurar versión ' + sha.slice(0, 7) + ' (editor)');
    res.status(200).json({ ok: true, commit });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'history', detail: e.message });
  }
};
