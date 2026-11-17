import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// Months until the balance hits zero. Balance after n months with monthly rate i and net monthly drain D:
// B(n) = S(1+i)^n − D((1+i)^n − 1)/i. Setting B(n) = 0 gives n = −ln(1 − S·i/D) / ln(1+i).
function monthsLeft(s: number, d: number, i: number): number {
  if (d <= 0) return Infinity;
  if (i === 0) return s / d;
  const x = 1 - (s * i) / d;
  if (x <= 0) return Infinity;
  return -Math.log(x) / Math.log(1 + i);
}

export default defineCalculator({
  slug: 'savings-runway',
  title: 'Savings Runway Calculator',
  category: 'finance',
  description: 'Find out how many months your savings will last if you stop earning or earn less, with optional interest and any income that still comes in.',
  keywords: ['savings runway calculator', 'how long will my savings last', 'how many months of savings', 'layoff savings calculator', 'cash runway personal', 'how long can i live off savings'],
  updated: '2026-11-17',
  inputs: [
    { id: 'savings', label: 'Savings you can spend', type: 'number', prefix: '$', default: 12000, min: 0, step: 100, info: 'Cash and easy-to-reach savings. Leave out money you could not touch, such as retirement accounts.' },
    { id: 'spend', label: 'Monthly spending', type: 'number', prefix: '$', default: 3000, min: 0, step: 50, info: 'Everything you spend in a normal month: rent, food, bills, insurance, debt payments.' },
    { id: 'income', label: 'Income still coming in', type: 'number', prefix: '$', default: 0, min: 0, step: 50, info: "Side work, benefits, a partner's contribution or part-time pay. Leave at 0 if there is none." },
    { id: 'rate', label: 'Interest on your savings', type: 'number', suffix: '% a year', default: 0, min: 0, max: 20, step: 0.1, info: 'Annual rate your savings earn, compounded monthly. Leave at 0 to be cautious.' },
  ],
  outputs: [
    { id: 'months', label: 'Months your savings last', format: 'number', precision: 1, suffix: 'months', primary: true, info: 'How long until the balance reaches zero at the monthly drain below.' },
    { id: 'drain', label: 'Net monthly drain', format: 'currency', info: 'Spending minus income. Interest is not included here.' },
    { id: 'weeks', label: 'Same in weeks', format: 'number', precision: 0, suffix: 'weeks', info: 'Months × 52 ÷ 12, rounded.' },
  ],
  compute: (v) => {
    const s = num(v.savings);
    const e = num(v.spend);
    const inc = num(v.income) ?? 0;
    const r = num(v.rate) ?? 0;
    if (s === null || e === null || s < 0 || e < 0 || inc < 0 || r < 0) return { months: null };
    const drain = e - inc;
    const i = r / 100 / 12;
    if (drain <= 0) {
      return {
        months: null,
        drain,
        error: 'Your income covers your spending, so your savings are not shrinking. Lower the income or raise the spending to see a runway.',
      };
    }
    const n = monthsLeft(s, drain, i);
    if (!isFinite(n)) {
      return {
        months: null,
        drain,
        tone: 'good' as const,
        badge: 'Never runs out',
        note: `Your savings earn about $${fmt(s * i, 2)} a month, which covers the $${fmt(drain, 2)} drain, so the balance never reaches zero.`,
      };
    }
    const horizon = Math.min(Math.max(Math.ceil(n) + 2, 6), 240);
    const xs: number[] = [];
    const bal: number[] = [];
    let b = s;
    for (let m = 0; m <= horizon; m++) {
      xs.push(m);
      bal.push(Math.max(b, 0));
      b = b * (1 + i) - drain;
    }
    const tone = n >= 6 ? ('good' as const) : n >= 3 ? ('ok' as const) : ('bad' as const);
    return {
      months: n,
      drain,
      weeks: Math.round((n * 52) / 12),
      tone,
      badge: n >= 6 ? 'Solid runway' : n >= 3 ? 'Thin runway' : 'Short runway',
      note: `At $${fmt(drain, 2)} a month, $${fmt(s)} lasts about ${fmt(n, 1)} months. A common guide is 3 to 6 months of spending, so ${n >= 6 ? 'you are past that' : 'you have ' + fmt(n, 1) + ' of the 3 to 6 months'}.`,
      chart: {
        type: 'line',
        title: 'Your savings balance, month by month',
        x: xs,
        xLabel: 'Months from now',
        yFormat: { format: 'currency' },
        series: [{ name: 'Balance', values: bal }],
      },
      steps: [
        `Net monthly drain = $${fmt(e, 2)} − $${fmt(inc, 2)} = $${fmt(drain, 2)}`,
        i === 0
          ? `Months = $${fmt(s, 2)} ÷ $${fmt(drain, 2)} = ${fmt(n, 1)}`
          : `Months = −ln(1 − $${fmt(s, 2)} × ${fmt(i * 100, 4)}% ÷ $${fmt(drain, 2)}) ÷ ln(1 + ${fmt(i * 100, 4)}%) = ${fmt(n, 1)}`,
      ],
    };
  },
  content: {
    formula: [
      'Without interest: months = savings ÷ (monthly spending − monthly income)',
      'With interest: months = −ln(1 − savings × i ÷ drain) ÷ ln(1 + i), where i is the monthly rate and drain is spending minus income',
    ],
    body: [
      'Savings runway is the number of months you could cover your costs if your pay stopped or dropped. It is the question behind a layoff, a career break, a move or a long job search, and it is more useful than a total balance because it is measured in time.',
      'Enter the money you could actually spend, your usual monthly costs and any income that would carry on. If you earn interest, add the rate and the calculator accounts for it month by month. If interest alone covers the drain, your savings never run out and the calculator says so.',
      'Everything runs in your browser, and nothing you type is stored or sent anywhere.',
    ],
    sections: [
      {
        heading: 'How to stretch your runway',
        paragraphs: [
          'Cut spending first: pausing subscriptions, renegotiating bills and trimming variable spending all lower the monthly drain, and every dollar off the drain adds months right away.',
          'Add any income you can, even part-time. Income reduces the drain directly, so $500 a month of side income against $3,000 of spending lengthens the runway by 20%. Try the emergency fund calculator to set a target before you need it.',
        ],
      },
    ],
    faq: [
      { q: 'How do you calculate how long savings will last?', a: 'Divide your savings by the monthly drain, which is spending minus income. With $12,000 saved and $3,000 spent each month with no income, the savings last 4 months.' },
      { q: 'How does income change the answer?', a: 'Income lowers the drain. With the same $12,000 and $3,000 spending but $1,000 of income, the drain is $2,000 and the savings last 6 months.' },
      { q: 'Does interest make a big difference?', a: 'Rarely over a few months. $1,000 with a $100 monthly drain lasts 10 months with no interest, and about 10.6 months at 12% a year (1% a month).' },
      { q: 'How many months of savings should I have?', a: 'A common guide is 3 to 6 months of spending, with more if your income is irregular or you support others. It is a rule of thumb, not a rule.' },
    ],
  },
  related: ['emergency-fund', 'daily-spending-allowance', 'savings-goal', 'budget-50-30-20', 'retirement'],
  examples: [
    // 12000 ÷ 3000 = 4 months; 4 × 52 / 12 = 17.33 → 17 weeks.
    { values: { savings: 12000, spend: 3000, income: 0, rate: 0 }, expect: { months: 4, drain: 3000, weeks: 17 }, tolerance: 1e-9 },
    // drain 2000; 12000 ÷ 2000 = 6 months; 26 weeks.
    { values: { savings: 12000, spend: 3000, income: 1000, rate: 0 }, expect: { months: 6, drain: 2000, weeks: 26 }, tolerance: 1e-9 },
    // i = 1%; n = −ln(1 − 1000×0.01/100) ÷ ln(1.01) = −ln(0.9) ÷ ln(1.01) = 0.1053605 ÷ 0.00995033 = 10.5886.
    { values: { savings: 1000, spend: 100, income: 0, rate: 12 }, expect: { months: 10.5886 }, tolerance: 1e-3 },
  ],
});
