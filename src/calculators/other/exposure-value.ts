import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const log2 = (x: number) => Math.log(x) / Math.LN2;

/** Shutter time in seconds as text: 1/x s for fast speeds, plain seconds for slow ones. */
const shutterText = (t: number) => {
  if (t >= 1) return `${fmt(+t.toFixed(2))} s`;
  const d = 1 / t;
  return `1/${d >= 10 ? Math.round(d) : fmt(+d.toFixed(1))} s`;
};

// Aperture series used for the chart (full stops, marked values).
const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

export default defineCalculator({
  slug: 'exposure-value',
  title: 'Photo Exposure Equivalents Calculator',
  category: 'other',
  description: 'Work out exposure value (EV) from aperture, shutter speed and ISO, then find the equivalent shutter speed after you change the aperture or ISO.',
  metaDescription: 'Exposure value calculator: enter f-number, shutter speed and ISO to get EV, then the equivalent shutter speed for a new aperture or ISO, in stops.',
  updated: '2026-11-28',
  keywords: ['exposure value calculator', 'ev calculator photography', 'equivalent exposure calculator', 'aperture shutter iso stops', 'f-stop shutter speed equivalent', 'ev100'],
  inputs: [
    { id: 'aperture', label: 'Aperture (f-number)', type: 'number', prefix: 'f/', default: 8, min: 0.5, step: 0.1, info: 'The f-number on your lens, for example 8 for f/8. Marked values such as 5.6 are rounded, the exact figure is 5.657.' },
    { id: 'mode', label: 'Shutter entered as', type: 'select', segmented: true, default: 'frac', options: [{ value: 'frac', label: '1/x second' }, { value: 'sec', label: 'Seconds' }], info: 'Choose 1/x second for fast speeds (type 125 for 1/125 s) or Seconds for long exposures (type 2 for 2 s).' },
    { id: 'shutter', label: 'Shutter speed', type: 'number', default: 125, min: 0, step: 1, info: 'With 1/x second, enter the bottom number (125 means 1/125 s). With Seconds, enter the time itself (0.5 means half a second).' },
    { id: 'iso', label: 'ISO', type: 'number', default: 100, min: 1, step: 50, info: 'Sensor sensitivity of your current shot.' },
    { id: 'newAperture', label: 'New aperture (optional)', type: 'number', prefix: 'f/', default: 4, optional: true, min: 0.5, step: 0.1, info: 'The f-number you want to switch to. Leave blank to keep the current aperture.' },
    { id: 'newIso', label: 'New ISO (optional)', type: 'number', optional: true, min: 1, step: 50, info: 'The ISO you want to switch to. Leave blank to keep the current ISO.' },
  ],
  outputs: [
    { id: 'ev', label: 'Exposure value (EV)', format: 'number', precision: 2, primary: true, info: 'EV = log2(N² ÷ t) from aperture and shutter, the ISO 100 reference. Each whole step is one stop of light.' },
    { id: 'ev100', label: 'Scene EV at ISO 100', format: 'number', precision: 2, info: 'EV corrected for your ISO: EV minus log2(ISO ÷ 100). It describes how bright the scene is, whatever ISO you shot at.' },
    { id: 'newShutter', label: 'Equivalent shutter speed', format: 'text', info: 'The shutter speed that keeps the same exposure after the new aperture and ISO.' },
    { id: 'newDenom', label: 'Equivalent shutter as 1/x', format: 'number', precision: 2, suffix: '(x in 1/x s)', info: 'The equivalent shutter speed written as 1 ÷ t. Below 1 it means a time longer than one second.' },
    { id: 'apStops', label: 'Aperture change', format: 'number', precision: 2, suffix: 'stops', info: 'Stops of light gained (positive) or lost (negative) by changing aperture: 2 × log2(old N ÷ new N).' },
    { id: 'isoStops', label: 'ISO change', format: 'number', precision: 2, suffix: 'stops', info: 'Stops of sensitivity gained (positive) or lost (negative): log2(new ISO ÷ old ISO).' },
  ],
  compute: (x) => {
    const n1 = num(x.aperture);
    const s = num(x.shutter);
    const iso1 = num(x.iso);
    if (n1 === null || s === null || iso1 === null) return { ev: null };
    if (n1 <= 0 || s <= 0 || iso1 <= 0) return { ev: null, error: 'Aperture, shutter speed and ISO must all be above 0.' };
    const n2 = num(x.newAperture) ?? n1;
    const iso2 = num(x.newIso) ?? iso1;
    if (n2 <= 0 || iso2 <= 0) return { ev: null, error: 'The new aperture and new ISO must be above 0 (or left blank).' };
    const t1 = String(x.mode) === 'sec' ? s : 1 / s;

    const ev = log2((n1 * n1) / t1);
    const ev100 = ev - log2(iso1 / 100);
    // Same exposure: t grows with N^2 and shrinks as ISO rises.
    const t2 = t1 * (n2 / n1) ** 2 * (iso1 / iso2);
    const apStops = 2 * log2(n1 / n2);
    const isoStops = log2(iso2 / iso1);
    const text = shutterText(t2);

    // Chart: shutter (as 1/x s) that keeps the new exposure at each full-stop aperture.
    const chartDenoms = APERTURES.map((a) => 1 / (t1 * (a / n1) ** 2 * (iso1 / iso2)));
    return {
      ev,
      ev100,
      newShutter: text,
      newDenom: 1 / t2,
      apStops,
      isoStops,
      tone: 'good',
      badge: `EV ${ev.toFixed(1)} · ${text}`,
      note: 'Equivalent exposures give the same brightness but not the same look: aperture changes depth of field and shutter changes motion blur.',
      chart: {
        type: 'bar',
        title: `Same exposure: shutter as 1/x s at each aperture (ISO ${fmt(iso2)})`,
        categories: APERTURES.map((a) => `f/${a}`),
        series: [{ name: 'Shutter 1/x s', values: chartDenoms }],
        format: { format: 'number', precision: 0 },
      },
      steps: [
        `EV = log2(${fmt(n1)}² ÷ ${fmt(+t1.toPrecision(6))}) = log2(${fmt(+((n1 * n1) / t1).toPrecision(8))}) = ${ev.toFixed(2)}`,
        `Aperture f/${fmt(n1)} to f/${fmt(n2)} is ${fmt(+apStops.toFixed(2))} stops; ISO ${fmt(iso1)} to ${fmt(iso2)} is ${fmt(+isoStops.toFixed(2))} stops`,
        `t2 = ${fmt(+t1.toPrecision(6))} × (${fmt(n2)} ÷ ${fmt(n1)})² × (${fmt(iso1)} ÷ ${fmt(iso2)}) = ${fmt(+t2.toPrecision(6))} s, about ${text}`,
      ],
    };
  },
  content: {
    formula: ['EV = log2(N² ÷ t)   (N = f-number, t = shutter time in seconds, ISO 100 reference)', 'Scene EV at ISO 100 = EV − log2(ISO ÷ 100)', 'Equivalent shutter: t2 = t1 × (N2 ÷ N1)² × (ISO1 ÷ ISO2)', 'Stops: aperture = 2 × log2(N1 ÷ N2), ISO = log2(ISO2 ÷ ISO1)'],
    body: [
      'Exposure value packs aperture and shutter speed into one number. Every combination with the same EV lets in the same amount of light, so f/8 at 1/125 s and f/4 at 1/500 s are the same exposure. A step of 1 EV is one stop, a doubling or halving of light.',
      'Light through the lens scales with the square of the f-number, which is why opening from f/8 to f/4 is two stops (a factor of four) and needs a shutter four times faster. Raising ISO by one stop doubles sensitivity, so it lets you halve the shutter time. This calculator applies both changes to give the equivalent shutter speed.',
      'Marked f-numbers are rounded. The true series is powers of the square root of 2, so f/5.6 is really 5.657 and f/2.8 is 2.828. The rounding is tiny, but it is why the printed results can differ from a camera by a fraction of a stop.',
    ],
    sections: [
      {
        heading: 'Worked examples',
        paragraphs: [
          'f/8 at 1/125 s: EV = log2(8² × 125) = log2(8000) = 12.97. Open to f/4 and the shutter becomes (1/125) × (4 ÷ 8)² = 1/500 s.',
          'f/2.8 to f/5.6 is two stops, since (5.6 ÷ 2.8)² = 4. A shutter of 1/500 s becomes 1/125 s to keep the exposure.',
        ],
      },
    ],
    faq: [
      { q: 'What is the exposure value of f/8 at 1/125 s?', a: 'EV = log2(64 × 125) = log2(8000) = 12.97, at ISO 100.' },
      { q: 'What shutter speed is equivalent to f/8 at 1/125 s if I open to f/4?', a: 'f/4 is two stops wider than f/8, so the shutter becomes (1/125) × (4 ÷ 8)² = 1/500 s.' },
      { q: 'How many stops is f/2.8 to f/5.6?', a: 'Two stops, because (5.6 ÷ 2.8)² = 4 and each stop is a factor of 2. A 1/500 s shutter at f/2.8 becomes 1/125 s at f/5.6.' },
      { q: 'How does ISO change the equivalent shutter speed?', a: 'Each stop of ISO is a factor of 2. Going from ISO 200 to ISO 800 is 2 stops, so at the same aperture 1/125 s becomes 1/500 s.' },
      { q: 'Why do equivalent exposures still look different?', a: 'They have equal brightness, but a wider aperture gives shallower depth of field and a slower shutter gives more motion blur.' },
    ],
    sources: [{ label: 'ISO 2720: general purpose photographic exposure meters (exposure value definition)' }],
  },
  related: ['aspect-ratio'],
  examples: [
    // f/8, 1/125: EV = log2(64*125) = log2(8000) = 12.96578; f/4: t2 = 1/125 * (4/8)^2 = 1/500; 2 stops gained
    { values: { aperture: 8, mode: 'frac', shutter: 125, iso: 100, newAperture: 4, newIso: null }, expect: { ev: 12.96578, ev100: 12.96578, newShutter: '1/500 s', newDenom: 500, apStops: 2, isoStops: 0 }, tolerance: 1e-4 },
    // f/2.8, 1/500: EV = log2(7.84*500) = log2(3920) = 11.93663; f/5.6: (5.6/2.8)^2 = 4 -> 1/125; -2 stops
    { values: { aperture: 2.8, mode: 'frac', shutter: 500, iso: 100, newAperture: 5.6, newIso: null }, expect: { ev: 11.93663, newShutter: '1/125 s', newDenom: 125, apStops: -2 }, tolerance: 1e-4 },
    // ISO 200 -> 800 at f/8, 1/125: EV 12.96578; EV100 = EV - log2(2) = 11.96578; t2 = 1/125 * (200/800) = 1/500
    { values: { aperture: 8, mode: 'frac', shutter: 125, iso: 200, newAperture: null, newIso: 800 }, expect: { ev: 12.96578, ev100: 11.96578, newDenom: 500, apStops: 0, isoStops: 2 }, tolerance: 1e-4 },
    // 2 s at f/16: EV = log2(256/2) = log2(128) = 7; f/8: t2 = 2*(8/16)^2 = 0.5 s
    { values: { aperture: 16, mode: 'sec', shutter: 2, iso: 100, newAperture: 8, newIso: null }, expect: { ev: 7, newDenom: 2, apStops: 2 }, tolerance: 1e-9 },
  ],
});
