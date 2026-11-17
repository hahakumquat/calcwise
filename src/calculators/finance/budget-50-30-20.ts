import { defineCalculator, type ComputeResult } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'budget-50-30-20',
  title: '50/30/20 Budget Calculator',
  category: 'finance',
  description: 'Split your take-home pay into needs, wants and savings with the 50/30/20 rule, then see how your real spending compares and where the gap is.',
  keywords: ['50/30/20 budget calculator', '50 30 20 rule', 'budget calculator', 'needs wants savings', 'monthly budget planner', 'how to split my paycheck'],
  updated: '2026-11-17',
  inputs: [
    { id: 'income', label: 'Monthly take-home pay', type: 'number', prefix: '$', default: 4000, min: 0, step: 50, info: 'Pay after tax and payroll deductions, the amount that lands in your account each month.' },
    { id: 'needs', label: 'What you spend on needs', type: 'number', prefix: '$', default: 2300, min: 0, step: 50, info: 'Rent or mortgage, utilities, groceries, insurance, transport to work, minimum debt payments. Leave at 0 to see only the targets.' },
    { id: 'wants', label: 'What you spend on wants', type: 'number', prefix: '$', default: 1100, min: 0, step: 50, info: 'Eating out, subscriptions, hobbies, travel, shopping. Leave at 0 to see only the targets.' },
  ],
  outputs: [
    { id: 'needsTarget', label: 'Needs target (50%)', format: 'currency', primary: true, info: '50% of take-home pay.' },
    { id: 'wantsTarget', label: 'Wants target (30%)', format: 'currency', info: '30% of take-home pay.' },
    { id: 'savingsTarget', label: 'Savings and debt target (20%)', format: 'currency', info: '20% of take-home pay, for saving, investing and paying debt down faster than the minimum.' },
    { id: 'savings', label: 'Left over for savings', format: 'currency', info: 'Take-home pay minus the needs and wants you entered.' },
    { id: 'savingsRate', label: 'Your savings rate', format: 'percent', precision: 1, info: 'Left over ÷ take-home pay.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const needs = num(v.needs) ?? 0;
    const wants = num(v.wants) ?? 0;
    if (income === null || income <= 0 || needs < 0 || wants < 0) return { needsTarget: null };
    const nT = income * 0.5;
    const wT = income * 0.3;
    const sT = income * 0.2;
    const spent = needs + wants;
    const compare = spent > 0;
    const left = income - spent;
    const rate = left / income;
    const showActual = compare && left >= 0;
    const out: ComputeResult = {
      needsTarget: nT,
      wantsTarget: wT,
      savingsTarget: sT,
      chart: {
        type: 'donut',
        title: showActual ? 'Where your pay goes' : 'The 50/30/20 split',
        slices: showActual
          ? [{ label: 'Needs', value: needs }, { label: 'Wants', value: wants }, { label: 'Savings', value: left }]
          : [{ label: 'Needs (50%)', value: nT }, { label: 'Wants (30%)', value: wT }, { label: 'Savings (20%)', value: sT }],
        format: { format: 'currency' },
        centerLabel: showActual ? 'Saved' : 'Take-home',
        centerValue: showActual ? `${fmt(rate * 100, 0)}%` : `$${fmt(income)}`,
      },
      steps: [
        `Needs: $${fmt(income, 2)} × 50% = $${fmt(nT, 2)}`,
        `Wants: $${fmt(income, 2)} × 30% = $${fmt(wT, 2)}`,
        `Savings and debt: $${fmt(income, 2)} × 20% = $${fmt(sT, 2)}`,
      ],
    };
    if (!compare) {
      out.note = 'Enter what you spend on needs and wants to see how your month compares with the rule.';
      return out;
    }
    out.savings = left;
    out.savingsRate = rate;
    (out.steps as string[]).push(`Left over: $${fmt(income, 2)} − $${fmt(needs, 2)} − $${fmt(wants, 2)} = $${fmt(left, 2)} (${fmt(rate * 100, 1)}%)`);
    if (left < 0) {
      out.tone = 'bad';
      out.badge = 'Overspending';
      out.note = `You spend $${fmt(-left, 2)} more than you take home each month. Wants are $${fmt(Math.abs(wants - wT), 2)} ${wants > wT ? 'over' : 'under'} the 30% target and needs are $${fmt(Math.abs(needs - nT), 2)} ${needs > nT ? 'over' : 'under'} the 50% target.`;
    } else if (rate >= 0.2) {
      out.tone = 'good';
      out.badge = 'On track';
      out.note = `You keep ${fmt(rate * 100, 1)}% of your pay, at or above the 20% target. That is $${fmt(left * 12, 0)} a year.`;
    } else {
      out.tone = 'ok';
      out.badge = 'Below target';
      out.note = `You keep ${fmt(rate * 100, 1)}%, short of the 20% target by $${fmt(sT - left, 2)} a month. Needs are ${fmt((needs / income) * 100, 1)}% and wants ${fmt((wants / income) * 100, 1)}% of your pay.`;
    }
    return out;
  },
  content: {
    formula: [
      'Needs = take-home pay × 50%',
      'Wants = take-home pay × 30%',
      'Savings and debt = take-home pay × 20%',
      'Savings rate = (take-home pay − needs − wants) ÷ take-home pay',
    ],
    body: [
      'The 50/30/20 rule is a simple way to plan a monthly budget. Half of your after-tax pay goes to needs, 30% to wants and 20% to savings and extra debt payments. It was popularised by Senator Elizabeth Warren and Amelia Warren Tyagi in their 2005 book All Your Worth.',
      'Enter your monthly take-home pay and the calculator shows the three targets. Add what you really spend on needs and wants and it shows what is left, your savings rate, and whether you are on track.',
      'Treat the percentages as a starting point, not a law. In a high-rent city needs can run well over 50%, and that is fine if you are honest about it. The useful question is whether you save something every month. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'What counts as a need and what counts as a want',
        paragraphs: [
          'Needs are costs you cannot easily skip: housing, utilities, basic groceries, insurance, transport to work and the minimum payments on debt. Wants are the things you choose: eating out, streaming, travel, upgrades and hobbies.',
          'The line is sometimes blurry. A phone is a need, a new flagship phone is partly a want. Put the basic version in needs and the upgrade in wants. Debt payments above the minimum count towards the 20%.',
        ],
      },
      {
        heading: 'If your needs are over 50%',
        paragraphs: [
          'Many people cannot hit 50/30/20, especially with high rent. Try 60/20/20 or 70/10/20 and keep the savings share intact, cutting wants first. If even that is out of reach, a smaller savings rate paid automatically on payday beats none.',
        ],
      },
    ],
    faq: [
      { q: 'What is the 50/30/20 rule?', a: 'Spend 50% of take-home pay on needs, 30% on wants and put 20% towards savings and debt repayment. On $4,000 a month that is $2,000, $1,200 and $800.' },
      { q: 'Is it based on pre-tax or after-tax pay?', a: 'After-tax. Use the amount that reaches your bank account. Pre-tax retirement contributions and benefits are already taken out of it.' },
      { q: 'Do debt payments count as needs or savings?', a: 'Minimum payments are needs. Anything above the minimum counts towards the 20% savings and debt share.' },
      { q: 'What savings rate do I have if I spend $2,300 on needs and $1,100 on wants from $4,000?', a: 'You spend $3,400, leaving $600, which is 15% of your pay and $200 short of the $800 target.' },
    ],
  },
  related: ['emergency-fund', 'savings-goal', 'subscription-cost', 'latte-factor', 'take-home-pay'],
  examples: [
    // 4000 × .5 = 2000; × .3 = 1200; × .2 = 800; left 4000 − 3400 = 600; rate 0.15.
    { values: { income: 4000, needs: 2300, wants: 1100 }, expect: { needsTarget: 2000, wantsTarget: 1200, savingsTarget: 800, savings: 600, savingsRate: 0.15 }, tolerance: 1e-9 },
    // 3000: targets 1500/900/600; left 3000 − 1500 − 900 = 600; rate 0.2.
    { values: { income: 3000, needs: 1500, wants: 900 }, expect: { needsTarget: 1500, wantsTarget: 900, savingsTarget: 600, savingsRate: 0.2, savings: 600 }, tolerance: 1e-9 },
  ],
});
