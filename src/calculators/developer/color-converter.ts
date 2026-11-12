import { defineCalculator } from '../../lib/types';
import { str } from '../../lib/helpers/text';

type RGB = { r: number; g: number; b: number; a: number };

const NAMED: Record<string, string> = {
  black: '000000', white: 'ffffff', red: 'ff0000', lime: '00ff00', green: '008000', blue: '0000ff', yellow: 'ffff00',
  cyan: '00ffff', aqua: '00ffff', magenta: 'ff00ff', fuchsia: 'ff00ff', gray: '808080', grey: '808080', silver: 'c0c0c0',
  maroon: '800000', olive: '808000', navy: '000080', purple: '800080', teal: '008080', orange: 'ffa500',
  pink: 'ffc0cb', brown: 'a52a2a', gold: 'ffd700', indigo: '4b0082', violet: 'ee82ee', coral: 'ff7f50',
  tomato: 'ff6347', salmon: 'fa8072', crimson: 'dc143c', turquoise: '40e0d0', rebeccapurple: '663399', transparent: '00000000',
};

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const r1 = (x: number) => Math.round(x * 10) / 10;

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5) * 255, f(3) * 255, f(1) * 255];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function fromHex(h: string): RGB | null {
  if (!/^[0-9a-f]+$/i.test(h) || ![3, 4, 6, 8].includes(h.length)) return null;
  const full = h.length <= 4 ? Array.from(h, (c) => c + c).join('') : h;
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 };
}

/** Parses hex, rgb(), hsl(), hsv()/hsb(), cmyk(), CSS names, or bare "r, g, b". */
function parse(input: string): RGB | string {
  const s = input.trim().toLowerCase();
  if (!s) return 'Enter a color.';
  if (NAMED[s]) return fromHex(NAMED[s])!;
  const hex = s.match(/^#?([0-9a-f]{3,8})$/);
  if (hex) return fromHex(hex[1]) ?? 'A hex color needs 3, 4, 6 or 8 digits.';
  const fn = s.match(/^(rgba?|hsla?|hsv|hsb|cmyk)?\s*\(?\s*([^)]*?)\s*\)?$/);
  if (!fn) return 'Unrecognised color format.';
  const kind = (fn[1] ?? 'rgb').replace(/a$/, '').replace('hsb', 'hsv');
  const parts = fn[2].split(/[\s,/]+/).filter(Boolean);
  const vals = parts.map((p) => ({ n: parseFloat(p), pct: p.endsWith('%') }));
  if (vals.some((x) => Number.isNaN(x.n))) return `Could not read the numbers in "${input.trim()}".`;
  const need = kind === 'cmyk' ? 4 : 3;
  if (vals.length < need || vals.length > need + 1) return `${kind.toUpperCase()} needs ${need} values${kind === 'cmyk' ? '' : ' (plus optional alpha)'}.`;
  const alphaV = vals[need];
  const a = alphaV ? clamp(alphaV.pct ? alphaV.n / 100 : alphaV.n, 0, 1) : 1;
  const frac = (x: { n: number; pct: boolean }) => clamp(x.pct || x.n > 1 ? x.n / 100 : x.n, 0, 1);
  let rgb: [number, number, number];
  if (kind === 'rgb') rgb = vals.slice(0, 3).map((x) => clamp(x.pct ? (x.n / 100) * 255 : x.n, 0, 255)) as [number, number, number];
  else if (kind === 'cmyk') {
    const [c, m, y, k] = vals.map(frac);
    rgb = [255 * (1 - c) * (1 - k), 255 * (1 - m) * (1 - k), 255 * (1 - y) * (1 - k)];
  } else {
    const h = ((vals[0].n % 360) + 360) % 360;
    const p1 = frac(vals[1]);
    const p2 = frac(vals[2]);
    rgb = kind === 'hsl' ? hslToRgb(h, p1, p2) : hsvToRgb(h, p1, p2);
  }
  return { r: rgb[0], g: rgb[1], b: rgb[2], a };
}

export default defineCalculator({
  slug: 'color-converter',
  title: 'Color Converter (HEX, RGB, HSL, HSV, CMYK)',
  category: 'developer',
  description: 'Convert any color between HEX, RGB, HSL, HSV and CMYK — paste it in any format and get all the others.',
  keywords: ['hex to rgb', 'rgb to hex', 'hsl to hex', 'color code converter', 'cmyk to rgb', 'color picker values', 'hex color'],
  layout: 'wide',
  inputs: [
    { id: 'color', info: 'A color in any common format: #hex, rgb(), hsl(), hsv()/hsb(), cmyk() or a CSS name like "orange".', label: 'Color', type: 'text', default: '#3B82F6', placeholder: '#ff8800, rgb(255 136 0), hsl(32 100% 50%), cmyk(0,47,100,0), orange', help: 'Paste a color in any supported format.' },
  ],
  outputs: [
    { id: 'hex', info: 'The color as a #RRGGBB code (with two extra alpha digits if it is semi-transparent). Used in CSS and design tools.', label: 'HEX', format: 'code', primary: true },
    { id: 'rgb', info: 'Red, green and blue channels from 0 to 255 — how screens actually mix the color.', label: 'RGB', format: 'code' },
    { id: 'hsl', info: 'Hue angle (0–360°), saturation and lightness. Easy to tweak by hand in CSS.', label: 'HSL', format: 'code' },
    { id: 'hsv', info: 'Hue, saturation and value (brightness) — the model used by Photoshop and most color pickers.', label: 'HSV / HSB', format: 'code' },
    { id: 'cmyk', info: 'Cyan, magenta, yellow and black ink percentages, using a simple conversion without a print profile.', label: 'CMYK', format: 'code', help: 'Naive conversion without a color profile; print results will vary.' },
    { id: 'luminance', info: 'Perceived brightness from 0 (black) to 1 (white), as defined by WCAG for contrast checks.', label: 'Relative luminance', format: 'number', precision: 3 },
    { id: 'textOn', info: 'Whether white or black text is more readable on this color, with its WCAG contrast ratio. 4.5:1 or more passes for body text.', label: 'Readable text color on it', format: 'text' },
  ],
  compute: (v) => {
    const p = parse(str(v.color));
    if (typeof p === 'string') return { hex: null, error: p };
    const R = Math.round(p.r);
    const G = Math.round(p.g);
    const B = Math.round(p.b);
    const alpha = Math.round(p.a * 1000) / 1000;
    const h2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
    const hex = `#${h2(R)}${h2(G)}${h2(B)}${alpha < 1 ? h2(Math.round(alpha * 255)) : ''}`;
    // HSL / HSV from the exact (unrounded) channels
    const r = p.r / 255, g = p.g / 255, b = p.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    const l = (max + min) / 2;
    const sl = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    const sv = max ? d / max : 0;
    const k = 1 - max;
    const [c, m, y] = k < 1 ? [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k)] : [0, 0, 0];
    const a = alpha < 1 ? ` / ${alpha}` : '';
    const lin = (u: number) => (u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4);
    const L = 0.2126 * lin(R / 255) + 0.7152 * lin(G / 255) + 0.0722 * lin(B / 255);
    const contrastWhite = 1.05 / (L + 0.05);
    const contrastBlack = (L + 0.05) / 0.05;
    return {
      hex,
      rgb: alpha < 1 ? `rgba(${R}, ${G}, ${B}, ${alpha})` : `rgb(${R}, ${G}, ${B})`,
      hsl: `hsl(${r1(h)} ${r1(sl * 100)}% ${r1(l * 100)}%${a})`,
      hsv: `hsv(${r1(h)}, ${r1(sv * 100)}%, ${r1(max * 100)}%)`,
      cmyk: `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`,
      luminance: L,
      chart: [
        {
          type: 'bar',
          title: 'RGB channels (0–255)',
          categories: ['Red', 'Green', 'Blue'],
          series: [{ name: 'Value', values: [R, G, B] }],
          format: { format: 'integer' },
        },
        ...(R + G + B > 0
          ? [
              {
                type: 'donut' as const,
                title: 'Channel mix',
                slices: [
                  { label: 'Red', value: R },
                  { label: 'Green', value: G },
                  { label: 'Blue', value: B },
                ],
                format: { format: 'integer' as const },
                centerLabel: 'hex',
                centerValue: hex,
              },
            ]
          : []),
      ],
      textOn:
        contrastWhite >= contrastBlack
          ? `White (contrast ${contrastWhite.toFixed(2)}:1)`
          : `Black (contrast ${contrastBlack.toFixed(2)}:1)`,
    };
  },
  content: {
    formula: ['HEX = RGB channels 0–255 written as two hex digits each', 'K = 1 − max(R′,G′,B′);  C = (1 − R′ − K) ÷ (1 − K)'],
    body: [
      'Screens mix red, green and blue light, so every web color is ultimately three numbers from 0 to 255. HEX is just those three numbers in hexadecimal (#3B82F6 = 59, 130, 246). HSL and HSV describe the same color in a more human way: a hue angle around the color wheel, plus saturation and lightness (or value/brightness). Designers use HSL to make a color lighter or darker without shifting its hue.',
      'Paste a color in whatever form you have — #rgb, #rrggbb or #rrggbbaa hex, modern space-separated rgb(59 130 246 / 50%), hsl(), hsv() or hsb(), cmyk() or a common CSS color name — and every other format appears. Alpha transparency is carried through to 8-digit hex and rgba().',
      'CMYK here is the simple mathematical conversion. Real printing depends on the paper, ink and ICC color profile, so ask your printer for a proof when exact color matters. The readable text suggestion compares WCAG contrast ratios for white and black text; 4.5:1 or more passes for body text.',
    ],
    faq: [
      { q: 'Why does converting back and forth change a value by one?', a: 'RGB channels are whole numbers, while HSL and CMYK percentages are rounded for display. Converting a rounded value back can land one step away. The underlying color is visually identical.' },
      { q: 'What is the difference between HSL and HSV?', a: 'Both use the same hue. In HSL, 100% lightness is always white and 50% is the pure color. In HSV (also called HSB), 100% value is the pure color at full brightness, and white needs 0% saturation. Photoshop\'s color picker uses HSB; CSS uses HSL.' },
    ],
  },
  related: ['number-base-converter', 'hash-generator'],
  examples: [
    { values: { color: '#FF8800' }, expect: { hex: '#FF8800', rgb: 'rgb(255, 136, 0)', hsl: 'hsl(32 100% 50%)', hsv: 'hsv(32, 100%, 100%)', cmyk: 'cmyk(0%, 47%, 100%, 0%)' } },
    { values: { color: 'rgb(59 130 246 / 50%)' }, expect: { hex: '#3B82F680', rgb: 'rgba(59, 130, 246, 0.5)' } },
    { values: { color: 'hsl(120, 100%, 25%)' }, expect: { hex: '#008000' } },
    { values: { color: 'cmyk(0, 100, 100, 0)' }, expect: { hex: '#FF0000' } },
    { values: { color: 'hsv(240 50% 100%)' }, expect: { hex: '#8080FF' } },
    { values: { color: 'white' }, expect: { hex: '#FFFFFF', luminance: 1, textOn: 'Black (contrast 21.00:1)' } },
    { values: { color: '#abc' }, expect: { rgb: 'rgb(170, 187, 204)' } },
    { values: { color: '#12345' }, expect: { error: 'A hex color needs 3, 4, 6 or 8 digits.' } },
  ],
});
