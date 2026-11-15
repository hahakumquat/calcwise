/**
 * Media helpers for marketing: capture the real calculators and turn them into
 * vertical videos (Reels/TikTok), carousel slides and post images.
 *
 * Runs in GitHub Actions (.github/workflows/media.yml), which installs Playwright's
 * Chromium and ffmpeg. A day's `render.mjs` on the `marketing` branch imports this file:
 *
 *   import { reel, slide, cover, shareCard, done } from '../main/scripts/media/lib.mjs';
 *
 * Every capture loads https://cappycalc.com (or MEDIA_BASE) with inputs set via the URL,
 * exactly like the site's "Copy link" button, so every number shown is real.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const BASE = process.env.MEDIA_BASE ?? 'https://cappycalc.com';
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';
const ACCENT = '#5b4fe0';
const INTER = 'https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5.1.0/files/inter-latin-wght-normal.woff2';

let browser;
async function getBrowser() {
  browser ??= await chromium.launch();
  return browser;
}
/** Call once at the end of render.mjs. */
export async function done() {
  await browser?.close();
}

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const url = (path, set = {}) => {
  const u = new URL(path, BASE);
  for (const [k, v] of Object.entries(set)) u.searchParams.set(k, String(v));
  return u.href;
};

/**
 * Screenshot a calculator in a phone viewport.
 * @param {object} o
 * @param {string} o.path       e.g. '/finance/401k-max-out/'
 * @param {object} [o.set]      input values by input id, e.g. { salary: 85000, frequency: 'biweekly' }
 * @param {string} [o.focus]    CSS selector to scroll to the top of the view: 'stage' (result card, default), 'form' (inputs), 'chart', or any selector
 * @param {boolean} [o.dark]
 * @param {number} [o.height]   viewport height in CSS px (width is 390)
 * @returns {Promise<Buffer>}   PNG at 3x pixel density
 */
export async function capture({ path, set = {}, focus = 'stage', dark = false, height }) {
  const b = await getBrowser();
  const ctx = await b.newContext({ viewport: { width: 390, height: height ?? 560 }, deviceScaleFactor: 3, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    // Hide ads and the floating result pill in marketing captures.
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '.adsbygoogle,.ad-wrap,.google-auto-placed,[data-peek],.site-header,.skip,[data-action="share-image"],.copy{display:none!important}';
      document.head.append(s);
    });
  });
  await page.goto(url(path, set), { waitUntil: 'networkidle' });
  const sel = { stage: '[data-stage]', form: 'form.calc-inputs', chart: '[data-hero-chart], [data-charts] svg' }[focus] ?? focus;
  await page.waitForTimeout(900); // count-up and chart tween settle
  await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 16);
  }, sel);
  await page.waitForTimeout(400);
  const png = await page.screenshot();
  await ctx.close();
  return png;
}

/** Compose an HTML frame and screenshot it at an exact pixel size. */
async function compose(html, [w, h]) {
  const b = await getBrowser();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot();
  await ctx.close();
  return png;
}

const logo = `<i><svg width="26" height="26" viewBox="0 0 32 32"><path d="M10 11h12M10 16h5M17 16h5M10 21h5M17 21h5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg></i>`;
/** Caption text: wrap a phrase in *asterisks* to colour it. */
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');

/**
 * Lay out one frame: brand, caption, optional subline and the phone capture, in normal flow so
 * nothing overlaps. Text-only frames centre the text. `safe` = [top, bottom] px kept clear of app UI.
 */
function frame({ W, H, caption, sub, shot, dark, safe = [72, 72], cardW = 0.72, capSize, landscape = false }) {
  const pad = Math.round(W * 0.066);
  const textOnly = !shot;
  const len = (caption ?? '').length;
  const cs = capSize ?? Math.round((textOnly ? 1.25 : 1) * (landscape ? 56 : W >= 1080 && H >= 1900 ? (len > 48 ? 66 : 78) : len > 48 ? 54 : 62));
  const bg = dark ? '#14141c' : '#f7f7fb';
  const html = `<style>
  @font-face{font-family:Inter;src:url(${INTER}) format('woff2');font-weight:100 900}
  *{margin:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{font-family:Inter,system-ui,sans-serif;background:${bg};color:${dark ? '#f2f2f7' : '#17171f'};position:relative}
  .glow{position:absolute;inset:0;background:radial-gradient(${W * 0.85}px ${H * 0.45}px at 100% 0%,${dark ? 'rgba(91,79,224,.35)' : 'rgba(91,79,224,.16)'},transparent 70%),radial-gradient(${W * 0.75}px ${H * 0.35}px at 0% 100%,${dark ? 'rgba(180,80,200,.22)' : 'rgba(180,80,200,.10)'},transparent 70%)}
  .wrap{position:absolute;left:${pad}px;right:${pad}px;top:${safe[0]}px;bottom:${safe[1]}px;display:flex;flex-direction:${landscape ? 'row' : 'column'};gap:${landscape ? 56 : 30}px;align-items:${landscape ? 'center' : 'stretch'}}
  .text{display:flex;flex-direction:column;gap:18px;${landscape ? 'flex:1;align-self:stretch' : ''}${textOnly ? 'flex:1' : ''}}
  .text .body{display:flex;flex-direction:column;gap:18px;${textOnly || landscape ? 'flex:1;justify-content:center' : ''}}
  .brand{display:flex;align-items:center;gap:14px;font-weight:700;font-size:${Math.round(Math.min(W, H) * 0.03)}px;letter-spacing:-0.02em}
  .brand i{width:${Math.round(Math.min(W, H) * 0.042)}px;height:${Math.round(Math.min(W, H) * 0.042)}px;border-radius:${Math.round(Math.min(W, H) * 0.012)}px;background:${ACCENT};display:grid;place-items:center}
  .cap{font-weight:800;letter-spacing:-0.03em;line-height:1.08;font-size:${cs}px}
  .sub{font-weight:500;line-height:1.35;opacity:.72;font-size:${Math.round(cs * 0.45)}px}
  .hl{color:${ACCENT}}
  .card{${landscape ? `width:${Math.round(W * 0.34)}px;max-height:100%` : `width:${Math.round(W * cardW)}px;align-self:center;flex:0 1 auto;min-height:0`};border-radius:${Math.round(W * 0.04)}px;overflow:hidden;background:${bg};box-shadow:0 40px 90px -30px rgba(40,30,120,.45);border:1px solid ${dark ? '#2a2a38' : '#e4e4ee'}}
  .card img{display:block;width:100%}
  </style><div class="glow"></div>
  <div class="wrap">
    <div class="text">
      <div class="brand">${logo}CappyCalc</div>
      <div class="body">
        ${caption ? `<div class="cap">${rich(caption)}</div>` : ''}
        ${sub ? `<div class="sub">${esc(sub)}</div>` : ''}
      </div>
    </div>
    ${shot ? `<div class="card"><img src="data:image/png;base64,${shot.toString('base64')}"></div>` : ''}
  </div>`;
  return compose(html, [W, H]);
}

/** One vertical (1080×1920) scene. Top 150px and bottom 330px stay clear of Reels/TikTok UI. */
const sceneFrame = ({ caption, sub, shot, dark }) => frame({ W: 1080, H: 1920, caption, sub, shot, dark, safe: [150, 330] });

/**
 * Build a vertical video from scenes. Each scene shows a real calculator state with a caption,
 * held with a slow push-in, joined by short crossfades. Output: 1080×1920 H.264 MP4, 30 fps,
 * silent AAC track (pick a trending sound in-app when posting).
 * @param {string} out  output path, e.g. new URL('./reel.mp4', import.meta.url).pathname
 * @param {Array<{path?:string,set?:object,focus?:string,caption?:string,sub?:string,seconds?:number,dark?:boolean,height?:number}>} scenes
 *   A scene without `path` is a text-only card (good for the hook and the end card).
 */
export async function reel(out, scenes, { dark = false } = {}) {
  const tmp = join(tmpdir(), `reel-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  const fps = 30, fade = 0.35;
  const inputs = [], durs = [];
  for (const [i, s] of scenes.entries()) {
    const shot = s.path ? await capture({ ...s, dark: s.dark ?? dark }) : null;
    const png = await sceneFrame({ caption: s.caption, sub: s.sub, shot, dark: s.dark ?? dark });
    const f = join(tmp, `s${i}.png`);
    writeFileSync(f, png);
    inputs.push(f);
    durs.push(s.seconds ?? 2.5);
  }
  const args = ['-y'];
  inputs.forEach((f, i) => args.push('-loop', '1', '-t', String(durs[i] + fade), '-i', f));
  args.push('-f', 'lavfi', '-t', String(durs.reduce((a, b) => a + b, 0) + fade), '-i', 'anullsrc=r=44100:cl=stereo');
  const parts = inputs.map((_, i) => {
    const frames = Math.round((durs[i] + fade) * fps);
    return `[${i}:v]scale=2160:3840,zoompan=z='1+0.05*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${fps},setsar=1,format=yuv420p[v${i}]`;
  });
  let last = 'v0', t = 0;
  for (let i = 1; i < inputs.length; i++) {
    t += durs[i - 1];
    parts.push(`[${last}][v${i}]xfade=transition=fade:duration=${fade}:offset=${t.toFixed(3)}[x${i}]`);
    last = `x${i}`;
  }
  args.push('-filter_complex', parts.join(';'), '-map', `[${last}]`, '-map', `${inputs.length}:a`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', resolve(out));
  mkdirSync(dirname(resolve(out)), { recursive: true });
  execFileSync(FFMPEG, ['-loglevel', 'error', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
  rmSync(tmp, { recursive: true, force: true });
  // Contact sheet of 6 evenly spaced frames, so the video can be reviewed as an image.
  const total = Math.round(durs.reduce((a, b) => a + b, 0) * fps);
  const preview = resolve(out).replace(/\.mp4$/i, '') + '-preview.jpg';
  execFileSync(FFMPEG, ['-loglevel', 'error', '-y', '-i', resolve(out), '-vf', `select='not(mod(n\\,${Math.max(1, Math.floor(total / 6))}))',scale=270:-1,tile=6x1`, '-frames:v', '1', '-q:v', '3', preview]);
  return { out, preview, seconds: durs.reduce((a, b) => a + b, 0), bytes: statSync(out).size };
}

/**
 * A carousel slide or post image (default 1080×1350, Instagram 4:5) of a real calculator state.
 * Use size [1080,1080] for square, [1600,900] for X.
 */
export async function slide(out, { path, set, focus = 'stage', caption, sub, dark = false, size = [1080, 1350], height }) {
  const [W, H] = size;
  const landscape = W > H;
  const shot = path ? await capture({ path, set, focus, dark, height: height ?? (landscape ? 620 : 640) }) : null;
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(out, await frame({ W, H, caption, sub, shot, dark, landscape, safe: landscape ? [56, 56] : [64, 64], cardW: 0.64 }));
  return out;
}

/** A text-only cover/end slide. */
export async function cover(out, { title, sub, dark = false, size = [1080, 1350] }) {
  const [W, H] = size;
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(out, await frame({ W, H, caption: title, sub, dark, safe: [72, 90], landscape: W > H }));
  return out;
}

/** The site's own 1080×1920 "Share" result image (great for Stories), for a calculator state. */
export async function shareCard(out, { path, set = {}, dark = false }) {
  const b = await getBrowser();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: dark ? 'dark' : 'light', acceptDownloads: true });
  const page = await ctx.newPage();
  await page.goto(url(path, set), { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-action="share-image"]')]);
  mkdirSync(dirname(resolve(out)), { recursive: true });
  await dl.saveAs(out);
  await ctx.close();
  return out;
}
