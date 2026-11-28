import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'early-retirement-bridge',
  title: 'Early Retirement Bridge Fund Calculator',
  seoTitle: 'Early Retirement Bridge Fund Calculator',
  metaDescription: 'How much to hold outside retirement accounts to cover spending from your retirement age until penalty-free access at 59.5. A simple estimate, no sign-up.',
  updated: '2026-11-28',
  category: 'fire',
  description: 'Estimate the bridge fund needed to cover spending between early retirement and penalty-free retirement account access.',
  keywords: ['early retirement bridge fund', 'bridge to 59.5', 'retire early before 59.5', 'how much to save outside 401k', 'FIRE bridge years', 'taxable account bridge'],
  popular: false,
  inputs: [
    { id: 'retireAge', label: 'Retirement age', type: 'number', default: 45, min: 18, max: 100, step: 0.5, info: 'The age you stop working.' },
    { id: 'accessAge', label: 'Penalty-free access age', type: 'number', default: 59.5, min: 18, max: 100, step: 0.5, info: 'When you can use retirement accounts without an early-withdrawal penalty. 59.5 is the usual US age.' },
    { id: 'spending', label: 'Annual spending', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'What you expect to spend each year during the bridge, in today\'s dollars.' },
    { id: 'realReturn', label: 'Real return', type: 'number', suffix: '%', default: 3, min: 0, max: 15, step: 0.25, info: 'Yearly growth after inflation on the bridge money. 0 is allowed.' },
  ],
  outputs: [
    { id: 'pv', label: 'Bridge fund needed today', format: 'currency', precision: 0, primary: true, info: 'Present value of the yearly withdrawals at your real return.' },
    { id: 'years', label: 'Years of bridge', format: 'number', precision: 1, info: 'Access age minus retirement age.' },
    { id: 'nominal', label: 'Total spending over the bridge', format: 'currency', precision: 0, info: 'Annual spending × years, with no growth.' },
    { id: 'growthHelp', label: 'Saved by investment growth', format: 'currency', precision: 0, info: 'Total spending minus the fund needed.' },
  ],
  compute: (v) => {
    const a = num(v.retireAge);
    const b = num(v.accessAge);
    const s = num(v.spending);
    const rp = num(v.realReturn);
    if (a === null || b === null || s === null || rp === null) return { pv: null };
    if (b <= a) return { pv: null, error: 'Access age must be later than your retirement age.' };
    if (s <= 0) return { pv: null, error: 'Enter annual spending above $0.' };
    if (rp < 0) return { pv: null, error: 'Real return cannot be negative here.' };
    const n = b - a;
    const r = rp / 100;
    const nominal = s * n;
    const pv = r === 0 ? nominal : (s * (1 - Math.pow(1 + r, -n))) / r;
    const growthHelp = nominal - pv;
    return {
      pv,
      years: n,
      nominal,
      growthHelp,
      tone: 'ok',
      badge: `${n.toFixed(1)} years to bridge`,
      chart: {
        type: 'bar',
        title: 'Bridge fund compared with total spending',
        categories: ['Fund needed today', 'Total spending'],
        series: [{ name: 'Bridge', values: [Math.round(pv), Math.round(nominal)] }],
        format: CURRENCY,
        highlight: 0,
      },
      steps: [
        `Years = ${b} − ${a} = ${n}`,
        `Total spending = ${money(s, 0)} × ${n} = ${money(nominal, 0)}`,
        r === 0
          ? 'With a 0% real return the fund equals total spending'
          : `Fund = ${money(s, 0)} × (1 − (1 + ${rp}%)^−${n}) ÷ ${rp}% = ${money(pv, 0)}`,
      ],
      note: 'A simple estimate: end-of-year withdrawals, a constant real return, and no taxes or market swings. Not tax advice.',
    };
  },
  content: {
    formula: [
      'Years of bridge = access age − retirement age',
      'Total spending = annual spending × years',
      'Fund needed today = annual spending × (1 − (1 + r)^−years) ÷ r, where r is the real return (spending × years when r = 0)',
    ],
    body: [
      'If you retire before you can use retirement accounts without a penalty, you need money you can reach to cover the gap. This calculator estimates that bridge: the years between retirement and access, the total you will spend, and the amount to hold today if it earns a real return meanwhile.',
      'Retiring at 45 with access at 59.5 is 14.5 years. At $50,000 a year that is $725,000 of spending. If the bridge money earns 3% above inflation, with withdrawals at the end of each year, about $580,969 covers it.',
    ],
    sections: [
      {
        heading: 'What the estimate assumes',
        paragraphs: [
          'Spending is in today\'s dollars and the return is after inflation, so there is no separate inflation step. Withdrawals happen at the end of each year, and a part-year such as 14.5 is used directly in the formula as an approximation. Taxes, fees, market drops early in the bridge and changes in spending are not modelled.',
        ],
      },
      {
        heading: 'Ways people fund the gap',
        paragraphs: [
          'Common general options include a taxable brokerage account, cash savings, and, in some cases, Roth conversion ladders or substantially equal periodic payments under rule 72(t). Each has its own rules and tax effects. Confirm the details for your situation at irs.gov or with a tax professional before relying on them.',
        ],
      },
    ],
    faq: [
      { q: 'How is the bridge fund calculated?', a: 'Spending × (1 − (1 + r)^−n) ÷ r, where n is access age minus retirement age and r is the real return. For $50,000, 14.5 years and 3%, that is $580,969.' },
      { q: 'What if my real return is 0%?', a: 'The fund equals total spending: annual spending × years. At $40,000 for 9.5 years that is $380,000.' },
      { q: 'Why is the fund smaller than total spending?', a: 'Money you hold earns a return while you spend it down, so you do not need to set aside every dollar today. The gap is shown as "Saved by investment growth".' },
      { q: 'Is this tax advice?', a: 'No. It is a simple estimate that ignores taxes, fees and market swings. Check the rules for your accounts at irs.gov.' },
      { q: 'Why does it use a real return?', a: 'A real return is after inflation, so you can enter spending in today\'s dollars and skip a separate inflation step.' },
    ],
    sources: [],
  },
  related: ['sepp-72t-payment', 'early-withdrawal-penalty', 'fire-number', 'coast-fire'],
  examples: [
    // n = 59.5-45 = 14.5; nominal = 50000*14.5 = 725000; PV = 50000*(1-1.03^-14.5)/0.03 = 580968.78; growth = 144031.22
    { values: { retireAge: 45, accessAge: 59.5, spending: 50000, realReturn: 3 }, expect: { years: 14.5, nominal: 725000, pv: 580968.78 }, tolerance: 0.0001 },
    // n = 9.5; 0% return -> 40000*9.5 = 380000
    { values: { retireAge: 50, accessAge: 59.5, spending: 40000, realReturn: 0 }, expect: { years: 9.5, nominal: 380000, pv: 380000, growthHelp: 0 }, tolerance: 0.0001 },
  ],
});
