import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const LB_KG = 0.45359237;
const REST_H = 0.5; // our own assumption: rest the bird about 30 minutes before carving
const FROZEN_FACTOR = 1.5; // FSIS: "at least 50 percent longer" if not fully thawed

// Roasting time in hours at 325 F by upper weight limit (lb): [maxLb, minH, maxH].
const UNSTUFFED: [number, number, number][] = [
  [12, 2.75, 3],
  [14, 3, 3.75],
  [18, 3.75, 4.25],
  [20, 4.25, 4.5],
  [24, 4.5, 5],
];
const STUFFED: [number, number, number][] = [
  [12, 3, 3.5],
  [14, 3.5, 4],
  [18, 4, 4.25],
  [20, 4.25, 4.75],
  [24, 4.75, 5.25],
];
const BANDS = ['8–12 lb', '12–14 lb', '14–18 lb', '18–20 lb', '20–24 lb'];

function hm(h: number): string {
  const m = Math.round(h * 60);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return hh ? (mm ? `${hh} h ${mm} min` : `${hh} h`) : `${mm} min`;
}

function clock(h: number): string {
  let m = Math.round(h * 60);
  m = ((m % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return `${hh % 12 || 12}:${mm} ${hh < 12 ? 'am' : 'pm'}`;
}

const SERVE_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const h = 10 + i / 2;
  return { value: String(h), label: clock(h) };
});

export default defineCalculator({
  slug: 'turkey-cooking-time',
  title: 'Turkey Cooking Time Calculator',
  category: 'food',
  description: 'Turkey cooking time, when to put it in the oven and how many days to thaw it, based on weight, stuffing and dinner time (USDA 325°F guidance).',
  keywords: ['turkey cooking time', 'how long to cook a turkey', 'turkey thaw time', 'thanksgiving turkey calculator', 'turkey roasting time per pound', 'stuffed turkey cooking time'],
  inputs: [
    { id: 'weight', label: 'Turkey weight', type: 'number', unit: 'mass', units: ['lb', 'kg'], defaultUnit: 'lb', default: 16, min: 0.1, info: 'The weight on the package, before cooking. The USDA table covers whole turkeys from 8 to 24 lb (about 3.6 to 10.9 kg).' },
    { id: 'stuffed', label: 'Stuffed turkey', type: 'toggle', default: false, info: 'Turn on if you stuff the cavity. Stuffed birds take longer, and the stuffing itself must also reach 165°F. The USDA recommends cooking stuffing separately for even cooking.' },
    { id: 'state', label: 'Turkey is', type: 'select', default: 'thawed', options: [
      { value: 'thawed', label: 'Fresh or fully thawed' },
      { value: 'frozen', label: 'Frozen (thaw in the fridge first)' },
      { value: 'fromfrozen', label: 'Cooking from frozen' },
    ], info: 'Fresh or fully thawed birds use the standard times. Choose "Frozen" to see how many days to thaw in the fridge. Cooking from frozen takes at least 50% longer.' },
    { id: 'serve', label: 'Serve dinner at', type: 'select', default: '17', options: SERVE_OPTIONS, info: 'When you want to sit down and carve. The calculator allows a 30-minute rest after the turkey comes out of the oven.' },
  ],
  outputs: [
    { id: 'cookTime', label: 'Cooking time at 325°F', primary: true, format: 'text', info: 'The USDA time range for your weight in an oven at 325°F. Times are approximate: the turkey is done when a thermometer reads 165°F.' },
    { id: 'ovenIn', label: 'Put it in the oven between', format: 'text', info: 'Serve time minus the 30-minute rest minus the cooking time. The earlier time uses the longest estimate, the later time the shortest. Aim for the earlier one so the turkey is never late.' },
    { id: 'thaw', label: 'Thaw in the fridge', format: 'text', info: 'The USDA rule is about 24 hours in the refrigerator for every 4 to 5 lb. Start this many days before cooking.' },
    { id: 'safeTemp', label: 'Safe internal temperature', format: 'text', info: 'Check the thickest part of the breast, the innermost part of the thigh and the wing with a food thermometer. Stuffing must also reach 165°F.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    if (kg === null || kg <= 0) return { cookTime: null, error: 'Enter the turkey weight.' };
    const lb = kg / LB_KG;
    if (lb < 7.995 || lb > 24.005) return { cookTime: null, error: 'The USDA table covers whole turkeys of 8 to 24 lb (3.6 to 10.9 kg). For other sizes, rely on a thermometer.' };
    const stuffed = v.stuffed === 'on';
    const state = typeof v.state === 'string' ? v.state : 'thawed';
    const serve = Number(v.serve);
    if (!Number.isFinite(serve)) return { cookTime: null, error: 'Choose a serve time.' };

    const table = stuffed ? STUFFED : UNSTUFFED;
    const idx = table.findIndex((r) => lb <= r[0] + 0.005);
    const [, tmin, tmax] = table[idx];
    const f = state === 'fromfrozen' ? FROZEN_FACTOR : 1;
    const minH = tmin * f;
    const maxH = tmax * f;
    const out = serve - REST_H;
    const earliest = out - maxH;
    const latest = out - minH;

    const d1 = Math.ceil(lb / 5 - 1e-9);
    const d2 = Math.ceil(lb / 4 - 1e-9);
    const days = d1 === d2 ? `${d1} days` : `${d1} to ${d2} days`;
    const thaw = state === 'frozen' ? days : state === 'fromfrozen' ? 'Not thawed' : 'No thaw needed';

    return {
      cookTime: `${hm(minH)} to ${hm(maxH)}`,
      ovenIn: `${clock(earliest)} to ${clock(latest)}`,
      thaw,
      safeTemp: '165°F (74°C)',
      tone: state === 'fromfrozen' ? 'warn' : 'good',
      badge: state === 'fromfrozen' ? 'Check with a thermometer' : `Oven in by ${clock(earliest)}`,
      chart: {
        type: 'bar',
        title: `USDA roasting time at 325°F, ${stuffed ? 'stuffed' : 'unstuffed'} (hours)`,
        categories: BANDS,
        series: [
          { name: 'Shortest', values: table.map((r) => r[1]) },
          { name: 'Longest', values: table.map((r) => r[2]) },
        ],
        format: { format: 'number', suffix: ' h' },
        highlight: idx,
      },
      steps: [
        `${+lb.toFixed(1)} lb ${stuffed ? 'stuffed' : 'unstuffed'} falls in the ${BANDS[idx]} row: ${hm(tmin)} to ${hm(tmax)}.`,
        ...(f > 1 ? [`Cooking from frozen: times multiplied by ${f} (at least 50% longer).`] : []),
        `Out of the oven ${clock(out)} (serve ${clock(serve)} minus a 30-minute rest).`,
        `In the oven ${clock(earliest)} (longest estimate) to ${clock(latest)} (shortest estimate).`,
      ],
      note: 'Times are estimates. The turkey is done when a thermometer reads 165°F in the breast, thigh and wing.',
    };
  },
  content: {
    formula: [
      'Put it in the oven = serve time − 30 min rest − cooking time',
      'Fridge thaw days = ⌈lb ÷ 5⌉ to ⌈lb ÷ 4⌉ (24 hours per 4–5 lb)',
    ],
    body: [
      'Enter the weight of your whole turkey, say whether it is stuffed and when you want to eat. The calculator looks up the USDA roasting time for an oven at 325°F, then works backwards from dinner: it takes off a 30-minute rest before carving and the cooking time to tell you when the turkey should go in.',
      'You get a range because birds vary. Use the earlier oven time if you want a safety margin; a finished turkey rests happily under foil, a late one keeps everyone waiting. A 16 lb unstuffed turkey takes 3 h 45 min to 4 h 15 min, so for dinner at 5:00 pm it goes in between 12:15 pm and 12:45 pm.',
      'A frozen turkey must thaw first. In the refrigerator the USDA allows about 24 hours for every 4 to 5 lb, so a 16 lb bird needs 4 days. Thawing is the step people most often run out of time for, so check it before anything else.',
    ],
    sections: [
      {
        heading: 'Roasting times at 325°F',
        paragraphs: [
          'Unstuffed: 8–12 lb 2 h 45 min to 3 h; 12–14 lb 3 h to 3 h 45 min; 14–18 lb 3 h 45 min to 4 h 15 min; 18–20 lb 4 h 15 min to 4 h 30 min; 20–24 lb 4 h 30 min to 5 h.',
          'Stuffed: 8–12 lb 3 h to 3 h 30 min; 12–14 lb 3 h 30 min to 4 h; 14–18 lb 4 h to 4 h 15 min; 18–20 lb 4 h 15 min to 4 h 45 min; 20–24 lb 4 h 45 min to 5 h 15 min.',
          'These are approximate. A turkey that is not fully thawed takes at least 50% longer, which is why the calculator multiplies the times by 1.5 when you choose "Cooking from frozen". Always confirm with a thermometer.',
        ],
      },
    ],
    faq: [
      { q: 'How long does a 16 lb turkey take to cook?', a: 'An unstuffed 16 lb turkey takes 3 hours 45 minutes to 4 hours 15 minutes at 325°F. Stuffed, it takes 4 hours to 4 hours 15 minutes.' },
      { q: 'When should I put the turkey in for dinner at 5 pm?', a: 'For a 16 lb unstuffed turkey, between 12:15 pm and 12:45 pm. That allows 3 h 45 min to 4 h 15 min of cooking plus a 30-minute rest before carving.' },
      { q: 'How many days does it take to thaw a turkey in the fridge?', a: 'About 24 hours for every 4 to 5 lb. A 16 lb turkey takes 4 days. Allow an extra day if your fridge is very cold or the bird is large.' },
      { q: 'What temperature is a turkey done?', a: '165°F (74°C) in the thickest part of the breast, the innermost part of the thigh and the wing. If stuffed, the centre of the stuffing must also reach 165°F.' },
      { q: 'Can I cook a turkey from frozen?', a: 'Yes, the USDA says it is safe, but it takes at least 50% longer than a thawed bird. The calculator multiplies the time by 1.5; use a thermometer to know when it is done.' },
    ],
    sources: [
      { label: 'USDA FSIS: Let\'s Talk Turkey, a consumer guide to safely roasting a turkey', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/lets-talk-turkey-roasting' },
      { label: 'USDA FSIS: Turkey Basics, safe cooking', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-basics-safe-cooking' },
      { label: 'USDA FSIS: Stuffing and food safety', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/stuffing-and-food-safety' },
      { label: 'USDA FSIS: Turkey from farm to table', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-farm-table' },
    ],
  },
  related: ['cooking-converter', 'recipe-scaler', 'weight-converter', 'time-duration'],
  examples: [
    {
      // 16 lb is in the 14-18 lb row: 3.75 to 4.25 h. Serve 17:00, rest 0.5 h -> out 16:30; in 12:15 (4.25 h) to 12:45 (3.75 h).
      // Thaw: ceil(16/5) = 4, ceil(16/4) = 4 -> 4 days.
      values: { weight: 16 * LB_KG, stuffed: 'off', state: 'frozen', serve: '17' },
      expect: { cookTime: '3 h 45 min to 4 h 15 min', ovenIn: '12:15 pm to 12:45 pm', thaw: '4 days', safeTemp: '165°F (74°C)' },
    },
    {
      // 12 lb stuffed: row 8-12 lb, 3 to 3.5 h. Serve 18:00 -> out 17:30; in 14:00 to 14:30. Thaw: ceil(2.4)=3, ceil(3)=3 -> 3 days. Fresh: no thaw.
      values: { weight: 12 * LB_KG, stuffed: 'on', state: 'thawed', serve: '18' },
      expect: { cookTime: '3 h to 3 h 30 min', ovenIn: '2:00 pm to 2:30 pm', thaw: 'No thaw needed' },
    },
    {
      // 20 lb unstuffed (row 18-20: 4.25 to 4.5 h). Serve 17:30 -> out 17:00; in 12:30 (4.5 h) to 12:45 (4.25 h). Thaw: ceil(20/5)=4 to ceil(20/4)=5 days.
      values: { weight: 20 * LB_KG, stuffed: 'off', state: 'frozen', serve: '17.5' },
      expect: { cookTime: '4 h 15 min to 4 h 30 min', ovenIn: '12:30 pm to 12:45 pm', thaw: '4 to 5 days' },
    },
  ],
});
