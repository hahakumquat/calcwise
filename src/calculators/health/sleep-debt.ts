import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ids = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];

export default defineCalculator({
  slug: 'sleep-debt',
  title: 'Sleep Debt Calculator',
  category: 'health',
  description: 'Add up how many hours of sleep you owe this week against your own nightly target, and see how much extra sleep per night would pay it back.',
  keywords: ['sleep debt calculator', 'how much sleep do i owe', 'weekly sleep deficit', 'catch up on sleep', 'sleep deficit calculator', 'sleep debt hours'],
  updated: '2026-11-20',
  inputs: [
    { id: 'target', label: 'Your nightly sleep target', type: 'number', suffix: 'hours', default: 8, min: 1, max: 14, step: 0.25, info: 'The amount that leaves you feeling rested. Needs differ from person to person, so use your own number.' },
    ...DAYS.map((d, i) => ({ id: ids[i], label: `${d} night`, type: 'number' as const, suffix: 'hours', default: [6, 6.5, 7, 5, 6, 9, 8][i], min: 0, max: 24, step: 0.25, info: `Hours you actually slept on ${d} night.` })),
    { id: 'nights', label: 'Pay it back over', type: 'number', suffix: 'nights', default: 7, min: 1, max: 60, step: 1, info: 'How many nights you want to spread the catch-up across.' },
  ],
  outputs: [
    { id: 'debt', label: 'Net sleep debt', format: 'number', suffix: ' h', primary: true, info: 'Hours short on the nights you slept less than your target, minus the hours extra on the nights you slept more (never below 0).' },
    { id: 'deficit', label: 'Hours short in total', format: 'number', suffix: ' h', info: 'Sum of the shortfall on every night under your target.' },
    { id: 'surplus', label: 'Extra hours slept', format: 'number', suffix: ' h', info: 'Sum of the hours over your target on the other nights.' },
    { id: 'perNight', label: 'Extra sleep per night to catch up', format: 'number', suffix: ' h', info: 'Net debt ÷ nights to pay it back.' },
  ],
  compute: (v) => {
    const target = num(v.target);
    const nights = num(v.nights);
    if (target === null || nights === null || target <= 0 || nights < 1) return { debt: null };
    const slept: number[] = [];
    for (const id of ids) {
      const s = num(v[id]);
      if (s === null || s < 0 || s > 24) return { debt: null };
      slept.push(s);
    }
    let deficit = 0;
    let surplus = 0;
    for (const s of slept) {
      if (s < target) deficit += target - s;
      else surplus += s - target;
    }
    const debt = Math.max(0, deficit - surplus);
    const perNight = debt / nights;
    return {
      debt,
      deficit,
      surplus,
      perNight,
      note: debt === 0
        ? `You slept ${fmt(surplus, 2)} hours more than you were short, so there is no net debt this week against a ${fmt(target, 2)}-hour target.`
        : `Against a ${fmt(target, 2)}-hour target you were ${fmt(deficit, 2)} hours short and ${fmt(surplus, 2)} over, so the net debt is ${fmt(debt, 2)} hours. Spread over ${Math.round(nights)} nights, that is about ${Math.round(perNight * 60)} extra minutes a night. This is a simple tally for your own planning, not medical advice.`,
      chart: {
        type: 'bar',
        title: 'Hours slept each night',
        categories: DAYS,
        format: { format: 'number', suffix: ' h' },
        series: [{ name: 'Hours slept', values: slept }],
      },
      steps: [`Short = ${fmt(deficit, 2)} h, extra = ${fmt(surplus, 2)} h`, `Net debt = ${fmt(deficit, 2)} − ${fmt(surplus, 2)} = ${fmt(debt, 2)} h`, `Per night = ${fmt(debt, 2)} ÷ ${Math.round(nights)} = ${fmt(perNight, 2)} h`],
    };
  },
  content: {
    formula: ['Short = sum of (target − slept) on nights under target', 'Extra = sum of (slept − target) on the other nights', 'Net debt = max(0, short − extra)', 'Per night = net debt ÷ nights to pay it back'],
    body: [
      'Sleep debt is the gap between the sleep you wanted and the sleep you got. This calculator adds it up across a week: enter your own target and what you slept each night, and it shows the hours you are short, the hours you made up, and the net debt.',
      'The target is yours to set. Sleep needs vary between people, so the default of 8 hours is only a starting point. Enter the number that leaves you feeling rested.',
      'The catch-up figure spreads the net debt over the number of nights you choose. A small extra amount each night is usually easier to stick to than one long lie-in. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How is sleep debt calculated here?', a: 'For each night under your target, the shortfall is target minus hours slept. Nights over the target count as extra. Net debt is the total shortfall minus the total extra, never below zero.' },
      { q: 'What is the example result?', a: 'With an 8-hour target and nights of 6, 6.5, 7, 5, 6, 9 and 8 hours, the shortfall is 2 + 1.5 + 1 + 3 + 2 = 9.5 hours, the extra is 1 hour, and the net debt is 8.5 hours.' },
      { q: 'Can I really pay sleep debt back?', a: 'This tool only does the arithmetic. How well extra sleep makes up for lost sleep varies by person, and it is not a diagnosis. If you are always tired, talk to a doctor.' },
    ],
    sources: [{ label: 'CDC: About sleep', url: 'https://www.cdc.gov/sleep/about/index.html' }],
  },
  related: ['sleep', 'water-intake', 'tdee', 'fasting-window'],
  examples: [
    // deficits 2+1.5+1+3+2 = 9.5; surplus 1; net 8.5; /7 = 1.2142857.
    { values: { target: 8, d1: 6, d2: 6.5, d3: 7, d4: 5, d5: 6, d6: 9, d7: 8, nights: 7 }, expect: { debt: 8.5, deficit: 9.5, surplus: 1, perNight: 8.5 / 7 }, tolerance: 1e-6 },
    // 7 nights of 8.5 vs 8: surplus 3.5, deficit 0, debt 0.
    { values: { target: 8, d1: 8.5, d2: 8.5, d3: 8.5, d4: 8.5, d5: 8.5, d6: 8.5, d7: 8.5, nights: 7 }, expect: { debt: 0, deficit: 0, surplus: 3.5, perNight: 0 }, tolerance: 1e-6 },
  ],
});
