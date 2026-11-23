import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'employer-match-calculator',
  title: '401(k) Employer Match Calculator',
  seoTitle: '401(k) Employer Match Calculator',
  category: 'finance',
  description: 'See how much 401(k) employer match you get, how much free money you are missing, and the contribution rate that captures the full match.',
  keywords: ['401k employer match calculator', 'how much is my employer match', 'am i missing out on 401k match', 'free money 401k', 'employer match 100 percent up to 6', 'full 401k match'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'salary', label: 'Annual salary', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, info: 'Your yearly pay before taxes, the amount your plan uses to work out the match.' },
    { id: 'you', label: 'Your contribution', type: 'number', suffix: '% of pay', default: 3, min: 0, max: 100, step: 0.5, info: 'The percent of each paycheck you put into the 401(k).' },
    { id: 'rate', label: 'Employer match rate', type: 'number', suffix: '%', default: 100, min: 0, max: 400, step: 5, help: '100 means a dollar for each dollar, 50 means 50 cents.', info: 'How much your employer adds for each dollar you contribute, up to the cap.' },
    { id: 'cap', label: 'Match cap', type: 'number', suffix: '% of pay', default: 6, min: 0, max: 100, step: 0.5, info: 'The most of your pay the employer will match, e.g. "up to 6% of salary". Find it in your plan summary.' },
  ],
  outputs: [
    { id: 'match', label: 'Employer match now', format: 'currency', primary: true, info: 'Matched part of your pay (the lower of your rate and the cap) × salary × match rate.' },
    { id: 'missed', label: 'Free money you are missing', format: 'currency', info: 'The most match you could get, minus what you get now.' },
    { id: 'extra', label: 'Extra you would contribute', format: 'currency', info: 'What it costs you each year to move up to the cap rate. Zero if you are already there.' },
    { id: 'total', label: 'Total into your 401(k) now', format: 'currency', info: 'Your contributions plus the employer match.' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const you = num(v.you);
    const rate = num(v.rate);
    const cap = num(v.cap);
    if (salary === null || you === null || rate === null || cap === null || salary <= 0 || you < 0 || rate < 0 || cap < 0) return { match: null };
    if (you > 100 || cap > 100) return { match: null, error: 'Percentages cannot be over 100%.' };
    const matched = Math.min(you, cap);
    const match = (matched / 100) * salary * (rate / 100);
    const maxMatch = (cap / 100) * salary * (rate / 100);
    const missed = maxMatch - match;
    const extra = (Math.max(0, cap - you) / 100) * salary;
    const yours = (you / 100) * salary;
    const total = yours + match;
    const full = missed <= 0.005;
    return {
      match,
      missed,
      extra,
      total,
      tone: full ? 'good' : 'warn',
      badge: full ? 'Full match captured' : `Missing ${money(missed)} a year`,
      note: full
        ? `You contribute ${pct(you / 100, 2)} and the match is capped at ${pct(cap / 100, 2)}, so you already get the full ${money(match)} a year from your employer.`
        : `At ${pct(you / 100, 2)} you get ${money(match)} a year. Contributing ${pct(cap / 100, 2)} instead would cost you ${money(extra)} more a year before tax and bring the match to ${money(maxMatch)}, an extra ${money(missed)}.`,
      chart: {
        type: 'bar',
        title: 'Match per year',
        categories: ['Now', 'At the cap'],
        stacked: true,
        format: { format: 'currency' },
        series: [
          { name: 'Your contribution', values: [yours, (Math.max(you, cap) / 100) * salary] },
          { name: 'Employer match', values: [match, maxMatch] },
        ],
      },
      steps: [
        `Matched pay = min(${pct(you / 100)}, ${pct(cap / 100)}) = ${pct(matched / 100)}`,
        `Match = ${pct(matched / 100)} × ${money(salary)} × ${pct(rate / 100)} = ${money(match)}`,
        `Most possible = ${pct(cap / 100)} × ${money(salary)} × ${pct(rate / 100)} = ${money(maxMatch)}`,
        `Missing = ${money(maxMatch)} − ${money(match)} = ${money(missed)}`,
      ],
    };
  },
  content: {
    formula: [
      'Match = min(your %, cap %) × salary × match rate',
      'Most possible match = cap % × salary × match rate',
      'Free money missed = most possible match − match now',
    ],
    body: [
      'Many employers add money to your 401(k) when you contribute, usually described like "100% match up to 6% of pay". This calculator turns that sentence into dollars: what you get now, the most you could get, and the gap between the two.',
      'The match is paid only on the part of your pay up to the cap. Contributing less than the cap leaves match money unclaimed, and contributing more than the cap is fine for your retirement but earns no extra match. A 50% match rate means 50 cents for each dollar you put in, up to the cap.',
      'Plans differ: some match per paycheck, some true up at year end, and many apply a vesting schedule, so part of the match may not be yours if you leave early. Check your plan summary for the exact rules. This calculator uses a simple annual salary and does not apply IRS contribution limits or any tax. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How is a 401(k) employer match calculated?', a: 'Take the lower of your contribution rate and the match cap, multiply by salary, then by the match rate. On $80,000 at 3% with a 100% match up to 6%, that is 3% × $80,000 × 100% = $2,400.' },
      { q: 'How much free money am I missing?', a: 'The most match you could get minus what you get now. With the same example the most is 6% × $80,000 = $4,800, so you are missing $2,400 a year.' },
      { q: 'What does "50% match up to 6%" mean?', a: 'The employer adds 50 cents for every dollar you contribute, on up to 6% of your pay. On $80,000 that is at most $2,400.' },
      { q: 'Should I contribute more than the match cap?', a: 'That is a personal choice. Contributions above the cap get no extra match but still count toward your own retirement savings.' },
      { q: 'What is vesting?', a: 'A schedule that decides when employer match money becomes yours. If you leave before you are fully vested, you may keep only part of it. Ask your plan administrator.' },
    ],
    sources: [],
  },
  related: ['401k-max-out', 'retirement', 'raise-calculator', 'paychecks-per-year', 'lifestyle-creep', 'savings-rate-escalator'],
  examples: [
    // 3% × 80,000 = 2,400 × 100% = 2,400 match; max 6% × 80,000 = 4,800; missed 2,400; extra 3% × 80,000 = 2,400; total 2,400 + 2,400 = 4,800.
    { values: { salary: 80000, you: 3, rate: 100, cap: 6 }, expect: { match: 2400, missed: 2400, extra: 2400, total: 4800 }, tolerance: 1e-6 },
    // 50% match up to 6%, 100,000, you 4%: match = 4% × 100,000 × 50% = 2,000; max 3,000; missed 1,000; extra 2% × 100,000 = 2,000; total 4,000 + 2,000 = 6,000.
    { values: { salary: 100000, you: 4, rate: 50, cap: 6 }, expect: { match: 2000, missed: 1000, extra: 2000, total: 6000 }, tolerance: 1e-6 },
    // You 10% above 5% cap, 60,000, 100%: match 5% × 60,000 = 3,000; missed 0; extra 0; total 6,000 + 3,000 = 9,000.
    { values: { salary: 60000, you: 10, rate: 100, cap: 5 }, expect: { match: 3000, missed: 0, extra: 0, total: 9000 }, tolerance: 1e-6 },
  ],
});
