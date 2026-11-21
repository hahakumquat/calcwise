import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

const GROUPS: [string, string][] = [['clean', 'Cleaner or house help'], ['care', 'Babysitter or childcare'], ['teach', 'Teachers'], ['style', 'Stylist or barber'], ['other', 'Other people']];

export default defineCalculator({
  slug: 'holiday-tipping-budget',
  title: 'Holiday Tipping Budget Calculator',
  category: 'everyday',
  description: 'Add up holiday tips and thank-you gifts for the people who help you all year, then see the weekly saving and the share of your monthly income.',
  keywords: ['holiday tipping budget', 'holiday tip calculator', 'christmas tips total', 'teacher gift budget', 'year end tips budget', 'how much to save for holiday tips'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'cleanN', label: 'Cleaner or house help: how many', type: 'number', default: 1, min: 0, max: 100, step: 1, optional: true, info: 'Number of people in this group you plan to thank.' },
    { id: 'cleanA', label: 'Cleaner or house help: amount each', type: 'number', prefix: '$', default: 100, min: 0, step: 5, optional: true, info: 'What you plan to give each person. You choose the amount.' },
    { id: 'careN', label: 'Babysitter or childcare: how many', type: 'number', default: 1, min: 0, max: 100, step: 1, optional: true, info: 'Number of people in this group you plan to thank.' },
    { id: 'careA', label: 'Babysitter or childcare: amount each', type: 'number', prefix: '$', default: 50, min: 0, step: 5, optional: true, info: 'What you plan to give each person. You choose the amount.' },
    { id: 'teachN', label: 'Teachers: how many', type: 'number', default: 3, min: 0, max: 100, step: 1, optional: true, info: 'Number of people in this group you plan to thank.' },
    { id: 'teachA', label: 'Teachers: amount each', type: 'number', prefix: '$', default: 25, min: 0, step: 5, optional: true, info: 'What you plan to give each person. You choose the amount.' },
    { id: 'styleN', label: 'Stylist or barber: how many', type: 'number', default: 1, min: 0, max: 100, step: 1, optional: true, info: 'Number of people in this group you plan to thank.' },
    { id: 'styleA', label: 'Stylist or barber: amount each', type: 'number', prefix: '$', default: 60, min: 0, step: 5, optional: true, info: 'What you plan to give each person. You choose the amount.' },
    { id: 'otherN', label: 'Other people: how many', type: 'number', default: 0, min: 0, max: 100, step: 1, optional: true, info: 'Number of people in this group you plan to thank.' },
    { id: 'otherA', label: 'Other people: amount each', type: 'number', prefix: '$', default: 0, min: 0, step: 5, optional: true, info: 'What you plan to give each person. You choose the amount.' },
    { id: 'weeks', label: 'Weeks left', type: 'number', default: 6, min: 1, max: 104, step: 1, optional: true, info: 'Weeks until you hand the tips out, to work out a weekly saving.' },
    { id: 'income', label: 'Monthly income', type: 'number', prefix: '$', default: 0, min: 0, step: 100, optional: true, help: 'Optional. Leave at 0 to skip.', info: 'Used only to show the tips as a share of one month of income.' },
  ],
  outputs: [
    { id: 'total', label: 'Total tips and gifts', format: 'currency', primary: true, info: 'Sum of people × amount each for every group.' },
    { id: 'people', label: 'People', format: 'number', info: 'Total number of people on the list.' },
    { id: 'weekly', label: 'Save each week', format: 'currency', info: 'Total ÷ weeks left.' },
    { id: 'share', label: 'Share of monthly income', format: 'percent', info: 'Total ÷ monthly income.' },
  ],
  compute: (v) => {
    const parts: { label: string; value: number }[] = [];
    let people = 0;
    for (const [k, label] of GROUPS) {
      const n = Math.floor(num(v[k + 'N']) ?? 0);
      const a = num(v[k + 'A']) ?? 0;
      if (n < 0 || a < 0) return { total: null };
      people += n;
      if (n * a > 0) parts.push({ label, value: n * a });
    }
    const total = parts.reduce((s, p) => s + p.value, 0);
    if (total <= 0) return { total: null, error: 'Enter at least one person and an amount to add up.' };
    const weeks = num(v.weeks);
    const income = num(v.income) ?? 0;
    const weekly = weeks !== null && weeks >= 1 ? total / weeks : null;
    const share = income > 0 ? total / income : null;
    return {
      total,
      people,
      weekly,
      share,
      tone: 'ok',
      badge: `${money(total, 0)} for ${people} ${people === 1 ? 'person' : 'people'}`,
      chart: [moneyDonut('Who the money goes to', parts, money(total, 0), 'total')],
      steps: [
        `Total = ${parts.map((p) => money(p.value, 0)).join(' + ')} = ${money(total, 0)}`,
        ...(weekly !== null ? [`Weekly saving = ${money(total, 0)} ÷ ${weeks} = ${money(weekly)}`] : []),
        ...(share !== null ? [`Share of income = ${money(total, 0)} ÷ ${money(income, 0)} = ${(share * 100).toFixed(1)}%`] : []),
      ],
      note: `Your list comes to ${money(total, 0)} for ${people} ${people === 1 ? 'person' : 'people'}.${weekly !== null ? ` Setting aside ${money(weekly)} a week for ${weeks} week${weeks === 1 ? '' : 's'} covers it.` : ''}`,
    };
  },
  content: {
    formula: [
      'Group cost = number of people × amount each',
      'Total = sum of all group costs',
      'Weekly saving = total ÷ weeks left',
      'Share of income = total ÷ monthly income',
    ],
    body: [
      'Holiday tips and thank-you gifts are easy to forget in a budget, then arrive all at once in December. Listing each group with a head count and an amount shows the real total early.',
      'This calculator does not tell you what is customary. Amounts vary by place, how often someone helps and your own budget, so you choose every number.',
      'The weekly saving spreads the total over the weeks you have left, and the optional income field shows how big the list is next to one month of pay.',
    ],
    faq: [
      { q: 'How is the total calculated?', a: 'Each group is people times amount each, and the total is the sum. A cleaner at $100, a babysitter at $50, 3 teachers at $25 and a stylist at $60 gives $285.' },
      { q: 'How much should I save each week?', a: 'Divide the total by the weeks left. $285 over 6 weeks is $47.50 a week.' },
      { q: 'Does it say how much to tip?', a: 'No. You enter every amount. Customs differ, so check what suits your situation.' },
      { q: 'What does the income share show?', a: 'The total divided by one month of income. $285 on $3,000 a month is 9.5%.' },
    ],
    sources: [
      { label: 'CFPB: Budgeting and saving tools', url: 'https://www.consumerfinance.gov/consumer-tools/' },
    ],
  },
  related: ['gift-budget', 'tip', 'holiday-spending-total', 'savings-goal', 'sinking-fund'],
  examples: [
    {
      // 1×100 + 1×50 + 3×25 + 1×60 = 285; people 6; 285 ÷ 6 weeks = 47.5; 285 ÷ 3,000 = 0.095.
      values: { cleanN: 1, cleanA: 100, careN: 1, careA: 50, teachN: 3, teachA: 25, styleN: 1, styleA: 60, otherN: 0, otherA: 0, weeks: 6, income: 3000 },
      expect: { total: 285, people: 6, weekly: 47.5, share: 0.095 },
    },
    {
      // 2×40 + 4×10 = 120; people 6; 120 ÷ 4 = 30; no income.
      values: { cleanN: 0, cleanA: 0, careN: 0, careA: 0, teachN: 4, teachA: 10, styleN: 0, styleA: 0, otherN: 2, otherA: 40, weeks: 4, income: 0 },
      expect: { total: 120, people: 6, weekly: 30 },
    },
  ],
});
