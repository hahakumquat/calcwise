import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'annuity-calculator',
  title: 'Annuity Calculator',
  category: 'finance',
  description: 'Find the future and present value of regular payments. Enter the payment, rate, years and timing to see what it grows to and what it is worth today.',
  keywords: ['annuity calculator', 'future value of annuity', 'present value of annuity', 'ordinary annuity', 'annuity due', 'annuity formula'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'pmt', label: 'Payment each period', type: 'number', prefix: '$', default: 500, min: 0, step: 10, info: 'The amount paid in (or received) every period.' },
    { id: 'rate', label: 'Interest rate', type: 'number', default: 6, min: 0, max: 100, step: 0.1, suffix: '% a year', info: 'The yearly rate. It is split evenly across the periods in a year.' },
    { id: 'years', label: 'Number of years', type: 'number', default: 10, min: 0, max: 100, step: 1, suffix: 'years', info: 'How long the payments last.' },
    {
      id: 'freq', label: 'Payments per year', type: 'select', default: '12',
      info: 'How often a payment is made.',
      options: [
        { value: '12', label: 'Monthly' },
        { value: '4', label: 'Quarterly' },
        { value: '2', label: 'Twice a year' },
        { value: '1', label: 'Yearly' },
      ],
    },
    {
      id: 'timing', label: 'Payment timing', type: 'select', default: '0',
      info: 'Ordinary annuity: paid at the end of each period. Annuity due: paid at the start, so each payment earns one extra period of interest.',
      options: [
        { value: '0', label: 'End of period (ordinary)' },
        { value: '1', label: 'Start of period (due)' },
      ],
    },
  ],
  outputs: [
    { id: 'fv', label: 'Future value', format: 'currency', precision: 2, primary: true, info: 'What all the payments grow to at the end of the term.' },
    { id: 'pv', label: 'Present value', format: 'currency', precision: 2, info: 'What the whole payment stream is worth today at this rate.' },
    { id: 'paid', label: 'Total paid in', format: 'currency', precision: 2, info: 'Payment × number of payments.' },
    { id: 'interest', label: 'Interest earned', format: 'currency', precision: 2, info: 'Future value minus total paid in.' },
  ],
  compute: (v) => {
    const pmt = num(v.pmt);
    const r = num(v.rate);
    const y = num(v.years);
    const m = Number(v.freq);
    const due = Number(v.timing) === 1;
    if (pmt === null || r === null || y === null || !(m > 0) || pmt < 0 || r < 0 || r > 100 || y < 0 || y > 100) return { fv: null };
    const i = r / 100 / m;
    const n = Math.round(y * m);
    const grow = Math.pow(1 + i, n);
    let fv = i === 0 ? pmt * n : (pmt * (grow - 1)) / i;
    let pv = i === 0 ? pmt * n : (pmt * (1 - 1 / grow)) / i;
    if (due) {
      fv *= 1 + i;
      pv *= 1 + i;
    }
    const paid = pmt * n;
    const x: number[] = [];
    const contrib: number[] = [];
    const balance: number[] = [];
    const stepSize = Math.max(1, Math.ceil(n / 60));
    for (let k = 0; k <= n; k += stepSize) {
      const g = Math.pow(1 + i, k);
      let b = i === 0 ? pmt * k : (pmt * (g - 1)) / i;
      if (due) b *= 1 + i;
      x.push(+(k / m).toFixed(2));
      contrib.push(pmt * k);
      balance.push(b);
    }
    return {
      fv,
      pv,
      paid,
      interest: fv - paid,
      chart: {
        type: 'line',
        title: 'Balance vs money paid in',
        x,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Balance', values: balance },
          { name: 'Paid in', values: contrib },
        ],
      },
      steps: [
        `Rate per period = ${fmt(r, 4)}% ÷ ${m} = ${fmt(i * 100, 4)}%, periods = ${n}`,
        `Future value = $${fmt(pmt)} × ((1 + ${fmt(i, 6)})^${n} − 1) ÷ ${fmt(i, 6)}${due ? ' × (1 + i)' : ''} = $${fmt(fv)}`,
      ],
      note: `${n} payments of $${fmt(pmt)} at ${fmt(r)}% a year grow to $${fmt(fv)} and are worth $${fmt(pv)} today.`,
    };
  },
  content: {
    formula: [
      'Future value = P × ((1 + i)^n − 1) ÷ i',
      'Present value = P × (1 − (1 + i)^−n) ÷ i',
      'P = payment, i = rate per period, n = number of payments. For an annuity due, multiply both by (1 + i).',
    ],
    body: [
      'An annuity is a series of equal payments made at regular intervals. Saving $500 every month is an annuity you pay into. A pension or a loan repayment is an annuity you receive or pay out.',
      'This calculator gives two numbers. The future value is what the payments add up to once interest is included. The present value is what the whole stream is worth today, discounted at the same rate. They describe the same stream at two points in time.',
      'Timing matters a little. With an ordinary annuity each payment lands at the end of the period. With an annuity due it lands at the start, so every payment earns one more period of interest and both values are higher by a factor of (1 + i).',
      'It assumes a fixed rate and equal payments, and ignores tax, fees and inflation. Use it for planning and comparing, not as a promise of returns.',
    ],
    faq: [
      { q: 'What is the future value of an annuity?', a: 'The total a stream of equal payments grows to by the end, with interest. Paying $500 a month at 6% for 10 years gives about $81,939.67.' },
      { q: 'What is the present value of an annuity?', a: 'The lump sum today that is equal to the whole payment stream at the chosen rate. For those same payments it is about $45,036.73.' },
      { q: 'Ordinary annuity vs annuity due?', a: 'An ordinary annuity pays at the end of each period; an annuity due pays at the start. The due version is worth (1 + i) times more.' },
      { q: 'What if the rate is 0%?', a: 'There is no interest, so the future value and present value both equal payment × number of payments.' },
    ],
    sources: [
      { label: 'Annuity (finance) (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Annuity' },
      { label: 'Annuities (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/annuities' },
    ],
  },
  related: ['present-value', 'compound-interest', 'investment', 'retirement', 'savings-goal'],
  examples: [
    {
      // i=0.005, n=120, 1.005^120=1.819397; 500*0.819397/0.005=81939.67; PV 500*(1-0.549633)/0.005=45036.73.
      values: { pmt: 500, rate: 6, years: 10, freq: '12', timing: '0' },
      expect: { fv: 81939.67, pv: 45036.73, paid: 60000, interest: 21939.67 },
      tolerance: 1e-2,
    },
    {
      // 1000*(1.157625-1)/0.05 = 3152.50; PV 2723.25.
      values: { pmt: 1000, rate: 5, years: 3, freq: '1', timing: '0' },
      expect: { fv: 3152.5, pv: 2723.25 },
      tolerance: 1e-2,
    },
    {
      // Due: 3152.5 * 1.05 = 3310.125; PV 2723.248 * 1.05 = 2859.41.
      values: { pmt: 1000, rate: 5, years: 3, freq: '1', timing: '1' },
      expect: { fv: 3310.13, pv: 2859.41 },
      tolerance: 1e-2,
    },
    { values: { pmt: 100, rate: 0, years: 2, freq: '12', timing: '0' }, expect: { fv: 2400, pv: 2400, interest: 0 }, tolerance: 1e-9 },
  ],
});
