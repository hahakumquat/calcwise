import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut, fvAnnuity, CURRENCY } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'lifestyle-creep',
  title: 'Lifestyle Creep Calculator: Raise Spent or Saved',
  category: 'finance',
  description: 'See how much of a raise you spent versus saved after tax, and what the saved share could grow to over the years if you keep it up.',
  keywords: ['lifestyle creep calculator', 'lifestyle inflation calculator', 'what did my raise buy', 'how much of my raise should I save', 'raise savings calculator'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'pay', label: 'Current yearly pay', type: 'number', prefix: '$', default: 60000, min: 0, step: 500, info: 'Your pay per year before tax, before the raise.' },
    { id: 'raise', label: 'Raise', type: 'number', suffix: '%', default: 8, min: 0, max: 500, step: 0.1, info: 'The percentage increase on your current pay.' },
    { id: 'tax', label: 'Tax rate on the raise (assumption)', type: 'number', suffix: '%', default: 25, min: 0, max: 80, step: 0.5, info: 'An estimate of the effective rate on the extra pay, including payroll taxes. Your own rate may differ.' },
    { id: 'spent', label: 'Share of the after-tax raise you spend', type: 'number', suffix: '%', default: 60, min: 0, max: 100, step: 5, info: 'The rest of the after-tax raise is treated as saved.' },
    { id: 'rate', label: 'Yearly return on what you save (assumption)', type: 'number', suffix: '%', default: 5, min: 0, max: 30, step: 0.5, help: 'An assumption, not a promise.', info: 'Annual return, compounded once a year. Real returns vary and can be negative.' },
    { id: 'years', label: 'Years to project', type: 'number', default: 10, min: 1, max: 50, step: 1, info: 'Saved amount is added at the end of each year.' },
  ],
  outputs: [
    { id: 'future', label: 'Saved share after the projection', format: 'currency', primary: true, info: 'Yearly saved × ((1 + return)^years − 1) ÷ return. With a 0% return, yearly saved × years.' },
    { id: 'gross', label: 'Raise per year (before tax)', format: 'currency', info: 'Pay × raise %.' },
    { id: 'net', label: 'Raise per year (after tax)', format: 'currency', info: 'Gross raise × (1 − tax rate).' },
    { id: 'spentYear', label: 'Spent per year', format: 'currency', info: 'After-tax raise × spend share.' },
    { id: 'savedYear', label: 'Saved per year', format: 'currency', info: 'After-tax raise − spent.' },
    { id: 'savedMonth', label: 'Saved per month', format: 'currency', info: 'Saved per year ÷ 12.' },
  ],
  compute: (v) => {
    const pay = num(v.pay);
    const raise = num(v.raise);
    const tax = num(v.tax);
    const spent = num(v.spent);
    const rate = num(v.rate);
    const years = num(v.years);
    if (pay === null || raise === null || tax === null || spent === null || rate === null || years === null) return { future: null };
    if (pay < 0 || raise < 0 || tax < 0 || tax >= 100 || spent < 0 || spent > 100 || rate < 0 || years < 1) return { future: null };

    const n = Math.round(years);
    const gross = pay * (raise / 100);
    const net = gross * (1 - tax / 100);
    const spentYear = net * (spent / 100);
    const savedYear = net - spentYear;
    const future = fvAnnuity(savedYear, rate / 100, n);
    const contributed = savedYear * n;
    const growth = future - contributed;

    const x = Array.from({ length: n + 1 }, (_, k) => k);
    return {
      future,
      gross,
      net,
      spentYear,
      savedYear,
      savedMonth: savedYear / 12,
      tone: 'good',
      badge: `${money(savedYear, 0)} a year saved`,
      chart: [
        moneyDonut('Where the after-tax raise goes', [
          { label: 'Spent', value: spentYear },
          { label: 'Saved', value: savedYear },
        ].filter((s) => s.value > 0), money(net, 0), 'a year after tax'),
        {
          type: 'line',
          title: 'Growth of the saved share',
          x,
          xLabel: 'Years',
          xFormat: { format: 'integer' },
          yFormat: CURRENCY,
          series: [
            { name: 'With growth', values: x.map((k) => fvAnnuity(savedYear, rate / 100, k)) },
            { name: 'Contributions only', values: x.map((k) => savedYear * k) },
          ],
        },
      ],
      steps: [
        `Raise before tax = ${money(pay, 2)} × ${raise}% = ${money(gross, 2)}`,
        `Raise after tax = ${money(gross, 2)} × (1 − ${tax}%) = ${money(net, 2)}`,
        `Spent = ${money(net, 2)} × ${spent}% = ${money(spentYear, 2)}`,
        `Saved = ${money(net, 2)} − ${money(spentYear, 2)} = ${money(savedYear, 2)} a year (${money(savedYear / 12, 2)} a month)`,
        rate === 0
          ? `After ${n} years = ${money(savedYear, 2)} × ${n} = ${money(future, 2)}`
          : `After ${n} years = ${money(savedYear, 2)} × ((1 + ${rate}%)^${n} − 1) ÷ ${rate}% = ${money(future, 2)}`,
      ],
      note: `Of a ${money(net, 0)} after-tax raise, ${money(spentYear, 0)} a year goes to spending and ${money(savedYear, 0)} is saved. Saved at the end of each year for ${n} years, with an assumed ${rate}% return, that is about ${money(future, 0)} (${money(contributed, 0)} put in, ${money(growth, 0)} growth). The return is an assumption, not a forecast.`,
    };
  },
  content: {
    formula: [
      'Raise before tax = pay × raise %',
      'Raise after tax = raise before tax × (1 − tax rate)',
      'Spent = after-tax raise × spend share; saved = the rest',
      'Saved total = yearly saved × ((1 + return)^years − 1) ÷ return (yearly saved × years if return is 0)',
    ],
    body: [
      'Lifestyle creep is what happens when spending quietly rises to match a raise. Nothing about it is a failing: a better apartment, nicer food and a few subscriptions are all easy to get used to. This calculator just shows what the raise looked like after tax, how much of it went to spending, and what the rest could become if you kept saving it.',
      'Enter your pay, the raise, an estimated tax rate on the extra pay, and how much of the after-tax raise you spend. The calculator adds the saved part at the end of each year and grows it at the return you choose. The tax rate and the return are assumptions you can change, not predictions.',
      'A raise is taxed at your top rate plus payroll tax, so the take-home gain is smaller than the headline number. A 25% default is a common rough guess, not your actual rate.',
      'Everything runs in your browser and nothing is stored. This is a planning tool, not financial advice.',
    ],
    faq: [
      { q: 'What does an 8% raise on $60,000 look like?', a: '$60,000 × 8% = $4,800 before tax. At a 25% tax rate you keep $3,600 a year. If you spend 60% of that ($2,160), you save $1,440 a year, or $120 a month.' },
      { q: 'What could $1,440 a year grow to in 10 years?', a: 'Adding $1,440 at the end of each year at an assumed 5% return gives about $18,112 after 10 years, of which $14,400 is what you put in. Actual returns will differ.' },
      { q: 'What if I assume no return?', a: 'Set the return to 0. The saved total is then just the yearly amount times the number of years, for example $1,440 × 10 = $14,400.' },
      { q: 'Is the tax rate on a raise my overall tax rate?', a: 'Usually not. Extra pay is taxed at your highest rate plus payroll taxes, so it is often higher than your overall average. Use your own estimate.' },
    ],
    sources: [],
  },
  related: ['raise-calculator', 'take-home-pay', 'savings-goal', 'latte-factor', 'compound-interest'],
  examples: [
    {
      // 60,000 × 8% = 4,800; × 0.75 = 3,600; spent 3,600 × 0.6 = 2,160; saved 1,440; /12 = 120.
      // FV = 1,440 × (1.05^10 − 1) / 0.05 = 1,440 × 12.577893 = 18,112.09.
      values: { pay: 60000, raise: 8, tax: 25, spent: 60, rate: 5, years: 10 },
      expect: { gross: 4800, net: 3600, spentYear: 2160, savedYear: 1440, savedMonth: 120, future: 18112.09 },
      tolerance: 0.01,
    },
    {
      // 50,000 × 10% = 5,000; × 0.8 = 4,000; spent 50% = 2,000; saved 2,000; 0% return: 2,000 × 5 = 10,000.
      values: { pay: 50000, raise: 10, tax: 20, spent: 50, rate: 0, years: 5 },
      expect: { gross: 5000, net: 4000, spentYear: 2000, savedYear: 2000, savedMonth: 2000 / 12, future: 10000 },
      tolerance: 0.01,
    },
  ],
});
