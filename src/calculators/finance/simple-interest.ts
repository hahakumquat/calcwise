import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { growthCharts } from '../../lib/helpers/finance';
import { money, toYears, YEAR_S, MONTH_S } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'simple-interest',
  title: 'Simple Interest Calculator',
  category: 'finance',
  description: 'Calculate simple interest and the total amount owed or earned from principal, rate and time.',
  keywords: ['simple interest', 'I = Prt', 'interest formula', 'flat interest'],
  inputs: [
    { id: 'principal', label: 'Principal', type: 'number', prefix: '$', default: 10000, min: 0, info: 'The original amount borrowed or deposited. Interest is calculated on this amount only.' },
    { id: 'rate', label: 'Annual interest rate', type: 'number', suffix: '%', default: 5, min: 0, step: 0.1, info: 'The yearly interest rate as a percentage.' },
    { id: 'time', label: 'Time', type: 'number', unit: 'time', units: ['yr', 'mo', 'd'], defaultUnit: 'yr', default: 3, min: 0, info: 'How long the money is borrowed or invested. Days are converted to years using 365.2425 days.' },
  ],
  outputs: [
    { id: 'interest', label: 'Interest', format: 'currency', primary: true, info: 'Interest charged or earned: principal × rate × time.' },
    { id: 'total', label: 'Total (principal + interest)', format: 'currency', info: 'The principal plus the interest — what you repay or receive at the end.' },
    { id: 'perYear', label: 'Interest per year', format: 'currency', info: 'Interest for one full year. With simple interest it is the same every year.' },
  ],
  compute: (v) => {
    const P = num(v.principal);
    const rate = num(v.rate);
    const timeS = num(v.time);
    if (P === null || rate === null || timeS === null || P < 0 || rate < 0 || timeS < 0) return { interest: null };
    const t = toYears(timeS);
    const r = rate / 100;
    const interest = P * r * t;
    const xs = Array.from({ length: 11 }, (_, i) => +((t * i) / 10).toFixed(3));
    return {
      interest,
      total: P + interest,
      perYear: P * r,
      chart: growthCharts(xs, xs.map(() => P), xs.map((x) => P * (1 + r * x)), 'Principal', 'Interest'),
      steps: [`t = ${+t.toFixed(6)} years`, `I = P × r × t = ${money(P)} × ${r} × ${+t.toFixed(6)} = ${money(interest)}`, `Total = ${money(P)} + ${money(interest)} = ${money(P + interest)}`],
    };
  },
  content: {
    formula: ['I = P × r × t', 'Total A = P(1 + r·t)', 'r = annual rate as a decimal, t = time in years'],
    body: [
      'Simple interest is charged or earned only on the original principal. Unlike compound interest, the interest itself never earns more interest, so the balance grows in a straight line: the same dollar amount every year.',
      'It is used for some short-term loans, many auto loans calculated on a daily simple-interest basis, Treasury bills and certain bonds, and informal loans between people. Most savings accounts and credit cards compound instead.',
      'When time is given in days, the calculator converts it to years using an average year of 365.2425 days. Banks sometimes use a 360-day or 365-day year by convention, which can change the result by a few cents to a few dollars.',
    ],
    faq: [
      { q: 'How is simple interest different from compound interest?', a: 'With simple interest you only earn on the principal. With compound interest you also earn on interest already added. Over one year the two are close; over decades compound interest pulls far ahead.' },
      { q: 'How do I find the rate if I know the interest?', a: 'Rearrange the formula: r = I ÷ (P × t). For example, $600 of interest on $5,000 over 2 years is 600 ÷ 10,000 = 6% a year.' },
    ],
  },
  related: ['compound-interest', 'loan', 'cd', 'apr'],
  examples: [
    { values: { principal: 10000, rate: 5, time: 3 * YEAR_S }, expect: { interest: 1500, total: 11500 } },
    { values: { principal: 2000, rate: 6, time: 6 * MONTH_S }, expect: { interest: 60 } },
  ],
});
