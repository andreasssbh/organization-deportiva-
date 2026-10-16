// POST /api/translate  { html, from: 'es'|'en', to: 'en'|'es' } → { html }
// Traduce un fragmento de la página al otro idioma para que la versión
// española y la inglesa sigan iguales cuando el editor cambia una de ellas.
// Usa Claude (variable ANTHROPIC_API_KEY en Vercel).
'use strict';
const Anthropic = require('@anthropic-ai/sdk').default;
const auth = require('./_lib/auth');
const { sanitize } = require('./_lib/regions');

const LANGS = { es: 'Spanish', en: 'English' };
const MAX_CHARS = 8000;
let client = null;

function systemPrompt(from, to) {
  return 'You translate content for the website of the Sport Management European Research Group, a university group ' +
    'working on sports organisation and management (lecture notes, research, teaching). The user sends one HTML fragment ' +
    'from the site in ' + LANGS[from] + '; reply with the same fragment in ' + LANGS[to] + '.\n\n' +
    'Keep every HTML tag, attribute and entity exactly as it is and where it is; translate only the human-readable text, ' +
    'including the text of links, but never URLs or email addresses. Keep names of people, institutions, projects, ' +
    'journals and books as they are, unless an established ' + LANGS[to] + ' name exists. Match the original register ' +
    '(academic, concise) and follow the punctuation and capitalisation conventions of ' + LANGS[to] + '. If the fragment ' +
    'is already in ' + LANGS[to] + ', or has nothing to translate, return it unchanged.\n\n' +
    'Reply with the translated fragment only: no explanation, no quotation marks, no code fences.';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!auth.requireEditor(req, res)) return;
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: 'not-configured' });
  const { html, from, to } = req.body || {};
  if (typeof html !== 'string' || !html.trim() || html.length > MAX_CHARS || !LANGS[from] || !LANGS[to] || from === to) {
    return res.status(400).json({ error: 'input' });
  }
  client = client || new Anthropic();
  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 8000,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: systemPrompt(from, to),
      messages: [{ role: 'user', content: html }]
    });
    if (response.stop_reason === 'refusal') return res.status(422).json({ error: 'refusal' });
    if (response.stop_reason === 'max_tokens') return res.status(413).json({ error: 'too-long' });
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
      .replace(/^```(?:html)?\s*/i, '').replace(/\s*```$/, '');
    if (!text) return res.status(502).json({ error: 'empty' });
    res.status(200).json({ html: sanitize(text) });
  } catch (e) {
    console.error(e);
    const status = e && e.status;
    res.status(status === 429 ? 429 : 502).json({ error: 'translate', detail: (e && e.message) || String(e) });
  }
};
