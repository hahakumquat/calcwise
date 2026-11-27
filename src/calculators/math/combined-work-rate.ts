import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const UNIT_LABELS: Record<string, string> = { hours: 'hours', minutes: 'minutes', days: 'days' };

export default defineCalculator({
  slug: 'combined-work-rate',
  title: 'Combined Work Rate Calculator',
  category: 'math',
  description: 'Find how long people or machines take to finish a job together, or work out how long the missing partner would take alone, from each one\'s solo time.',
  keywords: ['work rate calculator', 'combined work rate', 'working together problems', 'how long to finish a job together', 'two pipes fill a tank calculator', 'time and work calculator'],
  updated: '2026-11-27',
  inputs: [
    { id: 'mode', label: 'What do you want to find?', type: 'select', segmented: true, default: 'together', options: [{ value: 'together', label: 'Work together' }, { value: 'missing', label: 'Find the missing partner' }], info: 'Work together: you know how long each worker takes alone. Find the missing partner: you know the team time and one worker\'s solo time.' },
    { id: 'unit', label: 'Time unit', type: 'select', default: 'hours', options: [{ value: 'hours', label: 'Hours' }, { value: 'minutes', label: 'Minutes' }, { value: 'days', label: 'Days' }], info: 'Used for display only. Use the same unit for every time you enter.' },
    { id: 'a', label: 'Time for A alone', type: 'number', default: 6, min: 0, step: 0.25, info: 'How long worker A would take to finish the whole job alone.' },
    { id: 'b', label: 'Time for B alone', type: 'number', default: 3, min: 0, step: 0.25, showWhen: { input: 'mode', is: 'together' }, info: 'How long worker B would take to finish the whole job alone.' },
    { id: 'c', label: 'Time for C alone (optional)', type: 'number', optional: true, min: 0, step: 0.25, showWhen: { input: 'mode', is: 'together' }, help: 'Leave blank or 0 if there is no third worker.', info: 'How long a third worker would take alone. Blank or 0 means C is not used.' },
    { id: 'team', label: 'Time working together', type: 'number', default: 2, min: 0, step: 0.25, showWhen: { input: 'mode', is: 'missing' }, info: 'How long A and B take to finish the job when they work together. It must be less than A alone.' },
  ],
  outputs: [
    { id: 'together', label: 'Time working together', format: 'number', precision: 3, primary: true, showWhen: { input: 'mode', is: 'together' }, info: '1 ÷ (sum of each worker\'s rate). In the time unit you chose.' },
    { id: 'partner', label: 'B alone would take', format: 'number', precision: 3, primary: true, showWhen: { input: 'mode', is: 'missing' }, info: '1 ÷ (1 ÷ team time − 1 ÷ A alone). In the time unit you chose.' },
    { id: 'rate', label: 'Combined rate (jobs per time unit)', format: 'number', precision: 4, info: 'The part of the job the team finishes in one time unit. It is the sum of the individual rates.' },
    { id: 'shareA', label: 'Share done by A', format: 'number', precision: 1, suffix: '%', info: 'A\'s rate as a percent of the combined rate.' },
    { id: 'shareB', label: 'Share done by B', format: 'number', precision: 1, suffix: '%', info: 'B\'s rate as a percent of the combined rate.' },
    { id: 'shareC', label: 'Share done by C', format: 'number', precision: 1, suffix: '%', showWhen: { input: 'mode', is: 'together' }, info: 'C\'s rate as a percent of the combined rate. Empty if C is not used.' },
  ],
  compute: (v) => {
    const u = UNIT_LABELS[String(v.unit)] ?? 'hours';
    const a = num(v.a);
    if (a === null) return { together: null };
    if (a <= 0) return { together: null, error: 'Enter a time for A above 0.' };

    if (v.mode === 'missing') {
      const t = num(v.team);
      if (t === null) return { partner: null };
      if (t <= 0) return { partner: null, error: 'Enter a team time above 0.' };
      if (t >= a) return { partner: null, error: 'The team time must be less than A alone. Working together always beats working alone, so with these numbers B could not help.' };
      const rb = 1 / t - 1 / a;
      const b = 1 / rb;
      const rate = 1 / t;
      const sa = (1 / a) / rate * 100;
      const sb = rb / rate * 100;
      return {
        partner: b,
        rate,
        shareA: sa,
        shareB: sb,
        tone: 'ok',
        badge: `B: ${fmt(b, 4)} ${u}`,
        note: `If A takes ${fmt(a)} ${u} alone and the team takes ${fmt(t)} ${u}, B alone would take ${fmt(b, 4)} ${u}. This assumes every worker keeps a constant rate and nobody slows the others down.`,
        chart: {
          type: 'bar' as const,
          title: `Time to finish the whole job (${u})`,
          categories: ['A alone', 'B alone', 'Together'],
          series: [{ name: `Time (${u})`, values: [+a.toFixed(3), +b.toFixed(3), +t.toFixed(3)] }],
          highlight: 1,
        },
        steps: [
          `Team rate = 1 ÷ ${fmt(t)} = ${fmt(rate, 5)} jobs per ${u.replace(/s$/, '')}`,
          `A's rate = 1 ÷ ${fmt(a)} = ${fmt(1 / a, 5)}`,
          `B's rate = ${fmt(rate, 5)} − ${fmt(1 / a, 5)} = ${fmt(rb, 5)}`,
          `B alone = 1 ÷ ${fmt(rb, 5)} = ${fmt(b, 4)} ${u}`,
        ],
      };
    }

    const b = num(v.b);
    if (b === null) return { together: null };
    if (b <= 0) return { together: null, error: 'Enter a time for B above 0.' };
    const cRaw = v.c === '' || v.c === undefined || v.c === null ? 0 : num(v.c);
    if (cRaw === null) return { together: null };
    if (cRaw < 0) return { together: null, error: 'Time for C cannot be negative. Leave it blank or 0 to skip C.' };
    const useC = cRaw > 0;
    const ra = 1 / a, rb = 1 / b, rc = useC ? 1 / cRaw : 0;
    const rate = ra + rb + rc;
    const t = 1 / rate;
    const cats = ['A alone', 'B alone'];
    const vals = [a, b];
    if (useC) { cats.push('C alone'); vals.push(cRaw); }
    cats.push('Together');
    vals.push(t);
    return {
      together: t,
      rate,
      shareA: ra / rate * 100,
      shareB: rb / rate * 100,
      shareC: useC ? rc / rate * 100 : null,
      tone: 'ok',
      badge: `${fmt(t, 4)} ${u}`,
      note: `Working together they finish in ${fmt(t, 4)} ${u}. This assumes every worker keeps a constant rate and nobody gets in the way of the others.`,
      chart: {
        type: 'bar' as const,
        title: `Time to finish the whole job (${u})`,
        categories: cats,
        series: [{ name: `Time (${u})`, values: vals.map((x) => +x.toFixed(3)) }],
        highlight: cats.length - 1,
      },
      steps: [
        `A's rate = 1 ÷ ${fmt(a)} = ${fmt(ra, 5)}`,
        `B's rate = 1 ÷ ${fmt(b)} = ${fmt(rb, 5)}`,
        ...(useC ? [`C's rate = 1 ÷ ${fmt(cRaw)} = ${fmt(rc, 5)}`] : []),
        `Combined rate = ${fmt(rate, 5)} jobs per ${u.replace(/s$/, '')}`,
        `Time together = 1 ÷ ${fmt(rate, 5)} = ${fmt(t, 4)} ${u}`,
      ],
    };
  },
  content: {
    formula: [
      'Rate = 1 ÷ time to finish the whole job alone',
      'Time together = 1 ÷ (rate A + rate B + rate C)',
      'B alone = 1 ÷ (1 ÷ team time − 1 ÷ A alone)',
    ],
    body: [
      'If a worker finishes a job in 6 hours, they do one sixth of the job each hour. That share per hour is their rate. When people work side by side their rates add up, and the time for the whole job is one divided by the total rate.',
      'For A at 6 hours and B at 3 hours, the rates are 1/6 and 1/3, which add to 1/2 of the job per hour. Together they take 2 hours. Add C at 12 hours and the total rate becomes 7/12 per hour, so the three finish in 12/7, about 1.714 hours.',
      'To find a missing partner, subtract the known worker\'s rate from the team rate. If the team takes 2 hours and A alone takes 6, B\'s rate is 1/2 − 1/6 = 1/3, so B alone takes 3 hours. The team time must be shorter than A alone, otherwise no partner could make sense of the numbers.',
      'The maths assumes constant rates and no interference: nobody tires, speeds up or blocks the others. Real teams lose a little time to hand-offs, so treat the result as a best case. The same idea works for pipes filling a tank or machines printing a batch. For speed and distance problems see the distance, rate and time calculator, and for splitting amounts in a fixed proportion, the ratio calculator. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How long do A and B take together if A needs 6 hours and B needs 3?', a: 'Together they take 2 hours. Their rates are 1/6 and 1/3, which add to 1/2 of the job per hour, and 1 ÷ 0.5 = 2 hours.' },
      { q: 'What happens when a third worker joins?', a: 'Add the third rate. With A at 6 hours, B at 3 and C at 12, the combined rate is 7/12 of the job per hour, so the job takes 12/7, about 1.714 hours.' },
      { q: 'How do I find how long the missing partner would take alone?', a: 'Subtract the known worker\'s rate from the team rate and take the reciprocal. For a team time of 2 hours and A alone at 6 hours, 1/2 − 1/6 = 1/3, so B alone takes 3 hours.' },
      { q: 'Why must the team time be less than A alone?', a: 'Adding a worker can only speed things up. If the team time equals or exceeds A alone, B\'s rate would be zero or negative, which has no meaning, so the calculator shows an error.' },
      { q: 'Who does how much of the job?', a: 'Each share is that worker\'s rate divided by the combined rate. With A at 6 hours and B at 3, A does 33.3 percent and B does 66.7 percent.' },
      { q: 'Does it work for pipes, machines or tasks other than people?', a: 'Yes. Anything that works at a steady rate fits: pipes filling a tank, printers, or crews. It assumes constant rates and no interference, so real results can run a little longer.' },
    ],
    sources: [],
  },
  related: ['distance-rate-time', 'ratio'],
  examples: [
    // rates 1/6 + 1/3 = 1/2; together = 2; shares: (1/6)/(1/2) = 33.333%, (1/3)/(1/2) = 66.667%
    { values: { mode: 'together', unit: 'hours', a: 6, b: 3 }, expect: { together: 2, rate: 0.5, shareA: 100 / 3, shareB: 200 / 3 }, tolerance: 1e-6 },
    // with C 12: 1/6 + 1/3 + 1/12 = 2/12 + 4/12 + 1/12 = 7/12 = 0.583333; together = 12/7 = 1.7142857
    // shares: 2/7 = 28.5714%, 4/7 = 57.1429%, 1/7 = 14.2857%
    { values: { mode: 'together', unit: 'hours', a: 6, b: 3, c: 12 }, expect: { together: 12 / 7, rate: 7 / 12, shareA: 200 / 7, shareB: 400 / 7, shareC: 100 / 7 }, tolerance: 1e-6 },
    // missing: team 2, A 6: 1/2 - 1/6 = 1/3 -> B = 3; team rate 0.5; shares A 33.333%, B 66.667%
    { values: { mode: 'missing', unit: 'hours', a: 6, team: 2 }, expect: { partner: 3, rate: 0.5, shareA: 100 / 3, shareB: 200 / 3 }, tolerance: 1e-6 },
    // missing: team 4, A 12: 1/4 - 1/12 = 3/12 - 1/12 = 2/12 = 1/6 -> B = 6
    { values: { mode: 'missing', unit: 'days', a: 12, team: 4 }, expect: { partner: 6, rate: 0.25 }, tolerance: 1e-6 },
  ],
});
