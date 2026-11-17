import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

const NAMES: Record<number, string> = { 365: 'daily', 12: 'monthly', 4: 'quarterly', 2: 'semiannually', 1: 'annually' };

export default defineCalculator({
  slug: 'apy-calculator',
  title: 'APY Calculator (APR to APY)',
  category: 'finance',
  description: 'Convert a nominal interest rate (APR) to APY for any compounding schedule, and see how much a balance earns in one year at that rate.',
  keywords: ['apy calculator', 'apr to apy', 'apy vs apr', 'annual percentage yield', 'effective annual rate', 'savings account apy'],
  updated: '2026-11-17',
  popular: false,
  inputs: [
    { id: 'rate', label: 'Interest rate (APR)', type: 'number', default: 4.5, min: 0, max: 100, step: 0.05, suffix: '%', info: 'The stated yearly rate before compounding, for example 4.5.' },
    {
      id: 'freq',
      label: 'Compounding',
      type: 'select',
      info: 'How often the bank adds interest to your balance. Daily is common for savings accounts.',
      default: '365',
      options: [
        { value: '365', label: 'Daily' },
        { value: '12', label: 'Monthly' },
        { value: '4', label: 'Quarterly' },
        { value: '2', label: 'Semiannually' },
        { value: '1', label: 'Annually' },
      ],
    },
    { id: 'balance', label: 'Balance', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'Used to show what one year of interest is worth in dollars.' },
  ],
  outputs: [
    { id: 'apy', label: 'APY', format: 'percent', precision: 3, primary: true, info: '(1 + rate ÷ n)^n − 1, where n is the number of compounding periods per year.' },
    { id: 'extra', label: 'APY above the stated rate', format: 'percent', precision: 3, info: 'The boost from compounding: APY minus APR.' },
    { id: 'interest', label: 'Interest after 1 year', format: 'currency', precision: 2, info: 'Balance × APY, assuming no deposits or withdrawals.' },
    { id: 'end', label: 'Balance after 1 year', format: 'currency', precision: 2, info: 'Starting balance plus one year of interest.' },
  ],
  compute: (v) => {
    const r = num(v.rate);
    const n = Number(v.freq) || 365;
    const b = num(v.balance);
    if (r === null || b === null || r < 0 || r > 100 || b < 0 || n < 1) return { apy: null };
    const apy = Math.pow(1 + r / 100 / n, n) - 1;
    const interest = b * apy;
    const freqs = [1, 2, 4, 12, 365];
    return {
      apy,
      extra: apy - r / 100,
      interest,
      end: b + interest,
      chart: {
        type: 'bar',
        title: 'APY by compounding schedule',
        categories: ['Annually', 'Semiannually', 'Quarterly', 'Monthly', 'Daily'],
        series: [{ name: 'APY', values: freqs.map((f) => Math.pow(1 + r / 100 / f, f) - 1) }],
        format: { format: 'percent', precision: 3 },
      },
      steps: [
        `Rate per period = ${fmt(r, 3)}% ÷ ${n} = ${fmt(r / n, 5)}%`,
        `APY = (1 + ${fmt(r / 100 / n, 6)})^${n} − 1 = ${fmt(apy * 100, 3)}%`,
        `Interest = $${fmt(b)} × ${fmt(apy * 100, 3)}% = $${fmt(interest)}`,
      ],
      note: `${fmt(r, 2)}% APR compounded ${NAMES[n] ?? n + ' times a year'} is a ${fmt(apy * 100, 3)}% APY.`,
    };
  },
  content: {
    formula: [
      'APY = (1 + APR ÷ n)^n − 1',
      'n = compounding periods per year (365 daily, 12 monthly, 4 quarterly, 2 semiannual, 1 annual)',
      'Interest after one year = balance × APY',
    ],
    body: [
      'APR is the stated yearly interest rate. APY, the annual percentage yield, is what you actually earn in a year once interest is added to the balance and starts earning interest itself. The more often interest compounds, the higher the APY for the same APR.',
      'To convert, divide the APR by the number of compounding periods, add 1, raise it to the number of periods, and subtract 1. A 4.5% APR compounded daily gives (1 + 0.045 ÷ 365)^365 − 1, about 4.603%. Compounded monthly it is about 4.594%, and annually it is exactly 4.5%.',
      'When comparing savings accounts or CDs, compare APY to APY. For loans and credit cards the same maths works in reverse: a card with a 24% APR compounded monthly costs about 26.82% a year, which is the figure that matches what you really pay.',
      'This assumes the rate stays fixed and ignores deposits, withdrawals, fees and tax. Variable-rate accounts can change their rate at any time.',
    ],
    faq: [
      { q: 'What is the difference between APR and APY?', a: 'APR is the stated rate without the effect of compounding. APY includes it. At 4.5% compounded daily, APR is 4.5% and APY is about 4.603%.' },
      { q: 'How do you convert APR to APY?', a: 'APY = (1 + APR ÷ n)^n − 1, where n is the number of compounding periods per year. For 12% compounded monthly that is (1.01)^12 − 1, about 12.683%.' },
      { q: 'Is a higher APY always better?', a: 'For savings, yes, if you compare accounts with the same terms. Check minimum balances, fees and whether the rate is promotional or variable.' },
      { q: 'When are APR and APY the same?', a: 'When interest compounds only once a year, or when the rate is zero.' },
      { q: 'Does this include taxes or fees?', a: 'No. It computes the yield from the rate and compounding schedule only.' },
    ],
    sources: [
      { label: 'Effective interest rate (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Effective_interest_rate' },
      { label: 'Investor.gov: Compound interest calculator (SEC)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
    ],
  },
  related: ['cd', 'compound-interest', 'apr', 'simple-interest', 'savings-goal'],
  examples: [
    {
      // (1 + 0.045/365)^365 = exp(365 * ln(1.00012329)) = exp(0.044999 - ...) ≈ 1.046027 -> 4.6027%; $10,000 -> $460.27
      values: { rate: 4.5, freq: '365', balance: 10000 },
      expect: { apy: 0.046027, interest: 460.27 },
      tolerance: 1e-3,
    },
    {
      // 1.01^12 = 1.126825 -> 12.6825%
      values: { rate: 12, freq: '12', balance: 1000 },
      expect: { apy: 0.126825, interest: 126.825, end: 1126.825 },
      tolerance: 1e-3,
    },
    {
      // annual compounding: APY = APR
      values: { rate: 5, freq: '1', balance: 2000 },
      expect: { apy: 0.05, extra: 0, interest: 100 },
      tolerance: 1e-6,
    },
  ],
});
