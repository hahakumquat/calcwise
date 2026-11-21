import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import type { ComputeResult } from '../../lib/types';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'workout-volume',
  title: 'Workout Volume Calculator (Sets x Reps x Weight)',
  category: 'health',
  description: 'Work out training volume load: sets x reps x weight per session and per week, total reps, and the % change from last week. Free, in your browser.',
  keywords: ['workout volume calculator', 'training volume', 'volume load', 'sets reps weight calculator', 'weekly training volume', 'tonnage calculator'],
  updated: '2026-11-21',
  inputs: [
    { id: 'sets', label: 'Sets per session', type: 'number', default: 4, min: 1, max: 100, step: 1, info: 'Working sets you do in one session, all at the same reps and weight.' },
    { id: 'reps', label: 'Reps per set', type: 'number', default: 8, min: 1, max: 200, step: 1, info: 'Repetitions in each set.' },
    { id: 'weight', label: 'Weight per rep', type: 'number', default: 100, min: 0, max: 5000, step: 2.5, info: 'The load lifted on each rep, in the unit chosen below.' },
    { id: 'unit', label: 'Weight unit', type: 'select', options: [{ value: 'lb', label: 'lb' }, { value: 'kg', label: 'kg' }], default: 'lb', segmented: true, info: 'Only used for labels. The maths is the same in either unit.' },
    { id: 'sessions', label: 'Sessions per week', type: 'number', default: 3, min: 1, max: 21, step: 1, info: 'How many times a week you repeat this session.' },
    { id: 'prevWeek', label: 'Last week\'s total volume (optional)', type: 'number', min: 0, step: 100, optional: true, info: 'Optional. Your total weekly volume last week in the same unit. Leave blank to skip the comparison.' },
  ],
  outputs: [
    { id: 'volume', label: 'Volume per session', format: 'number', precision: 1, primary: true, info: 'Sets × reps × weight, in the unit you chose.' },
    { id: 'weekly', label: 'Weekly volume', format: 'number', precision: 1, info: 'Volume per session × sessions per week.' },
    { id: 'totalReps', label: 'Total reps per session', format: 'integer', info: 'Sets × reps per set.' },
    { id: 'change', label: 'Change vs last week', format: 'number', precision: 1, suffix: '%', info: '(This week − last week) ÷ last week × 100. Shown only when you enter last week\'s volume.' },
  ],
  compute: (v) => {
    const sets = num(v.sets);
    const reps = num(v.reps);
    const weight = num(v.weight);
    const sessions = num(v.sessions);
    const prev = num(v.prevWeek);
    if (sets === null || reps === null || weight === null || sessions === null || sets < 1 || reps < 1 || weight < 0 || sessions < 1) return { volume: null };
    const unit = v.unit === 'kg' ? 'kg' : 'lb';
    const totalReps = sets * reps;
    const volume = totalReps * weight;
    const weekly = volume * sessions;
    const out: ComputeResult = {
      volume,
      weekly,
      totalReps,
      chart: {
        type: 'bar',
        title: `Volume built up across the week (${unit})`,
        categories: Array.from({ length: Math.round(sessions) }, (_, i) => `Session ${i + 1}`),
        format: { format: 'integer' },
        series: [{ name: 'Cumulative volume', values: Array.from({ length: Math.round(sessions) }, (_, i) => volume * (i + 1)) }],
      },
      steps: [
        `Reps per session: ${fmt(sets)} × ${fmt(reps)} = ${fmt(totalReps)}`,
        `Volume per session: ${fmt(totalReps)} × ${fmt(weight, 1)} ${unit} = ${fmt(volume, 1)} ${unit}`,
        `Weekly volume: ${fmt(volume, 1)} × ${fmt(sessions)} = ${fmt(weekly, 1)} ${unit}`,
      ],
      tone: 'ok',
      badge: `${fmt(volume)} ${unit}`,
      note: `${fmt(sets)} sets of ${fmt(reps)} at ${fmt(weight, 1)} ${unit} is ${fmt(volume, 1)} ${unit} per session, or ${fmt(weekly, 1)} ${unit} a week.`,
    };
    if (prev !== null && prev > 0) {
      const change = ((weekly - prev) / prev) * 100;
      out.change = change;
      (out.steps as string[]).push(`Change: (${fmt(weekly, 1)} − ${fmt(prev, 1)}) ÷ ${fmt(prev, 1)} × 100 = ${fmt(change, 1)}%`);
      out.note = `${out.note} That is ${change >= 0 ? 'up' : 'down'} ${fmt(Math.abs(change), 1)}% on last week.`;
    }
    return out;
  },
  content: {
    formula: [
      'Reps per session = sets × reps per set',
      'Volume per session = sets × reps × weight',
      'Weekly volume = volume per session × sessions per week',
      'Change vs last week (%) = (this week − last week) ÷ last week × 100',
    ],
    body: [
      'Volume load is the standard way lifters log work: sets times reps times the weight on the bar. It turns a session into one number you can compare from week to week.',
      'Enter your sets, reps and weight, pick lb or kg, and say how many sessions you do a week. Add last week\'s total if you want the percentage change. The calculator assumes every set uses the same reps and weight; for mixed sessions, work out each exercise and add them up.',
      'Volume is a record of work done, not a measure of progress or a target. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'Using volume in a training log',
        paragraphs: [
          'Volume load only compares like with like. Lighter, higher-rep work can match the volume of heavy, low-rep work, so look at it next to the weights and reps themselves. Keep the same unit from week to week so the percentage change means something.',
        ],
      },
    ],
    faq: [
      { q: 'How is workout volume calculated?', a: 'Multiply sets by reps by weight. Four sets of 8 reps at 100 lb is 4 × 8 × 100 = 3,200 lb per session.' },
      { q: 'How do I get weekly volume?', a: 'Multiply the session volume by the sessions per week. At 3,200 lb a session and 3 sessions, weekly volume is 9,600 lb.' },
      { q: 'How is the change from last week worked out?', a: 'Take this week minus last week, divide by last week and multiply by 100. For 5 sets of 5 at 60 kg twice a week (3,000 kg) against 2,500 kg last week, that is +20%.' },
      { q: 'Does lb or kg change the result?', a: 'No. The maths is identical; the unit only labels the answer. Do not mix units between weeks.' },
    ],
  },
  related: ['one-rep-max', 'plate-calculator', 'gym-cost-per-visit', 'calories-burned'],
  examples: [
    // reps 4*8 = 32; volume 32*100 = 3200; weekly 3200*3 = 9600
    { values: { sets: 4, reps: 8, weight: 100, unit: 'lb', sessions: 3 }, expect: { totalReps: 32, volume: 3200, weekly: 9600 }, tolerance: 1e-9 },
    // reps 25; volume 25*60 = 1500; weekly 3000; change (3000-2500)/2500 = 20%
    { values: { sets: 5, reps: 5, weight: 60, unit: 'kg', sessions: 2, prevWeek: 2500 }, expect: { totalReps: 25, volume: 1500, weekly: 3000, change: 20 }, tolerance: 1e-9 },
    // reps 30; volume 30*45 = 1350; weekly 1350*4 = 5400; change (5400-6000)/6000 = -10%
    { values: { sets: 3, reps: 10, weight: 45, unit: 'lb', sessions: 4, prevWeek: 6000 }, expect: { totalReps: 30, volume: 1350, weekly: 5400, change: -10 }, tolerance: 1e-9 },
  ],
});
