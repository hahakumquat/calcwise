/**
 * "Share" → a 1080×1920 (9:16) PNG of the current result, made for stories, TikTok photo posts and group chats.
 * Drawn with Canvas 2D in the page's current theme; the main chart is the live SVG with its computed styles inlined.
 * Uses the native share sheet when the browser can share files, otherwise downloads the PNG.
 */
import type { Calculator, ComputeResult } from '../lib/types';
import { renderChart, toChartList, type UnitResolver } from '../lib/chart';
import { CATEGORY_BY_ID } from '../lib/categories';
import { SITE } from '../lib/site';
import { path } from '../lib/paths';

const W = 1080;
const H = 1920;
const PAD = 84;
const FONT = '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

interface Opts {
  root: HTMLElement;
  calc: Calculator;
  result: ComputeResult;
  unitFor: UnitResolver;
}

/** Resolve any CSS colour (oklch, color-mix, var…) to an rgba() string canvas and SVG-as-image both understand. */
function makeResolver(scope: HTMLElement) {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  scope.appendChild(probe);
  const c = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
  c.canvas.width = c.canvas.height = 1;
  const toRgba = (css: string) => {
    c.clearRect(0, 0, 1, 1);
    c.fillStyle = '#000';
    c.fillStyle = css;
    c.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = c.getImageData(0, 0, 1, 1).data;
    return `rgba(${r},${g},${b},${+(a / 255).toFixed(3)})`;
  };
  const resolve = (value: string) => {
    probe.style.color = value;
    return toRgba(getComputedStyle(probe).color);
  };
  return { resolve, toRgba, done: () => probe.remove() };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Word-wrap `text` to `maxW`, at most `maxLines` lines (ellipsis on overflow). Returns the lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxW) line = test;
    else {
      if (line) lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && words.join(' ') !== lines.join(' ')) {
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }
  return lines;
}

/** Largest font size (≤ max) at which `text` fits in `maxW`. */
function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, max: number, min: number, maxW: number) {
  let size = max;
  for (; size > min; size -= 4) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= maxW) break;
  }
  ctx.font = `${weight} ${size}px ${FONT}`;
  return size;
}

const STYLE_PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'visibility', 'display'];

/** Render the chart offscreen at `width`, inline its computed styles, and return it as an <img> plus legend entries. */
async function chartImage(opts: Opts, width: number, colors: ReturnType<typeof makeResolver>) {
  const spec = toChartList(opts.result.chart)[0];
  if (!spec) return null;
  const host = document.createElement('div');
  host.style.cssText = `position:absolute;left:-10000px;top:0;width:${width}px;`;
  opts.root.querySelector('.calc-results')!.appendChild(host);
  try {
    host.innerHTML = renderChart(spec, { width, unitFor: opts.unitFor }).html;
    const svg = host.querySelector('svg');
    if (!svg) return null;
    const legend = [...host.querySelectorAll<HTMLElement>('.chart-legend span')].map((s) => ({
      name: s.textContent?.trim() ?? '',
      color: colors.toRgba(getComputedStyle(s.querySelector('i')!).backgroundColor),
    }));
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const src = [svg, ...svg.querySelectorAll('*')];
    const dst = [clone, ...clone.querySelectorAll('*')];
    src.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const style = STYLE_PROPS.map((p) => {
        let v = cs.getPropertyValue(p);
        if (!v) return '';
        if ((p === 'fill' || p === 'stroke') && v !== 'none' && !v.startsWith('url(')) v = colors.toRgba(v);
        return `${p}:${v}`;
      })
        .filter(Boolean)
        .join(';');
      dst[i].setAttribute('style', `${style};font-family:Helvetica,Arial,sans-serif`);
      dst[i].removeAttribute('class');
    });
    clone.querySelectorAll('.hover, [visibility="hidden"]').forEach((n) => n.remove());
    const vb = svg.viewBox.baseVal;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(vb.width));
    clone.setAttribute('height', String(vb.height));
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.decoding = 'async';
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
    await img.decode();
    return { img, w: vb.width, h: vb.height, title: spec.title ?? '', legend };
  } finally {
    host.remove();
  }
}

export async function makeResultImage(opts: Opts): Promise<Blob> {
  const { root, calc, result } = opts;
  await document.fonts?.ready;
  const colors = makeResolver(root);
  const C = (v: string) => colors.resolve(`var(${v})`);
  const tone = result.tone ? C(`--tone-${result.tone}`) : C('--accent');
  const toneSoft = colors.resolve(`color-mix(in oklch, ${result.tone ? `var(--tone-${result.tone})` : 'var(--accent)'} 14%, var(--bg-elev))`);
  const toneLine = colors.resolve(`color-mix(in oklch, ${result.tone ? `var(--tone-${result.tone})` : 'var(--accent)'} 40%, transparent)`);
  const badgeText = colors.resolve(`color-mix(in oklch, ${result.tone ? `var(--tone-${result.tone})` : 'var(--accent)'} 55%, var(--text))`);
  const bg = C('--bg');
  const text = C('--text');
  const text2 = C('--text-2');
  const text3 = C('--text-3');
  const line = C('--line');
  const accent = C('--accent');
  const panel = C('--bg-elev');

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.textBaseline = 'alphabetic';

  // Background with a soft glow in the result's tone.
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W, 0, 0, W, 0, W * 1.2);
  glow.addColorStop(0, colors.resolve(`color-mix(in oklch, ${result.tone ? `var(--tone-${result.tone})` : 'var(--accent)'} 30%, transparent)`));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Brand row: Cappy + name.
  let y = 120;
  try {
    const head = new Image();
    head.src = path('/cappy-256.png');
    await head.decode();
    ctx.drawImage(head, PAD - 4, y - 56, 68, 68);
  } catch {
    /* mascot is decorative */
  }
  ctx.fillStyle = text;
  ctx.font = `700 40px ${FONT}`;
  ctx.fillText(SITE.name, PAD + 80, y);
  ctx.fillStyle = text3;
  ctx.font = `600 28px ${FONT}`;
  const cat = CATEGORY_BY_ID[calc.category]?.name ?? '';
  ctx.textAlign = 'right';
  ctx.fillText(cat.toUpperCase(), W - PAD, y - 4);
  ctx.textAlign = 'left';

  // Title.
  y += 120;
  ctx.fillStyle = text;
  const titleSize = fit(ctx, calc.title, 780, 76, 48, W - PAD * 2);
  ctx.fillText(calc.title, PAD, y);
  y += Math.round(titleSize * 0.4);

  // Headline card.
  const primaryBox = [...root.querySelectorAll<HTMLElement>('.stage .primary[data-output]')].find((b) => !b.hidden);
  const label = primaryBox?.querySelector('.primary-label')?.textContent?.trim() ?? '';
  const value = primaryBox?.querySelector('[data-value]')?.textContent?.trim() ?? '—';
  const unit = primaryBox?.querySelector<HTMLSelectElement>('select[data-out-unit]')?.selectedOptions[0]?.text ?? primaryBox?.querySelector('[data-unit]')?.textContent?.trim() ?? '';
  const cardY = y + 30;
  const innerW = W - PAD * 2 - 112;
  ctx.font = `800 200px ${FONT}`;
  const valueSize = fit(ctx, value, 800, 200, 72, innerW);
  ctx.font = `600 44px ${FONT}`;
  const unitW = unit ? ctx.measureText(unit).width : 0;
  ctx.font = `800 ${valueSize}px ${FONT}`;
  const unitInline = unit && ctx.measureText(value).width + 24 + unitW <= innerW;
  ctx.font = `400 36px ${FONT}`;
  const noteLines = result.note ? wrap(ctx, result.note, innerW, 2) : [];
  const badgeH = result.badge ? 64 : 0;
  const cardH = 56 + badgeH + (badgeH ? 34 : 0) + 40 + valueSize * 0.95 + (unit && !unitInline ? 60 : 0) + (noteLines.length ? 36 + noteLines.length * 50 : 0) + 56;
  roundRect(ctx, PAD, cardY, W - PAD * 2, cardH, 40);
  ctx.fillStyle = toneSoft;
  ctx.fill();
  ctx.strokeStyle = toneLine;
  ctx.lineWidth = 3;
  ctx.stroke();

  let cy = cardY + 56;
  const cx = PAD + 56;
  if (result.badge) {
    ctx.font = `700 32px ${FONT}`;
    const bw = ctx.measureText(result.badge).width + 80;
    roundRect(ctx, cx, cy, bw, badgeH, badgeH / 2);
    ctx.fillStyle = colors.resolve(`color-mix(in oklch, ${result.tone ? `var(--tone-${result.tone})` : 'var(--accent)'} 24%, transparent)`);
    ctx.fill();
    ctx.fillStyle = tone;
    ctx.beginPath();
    ctx.arc(cx + 32, cy + badgeH / 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = badgeText;
    ctx.fillText(result.badge, cx + 54, cy + badgeH / 2 + 11);
    cy += badgeH + 34;
  }
  ctx.fillStyle = text2;
  ctx.font = `650 30px ${FONT}`;
  ctx.fillText(label.toUpperCase(), cx, cy + 30);
  cy += 40 + valueSize * 0.82;
  ctx.fillStyle = text;
  ctx.font = `800 ${valueSize}px ${FONT}`;
  ctx.fillText(value, cx - valueSize * 0.04, cy);
  if (unit) {
    ctx.fillStyle = text2;
    ctx.font = `600 44px ${FONT}`;
    if (unitInline) {
      ctx.font = `800 ${valueSize}px ${FONT}`;
      const vw = ctx.measureText(value).width;
      ctx.font = `600 44px ${FONT}`;
      ctx.fillText(unit, cx + vw + 24, cy);
    } else {
      cy += 60;
      ctx.fillText(unit, cx, cy);
    }
  }
  cy += valueSize * 0.13;
  if (noteLines.length) {
    cy += 36;
    ctx.fillStyle = text2;
    ctx.font = `400 36px ${FONT}`;
    for (const l of noteLines) {
      cy += 50;
      ctx.fillText(l, cx, cy - 12);
    }
  }
  y = cardY + cardH + 56;

  // Up to three supporting numbers.
  const rows = [...root.querySelectorAll<HTMLElement>('.rows .row[data-output]')]
    .filter((r) => !r.hidden)
    .map((r) => {
      const v = r.querySelector('[data-value]')?.textContent?.trim() ?? '';
      const u = r.querySelector<HTMLSelectElement>('select[data-out-unit]')?.selectedOptions[0]?.text ?? r.querySelector('[data-unit]')?.textContent?.trim() ?? '';
      return { label: r.querySelector('dt')?.textContent?.trim() ?? '', value: `${v}${u && v !== '—' ? ` ${u}` : ''}` };
    })
    .filter((r) => r.value && r.value !== '—')
    .slice(0, toChartList(result.chart).length ? 2 : 3);

  const footerTop = H - 230;
  const rowsH = rows.length ? rows.length * 76 + 24 : 0;

  // Main chart, scaled to the room that is left.
  // Render small and scale up so axis labels stay legible on a phone screen.
  const chart = await chartImage(opts, 440, colors).catch(() => null);
  if (chart) {
    ctx.font = `500 26px ${FONT}`;
    const legendRows: { name: string; color: string; x: number }[][] = [[]];
    let lx = 0;
    for (const it of chart.legend.length > 1 ? chart.legend : []) {
      const w = ctx.measureText(it.name).width + 50;
      if (lx + w > W - PAD * 2 - 72 && lx > 0) {
        legendRows.push([]);
        lx = 0;
      }
      legendRows[legendRows.length - 1].push({ ...it, x: lx });
      lx += w + 18;
    }
    const legendH = chart.legend.length > 1 ? legendRows.length * 44 + 12 : 0;
    const titleH = chart.title ? 56 : 0;
    const room = footerTop - rowsH - y - titleH - legendH - 64;
    const scale = Math.min((W - PAD * 2 - 48) / chart.w, room / chart.h, 2.2);
    if (scale > 0.35) {
      const cw = chart.w * scale;
      const ch = chart.h * scale;
      const panelH = 40 + titleH + legendH + ch + 24;
      roundRect(ctx, PAD, y, W - PAD * 2, panelH, 36);
      ctx.fillStyle = panel;
      ctx.fill();
      ctx.strokeStyle = line;
      ctx.lineWidth = 2;
      ctx.stroke();
      let py = y + 40;
      if (chart.title) {
        ctx.fillStyle = text;
        ctx.font = `650 32px ${FONT}`;
        ctx.fillText(chart.title, PAD + 36, py + 26);
        py += titleH;
      }
      if (legendH) {
        ctx.font = `500 26px ${FONT}`;
        legendRows.forEach((row, ri) => {
          for (const it of row) {
            const x = PAD + 36 + it.x;
            const ly = py + ri * 44;
            ctx.fillStyle = it.color;
            roundRect(ctx, x, ly + 6, 22, 22, 6);
            ctx.fill();
            ctx.fillStyle = text2;
            ctx.fillText(it.name, x + 32, ly + 26);
          }
        });
        py += legendH;
      }
      ctx.drawImage(chart.img, PAD + (W - PAD * 2 - cw) / 2, py, cw, ch);
      y += panelH + 40;
    }
  }

  // Supporting rows.
  if (rows.length) {
    for (const r of rows) {
      ctx.strokeStyle = line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      ctx.font = `700 36px ${FONT}`;
      const vw = ctx.measureText(r.value).width;
      ctx.fillStyle = text2;
      ctx.font = `450 32px ${FONT}`;
      const l = wrap(ctx, r.label, W - PAD * 2 - vw - 40, 1)[0] ?? '';
      ctx.fillText(l, PAD, y + 50);
      ctx.fillStyle = text;
      ctx.font = `700 36px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.fillText(r.value, W - PAD, y + 50);
      ctx.textAlign = 'left';
      y += 76;
    }
  }

  // Footer call to action.
  const url = `${location.host.replace(/^www\./, '')}${location.pathname}`.replace(/\/$/, '');
  ctx.fillStyle = text2;
  ctx.font = `500 34px ${FONT}`;
  ctx.fillText('Run your own numbers →', PAD, H - 150);
  ctx.fillStyle = accent;
  fit(ctx, url, 700, 40, 24, W - PAD * 2);
  ctx.fillText(url, PAD, H - 92);

  colors.done();
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png'));
}

/** Make the image and share it (or download it). Returns what happened. */
export async function shareResultImage(opts: Opts): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const blob = await makeResultImage(opts);
  const file = new File([blob], `cappycalc-${opts.calc.slug}.png`, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (coarse && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: opts.calc.title, text: location.href });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return 'downloaded';
}
