import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

const SLOTS = [1, 2, 3, 4, 5, 6];
const DEFAULTS: { name: string; amount: number }[] = [
  { name: 'Groceries', amount: 480 },
  { name: 'Gas', amount: 160 },
  { name: 'Fun', amount: 120 },
];
const SCHEDULES: Record<string, { periods: number; label: string }> = {
  '52': { periods: 52, label: 'weekly' },
  '26': { periods: 26, label: 'biweekly' },
  '24': { periods: 24, label: 'semi-monthly' },
  '12': { periods: 12, label: 'monthly' },
};

const rows = SLOTS.flatMap((n) => {
  const d = DEFAULTS[n - 1];
  const tail = n > 1 ? ' Leave blank if you do not use this envelope.' : '';
  return [
    { id: `n${n}`, label: `Envelope ${n} name`, type: 'text' as const, optional: true, ...(d ? { default: d.name } : {}), placeholder: 'e.g. Groceries', info: `A label for envelope ${n}, such as Groceries, Gas or Fun. If blank, it is called "Envelope ${n}".` },
    { id: `a${n}`, label: `Envelope ${n} monthly cash`, type: 'number' as const, prefix: '$', min: 0, step: 10, optional: true, ...(d ? { default: d.amount } : {}), info: `The cash you put in envelope ${n} for the whole month.${tail}` },
    { id: `c${n}`, label: `Envelope ${n} cash left`, type: 'number' as const, prefix: '$', min: 0, step: 5, optional: true, info: `Optional. Cash still in envelope ${n} today. Fill this and the days left to get a daily allowance.` },
    { id: `d${n}`, label: `Envelope ${n} days left`, type: 'number' as const, suffix: 'days', min: 1, max: 31, step: 1, optional: true, info: `Optional. Days left in the month for envelope ${n}, counting today. Must be at least 1.` },
  ];
});

export default defineCalculator({
  slug: 'cash-envelope-budget',
  title: 'Cash Envelope Budget Calculator',
  category: 'finance',
  description: 'Split your monthly cash envelopes into weekly, biweekly or semi-monthly paycheck amounts, and see a daily allowance from the cash left in each envelope.',
  keywords: ['cash envelope budget calculator', 'cash envelope system', 'envelope budgeting per paycheck', 'cash stuffing calculator', 'weekly cash envelope amounts', 'daily allowance from cash left'],
  updated: '2026-11-28',
  inputs: [
    ...rows,
    {
      id: 'schedule',
      label: 'Pay schedule',
      type: 'select',
      default: '26',
      options: [
        { value: '52', label: 'Weekly (52 a year)' },
        { value: '26', label: 'Biweekly (26 a year)' },
        { value: '24', label: 'Semi-monthly (24 a year)' },
        { value: '12', label: 'Monthly (12 a year)' },
      ],
      info: 'How often you are paid. Biweekly means every two weeks; semi-monthly means twice a month, usually the 1st and 15th.',
    },
  ],
  outputs: [
    { id: 'perPaycheck', label: 'Cash to withdraw each paycheck', format: 'currency', primary: true, info: 'Total monthly cash × 12 ÷ number of paychecks per year, for all envelopes.' },
    { id: 'perWeek', label: 'Per week', format: 'currency', info: 'Total monthly cash × 12 ÷ 52.' },
    { id: 'monthly', label: 'Total per month', format: 'currency', info: 'The sum of all envelope amounts.' },
    { id: 'daily', label: 'Daily allowance (from cash left)', format: 'currency', info: 'The sum of cash left ÷ days left for each envelope where you filled both in. Empty if none.' },
  ],
  compute: (v) => {
    const sch = SCHEDULES[String(v.schedule ?? '26')];
    if (!sch) return { perPaycheck: null, error: 'Choose a pay schedule.' };
    const items: { n: number; name: string; amount: number; paycheck: number; week: number; daily: number | null; left: number | null; days: number | null }[] = [];
    for (const n of SLOTS) {
      const amount = num(v[`a${n}`]);
      const left = num(v[`c${n}`]);
      const days = num(v[`d${n}`]);
      const name = String(v[`n${n}`] ?? '').trim() || `Envelope ${n}`;
      if (amount != null && amount < 0) return { perPaycheck: null, error: `${name}: the monthly amount cannot be negative.` };
      if (left != null && left < 0) return { perPaycheck: null, error: `${name}: cash left cannot be negative.` };
      if (days != null && days < 1) return { perPaycheck: null, error: `${name}: days left must be 1 or more.` };
      if ((left == null) !== (days == null)) return { perPaycheck: null, error: `${name}: fill in both cash left and days left, or leave both blank.` };
      if (amount == null || amount === 0) {
        if (left != null) return { perPaycheck: null, error: `${name}: enter the monthly amount before adding cash left.` };
        continue;
      }
      items.push({ n, name, amount, paycheck: (amount * 12) / sch.periods, week: (amount * 12) / 52, daily: left != null && days != null ? left / days : null, left, days });
    }
    if (!items.length) return { perPaycheck: null };
    const monthly = items.reduce((a, x) => a + x.amount, 0);
    const perPaycheck = (monthly * 12) / sch.periods;
    const perWeek = (monthly * 12) / 52;
    const withDaily = items.filter((x) => x.daily != null);
    const daily = withDaily.length ? withDaily.reduce((a, x) => a + (x.daily as number), 0) : undefined;
    return {
      perPaycheck,
      perWeek,
      monthly,
      ...(daily !== undefined ? { daily } : {}),
      tone: 'ok',
      badge: `${money(perPaycheck)} ${sch.label} across ${items.length} ${items.length === 1 ? 'envelope' : 'envelopes'}`,
      chart: moneyDonut(`Each ${sch.label} paycheck, by envelope`, items.map((x) => ({ label: x.name, value: x.paycheck })), money(perPaycheck, 0), 'per paycheck'),
      note: 'A planning aid only: nothing is stored or sent anywhere. Because a year has 52 weeks, weekly pay gives about four months a year with five paychecks and biweekly pay gives two months with three, so those months you can keep the extra for savings or bills.',
      steps: [
        ...items.map((x) => `${x.name}: ${money(x.amount)} × 12 ÷ ${sch.periods} = ${money(x.paycheck)} per paycheck, ${money(x.week)} per week`),
        `Total: ${money(monthly)} a month = ${money(perPaycheck)} per paycheck, ${money(perWeek)} per week`,
        ...withDaily.map((x) => `${x.name} daily allowance: ${money(x.left as number)} ÷ ${x.days} days = ${money(x.daily as number)} a day`),
      ],
    };
  },
  content: {
    formula: [
      'Per paycheck = monthly amount × 12 ÷ paychecks per year',
      'Per week = monthly amount × 12 ÷ 52',
      'Daily allowance = cash left ÷ days left',
    ],
    body: [
      'The cash envelope system puts a fixed amount of cash in a labelled envelope for each spending category, such as groceries, gas or fun. When an envelope is empty, spending in that category stops until the next refill. It is a simple way to stay inside a budget.',
      'Enter up to six envelopes with their monthly amounts and pick how often you are paid. The calculator shows how much cash to put in the envelopes at each paycheck, plus the weekly equivalent, so a monthly plan lines up with your real pay days.',
      'Months are not exactly four weeks. Dividing the yearly total by your number of paychecks, rather than monthly by 4, keeps the plan accurate. With a 52-week year, weekly pay produces about four months with a fifth paycheck, and biweekly pay produces two months with a third paycheck.',
      'To pace an envelope that is already partly spent, add the cash left and the days left in the month. The calculator divides one by the other to give a daily allowance. This is a planning aid: everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Groceries $480, gas $160 and fun $120 come to $760 a month. Per week that is $760 × 12 ÷ 52 = $175.38, with groceries at $110.77. Paid biweekly it is $760 × 12 ÷ 26 = $350.77 per paycheck, and semi-monthly it is $760 × 12 ÷ 24 = $380.00.',
          'If $300 is left in the groceries envelope with 12 days left in the month, the daily allowance is $300 ÷ 12 = $25.00 a day.',
        ],
      },
    ],
    faq: [
      { q: 'How much cash do I put in the envelopes each paycheck?', a: 'Monthly total × 12 ÷ paychecks per year. For $760 a month paid biweekly that is $350.77; paid semi-monthly it is $380.00; paid weekly it is $175.38.' },
      { q: 'How much per week is $480 a month for groceries?', a: '$480 × 12 ÷ 52 = $110.77 a week.' },
      { q: 'What is the daily allowance?', a: 'The cash left in an envelope divided by the days left in the month. $300 left with 12 days to go is $25.00 a day.' },
      { q: 'Why do two months have an extra paycheck?', a: 'A year has 52 weeks, which is 4 weeks per month plus 4 extra weeks. Weekly pay therefore gives about four months with five paychecks, and biweekly pay gives two months with three. The calculator spreads the yearly total evenly, so those months are a chance to save or catch up.' },
      { q: 'Does this store my budget?', a: 'No. It is a planning aid that runs in your browser, and nothing you enter is saved or sent anywhere.' },
    ],
    sources: [{ label: 'Consumer Financial Protection Bureau: Budgeting and saving', url: 'https://www.consumerfinance.gov/consumer-tools/budgeting-saving/' }],
  },
  related: ['sinking-fund', 'no-spend-challenge'],
  examples: [
    // 480+160+120 = 760 a month. Biweekly: 760*12/26 = 9120/26 = 350.769; per week: 9120/52 = 175.385.
    { values: { n1: 'Groceries', a1: 480, n2: 'Gas', a2: 160, n3: 'Fun', a3: 120, schedule: '26' }, expect: { perPaycheck: 350.77, perWeek: 175.38, monthly: 760 }, tolerance: 0.01 },
    // Semi-monthly: 9120/24 = 380.00.
    { values: { a1: 480, a2: 160, a3: 120, schedule: '24' }, expect: { perPaycheck: 380, monthly: 760 }, tolerance: 0.01 },
    // Groceries $300 left, 12 days left: 300/12 = 25.00 a day.
    { values: { a1: 480, c1: 300, d1: 12, schedule: '52' }, expect: { perPaycheck: 110.77, daily: 25 }, tolerance: 0.01 },
  ],
});
