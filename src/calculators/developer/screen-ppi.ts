import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

type Tone = 'good' | 'ok' | 'warn';

// Plain-language bands, a rule of thumb for desktop viewing distance, not a standard.
function band(ppi: number): { label: string; tone: Tone; note: string } {
  if (ppi < 110) return { label: 'Low density', tone: 'warn', note: 'Below about 110 PPI. Individual pixels and jagged text edges are easier to see up close.' };
  if (ppi < 160) return { label: 'Typical desktop', tone: 'ok', note: '110 to 160 PPI is the range of most desktop monitors. Fine at arm\'s length.' };
  if (ppi < 200) return { label: 'Sharp', tone: 'good', note: '160 to 200 PPI looks crisp on a desk. Most people cannot pick out single pixels.' };
  return { label: 'Retina-class', tone: 'good', note: '200 PPI and up is the density of phones, tablets and high-end laptops. Text looks printed.' };
}

const f = (n: number, d: number) => n.toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'screen-ppi',
  title: 'Screen PPI Calculator',
  category: 'developer',
  description: 'Find the pixel density (PPI) of any monitor, laptop or phone from its resolution and diagonal size, with dot pitch and physical screen size.',
  metaDescription: 'Calculate screen PPI from resolution and diagonal size. See dot pitch, physical width and height, and if the density is low or retina-class.',
  updated: '2026-11-26',
  keywords: ['ppi calculator', 'pixel density calculator', 'screen ppi', 'monitor ppi', 'dot pitch calculator', 'pixels per inch', 'retina ppi'],
  inputs: [
    { id: 'w', label: 'Horizontal resolution', type: 'number', default: 2560, min: 1, step: 1, suffix: 'px', info: 'Pixels across the screen, such as 1920, 2560 or 3840.' },
    { id: 'h', label: 'Vertical resolution', type: 'number', default: 1440, min: 1, step: 1, suffix: 'px', info: 'Pixels down the screen, such as 1080, 1440 or 2160.' },
    { id: 'diag', label: 'Diagonal screen size', type: 'number', default: 27, min: 0, step: 0.1, suffix: 'in', info: 'The advertised screen size in inches, measured corner to corner across the visible panel.' },
  ],
  outputs: [
    { id: 'ppi', label: 'Pixel density', format: 'number', precision: 1, suffix: 'PPI', primary: true, info: 'Pixels per inch: the diagonal length in pixels divided by the diagonal size in inches.' },
    { id: 'pitch', label: 'Dot pitch', format: 'number', precision: 3, suffix: 'mm', info: 'The distance from the centre of one pixel to the next: 25.4 mm divided by the PPI.' },
    { id: 'width', label: 'Screen width', format: 'number', precision: 2, suffix: 'in', info: 'Physical width of the visible screen, assuming square pixels.' },
    { id: 'height', label: 'Screen height', format: 'number', precision: 2, suffix: 'in', info: 'Physical height of the visible screen, assuming square pixels.' },
    { id: 'verdict', label: 'Density band', format: 'text', info: 'Plain-language guidance for desktop viewing: under 110 low, 110 to 160 typical, 160 to 200 sharp, 200 and up retina-class. A rule of thumb, not a standard.' },
  ],
  compute: (v) => {
    const w = num(v.w);
    const h = num(v.h);
    const d = num(v.diag);
    if (w === null || h === null || d === null) return { ppi: null };
    if (w <= 0 || h <= 0) return { ppi: null, error: 'Enter a resolution above zero in both directions.' };
    if (d <= 0) return { ppi: null, error: 'Enter a diagonal size above zero.' };
    const diagPx = Math.hypot(w, h);
    const ppi = diagPx / d;
    const pitch = 25.4 / ppi;
    const b = band(ppi);
    return {
      ppi,
      pitch,
      width: (d * w) / diagPx,
      height: (d * h) / diagPx,
      verdict: b.label,
      tone: b.tone,
      badge: b.label,
      note: b.note,
      chart: {
        type: 'scale',
        title: 'Pixel density',
        min: 50,
        max: 400,
        value: Math.min(Math.max(ppi, 50), 400),
        valueLabel: `${f(ppi, 1)} PPI`,
        bands: [
          { from: 50, to: 110, label: 'Low', tone: 'warn' },
          { from: 110, to: 160, label: 'Typical', tone: 'ok' },
          { from: 160, to: 200, label: 'Sharp', tone: 'good' },
          { from: 200, to: 400, label: 'Retina-class', tone: 'good' },
        ],
      },
      steps: [
        `Diagonal in pixels = √(${f(w, 0)}² + ${f(h, 0)}²) = ${f(diagPx, 1)} px`,
        `PPI = ${f(diagPx, 1)} ÷ ${f(d, 2)} in = ${f(ppi, 2)}`,
        `Dot pitch = 25.4 ÷ ${f(ppi, 2)} = ${f(pitch, 3)} mm`,
      ],
    };
  },
  content: {
    formula: ['PPI = √(width² + height²) ÷ diagonal in inches', 'Dot pitch (mm) = 25.4 ÷ PPI', 'Width = diagonal × width px ÷ √(width² + height²)'],
    body: [
      'Pixels per inch (PPI) says how tightly a screen packs its pixels. The diagonal of the pixel grid comes from the Pythagorean theorem, and dividing by the diagonal size in inches gives the density. A 2560 x 1440 monitor at 27 inches works out to about 108.8 PPI, while a 3840 x 2160 (4K) panel of the same size reaches about 163.2.',
      'Dot pitch is the same fact seen from the other side: the gap between neighbouring pixel centres in millimetres. At 108.8 PPI it is about 0.233 mm; at 163.2 PPI it drops to 0.156 mm. The width and height come from the same maths, and they assume square pixels, which is true of nearly all modern panels.',
      'The density bands are a rule of thumb for normal desktop viewing distance, not an official standard. Under about 110 PPI you may see pixel edges (a 27 inch 1440p monitor sits just below that line); 110 to 160 is typical for desktop monitors; 160 to 200 looks crisp; and 200 and up is the retina-class range of phones and premium laptops. Sitting further away makes a lower density look sharper, so a TV can get away with far fewer PPI than a phone.',
      'Use the advertised diagonal for the screen, not the outer bezel. Real panels differ a little from their marketed size, so treat the result as a close estimate.',
    ],
    faq: [
      { q: 'What is the PPI of a 27 inch 1440p monitor?', a: 'A 2560 x 1440 screen at 27 inches has about 108.8 PPI and a dot pitch of about 0.233 mm. That is just under the 110 PPI line, so it lands in the low density band, though it is a very common desktop monitor.' },
      { q: 'What is the PPI of a 27 inch 4K monitor?', a: 'A 3840 x 2160 screen at 27 inches has about 163.2 PPI and a dot pitch of about 0.156 mm, which falls in the sharp band.' },
      { q: 'Is a higher PPI always better?', a: 'Not always. Higher PPI gives smoother text and images, but past the point where your eye cannot resolve single pixels the gain is small. It also needs a stronger graphics card and usually display scaling to keep text readable.' },
      { q: 'What is the difference between PPI and DPI?', a: 'PPI counts pixels on a screen. DPI counts printed dots per inch, such as for a printer. People often use them interchangeably, but this calculator measures screen pixels.' },
    ],
  },
  related: ['ratio', 'pythagorean-theorem', 'length-converter'],
  examples: [
    // sqrt(2560^2 + 1440^2) = sqrt(8,627,200) = 2937.21; / 27 = 108.7855; pitch = 25.4 / 108.7855 = 0.23349
    // width = 27 * 2560 / 2937.21 = 23.5325 in; height = 27 * 1440 / 2937.21 = 13.2371 in
    { values: { w: 2560, h: 1440, diag: 27 }, expect: { ppi: 108.78554, pitch: 0.233487, width: 23.53254, height: 13.23705, verdict: 'Low density' }, tolerance: 1e-5 },
    // sqrt(3840^2 + 2160^2) = sqrt(20,411,200) = 4405.81; / 27 = 163.1783; pitch = 0.155658
    { values: { w: 3840, h: 2160, diag: 27 }, expect: { ppi: 163.17831, pitch: 0.155658, verdict: 'Sharp' }, tolerance: 1e-5 },
    // sqrt(4,852,800) = 2202.907; / 24 = 91.7878
    { values: { w: 1920, h: 1080, diag: 24 }, expect: { ppi: 91.7878, verdict: 'Low density' }, tolerance: 1e-5 },
    // 2532 x 1170 at 6.1 in: sqrt(7,779,... ) = 2789.25; / 6.1 = 457.254
    { values: { w: 2532, h: 1170, diag: 6.1 }, expect: { ppi: 457.25435, verdict: 'Retina-class' }, tolerance: 1e-5 },
  ],
});
