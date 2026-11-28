import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

// 1 kn = 1.852 km/h exactly; 1 mph = 1.609344 km/h exactly; m/s = km/h / 3.6.
const KMH_PER_KN = 1.852;
const KMH_PER_MPH = 1.609344;
const KMH_PER_MS = 3.6;
const TO_KMH: Record<string, number> = { kn: KMH_PER_KN, mph: KMH_PER_MPH, kmh: 1, ms: KMH_PER_MS };
const UNIT_LABEL: Record<string, string> = { kn: 'knots', mph: 'mph', kmh: 'km/h', ms: 'm/s' };

// Lowest whole-knot speed of each force 0..12 (WMO / UK Met Office table).
const LOWER_KN = [0, 1, 4, 7, 11, 17, 22, 28, 34, 41, 48, 56, 64];
const NAMES = ['Calm', 'Light air', 'Light breeze', 'Gentle breeze', 'Moderate breeze', 'Fresh breeze', 'Strong breeze', 'Near gale', 'Gale', 'Strong gale', 'Storm', 'Violent storm', 'Hurricane force'];
const BAND_TEXT = ['under 1 kn', '1 to 3 kn', '4 to 6 kn', '7 to 10 kn', '11 to 16 kn', '17 to 21 kn', '22 to 27 kn', '28 to 33 kn', '34 to 40 kn', '41 to 47 kn', '48 to 55 kn', '56 to 63 kn', '64 kn or more'];

const forceOf = (kn: number) => {
  const whole = Math.round(kn); // the table is in whole knots
  let f = 0;
  for (let i = 0; i < LOWER_KN.length; i++) if (whole >= LOWER_KN[i]) f = i;
  return f;
};

export default defineCalculator({
  slug: 'beaufort-scale',
  title: 'Beaufort Wind Scale Calculator',
  category: 'other',
  description: 'Convert a wind speed in knots, mph, km/h or m/s to its Beaufort force (0 to 12), a plain-English description and the speed in all four units.',
  keywords: ['beaufort scale calculator', 'beaufort wind scale', 'wind speed to beaufort force', 'mph to beaufort', 'knots to beaufort', 'gale force wind speed'],
  updated: '2026-11-28',
  inputs: [
    { id: 'speed', label: 'Wind speed', type: 'number', default: 25, min: 0, step: 1, info: 'Sustained wind speed, not gusts, in the unit chosen below.' },
    { id: 'unit', label: 'Unit', type: 'select', segmented: true, default: 'mph', options: [{ value: 'kn', label: 'knots' }, { value: 'mph', label: 'mph' }, { value: 'kmh', label: 'km/h' }, { value: 'ms', label: 'm/s' }], info: 'The unit your forecast or instrument reports in.' },
  ],
  outputs: [
    { id: 'force', label: 'Beaufort force', format: 'integer', primary: true, info: 'Force 0 (calm) to 12 (hurricane force), from the speed in whole knots.' },
    { id: 'name', label: 'Description', format: 'text', info: 'The official name for this force.' },
    { id: 'kn', label: 'Knots', format: 'number', precision: 2, info: 'Speed in nautical miles per hour.' },
    { id: 'mph', label: 'mph', format: 'number', precision: 2, info: 'Speed in miles per hour.' },
    { id: 'kmh', label: 'km/h', format: 'number', precision: 2, info: 'Speed in kilometres per hour.' },
    { id: 'ms', label: 'm/s', format: 'number', precision: 2, info: 'Speed in metres per second.' },
  ],
  compute: (x) => {
    const s = num(x.speed);
    if (s === null) return { force: null };
    if (s < 0) return { force: null, error: 'Enter a wind speed of 0 or more.' };
    const unit = String(x.unit) in TO_KMH ? String(x.unit) : 'mph';
    const kmh = s * TO_KMH[unit];
    const kn = kmh / KMH_PER_KN;
    const f = forceOf(kn);
    const tone = f <= 4 ? 'good' : f <= 6 ? 'ok' : f <= 9 ? 'warn' : 'bad';
    return {
      force: f,
      name: NAMES[f],
      kn,
      mph: kmh / KMH_PER_MPH,
      kmh,
      ms: kmh / KMH_PER_MS,
      tone,
      badge: `Force ${f}: ${NAMES[f]}`,
      chart: {
        type: 'bar',
        title: `Lowest speed of each Beaufort force (${UNIT_LABEL[unit]})`,
        categories: LOWER_KN.map((_, i) => `F${i}`),
        series: [{ name: 'Band starts at', values: LOWER_KN.map((k) => (k * KMH_PER_KN) / TO_KMH[unit]) }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `${fmt(s)} ${UNIT_LABEL[unit]} = ${fmt(+kn.toFixed(2))} knots (1 kn = 1.852 km/h)`,
        `Rounded to ${fmt(Math.round(kn))} kn, which falls in the ${BAND_TEXT[f]} band`,
        `Force ${f}: ${NAMES[f]}`,
      ],
      note: 'A rough guide to sea and land effects, not a warning service. Check your national forecast for warnings.',
    };
  },
  content: {
    formula: ['Knots = km/h ÷ 1.852 = mph ÷ 1.150779 = m/s ÷ 0.514444', 'Round to the nearest whole knot, then read the force from the Beaufort table', 'Force bands (knots): 0 <1, 1 1-3, 2 4-6, 3 7-10, 4 11-16, 5 17-21, 6 22-27, 7 28-33, 8 34-40, 9 41-47, 10 48-55, 11 56-63, 12 64+'],
    body: [
      'The Beaufort scale sorts wind into 13 forces, from 0 (calm) to 12 (hurricane force). It was devised for sailors and is still used in shipping forecasts. This calculator converts your speed to knots, rounds to the nearest whole knot because the published table is in whole knots, and reads off the force.',
      'For example, 25 mph is 25 ÷ 1.150779 = 21.72 knots. That rounds to 22 knots, the bottom of Force 6, a strong breeze. 40 knots is Force 8, a gale, which is 46.03 mph or 74.08 km/h. Force 8 is where wind starts breaking twigs and makes walking hard.',
      'The scale describes typical effects at sea and on land, so treat it as a guide. Gusts are stronger than the sustained speed the scale uses.',
    ],
    faq: [
      { q: 'What Beaufort force is 25 mph?', a: '25 mph is 21.72 knots, which rounds to 22 knots. That is Force 6, a strong breeze.' },
      { q: 'What speed is a Force 8 gale?', a: 'Force 8 covers 34 to 40 knots, which is about 39 to 46 mph or 63 to 74 km/h. 40 knots is 46.03 mph.' },
      { q: 'What Beaufort force is 50 mph?', a: '50 mph is 43.45 knots, which rounds to 43 knots. That is Force 9, a strong gale.' },
      { q: 'Which force counts as hurricane force?', a: 'Force 12 starts at 64 knots, which is about 73.6 mph or 118.5 km/h.' },
      { q: 'How do I convert between knots, mph, km/h and m/s?', a: '1 knot = 1.852 km/h = 1.150779 mph = 0.514444 m/s. This calculator shows all four for your speed.' },
    ],
    sources: [{ label: 'WMO / UK Met Office Beaufort scale' }],
  },
  related: ['wind-chill', 'speed-converter'],
  examples: [
    // 25 mph: km/h = 40.2336; kn = 40.2336/1.852 = 21.7246; rounds to 22 -> force 6; m/s = 11.176
    { values: { speed: 25, unit: 'mph' }, expect: { force: 6, name: 'Strong breeze', kn: 21.7246, kmh: 40.2336, ms: 11.176 }, tolerance: 0.001 },
    // 40 kn: Force 8; km/h = 74.08; mph = 74.08/1.609344 = 46.0312; m/s = 20.5778
    { values: { speed: 40, unit: 'kn' }, expect: { force: 8, name: 'Gale', kmh: 74.08, mph: 46.0312, ms: 20.5778 }, tolerance: 0.001 },
    // 20 kn: Force 5; mph = 37.04/1.609344 = 23.0156; m/s = 10.2889
    { values: { speed: 20, unit: 'kn' }, expect: { force: 5, name: 'Fresh breeze', mph: 23.0156, kmh: 37.04, ms: 10.2889 }, tolerance: 0.001 },
    // 50 mph: km/h = 80.4672; kn = 43.4492 -> 43 -> force 9
    { values: { speed: 50, unit: 'mph' }, expect: { force: 9, name: 'Strong gale', kn: 43.4492 }, tolerance: 0.001 },
  ],
});
