import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'unemployment-benefit-runway',
  title: 'Unemployment Benefit Runway Calculator',
  category: 'finance',
  description: 'See how many months unemployment benefits plus your savings can cover your expenses, using your own weekly benefit, tax withholding and benefit weeks.',
  keywords: ['unemployment benefit runway', 'how long will unemployment and savings last', 'laid off budget calculator', 'unemployment benefits monthly income', 'savings after layoff'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'weekly', label: 'Weekly benefit (before tax)', type: 'number', prefix: '$', default: 450, min: 0, step: 10, info: 'The weekly amount on your claim. Your state sets it, so enter your own figure.' },
    { id: 'tax', label: 'Share withheld for tax', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'Percent withheld from each payment. Use 0 if nothing is withheld.' },
    { id: 'weeks', label: 'Weeks of benefits', type: 'number', default: 26, min: 0, step: 1, info: 'How many weeks you can be paid. Your state and claim decide this.' },
    { id: 'savings', label: 'Savings you can spend', type: 'number', prefix: '$', default: 4000, min: 0, step: 100, info: 'Cash and easy-to-reach savings only.' },
    { id: 'expenses', label: 'Monthly expenses', type: 'number', prefix: '$', default: 2800, min: 0, step: 50, info: 'Rent, food, bills, insurance and debt payments in a normal month.' },
  ],
  outputs: [
    { id: 'runway', label: 'Months you can cover expenses', format: 'number', precision: 2, suffix: 'months', primary: true, info: 'Benefit months plus savings left over, or the month savings run out during benefits.' },
    { id: 'net', label: 'Net benefit per month', format: 'currency', precision: 2, info: 'Weekly benefit × (1 − tax) × 52 ÷ 12.' },
    { id: 'gap', label: 'Monthly gap while on benefits', format: 'currency', precision: 2, info: 'Expenses minus net benefit. Negative means benefits cover everything.' },
  ],
  compute: (v) => {
    const weekly = num(v.weekly);
    const tax = num(v.tax);
    const weeks = num(v.weeks);
    const savings = num(v.savings);
    const exp = num(v.expenses);
    if (weekly === null || tax === null || weeks === null || savings === null || exp === null) return { runway: null };
    if (weekly < 0 || tax < 0 || tax > 100 || weeks < 0 || savings < 0 || exp <= 0) return { runway: null };
    const net = (weekly * (1 - tax / 100) * 52) / 12;
    const gap = exp - net;
    const bm = (weeks * 12) / 52;
    const g = Math.max(gap, 0); // any surplus is not added to savings
    let runway: number;
    let leftover: number;
    if (g * bm > savings) {
      runway = savings / g;
      leftover = 0;
    } else {
      leftover = savings - g * bm;
      runway = bm + leftover / exp;
    }
    const bal = (t: number) => Math.max(t <= bm ? savings - g * t : savings - g * bm - exp * (t - bm), 0);
    const last = Math.min(Math.ceil(runway) + 1, 120);
    const xs: number[] = [];
    const ys: number[] = [];
    for (let m = 0; m <= last; m++) {
      xs.push(m);
      ys.push(bal(m));
    }
    const outDuring = g * bm > savings;
    return {
      runway,
      net,
      gap,
      tone: runway >= 6 ? 'good' : runway >= 3 ? 'ok' : 'warn',
      badge: `${fmt(runway, 1)} months of cover`,
      note: outDuring
        ? `Benefits pay ${money(net)} a month against ${money(exp)} of expenses, so ${money(g)} a month comes from savings. ${money(savings)} runs out in month ${fmt(runway, 2)}, before the ${fmt(bm, 2)} benefit months end.`
        : `Benefits last ${fmt(bm, 2)} months and use ${money(g * bm)} of savings. The remaining ${money(leftover)} covers ${fmt(leftover / exp, 2)} more months at ${money(exp)} a month, for ${fmt(runway, 2)} months in total. A new job's pay is not included.`,
      chart: {
        type: 'line' as const,
        title: 'Savings balance, month by month',
        x: xs,
        xLabel: 'Months from now',
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Savings', values: ys }],
      },
      steps: [
        `Net benefit = ${money(weekly)} × (1 − ${fmt(tax)}%) × 52 ÷ 12 = ${money(net)} a month`,
        `Gap = ${money(exp)} − ${money(net)} = ${money(gap)} a month; benefit months = ${fmt(weeks)} × 12 ÷ 52 = ${fmt(bm, 2)}`,
        outDuring
          ? `Savings needed during benefits = ${money(g)} × ${fmt(bm, 2)} = ${money(g * bm)}, more than ${money(savings)}, so savings last ${money(savings)} ÷ ${money(g)} = ${fmt(runway, 2)} months`
          : `Left after benefits = ${money(savings)} − ${money(g * bm)} = ${money(leftover)}; runway = ${fmt(bm, 2)} + ${money(leftover)} ÷ ${money(exp)} = ${fmt(runway, 2)} months`,
      ],
    };
  },
  content: {
    formula: [
      'Net monthly benefit = weekly benefit × (1 − tax share) × 52 ÷ 12',
      'Gap = monthly expenses − net monthly benefit; benefit months = weeks × 12 ÷ 52',
      'If gap × benefit months is more than savings: runway = savings ÷ gap',
      'Otherwise: runway = benefit months + (savings − gap × benefit months) ÷ expenses',
    ],
    body: [
      'Unemployment benefits rarely match a paycheck, so the useful question is how long benefits and savings together can carry your normal expenses. This calculator turns your weekly benefit into a monthly figure, finds the gap against your expenses and uses savings to fill it.',
      'Example: a $450 weekly benefit with 10% withheld is $1,755 a month. Against $2,800 of expenses the gap is $1,045 a month. Over 26 weeks (6 months) that would take $6,270, so $4,000 of savings runs out in month 3.83. With a $600 benefit, 15% withheld, $8,000 saved and $2,500 of expenses, the net is $2,210, the gap is $290 and 6 months use $1,740, leaving $6,260 that covers 2.50 more months: 8.50 in total.',
      'Benefit amounts, how long they last and who qualifies are set by each state, so no state formula is built in: enter the figures from your claim. If benefits are more than your expenses, the surplus is not added to savings. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How long will unemployment and savings last?', a: 'With a $450 weekly benefit, 10% withheld, 26 weeks, $4,000 saved and $2,800 of expenses, savings run out in month 3.83. Change the inputs to see your own figure.' },
      { q: 'How is the monthly benefit worked out?', a: 'Weekly benefit × (1 − tax share) × 52 ÷ 12. A $450 benefit with 10% withheld becomes $1,755 a month.' },
      { q: 'What happens after benefits end?', a: 'Whatever savings are left are spent at your full monthly expenses. In the second example, $6,260 left covers 2.50 more months at $2,500.' },
      { q: 'Does this know my state\'s rules?', a: 'No. Your state sets the weekly amount, the number of weeks and eligibility. Enter the numbers from your claim.' },
      { q: 'Is new income included?', a: 'No. A new job, severance or other income is not counted. Try the savings runway calculator if you have income still coming in.' },
    ],
    sources: [],
  },
  related: ['savings-runway', 'severance-pay', 'emergency-fund'],
  examples: [
    // net 450*.9*52/12 = 1755; gap 1045; 6 months x 1045 = 6270 > 4000; 4000/1045 = 3.8278
    { values: { weekly: 450, tax: 10, weeks: 26, savings: 4000, expenses: 2800 }, expect: { net: 1755, gap: 1045, runway: 3.8278 }, tolerance: 0.001 },
    // net 600*.85*52/12 = 2210; gap 290; 6 x 290 = 1740; leftover 6260 / 2500 = 2.504; runway 8.504
    { values: { weekly: 600, tax: 15, weeks: 26, savings: 8000, expenses: 2500 }, expect: { net: 2210, gap: 290, runway: 8.504 }, tolerance: 0.001 },
  ],
});
