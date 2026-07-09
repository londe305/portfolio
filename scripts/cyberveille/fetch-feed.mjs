/* =====================================================
   fetch-feed.mjs — Collecte planifiée des flux RSS cybersécurité.

   Exécuté par .github/workflows/cyberveille-feed.yml (cron).
   Récupère les sources listées dans sources.json, déduplique,
   tague CVE/sévérité, fusionne avec l'historique existant,
   purge tout ce qui date de plus de 7 jours, puis écrit
   ../../data/cyber-feed.json + cyber-meta.json.

   Un flux en échec est loggé dans cyber-meta.json et ignoré :
   il ne doit jamais interrompre la collecte des autres.
===================================================== */

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Parser from 'rss-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const FEED_FILE = path.join(DATA_DIR, 'cyber-feed.json');
const META_FILE = path.join(DATA_DIR, 'cyber-meta.json');

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const MAX_ITEMS = 400;
const FETCH_TIMEOUT_MS = 15000;

const CVE_RE = /CVE-\d{4}-\d{4,7}/gi;
const CRITICAL_KEYWORDS = [
  'critical', 'critique', 'zero-day', '0-day', 'actively exploited',
  'exploité activement', 'ransomware', 'breach', 'compromise',
  'faille critique', 'urgent', 'emergency patch'
];

// Certains sites (ex. CISA) bloquent les requêtes sans en-tête User-Agent
// de type navigateur via leur pare-feu applicatif.
const parser = new Parser({
  timeout: FETCH_TIMEOUT_MS,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CyberveilleBot/1.0; +https://github.com/)' }
});

function normalizeTitle(title) {
  return (title || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashId(link, title) {
  return createHash('sha1').update(link || title || '').digest('hex').slice(0, 16);
}

function detectSeverity(text, category) {
  const cveIds = [...new Set((text.match(CVE_RE) || []).map(c => c.toUpperCase()))];
  const lower = text.toLowerCase();
  const isCritical = category === 'alert' || CRITICAL_KEYWORDS.some(k => lower.includes(k));
  const severity = isCritical ? 'critical' : (cveIds.length ? 'cve' : 'normal');
  return { cveIds, severity };
}

async function fetchOneSource(source) {
  try {
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).slice(0, 20).map(item => {
      const title = (item.title || 'Sans titre').trim();
      const link = item.link || item.guid || '';
      const pubDate = item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : null);
      const summary = (item.contentSnippet || item.summary || '').trim().slice(0, 240);
      const { cveIds, severity } = detectSeverity(`${title} ${summary}`, source.category);
      return {
        id: hashId(link, title),
        title,
        link,
        source: source.name,
        category: source.category,
        pubDate,
        summary,
        cveIds,
        severity,
        titleKey: normalizeTitle(title)
      };
    }).filter(item => item.link && item.pubDate);
    return { name: source.name, ok: true, itemCount: items.length, items };
  } catch (err) {
    return { name: source.name, ok: false, itemCount: 0, items: [], error: err.message };
  }
}

async function loadExisting() {
  try {
    const raw = await readFile(FEED_FILE, 'utf-8');
    const items = JSON.parse(raw);
    // titleKey n'est pas persisté en sortie (voir main()) : on le recalcule
    // ici pour que la dédup par titre reste symétrique entre anciens et
    // nouveaux items d'un run à l'autre.
    return items.map(item => ({ ...item, titleKey: normalizeTitle(item.title) }));
  } catch {
    return [];
  }
}

function dedupe(items) {
  const byLink = new Map();
  const seenTitles = new Set();
  for (const item of items) {
    if (byLink.has(item.link)) continue;
    if (item.titleKey && seenTitles.has(item.titleKey)) continue;
    byLink.set(item.link, item);
    if (item.titleKey) seenTitles.add(item.titleKey);
  }
  return [...byLink.values()];
}

async function main() {
  const sources = JSON.parse(await readFile(path.join(__dirname, 'sources.json'), 'utf-8'));
  const results = await Promise.allSettled(sources.map(fetchOneSource));

  const fetched = results.flatMap(r => (r.status === 'fulfilled' ? r.value.items : []));
  const statuses = results.map(r => (r.status === 'fulfilled'
    ? { name: r.value.name, ok: r.value.ok, itemCount: r.value.itemCount, error: r.value.error || null }
    : { name: 'unknown', ok: false, itemCount: 0, error: r.reason?.message || 'unknown error' }));

  const existing = await loadExisting();
  const cutoff = Date.now() - RETENTION_MS;

  const merged = dedupe([...fetched, ...existing])
    .filter(item => item.pubDate && new Date(item.pubDate).getTime() >= cutoff)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, MAX_ITEMS)
    .map(({ titleKey, ...rest }) => rest); // titleKey ne sert qu'à la dédup, pas utile en sortie

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(FEED_FILE, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
  await writeFile(META_FILE, JSON.stringify({
    lastRun: new Date().toISOString(),
    totalItems: merged.length,
    sources: statuses
  }, null, 2) + '\n', 'utf-8');

  console.log(`[cyberveille] ${merged.length} articles conservés (fenêtre 7 jours). Sources: ${
    statuses.map(s => `${s.name}=${s.ok ? s.itemCount : 'ÉCHEC'}`).join(', ')
  }`);
}

main().catch(err => {
  console.error('[cyberveille] Échec fatal du script:', err);
  process.exit(1);
});
