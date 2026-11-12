import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { growthCharts, monthIdx, yr } from '../../lib/helpers/finance';
import { money, pct, toMonths, YEAR_S } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'compound-interest',
  title: 'Compound Interest Calculator',
  category: 'finance',
  description: 'See how savings grow with compound interest and regular monthly contributions, at any compounding frequency.',
  keywords: ['compound interest', 'interest on interest', 'savings growth', 'future value', 'APY', 'compounding'],
  popular: true,
  inputs: [
    { id: 'principal', label: 'Initial deposit', type: 'number', prefix: '$', default: 10000, min: 0, info: 'The money you start with today. Use 0 if you are starting from scratch.' },
    { id: 'contribution', label: 'Monthly contribution', type: 'number', prefix: '$', default: 200, min: 0, optional: true, info: 'How much you add at the end of each month. Leave blank for a one-time deposit.' },
    { id: 'rate', label: 'Annual interest rate', type: 'number', suffix: '%', default: 7, step: 0.1, info: 'The yearly interest rate or expected return before compounding. High-yield savings pay roughly 3–5%; stock markets have averaged more but vary.' },
    {
      id: 'frequency',
      info: 'How often interest is added to the balance. Savings accounts usually compound daily or monthly.',
      label: 'Compounding',
      type: 'select',
      default: '12',
      options: [
        { value: '1', label: 'Annually' },
        { value: '2', label: 'Semiannually' },
        { value: '4', label: 'Quarterly' },
        { value: '12', label: 'Monthly' },
        { value: '365', label: 'Daily' },
        { value: 'continuous', label: 'Continuously' },
      ],
    },
    { id: 'time', label: 'Time', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 10, min: 0, info: 'How long the money grows.' },
  ],
  outputs: [
    { id: 'futureValue', label: 'Future value', format: 'currency', primary: true, info: 'What the balance will be at the end, including all deposits and interest.' },
    { id: 'totalContributions', label: 'Total deposits', format: 'currency', info: 'Your starting deposit plus every monthly contribution — the money you actually put in.' },
    { id: 'totalInterest', label: 'Interest earned', format: 'currency', info: 'Growth from interest alone: the future value minus everything you deposited.' },
    { id: 'effectiveRate', label: 'Effective annual rate (APY)', format: 'percent', precision: 3, info: 'The true yearly growth rate once compounding is included, also called APY.' },
  ],
  compute: (v) => {
    const P = num(v.principal) ?? 0;
    const C = num(v.contribution) ?? 0;
    const rate = num(v.rate);
    const timeS = num(v.time);
    if (rate === null || timeS === null || P < 0 || C < 0 || rate <= -100) return { futureValue: null };
    const n = toMonths(timeS);
    if (n <= 0) return { futureValue: null, error: 'Enter a time of at least one month.' };
    const r = rate / 100;
    const k = v.frequency === 'continuous' ? Infinity : Number(v.frequency) || 12;
    // Growth factor per month, consistent with the chosen compounding frequency.
    const g = k === Infinity ? Math.exp(r / 12) : (1 + r / k) ** (k / 12);
    const effectiveRate = g ** 12 - 1;
    const growth = g ** n;
    const fvPrincipal = P * growth;
    const fvContrib = g === 1 ? C * n : (C * (growth - 1)) / (g - 1);
    const futureValue = fvPrincipal + fvContrib;
    const totalContributions = P + C * n;
    const idx = monthIdx(n);
    const bal = idx.map((m) => P * g ** m + (g === 1 ? C * m : (C * (g ** m - 1)) / (g - 1)));
    return {
      futureValue,
      totalContributions,
      totalInterest: futureValue - totalContributions,
      effectiveRate,
      chart: growthCharts(idx.map(yr), idx.map((m) => P + C * m), bal, 'Deposits', 'Interest'),
      steps: [
        `Effective annual rate = ${pct(effectiveRate, 4)} (${rate}% compounded ${k === Infinity ? 'continuously' : `${k}× a year`})`,
        `Initial deposit grows to ${money(P)} × ${growth.toFixed(6)} = ${money(fvPrincipal)}`,
        C ? `${n} monthly deposits of ${money(C)} grow to ${money(fvContrib)}` : 'No monthly contributions',
        `Future value = ${money(futureValue)}`,
      ],
      note: `Interest makes up ${pct(futureValue > 0 ? (futureValue - totalContributions) / futureValue : 0, 1)} of the final balance.`,
    };
  },
  content: {
    formula: [
      'A = P(1 + r/k)^(k·t)  (lump sum)',
      'With monthly deposits C: A = P·g^n + C·(g^n − 1) ÷ (g − 1)',
      'g = (1 + r/k)^(k/12) is the monthly growth factor, n = months',
      'Continuous compounding: A = P·e^(r·t)',
    ],
    body: [
      'Compound interest means you earn interest on your earlier interest, not just on the money you put in. In the early years the effect is small, but it accelerates: at 7% a year, money roughly doubles every ten years, so the second decade adds twice as much as the first.',
      'Compounding frequency is how often interest is credited. More frequent compounding gives a slightly higher effective annual rate (APY) — 5% compounded monthly is 5.116% a year — but the difference between monthly and daily is tiny. Time and the rate itself matter far more.',
      'Regular contributions are often the biggest driver for savers. This calculator assumes each monthly deposit is made at the end of the month and grows at the same rate as the balance. Real investment returns vary year to year; use a conservative rate for planning.',
    ],
    faq: [
      { q: 'What is the rule of 72?', a: 'Divide 72 by the annual interest rate to estimate how many years it takes to double your money. At 6%, that is about 12 years. It is a quick approximation that works well for rates between about 4% and 12%.' },
      { q: 'What is the difference between APR and APY?', a: 'APR is the nominal yearly rate before compounding. APY includes the effect of compounding within the year, so it is the rate you actually earn. Banks advertise savings with APY because it is the larger number.' },
      { q: 'Does this account for taxes or inflation?', a: 'No. Interest in a regular account is usually taxable each year, and inflation reduces what the final balance can buy. Use the inflation calculator to convert the result into today\'s dollars.' },
    ],
  },
  related: ['investment', 'savings-goal', 'simple-interest', 'cd', 'inflation', 'retirement'],
  examples: [
    { values: { principal: 1000, contribution: null, rate: 5, frequency: '1', time: 10 * YEAR_S }, expect: { futureValue: 1628.894627, totalInterest: 628.894627 } },
    { values: { principal: 0, contribution: 100, rate: 0, frequency: '12', time: 2 * YEAR_S }, expect: { futureValue: 2400, totalInterest: 0 } },
    { values: { principal: 10000, contribution: 100, rate: 7, frequency: '12', time: 10 * YEAR_S }, expect: { futureValue: 37405.0945, effectiveRate: 0.07229008 }, tolerance: 0.00001 },
  ],
});
