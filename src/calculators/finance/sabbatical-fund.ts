import { defineCalculator } from '../../lib/types';
import type { ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, CURRENCY } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'sabbatical-fund',
  title: 'Sabbatical Fund Calculator',
  category: 'finance',
  description: 'How much to save for a career break or time off work, and how much per month: months off, spending, buffer, income while away and start date.',
  keywords: ['sabbatical fund calculator', 'career break savings', 'how much to save for a sabbatical', 'time off work budget', 'mini retirement calculator', 'gap year savings'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'months', label: 'Months off', type: 'number', suffix: 'months', default: 6, min: 1, max: 60, step: 1, info: 'How long you plan to be away from paid work.' },
    { id: 'spend', label: 'Monthly spending while off', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, info: 'Everything you expect to spend each month: rent, food, insurance, travel.' },
    { id: 'income', label: 'Monthly income while off', type: 'number', prefix: '$', default: 0, min: 0, step: 100, info: 'Any money still coming in, such as rent from a property or freelance work. Leave at 0 if none.' },
    { id: 'buffer', label: 'Safety buffer', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 5, info: 'Extra on top of the plan for surprises. 10% is a common cushion.' },
    { id: 'saved', label: 'Already saved for this', type: 'number', prefix: '$', default: 4000, min: 0, step: 100, info: 'Money you have already set aside for the break.' },
    { id: 'lead', label: 'Months until you start', type: 'number', suffix: 'months', default: 12, min: 1, max: 240, step: 1, info: 'How long you have to save before the break begins.' },
    { id: 'ret', label: 'Yearly return on savings', type: 'number', suffix: '%', default: 0, min: 0, max: 20, step: 0.5, info: 'Optional. 0 means cash with no interest. Applies to monthly deposits, compounded monthly, paid at month end.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Save per month', format: 'currency', primary: true, info: 'The monthly amount that closes the gap by your start date.' },
    { id: 'target', label: 'Fund target', format: 'currency', info: 'Months off × (spending − income) × (1 + buffer).' },
    { id: 'gap', label: 'Still to save', format: 'currency', info: 'Target minus what you already have, never below zero.' },
    { id: 'net', label: 'Net cost per month off', format: 'currency', info: 'Spending minus income while off, before the buffer.' },
  ],
  compute: (v) => {
    const months = num(v.months);
    const spend = num(v.spend);
    const income = num(v.income);
    const buffer = num(v.buffer);
    const saved = num(v.saved);
    const lead = num(v.lead);
    const ret = num(v.ret);
    if (months === null || spend === null || income === null || buffer === null || saved === null || lead === null || ret === null) return { monthly: null };
    if (months < 1) return { monthly: null, error: 'Enter at least 1 month off.' };
    if (lead < 1) return { monthly: null, error: 'Enter at least 1 month until you start.' };
    if (spend < 0 || income < 0 || buffer < 0 || saved < 0 || ret < 0) return { monthly: null, error: 'Amounts and rates cannot be negative.' };

    const net = Math.max(0, spend - income);
    const target = months * net * (1 + buffer / 100);
    const gap = Math.max(0, target - saved);
    const n = Math.round(lead);
    const i = ret / 1200;
    const monthly = gap === 0 ? 0 : i === 0 ? gap / n : (gap * i) / (Math.pow(1 + i, n) - 1);

    // Balance of the deposits plus what is already saved (existing savings do not earn the return, keeping to the plain formula).
    const x: number[] = [];
    const bal: number[] = [];
    let b = 0;
    for (let m = 0; m <= n; m++) {
      if (m > 0) b = b * (1 + i) + monthly;
      x.push(m);
      bal.push(saved + b);
    }
    const chart: ChartSpec = {
      type: 'line',
      title: 'Your fund building up',
      x,
      xLabel: 'Months from now',
      xFormat: { format: 'integer' },
      yFormat: CURRENCY,
      series: [
        { name: 'Fund balance', values: bal },
        { name: 'Target', values: x.map(() => target) },
      ],
    };

    const covered = gap === 0;
    return {
      monthly,
      target,
      gap,
      net,
      tone: covered ? 'good' : 'ok',
      badge: covered ? 'Already funded' : `${money(monthly, 0)} a month`,
      chart,
      steps: [
        `Net cost per month = ${money(spend)} spending − ${money(income)} income = ${money(net)}`,
        `Target = ${months} months × ${money(net)} × (1 + ${buffer}%) = ${money(target)}`,
        `Still to save = ${money(target)} − ${money(saved)} saved = ${money(gap)}`,
        i === 0 ? `Monthly saving = ${money(gap)} ÷ ${n} months = ${money(monthly)}` : `Monthly saving = ${money(gap)} × i ÷ ((1 + i)^${n} − 1) with i = ${ret}% ÷ 12 = ${money(monthly)}`,
      ],
      note: covered
        ? 'What you have saved already covers the plan, including the buffer.'
        : 'This covers living costs only. Add health insurance, flights, paused retirement contributions and what returning to work will cost.',
    };
  },
  content: {
    formula: [
      'Net cost per month = spending − income while off (never below zero)',
      'Target = months off × net cost × (1 + buffer %)',
      'Still to save = max(0, target − already saved)',
      'Monthly saving = still to save ÷ months until start; with a return i = yearly % ÷ 12, still to save × i ÷ ((1 + i)^n − 1)',
    ],
    body: [
      'A sabbatical is a plain money problem: how many months, what each costs, and how long you have to save. Six months off at $3,000 a month with a 10% buffer needs $19,800. If you already have $4,000 and start in 12 months, you still need $15,800, about $1,316.67 a month.',
      'Income while away shrinks the target fast. With $500 a month of freelance or rental income the net cost drops to $2,500 a month, and the same six months needs $16,500. The buffer is there because trips and moves run over, so keep it unless you have a fixed price for everything.',
      'The estimate covers living costs only. Add health insurance if you lose employer cover, any pause in retirement contributions, and a few months of job-search runway for when you return.',
    ],
    faq: [
      { q: 'How much should I save for a sabbatical?', a: 'Months off × monthly spending (minus any income) × 1.10 is a good start. For 6 months at $3,000 with no income and a 10% buffer that is $19,800.' },
      { q: 'How much do I save per month?', a: 'Divide what is still missing by the months until you start. With a $16,500 target, $4,000 saved and 12 months to go, that is $12,500 ÷ 12 = $1,041.67 a month.' },
      { q: 'Why a safety buffer?', a: 'Costs usually run over plan. A 10% buffer on a $16,500 plan is $1,500 of cushion. Set it to 0 if your costs are fixed.' },
      { q: 'Does the return on savings matter?', a: 'A little over a year. At 4% a year, saving for 12 months cuts the monthly amount by roughly 2%. The calculator assumes deposits at month end and ignores growth on money you already have.' },
      { q: 'What does this leave out?', a: 'Health insurance, taxes, paused retirement contributions, visas and flights, and the cost of finding a job when you return. Add them to your monthly spending.' },
    ],
    sources: [
      { label: 'Consumer Financial Protection Bureau: budgeting and saving', url: 'https://www.consumerfinance.gov/consumer-tools/' },
    ],
  },
  related: ['savings-runway', 'sinking-fund', 'savings-goal', 'emergency-fund'],
  examples: [
    // 6 x (3000 - 500) x 1.10 = 16,500; gap 12,500; /12 = 1,041.67
    { values: { months: 6, spend: 3000, income: 500, buffer: 10, saved: 4000, lead: 12, ret: 0 }, expect: { target: 16500, gap: 12500, monthly: 1041.67, net: 2500 }, tolerance: 0.01 },
    // 6 x 3000 x 1.10 = 19,800; gap 15,800; /12 = 1,316.67
    { values: { months: 6, spend: 3000, income: 0, buffer: 10, saved: 4000, lead: 12, ret: 0 }, expect: { target: 19800, gap: 15800, monthly: 1316.67 }, tolerance: 0.01 },
    // Already funded: 3 x 1000 = 3,000 <= 5,000 saved
    { values: { months: 3, spend: 1000, income: 0, buffer: 0, saved: 5000, lead: 6, ret: 0 }, expect: { target: 3000, gap: 0, monthly: 0 }, tolerance: 1e-6 },
  ],
});
