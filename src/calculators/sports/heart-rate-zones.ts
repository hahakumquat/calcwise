import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const ZONES = [
  { id: 'zone1', short: 'Z1 Very light', name: 'Zone 1 — very light (50–60%)', lo: 0.5, hi: 0.6, info: 'Warm-ups, cool-downs and recovery. Feels very easy; you could chat indefinitely.' },
  { id: 'zone2', short: 'Z2 Endurance', name: 'Zone 2 — light / endurance (60–70%)', lo: 0.6, hi: 0.7, info: 'Easy aerobic base training. You can talk in full sentences; most endurance training belongs here.' },
  { id: 'zone3', short: 'Z3 Tempo', name: 'Zone 3 — moderate / tempo (70–80%)', lo: 0.7, hi: 0.8, info: 'Steady, comfortably hard effort. Speech comes in short sentences.' },
  { id: 'zone4', short: 'Z4 Threshold', name: 'Zone 4 — hard / threshold (80–90%)', lo: 0.8, hi: 0.9, info: 'Hard, near your lactate threshold. Sustainable for roughly 20–60 minutes; only a few words at a time.' },
  { id: 'zone5', short: 'Z5 Max', name: 'Zone 5 — maximum (90–100%)', lo: 0.9, hi: 1.0, info: 'All-out efforts such as short intervals and sprints. Sustainable for only a few minutes.' },
];
const EST = { input: 'source', is: 'estimate' };

export default defineCalculator({
  slug: 'heart-rate-zones',
  title: 'Heart Rate Zone Calculator',
  category: 'sports',
  description: 'Calculate your five training heart rate zones from your age or measured max heart rate, using the Karvonen method when you know your resting heart rate.',
  keywords: ['target heart rate', 'Karvonen formula', 'max heart rate', 'zone 2', 'training zones', 'heart rate reserve'],
  inputs: [
    {
      id: 'source',
      label: 'Max heart rate',
      type: 'select',
      default: 'estimate',
      segmented: true,
      options: [
        { value: 'estimate', label: 'Estimate from age' },
        { value: 'measured', label: 'I know mine' },
      ],
      info: 'Use a measured maximum if you have reached it in a hard race or lab test; otherwise estimate it from your age.',
    },
    { id: 'age', label: 'Age', type: 'number', suffix: 'years', default: 35, min: 10, max: 100, showWhen: EST, info: 'Your age in years. Maximum heart rate falls by roughly one beat per year.' },
    {
      id: 'formula',
      label: 'Estimate formula',
      type: 'select',
      default: 'fox',
      options: [
        { value: 'fox', label: '220 − age (classic)' },
        { value: 'tanaka', label: '208 − 0.7 × age (Tanaka)' },
      ],
      showWhen: EST,
      info: '220 − age is the familiar rule of thumb. Tanaka’s formula is a bit more accurate, especially for people over 40.',
    },
    { id: 'maxHrInput', label: 'Measured max heart rate', type: 'number', suffix: 'bpm', default: 185, min: 100, max: 230, showWhen: { input: 'source', is: 'measured' }, info: 'The highest heart rate you have seen at the end of an all-out effort, e.g. the final sprint of a 5K, from a chest strap.' },
    { id: 'restingHr', label: 'Resting heart rate (optional)', type: 'number', suffix: 'bpm', default: 60, optional: true, min: 30, max: 120, help: 'Leave blank to use simple % of max.', info: 'Your pulse right after waking, before getting up. Adults are typically 50–80 bpm; fit athletes can be lower.' },
  ],
  outputs: [
    { id: 'maxHr', label: 'Maximum heart rate', primary: true, format: 'integer', suffix: 'bpm', info: 'The top of your heart rate range, measured or estimated from age. Age estimates can be off by 10–15 bpm.' },
    ...ZONES.map((z) => ({ id: z.id, label: z.name, format: 'text' as const, info: z.info })),
    { id: 'method', label: 'Method', format: 'text', info: 'Karvonen uses your heart rate reserve (max − resting); without a resting rate, zones are simple percentages of max.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const measured = num(v.maxHrInput);
    const rest = num(v.restingHr);
    let max: number;
    if (v.source === 'measured') {
      if (!measured || measured <= 0) return { maxHr: null };
      max = measured;
    } else {
      if (age === null || age <= 0 || age > 120) return { maxHr: null };
      max = v.formula === 'tanaka' ? 208 - 0.7 * age : 220 - age;
    }
    if (max <= 0) return { maxHr: null };
    const karvonen = rest !== null && rest > 0;
    if (karvonen && rest >= max) return { maxHr: null, error: 'Resting heart rate must be lower than maximum heart rate.' };
    const at = (p: number) => Math.round(karvonen ? rest + p * (max - rest) : p * max);
    const out: Record<string, string> = {};
    for (const z of ZONES) out[z.id] = `${at(z.lo)}–${at(z.hi)} bpm`;
    const tones = ['neutral', 'good', 'ok', 'warn', 'bad'] as const;
    return {
      maxHr: Math.round(max),
      ...out,
      method: karvonen ? 'Karvonen (heart rate reserve)' : 'Percentage of max heart rate',
      chart: [
        {
          type: 'scale',
          title: 'Training zones',
          min: at(0.5),
          max: Math.round(max),
          value: at(0.65),
          valueLabel: `Zone 2 middle: ${at(0.65)} bpm`,
          format: { suffix: 'bpm' },
          bands: ZONES.map((z, i) => ({ from: at(z.lo), to: at(z.hi), label: z.short, tone: tones[i] })),
        },
        {
          type: 'bar',
          title: 'Upper limit of each zone',
          horizontal: true,
          categories: ZONES.map((z) => z.short),
          series: [{ name: 'Heart rate', values: ZONES.map((z) => at(z.hi)) }],
          format: { format: 'integer', suffix: 'bpm' },
          highlight: 1,
        },
      ],
      steps: karvonen
        ? [`Heart rate reserve = ${Math.round(max)} − ${rest} = ${Math.round(max - rest)} bpm`, `Target = resting + % × reserve, e.g. zone 2 low = ${rest} + 0.6 × ${Math.round(max - rest)} = ${at(0.6)} bpm`]
        : [`Target = % × max, e.g. zone 2 low = 0.6 × ${Math.round(max)} = ${at(0.6)} bpm`],
      note: 'Age formulas can be off by 10–15 bpm for an individual. If you have a heart condition or take beta-blockers, ask your doctor for target ranges.',
    };
  },
  content: {
    formula: ['Max HR ≈ 220 − age, or 208 − 0.7 × age (Tanaka)', 'Karvonen: target = resting HR + intensity × (max HR − resting HR)', 'Without resting HR: target = intensity × max HR'],
    body: [
      'Heart rate zones divide your effort into bands, from easy recovery work to all-out sprints. Training in specific zones lets you control intensity: most endurance programs prescribe lots of easy zone 1–2 work to build aerobic fitness, with smaller doses of zone 4–5 intervals.',
      'Your maximum heart rate sets the top of the scale. The well-known 220 − age formula is simple but can be off by 10 or more beats per minute; the Tanaka formula is a little more accurate for older adults. If you have reached your true maximum in a hard race or a supervised test, enter it instead of the estimate.',
      'The Karvonen method uses heart rate reserve — the difference between maximum and resting heart rate — so the zones reflect your own fitness. A fitter person with a low resting pulse gets higher, more realistic easy-zone targets than plain percentages would give. This is general fitness information, not medical advice.',
    ],
    faq: [
      { q: 'What is zone 2 training?', a: 'Steady exercise at a conversational effort — you can still talk in full sentences. It builds aerobic base and fat-burning capacity with little fatigue, so endurance athletes spend most of their training time there.' },
      { q: 'How do I measure resting heart rate?', a: 'Count your pulse for 60 seconds right after waking, before getting up, on several mornings, and take the average. Many fitness watches report it automatically.' },
    ],
  },
  related: ['pace', 'calories-burned', 'race-time-predictor', 'tdee'],
  examples: [
    {
      values: { source: 'estimate', age: 40, formula: 'fox', maxHrInput: null, restingHr: 60 },
      expect: { maxHr: 180, zone1: '120–132 bpm', zone2: '132–144 bpm', zone3: '144–156 bpm', zone4: '156–168 bpm', zone5: '168–180 bpm' },
    },
    { values: { source: 'estimate', age: 30, formula: 'fox', maxHrInput: null, restingHr: null }, expect: { maxHr: 190, zone2: '114–133 bpm', zone4: '152–171 bpm' } },
    { values: { source: 'estimate', age: 50, formula: 'tanaka', maxHrInput: null, restingHr: null }, expect: { maxHr: 173 } },
    { values: { source: 'measured', age: null, formula: null, maxHrInput: 200, restingHr: 50 }, expect: { maxHr: 200, zone2: '140–155 bpm' } },
  ],
});
