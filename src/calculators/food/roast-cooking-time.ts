import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const LB_KG = 0.45359237;

function hm(min: number): string {
  const m = Math.round(min);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return hh ? (mm ? `${hh} h ${mm} min` : `${hh} h`) : `${mm} min`;
}

function clock(min: number): string {
  let m = Math.round(min);
  m = ((m % 1440) + 1440) % 1440;
  const hh = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return `${hh % 12 || 12}:${mm} ${hh < 12 ? 'am' : 'pm'}`;
}

const SERVE_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const h = 10 + i / 2;
  return { value: String(h * 60), label: clock(h * 60) };
});

export default defineCalculator({
  slug: 'roast-cooking-time',
  title: 'Roast Cooking Time Calculator',
  category: 'food',
  description: 'Work out how long a roast takes from its weight and your recipe\'s minutes per pound, then when to put it in the oven so it is rested by dinner.',
  keywords: ['roast cooking time', 'how long to cook a roast', 'roast time per pound', 'prime rib cooking time', 'when to put roast in oven', 'roast beef cooking time calculator'],
  inputs: [
    { id: 'weight', label: 'Roast weight', type: 'number', unit: 'mass', units: ['lb', 'kg'], defaultUnit: 'lb', default: 12, min: 0.1, info: 'The weight on the label, before cooking. Bone-in or boneless, use the number your recipe uses.' },
    { id: 'perLb', label: 'Minutes per pound', type: 'number', default: 15, min: 1, max: 120, step: 1, info: 'Take this from your recipe. It depends on the cut, the oven temperature and how done you like it. This calculator does not choose it for you.' },
    { id: 'rest', label: 'Resting time (min)', type: 'number', default: 20, min: 0, max: 120, step: 5, info: 'Time the roast sits under foil before carving. Many recipes suggest 15 to 30 minutes; use your recipe\'s figure.' },
    { id: 'serve', label: 'Serve dinner at', type: 'select', default: '1050', options: SERVE_OPTIONS, info: 'When you want to start carving and eating.' },
  ],
  outputs: [
    { id: 'cookTime', label: 'Cooking time', primary: true, format: 'text', info: 'Weight in pounds multiplied by minutes per pound.' },
    { id: 'ovenIn', label: 'Put it in the oven at', format: 'text', info: 'Serve time minus the rest minus the cooking time.' },
    { id: 'ovenOut', label: 'Take it out at', format: 'text', info: 'Serve time minus the resting time.' },
    { id: 'thermo', label: 'Check with a thermometer', format: 'text', info: 'Time per pound is a guide. Roasts vary, so confirm with a food thermometer against the USDA safe temperature chart.' },
  ],
  compute: (v) => {
    const kg = num(v.weight);
    const perLb = num(v.perLb);
    const rest = num(v.rest);
    const serve = Number(v.serve);
    if (kg === null || kg <= 0) return { cookTime: null, error: 'Enter the roast weight.' };
    if (perLb === null || perLb <= 0) return { cookTime: null, error: 'Enter the minutes per pound from your recipe.' };
    if (rest === null || rest < 0) return { cookTime: null, error: 'Enter a resting time of 0 or more.' };
    if (!Number.isFinite(serve)) return { cookTime: null, error: 'Choose a serve time.' };
    const lb = kg / LB_KG;
    const cook = lb * perLb;
    const out = serve - rest;
    const start = out - cook;
    const startsYesterday = start < 0;
    return {
      cookTime: hm(cook),
      ovenIn: clock(start) + (startsYesterday ? ' (the day before)' : ''),
      ovenOut: clock(out),
      thermo: 'Yes, always',
      tone: startsYesterday ? 'warn' : 'good',
      badge: `Oven in at ${clock(start)}`,
      chart: {
        type: 'bar',
        title: 'Your timeline (minutes)',
        categories: ['Cooking', 'Resting'],
        series: [{ name: 'Minutes', values: [Math.round(cook), Math.round(rest)] }],
        format: { format: 'number', suffix: ' min' },
      },
      steps: [
        `${+lb.toFixed(2)} lb × ${perLb} min per lb = ${hm(cook)} of cooking.`,
        `Out of the oven ${clock(out)} (serve ${clock(serve)} minus ${rest} min rest).`,
        `In the oven ${clock(start)} (out time minus ${hm(cook)}).`,
      ],
      note: 'Minutes per pound is a guide, not a promise. The roast is done when a thermometer says so.',
    };
  },
  content: {
    formula: [
      'Cooking time = weight in lb × minutes per lb',
      'Put it in the oven = serve time − rest − cooking time',
    ],
    body: [
      'Enter the weight of your roast, the minutes per pound from your recipe, how long it rests and when you want to eat. The calculator multiplies weight by minutes per pound, then counts backwards from dinner to tell you when the roast goes in and when it comes out.',
      'For example, a 12 lb roast at 15 minutes per pound cooks for 180 minutes (3 h). With a 20-minute rest and dinner at 5:30 pm, it comes out at 5:10 pm and goes in at 2:10 pm.',
      'Minutes per pound changes with the cut, the oven temperature and how done you like the meat, so this tool asks you for it rather than guessing. Start checking early and use a food thermometer, because a roast that is done early can rest, while one that is late keeps everyone waiting.',
    ],
    sections: [
      {
        heading: 'Why rest a roast?',
        paragraphs: [
          'Resting lets the juices settle before carving, and the temperature usually rises a little after the roast leaves the oven. Resting time is also built into the timeline here, so the roast is ready to carve at the time you pick.',
          'If the answer says "the day before", the roast is too big for the time you chose. Move dinner later, raise the oven temperature in line with your recipe, or ask for a smaller roast.',
        ],
      },
    ],
    faq: [
      { q: 'How long does a 12 lb roast take at 15 minutes per pound?', a: '180 minutes, or 3 hours. 12 × 15 = 180.' },
      { q: 'When should I put a roast in for dinner at 5:30 pm?', a: 'With 180 minutes of cooking and a 20-minute rest, put it in at 2:10 pm. Out of the oven is 5:10 pm.' },
      { q: 'What minutes per pound should I use?', a: 'Use the figure in your recipe for your cut and oven temperature. The calculator does not pick one for you because it varies a lot.' },
      { q: 'Do I still need a thermometer?', a: 'Yes. Time per pound is only a guide. Check the internal temperature against the USDA safe minimum temperature chart.' },
      { q: 'Does it work in kilograms?', a: 'Yes. Switch the weight unit to kg and the calculator converts to pounds first (1 kg = 2.2046 lb).' },
    ],
    sources: [
      { label: 'USDA FSIS: Safe minimum internal temperature chart', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart' },
    ],
  },
  related: ['turkey-cooking-time', 'dinner-timeline', 'cooking-converter', 'recipe-scaler', 'party-food-quantity'],
  examples: [
    {
      // 12 lb x 15 = 180 min. Serve 17:30 (1050), rest 20 -> out 17:10; in 14:10.
      values: { weight: 12 * LB_KG, perLb: 15, rest: 20, serve: '1050' },
      expect: { cookTime: '3 h', ovenIn: '2:10 pm', ovenOut: '5:10 pm' },
    },
    {
      // 10 lb x 20 = 200 min. Serve 19:00 (1140), rest 30 -> out 18:30; in 15:10.
      values: { weight: 10 * LB_KG, perLb: 20, rest: 30, serve: '1140' },
      expect: { cookTime: '3 h 20 min', ovenIn: '3:10 pm', ovenOut: '6:30 pm' },
    },
  ],
});
