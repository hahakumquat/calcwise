import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const n1 = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const m2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'school-break-childcare',
  title: 'School Break Childcare Cost Calculator',
  category: 'everyday',
  description: 'Work out what winter, spring or summer break costs in childcare. Enter the weeks off, days you need cover and your daily rate to see the total.',
  keywords: ['school break childcare cost', 'winter break childcare calculator', 'holiday childcare cost', 'summer camp cost calculator', 'cost of school holidays for working parents', 'childcare per day calculator'],
  inputs: [
    { id: 'weeks', label: 'Weeks of break', type: 'number', default: 2, min: 0.5, max: 20, step: 0.5, info: 'How many weeks school is out.' },
    { id: 'days', label: 'Days per week you need cover', type: 'number', default: 5, min: 1, max: 7, step: 1, info: 'The weekdays you work and cannot be home.' },
    { id: 'rate', label: 'Cost per child per day', type: 'number', prefix: '$', default: 80, min: 0, step: 5, info: 'The daily rate for a camp, sitter or childcare centre. Enter your own quote.' },
    { id: 'children', label: 'Children needing care', type: 'number', default: 1, min: 1, max: 10, step: 1, info: 'The rate is multiplied by this number.' },
    { id: 'free', label: 'Days covered for free', type: 'number', default: 2, min: 0, step: 1, info: 'Days a relative, a partner or your own leave covers.' },
  ],
  outputs: [
    { id: 'total', label: 'Total childcare cost', format: 'currency', primary: true, info: 'Paid days × daily rate × children.' },
    { id: 'paidDays', label: 'Paid days', format: 'number', precision: 1, info: 'Weeks × days per week, minus free days.' },
    { id: 'perWeek', label: 'Average per week', format: 'currency', info: 'Total ÷ weeks of break.' },
  ],
  compute: (v) => {
    const weeks = num(v.weeks), days = num(v.days), rate = num(v.rate);
    const children = num(v.children) ?? 1, free = num(v.free) ?? 0;
    if (weeks === null || days === null || rate === null) return { total: null, note: 'Enter the weeks, days and daily rate.' };
    if (weeks <= 0 || days <= 0 || rate < 0 || children < 1 || free < 0) return { total: null, error: 'Use weeks and days above 0, and a rate of 0 or more.' };
    const needed = weeks * days;
    const paidDays = Math.max(0, needed - free);
    const total = paidDays * rate * children;
    const perWeek = total / weeks;
    return {
      total,
      paidDays,
      perWeek,
      tone: 'ok',
      badge: `${n1(paidDays)} paid days`,
      chart: {
        type: 'bar',
        title: 'Days you need cover for',
        categories: ['Paid', 'Free'],
        series: [{ name: 'Days', values: [paidDays, needed - paidDays] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Days needing cover = ${n1(weeks)} weeks × ${n1(days)} days = ${n1(needed)}`,
        `Paid days = ${n1(needed)} − ${n1(free)} free = ${n1(paidDays)}`,
        `Total = ${n1(paidDays)} × $${m2(rate)} × ${n1(children)} child${children === 1 ? '' : 'ren'} = $${m2(total)}`,
      ],
    };
  },
  content: {
    formula: ['Days needing cover = weeks of break × days per week', 'Paid days = days needing cover − free days (not below 0)', 'Total = paid days × daily rate × children'],
    body: [
      'School breaks are long and work usually is not. For many families the real cost of winter break is the childcare bill, not the gifts. This calculator turns a few numbers into a total so you can plan the weeks before they arrive.',
      'Enter the weeks school is out, how many days a week you need cover, and the daily rate from a camp, sitter or centre. Free days are the days a grandparent, a partner or your own time off will cover. Those come off the bill.',
      'If the total is more than you expected, try mixing options: a few paid camp days, a few swapped days with another family. Rerun the numbers with fewer paid days to see the difference.',
    ],
    faq: [
      { q: 'How much is two weeks of childcare at $80 a day?', a: 'Two weeks at 5 days is 10 days. With 2 free days, 8 paid days at $80 comes to $640, or $320 a week.' },
      { q: 'How do I include more than one child?', a: 'Set the number of children. The daily rate is multiplied by it, so two children at $60 a day for 5 paid days costs $600.' },
      { q: 'What if I have more free days than I need?', a: 'The paid days stop at zero, so the total is $0 and nothing is subtracted below that.' },
      { q: 'Does this include sibling discounts or fees?', a: 'No. Enter an average daily rate per child that already reflects any discount, registration fee or meals.' },
    ],
    sources: [
      { label: 'ChildCare.gov: Help paying for child care', url: 'https://childcare.gov/' },
    ],
  },
  related: ['daily-spending-allowance', 'gift-budget', 'budget-50-30-20', 'no-spend-challenge'],
  examples: [
    { values: { weeks: 2, days: 5, rate: 80, children: 1, free: 2 }, expect: { total: 640, paidDays: 8, perWeek: 320 } },
    { values: { weeks: 1, days: 5, rate: 60, children: 2, free: 0 }, expect: { total: 600, paidDays: 5, perWeek: 600 } },
    { values: { weeks: 2, days: 5, rate: 80, children: 1, free: 12 }, expect: { total: 0, paidDays: 0, perWeek: 0 } },
  ],
});
