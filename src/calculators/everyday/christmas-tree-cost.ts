import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'christmas-tree-cost',
  title: 'Real vs Artificial Christmas Tree Cost',
  category: 'everyday',
  description: 'Compare a real Christmas tree bought every year with an artificial one you keep. See the cost per year and the year the artificial tree pays off.',
  keywords: ['real vs artificial christmas tree cost', 'is an artificial tree cheaper', 'christmas tree cost per year', 'fake tree break even', 'christmas tree budget', 'how many years artificial tree'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'real', label: 'Real tree price', type: 'number', prefix: '$', default: 80, min: 0, step: 5, info: 'What you pay for a real tree each year.' },
    { id: 'extras', label: 'Yearly extras for a real tree', type: 'number', prefix: '$', default: 0, min: 0, step: 5, optional: true, info: 'Delivery, a tree bag, disposal or a new stand each year. Leave at 0 if none.' },
    { id: 'artificial', label: 'Artificial tree price', type: 'number', prefix: '$', default: 150, min: 0, step: 10, info: 'The one-time price of the artificial tree.' },
    { id: 'years', label: 'Years you will use the artificial tree', type: 'number', default: 8, min: 1, max: 30, step: 1, info: 'How many Christmases you expect to get from it. Your own estimate.' },
  ],
  outputs: [
    { id: 'artPerYear', label: 'Artificial, per year', format: 'currency', primary: true, info: 'Artificial price ÷ years of use.' },
    { id: 'realPerYear', label: 'Real, per year', format: 'currency', info: 'Real tree price plus yearly extras.' },
    { id: 'breakEven', label: 'Pays off in year', format: 'integer', info: 'The first year when the artificial tree has cost less in total than buying real: artificial price ÷ real yearly cost, rounded up.' },
    { id: 'saving', label: 'Saved over the period', format: 'currency', info: 'Real total minus artificial total over your chosen years. Negative means the real tree costs less.' },
  ],
  compute: (v) => {
    const real = num(v.real);
    const extras = num(v.extras) ?? 0;
    const art = num(v.artificial);
    const years = num(v.years);
    if (real === null || art === null || years === null || real < 0 || extras < 0 || art < 0 || years < 1) return { artPerYear: null };
    const n = Math.round(years);
    const realYear = real + extras;
    if (realYear <= 0) return { artPerYear: null, error: 'Enter a real tree price above zero to compare.' };
    const artYear = art / n;
    const breakEven = Math.max(1, Math.ceil(art / realYear - 1e-9));
    const realTotal = realYear * n;
    const saving = realTotal - art;
    const xs: number[] = [];
    const realLine: number[] = [];
    const artLine: number[] = [];
    for (let y = 0; y <= n; y++) {
      xs.push(y);
      realLine.push(realYear * y);
      artLine.push(art);
    }
    const within = breakEven <= n;
    return {
      artPerYear: artYear,
      realPerYear: realYear,
      breakEven,
      saving,
      tone: saving >= 0 ? 'good' : 'warn',
      badge: within ? `Pays off in year ${breakEven}` : `Real is cheaper over ${n} years`,
      note: within
        ? `The artificial tree costs ${money(art)} once, or ${money(artYear)} a year over ${n} years, against ${money(realYear)} a year for a real one. It has cost less in total from year ${breakEven}, and over ${n} years you would spend ${money(realTotal)} on real trees against ${money(art)}.`
        : `Over ${n} years real trees cost ${money(realTotal)} against ${money(art)} for the artificial tree, so the artificial one would need more than ${n} years to pay off (year ${breakEven}). Prices and lifespan are your own inputs; storage space and personal taste are not counted.`,
      chart: {
        type: 'line',
        title: 'Total spent so far',
        x: xs,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Real tree each year', values: realLine },
          { name: 'Artificial tree', values: artLine },
        ],
      },
      steps: [
        `Real per year = ${money(real)} + ${money(extras)} = ${money(realYear)}`,
        `Artificial per year = ${money(art)} ÷ ${n} = ${money(artYear)}`,
        `Pays off in year = ⌈${money(art)} ÷ ${money(realYear)}⌉ = ${breakEven}`,
        `Saved over ${n} years = ${money(realTotal)} − ${money(art)} = ${money(saving)}`,
      ],
    };
  },
  content: {
    formula: [
      'Real per year = real price + yearly extras',
      'Artificial per year = artificial price ÷ years of use',
      'Pays off in year = ⌈artificial price ÷ real yearly cost⌉',
      'Saved = real yearly cost × years − artificial price',
    ],
    body: [
      'A real tree is a small cost every year. An artificial tree is one bigger cost that you spread over every Christmas you use it. This calculator lines the two up so you can see the per-year price and the year the artificial tree has paid for itself.',
      'The break-even year is the artificial price divided by what you spend on a real tree each year, rounded up to a whole Christmas. After that year, the artificial tree has cost less in total.',
      'The numbers are only as good as your inputs: the price you actually pay and how many years you will realistically keep the artificial tree. Storage space, setting it up and how much you like the smell of a real tree are not counted. The calculator makes no claims about the environment or safety. Everything runs in your browser.',
    ],
    faq: [
      { q: 'Is an artificial Christmas tree cheaper than a real one?', a: 'It depends on the prices and how long you keep it. A $150 artificial tree against an $80 real tree has paid off by year 2, because 150 ÷ 80 = 1.875, rounded up to 2.' },
      { q: 'How is the cost per year worked out?', a: 'The artificial price divided by the years you use it. $150 over 8 years is $18.75 a year, against $80 a year for a real tree.' },
      { q: 'How much do I save over 10 years?', a: 'With an $80 real tree and a $150 artificial one, real trees cost $800 over 10 years against $150, a saving of $650.' },
      { q: 'What are yearly extras?', a: 'Costs that come with a real tree each year, such as delivery, a tree bag or disposal. They are added to the real tree price.' },
      { q: 'Does this count storage or the environment?', a: 'No. It only compares money, using the prices and lifespan you enter.' },
    ],
    sources: [],
  },
  related: ['holiday-lights', 'wrapping-paper', 'holiday-spending-total', 'gift-budget', 'holiday-tipping-budget'],
  examples: [
    // Real 80, artificial 150, 8 yr: 150/8 = 18.75; 150/80 = 1.875 → year 2; real total 640; saved 490.
    { values: { real: 80, extras: 0, artificial: 150, years: 8 }, expect: { artPerYear: 18.75, realPerYear: 80, breakEven: 2, saving: 490 }, tolerance: 1e-6 },
    // Real 100 + 20 extras = 120/yr; artificial 300, 10 yr: 30/yr; 300/120 = 2.5 → year 3; saved 1,200 − 300 = 900.
    { values: { real: 100, extras: 20, artificial: 300, years: 10 }, expect: { artPerYear: 30, realPerYear: 120, breakEven: 3, saving: 900 }, tolerance: 1e-6 },
    // Real 40, artificial 500, 5 yr: 500/40 = 12.5 → year 13; saved 200 − 500 = −300.
    { values: { real: 40, extras: 0, artificial: 500, years: 5 }, expect: { artPerYear: 100, realPerYear: 40, breakEven: 13, saving: -300 }, tolerance: 1e-6 },
  ],
});
