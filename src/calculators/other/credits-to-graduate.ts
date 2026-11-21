import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'credits-to-graduate',
  title: 'Credits to Graduate Calculator: Terms Left',
  category: 'other',
  description: 'Find how many credits you still need, how many terms and years that takes at your course load, and what the remaining credits could cost.',
  keywords: ['credits to graduate calculator', 'how many semesters left', 'college credits remaining', 'graduation planner', 'credit hours left to graduate', 'years left in college'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'required', label: 'Credits required to graduate', type: 'number', default: 120, min: 1, step: 1, info: 'The total on your degree audit. Many bachelor\'s degrees need about 120, but check your program.' },
    { id: 'done', label: 'Credits completed', type: 'number', default: 45, min: 0, step: 1, info: 'Credits you have already passed and that count toward the degree.' },
    { id: 'current', label: 'Credits in progress this term', type: 'number', default: 15, min: 0, step: 1, optional: true, info: 'Credits you are taking now and expect to pass.' },
    { id: 'perTerm', label: 'Credits per term from now on', type: 'number', default: 15, min: 1, step: 1, info: 'Your planned course load each term.' },
    { id: 'termsYear', label: 'Terms per year', type: 'number', default: 2, min: 1, max: 4, step: 1, info: '2 for semesters, 3 for trimesters or semesters plus summer, 4 for quarters.' },
    { id: 'tuition', label: 'Tuition per credit', type: 'number', prefix: '$', default: 0, min: 0, step: 10, optional: true, info: 'Optional. Leave 0 to skip the cost estimate. Fees and financial aid are not included.' },
  ],
  outputs: [
    { id: 'remaining', label: 'Credits still needed', format: 'integer', primary: true, info: 'Required − completed − in progress, never below 0.' },
    { id: 'terms', label: 'Terms left after this one', format: 'integer', info: 'Remaining credits ÷ credits per term, rounded up.' },
    { id: 'years', label: 'Years left', format: 'number', info: 'Terms ÷ terms per year.' },
    { id: 'cost', label: 'Tuition for remaining credits', format: 'currency', info: 'Remaining credits × tuition per credit.' },
  ],
  compute: (v) => {
    const required = num(v.required);
    const done = num(v.done);
    const current = num(v.current) ?? 0;
    const perTerm = num(v.perTerm);
    const termsYear = num(v.termsYear);
    const tuition = num(v.tuition) ?? 0;
    if (required === null || done === null || perTerm === null || termsYear === null) return { remaining: null };
    if (required < 1 || done < 0 || current < 0 || perTerm < 1 || termsYear < 1 || tuition < 0) return { remaining: null };

    const remaining = Math.max(0, required - done - current);
    const terms = Math.ceil(remaining / perTerm);
    const years = terms / termsYear;
    const cost = remaining * tuition;
    const over = done + current > required;

    return {
      remaining,
      terms,
      years,
      cost,
      tone: remaining === 0 ? 'good' : 'ok',
      badge: remaining === 0 ? 'On track to finish this term' : `${terms} more term${terms === 1 ? '' : 's'}`,
      chart: {
        type: 'bar',
        title: 'Credits toward your degree',
        categories: ['Completed', 'In progress', 'Still needed'],
        series: [{ name: 'Credits', values: [done, current, remaining] }],
        format: { format: 'integer' },
      },
      steps: [
        `Credits still needed = ${required} − ${done} − ${current} = ${remaining}${over ? ' (you already have more than required)' : ''}`,
        `Terms = ${remaining} ÷ ${perTerm} = ${+(remaining / perTerm).toFixed(2)}, rounded up to ${terms}`,
        `Years = ${terms} ÷ ${termsYear} = ${+years.toFixed(2)}`,
        ...(tuition > 0 ? [`Tuition = ${remaining} × ${money(tuition, 2)} = ${money(cost, 2)}`] : []),
      ],
      note: 'This assumes every credit you take counts toward your degree and that you pass. Required courses with prerequisites or limited offerings can add time, so confirm the plan with your academic advisor.',
    };
  },
  content: {
    formula: [
      'Credits still needed = required − completed − in progress (never below 0)',
      'Terms left = credits still needed ÷ credits per term, rounded up',
      'Years left = terms left ÷ terms per year',
      'Tuition = credits still needed × tuition per credit',
    ],
    body: [
      'Between exams and registration it helps to know exactly how far you are from the finish line. Enter the credits your degree requires, what you have completed and what you are taking now, and this calculator tells you how many credits and terms remain.',
      'Terms are counted after the current one, and the number is rounded up, because a term with a few credits left still takes a whole term. Set terms per year to 2 for semesters, 3 for trimesters, or 4 for quarters.',
      'Add a tuition rate per credit to see what the remaining credits could cost. It does not include fees, books or aid, and it assumes every credit counts toward your degree, so check with an advisor before you plan around it.',
    ],
    sections: [],
    faq: [
      { q: 'How many terms are left with 120 required, 45 done and 15 in progress?', a: '120 − 45 − 15 = 60 credits remain. At 15 credits a term that is 4 terms, which is 2 years with 2 terms a year.' },
      { q: 'What if I take fewer credits?', a: 'At 12 credits a term, 60 remaining credits take 60 ÷ 12 = 5 terms, or 2.5 years at 2 terms a year.' },
      { q: 'What would the remaining credits cost?', a: 'At $400 per credit, 60 credits is $24,000 in tuition, before fees or aid.' },
      { q: 'Does summer count as a term?', a: 'If you plan to take classes in summer, set terms per year to 3. Otherwise leave it at 2.' },
      { q: 'Do transfer credits count?', a: 'Add them to credits completed, but only the ones your school accepts toward your degree.' },
    ],
    sources: [
      { label: 'U.S. Department of Education: Federal Student Aid', url: 'https://studentaid.gov/' },
    ],
  },
  related: ['gpa', 'final-grade', 'student-loan-payoff', 'weighted-grade'],
  examples: [
    {
      // 120 − 45 − 15 = 60; 60/15 = 4 terms; 4/2 = 2 years; 60 × 400 = 24,000.
      values: { required: 120, done: 45, current: 15, perTerm: 15, termsYear: 2, tuition: 400 },
      expect: { remaining: 60, terms: 4, years: 2, cost: 24000 },
      tolerance: 0.001,
    },
    {
      // 60 remaining at 12 per term = 5 terms; 5/2 = 2.5 years; no tuition.
      values: { required: 120, done: 45, current: 15, perTerm: 12, termsYear: 2, tuition: 0 },
      expect: { remaining: 60, terms: 5, years: 2.5, cost: 0 },
      tolerance: 0.001,
    },
  ],
});
