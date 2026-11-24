import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'property-tax-appeal',
  title: 'Property Tax Appeal Calculator',
  category: 'finance',
  description: 'See what a lower assessed value would save you on property tax each year, and whether an appeal is worth the fee after your chance of winning.',
  keywords: ['property tax appeal calculator', 'is appealing property taxes worth it', 'lower property assessment savings', 'property tax reduction calculator', 'assessment appeal savings'],
  updated: '2026-11-24',
  inputs: [
    { id: 'assessed', label: 'Current assessed value', type: 'number', prefix: '$', default: 400000, min: 0, step: 1000, info: 'The value on your assessment notice.' },
    { id: 'evidence', label: 'Your evidence of market value', type: 'number', prefix: '$', default: 370000, min: 0, step: 1000, info: 'Recent comparable sales or an appraisal.' },
    { id: 'ratio', label: 'Assessment ratio', type: 'number', suffix: '%', default: 100, min: 1, max: 100, step: 1, info: 'Some counties assess only a fraction of market value. Use 100 if yours assesses the full value.' },
    { id: 'rate', label: 'Property tax rate', type: 'number', suffix: '%', default: 1.8, min: 0, max: 10, step: 0.01, info: 'Tax per $100 of assessed value. A rate of 18 mills is 1.8%.' },
    { id: 'cost', label: 'Appeal cost', type: 'number', prefix: '$', default: 150, min: 0, step: 10, optional: true, info: 'Filing fee, appraisal or anyone you hire.' },
    { id: 'years', label: 'Years the new value applies', type: 'number', suffix: 'years', default: 3, min: 1, max: 20, step: 1, info: 'How long a lower assessment stays in place in your county.' },
    { id: 'chance', label: 'Chance of success', type: 'number', suffix: '%', default: 100, min: 0, max: 100, step: 5, optional: true, info: 'Your own guess. 100 shows the best case.' },
  ],
  outputs: [
    { id: 'expected', label: 'Expected net gain', format: 'currency', primary: true, info: 'Savings over the years × chance of success − appeal cost.' },
    { id: 'reduction', label: 'Value reduction if you win', format: 'currency', info: 'Assessed value − (evidence × ratio). Zero if your evidence is not lower.' },
    { id: 'saving', label: 'Tax saved a year if you win', format: 'currency', info: 'Reduction × tax rate.' },
    { id: 'net', label: 'Net gain if you win', format: 'currency', info: 'Yearly saving × years − appeal cost.' },
  ],
  compute: (v) => {
    const assessed = num(v.assessed);
    const evidence = num(v.evidence);
    const ratio = num(v.ratio);
    const rate = num(v.rate);
    const cost = v.cost === undefined || v.cost === '' ? 0 : num(v.cost);
    const years = num(v.years);
    const chance = v.chance === undefined || v.chance === '' ? 100 : num(v.chance);
    if (assessed === null || evidence === null || ratio === null || rate === null || cost === null || years === null || chance === null) return { expected: null };
    if (assessed < 0 || evidence < 0 || cost < 0 || rate < 0) return { expected: null, error: 'Values cannot be negative.' };
    if (ratio <= 0 || ratio > 100) return { expected: null, error: 'The assessment ratio must be between 0 and 100.' };
    if (years < 1) return { expected: null, error: 'Years must be at least 1.' };
    if (chance < 0 || chance > 100) return { expected: null, error: 'Chance of success must be between 0 and 100.' };
    const target = evidence * ratio / 100;
    const reduction = Math.max(0, assessed - target);
    const saving = reduction * rate / 100;
    const total = saving * years;
    const net = total - cost;
    const expected = total * chance / 100 - cost;
    const worth = expected > 0;
    return {
      expected, reduction, saving, net,
      tone: worth ? 'good' : 'warn',
      badge: reduction === 0
        ? 'Your evidence does not show an over-assessment'
        : worth ? `Worth appealing: ${usd(expected)} expected` : `Not worth it: ${usd(expected)} expected`,
      chart: {
        type: 'bar',
        title: 'Net gain of an appeal',
        categories: ['If you win', 'Expected'],
        series: [{ name: 'Net gain', values: [net, expected] }],
        format: { format: 'currency' },
      },
      steps: [
        `Target assessed value: ${usd(evidence)} × ${ratio}% = ${usd(target)}`,
        `Reduction: ${usd(assessed)} − ${usd(target)} = ${usd(reduction)}`,
        `Saved a year: ${usd(reduction)} × ${rate}% = ${usd(saving)}`,
        `If you win: ${usd(saving)} × ${years} − ${usd(cost)} = ${usd(net)}`,
        `Expected: ${usd(total)} × ${chance}% − ${usd(cost)} = ${usd(expected)}`,
      ],
      note: 'Deadlines, forms and how long a lowered value lasts differ by county. The tax rate can rise after reassessments, which shrinks the saving. This is a planning estimate, not legal advice.',
    };
  },
  content: {
    formula: [
      'Target value = your evidence × assessment ratio',
      'Reduction = max(0, assessed value − target value)',
      'Tax saved a year = reduction × tax rate',
      'Net gain = tax saved a year × years − appeal cost',
      'Expected net gain = tax saved a year × years × chance of success − appeal cost',
    ],
    body: [
      'Assessments can be higher than what your home would sell for. If recent comparable sales point to a lower value, an appeal may cut your tax bill for several years.',
      'Enter the assessed value from your notice, your evidence of market value and your local tax rate. Counties that assess only a fraction of market value need the assessment ratio filled in; otherwise leave it at 100.',
      'The expected net gain weights the saving by your chance of success, then subtracts the appeal cost. If it is negative, the appeal costs more than it is likely to return.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A $400,000 assessment against $370,000 of evidence at a 1.8% rate is a $30,000 reduction and $540 saved a year. Over 3 years, minus a $150 fee, the net gain is $1,470. At a 50% chance the expected net gain is $660.' },
      { q: 'How do I turn mills into a percent?', a: 'Divide mills by 10. A rate of 18 mills is 1.8%.' },
      { q: 'What evidence works?', a: 'Recent sales of similar homes nearby, or a recent appraisal. Check your county for the exact rules and deadline.' },
      { q: 'Could my tax go up?', a: 'The rate can change when values are reassessed. This calculator holds the rate fixed, so treat the result as an estimate.' },
    ],
    sources: [],
  },
  related: ['mortgage', 'rent-vs-buy', 'mortgage-interest-year'],
  examples: [
    // reduction 30000; saving 540; net 540*3-150=1470; expected 0.5*1620-150=660
    { values: { assessed: 400000, evidence: 370000, ratio: 100, rate: 1.8, cost: 150, years: 3, chance: 50 }, expect: { reduction: 30000, saving: 540, net: 1470, expected: 660 }, tolerance: 0.01 },
    // ratio 50%: target 300000*0.5=150000; assessed 180000 -> reduction 30000; 30000*1%=300; net 600-100=500
    { values: { assessed: 180000, evidence: 300000, ratio: 50, rate: 1, cost: 100, years: 2, chance: 100 }, expect: { reduction: 30000, saving: 300, net: 500, expected: 500 }, tolerance: 0.01 },
  ],
});
