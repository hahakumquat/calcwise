/**
 * Dependency-free SVG chart renderer. Pure string output so it runs at build time (SSR) and in the browser.
 * Colours come from CSS variables (--c1…--c6, --accent, --line, --text-3) so charts follow the theme.
 */
import type { ChartSpec, ChartFormat, LineChart, BarChart, DonutChart, ScaleChart, DistributionChart, ScatterChart } from './types';
import { fromBase, getUnit } from './units';
import { formatNumber } from './format';
import { lnGamma } from './math';

export type UnitResolver = (group: NonNullable<ChartFormat['unit']>) => string | undefined;

export interface RenderOpts {
  width?: number;
  unitFor?: UnitResolver;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)'];
const color = (i: number) => COLORS[i % COLORS.length];

/* ───────── value conversion + formatting ───────── */
function convert(v: number, f: ChartFormat | undefined, unitFor?: UnitResolver): number {
  if (f?.unit) {
    const u = unitFor?.(f.unit);
    if (u) return fromBase(f.unit, u, v);
  }
  return v;
}
function unitLabel(f: ChartFormat | undefined, unitFor?: UnitResolver): string {
  if (f?.unit) {
    const u = unitFor?.(f.unit);
    return u ? getUnit(f.unit, u).label : '';
  }
  return f?.suffix ?? '';
}
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/** Format a (converted) value for tooltips: full precision. */
export function fmtFull(v: number, f?: ChartFormat, unit = ''): string {
  if (!Number.isFinite(v)) return '—';
  switch (f?.format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2 }).format(v);
    case 'percent':
      return formatNumber(v * 100, 2) + '%';
    case 'integer':
      return Math.round(v).toLocaleString('en-US') + (unit ? ` ${unit}` : '');
    default:
      return formatNumber(v, Math.abs(v) >= 100 ? 1 : 3) + (unit ? ` ${unit}` : '');
  }
}
/** Format a value for axis ticks: compact. */
function fmtTick(v: number, f?: ChartFormat): string {
  if (f?.format === 'currency') return '$' + (Math.abs(v) >= 10000 ? compact.format(v) : formatNumber(v, 2));
  if (f?.format === 'percent') return formatNumber(v * 100, 1) + '%';
  if (Math.abs(v) >= 10000) return compact.format(v);
  return formatNumber(v, 3);
}

/** "Nice" axis ticks covering [min, max]. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    const d = Math.abs(min) || 1;
    min -= d / 2;
    max += d / 2;
  }
  const span = max - min;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const err = step0 / mag;
  const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.abs(v) < step / 1e6 ? 0 : +v.toPrecision(12));
  return out;
}

function svgOpen(w: number, h: number, label: string) {
  return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg">`;
}

function legend(names: string[]): string {
  if (names.length < 2) return '';
  return `<div class="chart-legend">${names.map((n, i) => `<span><i style="background:${color(i)}"></i>${esc(n)}</span>`).join('')}</div>`;
}

/* ───────── line / area ───────── */
function renderLine(c: LineChart, W: number, o: RenderOpts) {
  const H = Math.round(Math.min(320, Math.max(220, W * 0.45)));
  const m = { t: 14, r: 16, b: 34, l: 58 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const n = c.x.length;
  const numericX = c.x.every((x) => typeof x === 'number');
  const xs = c.x.map((x, i) => (numericX ? (x as number) : i));
  const xmin = Math.min(...xs);
  const xmax = Math.max(...xs);
  const X = (x: number) => m.l + (xmax === xmin ? iw / 2 : ((x - xmin) / (xmax - xmin)) * iw);

  const series = c.series.map((s) => s.values.map((v) => (v === null || !Number.isFinite(v) ? null : convert(v, c.yFormat, o.unitFor))));
  // stacked: cumulative
  const plotted = c.stacked
    ? series.map((_, si) => xs.map((_, i) => series.slice(0, si + 1).reduce((a, s) => a + (s[i] ?? 0), 0)))
    : series;
  const all = plotted.flat().filter((v): v is number => v !== null);
  let ymin = Math.min(0, ...all);
  let ymax = Math.max(...all, 0);
  if (!all.length) ymax = 1;
  const ticks = niceTicks(ymin, ymax, 4);
  ymin = ticks[0];
  ymax = ticks[ticks.length - 1];
  const Y = (y: number) => m.t + ih - ((y - ymin) / (ymax - ymin || 1)) * ih;

  let g = '';
  for (const t of ticks) g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${m.l - 8}" y="${Y(t) + 4}" class="tick" text-anchor="end">${esc(fmtTick(t, c.yFormat))}</text>`;
  // x ticks
  const maxLabels = Math.max(2, Math.floor(iw / 70));
  const stepIdx = Math.max(1, Math.ceil(n / maxLabels));
  for (let i = 0; i < n; i += stepIdx) {
    const lab = numericX ? fmtTick(convert(xs[i], c.xFormat, o.unitFor), c.xFormat) : String(c.x[i]);
    g += `<text x="${X(xs[i])}" y="${H - m.b + 18}" class="tick" text-anchor="middle">${esc(lab)}</text>`;
  }
  for (const mk of c.markers ?? []) {
    const xi = typeof mk.x === 'number' && numericX ? mk.x : c.x.indexOf(mk.x);
    if (xi < 0 || !Number.isFinite(xi)) continue;
    const xx = X(xi as number);
    g += `<line x1="${xx}" x2="${xx}" y1="${m.t}" y2="${m.t + ih}" class="marker"/><text x="${xx + 4}" y="${m.t + 10}" class="marker-label">${esc(mk.label)}</text>`;
  }
  // series (draw stacked from top layer down so fills overlap correctly)
  const order = plotted.map((_, i) => i);
  if (c.stacked) order.reverse();
  for (const si of order) {
    const vals = plotted[si];
    let d = '';
    let started = false;
    vals.forEach((v, i) => {
      if (v === null) {
        started = false;
        return;
      }
      d += `${started ? 'L' : 'M'}${X(xs[i]).toFixed(1)},${Y(v).toFixed(1)}`;
      started = true;
    });
    if (!d) continue;
    if (c.type === 'area' || c.stacked) {
      const first = vals.findIndex((v) => v !== null);
      const last = vals.length - 1 - [...vals].reverse().findIndex((v) => v !== null);
      g += `<path d="${d}L${X(xs[last])},${Y(Math.max(ymin, 0))}L${X(xs[first])},${Y(Math.max(ymin, 0))}Z" fill="${color(si)}" class="area"/>`;
    }
    g += `<path d="${d}" stroke="${color(si)}" class="line"/>`;
  }
  if (c.xLabel) g += `<text x="${m.l + iw / 2}" y="${H - 2}" class="axis-label" text-anchor="middle">${esc(c.xLabel)}</text>`;
  g += `<g class="hover" visibility="hidden"><line class="hover-line" y1="${m.t}" y2="${m.t + ih}"/>${plotted.map((_, i) => `<circle r="4" fill="${color(i)}" class="hover-dot"/>`).join('')}</g>`;
  g += `<rect class="hit" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent"/>`;

  const unit = unitLabel(c.yFormat, o.unitFor);
  const meta = {
    kind: 'line',
    px: xs.map((x) => X(x)),
    py: plotted.map((s) => s.map((v) => (v === null ? null : Y(v)))),
    labels: c.x.map((x) => (numericX ? `${c.xLabel ? c.xLabel + ' ' : ''}${fmtFull(convert(x as number, c.xFormat, o.unitFor), c.xFormat, unitLabel(c.xFormat, o.unitFor))}` : String(x))),
    rows: c.series.map((s, si) => ({ name: s.name, color: color(si), values: series[si].map((v) => (v === null ? '—' : fmtFull(v, c.yFormat, unit))) })),
  };
  return { svg: svgOpen(W, H, c.title ?? 'Chart') + g + '</svg>', legend: legend(c.series.map((s) => s.name)), meta, yLabel: c.yLabel ? `${c.yLabel}${unit ? ` (${unit})` : ''}` : unit };
}

/* ───────── bar ───────── */
function renderBar(c: BarChart, W: number, o: RenderOpts) {
  const conv = c.series.map((s) => s.values.map((v) => convert(v, c.format, o.unitFor)));
  const unit = unitLabel(c.format, o.unitFor);
  const nCat = c.categories.length;
  const nSer = c.series.length;
  const totals = c.categories.map((_, i) => (c.stacked ? conv.reduce((a, s) => a + Math.max(0, s[i] ?? 0), 0) : Math.max(...conv.map((s) => s[i] ?? 0))));
  const mins = c.stacked ? [0] : conv.flat();
  const ticks = niceTicks(Math.min(0, ...mins), Math.max(0, ...totals), 4);
  const vmin = ticks[0];
  const vmax = ticks[ticks.length - 1];
  let g = '';

  if (c.horizontal || (nCat > 8 && W < 520)) {
    const labelW = Math.min(170, Math.max(70, Math.max(...c.categories.map((s) => s.length)) * 7 + 10));
    const rowH = 30;
    const H = 16 + nCat * rowH + 24;
    const m = { l: labelW, r: 64, t: 8 };
    const iw = W - m.l - m.r;
    const Xv = (v: number) => m.l + ((v - vmin) / (vmax - vmin || 1)) * iw;
    c.categories.forEach((cat, i) => {
      const y = m.t + i * rowH;
      const hl = c.highlight === i;
      g += `<text x="${m.l - 10}" y="${y + rowH / 2 + 4}" class="tick${hl ? ' strong' : ''}" text-anchor="end">${esc(cat.length > 24 ? cat.slice(0, 23) + '…' : cat)}</text>`;
      let acc = 0;
      conv.forEach((s, si) => {
        const v = s[i] ?? 0;
        const bh = c.stacked ? rowH - 10 : (rowH - 10) / nSer;
        const by = c.stacked ? y + 5 : y + 5 + si * bh;
        const x0 = c.stacked ? Xv(acc) : Xv(Math.min(0, v));
        const x1 = c.stacked ? Xv(acc + v) : Xv(Math.max(0, v));
        acc += v;
        g += `<rect x="${x0}" y="${by}" width="${Math.max(1, x1 - x0)}" height="${bh - 2}" rx="4" fill="${color(si)}" class="bar${hl ? ' hl' : ''}"><title>${esc(`${cat} — ${c.series[si].name}: ${fmtFull(v, c.format, unit)}`)}</title></rect>`;
      });
      const total = c.stacked ? acc : conv[0][i];
      g += `<text x="${Xv(c.stacked ? acc : Math.max(0, total)) + 6}" y="${y + rowH / 2 + 4}" class="tick value">${esc(fmtTick(total, c.format))}</text>`;
    });
    return { svg: svgOpen(W, H, c.title ?? 'Bar chart') + g + '</svg>', legend: legend(c.series.map((s) => s.name)), meta: null, yLabel: unit };
  }

  const H = Math.round(Math.min(300, Math.max(210, W * 0.42)));
  const m = { t: 18, r: 12, b: 40, l: 54 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const Y = (v: number) => m.t + ih - ((v - vmin) / (vmax - vmin || 1)) * ih;
  for (const t of ticks) g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${m.l - 8}" y="${Y(t) + 4}" class="tick" text-anchor="end">${esc(fmtTick(t, c.format))}</text>`;
  const band = iw / nCat;
  const gap = Math.min(18, band * 0.25);
  const showEvery = Math.max(1, Math.ceil(nCat / Math.max(2, Math.floor(iw / 60))));
  c.categories.forEach((cat, i) => {
    const x = m.l + i * band + gap / 2;
    const bw = band - gap;
    const hl = c.highlight === i;
    let acc = 0;
    conv.forEach((s, si) => {
      const v = s[i] ?? 0;
      const w = c.stacked ? bw : bw / nSer;
      const bx = c.stacked ? x : x + si * w;
      const y0 = c.stacked ? Y(acc + v) : Y(Math.max(0, v));
      const y1 = c.stacked ? Y(acc) : Y(Math.min(0, v));
      acc += v;
      g += `<rect x="${bx}" y="${y0}" width="${Math.max(1, w - (c.stacked ? 0 : 2))}" height="${Math.max(0.5, y1 - y0)}" rx="${Math.min(5, w / 4)}" fill="${color(si)}" class="bar${hl ? ' hl' : ''}"><title>${esc(`${cat} — ${c.series[si].name}: ${fmtFull(v, c.format, unit)}`)}</title></rect>`;
    });
    if (i % showEvery === 0)
      g += `<text x="${x + bw / 2}" y="${H - m.b + 18}" class="tick${hl ? ' strong' : ''}" text-anchor="middle">${esc(cat.length > 14 ? cat.slice(0, 13) + '…' : cat)}</text>`;
  });
  return { svg: svgOpen(W, H, c.title ?? 'Bar chart') + g + '</svg>', legend: legend(c.series.map((s) => s.name)), meta: null, yLabel: unit };
}

/* ───────── donut ───────── */
function renderDonut(c: DonutChart, W: number, o: RenderOpts) {
  const slices = c.slices.filter((s) => s.value > 0);
  const total = slices.reduce((a, s) => a + s.value, 0);
  const size = Math.min(220, W);
  const r = size / 2 - 6;
  const ir = r * 0.64;
  const cx = size / 2;
  const cy = size / 2;
  let a0 = -Math.PI / 2;
  let g = '';
  const unit = unitLabel(c.format, o.unitFor);
  slices.forEach((s, i) => {
    const frac = s.value / (total || 1);
    const a1 = a0 + frac * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (rad: number, a: number) => `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`;
    const d = frac >= 0.9999
      ? `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0M${cx - ir},${cy}a${ir},${ir} 0 1,1 ${2 * ir},0a${ir},${ir} 0 1,1 ${-2 * ir},0`
      : `M${p(r, a0)}A${r},${r} 0 ${large} 1 ${p(r, a1)}L${p(ir, a1)}A${ir},${ir} 0 ${large} 0 ${p(ir, a0)}Z`;
    g += `<path d="${d}" fill="${color(i)}" class="slice" fill-rule="evenodd"><title>${esc(`${s.label}: ${fmtFull(convert(s.value, c.format, o.unitFor), c.format, unit)} (${formatNumber(frac * 100, 1)}%)`)}</title></path>`;
    a0 = a1;
  });
  if (c.centerValue) g += `<text x="${cx}" y="${cy + (c.centerLabel ? 2 : 6)}" class="center-value" text-anchor="middle">${esc(c.centerValue)}</text>`;
  if (c.centerLabel) g += `<text x="${cx}" y="${cy + 22}" class="center-label" text-anchor="middle">${esc(c.centerLabel)}</text>`;
  const svg = svgOpen(size, size, c.title ?? 'Breakdown') + g + '</svg>';
  const list = `<ul class="donut-list">${slices
    .map((s, i) => `<li><i style="background:${color(i)}"></i><span>${esc(s.label)}</span><b>${esc(fmtFull(convert(s.value, c.format, o.unitFor), c.format, unit))}</b><em>${formatNumber((s.value / (total || 1)) * 100, 1)}%</em></li>`)
    .join('')}</ul>`;
  return { svg: `<div class="donut-wrap">${svg}${list}</div>`, legend: '', meta: null, yLabel: '' };
}

/* ───────── scale ───────── */
const TONE: Record<string, string> = { good: 'var(--tone-good)', ok: 'var(--tone-ok)', warn: 'var(--tone-warn)', bad: 'var(--tone-bad)', neutral: 'var(--tone-neutral)' };
function renderScale(c: ScaleChart, W: number, o: RenderOpts) {
  const H = 96;
  const m = { l: 6, r: 6 };
  const iw = W - m.l - m.r;
  const X = (v: number) => m.l + ((Math.min(c.max, Math.max(c.min, v)) - c.min) / (c.max - c.min || 1)) * iw;
  const barY = 36;
  let g = '';
  c.bands.forEach((b, i) => {
    const x0 = X(b.from);
    const x1 = X(b.to);
    const first = i === 0;
    const last = i === c.bands.length - 1;
    g += `<rect x="${x0 + (first ? 0 : 1)}" y="${barY}" width="${Math.max(0, x1 - x0 - (first || last ? 1 : 2))}" height="14" rx="${first || last ? 7 : 2}" fill="${TONE[b.tone ?? 'neutral']}"/>`;
    const w = x1 - x0;
    if (w > 46) g += `<text x="${(x0 + x1) / 2}" y="${barY + 34}" class="tick" text-anchor="middle">${esc(w < 80 && b.label.length > 9 ? b.label.slice(0, 8) + '…' : b.label)}</text>`;
    if (!first) g += `<text x="${x0}" y="${barY + 50}" class="tick faint" text-anchor="middle">${esc(fmtTick(convert(b.from, c.format, o.unitFor), c.format))}</text>`;
  });
  const vx = X(c.value);
  const lab = c.valueLabel ?? fmtFull(convert(c.value, c.format, o.unitFor), c.format, unitLabel(c.format, o.unitFor));
  const anchor = vx < 50 ? 'start' : vx > W - 50 ? 'end' : 'middle';
  g += `<text x="${vx}" y="18" class="scale-value" text-anchor="${anchor}">${esc(lab)}</text>`;
  g += `<path d="M${vx - 7},${barY - 9}L${vx + 7},${barY - 9}L${vx},${barY - 1}Z" class="scale-pointer"/>`;
  g += `<line x1="${vx}" x2="${vx}" y1="${barY - 1}" y2="${barY + 15}" class="scale-needle"/>`;
  return { svg: svgOpen(W, H, c.title ?? 'Scale') + g + '</svg>', legend: '', meta: null, yLabel: '' };
}

/* ───────── distribution ───────── */
function pdf(x: number, mean: number, sd: number, df?: number) {
  const z = (x - mean) / sd;
  if (df && df < 200) {
    const lg = lnGamma((df + 1) / 2) - lnGamma(df / 2);
    return Math.exp(lg - 0.5 * Math.log(df * Math.PI) - ((df + 1) / 2) * Math.log(1 + (z * z) / df)) / sd;
  }
  return Math.exp(-0.5 * z * z) / (sd * Math.sqrt(2 * Math.PI));
}
function renderDistribution(c: DistributionChart, W: number, o: RenderOpts) {
  const H = Math.round(Math.min(260, Math.max(190, W * 0.38)));
  const m = { t: 22, r: 12, b: 30, l: 12 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const span = (c.df && c.df < 30 ? 4.5 : 4) * c.sd;
  // Widen (up to ±10 SD) so far-out markers such as extreme test statistics stay visible.
  const far = Math.min(10 * c.sd, Math.max(span, ...(c.markers ?? []).map((m) => Math.abs(m.x - c.mean) * 1.15)));
  const lo = c.mean - far;
  const hi = c.mean + far;
  const X = (x: number) => m.l + ((x - lo) / (hi - lo)) * iw;
  const peak = pdf(c.mean, c.mean, c.sd, c.df);
  const Y = (y: number) => m.t + ih - (y / peak) * ih * 0.95;
  const N = 160;
  const pts: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const x = lo + ((hi - lo) * i) / N;
    pts.push([x, pdf(x, c.mean, c.sd, c.df)]);
  }
  let g = `<line x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}" class="grid strong"/>`;
  for (const s of c.shade ?? []) {
    const a = Math.max(lo, s.from ?? lo);
    const b = Math.min(hi, s.to ?? hi);
    if (b <= a) continue;
    const seg = pts.filter(([x]) => x >= a && x <= b);
    const d = `M${X(a)},${Y(0)}L${X(a)},${Y(pdf(a, c.mean, c.sd, c.df))}` + seg.map(([x, y]) => `L${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('') + `L${X(b)},${Y(pdf(b, c.mean, c.sd, c.df))}L${X(b)},${Y(0)}Z`;
    g += `<path d="${d}" class="dist-shade"/>`;
    if (s.label) g += `<text x="${X((a + b) / 2)}" y="${Y(pdf((a + b) / 2, c.mean, c.sd, c.df)) - 6 > m.t + 10 ? m.t + ih - 8 : m.t + ih - 8}" class="tick strong" text-anchor="middle">${esc(s.label)}</text>`;
  }
  g += `<path d="${pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('')}" class="line" stroke="var(--c1)"/>`;
  const ticks = [-3, -2, -1, 0, 1, 2, 3].map((k) => c.mean + k * c.sd);
  for (const t of ticks) g += `<text x="${X(t)}" y="${H - 8}" class="tick faint" text-anchor="middle">${esc(fmtTick(convert(t, c.format, o.unitFor), c.format))}</text>`;
  for (const mk of c.markers ?? []) {
    if (mk.x < lo || mk.x > hi) continue;
    g += `<line x1="${X(mk.x)}" x2="${X(mk.x)}" y1="${m.t - 4}" y2="${m.t + ih}" class="marker"/><text x="${X(mk.x)}" y="${m.t - 8}" class="marker-label" text-anchor="middle">${esc(mk.label)}</text>`;
  }
  return { svg: svgOpen(W, H, c.title ?? 'Distribution') + g + '</svg>', legend: '', meta: null, yLabel: '' };
}

/* ───────── scatter ───────── */
function renderScatter(c: ScatterChart, W: number, o: RenderOpts) {
  const H = Math.round(Math.min(300, Math.max(220, W * 0.45)));
  const m = { t: 14, r: 16, b: 36, l: 54 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const xs = c.points.map((p) => convert(p[0], c.xFormat, o.unitFor));
  const ys = c.points.map((p) => convert(p[1], c.yFormat, o.unitFor));
  const xt = niceTicks(Math.min(...xs), Math.max(...xs), 5);
  const yt = niceTicks(Math.min(...ys), Math.max(...ys), 4);
  const X = (x: number) => m.l + ((x - xt[0]) / (xt[xt.length - 1] - xt[0] || 1)) * iw;
  const Y = (y: number) => m.t + ih - ((y - yt[0]) / (yt[yt.length - 1] - yt[0] || 1)) * ih;
  let g = '';
  for (const t of yt) g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${m.l - 8}" y="${Y(t) + 4}" class="tick" text-anchor="end">${esc(fmtTick(t, c.yFormat))}</text>`;
  for (const t of xt) g += `<text x="${X(t)}" y="${H - m.b + 18}" class="tick" text-anchor="middle">${esc(fmtTick(t, c.xFormat))}</text>`;
  if (c.line) {
    const x0 = xt[0];
    const x1 = xt[xt.length - 1];
    const clampY = (y: number) => Math.min(m.t + ih, Math.max(m.t, Y(y)));
    g += `<line x1="${X(x0)}" x2="${X(x1)}" y1="${clampY(c.line.slope * x0 + c.line.intercept)}" y2="${clampY(c.line.slope * x1 + c.line.intercept)}" class="fit"/>`;
  }
  xs.forEach((x, i) => (g += `<circle cx="${X(x)}" cy="${Y(ys[i])}" r="4.5" class="dot"><title>(${esc(fmtFull(x, c.xFormat))}, ${esc(fmtFull(ys[i], c.yFormat))})</title></circle>`));
  if (c.xLabel) g += `<text x="${m.l + iw / 2}" y="${H - 2}" class="axis-label" text-anchor="middle">${esc(c.xLabel)}</text>`;
  return { svg: svgOpen(W, H, c.title ?? 'Scatter plot') + g + '</svg>', legend: c.line?.label ? legend(['Data', c.line.label]) : '', meta: null, yLabel: c.yLabel ?? '' };
}

/** Renders one chart to HTML (title + legend + SVG). Returns '' for invalid specs. */
export function renderChart(c: ChartSpec, opts: RenderOpts = {}): { html: string; meta: unknown } {
  const W = Math.max(260, Math.round(opts.width ?? 640));
  try {
    let r: { svg: string; legend: string; meta: unknown; yLabel: string };
    switch (c.type) {
      case 'line':
      case 'area':
        if (!c.x.length || !c.series.length) return { html: '', meta: null };
        r = renderLine(c, W, opts);
        break;
      case 'bar':
        if (!c.categories.length) return { html: '', meta: null };
        r = renderBar(c, W, opts);
        break;
      case 'donut':
        if (!c.slices.some((s) => s.value > 0)) return { html: '', meta: null };
        r = renderDonut(c, W, opts);
        break;
      case 'scale':
        r = renderScale(c, W, opts);
        break;
      case 'distribution':
        if (!(c.sd > 0)) return { html: '', meta: null };
        r = renderDistribution(c, W, opts);
        break;
      case 'scatter':
        if (!c.points.length) return { html: '', meta: null };
        r = renderScatter(c, W, opts);
        break;
      default:
        return { html: '', meta: null };
    }
    const head = c.title || r.yLabel ? `<div class="chart-head">${c.title ? `<span class="chart-title">${esc(c.title)}</span>` : ''}${r.yLabel ? `<span class="chart-unit">${esc(r.yLabel)}</span>` : ''}</div>` : '';
    return { html: `<figure class="chart chart-${c.type}">${head}${r.legend}<div class="chart-body">${r.svg}<div class="chart-tip" hidden></div></div></figure>`, meta: r.meta };
  } catch {
    return { html: '', meta: null };
  }
}

export const toChartList = (c: ChartSpec | ChartSpec[] | undefined): ChartSpec[] => (!c ? [] : Array.isArray(c) ? c : [c]);
