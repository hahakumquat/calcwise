import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import type { ComputeResult } from '../../lib/types';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
// Round to 0.01 so repeated additions and 90% deloads never show float noise.
const r2 = (n: number) => Math.round(n * 100) / 100;

const MAX_WEEKS = 520;
const LIST_LIMIT = 24;

export default defineCalculator({
  slug: 'progressive-overload',
  title: 'Progressive Overload Plan Calculator',
  category: 'health',
  description: 'Plan your weekly lift targets: how many weeks to go from your starting weight to your goal, adding a set amount each week, with optional deload weeks.',
  keywords: ['progressive overload calculator', 'progressive overload plan', 'weekly weight increase', 'lifting progression calculator', 'deload week calculator', 'strength plan weeks to goal'],
  updated: '2026-11-23',
  inputs: [
    { id: 'start', label: 'Starting weight', type: 'number', default: 100, min: 0, max: 5000, step: 2.5, info: 'The working weight you lift in week 1, in the unit chosen below.' },
    { id: 'goal', label: 'Goal weight', type: 'number', default: 150, min: 0, max: 5000, step: 2.5, info: 'The working weight you want to reach. Must be higher than your starting weight.' },
    { id: 'increase', label: 'Weekly increase', type: 'number', default: 5, min: 0, max: 1000, step: 0.5, info: 'How much you add to the bar each progression week.' },
    { id: 'unit', label: 'Weight unit', type: 'select', options: [{ value: 'lb', label: 'lb' }, { value: 'kg', label: 'kg' }], default: 'lb', segmented: true, info: 'Only used for labels. The maths is the same in either unit.' },
    { id: 'deload', label: 'Deload every N weeks (0 = none)', type: 'number', default: 0, min: 0, max: 52, step: 1, info: 'After every N working weeks, insert one lighter week at 90% of the previous week\'s weight. Use 0 for no deloads.' },
  ],
  outputs: [
    { id: 'totalWeeks', label: 'Total weeks to reach your goal', format: 'integer', primary: true, info: 'Working weeks plus any deload weeks, counting week 1 as your starting weight.' },
    { id: 'increases', label: 'Weekly increases needed', format: 'integer', info: 'Rounded up: (goal − start) ÷ weekly increase.' },
    { id: 'deloads', label: 'Deload weeks', format: 'integer', info: 'Lighter weeks inserted before you reach the goal.' },
    { id: 'finalWeight', label: 'Final-week weight', format: 'number', precision: 1, info: 'The target for the last week. The final jump is trimmed so you land exactly on your goal.' },
  ],
  compute: (v) => {
    const start = num(v.start);
    const goal = num(v.goal);
    const inc = num(v.increase);
    const dlRaw = num(v.deload) ?? 0;
    if (start === null || goal === null || inc === null) return { totalWeeks: null };
    if (start <= 0) return { totalWeeks: null, error: 'Enter a starting weight above 0.' };
    if (goal <= start) return { totalWeeks: null, error: 'Your goal weight must be higher than your starting weight.' };
    if (inc <= 0) return { totalWeeks: null, error: 'Enter a weekly increase above 0.' };
    if (dlRaw < 0) return { totalWeeks: null, error: 'Deload interval cannot be negative.' };
    const unit = v.unit === 'kg' ? 'kg' : 'lb';
    const dl = Math.floor(dlRaw);

    const increases = Math.ceil((goal - start) / inc - 1e-9);
    const workingWeeks = increases + 1;

    // Build the schedule. Working week k (0-based) = start + k * inc, capped at goal.
    // After every `dl` working weeks (if the goal is not yet reached) one deload week is
    // inserted at 90% of the previous week; the next working week continues from the
    // pre-deload weight, so a deload week does not use up a progression step.
    const weights: number[] = [];
    const isDeload: boolean[] = [];
    let k = 0;
    while (k <= increases) {
      weights.push(r2(Math.min(start + k * inc, goal)));
      isDeload.push(false);
      k++;
      if (dl > 0 && k % dl === 0 && k <= increases) {
        weights.push(r2(weights[weights.length - 1] * 0.9));
        isDeload.push(true);
      }
      if (weights.length > MAX_WEEKS) return { totalWeeks: null, error: `That plan runs past ${MAX_WEEKS} weeks. Try a bigger weekly increase.` };
    }
    const totalWeeks = weights.length;
    const deloads = totalWeeks - workingWeeks;
    const finalWeight = weights[totalWeeks - 1];
    const lastJump = r2(finalWeight - weights[totalWeeks - 2]);

    const weekNums = weights.map((_, i) => i + 1);
    const lines = weights.slice(0, LIST_LIMIT).map((w, i) => `Week ${i + 1}: ${fmt(w, 2).replace(/\.?0+$/, '')} ${unit}${isDeload[i] ? ' (deload, 90%)' : ''}`);
    if (totalWeeks > LIST_LIMIT) lines.push(`… and ${totalWeeks - LIST_LIMIT} more weeks, ending at ${fmt(finalWeight, 2).replace(/\.?0+$/, '')} ${unit} in week ${totalWeeks}`);

    const out: ComputeResult = {
      totalWeeks,
      increases,
      deloads,
      finalWeight,
      chart: {
        type: 'line',
        title: `Weekly target weight (${unit})`,
        x: weekNums,
        xLabel: 'Week',
        yLabel: unit,
        yFormat: { format: 'number' },
        series: [{ name: 'Target weight', values: weights }],
      },
      steps: [
        `Increases needed: (${fmt(goal, 2)} − ${fmt(start, 2)}) ÷ ${fmt(inc, 2)}, rounded up = ${fmt(increases)}`,
        `Working weeks: ${fmt(increases)} increases + week 1 = ${fmt(workingWeeks)}`,
        dl > 0 ? `Deload weeks: one after every ${fmt(dl)} working weeks, before the goal = ${fmt(deloads)}` : 'Deload weeks: none',
        `Total weeks: ${fmt(workingWeeks)} + ${fmt(deloads)} = ${fmt(totalWeeks)}`,
        ...lines,
      ],
      tone: 'ok',
      badge: `${fmt(totalWeeks)} weeks`,
      note: `Going from ${fmt(start, 2)} to ${fmt(goal, 2)} ${unit} at +${fmt(inc, 2)} ${unit} a week takes ${fmt(increases)} increases, so you hit your goal in week ${fmt(totalWeeks)}${deloads > 0 ? ` (including ${fmt(deloads)} deload ${deloads === 1 ? 'week' : 'weeks'})` : ''}.${lastJump < inc - 1e-9 && lastJump > 0 ? ` The last jump is trimmed to +${fmt(lastJump, 2)} ${unit}.` : ''} A planning illustration only: real progress is rarely linear.`,
    };
    return out;
  },
  content: {
    formula: [
      'Increases needed = ceil((goal − start) ÷ weekly increase)',
      'Working weeks = increases needed + 1 (week 1 is your starting weight)',
      'Deload weeks = one after every N working weeks, only while the goal is still ahead',
      'Deload weight = 90% of the previous week; the next week resumes from the pre-deload weight',
      'Total weeks = working weeks + deload weeks',
    ],
    body: [
      'Progressive overload means asking your body for a little more over time: a bit more weight, one more rep, one more set. This calculator turns that idea into a simple weekly schedule for one lift, so you can see how long a goal weight takes at a steady pace.',
      'Enter your starting weight, your goal and how much you add each week, and pick lb or kg. Week 1 is your starting weight, and each following week adds your increase until you reach the goal. If you set a deload interval, a lighter week at 90% of the previous week is slotted in after every N working weeks, and the next week picks up from where you left off.',
      'This is a planning illustration, not medical or coaching advice. Real progress is rarely a straight line: sleep, food, stress and bad days all get a vote. Treat the table as a rough map and adjust it as you go. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'How the weeks are counted',
        paragraphs: [
          'Week 1 uses your starting weight, so reaching a goal 50 lb away at +5 lb a week takes 10 increases and lands in week 11. If the gap does not divide evenly, the number of increases is rounded up and the last jump is trimmed so you land on the goal, not past it.',
          'A deload week does not count as a progression step. With a deload every 4 weeks, you train weeks 1 to 4, take a lighter week, then carry on from the weight you reached before it. The calculator never adds a deload after the goal week, because the plan ends there.',
        ],
      },
      {
        heading: 'Picking a weekly increase',
        paragraphs: [
          'Small steady jumps are easier to keep up than big ones. Many lifters add about 2.5 to 5 lb (1 to 2.5 kg) a week to bigger lifts and less to smaller ones, but the right number depends on your experience and recovery. If you stall, repeat a week, take a deload or use smaller jumps instead of forcing it.',
        ],
      },
    ],
    faq: [
      { q: 'How many weeks to go from 100 to 150 lb at +5 lb a week?', a: 'That is (150 − 100) ÷ 5 = 10 increases. Week 1 is 100 lb, so you reach 150 lb in week 11 with no deloads.' },
      { q: 'How does a deload week work here?', a: 'After every N working weeks, one extra week is added at 90% of the previous week\'s weight. The next week resumes from the pre-deload weight, so deloads add weeks without removing progression steps.' },
      { q: 'What if I add a deload every 4 weeks for the same plan?', a: 'You still need 11 working weeks, with deloads after working weeks 4 and 8 (103.5 lb and 121.5 lb). No deload is added after you reach 150 lb. That is 13 weeks in total.' },
      { q: 'What happens if the gap is not a neat multiple of my increase?', a: 'The increases are rounded up and the final jump is trimmed to land exactly on your goal. From 100 to 152 at +5 is 11 increases, with a last jump of +2 lb.' },
    ],
    sources: [],
  },
  related: ['one-rep-max', 'plate-calculator', 'workout-volume', 'weight-loss-goal'],
  examples: [
    // increases = ceil(50/5) = 10; working weeks 11; no deloads; total 11; final 150
    { values: { start: 100, goal: 150, increase: 5, unit: 'lb', deload: 0 }, expect: { increases: 10, deloads: 0, totalWeeks: 11, finalWeight: 150 }, tolerance: 1e-9 },
    // same plan, deload every 4: working 100,105,110,115 | D 103.5 | 120,125,130,135 | D 121.5 | 140,145,150
    // 11 working + 2 deloads = 13 weeks
    { values: { start: 100, goal: 150, increase: 5, unit: 'lb', deload: 4 }, expect: { increases: 10, deloads: 2, totalWeeks: 13, finalWeight: 150 }, tolerance: 1e-9 },
    // increases = ceil(52/5) = ceil(10.4) = 11; weeks 12; final capped at 152 (155 would overshoot)
    { values: { start: 100, goal: 152, increase: 5, unit: 'lb', deload: 0 }, expect: { increases: 11, deloads: 0, totalWeeks: 12, finalWeight: 152 }, tolerance: 1e-9 },
    // kg: ceil(30/2.5) = 12 increases; 13 working weeks; deload every 6: after working weeks 6 and 12 -> 2 deloads; total 15
    { values: { start: 60, goal: 90, increase: 2.5, unit: 'kg', deload: 6 }, expect: { increases: 12, deloads: 2, totalWeeks: 15, finalWeight: 90 }, tolerance: 1e-9 },
  ],
});
