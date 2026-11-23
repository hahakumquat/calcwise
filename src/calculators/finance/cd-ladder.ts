import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, pct } from '../../lib/helpers/finance';

const MAX_RUNGS = 6;

export default defineCalculator({
  slug: 'cd-ladder',
  title: 'CD Ladder Calculator',
  category: 'finance',
  description: 'Split your savings into equal CD rungs with different terms and rates, and see total interest, final value and blended APY.',
  keywords: ['CD ladder', 'CD ladder calculator', 'certificate of deposit ladder', 'laddering CDs', 'blended APY'],
  inputs: [
    { id: 'total', label: 'Total to ladder', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The whole sum you want to spread across the CDs. It is split into equal rungs.' },
    {
      id: 'rungs',
      label: 'Number of rungs',
      type: 'select',
      segmented: true,
      default: '5',
      info: 'How many CDs to open. Each rung gets an equal share of the total.',
      options: [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) })),
    },
    { id: 't1', label: 'Rung 1 term', type: 'number', suffix: 'months', default: 6, min: 1, max: 120, step: 1, info: 'Months until rung 1 matures.' },
    { id: 'r1', label: 'Rung 1 APY', type: 'number', suffix: '%', default: 4.0, min: 0, max: 20, step: 0.05, info: 'The APY your bank quotes for this term.' },
    { id: 't2', label: 'Rung 2 term', type: 'number', suffix: 'months', default: 12, min: 1, max: 120, step: 1, info: 'Months until rung 2 matures.' },
    { id: 'r2', label: 'Rung 2 APY', type: 'number', suffix: '%', default: 4.1, min: 0, max: 20, step: 0.05, info: 'The APY your bank quotes for this term.' },
    { id: 't3', label: 'Rung 3 term', type: 'number', suffix: 'months', default: 18, min: 1, max: 120, step: 1, info: 'Months until rung 3 matures.', showWhen: { input: 'rungs', is: ['3', '4', '5', '6'] } },
    { id: 'r3', label: 'Rung 3 APY', type: 'number', suffix: '%', default: 4.15, min: 0, max: 20, step: 0.05, info: 'The APY your bank quotes for this term.', showWhen: { input: 'rungs', is: ['3', '4', '5', '6'] } },
    { id: 't4', label: 'Rung 4 term', type: 'number', suffix: 'months', default: 24, min: 1, max: 120, step: 1, info: 'Months until rung 4 matures.', showWhen: { input: 'rungs', is: ['4', '5', '6'] } },
    { id: 'r4', label: 'Rung 4 APY', type: 'number', suffix: '%', default: 4.2, min: 0, max: 20, step: 0.05, info: 'The APY your bank quotes for this term.', showWhen: { input: 'rungs', is: ['4', '5', '6'] } },
    { id: 't5', label: 'Rung 5 term', type: 'number', suffix: 'months', default: 30, min: 1, max: 120, step: 1, info: 'Months until rung 5 matures.', showWhen: { input: 'rungs', is: ['5', '6'] } },
    { id: 'r5', label: 'Rung 5 APY', type: 'number', suffix: '%', default: 4.25, min: 0, max: 20, step: 0.05, info: 'The APY your bank quotes for this term.', showWhen: { input: 'rungs', is: ['5', '6'] } },
    { id: 't6', label: 'Rung 6 term', type: 'number', suffix: 'months', default: 36, min: 1, max: 120, step: 1, info: 'Months until rung 6 matures.', showWhen: { input: 'rungs', is: ['6'] } },
    { id: 'r6', label: 'Rung 6 APY', type: 'number', suffix: '%', default: 4.3, min: 0, max: 20, step: 0.05, info: 'The APY your bank quotes for this term.', showWhen: { input: 'rungs', is: ['6'] } },
  ],
  outputs: [
    { id: 'total_value', label: 'Total value at final maturity', format: 'currency', primary: true, info: 'The sum of every rung held to its own maturity. Money from earlier rungs is not reinvested.' },
    { id: 'interest', label: 'Total interest', format: 'currency', info: 'Interest earned across all rungs, from opening to each rung\'s maturity.' },
    { id: 'blended_apy', label: 'Blended APY', format: 'percent', precision: 3, info: 'The average of the rung APYs, weighted by amount. With equal rungs it is a simple average.' },
    { id: 'first_maturity', label: 'First rung matures in', format: 'integer', suffix: 'months', info: 'How soon the shortest rung frees up cash.' },
  ],
  compute: (v) => {
    const total = num(v.total);
    const n = Math.round(Number(v.rungs));
    if (total === null || total < 0 || !(n >= 2 && n <= MAX_RUNGS)) return { total_value: null };
    const per = total / n;
    const rows: { term: number; apy: number; value: number }[] = [];
    for (let k = 1; k <= n; k++) {
      const term = num(v['t' + k]);
      const apy = num(v['r' + k]);
      if (term === null || apy === null || term <= 0 || apy < 0) return { total_value: null };
      rows.push({ term, apy: apy / 100, value: per * (1 + apy / 100) ** (term / 12) });
    }
    const totalValue = rows.reduce((s, r) => s + r.value, 0);
    const interest = totalValue - total;
    const blended = rows.reduce((s, r) => s + r.apy, 0) / n;
    const first = Math.min(...rows.map((r) => r.term));
    return {
      total_value: totalValue,
      interest,
      blended_apy: blended,
      first_maturity: first,
      tone: 'good',
      badge: `${n} rungs`,
      chart: {
        type: 'bar',
        title: 'Interest earned per rung',
        categories: rows.map((r, i) => `Rung ${i + 1} (${r.term} mo)`),
        series: [{ name: 'Interest', values: rows.map((r) => r.value - per) }],
        format: CURRENCY,
      },
      steps: [
        `Each rung = ${money(total)} ÷ ${n} = ${money(per)}`,
        ...rows.map((r, i) => `Rung ${i + 1}: ${money(per)} × (1 + ${pct(r.apy, 3)})^(${r.term} ÷ 12) = ${money(r.value)}`),
        `Total = ${money(totalValue)}, interest = ${money(interest)}`,
      ],
      note: `Each rung is held to its own maturity and not reinvested. Bank rates vary, and early-withdrawal penalties are not modelled.`,
    };
  },
  content: {
    formula: ['Rung value = (total ÷ rungs) × (1 + APY)^(term in months ÷ 12)', 'Blended APY = average of the rung APYs, weighted by amount'],
    body: [
      'A CD ladder splits a lump sum across several certificates of deposit with different terms, for example 6, 12, 18, 24 and 30 months. Every so often one rung matures, giving you access to cash or the chance to reopen it at the then-current rate, instead of locking everything up for one long term.',
      'This calculator divides your total into equal rungs and grows each at its own APY for its own term. The headline figure adds up every rung at its own maturity date. It does not assume that matured money is reinvested, so it is a floor, not a forecast: reopening a rung at a new rate would change the outcome.',
      'Rates are inputs you enter, taken from your bank. They vary by bank and over time, and longer terms do not always pay more. Early-withdrawal penalties, which usually cost several months of interest, are not modelled. Interest is generally taxable in the year it is credited.',
    ],
    faq: [
      { q: 'What is a CD ladder?', a: 'It is a set of CDs with staggered maturity dates. As each one matures you can spend the cash or reopen it, which keeps some money available at regular intervals.' },
      { q: 'How is the blended APY calculated?', a: 'It is the average of the rung APYs weighted by the amount in each. Because the rungs here are equal, it is a simple average.' },
      { q: 'Does the result include reinvesting matured CDs?', a: 'No. Each rung is held to its own maturity and the money is not reinvested, so the total value is the sum of each rung at maturity.' },
      { q: 'Are early-withdrawal penalties included?', a: 'No. Breaking a CD early usually costs several months of interest, which can reduce your return below what is shown.' },
    ],
    sources: [
      { label: 'Investor.gov: Certificates of deposit', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/certificates-deposit-cds' },
      { label: 'FDIC: Deposit insurance', url: 'https://www.fdic.gov/resources/deposit-insurance/' },
    ],
  },
  related: ['cd', 'apy-calculator', 'compound-interest', 'savings-goal', 'inflation'],
  examples: [
    // 2 rungs of $5,000: 5000 x 1.04 = 5200; 5000 x 1.05^2 = 5512.50. Total 10712.50, interest 712.50, blended APY (4+5)/2 = 4.5%, first maturity 12.
    { values: { total: 10000, rungs: '2', t1: 12, r1: 4, t2: 24, r2: 5, t3: null, r3: null, t4: null, r4: null, t5: null, r5: null, t6: null, r6: null }, expect: { total_value: 10712.5, interest: 712.5, blended_apy: 0.045, first_maturity: 12 } },
    // 5 rungs of $2,000 at 5%, terms 12..60 months: 2000 x (1.05 + 1.1025 + 1.157625 + 1.21550625 + 1.2762815625) = 2000 x 5.8019128125 = 11603.825625
    { values: { total: 10000, rungs: '5', t1: 12, r1: 5, t2: 24, r2: 5, t3: 36, r3: 5, t4: 48, r4: 5, t5: 60, r5: 5, t6: null, r6: null }, expect: { total_value: 11603.825625, interest: 1603.825625, blended_apy: 0.05, first_maturity: 12 } },
  ],
});
