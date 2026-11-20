import { defineCalculator, type ComputeResult } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

const CATS: { id: string; label: string; def: number; info: string }[] = [
  { id: 'housing', label: 'Housing', def: 1400, info: 'Rent or mortgage, renters or home insurance, property tax if not in the mortgage.' },
  { id: 'utilities', label: 'Utilities and phone', def: 250, info: 'Electricity, gas, water, internet and mobile plan.' },
  { id: 'groceries', label: 'Groceries', def: 500, info: 'Food you cook at home.' },
  { id: 'transport', label: 'Transport', def: 300, info: 'Car payment, fuel, transit pass, car insurance and upkeep.' },
  { id: 'debt', label: 'Debt payments', def: 250, info: 'Student loans, credit cards and other loans, including any extra you pay.' },
  { id: 'savings', label: 'Savings and investing', def: 600, info: 'Emergency fund, retirement, sinking funds. Money you assign to saving is still assigned.' },
  { id: 'fun', label: 'Eating out and fun', def: 400, info: 'Restaurants, entertainment, hobbies, subscriptions.' },
  { id: 'other', label: 'Everything else', def: 200, info: 'Health costs, clothes, gifts, personal care and a small buffer.' },
];

export default defineCalculator({
  slug: 'zero-based-budget',
  title: 'Zero-Based Budget Calculator',
  category: 'finance',
  description: 'Give every dollar of your monthly income a job. Enter your take-home pay and categories and see how much is still unassigned, or over-assigned.',
  keywords: ['zero based budget calculator', 'zero-based budgeting', 'give every dollar a job', 'monthly budget planner', 'budget worksheet', 'income minus expenses equals zero'],
  updated: '2026-11-20',
  inputs: [
    { id: 'income', label: 'Monthly take-home pay', type: 'number', prefix: '$', default: 4000, min: 0, step: 50, info: 'Pay after tax and payroll deductions, plus any other regular income for the month.' },
    ...CATS.map((c) => ({ id: c.id, label: c.label, type: 'number' as const, prefix: '$', default: c.def, min: 0, step: 25, info: c.info })),
  ],
  outputs: [
    { id: 'unassigned', label: 'Still to assign', format: 'currency', primary: true, info: 'Take-home pay minus everything you have given a job. Zero means a zero-based budget. Negative means you have planned to spend more than you earn.' },
    { id: 'assigned', label: 'Assigned so far', format: 'currency', info: 'Sum of all categories.' },
    { id: 'assignedPct', label: 'Share of income assigned', format: 'percent', precision: 1, info: 'Assigned ÷ take-home pay.' },
    { id: 'savingsPct', label: 'Share going to savings', format: 'percent', precision: 1, info: 'Savings and investing ÷ take-home pay.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    if (income === null || income <= 0) return { unassigned: null };
    const vals = CATS.map((c) => ({ label: c.label, value: num(v[c.id]) ?? 0 }));
    if (vals.some((x) => x.value < 0)) return { unassigned: null };
    const assigned = vals.reduce((s, x) => s + x.value, 0);
    const left = income - assigned;
    const zero = Math.abs(left) < 0.005;
    const out: ComputeResult = {
      unassigned: zero ? 0 : left,
      assigned,
      assignedPct: assigned / income,
      savingsPct: (num(v.savings) ?? 0) / income,
      steps: [
        `Assigned: ${vals.map((x) => `$${fmt(x.value, 2)}`).join(' + ')} = $${fmt(assigned, 2)}`,
        `Still to assign: $${fmt(income, 2)} − $${fmt(assigned, 2)} = $${fmt(left, 2)}`,
      ],
    };
    const slices = vals.filter((x) => x.value > 0);
    if (left > 0.005) slices.push({ label: 'Unassigned', value: left });
    if (slices.length > 0) {
      out.chart = {
        type: 'donut',
        title: 'Where every dollar goes',
        slices,
        format: { format: 'currency' },
        centerLabel: zero ? 'Assigned' : left > 0 ? 'To assign' : 'Over by',
        centerValue: zero ? '100%' : `$${fmt(Math.abs(left))}`,
      };
    }
    if (zero) {
      out.tone = 'good';
      out.badge = 'Zero-based';
      out.note = 'Every dollar has a job: income minus planned spending and saving is exactly zero.';
    } else if (left > 0) {
      out.tone = 'ok';
      out.badge = 'Dollars left';
      out.note = `$${fmt(left, 2)} has no job yet. Put it towards savings, debt or a category, until the number reaches zero.`;
    } else {
      out.tone = 'bad';
      out.badge = 'Over-assigned';
      out.note = `You have planned $${fmt(-left, 2)} more than you earn. Trim a category or two until the number reaches zero.`;
    }
    return out;
  },
  content: {
    formula: [
      'Assigned = sum of all your categories',
      'Still to assign = take-home pay − assigned',
      'A zero-based budget is one where still to assign = 0',
    ],
    body: [
      'A zero-based budget gives every dollar of income a job before the month starts. Income minus all planned spending, debt payments and saving equals zero. Zero does not mean you spend it all: saving and investing are jobs too.',
      'Enter your monthly take-home pay and your categories. The calculator shows how much is still unassigned, or how far you have planned beyond your income, and charts where each dollar goes. Everything runs in your browser and nothing is stored.',
      'Unlike the 50/30/20 rule, which fixes the percentages for you, this method starts from your real bills and asks only that the total matches your income.',
    ],
    sections: [
      {
        heading: 'How to use it in practice',
        paragraphs: [
          'List fixed bills first, then savings and debt, then flexible spending such as groceries and fun. Anything left over goes to a goal you pick on purpose, rather than disappearing into everyday spending.',
          'If your income varies, budget from the lowest month and assign any extra once it arrives. Revisit the plan monthly: a budget that never changes is usually a budget nobody uses.',
        ],
      },
    ],
    faq: [
      { q: 'What is a zero-based budget?', a: 'A budget where income minus every planned expense, debt payment and savings contribution equals zero, so each dollar is assigned before you spend it.' },
      { q: 'Does zero-based mean I spend everything?', a: 'No. Money assigned to savings, investing or an emergency fund counts as assigned. Only unplanned money is left unassigned.' },
      { q: 'What do I get with $4,000 income and the default categories?', a: 'The categories add up to $3,900, so $100 is still to assign, which is 97.5% of your income assigned and 15% going to savings.' },
      { q: 'What if the result is negative?', a: 'You have planned more spending than income. Reduce flexible categories until the number reaches zero.' },
    ],
  },
  related: ['budget-50-30-20', 'emergency-fund', 'daily-spending-allowance', 'sinking-fund', 'take-home-pay'],
  examples: [
    // 1400+250+500+300+250+600+400+200 = 3900; 4000-3900 = 100; 3900/4000 = .975; 600/4000 = .15
    { values: { income: 4000, housing: 1400, utilities: 250, groceries: 500, transport: 300, debt: 250, savings: 600, fun: 400, other: 200 }, expect: { unassigned: 100, assigned: 3900, assignedPct: 0.975, savingsPct: 0.15 }, tolerance: 1e-9 },
    // 1000+200+400+300+100+500+300+200 = 3000 = income -> 0
    { values: { income: 3000, housing: 1000, utilities: 200, groceries: 400, transport: 300, debt: 100, savings: 500, fun: 300, other: 200 }, expect: { unassigned: 0, assigned: 3000, assignedPct: 1 }, tolerance: 1e-9 },
    // 1200+200+400+200+100+100+200+100 = 2500; 2000-2500 = -500
    { values: { income: 2000, housing: 1200, utilities: 200, groceries: 400, transport: 200, debt: 100, savings: 100, fun: 200, other: 100 }, expect: { unassigned: -500, assigned: 2500 }, tolerance: 1e-9 },
  ],
});
