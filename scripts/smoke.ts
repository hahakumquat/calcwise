/**
 * Post-build safety and SEO checks on dist/. Run after `npm run build`.
 * Fails (exit 1) on anything that would hurt search, ads or the live site.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';
const ADS_TXT = 'google.com, pub-7888535375567084, DIRECT, f08c47fec0942fa0';
const AD_CLIENT = 'ca-pub-7888535375567084';
const MIN_PAGES = 140; // guard against accidentally dropping pages

const problems: string[] = [];
const fail = (m: string) => problems.push(m);

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

if (!existsSync(DIST)) {
  console.error('dist/ missing — run npm run build first');
  process.exit(1);
}

const NAMED: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) =>
    e[0] === '#' ? String.fromCodePoint(parseInt(e[1].toLowerCase() === 'x' ? e.slice(2) : e.slice(1), e[1].toLowerCase() === 'x' ? 16 : 10)) : (NAMED[e] ?? m),
  );
const pages = walk(DIST);
const titles = new Map<string, string>();
const adsEnv = !!process.env.PUBLIC_ADSENSE_CLIENT;

for (const file of pages) {
  const s = readFileSync(file, 'utf8');
  const rel = file.slice(DIST.length + 1);
  const title = decode(s.match(/<title>(.*?)<\/title>/)?.[1] ?? '');
  const desc = decode(s.match(/name="description" content="([^"]*)"/)?.[1] ?? '');
  const noindex = s.includes('name="robots" content="noindex"');
  if (!title) fail(`${rel}: missing <title>`);
  if (title.length > 60) fail(`${rel}: title ${title.length} chars (max 60): ${title}`);
  if (!noindex) {
    if (desc.length < 70 || desc.length > 160) fail(`${rel}: meta description ${desc.length} chars (want 70–160)`);
    if (!s.includes('rel="canonical"')) fail(`${rel}: missing canonical`);
    if (titles.has(title)) fail(`${rel}: duplicate title with ${titles.get(title)}`);
    titles.set(title, rel);
  }
  const h1 = (s.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) fail(`${rel}: ${h1} <h1> elements (want 1)`);
  if (!s.includes('og:image')) fail(`${rel}: missing og:image`);
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch {
      fail(`${rel}: invalid JSON-LD`);
    }
  }
  if (adsEnv && !s.includes(`adsbygoogle.js?client=${AD_CLIENT}`)) fail(`${rel}: AdSense script missing`);
  if ((s.match(/class="adsbygoogle"/g) ?? []).length > 3) fail(`${rel}: more than 3 ad slots`);
}

if (pages.length < MIN_PAGES) fail(`only ${pages.length} pages built (expected ≥ ${MIN_PAGES})`);

const ads = existsSync(join(DIST, 'ads.txt')) ? readFileSync(join(DIST, 'ads.txt'), 'utf8').trim() : '';
if (ads !== ADS_TXT) fail('ads.txt missing or changed');

const sitemap = existsSync(join(DIST, 'sitemap.xml')) ? readFileSync(join(DIST, 'sitemap.xml'), 'utf8') : '';
const locs = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
if (locs.length < MIN_PAGES - 5) fail(`sitemap has only ${locs.length} URLs`);
for (const loc of locs) if (!existsSync(join(DIST, loc, 'index.html'))) fail(`sitemap URL has no page: ${loc}`);
if (!existsSync(join(DIST, 'privacy', 'index.html'))) fail('privacy page missing');

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`${pages.length} pages checked, 0 problem(s).`);
