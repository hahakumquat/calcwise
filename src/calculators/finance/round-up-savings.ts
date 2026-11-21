import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, fvAnnuity } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'round-up-savings',
  title: 'Round-Up Savings Calculator',
  category: 'finance',
  description: 'See how much spare change you could save in a year by rounding up every card purchase, and what it grows to if you invest it.',
  keywords: ['round up savings calculator', 'spare change savings', 'round up purchases to save', 'how much can i save with round ups', 'save without noticing', 'change jar calculator'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'perWeek', label: 'Card purchases per week', type: 'number', default: 20, min: 0, max: 500, step: 1, info: 'How many times a week you tap or swipe a card. Count coffees, groceries, rides and online orders.' },
    { id: 'roundUp', label: 'Average round-up per purchase', type: 'number', prefix: '$', default: 0.5, min: 0, max: 1, step: 0.05, info: 'Prices end in random cents, so rounding up to the next dollar averages about 50 cents. This is an assumption; use your own figure if you know it.' },
    { id: 'multiplier', label: 'Round-up multiplier', type: 'select', default: '1', options: [{ value: '1', label: '1x (plain round-up)' }, { value: '2', label: '2x' }, { value: '5', label: '5x' }], info: 'Some apps let you multiply each round-up. 2x moves double the spare change.' },
    { id: 'years', label: 'Years', type: 'number', default: 10, min: 1, max: 50, step: 1, optional: true, info: 'How long you keep saving the round-ups.' },
    { id: 'rate', label: 'Assumed yearly return', type: 'number', suffix: '%', default: 7, min: 0, max: 20, step: 0.5, optional: true, info: 'An assumption, not a promise. Use 0 to see savings with no growth.' },
  ],
  outputs: [
    { id: 'yearly', label: 'Saved per year', format: 'currency', primary: true, info: 'Purchases per week × round-up × multiplier × 52.' },
    { id: 'monthly', label: 'Saved per month', format: 'currency', info: 'The yearly amount divided by 12.' },
    { id: 'contributed', label: 'Put in over the period', format: 'currency', info: 'The yearly amount times the number of years, with no growth.' },
    { id: 'future', label: 'Value with growth', format: 'currency', info: 'Each year’s savings invested at the end of the year at the assumed return.' },
  ],
  compute: (v) => {
    const perWeek = num(v.perWeek);
    const roundUp = num(v.roundUp);
    const mult = Number(v.multiplier) || 1;
    const years = num(v.years) ?? 10;
    const rate = num(v.rate) ?? 0;
    if (perWeek === null || roundUp === null || perWeek < 0 || roundUp < 0 || mult < 1 || years < 1 || rate < 0) return { yearly: null };
    const n = Math.round(years);
    const r = rate / 100;
    const yearly = perWeek * roundUp * mult * 52;
    if (yearly <= 0) return { yearly: null, error: 'Enter at least one purchase a week with a round-up above zero.' };
    const contributed = yearly * n;
    const future = fvAnnuity(yearly, r, n);
    const xs: number[] = [];
    const put: number[] = [];
    const growth: number[] = [];
    for (let y = 0; y <= n; y++) {
      xs.push(y);
      put.push(yearly * y);
      growth.push(fvAnnuity(yearly, r, y) - yearly * y);
    }
    return {
      yearly,
      monthly: yearly / 12,
      contributed,
      future,
      tone: 'good',
      badge: `${money(yearly, 0)} a year`,
      note: `${perWeek} purchases a week rounded up by ${money(roundUp)} (${mult}x) saves ${money(yearly)} a year. After ${n} years you would put in ${money(contributed)}${rate > 0 ? ` and have about ${money(future)} at ${rate}% a year` : ''}. This ignores tax, fees and any app charges.`,
      chart: {
        type: 'area',
        stacked: true,
        title: 'What the spare change could become',
        x: xs,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Money you put in', values: put },
          { name: 'Growth', values: growth },
        ],
      },
      steps: [
        `Per year = ${perWeek} × ${money(roundUp)} × ${mult} × 52 = ${money(yearly)}`,
        `Per month = ${money(yearly)} ÷ 12 = ${money(yearly / 12)}`,
        r > 0 ? `Future value = ${money(yearly)} × ((1 + ${r})^${n} − 1) ÷ ${r} = ${money(future)}` : `No growth: ${money(yearly)} × ${n} = ${money(future)}`,
      ],
    };
  },
  content: {
    formula: [
      'Saved per year = purchases per week × average round-up × multiplier × 52',
      'Future value = yearly savings × ((1 + r)ⁿ − 1) ÷ r (one deposit at the end of each year)',
    ],
    body: [
      'Round-up saving rounds each card purchase up to the next dollar and moves the difference into savings. A $3.60 coffee becomes $4.00 and 40 cents goes to your pot. You barely notice it, which is the point.',
      'Because prices end in random cents, the round-up averages about 50 cents. That is the default here, and it is an assumption: if many of your prices end in .99 the real figure is closer to 1 cent, and if they are round numbers it can be zero. Change it to match your own spending.',
      'The growth line assumes a steady return and a single deposit at the end of each year. Real returns are uneven, and the result ignores tax and any fee an app may charge. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How much can I save by rounding up?', a: 'With 20 card purchases a week and a 50 cent average round-up, you save 20 × $0.50 × 52 = $520 a year, or about $43.33 a month.' },
      { q: 'What does $520 a year grow to?', a: 'At 7% a year for 10 years with end-of-year deposits, about $7,184.55 on $5,200 put in. That is an example based on an assumed return, not a guarantee.' },
      { q: 'Why 50 cents?', a: 'If the cents on a price are equally likely to be anything from 01 to 99, rounding up to the next dollar adds about 50 cents on average. It is an assumption; edit it for your own habits.' },
      { q: 'What does the multiplier do?', a: 'It multiplies each round-up. At 2x, the 20 purchases a week example saves $1,040 a year.' },
      { q: 'Does this include fees or tax?', a: 'No. Some apps charge a monthly fee that could outweigh small round-ups, so check before you sign up.' },
    ],
    sources: [{ label: 'Investor.gov: Compound interest calculator (SEC)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' }],
  },
  related: ['savings-challenge', 'latte-factor', 'compound-interest', 'sinking-fund', 'savings-goal'],
  examples: [
    // 20 × 0.5 × 1 × 52 = 520; 1.07^10 = 1.967151 → 520 × 0.967151 / 0.07 = 7,184.55; contributed 5,200.
    { values: { perWeek: 20, roundUp: 0.5, multiplier: '1', years: 10, rate: 7 }, expect: { yearly: 520, monthly: 43.3333, contributed: 5200, future: 7184.55 }, tolerance: 1e-3 },
    // 10 × 0.4 × 2 × 52 = 416; 0% return, 5 years → 2,080.
    { values: { perWeek: 10, roundUp: 0.4, multiplier: '2', years: 5, rate: 0 }, expect: { yearly: 416, contributed: 2080, future: 2080 }, tolerance: 1e-6 },
  ],
});
