import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// Half-hour clock options "00:00" .. "23:30".
const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 ? '30' : '00';
  const hh = String(h).padStart(2, '0');
  return { value: `${hh}:${m}`, label: `${hh}:${m}` };
});
const toHours = (t: unknown): number | null => {
  const m = /^(\d{2}):(\d{2})$/.exec(String(t ?? ''));
  return m ? Number(m[1]) + Number(m[2]) / 60 : null;
};

// Typical caffeine per serving in mg. Approximate: real drinks vary a lot by brand and brew.
const PRESETS: Record<string, number> = { coffee: 95, espresso: 65, tea: 45, cola: 35, energy: 80 };

export default defineCalculator({
  slug: 'caffeine-half-life',
  title: 'Caffeine Half-Life Calculator',
  category: 'health',
  description: 'See how much caffeine from your coffee is still in your system at bedtime, with a 24-hour decay chart and an adjustable half-life.',
  keywords: ['caffeine half life calculator', 'how long does caffeine last', 'caffeine at bedtime', 'caffeine decay', 'caffeine in system', 'last coffee before bed'],
  updated: '2026-11-21',
  inputs: [
    {
      id: 'preset', label: 'What did you have?', type: 'select', default: 'coffee',
      options: [
        { value: 'coffee', label: 'Cup of coffee (about 95 mg)' },
        { value: 'espresso', label: 'Espresso shot (about 65 mg)' },
        { value: 'tea', label: 'Cup of black tea (about 45 mg)' },
        { value: 'cola', label: 'Can of cola (about 35 mg)' },
        { value: 'energy', label: 'Small energy drink (about 80 mg)' },
        { value: 'custom', label: 'Enter my own amount' },
      ],
      info: 'Preset amounts are rough typical values. Real drinks vary a lot by brand, size and brew, so check the label if you can.',
    },
    { id: 'custom', label: 'Caffeine per serving', type: 'number', suffix: 'mg', default: 200, min: 1, max: 2000, step: 5, showWhen: { input: 'preset', is: 'custom' }, info: 'Milligrams of caffeine in one serving, from the label or your own estimate.' },
    { id: 'servings', label: 'Servings', type: 'number', default: 1, min: 0.5, max: 20, step: 0.5, info: 'How many servings you had at that time. The calculator treats them as one dose.' },
    { id: 'taken', label: 'Time you had it', type: 'select', default: '14:00', options: TIMES, info: '24-hour clock. Treated as a single dose at this moment.' },
    { id: 'bed', label: 'Bedtime', type: 'select', default: '22:00', options: TIMES, info: '24-hour clock. If bedtime is earlier than the time you had it, it counts as the next day.' },
    { id: 'half', label: 'Half-life', type: 'number', suffix: 'hours', default: 5, min: 1, max: 15, step: 0.5, info: 'About 5 hours is a commonly quoted average for adults, but it varies from person to person (for example with pregnancy, some medications and genetics).' },
  ],
  outputs: [
    { id: 'remaining', label: 'Caffeine left at bedtime', format: 'number', precision: 1, suffix: ' mg', primary: true, info: 'Dose × 0.5 raised to (hours until bed ÷ half-life).' },
    { id: 'percent', label: 'Share of the dose still there', format: 'number', precision: 1, suffix: '%', info: 'Remaining caffeine as a percentage of the original dose.' },
    { id: 'dose', label: 'Total dose', format: 'number', precision: 1, suffix: ' mg', info: 'Caffeine per serving × servings.' },
    { id: 'hours', label: 'Hours until bedtime', format: 'number', precision: 1, suffix: ' h', info: 'Time between the dose and bedtime.' },
  ],
  compute: (v) => {
    const taken = toHours(v.taken);
    const bed = toHours(v.bed);
    const half = num(v.half);
    const servings = num(v.servings);
    const preset = String(v.preset ?? 'coffee');
    const per = preset === 'custom' ? num(v.custom) : PRESETS[preset];
    if (taken === null || bed === null || half === null || servings === null || per == null) return { remaining: null };
    if (half <= 0 || servings <= 0 || per <= 0) return { remaining: null };
    const dose = per * servings;
    let hours = bed - taken;
    if (hours < 0) hours += 24;
    const left = (h: number) => dose * 0.5 ** (h / half);
    const remaining = left(hours);
    const percent = (remaining / dose) * 100;
    const x = Array.from({ length: 25 }, (_, i) => i);
    return {
      remaining,
      percent,
      dose,
      hours,
      tone: percent <= 25 ? 'good' : percent <= 50 ? 'ok' : 'warn',
      badge: `${fmt(percent, 0)}% left at bedtime`,
      note: `${fmt(dose, 0)} mg taken ${fmt(hours, 1)} hours before bed leaves about ${fmt(remaining, 1)} mg (${fmt(percent, 1)}%) with a ${fmt(half, 1)}-hour half-life. This is a simple average-based estimate, not medical advice. Your own half-life may be shorter or longer.`,
      chart: {
        type: 'area',
        title: 'Caffeine remaining after the dose',
        x,
        xLabel: 'Hours after drinking',
        yFormat: { format: 'number', suffix: ' mg' },
        series: [{ name: 'Caffeine in your body (mg)', values: x.map(left) }],
        markers: hours > 0 && hours <= 24 ? [{ x: Math.round(hours * 10) / 10, label: 'Bedtime' }] : [],
      },
      steps: [`Dose = ${fmt(per, 0)} mg × ${fmt(servings, 1)} = ${fmt(dose, 1)} mg`, `Hours until bed = ${fmt(hours, 1)}`, `Remaining = ${fmt(dose, 1)} × 0.5^(${fmt(hours, 1)} ÷ ${fmt(half, 1)}) = ${fmt(remaining, 1)} mg`],
    };
  },
  content: {
    formula: ['Remaining = dose × 0.5^(hours ÷ half-life)', 'Percent left = 0.5^(hours ÷ half-life) × 100', 'Default half-life = 5 hours (an average; yours may differ)'],
    body: [
      'Caffeine leaves your body gradually. The half-life is the time it takes for half of the caffeine to be cleared. With a 5-hour half-life, 200 mg becomes 100 mg after 5 hours, 50 mg after 10 hours, and so on.',
      'Enter what you had, when you had it and when you go to bed, and the calculator shows how much is likely still in your system at bedtime, plus a 24-hour decay curve.',
      'The 5-hour figure is only an average for healthy adults. Half-life varies from person to person and can be longer with pregnancy, some medications and some genetic differences, so adjust it if you know yours. Preset drink amounts are rough typical values; the label is better when you have it.',
      'This is a simple model for planning your day, not medical advice. For the FDA\'s general guidance on daily caffeine, see the source below. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How is the caffeine left at bedtime calculated?', a: 'Remaining = dose × 0.5^(hours ÷ half-life). The calculator assumes the whole dose is taken at once and is cleared at a steady exponential rate, which is a simplification.' },
      { q: 'What is the example result?', a: 'A 200 mg dose with a 5-hour half-life leaves 100 mg (50%) after 5 hours and 50 mg (25%) after 10 hours. One 95 mg coffee at 08:00 leaves about 11.9 mg (12.5%) at 23:00, 15 hours later.' },
      { q: 'Is 5 hours right for me?', a: 'It is a commonly quoted average, not a measurement of you. Pregnancy, some medications and genetics can change it, so treat the result as an estimate and change the half-life if you know yours.' },
      { q: 'How much caffeine is too much?', a: 'The FDA says 400 mg a day is an amount not generally associated with dangerous, negative effects for most healthy adults. This calculator does not judge your intake. Ask a doctor about your own situation.' },
    ],
    sources: [{ label: 'FDA: Spilling the Beans: How Much Caffeine Is Too Much?', url: 'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much' }],
  },
  related: ['sleep', 'sleep-debt', 'water-intake', 'bac'],
  examples: [
    // 200 mg, 14:00 -> 19:00 = 5 h, half-life 5: 200 * 0.5 = 100 mg (50%).
    { values: { preset: 'custom', custom: 200, servings: 1, taken: '14:00', bed: '19:00', half: 5 }, expect: { remaining: 100, percent: 50, dose: 200, hours: 5 }, tolerance: 1e-6 },
    // 14:00 -> 00:00 next day = 10 h: 200 * 0.25 = 50 mg (25%).
    { values: { preset: 'custom', custom: 200, servings: 1, taken: '14:00', bed: '00:00', half: 5 }, expect: { remaining: 50, percent: 25, dose: 200, hours: 10 }, tolerance: 1e-6 },
    // Coffee preset 95 mg, 08:00 -> 23:00 = 15 h: 95 * 0.125 = 11.875 mg (12.5%).
    { values: { preset: 'coffee', servings: 1, taken: '08:00', bed: '23:00', half: 5 }, expect: { remaining: 11.875, percent: 12.5, dose: 95, hours: 15 }, tolerance: 1e-6 },
  ],
});
