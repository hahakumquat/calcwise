import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'holiday-savings-plan',
  title: 'Holiday Savings Plan Calculator',
  category: 'finance',
  description: 'Work out how much to set aside each week or every two weeks to reach your holiday budget on time, from your target, what you have saved and the weeks left.',
  keywords: ['holiday savings plan', 'holiday savings calculator', 'christmas savings plan', 'weekly savings for holidays', 'how much to save each week', 'biweekly savings plan'],
  updated: '2026-11-27',
  inputs: [
    { id: 'target', label: 'Holiday budget target', type: 'number', prefix: '$', default: 1200, min: 0, step: 1, info: 'The total you want to have ready, for gifts, travel, food and the rest.' },
    { id: 'saved', label: 'Already saved', type: 'number', prefix: '$', default: 0, min: 0, step: 1, info: 'What you have already set aside for this budget. Use 0 if you are starting from scratch.' },
    { id: 'weeks', label: 'Weeks until you need it', type: 'number', default: 48, min: 1, step: 1, info: 'Whole weeks from now until the money must be ready. At least 1.' },
    {
      id: 'rhythm',
      label: 'Deposit rhythm',
      type: 'select',
      segmented: true,
      default: 'weekly',
      info: 'Weekly puts money away every week. Every two weeks uses fewer, larger deposits, for example on alternate paydays.',
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Every two weeks' },
      ],
    },
  ],
  outputs: [
    { id: 'deposit', label: 'Each deposit', format: 'currency', precision: 2, primary: true, info: 'The amount to put away each time, at the rhythm you chose.' },
    { id: 'depositCount', label: 'Number of deposits', format: 'integer', info: 'Weeks for weekly deposits, or weeks ÷ 2 rounded up for every-two-weeks deposits.' },
    { id: 'weekly', label: 'If weekly', format: 'currency', precision: 2, info: 'Still needed ÷ weeks.' },
    { id: 'biweekly', label: 'If every two weeks', format: 'currency', precision: 2, info: 'Still needed ÷ (weeks ÷ 2 rounded up).' },
    { id: 'needed', label: 'Still to save', format: 'currency', precision: 2, info: 'Target minus what you have already saved, never below 0.' },
  ],
  compute: (v) => {
    const target = num(v.target);
    const saved = num(v.saved) ?? 0;
    const weeks = num(v.weeks);
    const rhythm = v.rhythm === 'biweekly' ? 'biweekly' : 'weekly';
    if (target === null || weeks === null) return { deposit: null };
    if (weeks < 1 || !Number.isInteger(weeks)) return { deposit: null, error: 'Weeks until you need it must be a whole number, at least 1.' };
    if (target <= 0) return { deposit: null, error: 'Enter a holiday budget greater than 0.' };
    if (saved < 0) return { deposit: null, error: 'Already saved cannot be negative.' };
    const needed = Math.max(0, target - saved);
    const biCount = Math.ceil(weeks / 2);
    const count = rhythm === 'weekly' ? weeks : biCount;
    if (needed === 0) {
      return {
        deposit: 0, depositCount: 0, weekly: 0, biweekly: 0, needed: 0,
        tone: 'good',
        badge: 'Already covered',
        note: 'You have already saved your target, so no deposits are needed. Interest is ignored.',
        steps: [`Still to save = ${money(target)} − ${money(saved)} = ${money(0)}`],
      };
    }
    const weekly = needed / weeks;
    const biweekly = needed / biCount;
    const deposit = rhythm === 'weekly' ? weekly : biweekly;
    return {
      deposit, depositCount: count, weekly, biweekly, needed,
      tone: 'ok',
      badge: `${money(deposit)} ${rhythm === 'weekly' ? 'a week' : 'every two weeks'}`,
      chart: { type: 'bar', title: 'Where the budget comes from', categories: ['Already saved', 'Still to save'], series: [{ name: 'Amount', values: [Math.min(saved, target), needed] }], format: { format: 'currency', precision: 0 } },
      steps: [
        `Still to save = ${money(target)} − ${money(saved)} = ${money(needed)}`,
        `Weekly = ${money(needed)} ÷ ${weeks} weeks = ${money(weekly)}`,
        `Every two weeks = ${money(needed)} ÷ ${biCount} deposits (${weeks} ÷ 2, rounded up) = ${money(biweekly)}`,
      ],
      note: 'Interest is ignored, so a savings account will leave you slightly ahead of this plan.',
    };
  },
  content: {
    formula: [
      'Still to save = target − already saved (0 if already covered)',
      'Weekly deposit = still to save ÷ weeks',
      'Every-two-weeks deposit = still to save ÷ (weeks ÷ 2, rounded up)',
    ],
    body: [
      'Holiday spending is easier when it is spread over the year instead of landing on a card in January. Enter your target, what you have already saved and how many weeks you have, and this calculator shows the steady deposit that gets you there.',
      'Pick weekly deposits, or every two weeks if you are paid fortnightly. With an odd number of weeks the last two-week block is short, so the number of deposits is weeks ÷ 2 rounded up.',
      'For example, a $1,200 budget with nothing saved and 48 weeks to go is $25.00 a week, or $50.00 every two weeks across 24 deposits. With $150 already saved toward $900 and 30 weeks left, you still need $750: $25.00 a week or $50.00 every two weeks over 15 deposits.',
      'The plan ignores interest, so any interest you earn is a small bonus. It also assumes the budget is fixed. To decide the budget itself, try the gift budget calculator, or see the savings challenge calculator for a stepped approach and the holiday spending total calculator for the full picture.',
    ],
    faq: [
      { q: 'How much should I save each week for a $1,200 holiday budget over 48 weeks?', a: 'With nothing saved yet, $25.00 a week, or $50.00 every two weeks across 24 deposits.' },
      { q: 'What if I have already saved some money?', a: 'Only the gap counts. For a $900 target with $150 saved and 30 weeks left, you still need $750, which is $25.00 a week or $50.00 every two weeks over 15 deposits.' },
      { q: 'How much a week for $1,000 in 20 weeks?', a: '$50.00 a week, starting from zero savings.' },
      { q: 'What if I have already saved the whole budget?', a: 'The calculator says it is already covered and shows $0 per deposit.' },
      { q: 'What happens with an odd number of weeks?', a: 'Two-week deposits are counted as weeks ÷ 2, rounded up. For 5 weeks that is 3 deposits, so each is the amount needed ÷ 3.' },
      { q: 'Does this include interest?', a: 'No. Interest is ignored, so a savings account would leave you slightly ahead of the plan.' },
    ],
    sources: [],
  },
  related: ['gift-budget', 'savings-challenge', 'holiday-spending-total'],
  examples: [
    // 1200 - 0 = 1200; 1200/48 = 25; ceil(48/2) = 24 deposits; 1200/24 = 50
    { values: { target: 1200, saved: 0, weeks: 48, rhythm: 'biweekly' }, expect: { needed: 1200, weekly: 25, biweekly: 50, depositCount: 24, deposit: 50 }, tolerance: 1e-9 },
    // 900 - 150 = 750; 750/30 = 25; ceil(30/2) = 15; 750/15 = 50
    { values: { target: 900, saved: 150, weeks: 30, rhythm: 'biweekly' }, expect: { needed: 750, weekly: 25, biweekly: 50, depositCount: 15, deposit: 50 }, tolerance: 1e-9 },
    // 1000 - 0 = 1000; 1000/20 = 50 a week, 20 deposits
    { values: { target: 1000, saved: 0, weeks: 20, rhythm: 'weekly' }, expect: { needed: 1000, weekly: 50, depositCount: 20, deposit: 50 }, tolerance: 1e-9 },
  ],
});
