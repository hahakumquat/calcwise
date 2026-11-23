import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const PERIODS: Record<string, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };

export default defineCalculator({
  slug: 'ytd-income-projection',
  title: 'Year-to-Date Income Projection',
  seoTitle: 'YTD Income Projection Calculator',
  metaDescription: 'Project your full-year gross income from your pay stub year-to-date total: pay per check, checks left this year and expected annual income.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Turn your year-to-date gross pay into a projection of what you will earn by December 31.',
  keywords: ['ytd income projection', 'year to date income calculator', 'annual income from ytd', 'project yearly income from pay stub', 'estimate annual salary from ytd'],
  popular: false,
  inputs: [
    { id: 'ytd', label: 'Year-to-date gross pay', type: 'number', prefix: '$', default: 52000, min: 0, step: 100, info: 'The YTD gross figure on your latest pay stub, before tax.' },
    { id: 'paid', label: 'Paychecks received so far', type: 'number', default: 20, min: 1, max: 52, step: 1, info: 'How many paychecks the YTD total covers.' },
    {
      id: 'freq', label: 'Pay frequency', type: 'select', default: 'biweekly', info: 'How often you are paid. It sets how many paychecks fit in a year.',
      options: [
        { value: 'weekly', label: 'Weekly (52)' },
        { value: 'biweekly', label: 'Every two weeks (26)' },
        { value: 'semimonthly', label: 'Twice a month (24)' },
        { value: 'monthly', label: 'Monthly (12)' },
      ],
    },
    { id: 'bonus', label: 'One-time bonuses in that total', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, info: 'Bonuses already included in YTD. They are kept once, not repeated each paycheck. Enter 0 if none.' },
  ],
  outputs: [
    { id: 'annual', label: 'Projected income for the year', format: 'currency', precision: 0, primary: true, info: 'Regular pay per check × checks in the year + one-time bonuses.' },
    { id: 'perCheck', label: 'Regular pay per paycheck', format: 'currency', precision: 0, info: '(YTD − bonuses) ÷ paychecks received.' },
    { id: 'left', label: 'Paychecks left this year', format: 'number', precision: 0, info: 'Checks in the year minus checks received.' },
    { id: 'remaining', label: 'Still to come', format: 'currency', precision: 0, info: 'Pay per check × paychecks left.' },
  ],
  compute: (v) => {
    const ytd = num(v.ytd), paid = num(v.paid), bonus = num(v.bonus);
    const per = PERIODS[String(v.freq)];
    if (ytd === null || paid === null || bonus === null || !per) return { annual: null };
    if (ytd < 0 || bonus < 0) return { annual: null, error: 'Amounts cannot be negative.' };
    if (bonus > ytd) return { annual: null, error: 'Bonuses cannot be more than the year-to-date total.' };
    const n = Math.floor(paid);
    if (n < 1) return { annual: null, error: 'Enter at least 1 paycheck received.' };
    if (n > per) return { annual: null, error: `You cannot have more than ${per} paychecks on this schedule.` };
    const perCheck = (ytd - bonus) / n;
    const left = per - n;
    const remaining = perCheck * left;
    const annual = ytd + remaining;
    return {
      annual,
      perCheck,
      left,
      remaining,
      tone: 'good',
      badge: `${left} paycheck${left === 1 ? '' : 's'} to go`,
      chart: {
        type: 'bar',
        title: 'Income this year',
        categories: ['Earned so far', 'Still to come'],
        series: [{ name: 'Gross', values: [+ytd.toFixed(2), +remaining.toFixed(2)] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Pay per check = (${money(ytd, 0)} − ${money(bonus, 0)}) ÷ ${n} = ${money(perCheck, 2)}`,
        `Checks left = ${per} − ${n} = ${left}, worth ${money(remaining, 0)}`,
        `Year = ${money(ytd, 0)} + ${money(remaining, 0)} = ${money(annual, 0)}`,
      ],
      note: 'Gross, before tax. Assumes regular pay stays the same and no further bonuses. A raise, unpaid leave or a 27th paycheck would change it.',
    };
  },
  content: {
    formula: [
      'Pay per check = (YTD gross − one-time bonuses) ÷ paychecks received',
      'Checks left = checks per year − paychecks received',
      'Projected year = YTD gross + pay per check × checks left',
    ],
    body: [
      'Your latest pay stub shows what you have earned so far this year. This calculator scales that to the whole year, which is useful for a late-year check on income before tax season.',
      'With $52,000 year to date over 20 biweekly paychecks, including a $2,000 bonus, regular pay is $2,500 a check. Six checks remain, worth $15,000, so the projected year is $67,000.',
    ],
    sections: [
      {
        heading: 'Why bonuses are separated',
        paragraphs: [
          'Dividing the whole YTD figure by paychecks would treat a one-time bonus as if it repeats every check and overstate the year. Enter bonuses separately and they are counted once. Gross pay is before tax and deductions; for take-home pay, use the take-home pay calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How do I estimate my annual income from my YTD pay?', a: 'Divide YTD gross by the paychecks received to get pay per check, multiply by the checks in the year, and add any one-time bonuses. With $52,000 YTD, 20 biweekly checks and a $2,000 bonus, that gives $67,000.' },
      { q: 'How many paychecks are in a year?', a: 'Weekly 52, every two weeks 26, twice a month 24, monthly 12. Some years have a 27th biweekly check; this uses 26.' },
      { q: 'Is the projection before or after tax?', a: 'Before tax. It uses gross pay from your stub.' },
      { q: 'What if I expect a raise?', a: 'This assumes pay stays the same. A raise would increase the remaining paychecks, so the real total would be higher.' },
    ],
    sources: [{ label: 'Simple arithmetic on your own pay-stub figures; no external data' }],
  },
  related: ['paychecks-per-year', 'take-home-pay', 'raise-calculator', 'salary-growth-projection'],
  examples: [
    // (52000-2000)/20 = 2500; left 6; remaining 15000; annual 67000
    { values: { ytd: 52000, paid: 20, freq: 'biweekly', bonus: 2000 }, expect: { annual: 67000, perCheck: 2500, left: 6, remaining: 15000 }, tolerance: 1e-6 },
    // 30000/6 = 5000; left 6; remaining 30000; annual 60000
    { values: { ytd: 30000, paid: 6, freq: 'monthly', bonus: 0 }, expect: { annual: 60000, perCheck: 5000, left: 6, remaining: 30000 }, tolerance: 1e-6 },
  ],
});
