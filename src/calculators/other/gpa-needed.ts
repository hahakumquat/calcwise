import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const f2 = (n: number) => n.toFixed(2);

export default defineCalculator({
  slug: 'gpa-needed',
  title: 'GPA Needed This Term Calculator',
  category: 'other',
  description: 'Find the GPA you need this term to reach your target cumulative GPA, and see the highest GPA you can reach if the target is out of range. 4.0 scale.',
  keywords: ['gpa needed', 'what gpa do i need this semester', 'raise my gpa', 'target gpa calculator', 'gpa goal', 'cumulative gpa target'],
  updated: '2026-11-22',
  inputs: [
    { id: 'current', label: 'Current cumulative GPA', type: 'number', default: 3.2, min: 0, max: 4, step: 0.01, info: 'Your overall GPA so far on a 4.0 scale, from your transcript.' },
    { id: 'done', label: 'Credits completed so far', type: 'number', default: 60, min: 0, step: 1, info: 'Graded credit hours already counted in your cumulative GPA.' },
    { id: 'term', label: 'Credits this term', type: 'number', default: 15, min: 1, step: 1, info: 'Graded credit hours you are taking in the term you want to plan.' },
    { id: 'target', label: 'Target cumulative GPA', type: 'number', default: 3.3, min: 0, max: 4, step: 0.01, info: 'The overall GPA you want to have after this term.' },
  ],
  outputs: [
    { id: 'needed', label: 'GPA needed this term', precision: 2, primary: true, info: 'The average GPA across this term’s credits that gets you exactly to your target. Shown as 0 if you are already safe.' },
    { id: 'maxReach', label: 'Highest cumulative GPA reachable', precision: 2, info: 'Your cumulative GPA if you earn a 4.0 in every credit this term.' },
  ],
  compute: (v) => {
    const current = num(v.current);
    const done = num(v.done);
    const term = num(v.term);
    const target = num(v.target);
    if (current === null || done === null || term === null || target === null) return { needed: null };
    if (current < 0 || current > 4 || target < 0 || target > 4) return { needed: null, error: 'GPAs must be between 0 and 4.0.' };
    if (done < 0) return { needed: null, error: 'Credits completed cannot be negative.' };
    if (term <= 0) return { needed: null, error: 'Credits this term must be more than zero.' };
    const raw = (target * (done + term) - current * done) / term;
    const maxReach = (current * done + 4 * term) / (done + term);
    const steps = [
      `Credits after this term: ${done} + ${term} = ${done + term}`,
      `Points needed: ${f2(target)} × ${done + term} = ${f2(target * (done + term))}`,
      `Points already earned: ${f2(current)} × ${done} = ${f2(current * done)}`,
      `Needed term GPA: (${f2(target * (done + term))} − ${f2(current * done)}) ÷ ${term} = ${f2(raw)}`,
      `Best case (4.0 all term): (${f2(current * done)} + ${f2(4 * term)}) ÷ ${done + term} = ${f2(maxReach)}`,
    ];
    const needed = Math.max(raw, 0);
    const unreachable = raw > 4;
    const safe = raw <= 0;
    const chart = {
      type: 'scale' as const,
      title: 'GPA needed this term',
      min: 0,
      max: 4,
      value: Math.min(needed, 4),
      valueLabel: unreachable ? `${f2(raw)} (over 4.0)` : `Need ${f2(needed)}`,
      format: { format: 'number' as const },
      bands: [
        { from: 0, to: 2, label: 'Easy', tone: 'good' as const },
        { from: 2, to: 3, label: 'Steady', tone: 'ok' as const },
        { from: 3, to: 3.7, label: 'Hard', tone: 'warn' as const },
        { from: 3.7, to: 4, label: 'Near perfect', tone: 'bad' as const },
      ],
    };
    if (unreachable) {
      return {
        needed: raw,
        maxReach,
        chart,
        steps,
        tone: 'bad' as const,
        badge: 'Not reachable this term',
        note: `You would need ${f2(raw)}, which is above 4.0, so this target cannot be reached in one term. A 4.0 across all ${term} credits gets you to ${f2(maxReach)}. Spread the goal over more terms.`,
      };
    }
    if (safe) {
      return {
        needed: 0,
        maxReach,
        chart,
        steps,
        tone: 'good' as const,
        badge: 'Already safe',
        note: 'You already meet this target. Any passing term keeps you there; the calculator never shows a needed GPA below 0.',
      };
    }
    return {
      needed,
      maxReach,
      chart,
      steps,
      tone: needed >= 3.7 ? ('warn' as const) : needed >= 3 ? ('ok' as const) : ('good' as const),
      badge: `Aim for ${f2(needed)}`,
      note: `Average ${f2(needed)} across your ${term} credits this term to finish at ${f2(target)}. Schools differ, so check how yours handles repeats and pass/fail credits.`,
    };
  },
  content: {
    formula: [
      'Needed term GPA = (target × (credits done + credits this term) − current GPA × credits done) ÷ credits this term',
      'Highest reachable GPA = (current GPA × credits done + 4.0 × credits this term) ÷ (credits done + credits this term)',
    ],
    body: [
      'Your cumulative GPA is a credit-weighted average, so one term only moves it by its share of your total credits. This calculator works backwards: given where you are and where you want to be, it tells you the average GPA you need across this term’s credits.',
      'If the answer is above 4.0, the target is not reachable in one term, and you will see the highest cumulative GPA a perfect term would give you. If the answer is zero or less, you are already at or above the target, and any passing term keeps you there. It never shows a needed GPA below 0.',
      'Everything uses the 4.0 scale. Schools differ in how they treat A+ grades, repeated courses and pass/fail credits, so use the numbers as a guide and check with your registrar. It all runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'What GPA do I need this term to reach a 3.3?', a: 'With a 3.2 GPA over 60 credits and 15 credits this term, you need (3.3 × 75 − 3.2 × 60) ÷ 15 = (247.5 − 192) ÷ 15 = 3.70 this term.' },
      { q: 'What if the number is above 4.0?', a: 'Then the target is not reachable this term. With a 3.2 over 60 credits and a 3.5 target, you would need 4.70 across 15 credits. A 4.0 all term would give (192 + 60) ÷ 75 = 3.36, so plan for more than one term.' },
      { q: 'What if the number is zero or negative?', a: 'You are already at or above your target. A target of 3.0 from the same start needs (225 − 192) ÷ 15 = 2.20, which is fine; if the result were zero or less, any passing term would do, and the calculator shows 0 rather than a negative GPA.' },
      { q: 'Why does a bigger term help more?', a: 'More credits this term means the term makes up a larger share of your total, so it pulls your cumulative GPA further and the needed GPA drops.' },
    ],
  },
  related: ['gpa', 'final-grade', 'credits-to-graduate'],
  examples: [
    // (3.5*75 - 3.2*60)/15 = (262.5-192)/15 = 4.70 (not reachable); max = (192+60)/75 = 3.36
    { values: { current: 3.2, done: 60, term: 15, target: 3.5 }, expect: { needed: 4.7, maxReach: 3.36 }, tolerance: 1e-9 },
    // (3.3*75 - 192)/15 = (247.5-192)/15 = 3.70
    { values: { current: 3.2, done: 60, term: 15, target: 3.3 }, expect: { needed: 3.7, maxReach: 3.36 }, tolerance: 1e-9 },
    // (3.0*75 - 192)/15 = (225-192)/15 = 2.20
    { values: { current: 3.2, done: 60, term: 15, target: 3 }, expect: { needed: 2.2, maxReach: 3.36 }, tolerance: 1e-9 },
  ],
});
