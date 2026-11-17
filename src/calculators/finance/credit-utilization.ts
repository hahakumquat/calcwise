import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const CARDS = [1, 2, 3, 4];

export default defineCalculator({
  slug: 'credit-utilization',
  title: 'Credit Utilization Calculator',
  category: 'finance',
  description: 'Add up your credit card balances and limits to see your overall and per-card utilization, and how much to pay down to reach a target such as 30% or 10%.',
  keywords: ['credit utilization calculator', 'credit utilization ratio', 'credit card utilization', 'how much to pay down credit card', 'good credit utilization', '30 percent rule credit'],
  updated: '2026-11-17',
  inputs: [
    ...CARDS.flatMap((n) => [
      { id: `bal${n}`, label: `Card ${n} balance`, type: 'number' as const, prefix: '$', default: n === 1 ? 1500 : n === 2 ? 500 : 0, min: 0, step: 50, info: 'The balance on your statement. Leave at 0 if you do not use this card.' },
      { id: `lim${n}`, label: `Card ${n} credit limit`, type: 'number' as const, prefix: '$', default: n === 1 ? 5000 : n === 2 ? 3000 : 0, min: 0, step: 100, info: 'The credit limit shown on your card account or statement.' },
    ]),
    { id: 'target', label: 'Target utilization', type: 'number', suffix: '%', default: 30, min: 1, max: 100, step: 1, info: 'A rule of thumb, not a scoring rule. Many people aim for under 30%, and lower is generally better.' },
  ],
  outputs: [
    { id: 'util', label: 'Overall utilization', format: 'percent', precision: 1, primary: true, info: 'Total balances ÷ total credit limits.' },
    { id: 'balances', label: 'Total balances', format: 'currency', info: 'The sum of all card balances you entered.' },
    { id: 'limits', label: 'Total credit limits', format: 'currency', info: 'The sum of the limits of all cards that have a limit entered.' },
    { id: 'payDown', label: 'Pay down to reach target', format: 'currency', info: 'Total balances minus target % of total limits. Zero if you are already at or below it.' },
  ],
  compute: (v) => {
    const t = (num(v.target) ?? 30) / 100;
    if (t <= 0 || t > 1) return { util: null, error: 'Target must be between 1% and 100%.' };
    let bal = 0;
    let lim = 0;
    const rows: { n: number; b: number; l: number }[] = [];
    for (const n of CARDS) {
      const b = num(v[`bal${n}`]) ?? 0;
      const l = num(v[`lim${n}`]) ?? 0;
      if (b < 0 || l < 0) return { util: null, error: 'Balances and limits cannot be negative.' };
      if (l === 0 && b === 0) continue;
      if (l === 0) return { util: null, error: `Card ${n} has a balance but no limit. Enter its limit.` };
      rows.push({ n, b, l });
      bal += b;
      lim += l;
    }
    if (lim <= 0) return { util: null };
    const util = bal / lim;
    const payDown = Math.max(0, bal - t * lim);
    const tone = util <= 0.1 ? 'good' : util <= 0.3 ? 'good' : util <= 0.5 ? 'warn' : 'bad';
    const badge = util <= 0.1 ? 'Very low: great' : util <= 0.3 ? 'Under 30%: in a good range' : util <= 0.5 ? 'Getting high: worth paying down' : 'High: likely hurting your score';
    const chart: ChartSpec = {
      type: 'scale',
      title: 'Credit utilization',
      min: 0,
      max: 100,
      value: Math.min(util * 100, 100),
      valueLabel: `${(util * 100).toFixed(1)}%`,
      bands: [
        { from: 0, to: 30, label: 'Under 30%', tone: 'good' },
        { from: 30, to: 50, label: '30–50%', tone: 'warn' },
        { from: 50, to: 100, label: 'Over 50%', tone: 'bad' },
      ],
      format: { format: 'number' },
    };
    return {
      util,
      balances: bal,
      limits: lim,
      payDown,
      tone,
      badge,
      chart,
      note: 'Scoring models differ and treat utilization differently. This shows your ratio, not your credit score. 30% is a common rule of thumb, not an official line.',
      steps: [
        ...rows.map((r) => `Card ${r.n}: ${money(r.b, 2)} ÷ ${money(r.l, 2)} = ${((r.b / r.l) * 100).toFixed(1)}%`),
        `Overall = ${money(bal, 2)} ÷ ${money(lim, 2)} = ${(util * 100).toFixed(1)}%`,
        `Balance allowed at ${(t * 100).toFixed(0)}% = ${money(t * lim, 2)}; pay down ${money(payDown, 2)}`,
      ],
    };
  },
  content: {
    formula: ['Utilization = total card balances ÷ total credit limits', 'Pay down = max(0, total balances − target % × total limits)'],
    body: [
      'Credit utilization is the share of your available credit that you are using. It is one of the factors credit scoring models look at, which is why a card balance can move your score even if you always pay on time.',
      'Add the balance and limit of each card. The calculator shows the overall ratio, the ratio per card in the steps, and how much to pay down to reach your target.',
      'Scoring models differ in how they use utilization, and lenders see the balance your card issuer reports, usually on your statement date. Paying before the statement closes can lower the reported figure.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['A $1,500 balance on a $5,000 card and $500 on a $3,000 card. Total balances are $2,000 and total limits $8,000, so utilization = 2,000 ÷ 8,000 = 25.0%. Card 1 is at 30.0% and card 2 at 16.7%. To reach 10%, the balance allowed is $800, so you would pay down $1,200.'],
      },
      {
        heading: 'Ways to lower it',
        paragraphs: ['Pay balances down before the statement date, spread a balance across cards, or ask for a credit limit increase (check whether it needs a hard inquiry first). Closing an unused card removes its limit and can push the ratio up.'],
      },
    ],
    faq: [
      { q: 'What is a good credit utilization ratio?', a: 'Many guides suggest staying under 30%, and people with the highest scores often use under 10%. These are rules of thumb, not official cutoffs.' },
      { q: 'Does this calculate my credit score?', a: 'No. It only computes the ratio. Your score depends on several factors and the model used.' },
      { q: 'Is utilization calculated per card or overall?', a: 'Scoring models can look at both. This calculator gives the overall ratio and lists each card in the steps.' },
      { q: 'How is the pay-down amount worked out?', a: 'Total balances minus your target percent of total limits. With $2,000 owed on $8,000 of limits and a 10% target, 2,000 − 800 = $1,200.' },
    ],
    sources: [{ label: 'CFPB: What is a credit utilization ratio?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-credit-utilization-rate-en-2041/' }],
  },
  related: ['credit-card-payoff', 'debt-to-income', 'debt-payoff-planner'],
  examples: [
    // 2000/8000 = 0.25; target 30% -> 2400 allowed -> 0.
    { values: { bal1: 1500, lim1: 5000, bal2: 500, lim2: 3000, bal3: 0, lim3: 0, bal4: 0, lim4: 0, target: 30 }, expect: { util: 0.25, balances: 2000, limits: 8000, payDown: 0 } },
    // target 10% -> 800 allowed -> 1200.
    { values: { bal1: 1500, lim1: 5000, bal2: 500, lim2: 3000, bal3: 0, lim3: 0, bal4: 0, lim4: 0, target: 10 }, expect: { util: 0.25, payDown: 1200 } },
  ],
});
